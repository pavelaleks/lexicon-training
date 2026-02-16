import React from 'react';
import { IconSearch } from './Icons';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Поиск по названию или тегам...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <IconSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl',
          'border border-slate-200 dark:border-slate-600',
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'placeholder-slate-400 dark:placeholder-slate-500',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400',
          'text-base transition-colors'
        )}
        aria-label="Поиск"
      />
    </div>
  );
}
