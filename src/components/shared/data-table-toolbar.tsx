'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 pl-9"
              aria-label={searchPlaceholder}
            />
          </div>
          {children && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
