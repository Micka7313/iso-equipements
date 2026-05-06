"use client";

import clsx from "clsx";
import type { SearchResult } from "@/types";
import BestOfferBadge from "./BestOfferBadge";

interface Props {
  results: SearchResult[];
  query: string;
}

const AVAILABILITY_LABEL: Record<SearchResult["availability"], string> = {
  in_stock: "En stock",
  low_stock: "Stock limité",
  out_of_stock: "Rupture",
  unknown: "—",
};

const AVAILABILITY_COLOR: Record<SearchResult["availability"], string> = {
  in_stock: "text-success",
  low_stock: "text-warning",
  out_of_stock: "text-danger",
  unknown: "text-gray-500",
};

const SOURCE_LABEL: Record<SearchResult["source"], string> = {
  dasir: "Dasir B2B",
  erp: "ERP",
  manual: "Manuel",
};

function AvailabilityDot({ status }: { status: SearchResult["availability"] }) {
  return (
    <span className={clsx("flex items-center gap-1.5 font-medium text-sm", AVAILABILITY_COLOR[status])}>
      <span className={clsx("w-2 h-2 rounded-full inline-block", {
        "bg-success": status === "in_stock",
        "bg-warning animate-pulse": status === "low_stock",
        "bg-danger": status === "out_of_stock",
        "bg-gray-600": status === "unknown",
      })} />
      {AVAILABILITY_LABEL[status]}
    </span>
  );
}

export default function ResultsTable({ results, query }: Props) {
  if (!results.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">Aucun résultat pour <span className="font-mono text-gray-300">{query}</span></p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-600">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-700 text-gray-400 text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-3 font-medium">Source</th>
            <th className="text-left px-4 py-3 font-medium">Marque</th>
            <th className="text-left px-4 py-3 font-medium">Référence</th>
            <th className="text-left px-4 py-3 font-medium">Éq. OEM</th>
            <th className="text-right px-4 py-3 font-medium">Prix HT</th>
            <th className="text-left px-4 py-3 font-medium">Disponibilité</th>
            <th className="text-right px-4 py-3 font-medium">Stock</th>
            <th className="text-left px-4 py-3 font-medium">Délai</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, i) => (
            <tr
              key={`${row.source}-${row.reference}-${i}`}
              className={clsx(
                "border-t border-surface-600 transition-colors",
                row.isBestOffer
                  ? "bg-amber-400/5 hover:bg-amber-400/10"
                  : "hover:bg-surface-700"
              )}
            >
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded bg-surface-600 text-gray-300 text-xs font-mono">
                  {SOURCE_LABEL[row.source]}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-gray-200">{row.brand}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-white">{row.reference}</span>
                  {row.isBestOffer && <BestOfferBadge />}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                {row.equivalentRef ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {row.priceHT !== null ? (
                  <span className={clsx("font-semibold font-mono", row.isBestOffer ? "text-amber-400" : "text-white")}>
                    {row.priceHT.toFixed(2)} €
                  </span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <AvailabilityDot status={row.availability} />
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-300">
                {row.stockQty !== null ? row.stockQty : "—"}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {row.deliveryDelay ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
