import type { Metadata } from "next";
// 1. Geist 폰트 임포트 (Next.js 최신 버전 기준)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 2. 폰트 인스턴스 생성
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      {/* 3. body 태그에 생성한 폰트 변수들을 적용합니다. */}
      {/* className에 `${geistSans.variable} ${geistMono.variable}`를 추가하고, 
          기본 폰트로 geistSans.className을 사용합니다. */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}