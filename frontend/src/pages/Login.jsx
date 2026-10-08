import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login, loading, isAuthenticated, user } = useAuth();

  return (
    <section className="max-w-md mx-auto py-20">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-campus-50 text-campus-700 flex items-center justify-center mb-5">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] font-bold text-brand-600 mb-3">Campus access</p>
        <h1 className="text-3xl font-bold text-slate-900">Sign in to CampusLoop</h1>
        <p className="text-sm text-slate-600 leading-relaxed mt-3 mb-7">
          Use your college Google account to verify your campus identity before buying or selling.
        </p>
        {isAuthenticated ? (
          <p className="text-sm text-campus-700 font-medium">Signed in as {user.name}</p>
        ) : (
          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold py-3 transition-colors"
          >
            Continue with Google
          </button>
        )}
        <p className="text-xs text-slate-400 mt-5">Any valid email domain can register.</p>
      </div>
    </section>
  );
};