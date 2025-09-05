import React from 'react';
import Link from 'next/link';

import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen font-mono">
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
      </body>
    </html>
  );
}
