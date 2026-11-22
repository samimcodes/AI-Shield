import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI-Shield | Stop AI Scrapers from Stealing Your Content. Automatically.',
  description:
    'Block or poison unauthorized AI bots in under 2ms with a single line of code. Preserve SEO while keeping your proprietary data safe.',
  keywords: [
    'ai scraper protection',
    'bot detection',
    'data poisoning',
    'anti-scraper',
    'gptbot blocker',
    'seo safe bot protection',
    'express middleware',
    'nextjs middleware',
  ],
  authors: [{ name: 'AI-Shield' }],
};

export const viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
