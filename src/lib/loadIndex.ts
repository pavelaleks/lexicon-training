import type { IndexData } from '@/types';

const BASE = import.meta.env.BASE_URL || '/';

export async function loadIndex(): Promise<IndexData> {
  const url = `${BASE}data/index.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load index');
  return res.json();
}
