"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Loader2,
  Search,
  Send,
  User,
  XCircle,
  Zap,
  ArrowUpDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useNotificationHistory } from "../api/useNotificationHistory";

interface NotificationHistoryProps {
  onViewDetails: (id: string) => void;
}

export function NotificationHistory({
  onViewDetails,
}: NotificationHistoryProps) {
  const t = useTranslations("notifications.history");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'sent_at' | 'title' | 'type'>('sent_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const ITEMS_PER_PAGE = 10;

  const { data, isLoading, isFetching } = useNotificationHistory({
    page: 1,
    limit: 20,
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const query = searchQuery.trim().toLowerCase();

    let result = items;

    if (!query) {
      result = items;
    } else {
      result = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.message_preview.toLowerCase().includes(query) ||
          item.sent_by_name.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'sent_at') {
        comparison = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data?.items, searchQuery, sortField, sortDirection]);

  const handleSort = (field: 'sent_at' | 'title' | 'type') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTypeIcon = (type: string) => {
    return type === "automatic" ? Zap : User;
  };

  const getTypeLabel = (type: string) => {
    const key = `types.${type}`;

    if (t.has(key)) {
      return t(key);
    }

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader className="gap-4 border-b">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Send className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">{t("description")}</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t("noNotifications")}
            description={t("description")}
          />
        ) : (
          <div className="space-y-0">
            <div className="relative overflow-x-auto">
              {isFetching && (
                <div className="absolute right-4 top-4 z-10 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin text-primary" />
                  {t("description")}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-[180px] pl-6 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('sent_at')}
                    >
                      <div className="flex items-center gap-2">
                        {t("table.date")}
                        {sortField === 'sent_at' && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        {t("table.title")}
                        {sortField === 'title' && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        {t("table.type")}
                        {sortField === 'type' && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      {t("table.recipients")}
                    </TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="pr-6 text-right">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedItems.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    const failedCount = item.status.failed;
                    const hasFailures = failedCount > 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6 align-top text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock
                              className="h-4 w-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <span>
                              {format(new Date(item.sent_at), "yyyy-MM-dd HH:mm")}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="max-w-[420px] space-y-1">
                            <p className="font-medium leading-none text-foreground">
                              {item.title}
                            </p>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {item.message_preview}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("table.sentBy")}: {item.sent_by_name}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "gap-1.5 font-medium",
                              item.type === "automatic"
                                ? "bg-warning/10 text-warning hover:bg-warning/10"
                                : "bg-primary/10 text-primary hover:bg-primary/10",
                            )}
                          >
                            <TypeIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {getTypeLabel(item.type)}
                          </Badge>
                        </TableCell>

                        <TableCell className="align-top text-center">
                          <Badge variant="outline" className="font-medium">
                            {item.recipient_count}
                          </Badge>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-sm text-success">
                              <CheckCircle2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              <span className="font-medium">
                                {item.status.delivered}
                              </span>
                              <span className="text-muted-foreground">
                                {t("table.statusOk")}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "flex items-center gap-2 text-sm",
                                hasFailures
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                              <span className="font-medium">{failedCount}</span>
                              <span className="text-muted-foreground">
                                {t("table.statusErr")}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="pr-6 text-right align-top">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => onViewDetails(item.id)}
                          >
                            {t("table.viewDetails")}
                            <ChevronRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  {t("showing", { start: startIndex + 1, end: Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length), total: filteredItems.length })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
