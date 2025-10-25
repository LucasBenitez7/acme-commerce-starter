// apps/web/app/layout.tsx
import "./globals.css";

import { fontMono, fontSans } from "./fonts";

import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "LSB Store";
const description = "E-commerce de prueba (starter) con Next.js";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: siteName,
    description,
    locale: "es_ES",
    images: [{ url: "/og.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`h-full ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-dvh text-foreground font-sans">{children}</body>
    </html>
  );
}
