export type Status = 'inactive' | 'target' | 'done';

export interface Item {
  id: string;
  text: string;
  status: Status;
}

export interface RouletteSlot {
  id: string;
  name: string;
  items: Item[];
  lastResultId: string | null;
}

export interface RouletteStorageData {
  activeSlotId: string;
  slots: RouletteSlot[];
  updatedAt: string;
}
