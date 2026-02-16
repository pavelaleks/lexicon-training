import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadTrainer } from '@/lib/loadTrainer';
import type { TrainerData, PunctuationExercise, NNExercise, TrainerType } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PunctuationRenderer, usePunctuationState } from '@/lib/renderers/punctuation';
import { NNRenderer, useNNState } from '@/lib/renderers/nn';
import { GenericRenderer } from '@/lib/renderers/generic';
import { cn } from '@/lib/utils';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Trainer() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<TrainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'start' | 'quest' | 'exercise' | 'result'>('start');
  const [exercises, setExercises] = useState<(PunctuationExercise | NNExercise)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const [questStep, setQuestStep] = useState(0);

  const trainerType: TrainerType = data?.type ?? 'generic.html';
  const currentExercise = exercises[currentIndex];
  const isPunctuation = trainerType === 'punctuation.commas';
  const isNN = trainerType === 'spelling.nn';

  const punctState = usePunctuationState(
    (currentExercise as PunctuationExercise) ?? { words: [], commas: [] }
  );
  const nnState = useNNState();

  useEffect(() => {
    if (!slug) return;
    loadTrainer(slug)
      .then((d) => {
        setData(d ?? null);
        if (d?.exercises?.length) {
          setExercises(shuffle(d.exercises as (PunctuationExercise | NNExercise)[]));
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStart = useCallback(() => {
    if (data?.questSteps?.length) {
      setPhase('quest');
      setQuestStep(0);
    } else {
      setPhase('exercise');
      setCurrentIndex(0);
      setCorrectCount(0);
      setChecked(false);
    }
  }, [data?.questSteps?.length]);

  const handleQuestNext = useCallback(() => {
    if (!data?.questSteps || questStep >= data.questSteps.length - 1) {
      setPhase('exercise');
      setCurrentIndex(0);
      setCorrectCount(0);
      setChecked(false);
    } else {
      setQuestStep((s) => s + 1);
    }
  }, [data?.questSteps, questStep]);

  const handleCheck = useCallback(() => {
    if (checked) return;
    setChecked(true);
    const correct =
      isPunctuation
        ? punctState.isCorrect
        : isNN
          ? nnState.isCorrect(currentExercise as NNExercise)
          : false;
    if (correct) setCorrectCount((c) => c + 1);
  }, [checked, isPunctuation, isNN, punctState.isCorrect, nnState.isCorrect, currentExercise]);

  const handleNext = useCallback(() => {
    if (currentIndex >= exercises.length - 1) {
      setPhase('result');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setChecked(false);
    if (isPunctuation) punctState.reset();
    if (isNN) nnState.reset();
  }, [currentIndex, exercises.length, isPunctuation, isNN, punctState.reset, nnState.reset]);

  const progressPct = exercises.length ? Math.round((currentIndex / exercises.length) * 100) : 0;
  const resultPct = exercises.length ? Math.round((correctCount / exercises.length) * 100) : 0;
  const grade = resultPct >= 85 ? 5 : resultPct >= 70 ? 4 : resultPct >= 50 ? 3 : 2;

  const canCheck = isPunctuation || (isNN && nnState.chosen !== null);
  const showBottomBar = phase === 'exercise' || phase === 'quest';

  if (loading || !slug) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header showBack />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-slate-500 dark:text-slate-400">Загрузка...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header showBack />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-slate-600 dark:text-slate-400">Тренажёр не найден.</p>
          <Link
            to="/"
            className="min-h-[44px] px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            В каталог
          </Link>
        </main>
      </div>
    );
  }

  if (phase === 'start') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <Header title={data.name} showBack />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-800/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {data.type === 'punctuation.commas' ? 'Пунктуация' : data.type === 'spelling.nn' ? 'Орфография' : 'Тренажёр'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Заданий: {data.count}
              </span>
            </div>
            <h1 className="font-semibold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 mb-3">
              {data.name}
            </h1>
            {data.description && (
              <p className="text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed" style={{ lineHeight: 1.8 }}>
                {data.description}
              </p>
            )}
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[44px] py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation"
            >
              Начать
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === 'quest' && data.questSteps?.length) {
    const step = data.questSteps[questStep];
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <Header title={data.name} showBack />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24 sm:pb-10">
          <div className="flex gap-1.5 flex-wrap mb-4" aria-label="Прогресс квеста">
            {data.questSteps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-colors',
                  i < questStep ? 'bg-indigo-500' : i === questStep ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-200 dark:bg-slate-600'
                )}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-800/80 p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{step.mission}</p>
            <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">{step.title}</h2>
            <div className="text-left space-y-4" style={{ lineHeight: 1.8 }}>
              <p className="text-slate-600 dark:text-slate-300">{step.body}</p>
              {step.example && (
                <div
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                  dangerouslySetInnerHTML={{ __html: step.example }}
                />
              )}
              {step.tip && <p className="text-sm text-slate-500 dark:text-slate-400">{step.tip}</p>}
            </div>
          </div>
        </main>
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 h-[64px] flex items-center px-4',
            'bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-700/80',
            'pb-[env(safe-area-inset-bottom)]'
          )}
        >
          <button
            type="button"
            onClick={handleQuestNext}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation"
          >
            {questStep >= data.questSteps.length - 1 ? 'К заданиям' : 'Далее'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <Header title={data.name} showBack />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-800/80 p-6 sm:p-8 shadow-sm text-center">
            <h2 className="font-semibold text-xl text-slate-900 dark:text-slate-100 mb-4">
              Тренировка завершена
            </h2>
            <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {correctCount} из {exercises.length}
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400 mb-8">
              Оценка: {grade}. {resultPct >= 70 ? 'Молодец!' : 'Повтори теорию и попробуй снова.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setPhase('exercise');
                  setExercises(shuffle(data.exercises as (PunctuationExercise | NNExercise)[]));
                  setCurrentIndex(0);
                  setCorrectCount(0);
                  setChecked(false);
                }}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Начать заново
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                В каталог
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (trainerType === 'generic.html') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header title={data.name} showBack />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
          <GenericRenderer name={data.name} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Header title={data.name} showBack />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24 sm:pb-10">
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span>Задание {currentIndex + 1} из {exercises.length}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Верно: {correctCount}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-800/80 p-5 sm:p-6 shadow-sm">
          {isPunctuation && currentExercise && (
            <PunctuationRenderer
              exercise={currentExercise as PunctuationExercise}
              userCommas={punctState.userCommas}
              onToggleSlot={punctState.toggleSlot}
              onReset={punctState.reset}
              showResult={checked}
              isCorrect={punctState.isCorrect}
            />
          )}
          {isNN && currentExercise && (
            <NNRenderer
              exercise={currentExercise as NNExercise}
              chosen={nnState.chosen}
              onChoose={nnState.choose}
              showResult={checked}
              isCorrect={nnState.isCorrect(currentExercise as NNExercise)}
            />
          )}
        </div>

        {/* Desktop: компактные кнопки под карточкой, не на всю ширину */}
        <div className="hidden sm:flex sm:items-center sm:gap-3 mt-6">
          {!checked ? (
            <button
              type="button"
              disabled={!canCheck}
              onClick={handleCheck}
              className={cn(
                'min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                canCheck
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-400 cursor-not-allowed'
              )}
            >
              Проверить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation"
            >
              {currentIndex >= exercises.length - 1 ? 'Итог' : 'Следующее'}
            </button>
          )}
        </div>
      </main>

      {/* Только на мобилке: фиксированная панель внизу с одной кнопкой */}
      {showBottomBar && phase === 'exercise' && (
        <div
          className={cn(
            'sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4',
            'h-[56px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700',
            'pb-[env(safe-area-inset-bottom)]'
          )}
        >
          {!checked ? (
            <button
              type="button"
              disabled={!canCheck}
              onClick={handleCheck}
              className={cn(
                'min-h-[44px] px-8 py-2.5 rounded-xl text-base font-medium touch-manipulation w-auto max-w-[280px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                canCheck
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-400 cursor-not-allowed'
              )}
            >
              Проверить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] px-8 py-2.5 rounded-xl text-base font-medium bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation w-auto max-w-[280px]"
            >
              {currentIndex >= exercises.length - 1 ? 'Итог' : 'Следующее'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
