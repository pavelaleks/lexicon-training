import type { TrainerData } from '@/types';

const BASE = import.meta.env.BASE_URL || '/';

export async function loadTrainer(slug: string): Promise<TrainerData | null> {
  const url = `${BASE}data/trainers/${slug}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}
