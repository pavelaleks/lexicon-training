import React from 'react';

interface GenericRendererProps {
  name: string;
  sourceHtmlPath?: string;
}

export function GenericRenderer({ name, sourceHtmlPath }: GenericRendererProps) {
  const url = sourceHtmlPath || '#';

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-600/80 overflow-hidden bg-white dark:bg-slate-800/80 shadow-sm">
      <p className="p-5 text-base text-slate-600 dark:text-slate-400">
        Тренажёр «{name}» можно открыть в отдельной вкладке.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 mx-5 mb-5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Открыть исходный тренажёр
      </a>
    </div>
  );
}
