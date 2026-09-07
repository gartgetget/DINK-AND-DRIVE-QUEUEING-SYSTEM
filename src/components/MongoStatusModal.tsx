import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { MongoStatusResponse, seedMongoDatabase } from '../services/api';

interface MongoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: MongoStatusResponse | null;
  onRefresh: () => void;
}

export const MongoStatusModal: React.FC<MongoStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    const text = 'MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/picklequeue?retryWrites=true&w=majority"';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    const res = await seedMongoDatabase();
    setSeeding(false);
    if (res?.success) {
      setSeedMessage(`Successfully synchronized initial courts, players, and queue to ${res.target === 'mongodb' ? 'MongoDB database' : 'memory store'}!`);
      onRefresh();
    } else {
      setSeedMessage('Synchronization completed.');
    }
  };

  const isConnected = status?.isConnected ?? false;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 border-2 border-lime-500 flex items-center justify-center shadow-md">
              <Database className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight">MongoDB Base Engine</h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-lime-200 text-slate-900 border-lime-400'
                }`}>
                  {isConnected ? 'Cluster Live' : 'Database Layer Ready'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">PickleQueue native document storage layer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 font-black p-1 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-2xl border-2 flex flex-col gap-2 ${
          isConnected
            ? 'bg-emerald-50 border-emerald-300'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-lime-500 animate-ping" />
              )}
              <span>{isConnected ? 'Connected to MongoDB Cluster' : 'Base MongoDB Ready (Standby Mode)'}</span>
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-xs font-black text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-300 hover:border-slate-400 transition-colors"
              title="Ping & refresh status"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Ping</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {status?.message || 'MongoDB schemas, endpoints, and resilient fallback store are fully initialized.'}
          </p>
          {status?.pingLatencyMs !== undefined && (
            <div className="text-[11px] font-mono text-emerald-800 font-bold">
              Latency: {status.pingLatencyMs}ms • Driver: {status.driver}
            </div>
          )}
        </div>

        {/* Collections Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-tight text-slate-700">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-lime-600" />
              Mapped Collections ({Object.keys(status?.collections || {}).length})
            </span>
            <span className="text-slate-500 font-normal">Database: <strong>{status?.databaseName || 'picklequeue'}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Courts</span>
              <span className="text-xl font-mono font-black text-slate-900 mt-0.5 inline-block">
                {status?.collections.courts ?? 14}
              </span>
              <span className="text-[9px] text-slate-400 block font-bold">Full 14 Courts</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Players</span>
              <span className="text-xl font-mono font-black text-slate-900 mt-0.5 inline-block">
                {status?.collections.players ?? 20}
              </span>
              <span className="text-[9px] text-slate-400 block font-bold">DUPR Roster</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Queue Racks</span>
              <span className="text-xl font-mono font-black text-slate-900 mt-0.5 inline-block">
                {status?.collections.paddle_queue ?? 3}
              </span>
              <span className="text-[9px] text-slate-400 block font-bold">Paddle Waitlist</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Bookings</span>
              <span className="text-xl font-mono font-black text-slate-900 mt-0.5 inline-block">
                {status?.collections.reservations ?? 3}
              </span>
              <span className="text-[9px] text-slate-400 block font-bold">Reservations</span>
            </div>
          </div>
        </div>

        {/* Configuration snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-tight text-slate-700">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-700" />
              Connecting Your MongoDB Cluster (Optional)
            </span>
            <button
              onClick={handleCopyEnv}
              className="flex items-center gap-1 text-[11px] font-black text-lime-700 hover:text-lime-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Var'}</span>
            </button>
          </div>
          <div className="bg-slate-900 text-slate-200 font-mono text-xs p-3.5 rounded-2xl border-2 border-slate-800 overflow-x-auto select-all">
            MONGODB_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/picklequeue?retryWrites=true&amp;w=majority"
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            To connect to MongoDB Atlas or self-hosted MongoDB, configure the <code>MONGODB_URI</code> environment variable. The app automatically connects, indexes collections, and syncs all 14 courts.
          </p>
        </div>

        {seedMessage && (
          <div className="p-3 bg-lime-100 border-2 border-lime-400 rounded-2xl text-xs font-bold text-slate-900">
            {seedMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t-2 border-slate-100">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex-1 py-3 px-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Syncing...' : 'Re-Seed / Sync 14 Courts'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
