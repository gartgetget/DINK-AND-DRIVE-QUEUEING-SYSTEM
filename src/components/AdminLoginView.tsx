import React, { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';

interface AdminLoginViewProps {
  onLogin: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
      setError(null);
      onLogin();
      return;
    }

    setError('Invalid administrator username or password.');
  };

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4 text-slate-800">
      <section className="w-full max-w-md bg-white border-4 border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-lime-400 border-2 border-lime-500 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <p className="text-xs font-black text-lime-700 uppercase tracking-widest">Dink&Drive</p>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admin Login</h1>
            <p className="text-xs font-bold text-slate-500 mt-1">Sign in to manage courts, rentals, members, and reports.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-100 border-2 border-red-300 text-red-800 text-xs font-bold" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="block mb-1 text-xs font-black text-slate-800 uppercase tracking-tight">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block mb-1 text-xs font-black text-slate-800 uppercase tracking-tight">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <LogIn className="w-4 h-4 text-lime-400" />
            Sign In to Admin Console
          </button>
        </form>
      </section>
    </main>
  );
};
