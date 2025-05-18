import type { Metadata } from 'next';
import { Syne_Mono } from 'next/font/google';
import './globals.css';

import cn from '@/lib/cn';

const syneMono = Syne_Mono({
  variable: '--font-default',
  weight: ['400'],
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'App | Dash Mon[k]ey',
  description: 'A virtual embodiment of your (financial) health',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/img/circus-monkey.svg" />
      <body
        className={cn(
          syneMono.variable,
          'font-default',
          'antialiased',
        )}
      >
        {children}
      </body>
    </html>
  );
}
