import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Listings } from '../pages/Listings';
import { ListingDetails } from '../pages/ListingDetails';
import { CreateListing } from '../pages/CreateListing';
import { Messages } from '../pages/Messages';
import { Chat } from '../pages/Chat';
import { Profile } from '../pages/Profile';

// Placeholder views for upcoming phases
const PlaceholderPage = ({ title, description }) => (
  <div className="max-w-2xl mx-auto text-center py-20 px-4">
    <div className="inline-block p-3 bg-brand-50 text-brand-600 rounded-2xl mb-4 font-bold text-xs uppercase tracking-wider">
      Coming in next phase
    </div>
    <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
    <p className="text-slate-600 text-sm max-w-md mx-auto">{description}</p>
  </div>
);

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<ListingDetails />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:conversationId" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
