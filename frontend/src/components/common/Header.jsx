import React from 'react';
import { ShoppingBag, ShieldCheck, PlusCircle, MessageSquare, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Campus Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-campus-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Campus<span className="text-brand-600">Loop</span>
                </span>
              </div>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-campus-50 border border-campus-200 text-campus-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-campus-600" />
              <span>Campus Verified</span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/listings"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
            >
              Browse
            </Link>
            <Link
              to="/messages"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Link
              to="/create-listing"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4 text-campus-400" />
              <span>Sell Item</span>
            </Link>
            {!loading && isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  title="Open profile"
                >
                  <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
                </Link>
                <button type="button" onClick={() => logout()} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
