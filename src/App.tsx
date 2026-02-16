import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Trainer } from '@/pages/Trainer';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trainer/:slug" element={<Trainer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
