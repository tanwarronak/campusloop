import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { getListing } from '../api/listings.api';
import { createConversation } from '../api/conversations.api';
import { useAuth } from '../context/AuthContext';

export const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const { data: listing, isLoading, isError } = useQuery({ queryKey: ['listing', id], queryFn: () => getListing(id) });
  const conversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (conversation) => navigate(`/messages/${conversation._id}`),
    onError: (error) => {
      if (error?.message === 'Authentication required.') login();
    }
  });

  if (isLoading) return <p className="py-20 text-center text-sm text-slate-500">Loading listing...</p>;
  if (isError) return <p className="py-20 text-center text-sm text-red-700">This listing could not be found.</p>;

  return (
    <section className="py-8">
      <Link to="/listings" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to listings</Link>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} className="aspect-[4/3] h-full w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center text-slate-400">No image uploaded yet</div>}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4"><span className="rounded-full bg-campus-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-campus-700">{listing.status}</span><span className="text-2xl font-extrabold text-brand-700">₹{listing.price.toLocaleString('en-IN')}</span></div>
          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">{listing.title}</h1>
          <p className="mt-4 leading-7 text-slate-600">{listing.description}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">{listing.condition.replace('_', ' ')}</span><span className="rounded-full bg-slate-100 px-3 py-1">{listing.category.replace('_', ' ')}</span><span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><MapPin className="h-3.5 w-3.5" />{listing.location}</span></div>
          <div className="mt-8 border-t border-slate-100 pt-5"><p className="text-sm font-bold text-slate-900">{listing.sellerId?.name || 'Campus seller'} {listing.sellerId?.verified && <ShieldCheck className="inline h-4 w-4 text-campus-600" />}</p><p className="mt-1 text-xs text-slate-500">{listing.sellerId?.totalTransactions || 0} completed transactions</p></div>
          {listing.sellerId?._id !== user?._id && (
            <button
              type="button"
              disabled={conversationMutation.isPending}
              onClick={() => (isAuthenticated ? conversationMutation.mutate(listing._id) : login())}
              className="mt-7 block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {conversationMutation.isPending ? 'Opening chat...' : 'Chat with Seller'}
            </button>
          )}
          {conversationMutation.isError && conversationMutation.error?.message !== 'Authentication required.' && <p className="mt-3 text-center text-sm text-red-700">{conversationMutation.error?.message || 'Could not open this conversation.'}</p>}
        </div>
      </div>
    </section>
  );
};