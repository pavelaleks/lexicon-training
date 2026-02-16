import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Trainer } from '@/pages/Trainer';
import { NotFound } from '@/pages/NotFound';

const BASE = import.meta.env.BASE_URL || '/';

export function App() {
  return (
    <BrowserRouter basename={BASE === '/' ? '/' : BASE.replace(/\/$/, '')}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trainer/:slug" element={<Trainer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
