// app/api/dashboard/top-suppliers/route.ts
// Top suppliers by spending API

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/dashboard/top-suppliers - Get top suppliers by total spending
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Build where clause based on role
    const where: Record<string, unknown> = { status: 'APPROVED' };
    if (session.user.role === 'USER') {
      where.createdById = session.user.id;
    }

    // Get all approved POs with supplier info
    const approvedPOs = await prisma.purchaseOrder.findMany({
      where,
      select: {
        supplierId: true,
        totalAmount: true,
        approvedAt: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate current month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Aggregate by supplier with monthly tracking
    const supplierMap = new Map<
      string,
      { name: string; totalSpent: number; monthlySpent: number; poCount: number }
    >();

    approvedPOs.forEach((po) => {
      const existing = supplierMap.get(po.supplierId);
      const isCurrentMonth = po.approvedAt && po.approvedAt >= monthStart && po.approvedAt <= monthEnd;

      if (existing) {
        existing.totalSpent += po.totalAmount;
        existing.poCount += 1;
        if (isCurrentMonth) {
          existing.monthlySpent += po.totalAmount;
        }
      } else {
        supplierMap.set(po.supplierId, {
          name: po.supplier.name,
          totalSpent: po.totalAmount,
          monthlySpent: isCurrentMonth ? po.totalAmount : 0,
          poCount: 1,
        });
      }
    });

    // Convert to array and sort by total spent
    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplierId, data]) => ({
        supplierId,
        supplierName: data.name,
        totalSpent: data.totalSpent,
        monthlySpent: data.monthlySpent,
        poCount: data.poCount,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10); // Top 10 suppliers

    return NextResponse.json({ topSuppliers });
  } catch (error) {
    return handleApiError(error);
  }
}
