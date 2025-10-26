// app/(dashboard)/dashboard/page.tsx
// Main dashboard with statistics and widgets

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  ShoppingCart,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type DashboardStats = {
  totalPOs: number;
  draftPOs: number;
  pendingApprovalPOs: number;
  approvedPOs: number;
  rejectedPOs: number;
  pendingApprovalsForMe: number;
  totalSpending: number;
  monthlySpending: number;
};

type RecentPO = {
  id: string;
  poNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  supplier: { name: string };
  company: { name: string };
};

type TopSupplier = {
  supplierId: string;
  supplierName: string;
  totalSpent: number;
  monthlySpent: number;
  poCount: number;
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING_APPROVAL: 'default',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'טיוטה',
  PENDING_APPROVAL: 'ממתין לאישור',
  APPROVED: 'מאושר',
  REJECTED: 'נדחה',
  CANCELLED: 'בוטל',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPOs, setRecentPOs] = useState<RecentPO[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, posRes, suppliersRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/purchase-orders?limit=5'),
        fetch('/api/dashboard/top-suppliers'),
      ]);

      const statsData = await statsRes.json();
      const posData = await posRes.json();
      const suppliersData = await suppliersRes.json();

      setStats(statsData.stats || null);
      setRecentPOs(posData.purchaseOrders?.slice(0, 5) || []);
      setTopSuppliers(suppliersData.topSuppliers || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Skeleton for stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate spending alerts
  const criticalAlerts = topSuppliers.filter((s) => s.monthlySpent >= 100000);
  const warningAlerts = topSuppliers.filter((s) => s.monthlySpent >= 80000 && s.monthlySpent < 100000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
        <p className="text-gray-600">סקירה כללית של מערכת הרכש</p>
      </div>

      {/* Spending Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>אזהרת הוצאות קריטית</AlertTitle>
          <AlertDescription>
            הספקים הבאים חרגו מ-100,000 ₪ החודש:{' '}
            <strong>{criticalAlerts.map((s) => s.supplierName).join(', ')}</strong>
            {'. '}
            סה&quot;כ: <strong>{criticalAlerts.reduce((sum, s) => sum + s.monthlySpent, 0).toLocaleString()} ₪</strong>
          </AlertDescription>
        </Alert>
      )}

      {warningAlerts.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>אזהרת הוצאות</AlertTitle>
          <AlertDescription>
            הספקים הבאים התקרבו ל-100,000 ₪ החודש:{' '}
            <strong>{warningAlerts.map((s) => s.supplierName).join(', ')}</strong>
            {'. '}
            סה&quot;כ: <strong>{warningAlerts.reduce((sum, s) => sum + s.monthlySpent, 0).toLocaleString()} ₪</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ הזמנות</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPOs || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-yellow-600">{stats?.draftPOs || 0} טיוטות</span>
              {' · '}
              <span className="text-blue-600">{stats?.pendingApprovalPOs || 0} ממתינות</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אישורים ממתינים</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovalsForMe || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pendingApprovalsForMe ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => router.push('/approvals')}
                  className="p-0 h-auto text-blue-600"
                >
                  עבור לאישורים
                </Button>
              ) : (
                'אין אישורים ממתינים'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הוצאות חודשיות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.monthlySpending || 0).toLocaleString()} ₪
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              החודש הנוכחי
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ הוצאות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalSpending || 0).toLocaleString()} ₪
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              כל הזמנות מאושרות
            </p>
          </CardContent>
        </Card>

        <Card className={criticalAlerts.length > 0 ? 'border-red-500 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אזהרת ספקים</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalAlerts.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-600' : ''}`}>
              {criticalAlerts.length}
            </div>
            <p className="text-xs mt-1">
              {criticalAlerts.length > 0 ? (
                <span className="text-red-600 font-medium">
                  חרגו מ-100K החודש
                </span>
              ) : (
                <span className="text-muted-foreground">
                  אין חריגות
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>הזמנות אחרונות</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/purchase-orders')}
              >
                צפה בכל ההזמנות
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPOs.length === 0 ? (
              <Empty>
                <FileText className="h-12 w-12" />
                <EmptyTitle>אין הזמנות עדיין</EmptyTitle>
                <EmptyDescription>
                  צור הזמנת רכש ראשונה כדי להתחיל
                </EmptyDescription>
                <Button onClick={() => router.push('/purchase-orders/new')}>
                  צור הזמנה חדשה
                </Button>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר הזמנה</TableHead>
                    <TableHead>ספק</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.supplier.name}</TableCell>
                      <TableCell>{po.totalAmount.toLocaleString()} ₪</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[po.status] || 'default'}>
                          {STATUS_LABELS[po.status] || po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/purchase-orders/${po.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>ספקים מובילים</CardTitle>
          </CardHeader>
          <CardContent>
            {topSuppliers.length === 0 ? (
              <Empty>
                <TrendingUp className="h-12 w-12" />
                <EmptyTitle>אין נתונים להצגה</EmptyTitle>
                <EmptyDescription>
                  נתוני ספקים יופיעו כאן לאחר יצירת הזמנות
                </EmptyDescription>
              </Empty>
            ) : (
              <div className="space-y-4">
                {topSuppliers.map((supplier, index) => (
                  <div
                    key={supplier.supplierId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{supplier.supplierName}</p>
                        <p className="text-sm text-gray-500">
                          {supplier.poCount} {supplier.poCount === 1 ? 'הזמנה' : 'הזמנות'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{supplier.totalSpent.toLocaleString()} ₪</p>
                      <p className="text-xs text-gray-500">
                        החודש: {supplier.monthlySpent.toLocaleString()} ₪
                      </p>
                      {supplier.monthlySpent >= 100000 && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>חריגה חודשית</span>
                        </div>
                      )}
                      {supplier.monthlySpent >= 80000 && supplier.monthlySpent < 100000 && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>התראה חודשית</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
