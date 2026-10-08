import React from 'react';
import { ShoppingBag, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-campus-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>

              <span className="text-lg font-bold tracking-tight text-slate-900">
                Campus<span className="text-brand-600">Loop</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-sm mb-4 leading-relaxed">
              Your campus marketplace, without the WhatsApp chaos. Buy, sell,
              and negotiate securely with verified college peers.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-campus-600" />
              <span>Campus Domain Gated Platform</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Marketplace
            </h4>

            <ul className="space-y-2 text-sm text-slate-600">
              <li>Textbooks & Notes</li>
              <li>Calculators & Gadgets</li>
              <li>Cycles & Mobility</li>
              <li>Hostel & Dorm Essentials</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Product Principles
            </h4>

            <ul className="space-y-2 text-sm text-slate-600">
              <li>Verified Students Only</li>
              <li>In-Chat Counter Offers</li>
              <li>Zero Platform Commission</li>
              <li>Campus Physical Handover</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>
              © {new Date().getFullYear()} CampusLoop. All rights reserved.
            </p>

            <span className="hidden sm:block text-slate-300">•</span>
          </div>

          <p className="text-center">
            Built for university communities.
          </p>
        </div>
      </div>
    </footer>
  );
};


