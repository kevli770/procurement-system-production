// app/api/characters/[id]/route.ts
// Individual character API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/characters/[id] - Get character by ID
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
    const character = await prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        value: true,
        valueEn: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!character) {
      throw new ApiError(404, 'Character not found');
    }

    return NextResponse.json({ character });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/characters/[id] - Update character
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
    const { id } = await params;
    const { value, valueEn, order, isActive } = body;

    const updateData: Record<string, unknown> = {};

    if (value !== undefined) updateData.value = value;
    if (valueEn !== undefined) updateData.valueEn = valueEn;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const character = await prisma.character.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        value: true,
        valueEn: true,
        order: true,
        isActive: true,
      },
    });

    return NextResponse.json({ character });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/characters/[id] - Soft delete character
export async function DELETE(
  _request: Request,
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
    await prisma.character.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
