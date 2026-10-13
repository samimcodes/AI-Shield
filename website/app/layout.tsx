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
  title: 'AI-Shield | Stop AI Bots. Feed Them Poison Instead.',
  description:
    'A drop-in middleware that serves synthetic garbage to scrapers with HTTP 200 OK, protecting your IP while keeping SEO untouched.',
  keywords: [
    'ai crawler protection',
    'bot detection',
    'data poisoning',
    'anti-scraper',
    'gptbot blocker',
    'seo safe bot protection',
    'nextjs middleware',
    'express middleware',
  ],
  authors: [{ name: 'AI-Shield Security' }],
};

export const viewport = {
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
