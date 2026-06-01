import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "FORMED — Private Personal Training, Delivered",
    template: "%s | FORMED",
  },
  description:
    "Private, in-home personal training for busy professionals in Tampa Bay. Certified trainers. Equipment included. No gym required.",
  keywords: [
    "personal training Tampa Bay",
    "in-home personal trainer Tampa",
    "private personal training Tampa",
    "home personal trainer",
  ],
  openGraph: {
    title: "FORMED — Private Personal Training, Delivered",
    description:
      "Private, in-home personal training for Tampa Bay professionals.",
    url: "https://formed.fit",
    siteName: "FORMED",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased grain">{children}</body>
    </html>
  );
}