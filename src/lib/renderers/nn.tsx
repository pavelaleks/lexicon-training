import React, { useState, useCallback } from 'react';
import { IconCheck, IconX } from '@/components/Icons';
import type { NNExercise } from '@/types';
import { cn } from '@/lib/utils';

interface NNRendererProps {
  exercise: NNExercise;
  chosen: 'н' | 'нн' | null;
  onChoose: (value: 'н' | 'нн') => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function NNRenderer({ exercise, chosen, onChoose, showResult, isCorrect }: NNRendererProps) {
  const phrase = exercise.phrase ?? '';
  const parts = phrase.split('___');

  return (
    <div className="w-full">
      <p
        className="text-base sm:text-lg leading-relaxed mb-6 text-slate-800 dark:text-slate-100"
        style={{ lineHeight: 1.9 }}
      >
        {parts[0]}
        <span className="inline-flex items-center min-h-[44px] px-3 mx-1 rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-700/50 font-semibold text-slate-700 dark:text-slate-200">
          {chosen ?? '___'}
        </span>
        {parts[1]}
      </p>

      <div className="flex rounded-xl border-2 border-slate-200 dark:border-slate-600 p-1.5 bg-slate-50 dark:bg-slate-700/30 w-fit gap-1">
        <button
          type="button"
          className={cn(
            'min-h-[44px] min-w-[64px] px-4 rounded-lg font-semibold text-lg transition-colors touch-manipulation',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800',
            chosen === 'н'
              ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
              : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
          )}
          onClick={() => onChoose('н')}
        >
          Н
        </button>
        <button
          type="button"
          className={cn(
            'min-h-[44px] min-w-[64px] px-4 rounded-lg font-semibold text-lg transition-colors touch-manipulation',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800',
            chosen === 'нн'
              ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
              : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
          )}
          onClick={() => onChoose('нн')}
        >
          НН
        </button>
      </div>

      {showResult && (
        <div className="mt-6 space-y-4">
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold',
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-900/25 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-900/25 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200'
            )}
          >
            {isCorrect ? (
              <IconCheck className="w-6 h-6 shrink-0" />
            ) : (
              <IconX className="w-6 h-6 shrink-0" />
            )}
            <span className="text-lg">{isCorrect ? 'Верно!' : 'Ошибка'}</span>
          </div>
          {!isCorrect && (
            <div className="p-4 rounded-xl border-l-4 border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Правильно:</p>
              <p className="text-base font-medium text-slate-800 dark:text-slate-100">{exercise.word}</p>
            </div>
          )}
          {exercise.comment && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" style={{ lineHeight: 1.8 }}>
                <strong className="text-slate-800 dark:text-slate-100">{exercise.word}</strong>. {exercise.comment}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function useNNState() {
  const [chosen, setChosen] = useState<'н' | 'нн' | null>(null);
  const choose = useCallback((v: 'н' | 'нн') => setChosen(v), []);
  const reset = useCallback(() => setChosen(null), []);
  const isCorrect = (exercise: NNExercise) => chosen === exercise.answer;
  return { chosen, choose, reset, isCorrect };
}
