import './globals.css'; 
import { Geist, Geist_Mono } from "next/font/google";

export const metadata = {
  title: '문명 게임',
  description: '육각형 타일 기반 웹 브라우저 턴제 전략 게임',
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}