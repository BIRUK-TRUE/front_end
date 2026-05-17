'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  Warehouse
} from 'lucide-react';
import { axiosInstance } from '@/lib/api/axios';
import { toast } from 'sonner';

export default function InventoryPage() {
  const t = useTranslations('inventory');
  const tc = useTranslations('common');
  
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/inventory/items', {
        params: { low_stock: showLowStock || undefined }
      });
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [showLowStock]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: tc('name'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.sku || 'No SKU'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: t('category'),
      cell: ({ row }) => <Badge variant="outline">{row.original.category || 'Uncategorized'}</Badge>,
    },
    {
      accessorKey: 'quantity',
      header: t('quantity'),
      cell: ({ row }) => {
        const isLow = row.original.quantity <= row.original.min_threshold;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLow ? 'text-destructive' : ''}`}>
              {row.original.quantity} {row.original.unit}
            </span>
            {isLow && <AlertTriangle className="h-3 w-3 text-destructive" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: t('location'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            {t('adjust')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addItem')}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{t('totalItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{items.length}</span>
              <Package className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className={showLowStock ? "bg-destructive/10 border-destructive/20" : "bg-card"}>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowLowStock(!showLowStock)}>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              {t('lowStock')}
              {showLowStock && <Badge variant="destructive" className="h-4 px-1">Active Filter</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-destructive">
                {items.filter(i => i.quantity <= i.min_threshold).length}
              </span>
              <AlertTriangle className="h-8 w-8 text-destructive/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{new Set(items.map(i => i.category)).size}</span>
              <Warehouse className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                className="pl-9 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant={showLowStock ? "destructive" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              className="h-11"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t('showLowStockOnly')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
