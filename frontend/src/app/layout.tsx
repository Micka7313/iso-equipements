import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Magasinier — ISO Équipements",
  description: "Comparateur de prix et stocks pièces auto B2B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-surface-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
