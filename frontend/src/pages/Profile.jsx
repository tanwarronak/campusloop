import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentProfile } from '../api/users.api';

export const Profile = () => {
  const { data: profile, isLoading, isError } = useQuery({ queryKey: ['profile'], queryFn: getCurrentProfile, retry: false });
  if (isLoading) return <p className="py-20 text-center text-sm text-slate-500">Loading profile...</p>;
  if (isError) return <div className="mx-auto max-w-md py-20 text-center"><p className="text-sm text-slate-600">Sign in to view your profile.</p><Link to="/login" className="mt-5 inline-flex items-center gap-2 font-bold text-brand-700">Sign in <ArrowRight className="h-4 w-4" /></Link></div>;

  return <section className="mx-auto max-w-2xl py-10"><div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><div><h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1><p className="mt-1 truncate text-sm text-slate-500">{profile.email}</p><p className="mt-1 text-sm text-slate-500">{profile.college || 'CampusLoop member'}</p><span className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${profile.verified ? 'text-campus-700' : 'text-slate-500'}`}><ShieldCheck className="h-4 w-4" /> {profile.verified ? 'Verified email' : 'Email not verified'}</span></div><div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">Member since {new Date(profile.createdAt).toLocaleDateString()}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl font-extrabold text-slate-900">{profile.totalTransactions}</p><p className="text-xs text-slate-500">Completed deals</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="flex items-center gap-1 text-2xl font-extrabold text-slate-900">{profile.rating || 'New'} {profile.rating > 0 && <Star className="h-5 w-5 fill-amber-400 text-amber-400" />}</p><p className="text-xs text-slate-500">Seller rating</p></div></div></div></section>;
};