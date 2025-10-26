// app/api/items/[id]/route.ts
// Individual item API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/items/[id] - Get item by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
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
    });

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/items/[id] - Update item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (description !== undefined) updateData.description = description;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
    if (character1Id !== undefined) updateData.character1Id = character1Id || null;
    if (character2Id !== undefined) updateData.character2Id = character2Id || null;
    if (character3Id !== undefined) updateData.character3Id = character3Id || null;
    if (suggestedPrice !== undefined) updateData.suggestedPrice = suggestedPrice;
    if (isOneTimePurchase !== undefined) updateData.isOneTimePurchase = isOneTimePurchase;
    if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
    if (supplierId !== undefined) updateData.supplierId = supplierId || null;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { id } = await params;
    const item = await prisma.item.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/items/[id] - Soft delete item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Forbidden');
    }

    const { id } = await params;
    // Soft delete by setting isActive to false
    await prisma.item.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
