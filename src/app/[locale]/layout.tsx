import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management system for Ethiopian schools',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={locale} className={locale === 'am' ? 'font-amharic' : ''}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
