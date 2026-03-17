import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepPilotAI — Precision Nutrition",
  description: "Precision nutrition built for performance. AI-generated meal plans for serious athletes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PrepPilotAI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
