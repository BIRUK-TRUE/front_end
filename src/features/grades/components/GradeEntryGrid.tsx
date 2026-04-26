'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, Save, Loader2, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Grade, Assessment } from '../types';

interface GradeEntryGridProps {
  students: Grade[];
  assessment: Assessment;
  onSaveGrades: (entries: Array<{ student_id: string; score: number | null; comment?: string }>) => void;
  isSaving: boolean;
}

interface SortConfig {
  key: 'name' | 'score' | 'regNumber';
  direction: 'asc' | 'desc';
}

export function GradeEntryGrid({ students, assessment, onSaveGrades, isSaving }: GradeEntryGridProps) {
  const t = useTranslations('teacher.grades');
  const [grades, setGrades] = useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};
    students.forEach((s) => {
      initial[s.student_id] = s.score;
    });
    return initial;
  });
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const maxScore = assessment.max_score;

  // Calculate letter grade
  const getLetterGrade = (score: number | null): string => {
    if (score === null) return '—';
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'B': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'C': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'D': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'F': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];
    
    if (filterText) {
      const lower = filterText.toLowerCase();
      result = result.filter(
        (s) =>
          s.student_name.toLowerCase().includes(lower) ||
          s.registration_number.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'name':
          comparison = a.student_name.localeCompare(b.student_name);
          break;
        case 'score':
          const scoreA = grades[a.student_id] ?? -1;
          const scoreB = grades[b.student_id] ?? -1;
          comparison = scoreA - scoreB;
          break;
        case 'regNumber':
          comparison = a.registration_number.localeCompare(b.registration_number);
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, filterText, sortConfig, grades]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle grade input
  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : Math.min(Math.max(Number(value), 0), maxScore);
    setGrades((prev) => ({ ...prev, [studentId]: numValue }));
  };

  // Handle bulk actions
  const handleSelectAll = () => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map((s) => s.student_id)));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Bulk set scores for selected students
  const handleBulkSetScore = (score: number | null) => {
    if (selectedStudents.size === 0) {
      toast.error(t('noStudentsSelected'));
      return;
    }
    
    const newGrades = { ...grades };
    selectedStudents.forEach((id) => {
      newGrades[id] = score;
    });
    setGrades(newGrades);
    toast.success(t('setScoreForStudents', { count: selectedStudents.size }));
  };

  // Save all grades
  const handleSave = () => {
    const entries = Object.entries(grades).map(([student_id, score]) => ({
      student_id,
      score,
    }));
    onSaveGrades(entries);
  };

  // Sort toggle
  const toggleSort = (key: SortConfig['key']) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      t('csvHeaders.studentId'),
      t('csvHeaders.name'),
      t('csvHeaders.registrationNumber'),
      t('csvHeaders.score'),
      t('csvHeaders.grade'),
      t('csvHeaders.comment')
    ];
    const rows = filteredStudents.map((s) => {
      const score = grades[s.student_id];
      return [
        s.student_id,
        s.student_name,
        s.registration_number,
        score ?? '',
        getLetterGrade(score),
      ];
    });

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grades_${assessment.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    toast.success('Grades exported to CSV');
  };

  // Statistics
  const stats = useMemo(() => {
    const scores = Object.values(grades).filter((s): s is number => s !== null);
    if (scores.length === 0) return { count: 0, avg: 0, max: 0, min: 0 };
    return {
      count: scores.length,
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      max: Math.max(...scores),
      min: Math.min(...scores),
    };
  }, [grades]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{t('bulkGradeEntry')}</CardTitle>
            <CardDescription>
              {assessment.name} — {t('maxScore')}: {maxScore} — {t('weight')}: {assessment.weight}%
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('filterPlaceholder')}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="h-8 w-48 border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              {t('export')}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('saveAll')}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase">{t('entered')}:</span>
            <Badge variant="outline">{stats.count} / {students.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase">{t('average')}:</span>
            <Badge variant="outline" className={getGradeColor(getLetterGrade(Number(stats.avg)))}>
              {stats.avg} / {maxScore}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase">{t('range')}:</span>
            <Badge variant="outline">{stats.min} - {stats.max}</Badge>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.size > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <span className="text-sm font-medium">{t('selectedCount', { count: selectedStudents.size })}:</span>
            <div className="flex gap-1">
              {[maxScore, Math.round(maxScore * 0.9), Math.round(maxScore * 0.8), Math.round(maxScore * 0.7)].map((score) => (
                <Button
                  key={score}
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkSetScore(score)}
                  className="h-7 text-xs"
                >
                  {t('setScore', { score })}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkSetScore(null)}
                className="h-7 text-xs text-destructive"
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-[40px,1fr,100px,80px,60px] gap-2 px-4 py-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase">
          <div className="flex items-center">
            <Checkbox
              checked={paginatedStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
              onCheckedChange={handleSelectAll}
            />
          </div>
          <button
            onClick={() => toggleSort('name')}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
          >
            {t('student')}
            <ArrowUpDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => toggleSort('regNumber')}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
          >
            {t('regNumber')}
            <ArrowUpDown className="h-3 w-3" />
          </button>
          <div className="text-center">{t('score')}</div>
          <div className="text-center">{t('grade')}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {paginatedStudents.map((student) => {
            const score = grades[student.student_id];
            const letterGrade = getLetterGrade(score);

            return (
              <div
                key={student.student_id}
                className={`grid grid-cols-[40px,1fr,100px,100px,80px] gap-2 px-4 py-2 items-center hover:bg-muted/30 transition-colors ${
                  selectedStudents.has(student.student_id) ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedStudents.has(student.student_id)}
                    onCheckedChange={() => handleSelectStudent(student.student_id)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{student.student_name}</div>
                  <div className="text-xs text-muted-foreground">{student.student_id.slice(0, 8)}...</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {student.registration_number}
                </div>
                <div className="flex items-center justify-center">
                  <Input
                    type="number"
                    min={0}
                    max={maxScore}
                    value={score ?? ''}
                    onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                    className="h-8 w-20 text-center"
                    placeholder={`/${maxScore}`}
                  />
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant="outline"
                    className={`w-12 justify-center text-xs font-bold ${getGradeColor(letterGrade)}`}
                  >
                    {letterGrade}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-xs text-muted-foreground">
              {t('showing', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, filteredStudents.length), total: filteredStudents.length })}
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
