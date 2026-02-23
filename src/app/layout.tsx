import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "아이디어마켓 - AI 기반 아이디어 저작권 보호 & 거래 플랫폼",
  description: "AI로 생성된 혁신적인 아이디어를 업로드하고, 저작권을 보호받으며, 구매자와 연결되는 대한민국 대표 아이디어 마켓플레이스",
  keywords: "아이디어 마켓, AI 아이디어, 저작권 보호, 아이디어 거래, 혁신, 스타트업",
  openGraph: {
    title: "아이디어마켓 - AI 기반 아이디어 저작권 보호 & 거래 플랫폼",
    description: "혁신적인 아이디어를 보호하고 거래하는 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
