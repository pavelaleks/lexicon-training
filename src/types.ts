export type TrainerType = 'punctuation.commas' | 'spelling.nn' | 'generic.html';
export type Category = 'punctuation' | 'orthography' | 'other';

export interface TrainerMeta {
  slug: string;
  name: string;
  description: string;
  type: TrainerType;
  category: Category;
  count: number;
}

export interface IndexData {
  trainers: TrainerMeta[];
  generated?: string;
}

export interface PunctuationExercise {
  type?: string;
  words: string[];
  commas: number[];
  phrase?: string;
  phraseType?: string;
  phrase2?: string;
  phraseType2?: string;
  comment?: string;
}

export interface NNExercise {
  phrase: string;
  answer: 'н' | 'нн';
  word: string;
  comment?: string;
}

export interface QuestStep {
  mission: string;
  title: string;
  body: string;
  example: string;
  tip: string;
}

export interface TrainerData extends TrainerMeta {
  exercises: PunctuationExercise[] | NNExercise[] | Record<string, unknown>[];
  questSteps?: QuestStep[];
}
