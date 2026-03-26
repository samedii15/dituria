import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";

import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dituria Islame",
  description:
    "Platforme moderne e diturise islame ne shqip: hadithe, fikh, lutje, kuran, akide dhe histori te pejgambereve.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="mt-20 border-t border-[var(--border)] py-8 text-center text-sm muted">
          <div className="shell">Dituria Islame ne Shqip</div>
        </footer>
      </body>
    </html>
  );
}
