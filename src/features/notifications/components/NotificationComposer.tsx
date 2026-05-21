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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Eye, 
  Clock, 
  Bell, 
  Mail, 
  MessageSquare,
  Users,
  Loader2,
} from 'lucide-react';
import { AudienceSelector } from './AudienceSelector';
import { useNotificationComposer } from '../api/useNotificationComposer';
import { NOTIFICATION_TEMPLATES } from '../constants/templates';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function NotificationComposer() {
  const t = useTranslations('notifications.compose');
  const tc = useTranslations('common');
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');

  // Update recipient count when audience changes
  useEffect(() => {
    if (formData.targetType) {
      previewRecipients.mutate(
        { targetType: formData.targetType, targetIds: formData.targetIds },
        { onSuccess: (data) => setRecipientPreview(data) }
      );
    }
  }, [formData.targetType, formData.targetIds]);

  const handleTemplateSelect = (templateName: string) => {
    if (templateName === 'none') {
      setFormData({
        ...formData,
        title: '',
        message: '',
      });
      setSelectedTemplate('none');
      return;
    }
    const template = NOTIFICATION_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        message: template.message,
      });
      setSelectedTemplate(templateName);
    }
  };

  const handleSend = () => {
    sendNotification.mutate({
      ...formData,
      targetType: formData.targetType as any,
    });
  };

  const isFormValid = formData.title && formData.message && formData.channels.length > 0;
  const charCount = formData.message.length;
  const smsSegments = Math.ceil(charCount / 160);
  const isSmsSelected = formData.channels.includes('sms');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('composeMessage')}</CardTitle>
            <CardDescription>{t('composeDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selector */}
            <div className="space-y-2">
              <Label htmlFor="template">{t('template')}</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger id="template">
                  <SelectValue placeholder={t('selectTemplate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noTemplate')}</SelectItem>
                  {NOTIFICATION_TEMPLATES.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('messageTitle')}</Label>
                <Input 
                  id="title"
                  placeholder={t('messageTitlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">{t('messageBody')}</Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isSmsSelected && (
                      <>
                        <span>{charCount} / 160</span>
                        {smsSegments > 1 && (
                          <span className="text-orange-500">{smsSegments} segments</span>
                        )}
                      </>
                    )}
                    {!isSmsSelected && (
                      <span>{charCount} chars</span>
                    )}
                  </div>
                </div>
                <Textarea 
                  id="message"
                  placeholder={t('messageBodyPlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[150px] resize-none"
                />
                {isSmsSelected && charCount > 160 && (
                  <p className="text-xs text-orange-500">
                    {t('smsWarning', { segments: smsSegments })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
               <Label>{t('channels')}</Label>
               <div className="space-y-3">
                 {['in_app', 'sms', 'email'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
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
                      <label htmlFor={`comp-channel-${channel}`} className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                         {channel === 'in_app' && <Bell className="h-4 w-4" />}
                         {channel === 'sms' && <MessageSquare className="h-4 w-4" />}
                         {channel === 'email' && <Mail className="h-4 w-4" />}
                         <span>{t(`notifications.alertRules.channelTypes.${channel}`)}</span>
                      </label>
                    </div>
                 ))}
               </div>
               {isSmsSelected && recipientPreview && (
                 <p className="text-xs text-muted-foreground">
                   {t('estimatedCost', { count: recipientPreview.count, cost: (recipientPreview.count * 0.5).toFixed(2) })}
                 </p>
               )}
            </div>

            <div className="space-y-3">
              <Label>{t('schedule')}</Label>
              <RadioGroup 
                defaultValue="now" 
                onValueChange={(val) => setFormData({ ...formData, scheduledAt: val === 'later' ? new Date().toISOString() : null })}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="now" id="schedule-now" />
                  <label htmlFor="schedule-now" className="flex items-center gap-2 cursor-pointer text-sm font-medium flex-1">
                    <Send className="h-4 w-4" />
                    {t('sendNow')}
                  </label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="later" id="schedule-later" />
                  <label htmlFor="schedule-later" className="flex items-center gap-2 cursor-pointer text-sm font-medium flex-1">
                    <Clock className="h-4 w-4" />
                    {t('scheduleLater')}
                  </label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
             <Button 
                variant="outline" 
                onClick={() => setIsPreviewOpen(true)}
             >
               <Eye className="h-4 w-4 mr-2" />
               {t('preview')}
             </Button>
             <Button 
                disabled={!isFormValid || sendNotification.isPending}
                onClick={handleSend}
             >
               {sendNotification.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
               {sendNotification.isPending ? t('sending') : t('send')}
             </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
             <CardTitle className="text-base flex items-center gap-2">
               <Users className="h-4 w-4" />
               {t('audience')}
             </CardTitle>
          </CardHeader>
          <CardContent>
             <AudienceSelector 
                selectedType={formData.targetType}
                selectedIds={formData.targetIds}
                onTypeChange={(type) => setFormData({ ...formData, targetType: type })}
                onTargetChange={(ids) => setFormData({ ...formData, targetIds: ids })}
             />
          </CardContent>
          {recipientPreview && (
            <CardFooter className="flex flex-col items-start gap-1 border-t bg-muted/30">
               <p className="text-sm font-semibold">{t('recipientCount', { count: recipientPreview.count })}</p>
               {recipientPreview.sampleNames.length > 0 && (
                 <p className="text-xs text-muted-foreground">
                   {t('sampleRecipients', { names: recipientPreview.sampleNames.join(', ') })}
                 </p>
               )}
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[450px]">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                 <Bell className="h-5 w-5" />
                 {t('previewTitle')}
              </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                 <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
                    <p className="font-semibold text-sm">{formData.title || t('previewUntitled')}</p>
                    <span className="text-xs text-muted-foreground">{t('previewJustNow')}</span>
                 </div>
                 <div className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{formData.message || t('previewNoMessage')}</p>
                 </div>
                 {recipientPreview && (
                   <div className="px-4 py-3 bg-muted/30 border-t flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted border -ml-2 first:ml-0" />
                      <div className="h-6 w-6 rounded-full bg-muted border -ml-2" />
                      <p className="text-xs text-muted-foreground">
                        + {recipientPreview.count - 2} more recipients
                      </p>
                   </div>
                 )}
              </div>
           </div>
           <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>{tc('close')}</Button>
              <Button onClick={() => setIsPreviewOpen(false)}>{t('backToEditor')}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
