import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createListing, uploadListingImage } from '../api/listings.api';

const initialForm = { title: '', description: '', price: '', category: 'BOOKS', condition: 'GOOD', location: '', images: [] };

export const CreateListing = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const mutation = useMutation({ mutationFn: createListing, onSuccess: () => navigate('/listings') });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      setIsUploading(files.length > 0);
      const images = await Promise.all(files.map(uploadListingImage));
      mutation.mutate({ ...form, price: Number(form.price), images });
    } catch (error) {
      mutation.reset();
      window.alert(error.message || 'Could not upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl py-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Sell on CampusLoop</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Create a listing</h1><p className="mt-2 text-sm text-slate-600">Give another student the details they need to decide quickly.</p>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="block text-sm font-semibold text-slate-700">Title<input required minLength="3" maxLength="120" value={form.title} onChange={(event) => update('title', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" placeholder="Casio scientific calculator" /></label>
        <label className="block text-sm font-semibold text-slate-700">Description<textarea required minLength="10" maxLength="2000" value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" placeholder="Condition, included accessories, and anything a buyer should know." /></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Price (₹)<input required min="1" type="number" value={form.price} onChange={(event) => update('price', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" /></label><label className="block text-sm font-semibold text-slate-700">Location<input required value={form.location} onChange={(event) => update('location', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" placeholder="Hostel 4" /></label></div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Category<select value={form.category} onChange={(event) => update('category', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none">{['BOOKS', 'ELECTRONICS', 'CALCULATORS', 'CYCLES', 'HOSTEL', 'FURNITURE', 'SPORTS', 'ACADEMIC', 'FASHION', 'OTHER'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Condition<select value={form.condition} onChange={(event) => update('condition', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none">{['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map((value) => <option key={value}>{value.replace('_', ' ')}</option>)}</select></label></div>
        <label className="block text-sm font-semibold text-slate-700">Photos <span className="font-normal text-slate-500">(up to 6, 5 MB each)</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))} className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal" /></label>
        {mutation.isError && <p className="text-sm text-red-700">{mutation.error?.message || 'Could not create listing.'}</p>}
        <button disabled={mutation.isPending || isUploading} type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50">{isUploading ? 'Uploading photos...' : mutation.isPending ? 'Publishing...' : 'Publish listing'}</button>
      </form>
    </section>
  );
};