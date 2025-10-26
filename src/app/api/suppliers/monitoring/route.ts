// app/api/suppliers/monitoring/route.ts
// Monitor suppliers with over 100K spending per month

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/suppliers/monitoring - Get suppliers exceeding 100K threshold
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Calculate current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all approved POs for current month
    const pos = await prisma.purchaseOrder.findMany({
      where: {
        status: 'APPROVED',
        approvedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        id: true,
        poNumber: true,
        totalAmount: true,
        approvedAt: true,
        supplierId: true,
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by supplier and calculate totals
    const supplierSpending: Record<string, {
      supplierId: string;
      supplierName: string;
      supplierEmail: string | null;
      totalSpent: number;
      poCount: number;
      exceedsThreshold: boolean;
      pos: Array<{
        id: string;
        poNumber: string;
        totalAmount: number;
        approvedAt: Date | null;
      }>;
    }> = {};

    pos.forEach((po) => {
      if (!supplierSpending[po.supplierId]) {
        supplierSpending[po.supplierId] = {
          supplierId: po.supplierId,
          supplierName: po.supplier.name,
          supplierEmail: po.supplier.email,
          totalSpent: 0,
          poCount: 0,
          exceedsThreshold: false,
          pos: [],
        };
      }

      supplierSpending[po.supplierId].totalSpent += po.totalAmount;
      supplierSpending[po.supplierId].poCount += 1;
      supplierSpending[po.supplierId].pos.push({
        id: po.id,
        poNumber: po.poNumber,
        totalAmount: po.totalAmount,
        approvedAt: po.approvedAt,
      });
    });

    // Mark suppliers exceeding 100K threshold
    const THRESHOLD = 100000;
    Object.values(supplierSpending).forEach((supplier) => {
      supplier.exceedsThreshold = supplier.totalSpent >= THRESHOLD;
    });

    // Get only suppliers exceeding threshold
    const exceedingSuppliers = Object.values(supplierSpending)
      .filter((s) => s.exceedsThreshold)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Calculate summary
    const summary = {
      currentMonth: now.toISOString().slice(0, 7), // YYYY-MM
      threshold: THRESHOLD,
      totalSuppliers: Object.keys(supplierSpending).length,
      suppliersExceedingThreshold: exceedingSuppliers.length,
      totalSpentThisMonth: Object.values(supplierSpending).reduce(
        (sum, s) => sum + s.totalSpent,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      summary,
      exceedingSuppliers,
      allSuppliers: Object.values(supplierSpending).sort(
        (a, b) => b.totalSpent - a.totalSpent
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
