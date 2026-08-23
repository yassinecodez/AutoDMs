import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
