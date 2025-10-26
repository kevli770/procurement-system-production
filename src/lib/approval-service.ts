// lib/approval-service.ts
// Approval workflow logic

import { prisma } from './prisma';
import {
  sendApprovalNotification,
  sendPOApprovedNotification,
  sendPORejectedNotification,
  sendPOToSupplier,
} from './email-service';
import { generatePOPDF } from './pdf-generator';

export type ApprovalLevel = {
  level: number;
  approverId: string;
  approverName: string;
  approvalLimit: number;
};

/**
 * Determine approval chain for a purchase order
 * @param createdById - ID of the user who created the PO
 * @param totalAmount - Total amount of the PO
 * @returns Array of approval levels with approver details
 */
export async function determineApprovalChain(
  createdById: string,
  totalAmount: number
): Promise<ApprovalLevel[]> {
  const approvalChain: ApprovalLevel[] = [];
  let level = 1;

  // Get the creator's details
  const creator = await prisma.user.findUnique({
    where: { id: createdById },
    select: {
      id: true,
      name: true,
      approvalLimit: true,
      managerId: true,
    },
  });

  if (!creator) {
    throw new Error('User not found');
  }

  // Check if creator can auto-approve (within their limit)
  if (creator.approvalLimit && creator.approvalLimit >= totalAmount) {
    return []; // Auto-approved, no approval chain needed
  }

  // Build approval chain by traversing manager hierarchy
  let currentManager = creator.managerId;

  while (currentManager && level <= 4) {
    const manager = await prisma.user.findUnique({
      where: { id: currentManager },
      select: {
        id: true,
        name: true,
        approvalLimit: true,
        managerId: true,
        isActive: true,
      },
    });

    if (!manager || !manager.isActive) {
      break; // Skip inactive managers
    }

    // Add manager to approval chain
    approvalChain.push({
      level,
      approverId: manager.id,
      approverName: manager.name || '',
      approvalLimit: manager.approvalLimit || 0,
    });

    // Check if this manager can approve (has sufficient limit)
    if (manager.approvalLimit && manager.approvalLimit >= totalAmount) {
      break; // This manager can approve, stop here
    }

    // Move to next level
    currentManager = manager.managerId;
    level++;
  }

  // If no one in the chain has sufficient limit, all managers must approve
  return approvalChain;
}

/**
 * Initialize approval records for a purchase order
 * @param poId - Purchase Order ID
 * @param createdById - ID of the user who created the PO
 * @param totalAmount - Total amount of the PO
 * @param requiresCEOApproval - Flag indicating supplier exceeded 100K monthly budget
 * @returns Number of approval levels created
 */
export async function initializeApprovals(
  poId: string,
  createdById: string,
  totalAmount: number,
  requiresCEOApproval = false
): Promise<number> {
  const approvalChain = await determineApprovalChain(createdById, totalAmount);

  // If supplier exceeded 100K budget, require approval even if normally auto-approved
  if (approvalChain.length === 0 && !requiresCEOApproval) {
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
    return 0;
  }

  // If requires CEO approval but no chain exists, send to immediate manager
  if (requiresCEOApproval && approvalChain.length === 0) {
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
      select: { managerId: true },
    });

    if (creator?.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: creator.managerId },
        select: { id: true, name: true },
      });

      if (manager) {
        approvalChain.push({
          level: 1,
          approverId: manager.id,
          approverName: manager.name || '',
          approvalLimit: 0,
        });
      }
    }
  }

  // Create approval records
  const approvals = approvalChain.map((approvalLevel) => ({
    poId,
    approverId: approvalLevel.approverId,
    level: approvalLevel.level,
    status: 'PENDING' as const,
  }));

  await prisma.approval.createMany({
    data: approvals,
  });

  // Send email notifications to first level approvers
  // Get PO details for email
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (po && approvalChain.length > 0) {
    // Notify level 1 approvers (they need to approve first)
    const level1Approvers = approvalChain.filter((a) => a.level === 1);

    for (const approver of level1Approvers) {
      const approverDetails = await prisma.user.findUnique({
        where: { id: approver.approverId },
        select: { email: true, name: true },
      });

      if (approverDetails?.email) {
        await sendApprovalNotification(
          approverDetails.email,
          approverDetails.name || '',
          po.poNumber,
          po.createdBy?.name || '',
          po.totalAmount,
          poId
        );
      }
    }
  }

  return approvals.length;
}

/**
 * Process an approval decision (approve or reject)
 * @param approvalId - Approval record ID
 * @param decision - 'APPROVED' or 'REJECTED'
 * @param comments - Optional comments from approver
 * @param approverId - ID of the approver making the decision
 * @returns Updated PO status
 */
