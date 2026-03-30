'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  text,
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <Loader2
        className={`${sizes[size]} animate-spin text-primary`}
        aria-hidden="true"
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex h-[50vh] items-center justify-center">{content}</div>
    );
  }

  return content;
}
