import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

type ResetPasswordRedirectProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordRedirect({
  searchParams,
}: ResetPasswordRedirectProps) {
  const { token } = await searchParams;
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  redirect(`/${routing.defaultLocale}/reset-password${query}`);
}
