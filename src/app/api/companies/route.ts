// app/api/companies/route.ts
// Companies API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/companies - List all companies
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const companies = await prisma.company.findMany({
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
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/companies - Create new company
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
    const { name, nameEn, taxId, logo } = body;

    // Validate required fields
    if (!name) {
      throw new ApiError(400, 'Name is required');
    }

    // Check if company with this name already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name },
    });

    if (existingCompany) {
      throw new ApiError(400, 'Company with this name already exists');
    }

    const company = await prisma.company.create({
      data: {
        name,
        nameEn: nameEn || null,
        taxId: taxId || null,
        logo: logo || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        taxId: true,
        logo: true,
        isActive: true,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
