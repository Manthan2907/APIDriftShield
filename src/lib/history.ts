import { HistoryEntry, AnalysisResult } from "@/types";

const KEY = "driftshield_history";
const MAX = 10;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(result: AnalysisResult): void {
  const entry: HistoryEntry = {
    id: result.id,
    v1Name: result.specV1Name,
    v2Name: result.specV2Name,
    analyzedAt: result.analyzedAt,
    summary: result.summary,
    result,
  };
  const existing = getHistory().filter((e) => e.id !== entry.id);
  const updated = [entry, ...existing].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}

export function deleteEntry(id: string): void {
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}
