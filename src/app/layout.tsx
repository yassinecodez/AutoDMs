import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoDMs - Instagram Comment-to-DM Automation",
  description: "Turn your Instagram comments into sales. Automatically send direct messages, links, and promo codes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[#000000] text-zinc-100 selection:bg-white/20 selection:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
