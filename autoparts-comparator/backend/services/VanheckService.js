'use strict';

const https = require('https');
const http = require('http');

class VanheckService {
  constructor() {
    this._token = null;
    this._tokenExpiresAt = 0;
  }

  // ── OAuth2 token management ──────────────────────────────────────────────

  async _fetchToken() {
    const { VANHECK_TOKEN_URL, VANHECK_CLIENT_ID, VANHECK_CLIENT_SECRET, VANHECK_SCOPE } = process.env;

    const params = {
      grant_type: 'client_credentials',
      client_id: VANHECK_CLIENT_ID,
      client_secret: VANHECK_CLIENT_SECRET,
    };
    if (VANHECK_SCOPE) params.scope = VANHECK_SCOPE;

    const body = new URLSearchParams(params).toString();

    const url = new URL(VANHECK_TOKEN_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise((resolve, reject) => {
      const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(`Token request failed ${res.statusCode}: ${data}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error(`Invalid JSON from token endpoint: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async _getValidToken() {
    // Refresh 60 s before expiry
    if (!this._token || Date.now() >= this._tokenExpiresAt - 60_000) {
      const data = await this._fetchToken();
      this._token = data.access_token;
      // expires_in is in seconds; fall back to 3600 if missing
      this._tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    }
    return this._token;
  }

  // ── API call ─────────────────────────────────────────────────────────────

  async _get(urlString) {
    const token = await this._getValidToken();
    const fullUrl = new URL(urlString);

    const options = {
      hostname: fullUrl.hostname,
      path: fullUrl.pathname + fullUrl.search,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.VANHECK_API_KEY,
        Accept: 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = (fullUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  // ── Public interface ─────────────────────────────────────────────────────

  /**
   * Search parts by manufacturer reference.
   * Returns { supplier, brands, price, availability, deliveryDays, raw }
   */
  async searchByReference(ref) {
    // The iframe/ticket endpoint accepts a query parameter `reference`
    const { status, body } = await this._get(
      `${process.env.VANHECK_CATALOGUE_URL}reference=${encodeURIComponent(ref)}`
    );

    if (status !== 200) {
      throw new Error(`VanHeck API error ${status}: ${JSON.stringify(body)}`);
    }

    return this._normalise(body, ref);
  }

  _normalise(body, ref) {
    // The API may return an array of articles or a single object.
    // We flatten to a consistent shape; adjust field names once the real
    // API contract is confirmed.
    const articles = Array.isArray(body) ? body : body.articles ?? body.results ?? [body];

    return articles.map((article) => ({
      supplier: 'VanHeck (LKQ)',
      reference: ref,
      brand: article.brand ?? article.marque ?? article.manufacturer ?? '—',
      price: article.price ?? article.prixHT ?? article.unitPrice ?? null,
      currency: article.currency ?? 'EUR',
      availability: article.availability ?? article.stock ?? article.disponibilite ?? null,
      deliveryDays: article.deliveryDays ?? article.delaiLivraison ?? null,
      raw: article,
    }));
  }
}

module.exports = new VanheckService();
