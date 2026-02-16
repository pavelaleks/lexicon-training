import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center">
        <h1 className="font-semibold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-4">
          Страница не найдена
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-8">
          Возможно, тренажёр был удалён или адрес введён неверно.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          В каталог
        </Link>
      </main>
      <Footer />
    </div>
  );
}