export async function processApproval(
  approvalId: string,
  decision: 'APPROVED' | 'REJECTED',
  comments: string | null,
  approverId: string
): Promise<string> {
  // Get approval record
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      po: {
        select: {
          id: true,
          status: true,
          totalAmount: true,
        },
      },
    },
  });

  if (!approval) {
    throw new Error('Approval not found');
  }

  if (approval.approverId !== approverId) {
    throw new Error('Only the assigned approver can respond to this approval');
  }

  if (approval.status !== 'PENDING') {
    throw new Error('This approval has already been processed');
  }

  if (approval.po.status !== 'PENDING_APPROVAL') {
    throw new Error('Purchase order is not pending approval');
  }

  // Update approval record
  await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: decision,
      comments,
      respondedAt: new Date(),
    },
  });

  // Get PO details with creator info for email notifications
  const poDetails = await prisma.purchaseOrder.findUnique({
    where: { id: approval.poId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const approverDetails = await prisma.user.findUnique({
    where: { id: approverId },
    select: { name: true, email: true },
  });

  // If rejected, update PO status to REJECTED and notify creator
  if (decision === 'REJECTED') {
    await prisma.purchaseOrder.update({
      where: { id: approval.poId },
      data: { status: 'REJECTED' },
    });

    // Send rejection email to creator
    if (poDetails?.createdBy.email && approverDetails) {
      await sendPORejectedNotification(
        poDetails.createdBy.email,
        poDetails.createdBy.name || '',
        poDetails.poNumber,
        approverDetails.name || '',
        comments || '',
        poDetails.totalAmount,
        approval.poId
      );
    }

    return 'REJECTED';
  }

  // If approved, check if all required approvals are complete
  const allApprovals = await prisma.approval.findMany({
    where: { poId: approval.poId },
    orderBy: { level: 'asc' },
  });

  const currentLevelApprovals = allApprovals.filter((a) => a.level === approval.level);
  const allCurrentLevelApproved = currentLevelApprovals.every((a) => a.status === 'APPROVED');

  if (!allCurrentLevelApproved) {
    // Still waiting for other approvals at this level
    return 'PENDING_APPROVAL';
  }

  // Check if there are higher levels pending
  const nextLevelApprovals = allApprovals.filter((a) => a.level > approval.level);

  if (nextLevelApprovals.length > 0) {
    // Notify next level approvers
    const nextLevel = Math.min(...nextLevelApprovals.map((a) => a.level));
    const nextLevelApproverIds = nextLevelApprovals
      .filter((a) => a.level === nextLevel)
      .map((a) => a.approverId);

    for (const nextApproverId of nextLevelApproverIds) {
      const nextApprover = await prisma.user.findUnique({
        where: { id: nextApproverId },
        select: { email: true, name: true },
      });

      if (nextApprover?.email && poDetails) {
        await sendApprovalNotification(
          nextApprover.email,
          nextApprover.name || '',
          poDetails.poNumber,
          poDetails.createdBy?.name || '',
          poDetails.totalAmount,
          approval.poId
        );
      }
    }

    // Still need higher level approvals
    return 'PENDING_APPROVAL';
  }

  // All approvals complete, mark PO as APPROVED
  await prisma.purchaseOrder.update({
    where: { id: approval.poId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  // Send approval notification to creator
  if (poDetails?.createdBy.email && approverDetails) {
    await sendPOApprovedNotification(
      poDetails.createdBy.email,
      poDetails.createdBy.name || '',
      poDetails.poNumber,
      approverDetails.name || '',
      poDetails.totalAmount,
      approval.poId
    );
  }

  // Send PO to supplier with PDF attachment
  const supplier = await prisma.supplier.findUnique({
    where: { id: poDetails?.supplierId || '' },
    select: { email: true, name: true },
  });

  if (supplier?.email && poDetails) {
    try {
      // Generate PDF
      const pdfBuffer = await generatePOPDF(approval.poId);

      // Send to supplier
      await sendPOToSupplier(
        supplier.email,
        supplier.name || '',
        poDetails.poNumber,
        poDetails.totalAmount,
        pdfBuffer
      );
    } catch (error) {
      console.error('Failed to send PO to supplier:', error);
      // Don't fail the approval if email fails
    }
  }

  return 'APPROVED';
}

/**
 * Get pending approvals for a specific user
 * @param userId - User ID
 * @returns Array of pending approval records with PO details
 */
export async function getPendingApprovalsForUser(userId: string) {
  return prisma.approval.findMany({
    where: {
      approverId: userId,
      status: 'PENDING',
    },
    include: {
      po: {
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
