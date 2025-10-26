// app/api/characters/route.ts
// Characters (dynamic lists) API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

// GET /api/characters - List all characters grouped by type
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = { isActive: true };
    if (type) {
      where.type = type;
    }

    const characters = await prisma.character.findMany({
      where,
      select: {
        id: true,
        type: true,
        value: true,
        valueEn: true,
        order: true,
        isActive: true,
      },
      orderBy: [
        { type: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({ characters });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/characters - Create new character
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
    const { type, value, valueEn, order } = body;

    // Validate required fields
    if (!type || !value) {
      throw new ApiError(400, 'Type and value are required');
    }

    // Validate type
    if (!['character1', 'character2', 'character3'].includes(type)) {
      throw new ApiError(400, 'Invalid character type');
    }

    // Check for duplicates
    const existing = await prisma.character.findUnique({
      where: {
        type_value: { type, value },
      },
    });

    if (existing) {
      throw new ApiError(400, 'Character with this type and value already exists');
    }

    const character = await prisma.character.create({
      data: {
        type,
        value,
        valueEn: valueEn || null,
        order: order || 0,
        isActive: true,
      },
      select: {
        id: true,
        type: true,
        value: true,
        valueEn: true,
        order: true,
        isActive: true,
      },
    });

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
