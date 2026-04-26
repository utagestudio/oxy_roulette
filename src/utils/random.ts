import type { Item } from '../types/roulette';

export const MIN_DURATION_MS = 6000;
export const MAX_DURATION_MS = 10000;
export const MIN_INTERVAL_MS = 80;
export const MAX_INTERVAL_MS = 220;

export const getRandomInt = (min: number, max: number): number => {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

export const pickWinner = (targetItems: Item[]): Item =>
  targetItems[getRandomInt(0, targetItems.length - 1)];

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const createRouletteIntervals = (durationMs: number): number[] => {
  const intervals: number[] = [];
  let elapsed = 0;

  while (elapsed < durationMs) {
    const ratio = Math.min(elapsed / durationMs, 1);
    const interval = MIN_INTERVAL_MS + (MAX_INTERVAL_MS - MIN_INTERVAL_MS) * easeOutCubic(ratio);
    const next = Math.round(interval);

    intervals.push(next);
    elapsed += next;
  }

  return intervals;
};
