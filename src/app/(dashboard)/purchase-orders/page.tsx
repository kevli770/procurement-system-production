// app/(dashboard)/purchase-orders/page.tsx
// Purchase Orders list page

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from '@/components/ui/empty';
import { Plus, Eye, FileText, Edit2, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type PurchaseOrder = {
  id: string;
  poNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  supplier: { id: string; name: string };
  company: { id: string; name: string };
  createdBy: { id: string; name: string };
  createdAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING_APPROVAL: 'default',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  CHANGE_REQUESTED: 'outline',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'טיוטה',
  PENDING_APPROVAL: 'ממתין לאישור',
  APPROVED: 'מאושר',
  REJECTED: 'נדחה',
  CANCELLED: 'בוטל',
  CHANGE_REQUESTED: 'דורש שינויים',
};

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'poNumber'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique suppliers for filter dropdown
  const uniqueSuppliers = Array.from(
    new Set(purchaseOrders.map((po) => JSON.stringify({ id: po.supplier.id, name: po.supplier.name })))
  ).map((str) => JSON.parse(str) as { id: string; name: string });

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();
      setPurchaseOrders(data.purchaseOrders);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort purchase orders
  const filteredAndSortedPOs = purchaseOrders
    .filter((po) => {
      // Search filter (PO number, supplier name, company name)
      const matchesSearch =
        searchQuery === '' ||
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.company.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;

      // Supplier filter
      const matchesSupplier = supplierFilter === 'all' || po.supplier.id === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.totalAmount - b.totalAmount;
      } else if (sortBy === 'poNumber') {
        comparison = a.poNumber.localeCompare(b.poNumber);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle column header click for sorting
  const handleSort = (column: 'date' | 'amount' | 'poNumber') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSupplierFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">הזמנות רכש</h1>
          <p className="text-gray-600">נהל וצור הזמנות רכש חדשות</p>
        </div>
        <Button onClick={() => router.push('/purchase-orders/new')}>
          <Plus className="h-4 w-4 ml-2" />
          הזמנה חדשה
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">חיפוש</label>
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חיפוש לפי מספר הזמנה, ספק, חברה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">סטטוס</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הסטטוסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="DRAFT">טיוטה</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">ממתין לאישור</SelectItem>
                  <SelectItem value="APPROVED">מאושר</SelectItem>
                  <SelectItem value="REJECTED">נדחה</SelectItem>
                  <SelectItem value="CANCELLED">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Supplier Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">ספק</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הספקים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הספקים</SelectItem>
                  {uniqueSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || supplierFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 ml-2" />
                נקה סינון
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            מציג {filteredAndSortedPOs.length} מתוך {purchaseOrders.length} הזמנות
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת הזמנות רכש</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAndSortedPOs.length === 0 ? (
            <Empty>
              <FileText className="h-16 w-16" />
              <EmptyTitle>
                {purchaseOrders.length === 0 ? 'אין הזמנות רכש עדיין' : 'לא נמצאו תוצאות'}
              </EmptyTitle>
              <EmptyDescription>
                {purchaseOrders.length === 0
                  ? 'התחל על ידי יצירת הזמנת הרכש הראשונה שלך'
                  : 'נסה לשנות את קריטריוני החיפוש'}
              </EmptyDescription>
              {purchaseOrders.length === 0 ? (
                <Button onClick={() => router.push('/purchase-orders/new')}>
                  <Plus className="h-4 w-4 ml-2" />
                  צור הזמנה ראשונה
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 ml-2" />
                  נקה סינון
                </Button>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleSort('poNumber')}
                  >
                    <div className="flex items-center gap-2">
                      מספר הזמנה
                      {sortBy === 'poNumber' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      תאריך
                      {sortBy === 'date' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>ספק</TableHead>
                  <TableHead>חברה</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      סכום כולל
                      {sortBy === 'amount' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>נוצר על ידי</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>
                      {new Date(po.date).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>{po.supplier.name}</TableCell>
                    <TableCell>{po.company.name}</TableCell>
                    <TableCell>{po.totalAmount.toLocaleString()} ₪</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[po.status] || 'default'}>
                        {STATUS_LABELS[po.status] || po.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{po.createdBy.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/purchase-orders/${po.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          צפה
                        </Button>
                        {po.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/purchase-orders/${po.id}`)}
                          >
                            <Edit2 className="h-4 w-4 ml-1" />
                            ערוך
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
