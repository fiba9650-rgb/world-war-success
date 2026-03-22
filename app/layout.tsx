import type { Metadata } from "next";
// next/font/google 대신 아래 패키지를 임포트합니다.
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "WARBOARD | 실시간 전쟁 상황판",
  description: "실시간 전쟁 및 국제 분쟁 상황 모니터링",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      // 설치한 패키지의 variable을 사용하여 CSS 변수를 연결합니다.
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className={`${GeistSans.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}