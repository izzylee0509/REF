import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EO Reference",
  description: "EO 디자인팀 레퍼런스 공유",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  );
}
