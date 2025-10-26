// app/api/approvals/[id]/route.ts
// Individual approval API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import { processApproval } from '@/lib/approval-service';

// PUT /api/approvals/[id] - Approve or reject an approval request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { id } = await params;
    const body = await request.json();
    const { decision, comments } = body;

    // Validate decision
    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      throw new ApiError(400, 'Invalid decision. Must be APPROVED or REJECTED');
    }

    // Get approval details to verify permissions
    const approval = await prisma.approval.findUnique({
      where: { id },
      select: {
        id: true,
        approverId: true,
        status: true,
      },
    });

    if (!approval) {
      throw new ApiError(404, 'Approval not found');
    }

    if (approval.approverId !== session.user.id) {
      throw new ApiError(403, 'You are not authorized to respond to this approval');
    }

    if (approval.status !== 'PENDING') {
      throw new ApiError(400, 'This approval has already been processed');
    }

    // Process the approval
    const newStatus = await processApproval(
      id,
      decision,
      comments || null,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      poStatus: newStatus,
      message: decision === 'APPROVED' ? 'Approval granted' : 'Approval rejected',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
