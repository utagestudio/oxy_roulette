import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item, Status } from '../types/roulette';
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
  items: Item[];
  focusedId: string | null;
  resultId: string | null;
  isRolling: boolean;
  canAccept: boolean;
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
  const [items, setItems] = useState<Item[]>(initial.items);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(initial.lastResultId);
  const [isRolling, setIsRolling] = useState(false);

  const timerRef = useRef<number | null>(null);
  const targetIdsRef = useRef<string[]>([]);

  useEffect(() => {
    saveStorage({ items, lastResultId: resultId });
  }, [items, resultId]);

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
      setItems(newItems);
      setFocusedId(null);
      setResultId(null);
    } else if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }

    return { added: newItems.length, duplicates };
  };

  const addEmptyItem = (): string => {
    const id = createId();
    setItems((prev) => [{ id, text: '', status: 'target' }, ...prev]);
    return id;
  };

  const updateStatus = (id: string, status: Status): void => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const updateItemText = (id: string, text: string): { updated: boolean; reason?: 'empty' | 'duplicate' } => {
    const nextText = text.trim();

    if (nextText.length === 0) {
      return { updated: false, reason: 'empty' };
    }

    if (items.some((item) => item.id !== id && item.text === nextText)) {
      return { updated: false, reason: 'duplicate' };
    }

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text: nextText } : item)));
    return { updated: true };
  };

  const removeItem = (id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (resultId === id) {
      setResultId(null);
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
    setResultId(null);

    let index = 0;
    const run = () => {
      const ids = targetIdsRef.current;
      const lastStep = index >= intervals.length - 1;

      if (lastStep) {
        setFocusedId(winner.id);
        setResultId(winner.id);
        setIsRolling(false);
        timerRef.current = null;
        playRouletteResult();
        return;
      }

      const randomId = ids[getRandomInt(0, ids.length - 1)];
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

    setItems((prev) => prev.map((item) => (item.id === resultId ? { ...item, status: 'done' } : item)));
    setFocusedId(null);
    setResultId(null);
  };

  return {
    items,
    focusedId,
    resultId,
    isRolling,
    canAccept,
    addEmptyItem,
    addItemsFromText,
    updateItemText,
    updateStatus,
    removeItem,
    start,
    accept,
  };
};
