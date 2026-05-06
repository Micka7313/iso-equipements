import type { SearchResult } from "../../../shared/types";

/**
 * Module ERP modulaire — connectez votre propre API via les variables d'environnement.
 * Implémentez la logique HTTP ici une fois vos accès disponibles.
 */
export async function searchErp(oemRef: string): Promise<SearchResult[]> {
  const apiUrl = process.env.ERP_API_URL;
  const apiKey = process.env.ERP_API_KEY;

  if (!apiUrl || !apiKey) return [];

  const timeout = parseInt(process.env.ERP_TIMEOUT_MS ?? "5000", 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(`${apiUrl}/parts/search?ref=${encodeURIComponent(oemRef)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!resp.ok) return [];

    // TODO: adapter le mapping selon le schéma JSON de votre ERP
    const data = await resp.json() as Record<string, unknown>[];
    return data.map((item): SearchResult => ({
      source: "erp",
      brand: String(item.brand ?? ""),
      reference: String(item.reference ?? oemRef),
      equivalentRef: item.equivalent_ref ? String(item.equivalent_ref) : undefined,
      priceHT: item.price_ht ? Number(item.price_ht) : null,
      availability: mapErpAvailability(item.availability),
      stockQty: item.stock_qty ? Number(item.stock_qty) : null,
      deliveryDelay: item.delivery_delay ? String(item.delivery_delay) : null,
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function mapErpAvailability(raw: unknown): SearchResult["availability"] {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("stock") && !v.includes("rupture")) return "in_stock";
  if (v.includes("faible") || v.includes("low")) return "low_stock";
  if (v.includes("rupture") || v.includes("out")) return "out_of_stock";
  return "unknown";
}
