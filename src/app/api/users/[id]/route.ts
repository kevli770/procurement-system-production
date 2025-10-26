// app/api/users/[id]/route.ts
// Individual user API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalLimit: true,
        isActive: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        language: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/users/[id] - Update user
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
    const { name, role, approvalLimit, managerId, isActive, password } = body;

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (approvalLimit !== undefined) updateData.approvalLimit = approvalLimit;
    if (managerId !== undefined) updateData.managerId = managerId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const { id } = await params;
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalLimit: true,
        managerId: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] - Soft delete user
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
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
