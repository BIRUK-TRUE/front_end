import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LocalePage() {
  redirect('/en/login');
}
