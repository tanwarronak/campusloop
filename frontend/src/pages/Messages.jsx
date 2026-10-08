import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { getConversations } from '../api/conversations.api';
import { useAuth } from '../context/AuthContext';

const relativeTime = (date) => {
  if (!date) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return new Date(date).toLocaleDateString();
};

export const Messages = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useQuery({ queryKey: ['conversations'], queryFn: getConversations, retry: false });
  const conversations = (data || []).filter((conversation) => {
    const isBuyer = conversation.buyerId?._id === user?._id;
    const person = isBuyer ? conversation.sellerId : conversation.buyerId;
    const haystack = `${conversation.listingId?.title || ''} ${person?.name || ''} ${conversation.lastMessagePreview || conversation.lastMessage || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <section className="mx-auto max-w-3xl py-8">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Marketplace inbox</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Keep the deal moving.</h1></div><span className="hidden text-xs text-slate-400 sm:block">Listing conversations only</span></div>
      <label className="mt-6 flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-brand-400"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations or listings" aria-label="Search conversations" className="w-full bg-transparent text-sm outline-none" /></label>
      {isLoading && <p className="py-16 text-center text-sm text-slate-500">Loading conversations...</p>}
      {isError && <p className="mt-8 rounded-2xl bg-slate-100 p-5 text-center text-sm text-slate-600">Sign in to see your conversations.</p>}
      {!isLoading && !isError && conversations.length === 0 && <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-12 text-center"><MessageSquare className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm text-slate-500">{search ? 'No conversations match your search.' : 'Your listing chats will appear here.'}</p></div>}
      <div className="mt-6 space-y-3">{conversations.map((conversation) => {
        const isBuyer = conversation.buyerId?._id === user?._id;
        const otherPerson = isBuyer ? conversation.sellerId : conversation.buyerId;
        const unreadCount = isBuyer ? conversation.buyerUnreadCount : conversation.sellerUnreadCount;
        return <Link key={conversation._id} to={`/messages/${conversation._id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{conversation.listingId?.images?.[0] && <img src={conversation.listingId.images[0]} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate font-bold text-slate-900">{conversation.listingId?.title || 'Listing conversation'}</p><span className="shrink-0 text-xs text-slate-400">{relativeTime(conversation.lastMessageAt)}</span></div><p className="mt-1 truncate text-xs font-medium text-slate-500">{otherPerson?.name || 'Marketplace participant'} {otherPerson?.verified && <ShieldCheck className="inline h-3.5 w-3.5 text-campus-600" />}</p><p className="mt-1 truncate text-sm text-slate-500">{conversation.lastMessagePreview || conversation.lastMessage || 'No messages yet'}</p></div>{unreadCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-2 text-xs font-bold text-white">{unreadCount}</span>}</Link>;
      })}</div>
    </section>
  );
};