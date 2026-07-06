import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project X Tuning — Curated Performance Parts",
  description:
    "Curated intake systems, exhaust, aero, and tuning packages. Starting with Eventuri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
