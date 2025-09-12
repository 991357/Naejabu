import type { Metadata } from "next";
import { Roboto, Poppins, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-roboto',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-poppins',
});

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-nanum-myeongjo',
});

export const metadata: Metadata = {
  title: "내자부 - 내 자소서를 부탁해",
  description: "AI 자소서 작성 도우미",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${roboto.variable} ${poppins.variable} ${nanumMyeongjo.variable} font-body bg-secondary text-text`}>{children}</body>
    </html>
  );
}
