import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const conditionLabels = {
  NEW: 'New',
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair'
};

export const ListingCard = ({ listing }) => {
  const seller = listing.sellerId;
  const image = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <ImageIcon className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 font-bold text-slate-900">{listing.title}</h2>
          <span className="shrink-0 text-lg font-extrabold text-brand-700">₹{listing.price.toLocaleString('en-IN')}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{conditionLabels[listing.condition]}</span>
          <span className="flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5" />{listing.location}</span>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="truncate">{seller?.name || 'Campus seller'}</span>
          {seller?.verified && <ShieldCheck className="h-3.5 w-3.5 text-campus-600" />}
        </div>
      </div>
    </Link>
  );
};