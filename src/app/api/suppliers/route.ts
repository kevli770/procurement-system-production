// app/api/suppliers/route.ts
// Suppliers API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/suppliers - List all suppliers
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const suppliers = await prisma.supplier.findMany({
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
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ suppliers });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/suppliers - Create new supplier
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
    const { name, nameEn, email, phone, contactPerson, taxId, address, remarks } = body;

    // Validate required fields
    if (!name || !email) {
      throw new ApiError(400, 'Name and email are required');
    }

    // Check if email already exists
    const existingSupplier = await prisma.supplier.findFirst({
      where: { email },
    });

    if (existingSupplier) {
      throw new ApiError(400, 'Supplier with this email already exists');
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        nameEn: nameEn || null,
        email,
        phone: phone || null,
        contactPerson: contactPerson || null,
        taxId: taxId || null,
        address: address || null,
        remarks: remarks || null,
        isActive: true,
      },
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

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
