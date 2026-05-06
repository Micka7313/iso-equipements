import { getDb } from "./schema";
import type { HistoryEntry } from "../../../shared/types";

export function addHistory(oemRef: string, resultCount: number): void {
  getDb()
    .prepare(
      "INSERT INTO search_history (oem_ref, result_count) VALUES (?, ?)"
    )
    .run(oemRef.toUpperCase(), resultCount);
}

export function getHistory(limit = 50): HistoryEntry[] {
  return getDb()
    .prepare(
      `SELECT id, oem_ref as oemRef, searched_at as searchedAt, result_count as resultCount
       FROM search_history ORDER BY searched_at DESC LIMIT ?`
    )
    .all(limit) as HistoryEntry[];
}

export function clearHistory(): void {
  getDb().prepare("DELETE FROM search_history").run();
}
