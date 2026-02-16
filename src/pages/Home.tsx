import React, { useEffect, useState, useMemo } from 'react';
import { loadIndex } from '@/lib/loadIndex';
import type { IndexData } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrainerCard } from '@/components/TrainerCard';
import { SearchBar } from '@/components/SearchBar';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';

type Filter = 'all' | 'punctuation' | 'orthography';

export function Home() {
  const [data, setData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    loadIndex()
      .then(setData)
      .catch(() => setData({ trainers: [] }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const list = data?.trainers ?? [];
    const q = search.trim().toLowerCase();
    const bySearch = q
      ? list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
        )
      : list;
    if (filter === 'all') return bySearch;
    return bySearch.filter((t) => t.category === filter);
  }, [data?.trainers, search, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <h1 className="font-semibold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-1">
            Студия «Лексикон»
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Тренажёры по русскому языку: пунктуация и орфография.
          </p>
        </section>

        <SearchBar value={search} onChange={setSearch} className="mb-5" />

        <div
          className="flex flex-wrap gap-2 mb-6"
          role="tablist"
          aria-label="Фильтр по типу"
        >
          {(['all', 'punctuation', 'orthography'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={`
                min-h-[44px] px-4 py-2 rounded-xl font-medium text-sm transition-colors touch-manipulation
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                ${
                  filter === f
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                }
              `}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Все' : f === 'punctuation' ? 'Пунктуация' : 'Орфография'}
            </button>
          ))}
        </div>

        {loading ? (
          <CatalogSkeleton />
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">
            Нет тренажёров по вашему запросу.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 list-none p-0 m-0">
            {filtered.map((trainer) => (
              <li key={trainer.slug}>
                <TrainerCard trainer={trainer} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
