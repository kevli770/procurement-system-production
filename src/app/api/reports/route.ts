// app/api/reports/route.ts
// Generate reports with filtering and export functionality

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

type ReportType = 'spending' | 'suppliers' | 'users' | 'items';

// GET /api/reports?type=spending&from=2024-01-01&to=2024-12-31
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ReportType;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!type) {
      throw new ApiError(400, 'Report type is required');
    }

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (from || to) {
      dateFilter.approvedAt = {};
      if (from) {
        (dateFilter.approvedAt as Record<string, unknown>).gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        (dateFilter.approvedAt as Record<string, unknown>).lte = toDate;
      }
    }

    // Build where clause based on role
    const baseWhere: Record<string, unknown> = {
      status: 'APPROVED',
      ...dateFilter,
    };

    if (session.user.role === 'USER') {
      baseWhere.createdById = session.user.id;
    }

    let reportData = {};

    switch (type) {
      case 'spending':
        reportData = await generateSpendingReport(baseWhere);
        break;
      case 'suppliers':
        reportData = await generateSuppliersReport(baseWhere);
        break;
      case 'users':
        reportData = await generateUsersReport(baseWhere, session.user.role);
        break;
      case 'items':
        reportData = await generateItemsReport(baseWhere);
        break;
      default:
        throw new ApiError(400, 'Invalid report type');
    }

    return NextResponse.json({
      success: true,
      reportType: type,
      dateRange: { from, to },
      data: reportData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Generate Spending Report
async function generateSpendingReport(where: Record<string, unknown>) {
  const pos = await prisma.purchaseOrder.findMany({
    where,
    select: {
      id: true,
      poNumber: true,
      date: true,
      totalAmount: true,
      approvedAt: true,
      supplier: {
        select: { id: true, name: true },
      },
      company: {
        select: { id: true, name: true },
      },
    },
    orderBy: { approvedAt: 'desc' },
  });

  // Calculate totals
  const totalSpending = pos.reduce((sum, po) => sum + po.totalAmount, 0);

  // Group by company
  const byCompany = pos.reduce((acc, po) => {
    const companyId = po.company.id;
    if (!acc[companyId]) {
      acc[companyId] = {
        companyId,
        companyName: po.company.name,
        totalSpent: 0,
        poCount: 0,
      };
    }
    acc[companyId].totalSpent += po.totalAmount;
    acc[companyId].poCount += 1;
    return acc;
  }, {} as Record<string, { companyId: string; companyName: string; totalSpent: number; poCount: number }>);

  // Group by supplier
  const bySupplier = pos.reduce((acc, po) => {
    const supplierId = po.supplier.id;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplierId,
        supplierName: po.supplier.name,
        totalSpent: 0,
        poCount: 0,
      };
    }
    acc[supplierId].totalSpent += po.totalAmount;
    acc[supplierId].poCount += 1;
    return acc;
  }, {} as Record<string, { supplierId: string; supplierName: string; totalSpent: number; poCount: number }>);

  // Group by month
  const byMonth = pos.reduce((acc, po) => {
    if (!po.approvedAt) return acc;
    const monthKey = po.approvedAt.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, totalSpent: 0, poCount: 0 };
    }
    acc[monthKey].totalSpent += po.totalAmount;
    acc[monthKey].poCount += 1;
    return acc;
  }, {} as Record<string, { month: string; totalSpent: number; poCount: number }>);

  return {
    summary: {
      totalSpending,
      totalPOs: pos.length,
      averagePOAmount: pos.length > 0 ? totalSpending / pos.length : 0,
    },
    byCompany: Object.values(byCompany).sort((a, b) => b.totalSpent - a.totalSpent),
    bySupplier: Object.values(bySupplier).sort((a, b) => b.totalSpent - a.totalSpent),
    byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
    purchaseOrders: pos,
  };
}

