import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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

  // Load messages for the current locale using next-intl server API
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={locale} className={locale === 'am' ? 'font-amharic' : ''}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
