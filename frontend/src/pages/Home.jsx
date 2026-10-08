import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
  Laptop,
  Bike,
  Home as HomeIcon,
  Search,
  MessageSquare,
  Sparkles,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { BackendStatusCard } from '../components/common/BackendStatusCard';

const CATEGORIES = [
  { id: 'CALCULATORS', name: 'Calculators', icon: Zap, count: 'Casio & scientific' },
  { id: 'BOOKS', name: 'Textbooks & Notes', icon: BookOpen, count: 'Engineering & Med' },
  { id: 'CYCLES', name: 'Cycles & Mobility', icon: Bike, count: 'Campus rides' },
  { id: 'ELECTRONICS', name: 'Electronics', icon: Laptop, count: 'Laptops & gear' },
  { id: 'HOSTEL', name: 'Hostel Essentials', icon: HomeIcon, count: 'Lamps & storage' }
];

export const Home = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Hyperlocal Marketplace for Verified Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Buy and sell within your campus.{' '}
            <span className="bg-gradient-to-r from-brand-600 to-campus-600 bg-clip-text text-transparent block sm:inline">
              Without the WhatsApp chaos.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Books, cycles, calculators, electronics, hostel essentials and lab coats — with structured listings, listing-bound chat, and in-app price negotiation.
          </p>

          {/* Search Simulation */}
          <div className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 text-slate-400">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search calculator, cycle, engineering math, hostel lamp..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                readOnly
              />
            </div>
            <Link
              to="/listings"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-600/20 transition-all"
            >
              <span>Explore Items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/listings?category=${cat.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-600" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why CampusLoop beats WhatsApp groups
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            WhatsApp is where students talk. CampusLoop is where students transact cleanly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Campus-Verified Only</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every seller and buyer is validated via their institutional email domain. Trade safely with trusted peers from your own university.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">In-Chat Bargaining</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No awkward group texts. Make formal offers, counter with new numbers, and agree on prices directly within the conversation stream.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Instant Deal Finalization</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Accepting an offer automatically marks the listing as SOLD and notifies all interested buyers. No zombie listings cluttering feeds.
            </p>
          </div>
        </div>
      </section>

      {/* Transaction Demo Flow Blueprint */}
      <section className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Core Transaction Loop</span>
          <h2 className="text-2xl font-bold mt-1 text-white">The 2-Minute Campus Trade</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-brand-400 font-bold text-lg mb-1">01. List</div>
            <div className="text-xs text-slate-300">Photo & price posted in 60 seconds</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-brand-400 font-bold text-lg mb-1">02. Chat</div>
            <div className="text-xs text-slate-300">Listing-bound real-time chat</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-brand-400 font-bold text-lg mb-1">03. Offer</div>
            <div className="text-xs text-slate-300">₹600 offer → ₹700 counter</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-brand-400 font-bold text-lg mb-1">04. Sold</div>
            <div className="text-xs text-slate-300">Accepted & marked SOLD</div>
          </div>
        </div>
      </section>
    </div>
  );
};
