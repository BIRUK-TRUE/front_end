'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
}

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`;~']/.test(password),
  };
}

function getStrengthScore(checks: ReturnType<typeof getPasswordChecks>) {
  return Object.values(checks).filter(Boolean).length;
}

function getStrengthLabel(score: number): 'weak' | 'fair' | 'good' | 'strong' {
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
}

const strengthColors: Record<string, string> = {
  weak: 'bg-destructive',
  fair: 'bg-warning',
  good: 'bg-info',
  strong: 'bg-success',
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useTranslations('auth');
  const checks = getPasswordChecks(password);
  const score = getStrengthScore(checks);
  const strength = getStrengthLabel(score);
  const progressValue = (score / 5) * 100;

  const requirements = [
    { key: 'minLength', label: t('minLength'), met: checks.minLength },
    { key: 'hasUppercase', label: t('hasUppercase'), met: checks.hasUppercase },
    { key: 'hasLowercase', label: t('hasLowercase'), met: checks.hasLowercase },
    { key: 'hasNumber', label: t('hasNumber'), met: checks.hasNumber },
    { key: 'hasSpecial', label: t('hasSpecial'), met: checks.hasSpecial },
  ];

  if (!password) return null;

  return (
    <div className="space-y-3" aria-label={t('passwordRequirements')}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('passwordStrength')}</span>
          <span
            className={cn(
              'font-medium',
              strength === 'weak' && 'text-destructive',
              strength === 'fair' && 'text-warning',
              strength === 'good' && 'text-info',
              strength === 'strong' && 'text-success'
            )}
          >
            {t(strength)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              strengthColors[strength]
            )}
            style={{ width: `${progressValue}%` }}
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t('passwordStrength')}: ${t(strength)}`}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1.5" aria-label={t('passwordRequirements')}>
        {requirements.map((req) => (
          <li
            key={req.key}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors',
              req.met ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {req.met ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{req.label}</span>
            <span className="sr-only">
              {req.met ? '- met' : '- not met'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { getPasswordChecks, getStrengthScore };
