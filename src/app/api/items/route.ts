// app/api/items/route.ts
// Items catalogue API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// Generate SKU with format: ITM-YYYYMMDD-XXXX
async function generateSKU(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Find the latest SKU for today
  const latestItem = await prisma.item.findFirst({
    where: {
      sku: {
        startsWith: `ITM-${dateStr}`,
      },
    },
    orderBy: {
      sku: 'desc',
    },
  });

  let sequence = 1;
  if (latestItem) {
    const lastSequence = parseInt(latestItem.sku.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `ITM-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

// GET /api/items - List all items
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const items = await prisma.item.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        character1Id: true,
        character1: {
          select: {
            id: true,
            value: true,
            valueEn: true,
          },
        },
        character2Id: true,
        character2: {
          select: {
            id: true,
            value: true,
            valueEn: true,
          },
        },
        character3Id: true,
        character3: {
          select: {
            id: true,
            value: true,
            valueEn: true,
          },
        },
        suggestedPrice: true,
        isOneTimePurchase: true,
        validFrom: true,
        validTo: true,
        supplierId: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        remarks: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/items - Create new item
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Forbidden');
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      character1Id,
      character2Id,
      character3Id,
      suggestedPrice,
      isOneTimePurchase,
      validFrom,
      validTo,
      supplierId,
      remarks,
    } = body;

    // Validate required fields
    if (!name) {
      throw new ApiError(400, 'Name is required');
    }

    // Generate SKU
    const sku = await generateSKU();

    // Create item
    const item = await prisma.item.create({
      data: {
        sku,
        name,
        nameEn: nameEn || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        character1Id: character1Id || null,
        character2Id: character2Id || null,
        character3Id: character3Id || null,
        suggestedPrice: suggestedPrice || 0,
        isOneTimePurchase: isOneTimePurchase !== undefined ? isOneTimePurchase : true,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        supplierId: supplierId || null,
        remarks: remarks || null,
        isActive: true,
      },
      select: {
        id: true,
        sku: true,
        name: true,
        nameEn: true,
        description: true,
        character1Id: true,
        character2Id: true,
        character3Id: true,
        suggestedPrice: true,
        isOneTimePurchase: true,
        validFrom: true,
        validTo: true,
        supplierId: true,
        remarks: true,
        isActive: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
