// app/api/users/route.ts
// User management API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import bcrypt from 'bcryptjs';

// GET /api/users - List all users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Only ADMIN and SUPER_ADMIN can list users
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Forbidden');
    }

    const users = await prisma.user.findMany({
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
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create new user
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
    const { email, name, password, role, approvalLimit, managerId } = body;

    // Validate required fields
    if (!email || !name || !password) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, 'Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'USER',
        approvalLimit: approvalLimit || 0,
        managerId: managerId || null,
        isActive: true,
      },
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

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
