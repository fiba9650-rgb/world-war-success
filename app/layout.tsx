import type { Metadata } from "next";
// next/font/google 대신 우리가 설치한 geist 패키지를 직접 사용합니다.
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "WARBOARD | 실시간 전쟁 상황판",
  description: "실시간 전쟁 및 국제 분쟁 상황을 모니터링합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className={`${GeistSans.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}