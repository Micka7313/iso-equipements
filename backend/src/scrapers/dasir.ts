import { chromium, Browser, BrowserContext, Page } from "playwright";
import { BaseScraper } from "./base";
import type { SearchResult } from "../../../shared/types";

export class DasirScraper extends BaseScraper {
  readonly sourceName = "dasir" as const;

  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;

  private get baseUrl(): string {
    return process.env.DASIR_URL ?? "https://b2b.dasirweb.fr/";
  }

  async login(): Promise<void> {
    const username = process.env.DASIR_USERNAME;
    const password = process.env.DASIR_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "DASIR_USERNAME et DASIR_PASSWORD doivent être définis dans .env"
      );
    }

    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    this.page = await this.context.newPage();

    await this.page.goto(this.baseUrl, { waitUntil: "networkidle", timeout: 30_000 });

    // --- Remplissage du formulaire de connexion ---
    // NOTE: les sélecteurs ci-dessous sont à ajuster selon le DOM réel du portail.
    // Activez headless: false temporairement pour inspecter la page si nécessaire.
    await this.page.fill('input[name="username"], input[type="email"]', username);
    await this.page.fill('input[name="password"], input[type="password"]', password);
    await this.page.click('button[type="submit"], input[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: "networkidle", timeout: 20_000 });

    const url = this.page.url();
    if (url.includes("login") || url.includes("connexion")) {
      throw new Error("Échec de la connexion Dasir — vérifiez vos identifiants.");
    }

    this.isLoggedIn = true;
  }

  async search(oemRef: string): Promise<SearchResult[]> {
    if (!this.isLoggedIn || !this.page) {
      await this.login();
    }

    const page = this.page!;

    // --- Navigation vers la recherche ---
    // NOTE: adapter l'URL et les sélecteurs selon le portail réel.
    await page.goto(`${this.baseUrl}recherche?ref=${encodeURIComponent(oemRef)}`, {
      waitUntil: "networkidle",
      timeout: 20_000,
    });

    // Attendre que les résultats se chargent
    await page.waitForSelector(".product-list, .results-table, table tbody tr", {
      timeout: 10_000,
    }).catch(() => null);

    const results = await page.evaluate((ref): SearchResult[] => {
      // --- ADAPTATION REQUISE ---
      // Remplacez les sélecteurs par ceux du vrai DOM de b2b.dasirweb.fr.
      // Cette implémentation est un template de départ.
      const rows = Array.from(
        document.querySelectorAll("table tbody tr, .product-item")
      );

      return rows.map((row): SearchResult => {
        const cells = Array.from(row.querySelectorAll("td, .field"));
        const getText = (i: number) => cells[i]?.textContent?.trim() ?? "";
        const priceText = getText(3).replace(/[^\d,.-]/g, "").replace(",", ".");
        const stockText = getText(4).toLowerCase();

        let availability: SearchResult["availability"] = "unknown";
        if (stockText.includes("dispo") || stockText.includes("stock")) {
          availability = "in_stock";
        } else if (stockText.includes("faible") || stockText.includes("limité")) {
          availability = "low_stock";
        } else if (stockText.includes("rupture") || stockText === "0") {
          availability = "out_of_stock";
        }

        return {
          source: "dasir",
          brand: getText(0) || "—",
          reference: getText(1) || ref,
          equivalentRef: getText(2) || undefined,
          priceHT: priceText ? parseFloat(priceText) : null,
          availability,
          stockQty: parseInt(getText(4)) || null,
          deliveryDelay: getText(5) || null,
          updatedAt: new Date().toISOString(),
        };
      });
    }, oemRef);

    return results.filter((r) => r.reference);
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.isLoggedIn = false;
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}
