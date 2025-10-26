// app/api/purchase-orders/route.ts
// Purchase Orders API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// Generate PO Number with format: PO-YYYYMMDD-XXXX
async function generatePONumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Find the latest PO for today
  const latestPO = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: `PO-${dateStr}`,
      },
    },
    orderBy: {
      poNumber: 'desc',
    },
  });

  let sequence = 1;
  if (latestPO) {
    const lastSequence = parseInt(latestPO.poNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `PO-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

// GET /api/purchase-orders - List all purchase orders
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Users can see their own POs, managers/admins can see all
    const where: Record<string, unknown> = {};

    if (session.user.role === 'USER') {
      where.createdById = session.user.id;
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      select: {
        id: true,
        poNumber: true,
        date: true,
        status: true,
        totalAmount: true,
        supplierId: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdById: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        approvedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/purchase-orders - Create new purchase order
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { supplierId, companyId, remarks, lineItems } = body;

    // Validate required fields
    if (!supplierId || !companyId) {
      throw new ApiError(400, 'Supplier and Company are required');
    }

    if (!lineItems || lineItems.length === 0) {
      throw new ApiError(400, 'At least one line item is required');
    }

    // Validate foreign keys exist
    console.log('[PO CREATE] Validating IDs:', {
      supplierId,
      companyId,
      userId: session.user.id,
    });

    const [supplier, company, user] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: supplierId } }),
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.user.findUnique({ where: { id: session.user.id } }),
    ]);

    console.log('[PO CREATE] Validation results:', {
      supplierFound: !!supplier,
      companyFound: !!company,
      userFound: !!user,
    });

    if (!supplier) {
      throw new ApiError(400, `Supplier not found: ${supplierId}`);
    }

    if (!company) {
      throw new ApiError(400, `Company not found: ${companyId}`);
    }

    if (!user) {
      throw new ApiError(400, `User not found: ${session.user.id}`);
    }

    // Generate PO Number
    const poNumber = await generatePONumber();

    // Calculate total amount
    const totalAmount = lineItems.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );

    // Create PO with line items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        companyId,
        remarks: remarks || null,
        createdById: session.user.id,
        status: 'DRAFT',
        totalAmount,
        lineItems: {
          create: lineItems.map((item: {
            itemId?: string;
            itemName: string;
            itemDescription?: string;
            itemSku?: string;
            character1?: string;
            character2?: string;
            character3?: string;
            unitPrice: number;
            quantity: number;
          }, index: number) => ({
            lineNumber: index + 1,
            itemId: item.itemId || null,
            itemName: item.itemName,
            itemDescription: item.itemDescription || null,
            itemSku: item.itemSku || null,
            character1: item.character1 || null,
            character2: item.character2 || null,
            character3: item.character3 || null,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
      },
      select: {
        id: true,
        poNumber: true,
        date: true,
        status: true,
        totalAmount: true,
        supplierId: true,
        companyId: true,
        remarks: true,
        createdById: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ purchaseOrder }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
