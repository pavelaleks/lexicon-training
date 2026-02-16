import React, { useCallback, useMemo } from 'react';
import { IconRotateCcw } from '@/components/Icons';
import type { PunctuationExercise } from '@/types';
import { cn } from '@/lib/utils';

interface PunctuationRendererProps {
  exercise: PunctuationExercise;
  userCommas: number[];
  onToggleSlot: (index: number) => void;
  onReset?: () => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

const SLOT_MIN_HEIGHT = 44;

/** Находит индексы слов, образующих фразу (подстрока через пробелы). */
function findPhraseWordIndices(words: string[], phrase: string): number[] {
  if (!phrase || !words.length) return [];
  const phraseWords = phrase.trim().split(/\s+/);
  if (!phraseWords.length) return [];
  for (let start = 0; start <= words.length - phraseWords.length; start++) {
    const slice = words.slice(start, start + phraseWords.length).join(' ');
    if (slice === phrase.trim()) {
      return Array.from({ length: phraseWords.length }, (_, i) => start + i);
    }
  }
  return [];
}

export function PunctuationRenderer({
  exercise,
  userCommas,
  onToggleSlot,
  onReset,
  showResult,
  isCorrect,
}: PunctuationRendererProps) {
  const words = exercise.words ?? [];
  const correctCommas = useMemo(() => (exercise.commas ?? []).slice().sort((a, b) => a - b), [exercise.commas]);

  const phrase1Indices = useMemo(() => findPhraseWordIndices(words, exercise.phrase ?? ''), [words, exercise.phrase]);
  const phrase2Indices = useMemo(() => findPhraseWordIndices(words, exercise.phrase2 ?? ''), [words, exercise.phrase2]);
  const allParticipleIndices = useMemo(() => {
    const set = new Set<number>();
    if (exercise.phraseType === 'participle') phrase1Indices.forEach((i) => set.add(i));
    if (exercise.phraseType2 === 'participle') phrase2Indices.forEach((i) => set.add(i));
    return set;
  }, [phrase1Indices, phrase2Indices, exercise.phraseType, exercise.phraseType2]);
  const allGerundIndices = useMemo(() => {
    const set = new Set<number>();
    if (exercise.phraseType === 'gerund') phrase1Indices.forEach((i) => set.add(i));
    if (exercise.phraseType2 === 'gerund') phrase2Indices.forEach((i) => set.add(i));
    return set;
  }, [phrase1Indices, phrase2Indices, exercise.phraseType, exercise.phraseType2]);

  return (
    <div className="w-full">
      <p
        className="text-base sm:text-lg leading-relaxed max-w-full md:max-w-prose mb-4 sm:mb-6 text-slate-800 dark:text-slate-100"
        style={{ lineHeight: 2 }}
      >
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span
              className={cn(
                'px-0.5 rounded',
                showResult && allParticipleIndices.has(i) && 'bg-amber-200/70 dark:bg-amber-500/25 text-amber-900 dark:text-amber-100',
                showResult && allGerundIndices.has(i) && 'bg-sky-200/70 dark:bg-sky-500/25 text-sky-900 dark:text-sky-100'
              )}
            >
              {word}
            </span>
            {i < words.length - 1 && (
              <span
                role="button"
                tabIndex={0}
                aria-label={userCommas.includes(i) ? 'Убрать запятую' : 'Поставить запятую'}
                className={cn(
                  'inline-flex items-center justify-center align-middle cursor-pointer select-none rounded transition-colors mx-0.5',
                  'touch-manipulation active:scale-95 min-h-[44px] min-w-[28px]',
                  userCommas.includes(i)
                    ? 'text-indigo-700 dark:text-indigo-300 font-bold text-xl bg-indigo-100 dark:bg-indigo-900/50 rounded-md'
                    : 'text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50',
                  showResult && correctCommas.includes(i) && !userCommas.includes(i) && 'text-red-600 dark:text-red-400',
                  showResult && userCommas.includes(i) && !correctCommas.includes(i) && 'text-red-600 dark:text-red-400 line-through bg-red-50 dark:bg-red-900/20'
                )}
                style={{ minHeight: SLOT_MIN_HEIGHT }}
                onClick={() => onToggleSlot(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleSlot(i);
                  }
                }}
              >
                {userCommas.includes(i) ? ',' : ' '}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
      {showResult && (allParticipleIndices.size > 0 || allGerundIndices.size > 0) && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap gap-3">
          {allParticipleIndices.size > 0 && (
            <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-500/40 align-middle mr-1" /> причастный оборот</span>
          )}
          {allGerundIndices.size > 0 && (
            <span><span className="inline-block w-3 h-3 rounded-sm bg-sky-200 dark:bg-sky-500/40 align-middle mr-1" /> деепричастный оборот</span>
          )}
        </p>
      )}

      {onReset && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 flex items-center justify-center gap-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation"
            aria-label="Сбросить запятые"
          >
            <IconRotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline text-sm font-medium">Сбросить</span>
          </button>
        </div>
      )}

      {showResult && (
        <>
          <div
            className={cn(
              'mb-4 px-4 py-3 rounded-xl border-2 flex items-center gap-2',
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200'
            )}
          >
            <span className="font-semibold text-lg">
              {isCorrect ? 'Верно!' : 'Ошибка. Смотрите правильный вариант ниже.'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div
              className={cn(
                'p-4 rounded-xl border-l-4',
                isCorrect
                  ? 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30'
                  : 'border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
              )}
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Ваш ответ</p>
              <p className="text-base text-slate-800 dark:text-slate-200" style={{ lineHeight: 1.7 }}>
                {userCommas.length
                  ? words.map((w, i) => (userCommas.includes(i) ? `${w}, ` : `${w} `)).join('').trim()
                  : '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1 uppercase tracking-wide">Правильно</p>
              <p className="text-base text-slate-800 dark:text-slate-200" style={{ lineHeight: 1.7 }}>
                {words.map((w, i) => (correctCommas.includes(i) ? `${w}, ` : `${w} `)).join('').trim()}
              </p>
            </div>
          </div>
          {exercise.comment && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" style={{ lineHeight: 1.8 }}>
                {exercise.comment}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function usePunctuationState(exercise: PunctuationExercise) {
  const [userCommas, setUserCommas] = React.useState<number[]>([]);

  const toggleSlot = useCallback((index: number) => {
    setUserCommas((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  }, []);

  const reset = useCallback(() => setUserCommas([]), []);

  const isCorrect = useMemo(() => {
    const correct = (exercise.commas ?? []).slice().sort((a, b) => a - b);
    if (userCommas.length !== correct.length) return false;
    return userCommas.every((c, i) => c === correct[i]);
  }, [exercise.commas, userCommas]);

  return { userCommas, toggleSlot, reset, isCorrect };
}
