import { Router, Request, Response } from "express";
import { DasirScraper } from "../scrapers/dasir";
import { searchErp } from "../services/erp";
import { getCached, setCache } from "../services/cache";
import { addHistory } from "../db/history";
import type { SearchRequest, SearchResponse, SearchResult } from "../../../shared/types";

const router = Router();
const dasirScraper = new DasirScraper();

function pickBestOffer(results: SearchResult[]): SearchResult[] {
  const priced = results.filter((r) => r.priceHT !== null && r.priceHT > 0);
  if (!priced.length) return results;

  const inStock = priced.filter((r) => r.availability === "in_stock");
  const pool = inStock.length ? inStock : priced;
  const best = pool.reduce((a, b) => (a.priceHT! < b.priceHT! ? a : b));

  return results.map((r) => ({
    ...r,
    isBestOffer: r === best,
  }));
}

router.post("/", async (req: Request, res: Response) => {
  const { oemRef } = req.body as SearchRequest;

  if (!oemRef || typeof oemRef !== "string" || oemRef.trim().length < 3) {
    res.status(400).json({ error: "Référence OEM invalide (minimum 3 caractères)" });
    return;
  }

  const normalizedRef = oemRef.trim().toUpperCase();
  const cached = getCached(normalizedRef);

  if (cached) {
    const response: SearchResponse = {
      query: normalizedRef,
      results: cached,
      searchedAt: new Date().toISOString(),
    };
    res.json(response);
    return;
  }

  try {
    const [dasirResults, erpResults] = await Promise.allSettled([
      dasirScraper.search(normalizedRef),
      searchErp(normalizedRef),
    ]);

    const allResults: SearchResult[] = [
      ...(dasirResults.status === "fulfilled" ? dasirResults.value : []),
      ...(erpResults.status === "fulfilled" ? erpResults.value : []),
    ];

    const ranked = pickBestOffer(allResults);
    setCache(normalizedRef, ranked);
    addHistory(normalizedRef, ranked.length);

    const response: SearchResponse = {
      query: normalizedRef,
      results: ranked,
      searchedAt: new Date().toISOString(),
    };
    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    res.status(500).json({ error: message });
  }
});

export default router;
