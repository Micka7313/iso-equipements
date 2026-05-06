"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ResultsTable from "@/components/ResultsTable";
import ConfigPanel from "@/components/ConfigPanel";
import StatusIndicator from "@/components/StatusIndicator";
import type { SearchResponse } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleSearch = async (oemRef: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oemRef }),
      });
      const data: SearchResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface-800 border-b border-surface-600 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-black font-bold text-sm">
            M
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">Dashboard Magasinier</h1>
            <p className="text-xs text-gray-500 mt-0.5">ISO Équipements</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusIndicator />
          <button
            onClick={() => setShowConfig(true)}
            className="px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-500
                       text-xs text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
          >
            ⚙ Config
          </button>
        </div>
      </header>

      {/* Hero search area */}
      <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Recherche pièce auto</h2>
          <p className="text-gray-500 text-sm">Entrez une référence OEM pour comparer prix, stocks et délais</p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-700 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-danger text-sm">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* Results */}
        {response && !loading && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-400">
                  Résultats pour{" "}
                  <span className="font-mono text-white font-semibold">{response.query}</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-600 text-gray-400 text-xs">
                  {response.results.length} offre{response.results.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {new Date(response.searchedAt).toLocaleTimeString("fr-FR")}
              </span>
            </div>
            <ResultsTable results={response.results} query={response.query} />
          </div>
        )}

        {/* Empty state (initial) */}
        {!response && !loading && !error && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-5xl mb-4">🔩</p>
            <p className="text-sm">Prêt — saisissez une référence pour démarrer</p>
          </div>
        )}
      </main>

      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
    </div>
  );
}
