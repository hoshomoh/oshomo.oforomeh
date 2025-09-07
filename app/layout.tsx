import React from 'react';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col min-h-screen ${fontSans.variable} ${fontMono.variable} font-mono antialiased `}
      >
        <ThemeProvider>
          {/* Page content */}
          <div className="flex-1">{children}</div>

          {/* Footer */}
          <footer className="border-t mt-8 py-4 text-sm text-center text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Oshomo Oforomeh. All rights reserved.{' '}
              <Link href="/privacy-policy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
