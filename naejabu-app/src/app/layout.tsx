'use client';

import './globals.css';
import { ReactNode } from 'react';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import GlobalHeader from '../components/GlobalHeader';
import { AuthProvider } from '../context/AuthContext';
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-noto-sans-kr',
});

function AppContent({ children }: { children: ReactNode }) {
    const { isLoading } = useLoading();
    return (
        <>
            <LoadingSpinner isOpen={isLoading} />
            <GlobalHeader />
            <main className="pt-16">{children}</main>
        </>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} font-sans bg-secondary text-text`}>
        <AuthProvider>
          <LoadingProvider>
              <AppContent>{children}</AppContent>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}