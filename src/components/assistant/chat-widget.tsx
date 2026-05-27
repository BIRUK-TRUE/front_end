'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import {
  Bot,
  MessageCircle,
  Minimize2,
  SendHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { assistantService, type ChatHistoryItem } from '@/lib/api/assistant.service';
import { AssistantMessage } from '@/components/assistant/assistant-message';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPT_KEYS = ['enroll', 'attendance', 'grades', 'payments'] as const;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const t = useTranslations('assistant');
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userInitials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('welcome'),
        },
      ]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      const history: ChatHistoryItem[] = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const reply = await assistantService.chat({
          message: text,
          history,
          current_page: pathname,
          locale,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: reply,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t('error'),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, t, messages, pathname, locale]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const showQuickPrompts =
    messages.length === 1 && messages[0]?.id === 'welcome' && !loading;

  return (
    <>
      {open && (
        <div
          className={cn(
            'fixed bottom-24 right-4 z-50 flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden',
            'rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl',
            'animate-in slide-in-from-bottom-6 fade-in zoom-in-95 duration-300'
          )}
          role="dialog"
          aria-label={t('title')}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 px-4 py-4 text-primary-foreground">
            <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 right-16 size-20 rounded-full bg-white/5" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30">
                    <Sparkles className="size-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-primary bg-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold tracking-tight">{t('title')}</p>
                  <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                    <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    {t('online')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  aria-label={t('minimize')}
                  className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                >
                  <Minimize2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  aria-label={t('close')}
                  className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[min(420px,50vh)] bg-gradient-to-b from-muted/30 to-background">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2.5',
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar size="sm" className="mt-0.5 shrink-0">
                      <AvatarFallback
                        className={cn(
                          'text-[10px] font-semibold',
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary'
                        )}
                      >
                        {isUser ? userInitials : <Bot className="size-3.5" />}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'flex max-w-[78%] flex-col gap-1',
                        isUser ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                          isUser
                            ? 'rounded-tr-md bg-primary text-primary-foreground whitespace-pre-wrap'
                            : 'rounded-tl-md border border-border/50 bg-card text-foreground'
                        )}
                      >
                        {isUser ? (
                          message.content
                        ) : (
                          <AssistantMessage content={message.content} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2.5">
                  <Avatar size="sm" className="mt-0.5 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                      <Bot className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-2 shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              {showQuickPrompts && (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('quickPrompts')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPT_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => void sendMessage(t(`prompts.${key}`))}
                        className={cn(
                          'rounded-full border border-border/60 bg-background px-3 py-1.5',
                          'text-xs text-foreground shadow-sm transition-all',
                          'hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                          'active:scale-95'
                        )}
                      >
                        {t(`prompts.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur-sm">
            <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                rows={1}
                className="min-h-[40px] max-h-28 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                aria-label={t('send')}
                className={cn(
                  'size-9 shrink-0 rounded-lg transition-all',
                  input.trim() && !loading && 'shadow-md shadow-primary/25'
                )}
              >
                <SendHorizontal className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {t('poweredBy')}
            </p>
          </div>
        </div>
      )}

      {/* Floating launcher */}
      <div className="fixed bottom-4 right-4 z-50">
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        )}
        <Button
          size="icon-lg"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? t('close') : t('open')}
          className={cn(
            'relative size-14 rounded-full shadow-xl shadow-primary/30 transition-all duration-300',
            'bg-gradient-to-br from-primary to-blue-600 hover:scale-105 hover:shadow-primary/40',
            open && 'scale-95 bg-muted text-muted-foreground shadow-none hover:scale-100 hover:bg-muted/80'
          )}
        >
          {open ? (
            <X className="size-6" />
          ) : (
            <MessageCircle className="size-6" />
          )}
        </Button>
      </div>
    </>
  );
}
