import React from 'react';

export function CatalogSkeleton() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 list-none p-0 m-0">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <li key={i} className="rounded-2xl border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-800/80 p-5 sm:p-6 shadow-sm animate-pulse">
          <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-600 mb-3" />
          <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-600 mb-2" />
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-700 mb-1" />
          <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-700 mb-4" />
          <div className="flex justify-between items-center">
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-600" />
            <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-600" />
          </div>
        </li>
      ))}
    </ul>
  );
}
