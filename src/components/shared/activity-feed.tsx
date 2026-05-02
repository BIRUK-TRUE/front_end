'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Pencil, GraduationCap, History, UserPlus } from 'lucide-react';

import { useNotificationHistory } from '@/features/notifications/api/useNotificationHistory';
import { Loader2, Bell } from 'lucide-react';

export function ActivityFeed() {
  const t = useTranslations('dashboard');
  
  // Fetch the 5 most recent notifications
  const { data, isLoading } = useNotificationHistory({
    page: 1,
    limit: 5,
  });

const getIconForType = (type: string) => {
  switch (type) {
    case 'enrollment':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'grade':
      return <GraduationCap className="h-4 w-4 text-blue-500" />;
    case 'attendance':
      return <History className="h-4 w-4 text-amber-500" />;
    case 'user':
      return <Pencil className="h-4 w-4 text-purple-500" />;
    case 'system':
      return <Plus className="h-4 w-4 text-pink-500" />;
    default:
      return <History className="h-4 w-4 text-muted-foreground" />;
  }
};



  return (
    <Card className="col-span-full lg:col-span-3 shadow-sm border">
      <CardHeader className="border-b pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and events across the school.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full rounded-md">
          {isLoading ? (
            <div className="flex h-full min-h-[300px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {data.items.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                    {getIconForType(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.content}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      By {activity.sender?.full_name || 'System'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
