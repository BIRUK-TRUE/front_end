'use client';

import { cn } from '@/lib/utils';

/** Render simple markdown: **bold**, line breaks, numbered lists */
function parseInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface AssistantMessageProps {
  content: string;
  className?: string;
}

export function AssistantMessage({ content, className }: AssistantMessageProps) {
  const lines = content.split('\n');

  return (
    <div className={cn('space-y-1.5', className)}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <div key={lineIdx} className="flex gap-2 pl-0.5">
              <span className="shrink-0 font-medium text-primary/80">{numbered[1]}.</span>
              <span>{parseInline(numbered[2], `l${lineIdx}`)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <div key={lineIdx} className="flex gap-2 pl-0.5">
              <span className="shrink-0 text-muted-foreground">•</span>
              <span>{parseInline(trimmed.slice(2), `l${lineIdx}`)}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className={cn(trimmed.startsWith('**') && 'mt-1 first:mt-0')}>
            {parseInline(trimmed, `l${lineIdx}`)}
          </p>
        );
      })}
    </div>
  );
}
