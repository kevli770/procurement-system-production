// app/api/approvals/route.ts
// Approvals API endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { handleApiError, ApiError } from '@/lib/api-error';
import { getPendingApprovalsForUser } from '@/lib/approval-service';

// GET /api/approvals - Get pending approvals for current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const approvals = await getPendingApprovalsForUser(session.user.id);

    return NextResponse.json({ approvals });
  } catch (error) {
    return handleApiError(error);
  }
}
