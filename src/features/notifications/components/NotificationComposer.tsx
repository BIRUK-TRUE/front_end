'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Send, 
  Eye, 
  Clock, 
  Bell, 
  Mail, 
  MessageSquare,
  Users,
  Loader2
} from 'lucide-react';
import { AudienceSelector } from './AudienceSelector';
import { useNotificationComposer } from '../api/useNotificationComposer';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function NotificationComposer() {
  const t = useTranslations('notifications.compose');
  const { previewRecipients, sendNotification } = useNotificationComposer();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all_students',
    targetIds: [] as string[],
    channels: ['in_app'] as ('in_app' | 'sms' | 'email')[],
    scheduledAt: null as string | null,
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [recipientPreview, setRecipientPreview] = useState<{ count: number; sampleNames: string[] } | null>(null);

  // Update recipient count when audience changes
  useEffect(() => {
    if (formData.targetType) {
      previewRecipients.mutate(
        { targetType: formData.targetType, targetIds: formData.targetIds },
        { onSuccess: (data) => setRecipientPreview(data) }
      );
    }
  }, [formData.targetType, formData.targetIds]);

  const handleSend = () => {
    sendNotification.mutate({
      ...formData,
      targetType: formData.targetType as any,
    });
  };

  const isFormValid = formData.title && formData.message && formData.channels.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 pt-8 pb-6 border-b">
            <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('messageTitle')}</Label>
                <Input 
                  id="title"
                  placeholder={t('messageTitlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 rounded-xl border-muted-foreground/20 text-base font-semibold focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('messageBody')}</Label>
                <Textarea 
                  id="message"
                  placeholder={t('messageBodyPlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[200px] rounded-2xl border-muted-foreground/20 p-4 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <div className="pt-8 border-t space-y-6">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('channels')}</Label>
               <div className="flex flex-wrap gap-6">
                 {['in_app', 'sms', 'email'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10 hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        id={`comp-channel-${channel}`} 
                        checked={formData.channels.includes(channel as any)}
                        disabled={channel === 'in_app'}
                        onCheckedChange={(checked) => {
                          const current = formData.channels;
                          setFormData({
                            ...formData,
                            channels: checked 
                              ? [...current, channel as any] 
                              : current.filter(c => c !== channel)
                          });
                        }}
                      />
                      <label htmlFor={`comp-channel-${channel}`} className="flex items-center gap-2 cursor-pointer select-none">
                         {channel === 'in_app' && <Bell className="h-4 w-4 text-primary" />}
                         {channel === 'sms' && <MessageSquare className="h-4 w-4 text-primary" />}
                         {channel === 'email' && <Mail className="h-4 w-4 text-primary" />}
                         <span className="font-bold text-sm">{t(`notifications.alertRules.channelTypes.${channel}`)}</span>
                      </label>
                    </div>
                 ))}
               </div>
            </div>

            <div className="pt-8 border-t space-y-6">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('schedule')}</Label>
              <RadioGroup 
                defaultValue="now" 
                onValueChange={(val) => setFormData({ ...formData, scheduledAt: val === 'later' ? new Date().toISOString() : null })}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10">
                  <RadioGroupItem value="now" id="schedule-now" />
                  <label htmlFor="schedule-now" className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                    <Send className="h-4 w-4" />
                    {t('sendNow')}
                  </label>
                </div>
                <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10">
                  <RadioGroupItem value="later" id="schedule-later" />
                  <label htmlFor="schedule-later" className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    {t('scheduleLater')}
                  </label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 px-8 py-6 border-t flex justify-between gap-4">
             <Button 
                variant="outline" 
                className="h-12 rounded-xl px-6 gap-2 font-bold"
                onClick={() => setIsPreviewOpen(true)}
             >
               <Eye className="h-4 w-4" />
               {t('preview')}
             </Button>
             <Button 
                className="h-12 rounded-xl px-10 gap-2 font-black shadow-lg shadow-primary/20"
                disabled={!isFormValid || sendNotification.isPending}
                onClick={handleSend}
             >
               {sendNotification.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
               {sendNotification.isPending ? t('sending') : t('send')}
             </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
             <CardTitle className="text-sm font-bold flex items-center gap-2">
               <Users className="h-4 w-4 text-primary" />
               {t('audience')}
             </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <AudienceSelector 
                selectedType={formData.targetType}
                selectedIds={formData.targetIds}
                onTypeChange={(type) => setFormData({ ...formData, targetType: type })}
                onTargetChange={(ids) => setFormData({ ...formData, targetIds: ids })}
             />
          </CardContent>
          {recipientPreview && (
            <CardFooter className="bg-primary/5 p-4 flex flex-col items-start gap-2 border-t">
               <p className="text-sm font-black text-primary uppercase tracking-widest">{t('recipientCount', { count: recipientPreview.count })}</p>
               {recipientPreview.sampleNames.length > 0 && (
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                   {t('sampleRecipients', { names: recipientPreview.sampleNames.join(', ') })}
                 </p>
               )}
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="bg-primary px-6 py-6 text-white text-left">
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                 <Bell className="h-6 w-6" />
                 {t('previewTitle')}
              </DialogTitle>
           </DialogHeader>
           <div className="bg-slate-50 p-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
                 <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                    <p className="text-primary font-bold text-sm tracking-tight">{formData.title || t('previewUntitled')}</p>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t('previewJustNow')}</span>
                 </div>
                 <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{formData.message || t('previewNoMessage')}</p>
                 </div>
                 {recipientPreview && (
                   <div className="px-5 py-3 bg-slate-50 border-t flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-slate-200 border border-white -ml-2 first:ml-0" />
                      <div className="h-6 w-6 rounded-full bg-slate-200 border border-white -ml-2" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        + {recipientPreview.count - 2} more recipients
                      </p>
                   </div>
                 )}
              </div>
           </div>
           <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-xl h-11 px-6 font-bold">{t('notifications.center.emptySubtitle')}</Button>
              <Button onClick={() => setIsPreviewOpen(false)} className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20">{t('backToEditor')}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
