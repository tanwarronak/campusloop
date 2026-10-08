import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getListings } from '../api/listings.api';
import { ListingCard } from '../components/listing/ListingCard';

const categories = ['', 'BOOKS', 'ELECTRONICS', 'CALCULATORS', 'CYCLES', 'HOSTEL', 'FURNITURE', 'SPORTS', 'ACADEMIC', 'FASHION', 'OTHER'];
const conditions = ['', 'NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

export const Listings = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', category: '', condition: '', page: 1, limit: 12 });
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => getListings(filters),
    keepPreviousData: true
  });

  useEffect(() => {
    if (error?.message === 'Authentication required.') {
      navigate('/login', { replace: true, state: { from: '/listings' } });
    }
  }, [error, navigate]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  return (
    <section className="space-y-8 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">The campus marketplace</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Find something useful nearby.</h1>
        </div>
        <span className="flex items-center gap-2 text-sm text-slate-500"><SlidersHorizontal className="h-4 w-4" /> Filter the feed</span>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_160px]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search books, calculators, cycles..." className="w-full bg-transparent py-3 text-slate-900 outline-none" />
        </label>
        <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none">
          <option value="">All categories</option>
          {categories.filter(Boolean).map((category) => <option key={category} value={category}>{category.replace('_', ' ')}</option>)}
        </select>
        <select value={filters.condition} onChange={(event) => updateFilter('condition', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none">
          <option value="">Any condition</option>
          {conditions.filter(Boolean).map((condition) => <option key={condition} value={condition}>{condition.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-slate-500">Loading campus listings...</p>}
      {isError && error?.message !== 'Authentication required.' && <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">Listings could not be loaded right now.</p>}
      {!isLoading && !isError && data?.items?.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No active listings match those filters.</p>}
      {!isLoading && !isError && data?.items?.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.items.map((listing) => <ListingCard key={listing._id} listing={listing} />)}</div>
          {data.pagination.pages > 1 && <div className="flex justify-center gap-3"><button type="button" disabled={filters.page === 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Previous</button><span className="px-3 py-2 text-sm text-slate-500">Page {filters.page} of {data.pagination.pages}</span><button type="button" disabled={filters.page >= data.pagination.pages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Next</button></div>}
        </>
      )}
    </section>
  );
};