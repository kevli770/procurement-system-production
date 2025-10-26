// app/api/companies/[id]/route.ts
// Individual company API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/companies/[id] - Get company by ID
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
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nameEn: true,
        taxId: true,
        logo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    return NextResponse.json({ company });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/companies/[id] - Update company
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
    const { name, nameEn, taxId, logo, isActive } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (logo !== undefined) updateData.logo = logo;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { id } = await params;
    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        nameEn: true,
        taxId: true,
        logo: true,
        isActive: true,
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/companies/[id] - Soft delete company
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
    await prisma.company.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
