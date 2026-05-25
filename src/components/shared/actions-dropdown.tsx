'use client';

import { LucideIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ActionDropdownItem {
  label: string;
  icon: LucideIcon;
  href?: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function ActionsDropdown({
  items,
  label = 'Open actions',
}: {
  items: ActionDropdownItem[];
  label?: string;
}) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={label}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="min-w-44">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </>
          );

          if (item.href) {
            return (
              <DropdownMenuItem
                key={item.label}
                asChild
                disabled={item.disabled}
                className={cn('gap-2', item.destructive && 'text-destructive focus:text-destructive')}
              >
                {item.href}
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onSelect}
              disabled={item.disabled}
              className={cn('gap-2', item.destructive && 'text-destructive focus:text-destructive')}
            >
              {content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
