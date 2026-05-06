import { getDb } from "./schema";
import type { FavoriteEntry } from "../../../shared/types";

export function addFavorite(oemRef: string, label?: string): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO favorites (oem_ref, label) VALUES (?, ?)"
    )
    .run(oemRef.toUpperCase(), label ?? null);
}

export function removeFavorite(id: number): void {
  getDb().prepare("DELETE FROM favorites WHERE id = ?").run(id);
}

export function getFavorites(): FavoriteEntry[] {
  return getDb()
    .prepare(
      `SELECT id, oem_ref as oemRef, label, added_at as addedAt
       FROM favorites ORDER BY added_at DESC`
    )
    .all() as FavoriteEntry[];
}
