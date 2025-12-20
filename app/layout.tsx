import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import LenisProvider from "@/components/LenisProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lystré - Premium E-Commerce",
  description:
    "A premium e-commerce experience. Shop the latest trends in fashion, jewelry, and ready-to-wear collections.",
  keywords: [
    "clothing",
    "e-commerce",
    "fashion",
    "apparel",
    "online shopping",
    "jewelry",
    "luxury",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <LenisProvider>
          {children}
        </LenisProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

