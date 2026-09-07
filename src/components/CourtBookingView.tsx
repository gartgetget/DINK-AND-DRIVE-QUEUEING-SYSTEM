import React, { useState } from 'react';
import { Court, CourtReservation, Player } from '../types';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  X, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Users,
  DollarSign,
  FileDown,
  FileSpreadsheet
} from 'lucide-react';
import { playCourtCalledChime, playPaddlePop } from '../utils/audio';

interface CourtBookingViewProps {
  courts: Court[];
  reservations: CourtReservation[];
  allPlayers: Player[];
  activePlayer: Player;
  onAddReservation: (res: Omit<CourtReservation, 'id'>) => void;
  onCancelReservation: (resId: string) => void;
  soundEnabled: boolean;
}

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00', '00:00',
  '01:00', '02:00', '03:00'
];

const COURT_RATE_PER_HOUR = 500;

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isReservationActiveAt = (reservation: CourtReservation, time: string) => {
  const slotMinutes = getMinutes(time);
  const startMinutes = getMinutes(reservation.startTime);
  const endMinutes = getMinutes(reservation.endTime);

  if (endMinutes > startMinutes) {
    return startMinutes <= slotMinutes && endMinutes > slotMinutes;
  }

  return slotMinutes >= startMinutes || slotMinutes < endMinutes;
};

const formatTime12Hour = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

const getReservationFee = (reservation: CourtReservation) => {
  const [startHours, startMinutes] = reservation.startTime.split(':').map(Number);
  const [endHours, endMinutes] = reservation.endTime.split(':').map(Number);
  let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (durationMinutes <= 0) durationMinutes += 24 * 60;
  return (durationMinutes / 60) * COURT_RATE_PER_HOUR;
};

const getCourtLabel = (reservation: CourtReservation, courts: Court[]) => {
  const court = courts.find(item => item.id === reservation.courtId);
  if (court) return `COURT ${court.courtNumber}`;

  const savedName = reservation.courtName?.trim();
  if (!savedName) return 'COURT UNKNOWN';
  return savedName.toUpperCase().startsWith('COURT ') ? savedName.toUpperCase() : savedName;
};

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

const getReportDates = (anchorDate: string, period: ReportPeriod) => {
  const start = new Date(`${anchorDate}T00:00:00`);
  const end = new Date(start);

  if (period === 'daily') {
    end.setDate(end.getDate() + 1);
  } else if (period === 'weekly') {
    end.setDate(end.getDate() + 7);
  } else {
    end.setMonth(end.getMonth() + 1, 1);
  }

  return { start, end };
};

const getReportLabel = (period: ReportPeriod) => period[0].toUpperCase() + period.slice(1);

