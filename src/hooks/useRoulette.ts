import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item, RouletteSlot, Status } from '../types/roulette';
import { loadStorage, saveStorage } from '../utils/storage';
import {
  createRouletteIntervals,
  getRandomInt,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  pickWinner,
} from '../utils/random';
import { playRouletteResult, playRouletteTick } from '../utils/sound';

type ItemImportMode = 'append' | 'replace';

interface UseRouletteResult {
  slots: RouletteSlot[];
  activeSlotId: string;
  items: Item[];
  focusedId: string | null;
  resultId: string | null;
  isRolling: boolean;
  canAccept: boolean;
  selectSlot: (id: string) => void;
  renameSlot: (id: string, name: string) => boolean;
  addEmptyItem: () => string;
  addItemsFromText: (rawText: string, mode: ItemImportMode) => { added: number; duplicates: string[] };
  updateItemText: (id: string, text: string) => { updated: boolean; reason?: 'empty' | 'duplicate' };
  updateStatus: (id: string, status: Status) => void;
  removeItem: (id: string) => void;
  start: () => void;
  accept: () => void;
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useRoulette = (): UseRouletteResult => {
  const initial = useMemo(() => loadStorage(), []);
  const [slots, setSlots] = useState<RouletteSlot[]>(initial.slots);
  const [activeSlotId, setActiveSlotId] = useState(initial.activeSlotId);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const timerRef = useRef<number | null>(null);
  const targetIdsRef = useRef<string[]>([]);
  const activeSlot = slots.find((slot) => slot.id === activeSlotId) ?? slots[0];
  const items = activeSlot?.items ?? [];
  const resultId = activeSlot?.lastResultId ?? null;

  const updateActiveSlot = (updater: (slot: RouletteSlot) => RouletteSlot): void => {
    setSlots((prev) => prev.map((slot) => (slot.id === activeSlotId ? updater(slot) : slot)));
  };

  const setActiveSlotResultId = (nextResultId: string | null): void => {
    updateActiveSlot((slot) => ({ ...slot, lastResultId: nextResultId }));
  };

  useEffect(() => {
    saveStorage({ activeSlotId, slots });
  }, [activeSlotId, slots]);

  useEffect(() => () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
  }, []);

  const targetItems = useMemo(
    () => items.filter((item) => item.status === 'target' && item.text.trim().length > 0),
    [items],
  );

  const canAccept = !isRolling && resultId !== null;

  const selectSlot = (id: string): void => {
    if (isRolling || id === activeSlotId || !slots.some((slot) => slot.id === id)) {
      return;
    }

    setFocusedId(null);
    targetIdsRef.current = [];
    setActiveSlotId(id);
  };

  const renameSlot = (id: string, name: string): boolean => {
    const nextName = name.trim();
    if (nextName.length === 0) {
      return false;
    }

    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, name: nextName } : slot)));
    return true;
  };

  const addItemsFromText = (
    rawText: string,
    mode: ItemImportMode,
  ): { added: number; duplicates: string[] } => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return { added: 0, duplicates: [] };
    }

    const existingTextSet = mode === 'append' ? new Set(items.map((item) => item.text)) : new Set<string>();
    const seen = new Set<string>();
    const duplicates: string[] = [];
    const newItems: Item[] = [];

    lines.forEach((text) => {
      if (existingTextSet.has(text) || seen.has(text)) {
        duplicates.push(text);
        return;
      }
      seen.add(text);
      newItems.push({ id: createId(), text, status: 'target' });
    });

    if (mode === 'replace') {
      updateActiveSlot((slot) => ({ ...slot, items: newItems, lastResultId: null }));
      setFocusedId(null);
    } else if (newItems.length > 0) {
      updateActiveSlot((slot) => ({ ...slot, items: [...slot.items, ...newItems] }));
    }

    return { added: newItems.length, duplicates };
  };

  const addEmptyItem = (): string => {
    const id = createId();
    updateActiveSlot((slot) => ({ ...slot, items: [{ id, text: '', status: 'target' }, ...slot.items] }));
    return id;
  };

  const updateStatus = (id: string, status: Status): void => {
    updateActiveSlot((slot) => ({
      ...slot,
      items: slot.items.map((item) => (item.id === id ? { ...item, status } : item)),
    }));
  };

  const updateItemText = (id: string, text: string): { updated: boolean; reason?: 'empty' | 'duplicate' } => {
    const nextText = text.trim();

    if (nextText.length === 0) {
      return { updated: false, reason: 'empty' };
    }

    if (items.some((item) => item.id !== id && item.text === nextText)) {
      return { updated: false, reason: 'duplicate' };
    }

    updateActiveSlot((slot) => ({
      ...slot,
      items: slot.items.map((item) => (item.id === id ? { ...item, text: nextText } : item)),
    }));
    return { updated: true };
  };

  const removeItem = (id: string): void => {
    updateActiveSlot((slot) => ({ ...slot, items: slot.items.filter((item) => item.id !== id) }));
    if (resultId === id) {
      setActiveSlotResultId(null);
      setFocusedId(null);
    }
  };

  const start = (): void => {
    if (isRolling || targetItems.length === 0) {
      return;
    }

    const winner = pickWinner(targetItems);
    const duration = getRandomInt(MIN_DURATION_MS, MAX_DURATION_MS);
    const intervals = createRouletteIntervals(duration);
    targetIdsRef.current = targetItems.map((item) => item.id);

    setIsRolling(true);
    setActiveSlotResultId(null);

    let index = 0;
    let previousFocusedId: string | null = null;
    const run = () => {
      const ids = targetIdsRef.current;
      const lastStep = index >= intervals.length - 1;

      if (lastStep) {
        setFocusedId(winner.id);
        setActiveSlotResultId(winner.id);
        setIsRolling(false);
        timerRef.current = null;
        playRouletteResult();
        return;
      }

      const candidates = ids.length > 1 ? ids.filter((id) => id !== previousFocusedId) : ids;
      const randomId = candidates[getRandomInt(0, candidates.length - 1)];
      previousFocusedId = randomId;
      setFocusedId(randomId);
      playRouletteTick();

      const wait = intervals[index];
      index += 1;
      timerRef.current = window.setTimeout(run, wait);
    };

    run();
  };

  const accept = (): void => {
    if (!canAccept || !resultId) {
      return;
    }

    updateActiveSlot((slot) => ({
      ...slot,
      items: slot.items.map((item) => (item.id === resultId ? { ...item, status: 'done' } : item)),
      lastResultId: null,
    }));
    setFocusedId(null);
  };

  return {
    slots,
    activeSlotId,
    items,
    focusedId,
    resultId,
    isRolling,
    canAccept,
    selectSlot,
    renameSlot,
    addEmptyItem,
    addItemsFromText,
    updateItemText,
    updateStatus,
    removeItem,
    start,
    accept,
  };
};
