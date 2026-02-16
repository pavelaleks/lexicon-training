import React from 'react';
import { cn } from '@/lib/utils';

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/50 py-5 sm:py-6',
        'pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © Студия «Лексикон», Горно-Алтайск. Разработчик: П. В. Алексеев. {year}
      </div>
    </footer>
  );
}
