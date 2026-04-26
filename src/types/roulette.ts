export type Status = 'inactive' | 'target' | 'done';

export interface Item {
  id: string;
  text: string;
  status: Status;
}

export interface RouletteStorageData {
  items: Item[];
  lastResultId: string | null;
  updatedAt: string;
}
