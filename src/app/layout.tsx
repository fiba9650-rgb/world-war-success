import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 💡 Geist 대신 가장 안전한 기본 폰트(Inter)로 변경!
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WARBOARD - 실시간 상황판",
  description: "실시간 전쟁 및 국제 분쟁 상황판",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}