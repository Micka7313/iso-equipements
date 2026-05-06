"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"dasir" | "erp">("dasir");

  const Tab = ({ id, label }: { id: "dasir" | "erp"; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
        activeTab === id
          ? "bg-brand text-black font-semibold"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
          <h2 className="text-lg font-semibold">Configuration</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-4">
          <div className="flex gap-2 mb-6">
            <Tab id="dasir" label="Dasir B2B" />
            <Tab id="erp" label="ERP" />
          </div>

          {activeTab === "dasir" && (
            <div className="space-y-4">
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 text-sm text-amber-300">
                Les identifiants sont stockés dans le fichier <code className="font-mono bg-surface-700 px-1 rounded">.env</code> du serveur,
                jamais en base de données ni transmis au navigateur.
              </div>
              <ConfigField label="URL du portail" value={process.env.NEXT_PUBLIC_DASIR_URL ?? "https://b2b.dasirweb.fr/"} readOnly />
              <ConfigField label="Identifiant" value="Défini dans .env → DASIR_USERNAME" readOnly />
              <ConfigField label="Mot de passe" value="Défini dans .env → DASIR_PASSWORD" readOnly />
            </div>
          )}

          {activeTab === "erp" && (
            <div className="space-y-4">
              <div className="bg-surface-700 border border-surface-500 rounded-lg p-3 text-sm text-gray-400">
                Configurez votre ERP via les variables d'environnement backend.
                Le module <code className="font-mono bg-surface-600 px-1 rounded">backend/src/services/erp.ts</code> est prêt à être adapté.
              </div>
              <ConfigField label="URL de l'API ERP" value="Défini dans .env → ERP_API_URL" readOnly />
              <ConfigField label="Clé API" value="Défini dans .env → ERP_API_KEY" readOnly />
              <ConfigField label="Timeout (ms)" value="Défini dans .env → ERP_TIMEOUT_MS (défaut: 5000)" readOnly />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-surface-600 text-xs text-gray-500">
          Redémarrez le serveur backend après toute modification du fichier <code className="font-mono">.env</code>.
        </div>
      </div>
    </div>
  );
}

function ConfigField({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        className="w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg
                   text-sm font-mono text-gray-300 focus:outline-none focus:border-brand
                   read-only:opacity-60 read-only:cursor-not-allowed"
      />
    </div>
  );
}
