import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vantrex Class — Ruang Belajar Digital",
  description: "Platform pembelajaran online Vantrex Class."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
