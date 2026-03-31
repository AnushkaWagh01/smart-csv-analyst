import { HistoryItem } from './analyst-types';

const STORAGE_KEY = 'csv-analyst-history';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addToHistory(item: HistoryItem): void {
  const history = getHistory();
  history.unshift(item);
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteHistoryItem(index: number): void {
  const history = getHistory();
  history.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
