import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management system for Ethiopian schools',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as 'en' | 'am')) {
    notFound();
  }

  // Load messages for the current locale using next-intl server API
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={locale} className={locale === 'am' ? 'font-amharic' : ''}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
