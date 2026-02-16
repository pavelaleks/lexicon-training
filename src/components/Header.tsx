import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconBookOpen } from './Icons';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL || '/';

export function Header({
  title,
  showBack,
  className,
}: {
  title?: string;
  showBack?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700/80',
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur',
        'safe-area-inset-top',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 min-h-[52px] px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 touch-manipulation"
              aria-label="Назад"
            >
              <IconChevronLeft className="w-6 h-6" />
            </button>
          )}
          <Link
            to={BASE === '/' ? '/' : BASE}
            className={cn(
              'font-semibold text-slate-800 dark:text-slate-100 truncate min-h-[44px] flex items-center',
              title ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
            )}
          >
            {title ?? (
              <>
                <span className="hidden sm:inline">Студия «Лексикон»</span>
                <span className="sm:hidden">Лексикон</span>
              </>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to={BASE === '/' ? '/' : BASE}
            className="hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Каталог"
          >
            <IconBookOpen className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {!title && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-1 pb-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Горно-Алтайск</p>
        </div>
      )}
    </header>
  );
}
