'use client';

import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCcw, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Loader2,
  Bell
} from 'lucide-react';
import { useNotificationDetail, useRetryFailed } from '../api/useNotificationHistory';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NotificationHistoryDetailProps {
  notificationId: string | null;
  onClose: () => void;
}

export function NotificationHistoryDetail({ notificationId, onClose }: NotificationHistoryDetailProps) {
  const t = useTranslations('notifications.history');
  const { data: detail, isLoading } = useNotificationDetail(notificationId || '');
  const retryFailed = useRetryFailed();

  if (!notificationId) return null;

  return (
    <Dialog open={!!notificationId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-primary px-8 py-8 text-white text-left shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
               <Bell className="h-6 w-6" />
               {t('detail.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-primary-foreground/80 mt-2 font-medium">
             Sent on {detail && format(new Date(detail.sent_at), 'MMMM dd, yyyy HH:mm')} by {detail?.sent_by_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
           {isLoading ? (
             <div className="flex h-32 items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           ) : (
             <>
               <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('detail.message')}</h4>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <p className="font-bold text-slate-800 mb-2">{detail?.title}</p>
                     <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{detail?.full_message}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('detail.deliveryStatus')}</h4>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5">
                         <div className="h-2 w-2 rounded-full bg-green-500" />
                         <span className="text-xs font-bold text-slate-700">{detail?.status.delivered} {t('detail.delivered')}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className="h-2 w-2 rounded-full bg-amber-500" />
                         <span className="text-xs font-bold text-slate-700">{detail?.status.pending} {t('detail.pending')}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className="h-2 w-2 rounded-full bg-red-500" />
                         <span className="text-xs font-bold text-slate-700">{detail?.status.failed} {t('detail.failed')}</span>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[10px] font-black uppercase tracking-tighter pl-6">{t('table.recipient')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-tighter text-center">{t('table.status')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-tighter pr-6 text-right">{t('table.viewDetails')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail?.recipients.map((recipient) => (
                          <TableRow key={recipient.id} className="hover:bg-slate-50/50">
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-slate-700">{recipient.recipient_name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">{recipient.recipient_role}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {recipient.status === 'delivered' && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                              {recipient.status === 'pending' && <Clock className="h-4 w-4 text-amber-500 mx-auto" />}
                              {recipient.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              {recipient.delivered_at && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {t('table.sentBy')} {format(new Date(recipient.delivered_at), 'HH:mm')}
                                </span>
                              )}
                              {recipient.error_message && (
                                <span className="text-[10px] font-bold text-red-400 truncate max-w-[120px] block">
                                  {recipient.error_message}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </div>
             </>
           )}
        </div>

        <DialogFooter className="px-8 py-4 bg-slate-50 border-t shrink-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 px-6 font-bold">{t('notifications.center.emptySubtitle')}</Button>
          <Button 
            className="rounded-xl h-11 px-6 gap-2 font-black shadow-lg shadow-primary/20"
            disabled={!detail || detail.status.failed === 0 || retryFailed.isPending}
            onClick={() => detail && retryFailed.mutate(detail.id)}
          >
            {retryFailed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {t('detail.retryFailed')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
