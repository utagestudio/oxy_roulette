import type { RouletteStorageData } from '../types/roulette';

export const STORAGE_KEY = 'oni-roulette-v1';

const createInitialData = (): RouletteStorageData => ({
  items: [],
  lastResultId: null,
  updatedAt: new Date().toISOString(),
});

const isStatus = (value: unknown): value is 'inactive' | 'target' | 'done' =>
  value === 'inactive' || value === 'target' || value === 'done';

const isValidStorageData = (value: unknown): value is RouletteStorageData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as RouletteStorageData;

  if (!Array.isArray(data.items) || typeof data.updatedAt !== 'string') {
    return false;
  }

  if (!(typeof data.lastResultId === 'string' || data.lastResultId === null)) {
    return false;
  }

  return data.items.every((item) => (
    item
    && typeof item === 'object'
    && typeof item.id === 'string'
    && typeof item.text === 'string'
    && isStatus(item.status)
  ));
};

export const loadStorage = (): RouletteStorageData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialData();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidStorageData(parsed)) {
      return parsed;
    }
  } catch {
    // noop
  }

  const initial = createInitialData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStorage = (data: Omit<RouletteStorageData, 'updatedAt'>): void => {
  const payload: RouletteStorageData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};
