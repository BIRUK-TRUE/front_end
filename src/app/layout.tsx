import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management system for Ethiopian schools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="antialiased font-sans">
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </Providers>

        <Script
          src="https://agents.dante-ai.com/embed.js"
          data-agent-id="3a13bc3a-d7d2-4b32-a265-55304ff48f4a"
          data-widget-key="wk_bGFYIzCoXu958XkV4Tkqj8X9bMdHr3n3"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

