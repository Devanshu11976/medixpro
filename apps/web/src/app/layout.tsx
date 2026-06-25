import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Medixpro — Wholesale Medical ERP",
    template: "%s | Medixpro"
  },
  description: "Medixpro is a comprehensive wholesale medical store ERP system for managing inventory, orders, retailer accounts, and billing operations.",
  keywords: ["medical ERP", "wholesale pharmacy", "inventory management", "medical store", "pharmacy software", "retailer management"],
  authors: [{ name: "Medixpro Team" }],
  creator: "Medixpro",
  publisher: "Medixpro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://medixpro.vercel.app",
    title: "Medixpro — Wholesale Medical ERP",
    description: "Comprehensive wholesale medical store ERP system for managing inventory, orders, and retailer accounts.",
    siteName: "Medixpro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medixpro — Wholesale Medical ERP",
    description: "Comprehensive wholesale medical store ERP system for managing inventory, orders, and retailer accounts.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
