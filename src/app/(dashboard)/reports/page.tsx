// app/(dashboard)/reports/page.tsx
// Redesigned reports page with improved UX using my-patterns

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Building2,
  Users,
  Package,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Pie, PieChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type DateRange = {
  from: string;
  to: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: '',
    to: '',
  });
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [supplierMonitoring, setSupplierMonitoring] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'spending',
      title: 'דוח הוצאות',
      description: 'ניתוח הוצאות לפי תקופה, ספק וחברה',
      icon: TrendingUp,
    },
    {
      id: 'suppliers',
      title: 'דוח ספקים',
      description: 'ביצועי ספקים והזמנות',
      icon: Building2,
    },
    {
      id: 'users',
      title: 'דוח משתמשים',
      description: 'פעילות משתמשים והזמנות שיצרו',
      icon: Users,
    },
    {
      id: 'items',
      title: 'דוח פריטים',
      description: 'ניתוח רכישות לפי פריט',
      icon: Package,
    },
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: selectedReport,
      });
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);

      const [reportRes, monitoringRes] = await Promise.all([
        fetch(`/api/reports?${params.toString()}`),
        fetch('/api/suppliers/monitoring'),
      ]);

      const reportDataJson = await reportRes.json();
      const monitoringDataJson = await monitoringRes.json();

      if (reportDataJson.success) {
        setReportData(reportDataJson);
      } else {
        console.error('Failed to generate report:', reportDataJson);
      }

      if (monitoringDataJson.success) {
        setSupplierMonitoring(monitoringDataJson);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (range: 'current-month' | 'last-month' | 'current-year' | 'last-year') => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (range) {
      case 'current-month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = now;
        break;
      case 'last-month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-year':
        from = new Date(now.getFullYear(), 0, 1);
        to = now;
        break;
      case 'last-year':
        from = new Date(now.getFullYear() - 1, 0, 1);
        to = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (format === 'pdf') {
      alert('PDF export will be available soon');
      return;
    }

    if (!reportData || !reportData.data) return;

    let csvContent = '';
    const data = reportData.data;

    if (selectedReport === 'spending' && data.byCompany) {
      csvContent = 'Company,Total Spent,PO Count,Average PO\n';
      data.byCompany.forEach((item: any) => {
        csvContent += `${item.companyName},${item.totalSpent},${item.poCount},${item.avgPOAmount}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate supplier monitoring alerts
  const criticalAlerts = supplierMonitoring?.exceedingSuppliers || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">דוחות וניתוח</h1>
        <p className="text-gray-600">צפייה בדוחות, גרפים ויצוא נתונים</p>
      </div>

      {/* Supplier Monitoring Alert - Only show if there are alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>אזהרת הוצאות קריטית</AlertTitle>
          <AlertDescription>
            {criticalAlerts.length} ספקים חרגו מ-100,000 ₪ החודש
          </AlertDescription>
        </Alert>
      )}

      {/* STEP 1: Select Report Type */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div>
              <CardTitle>בחר סוג דוח</CardTitle>
              <CardDescription>בחר את סוג הדוח שברצונך להפיק</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all hover:shadow-md',
                  selectedReport === type.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-200 hover:border-primary/50'
                )}
              >
                {selectedReport === type.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  'p-3 rounded-full',
                  selectedReport === type.id ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'
                )}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{type.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
                {selectedReport === type.id && (
                  <Badge className="mt-2">נבחר</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* STEP 2: Set Date Range - Only show if report type selected */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <CardTitle>בחר טווח תאריכים</CardTitle>
                <CardDescription>קבע את תקופת הדוח או בחר טווח מוגדר מראש</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Date Filters */}
            <div>
              <Label className="text-base font-semibold mb-3 block">טווחי זמן מוגדרים מראש</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setQuickDateRange('current-month')}
                  className="h-auto py-3"
                >
                  החודש הנוכחי
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuickDateRange('last-month')}
                  className="h-auto py-3"
                >
                  החודש הקודם
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuickDateRange('current-year')}
                  className="h-auto py-3"
                >
                  השנה הנוכחית
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuickDateRange('last-year')}
                  className="h-auto py-3"
                >
                  שנה שעברה
                </Button>
              </div>
            </div>

            {/* Manual Date Range */}
            <div>
              <Label className="text-base font-semibold mb-3 block">או בחר טווח מותאם אישית</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-date" className="mb-2 block">מתאריך</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date" className="mb-2 block">עד תאריך</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="text-lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Generate Report - Only show if report type and dates selected */}
      {selectedReport && dateRange.from && dateRange.to && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <CardTitle>הפק דוח</CardTitle>
                <CardDescription>לחץ להפקת הדוח עם הפרמטרים שנבחרו</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              size="lg"
              className="w-full md:w-auto text-lg px-8 py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  מפיק דוח...
                </>
              ) : (
                <>
                  <BarChart3 className="ml-2 h-5 w-5" />
                  הפק דוח
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* RESULTS SECTION - Only show after report generated */}
      {reportData && reportData.data && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">תוצאות הדוח</CardTitle>
                <CardDescription className="text-base">
                  {reportTypes.find(t => t.id === selectedReport)?.title} • {dateRange.from} - {dateRange.to}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <FileText className="ml-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="ml-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Summary Cards */}
            {reportData.data.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(reportData.data.summary).map(([key, value]) => (
                  <Card key={key}>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase">{key}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {typeof value === 'number'
                          ? value.toLocaleString('he-IL')
                          : value != null ? String(value) : '0'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Spending Report Charts */}
            {selectedReport === 'spending' && reportData.data.byCompany && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart - Spending by Company */}
                  <Card>
                    <CardHeader>
                      <CardTitle>הוצאות לפי חברה - תצוגה גרפית</CardTitle>
                      <CardDescription>Top 5 חברות</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          totalSpent: {
                            label: 'סה"כ הוצאות',
                            color: 'var(--chart-1)',
                          },
                        }}
                        className="h-[500px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={reportData.data.byCompany.slice(0, 5)}
                          margin={{ top: 40, right: 40, bottom: 120, left: 100 }}
                          barSize={60}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                          <XAxis
                            dataKey="companyName"
                            angle={-45}
                            textAnchor="end"
                            height={140}
                            tick={{ fontSize: 13, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={20}
                            interval={0}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={15}
                            tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `₪${value.toLocaleString('he-IL')}`}
                            width={90}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                          />
                          <Bar
                            dataKey="totalSpent"
                            fill="var(--color-totalSpent)"
                            radius={[8, 8, 0, 0]}
                          >
                            <LabelList
                              className="fill-white font-bold"
                              fontSize={16}
                              position="inside"
                              offset={10}
                              formatter={(value: any) => `₪${value.toLocaleString('he-IL')}`}
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Pie Chart - Spending by Supplier */}
                  {reportData.data.bySupplier && (
                    <Card>
                      <CardHeader>
                        <CardTitle>התפלגות הוצאות לפי ספק</CardTitle>
                        <CardDescription>Top 5 ספקים</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={reportData.data.bySupplier.slice(0, 5).reduce((acc: any, item: any, idx: number) => {
                            acc[`supplier${idx}`] = {
                              label: item.supplierName,
                              color: `var(--chart-${idx + 1})`,
                            };
                            return acc;
                          }, {
                            totalSpent: {
                              label: 'סה"כ הוצאות',
                            }
                          })}
                          className="mx-auto aspect-square max-h-[300px]"
                        >
                          <PieChart>
                            <Pie
                              data={reportData.data.bySupplier.slice(0, 5).map((item: any, idx: number) => ({
                                ...item,
                                fill: `var(--color-supplier${idx})`,
                              }))}
                              dataKey="totalSpent"
                              nameKey="supplierName"
                            />
                            <ChartLegend
                              content={<ChartLegendContent nameKey="supplierName" />}
                              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>פירוט מלא - הוצאות לפי חברה</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>חברה</TableHead>
                          <TableHead>סה״כ הזמנות</TableHead>
                          <TableHead>סה״כ הוצאות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.data.byCompany.map((company: any) => (
                          <TableRow key={company.companyId}>
                            <TableCell>{company.companyName}</TableCell>
                            <TableCell>{company.poCount}</TableCell>
                            <TableCell>₪{company.totalSpent.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Suppliers Report */}
            {selectedReport === 'suppliers' && reportData.data.suppliers && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ספקים מובילים - תצוגה גרפית</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        totalSpent: {
                          label: 'סה"כ הוצאות',
                          color: 'var(--chart-2)',
                        },
                      }}
                      className="h-[500px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={reportData.data.suppliers.slice(0, 5)}
                        margin={{ top: 40, right: 40, bottom: 120, left: 100 }}
                        barSize={60}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="supplierName"
                          angle={-45}
                          textAnchor="end"
                          height={140}
                          tick={{ fontSize: 13, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={20}
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={15}
                          tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => `₪${value.toLocaleString('he-IL')}`}
                          width={90}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                        />
                        <Bar dataKey="totalSpent" fill="var(--color-totalSpent)" radius={[8, 8, 0, 0]}>
                          <LabelList
                            className="fill-white font-bold"
                            fontSize={16}
                            position="inside"
                            offset={10}
                            formatter={(value: any) => `₪${value.toLocaleString('he-IL')}`}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>פירוט ספקים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם ספק</TableHead>
                          <TableHead>אימייל</TableHead>
                          <TableHead>טלפון</TableHead>
                          <TableHead>הזמנות</TableHead>
                          <TableHead>סה״כ</TableHead>
                          <TableHead>ממוצע</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.data.suppliers.map((supplier: any) => (
                          <TableRow key={supplier.supplierId}>
                            <TableCell>{supplier.supplierName}</TableCell>
                            <TableCell>{supplier.supplierEmail}</TableCell>
                            <TableCell>{supplier.supplierPhone}</TableCell>
                            <TableCell>{supplier.poCount}</TableCell>
                            <TableCell>₪{supplier.totalSpent.toLocaleString()}</TableCell>
                            <TableCell>₪{supplier.avgPOAmount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Report */}
            {selectedReport === 'users' && reportData.data.users && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>פעילות משתמשים - תצוגה גרפית</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        poCount: {
                          label: 'מספר הזמנות',
                          color: 'var(--chart-3)',
                        },
                      }}
                      className="h-[500px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={reportData.data.users.slice(0, 5)}
                        margin={{ top: 40, right: 40, bottom: 120, left: 80 }}
                        barSize={60}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="userName"
                          angle={-45}
                          textAnchor="end"
                          height={140}
                          tick={{ fontSize: 13, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={20}
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={15}
                          tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                          allowDecimals={false}
                          width={60}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                        />
                        <Bar dataKey="poCount" fill="var(--color-poCount)" radius={[8, 8, 0, 0]}>
                          <LabelList
                            className="fill-white font-bold"
                            fontSize={16}
                            position="inside"
                            offset={10}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>פירוט משתמשים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם משתמש</TableHead>
                          <TableHead>אימייל</TableHead>
                          <TableHead>הזמנות</TableHead>
                          <TableHead>סה״כ</TableHead>
                          <TableHead>ממוצע</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.data.users.map((user: any) => (
                          <TableRow key={user.userId}>
                            <TableCell>{user.userName}</TableCell>
                            <TableCell>{user.userEmail}</TableCell>
                            <TableCell>{user.poCount}</TableCell>
                            <TableCell>₪{user.totalSpent.toLocaleString()}</TableCell>
                            <TableCell>₪{user.avgPOAmount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Items Report */}
            {selectedReport === 'items' && reportData.data.items && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>פריטים מובילים - תצוגה גרפית</CardTitle>
                    <CardDescription>Top 5 פריטים</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        totalSpent: {
                          label: 'סה"כ הוצאות',
                          color: 'var(--chart-4)',
                        },
                      }}
                      className="h-[500px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={reportData.data.items.slice(0, 5)}
                        margin={{ top: 40, right: 40, bottom: 120, left: 100 }}
                        barSize={60}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="itemName"
                          angle={-45}
                          textAnchor="end"
                          height={140}
                          tick={{ fontSize: 13, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={20}
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={15}
                          tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => `₪${value.toLocaleString('he-IL')}`}
                          width={90}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                        />
                        <Bar dataKey="totalSpent" fill="var(--color-totalSpent)" radius={[8, 8, 0, 0]}>
                          <LabelList
                            className="fill-white font-bold"
                            fontSize={16}
                            position="inside"
                            offset={10}
                            formatter={(value: any) => `₪${value.toLocaleString('he-IL')}`}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ניתוח פריטים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>שם פריט</TableHead>
                          <TableHead>כמות</TableHead>
                          <TableHead>סה״כ</TableHead>
                          <TableHead>מחיר ממוצע</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.data.items.slice(0, 20).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemSku || '-'}</TableCell>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.totalQuantity}</TableCell>
                            <TableCell>₪{item.totalSpent.toLocaleString()}</TableCell>
                            <TableCell>₪{item.avgPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
