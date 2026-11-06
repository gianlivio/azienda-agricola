import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azienda Agricola Angilletti · Comiso",
  description:
    "Visita in 3D dell'Azienda Agricola Angilletti a Comiso: la serra dei mirtilli, il campo di mais, l'uliveto e il frantoio, con Andrea Angilletti.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0C10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preload" href="/fonts/newsreader-latin-300-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ibm-plex-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
