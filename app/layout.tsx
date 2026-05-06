import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-public-sans',
});

export const metadata: Metadata = {
  title: 'PDF > Digital Form Transformer',
  description:
    'Convert PDF forms to digital forms for the City and County of San Francisco',
  openGraph: {
    title: 'PDF > Digital Form Transformer',
    description:
      'Convert PDF forms to digital forms for the City and County of San Francisco',
    siteName: 'City and County of San Francisco',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${publicSans.variable}`} style={{ fontFamily: 'var(--font-public-sans), Arial, sans-serif' }}>
      <body className="min-h-full flex flex-col bg-[#fcfcfc] text-[#0b0c0c]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-[#1b519e] focus:underline focus:outline-none focus:ring-2 focus:ring-[#1b519e]"
        >
          Skip to main content
        </a>

        <header className="bg-white" style={{ borderBottom: '4px solid #005695' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ccsf-seal.svg"
              alt="City and County of San Francisco seal"
              width={36}
              height={36}
              className="shrink-0"
            />
            <span className="text-xl font-bold text-[#0b0c0c] tracking-tight">
              City &amp; County of San Francisco
            </span>
          </div>
        </header>

        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* ARIA live region for screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          id="aria-announcer"
          className="sr-only"
        />
      </body>
    </html>
  );
}
