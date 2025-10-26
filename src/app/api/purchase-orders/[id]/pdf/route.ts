// app/api/purchase-orders/[id]/pdf/route.ts
// Generate PDF for purchase order

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React, { createElement } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import { PurchaseOrderPDF } from '@/lib/pdf-generator';

// GET /api/purchase-orders/[id]/pdf - Generate PDF for purchase order
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { id } = await params;

    // Fetch purchase order with all details
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        lineItems: {
          select: {
            itemSku: true,
            itemName: true,
            itemDescription: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new ApiError(404, 'Purchase Order not found');
    }

    // Check permissions
    if (
      session.user.role === 'USER' &&
      purchaseOrder.createdById !== session.user.id
    ) {
      throw new ApiError(403, 'Forbidden');
    }

    // Generate PDF using createElement to avoid JSX syntax
    // Convert dates to strings for PDF component
    const poData = {
      ...purchaseOrder,
      date: purchaseOrder.date.toISOString(),
      createdAt: purchaseOrder.createdAt.toISOString(),
      approvedAt: purchaseOrder.approvedAt?.toISOString(),
      submittedAt: purchaseOrder.submittedAt?.toISOString(),
    };

    // Type assertion to help TypeScript understand this is a valid Document element
    const pdfDocument = createElement(PurchaseOrderPDF, { po: poData }) as React.ReactElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(pdfDocument as any);

    // Return PDF as download
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${purchaseOrder.poNumber}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
