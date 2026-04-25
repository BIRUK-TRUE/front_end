'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  RefreshCcw, 
  Search, 
  Filter, 
  ChevronRight,
  Zap,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNotificationHistory } from '../api/useNotificationHistory';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface NotificationHistoryProps {
  onViewDetails: (id: string) => void;
}

export function NotificationHistory({ onViewDetails }: NotificationHistoryProps) {
  const t = useTranslations('notifications.history');
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useNotificationHistory(filters);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('searchPlaceholder')} 
                className="pl-9 h-10 w-full md:w-64 rounded-xl border-muted-foreground/20"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-muted-foreground/20">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[180px] font-bold text-xs uppercase tracking-widest pl-6">{t('table.date')}</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest">{t('table.title')}</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest">{t('table.type')}</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest">{t('table.recipients')}</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest">{t('table.status')}</TableHead>
              <TableHead className="text-right pr-6 font-bold text-xs uppercase tracking-widest">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Clock className="h-12 w-12 mb-4 opacity-10" />
                    <p className="text-sm">{t('noHistory')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell className="pl-6 font-medium text-slate-600">
                    {format(new Date(item.sent_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{item.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">{item.message_preview}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1.5">
                       {item.type === 'automatic' ? (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Zap className="h-3 w-3 mr-1" />
                            {t('filters.automatic')}
                          </Badge>
                       ) : (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            <User className="h-3 w-3 mr-1" />
                            {t('filters.manual')}
                          </Badge>
                       )}
                     </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-600">
                    {item.recipient_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-black text-green-600">{item.status.delivered} {t('table.statusOk')}</span>
                          <span className="text-[10px] uppercase font-black text-red-600">{item.status.failed} {t('table.statusErr')}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 gap-2 rounded-xl border border-transparent hover:border-muted-foreground/20 hover:bg-white transition-all font-bold text-xs"
                      onClick={() => onViewDetails(item.id)}
                    >
                      {t('table.viewDetails')}
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
