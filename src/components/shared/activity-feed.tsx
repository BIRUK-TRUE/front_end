'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Pencil, GraduationCap, History, UserPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'grade' | 'attendance' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const fallbackActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'enrollment',
    title: 'New Student Enrolled',
    description: 'Sarah Jenkins was enrolled in Class 10A.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    user: 'Admin User',
  },
  {
    id: '2',
    type: 'grade',
    title: 'Grades Published',
    description: 'Mathematics mid-term grades published for Class 9B.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    user: 'Mr. Smith',
  },
  {
    id: '3',
    type: 'attendance',
    title: 'Attendance Marked',
    description: 'Attendance submitted for Class 12A.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    user: 'Mrs. Davis',
  },
  {
    id: '4',
    type: 'user',
    title: 'Guardian Account Linked',
    description: 'A new guardian account was linked to John Doe.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    user: 'Admin User',
  },
  {
    id: '5',
    type: 'system',
    title: 'New Academic Term Started',
    description: 'Term 2 has officially commenced in the system.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    user: 'System Administrator',
  },
];

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

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

export function ActivityFeed({ activities = fallbackActivities }: ActivityFeedProps) {
  const t = useTranslations('dashboard');

  return (
    <Card className="col-span-full lg:col-span-3 shadow-sm border">
      <CardHeader className="border-b pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and events across the school.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full rounded-md">
          <div className="p-4 space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                  {getIconForType(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    By {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
