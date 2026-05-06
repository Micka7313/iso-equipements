"use client";

import { useEffect, useState } from "react";

interface StatusData {
  dasirConfigured: boolean;
  erpConfigured: boolean;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function StatusIndicator() {
  const [status, setStatus] = useState<StatusData | null>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const dot = (on: boolean | undefined) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
        on ? "bg-success" : "bg-danger"
      }`}
    />
  );

  return (
    <div className="flex items-center gap-4 text-xs text-gray-400">
      <span className="flex items-center">
        {dot(status?.dasirConfigured)}
        Dasir B2B
      </span>
      <span className="flex items-center">
        {dot(status?.erpConfigured)}
        ERP
      </span>
    </div>
  );
}
