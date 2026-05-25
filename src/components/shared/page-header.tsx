'use client';

import { ReactNode } from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumb?: string[];
  action?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumb,
  action,
  actions,
  className,
}: PageHeaderProps) {
  const headerAction = action ?? actions;

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 space-y-2">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className={index === breadcrumb.length - 1 ? 'text-foreground' : undefined}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
        </div>
        {description && (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {headerAction && <div className="flex shrink-0 items-center gap-2">{headerAction}</div>}
    </div>
  );
}
