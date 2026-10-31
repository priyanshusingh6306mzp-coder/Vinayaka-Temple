import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/content/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["600"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${SITE_CONFIG.name} (${SITE_CONFIG.nameHindi}) - Sector 62, Noida`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Vinayaka Temple Noida",
    "Ganesh Temple Sector 62",
    "JSS University Temple",
    "Pooja Booking Noida",
    "South Indian Chola Architecture Noida",
  ],
  openGraph: {
    title: `${SITE_CONFIG.name} - Noida Sector 62`,
    description: SITE_CONFIG.description,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: SITE_CONFIG.name,
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F0E4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${notoDevanagari.variable} scroll-smooth`}
    >
      <body className="font-sans min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
