export interface SearchResult {
  source: "dasir" | "erp" | "manual";
  brand: string;
  reference: string;
  equivalentRef?: string;
  priceHT: number | null;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  stockQty: number | null;
  deliveryDelay: string | null;
  isBestOffer?: boolean;
  updatedAt: string;
}

export interface SearchRequest {
  oemRef: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  searchedAt: string;
  error?: string;
}

export interface HistoryEntry {
  id: number;
  oemRef: string;
  searchedAt: string;
  resultCount: number;
}

export interface FavoriteEntry {
  id: number;
  oemRef: string;
  label?: string;
  addedAt: string;
}

export interface ErpConfig {
  apiUrl: string;
  apiKey: string;
  timeoutMs: number;
  enabled: boolean;
}

export type AvailabilityStatus = SearchResult["availability"];
