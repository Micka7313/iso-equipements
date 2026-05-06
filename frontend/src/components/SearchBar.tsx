"use client";

import { useState, useRef, useEffect } from "react";
import type { HistoryEntry } from "@/types";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

interface Props {
  onSearch: (ref: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/history`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => []);
  }, []);

  const submit = (ref: string = value) => {
    const trimmed = ref.trim();
    if (trimmed.length < 3) return;
    setShowHistory(false);
    onSearch(trimmed.toUpperCase());
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg select-none">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ex: 1K0615301G, 45251-S0A-010…"
            className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-surface-500
                       rounded-lg text-white font-mono text-sm placeholder-gray-600
                       focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                       transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          onClick={() => submit()}
          disabled={loading || value.trim().length < 3}
          className="px-6 py-3 bg-brand text-black font-semibold rounded-lg
                     hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors text-sm whitespace-nowrap"
        >
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-surface-700 border border-surface-500
                        rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-surface-600">
            Recherches récentes
          </div>
          {history.slice(0, 8).map((h) => (
            <button
              key={h.id}
              onMouseDown={() => { setValue(h.oemRef); submit(h.oemRef); }}
              className="w-full flex items-center justify-between px-3 py-2
                         hover:bg-surface-600 text-left transition-colors"
            >
              <span className="font-mono text-sm text-gray-200">{h.oemRef}</span>
              <span className="text-xs text-gray-500">
                {h.resultCount} résultat{h.resultCount !== 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
