// app/api/suppliers/[id]/route.ts
// Individual supplier API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/suppliers/[id] - Get supplier by ID
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
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        contactPerson: true,
        taxId: true,
        address: true,
        remarks: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/suppliers/[id] - Update supplier
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
    const { name, nameEn, email, phone, contactPerson, taxId, address, remarks, isActive } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (address !== undefined) updateData.address = address;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { id } = await params;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        contactPerson: true,
        taxId: true,
        address: true,
        remarks: true,
        isActive: true,
      },
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/suppliers/[id] - Soft delete supplier
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
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
