import type { SearchResult } from "../../../shared/types";

interface CacheEntry {
  results: SearchResult[];
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();
const TTL_MS = (parseInt(process.env.CACHE_TTL_SECONDS ?? "300", 10)) * 1000;

export function getCached(key: string): SearchResult[] | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.results;
}

export function setCache(key: string, results: SearchResult[]): void {
  store.set(key, { results, expiresAt: Date.now() + TTL_MS });
}

export function invalidate(key: string): void {
  store.delete(key);
}
