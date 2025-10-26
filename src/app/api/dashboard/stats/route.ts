// app/api/dashboard/stats/route.ts
// Dashboard statistics API

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Build where clause based on role
    const where: Record<string, unknown> = {};
    if (session.user.role === 'USER') {
      where.createdById = session.user.id;
    }

    // Get PO counts by status
    const [
      totalPOs,
      draftPOs,
      pendingApprovalPOs,
      approvedPOs,
      rejectedPOs,
    ] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.count({ where: { ...where, status: 'DRAFT' } }),
      prisma.purchaseOrder.count({ where: { ...where, status: 'PENDING_APPROVAL' } }),
      prisma.purchaseOrder.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.purchaseOrder.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    // Get pending approvals for current user
    const pendingApprovalsForMe = await prisma.approval.count({
      where: {
        approverId: session.user.id,
        status: 'PENDING',
      },
    });

    // Calculate total spending (approved POs only)
    const totalSpendingResult = await prisma.purchaseOrder.aggregate({
      where: {
        ...where,
        status: 'APPROVED',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate monthly spending (approved POs this month)
    const monthlySpendingResult = await prisma.purchaseOrder.aggregate({
      where: {
        ...where,
        status: 'APPROVED',
        approvedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const stats = {
      totalPOs,
      draftPOs,
      pendingApprovalPOs,
      approvedPOs,
      rejectedPOs,
      pendingApprovalsForMe,
      totalSpending: totalSpendingResult._sum.totalAmount || 0,
      monthlySpending: monthlySpendingResult._sum.totalAmount || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
