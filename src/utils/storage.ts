import type { Item, RouletteSlot, RouletteStorageData } from '../types/roulette';

export const STORAGE_KEY = 'oni-roulette-v1';
const SLOT_IDS = ['slot-1', 'slot-2', 'slot-3'] as const;

const createInitialData = (): RouletteStorageData => ({
  activeSlotId: SLOT_IDS[0],
  slots: SLOT_IDS.map((id) => ({
    id,
    name: '',
    items: [],
    lastResultId: null,
  })),
  updatedAt: new Date().toISOString(),
});

const isStatus = (value: unknown): value is 'inactive' | 'target' | 'done' =>
  value === 'inactive' || value === 'target' || value === 'done';

const isValidItem = (value: unknown): value is Item => (
  Boolean(value)
  && typeof value === 'object'
  && typeof (value as Item).id === 'string'
  && typeof (value as Item).text === 'string'
  && isStatus((value as Item).status)
);

const isValidSlot = (value: unknown): value is RouletteSlot => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const slot = value as RouletteSlot;
  return (
    typeof slot.id === 'string'
    && (typeof slot.name === 'string' || typeof slot.name === 'undefined')
    && Array.isArray(slot.items)
    && slot.items.every(isValidItem)
    && (typeof slot.lastResultId === 'string' || slot.lastResultId === null)
  );
};

const isValidStorageData = (value: unknown): value is RouletteStorageData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as RouletteStorageData;

  if (
    typeof data.activeSlotId !== 'string'
    || !Array.isArray(data.slots)
    || data.slots.length !== SLOT_IDS.length
    || typeof data.updatedAt !== 'string'
  ) {
    return false;
  }

  if (!data.slots.some((slot) => slot.id === data.activeSlotId)) {
    return false;
  }

  return data.slots.every(isValidSlot);
};

const isLegacyStorageData = (value: unknown): value is { items: Item[]; lastResultId: string | null } => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as { items?: unknown; lastResultId?: unknown };
  return (
    Array.isArray(data.items)
    && data.items.every(isValidItem)
    && (typeof data.lastResultId === 'string' || data.lastResultId === null)
  );
};

const migrateLegacyStorageData = (legacy: { items: Item[]; lastResultId: string | null }): RouletteStorageData => ({
  ...createInitialData(),
  slots: SLOT_IDS.map((id, index) => ({
    id,
    name: '',
    items: index === 0 ? legacy.items : [],
    lastResultId: index === 0 ? legacy.lastResultId : null,
  })),
});

const normalizeStorageData = (data: RouletteStorageData): RouletteStorageData => {
  const slots = SLOT_IDS.map((id) => {
    const slot = data.slots.find((candidate) => candidate.id === id);
    if (!slot) {
      return { id, name: '', items: [], lastResultId: null };
    }

    const rawName = typeof slot.name === 'string' ? slot.name : '';
    const name = rawName.trim().length > 0 ? rawName : '';
    return { ...slot, name };
  });

  return {
    activeSlotId: slots.some((slot) => slot.id === data.activeSlotId) ? data.activeSlotId : SLOT_IDS[0],
    slots,
    updatedAt: data.updatedAt,
  };
};

export const loadStorage = (): RouletteStorageData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialData();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidStorageData(parsed)) {
      return normalizeStorageData(parsed);
    }

    if (isLegacyStorageData(parsed)) {
      const migrated = migrateLegacyStorageData(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
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
