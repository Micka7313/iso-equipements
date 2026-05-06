import type { SearchResult } from "../../../shared/types";

export abstract class BaseScraper {
  abstract readonly sourceName: SearchResult["source"];

  abstract login(): Promise<void>;
  abstract search(oemRef: string): Promise<SearchResult[]>;
  abstract close(): Promise<void>;
}