export const CourtBookingView: React.FC<CourtBookingViewProps> = ({
  courts,
  reservations,
  allPlayers,
  activePlayer,
  onAddReservation,
  onCancelReservation,
  soundEnabled,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily');

  // Form State
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || 'court-1');
  const [slotTime, setSlotTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [matchType, setMatchType] = useState<'doubles' | 'singles' | 'coaching'>('doubles');
  const [notes, setNotes] = useState<string>('');
  const [invitedPlayerIds, setInvitedPlayerIds] = useState<string[]>([activePlayer.id]);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Quick Book Slot Click
  const handleSlotClick = (courtId: string, time: string) => {
    setSelectedCourtId(courtId);
    setSlotTime(time);
    setShowBookingModal(true);
    setConflictError(null);
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();

    const requestedStart = getMinutes(slotTime);
    const requestedEnd = requestedStart + durationMinutes;

    // Reject any overlapping rental on the same court and date.
    const existing = reservations.find(r => 
      r.courtId === selectedCourtId && 
      r.date === selectedDate && 
      r.status !== 'cancelled' &&
      requestedStart < getMinutes(r.endTime) &&
      requestedEnd > getMinutes(r.startTime)
    );

    if (existing) {
      setConflictError(`This court is already reserved by ${existing.bookedBy.name} at ${formatTime12Hour(existing.startTime)}.`);
      return;
    }

    const courtObj = courts.find(c => c.id === selectedCourtId);
    const courtName = courtObj ? `COURT ${courtObj.courtNumber}` : 'COURT UNKNOWN';
    const participants = allPlayers.filter(p => invitedPlayerIds.includes(p.id));

    // Calculate end time
    const [h, m] = slotTime.split(':').map(Number);
    const endMinutesTotal = h * 60 + m + durationMinutes;
    const endH = Math.floor(endMinutesTotal / 60) % 24;
    const endM = endMinutesTotal % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const fee = (durationMinutes / 60) * COURT_RATE_PER_HOUR;

    onAddReservation({
      courtId: selectedCourtId,
      courtName,
      date: selectedDate,
      startTime: slotTime,
      endTime: endTimeStr,
      bookedBy: activePlayer,
      players: participants,
      matchType,
      fee,
      notes: notes || 'Standard Court Reservation',
      status: 'confirmed',
    });

    if (soundEnabled) playCourtCalledChime();
    setShowBookingModal(false);
    setConflictError(null);
    setNotes('');
  };

  // Generate selectable dates for next 5 days
  const dateOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const dailyReservations = reservations.filter(r => r.date === selectedDate && r.status !== 'cancelled');

  const reportReservations = reservations.filter(reservation => {
    if (reservation.status === 'cancelled') return false;
    const { start, end } = getReportDates(selectedDate, reportPeriod);
    const reservationDate = new Date(`${reservation.date}T00:00:00`);
    return reservationDate >= start && reservationDate < end;
  });

  const getReportRows = () => reportReservations.map(reservation => ({
    Date: reservation.date,
    'Start Time': formatTime12Hour(reservation.startTime),
    'End Time': formatTime12Hour(reservation.endTime),
    Court: getCourtLabel(reservation, courts),
    Price: getReservationFee(reservation),
    'Booked By': reservation.bookedBy.name,
  }));

  const downloadExcelReport = () => {
    const rows = getReportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 24 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Court Rentals');
    XLSX.writeFile(workbook, `court-rental-report-${reportPeriod}-${selectedDate}.xlsx`);
  };

  const downloadPdfReport = () => {
    const rows = getReportRows();
    const pdf = new jsPDF({ orientation: 'landscape' });
    const reportTitle = `${getReportLabel(reportPeriod)} Court Rental Report`;
    pdf.setFontSize(16);
    pdf.text(reportTitle, 14, 16);
    pdf.setFontSize(9);
    pdf.text(`Report anchor: ${selectedDate} | Rentals: ${rows.length}`, 14, 23);

    const columns = ['Date', 'Start Time', 'End Time', 'Court', 'Price', 'Booked By'];
    const columnX = [14, 42, 73, 104, 137, 163];
    let y = 34;
    pdf.setFont('helvetica', 'bold');
    columns.forEach((column, index) => pdf.text(column, columnX[index], y));
    pdf.line(14, y + 2, 282, y + 2);
    pdf.setFont('helvetica', 'normal');
    y += 9;

    if (rows.length === 0) {
      pdf.text('No rentals found for this report period.', 14, y);
    } else {
      rows.forEach(row => {
        if (y > 190) {
          pdf.addPage('landscape');
          y = 16;
        }
        [row.Date, row['Start Time'], row['End Time'], row.Court, `PHP ${row.Price.toLocaleString('en-PH')}`, row['Booked By']]
          .forEach((value, index) => pdf.text(String(value), columnX[index], y));
        y += 7;
      });
    }

    pdf.save(`court-rental-report-${reportPeriod}-${selectedDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase tracking-tight">Real-Time Court Reservations</h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Reserve indoor and championship courts in advance. Live conflict avoidance and automated confirmation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <select
              id="report-period-select"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
              className="flex-1 sm:flex-none px-3 py-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-800 font-black text-xs uppercase tracking-tight"
              aria-label="Report period"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
            <button
              id="download-pdf-report-btn"
              type="button"
              onClick={downloadPdfReport}
              title="Download PDF report"
              className="p-3 rounded-2xl bg-red-100 hover:bg-red-200 border-2 border-red-200 text-red-800 transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button
              id="download-excel-report-btn"
              type="button"
              onClick={downloadExcelReport}
              title="Download Excel report"
              className="p-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-200 text-emerald-800 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
          <button
            id="open-new-booking-btn"
            onClick={() => {
              setShowBookingModal(true);
              setConflictError(null);
            }}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lime-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Date Strip Picker */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {dateOptions.map((item) => {
          const isSelected = selectedDate === item.iso;
          return (
            <button
              key={item.iso}
              id={`date-select-${item.iso}`}
              onClick={() => setSelectedDate(item.iso)}
              className={`px-4 py-2.5 rounded-2xl text-center border-2 transition-all shrink-0 min-w-[100px] ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider">{item.dayName}</div>
              <div className="text-xs font-black">{item.formattedDate}</div>
            </button>
          );
        })}
      </div>

      {/* Timeline Schedule Grid */}
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-black text-slate-900 uppercase tracking-tight">
            <CalendarIcon className="w-4 h-4 text-slate-900" />
            <span>Schedule Grid: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border-2 border-dashed border-slate-300" />
              Open Slot (Click to Book)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-lime-300 border-2 border-lime-400" />
              Reserved Slot
            </span>
          </div>
        </div>

        {/* Matrix View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b-2 border-slate-200 text-slate-600 font-black uppercase text-[11px]">
                <th className="p-3.5 w-28 sticky left-0 bg-slate-50 z-10 border-r-2 border-slate-200">Time Slot</th>
                {courts.map(c => (
                  <th key={c.id} className="p-3.5 font-black text-slate-900 min-w-[140px]">
                    <div>COURT {c.courtNumber}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="hover:bg-slate-50 transition-colors">
                  {/* Time label column */}
                  <td className="p-3.5 font-mono font-black text-slate-900 sticky left-0 bg-slate-50 border-r-2 border-slate-200">
                    {formatTime12Hour(time)}
                  </td>

                  {/* Court cells */}
                  {courts.map((court) => {
                    const reservation = dailyReservations.find(
                      r => r.courtId === court.id && isReservationActiveAt(r, time)
                    );

                    const isBooked = !!reservation;
                    const isMyBooking = reservation?.bookedBy.id === activePlayer.id;

                    return (
                      <td key={court.id} className="p-2">
                        {isBooked ? (
                          <div className={`p-2.5 rounded-2xl border-2 text-xs flex flex-col gap-1 min-h-14 transition-all shadow-xs ${
                            isMyBooking
                              ? 'bg-lime-100 border-lime-400 text-slate-900'
                              : 'bg-amber-50 border-amber-300 text-slate-900'
                          }`}>
                            <div className="font-black truncate leading-tight" title={reservation.bookedBy.name}>
                              {reservation.bookedBy.name}
                              {isMyBooking && ' (You)'}
                            </div>
                            <div className="flex flex-col items-start text-[9px] font-bold text-slate-600 leading-tight">
                              <span className="uppercase tracking-tight">{reservation.matchType}</span>
                              <span className="font-mono whitespace-nowrap">{formatTime12Hour(reservation.startTime)} - {formatTime12Hour(reservation.endTime)}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            id={`slot-${court.id}-${time}`}
                            onClick={() => handleSlotClick(court.id, time)}
                            className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-400 hover:text-slate-900 text-xs font-black flex items-center justify-center transition-all group"
                          >
                            <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1 uppercase tracking-tight">
                              <Plus className="w-3.5 h-3.5" /> Book
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active User Bookings List */}
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Upcoming Confirmed Bookings</h3>
          <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{reservations.filter(r => r.status === 'confirmed').length} Active</span>
        </div>

        {reservations.filter(r => r.status === 'confirmed').length === 0 ? (
          <p className="text-xs font-bold text-slate-400 py-6 text-center">No active upcoming reservations recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations
              .filter(r => r.status === 'confirmed')
              .map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-200 space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900">
                        {getCourtLabel(res, courts)}
                      </span>
                      <span className="bg-lime-300 text-slate-900 border border-lime-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>{res.date}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-900 font-black">{formatTime12Hour(res.startTime)} - {formatTime12Hour(res.endTime)}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-bold pt-1">
                      Booked by: <strong className="text-slate-900 font-black">{res.bookedBy.name}</strong>
                    </div>
                    {res.notes && (
                      <div className="text-[11px] text-slate-500 italic">"{res.notes}"</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 text-xs font-bold">
                    <span className="text-slate-600">
                      Fee: <strong className="text-slate-900">₱{getReservationFee(res).toLocaleString('en-PH')}</strong>
                    </span>
                    <button
                      id={`cancel-res-${res.id}`}
                      onClick={() => onCancelReservation(res.id)}
                      className="text-red-600 hover:text-red-700 font-black text-xs uppercase tracking-tight"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900">
                <CalendarIcon className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-base uppercase tracking-tight">Book a Court</h3>
              </div>
              <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                {selectedDate}
              </span>
            </div>

            {conflictError && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-2xl text-xs font-bold text-red-800">
                {conflictError}
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              {/* Select Court */}
              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Select Court</label>
                <select
                  id="booking-court-select"
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>
                        COURT {c.courtNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Start Time</label>
                  <select
                    id="booking-time-select"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-lime-400"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{formatTime12Hour(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Duration</label>
                  <select
                    id="booking-duration-select"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                  >
                    {Array.from({ length: 8 }, (_, index) => {
                      const hours = index + 1;
                      return (
                        <option key={hours} value={hours * 60}>
                          {hours} {hours === 1 ? 'Hour' : 'Hours'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Match Format */}
              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Format / Activity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['doubles', 'singles', 'coaching'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setMatchType(fmt)}
                      className={`py-2.5 rounded-xl font-black uppercase tracking-wider text-[11px] border-2 transition-all ${
                        matchType === fmt
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Court Rental Pricing */}
              <div className="bg-lime-50 p-4 rounded-2xl border-2 border-lime-300 flex items-center justify-between">
                <div>
                  <span className="text-slate-900 font-black block">Court Rental Rate:</span>
                  <span className="text-slate-600 text-[11px] font-bold">
                    ₱{COURT_RATE_PER_HOUR.toLocaleString('en-PH')} per hour
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-slate-900 bg-lime-300 px-3 py-1 rounded-xl border border-lime-400">
                    ₱{((durationMinutes / 60) * COURT_RATE_PER_HOUR).toLocaleString('en-PH')}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Session Purpose or Ladder Notes (Optional)</label>
                <input
                  id="booking-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 4.0+ DUPR Doubles Ladder Prep"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  id="cancel-booking-modal-btn"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-tight transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-booking-modal-btn"
                  className="flex-1 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Reserve</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
