import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight } from './Icons';
import type { TrainerMeta } from '@/types';
import { cn } from '@/lib/utils';

interface TrainerCardProps {
  trainer: TrainerMeta;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  punctuation: 'Пунктуация',
  orthography: 'Орфография',
  other: 'Другое',
};

export function TrainerCard({ trainer, className }: TrainerCardProps) {
  return (
    <Link
      to={`/trainer/${trainer.slug}`}
      className={cn(
        'block w-full rounded-2xl border border-slate-200 dark:border-slate-600/80',
        'bg-white dark:bg-slate-800/80 p-5 sm:p-6 text-left shadow-sm',
        'hover:border-slate-300 dark:hover:border-slate-500 hover:shadow',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        'transition-all touch-manipulation',
        'prefetch',
        className
      )}
      prefetch="intent"
    >
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {categoryLabels[trainer.category] ?? trainer.category}
        </span>
        <h2 className="font-semibold text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-tight">
          {trainer.name}
        </h2>
        {trainer.description && (
          <p
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-2"
            style={{ lineHeight: 1.6 }}
          >
            {trainer.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-slate-500 dark:text-slate-500">
            Заданий: {trainer.count}
          </span>
          <span className="inline-flex items-center gap-1 min-h-[44px] px-4 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Открыть
            <IconArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
