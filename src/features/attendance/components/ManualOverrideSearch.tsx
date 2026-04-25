'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AttendanceStatus } from '../types';

interface Student {
  id: string;
  name: string;
  registration_number: string;
}

interface ManualOverrideSearchProps {
  students: Student[];
  onMark: (studentId: string, status: AttendanceStatus) => void;
  markedStudents: Set<string>;
  className?: string;
}

export function ManualOverrideSearch({ 
  students, 
  onMark, 
  markedStudents,
  className 
}: ManualOverrideSearchProps) {
  const t = useTranslations('faceAttendance.station');
  const tc = useTranslations('common');
  const [query, setQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.registration_number.toLowerCase().includes(q)
    ).slice(0, 5); // Limit results for clean UI
  }, [students, query]);

  return (
    <div className={className}>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchStudent')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {filteredStudents.length > 0 && (
        <Card className="border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CardContent className="p-2">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {filteredStudents.map((student) => {
                  const isMarked = markedStudents.has(student.id);
                  return (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.registration_number}</p>
                      </div>
                      
                      {isMarked ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Marked
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => {
                              onMark(student.id, AttendanceStatus.PRESENT);
                              setQuery('');
                            }}
                            className="h-8 gap-1"
                          >
                            <UserPlus className="h-3 w-3" />
                            {t('present')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              onMark(student.id, AttendanceStatus.LATE);
                              setQuery('');
                            }}
                            className="h-8 gap-1"
                          >
                            {t('late')}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