// Generate Suppliers Report
async function generateSuppliersReport(where: Record<string, unknown>) {
  const pos = await prisma.purchaseOrder.findMany({
    where,
    select: {
      id: true,
      poNumber: true,
      date: true,
      totalAmount: true,
      approvedAt: true,
      supplier: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Group by supplier with detailed metrics
  const supplierMetrics = pos.reduce((acc, po) => {
    const supplierId = po.supplier.id;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplierId,
        supplierName: po.supplier.name,
        supplierEmail: po.supplier.email,
        supplierPhone: po.supplier.phone,
        totalSpent: 0,
        poCount: 0,
        avgPOAmount: 0,
        firstPO: po.date,
        lastPO: po.date,
      };
    }
    acc[supplierId].totalSpent += po.totalAmount;
    acc[supplierId].poCount += 1;
    if (new Date(po.date) < new Date(acc[supplierId].firstPO)) {
      acc[supplierId].firstPO = po.date;
    }
    if (new Date(po.date) > new Date(acc[supplierId].lastPO)) {
      acc[supplierId].lastPO = po.date;
    }
    return acc;
  }, {} as Record<string, {
    supplierId: string;
    supplierName: string;
    supplierEmail: string | null;
    supplierPhone: string | null;
    totalSpent: number;
    poCount: number;
    avgPOAmount: number;
    firstPO: Date;
    lastPO: Date;
  }>);

  // Calculate averages
  Object.values(supplierMetrics).forEach((supplier) => {
    supplier.avgPOAmount = supplier.totalSpent / supplier.poCount;
  });

  return {
    summary: {
      totalSuppliers: Object.keys(supplierMetrics).length,
      totalSpending: pos.reduce((sum, po) => sum + po.totalAmount, 0),
      totalPOs: pos.length,
    },
    suppliers: Object.values(supplierMetrics).sort((a, b) => b.totalSpent - a.totalSpent),
  };
}

// Generate Users Report
async function generateUsersReport(where: Record<string, unknown>, userRole: string) {
  if (userRole === 'USER') {
    throw new ApiError(403, 'Users do not have access to user reports');
  }

  const pos = await prisma.purchaseOrder.findMany({
    where,
    select: {
      id: true,
      poNumber: true,
      totalAmount: true,
      status: true,
      approvedAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Group by user
  const userMetrics = pos.reduce((acc, po) => {
    const userId = po.createdBy.id;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: po.createdBy.name || '',
        userEmail: po.createdBy.email,
        totalSpent: 0,
        poCount: 0,
        avgPOAmount: 0,
      };
    }
    acc[userId].totalSpent += po.totalAmount;
    acc[userId].poCount += 1;
    return acc;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    userEmail: string;
    totalSpent: number;
    poCount: number;
    avgPOAmount: number;
  }>);

  // Calculate averages
  Object.values(userMetrics).forEach((user) => {
    user.avgPOAmount = user.totalSpent / user.poCount;
  });

  return {
    summary: {
      totalUsers: Object.keys(userMetrics).length,
      totalSpending: pos.reduce((sum, po) => sum + po.totalAmount, 0),
      totalPOs: pos.length,
    },
    users: Object.values(userMetrics).sort((a, b) => b.totalSpent - a.totalSpent),
  };
}

// Generate Items Report
async function generateItemsReport(where: Record<string, unknown>) {
  const pos = await prisma.purchaseOrder.findMany({
    where,
    select: {
      id: true,
      poNumber: true,
      approvedAt: true,
      lineItems: {
        select: {
          itemSku: true,
          itemName: true,
          itemDescription: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  // Extract and group all line items
  const itemMetrics: Record<string, {
    itemName: string;
    itemSku: string | null;
    itemDescription: string | null;
    totalQuantity: number;
    totalSpent: number;
    poCount: number;
    avgPrice: number;
  }> = {};

  pos.forEach((po) => {
    po.lineItems.forEach((item) => {
      const key = item.itemSku || item.itemName;
      if (!itemMetrics[key]) {
        itemMetrics[key] = {
          itemName: item.itemName,
          itemSku: item.itemSku,
          itemDescription: item.itemDescription,
          totalQuantity: 0,
          totalSpent: 0,
          poCount: 0,
          avgPrice: 0,
        };
      }
      itemMetrics[key].totalQuantity += item.quantity;
      itemMetrics[key].totalSpent += item.lineTotal;
      itemMetrics[key].poCount += 1;
    });
  });

  // Calculate averages
  Object.values(itemMetrics).forEach((item) => {
    item.avgPrice = item.totalSpent / item.totalQuantity;
  });

  return {
    summary: {
      totalUniqueItems: Object.keys(itemMetrics).length,
      totalSpending: Object.values(itemMetrics).reduce((sum, item) => sum + item.totalSpent, 0),
      totalQuantity: Object.values(itemMetrics).reduce((sum, item) => sum + item.totalQuantity, 0),
    },
    items: Object.values(itemMetrics).sort((a, b) => b.totalSpent - a.totalSpent),
  };
}
