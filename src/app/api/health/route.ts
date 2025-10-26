/**
 * Health Check Endpoint
 *
 * This endpoint provides system health status for monitoring
 * Used by IIS health checks and PM2 monitoring
 *
 * Returns:
 * - 200 OK: System is healthy
 * - 503 Service Unavailable: System has issues
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  processId: number;
  memory?: {
    used: number;
    total: number;
    percentage: string;
  };
  database?: 'connected' | 'disconnected';
  responseTime?: string;
  error?: string;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'connected';

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2);

    // Check if memory usage is critical (> 90%)
    if (parseFloat(memoryPercentage) > 90) {
      throw new Error(`Memory usage critical: ${memoryPercentage}%`);
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Return healthy status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      processId: process.pid,
      memory: {
        used: memoryUsedMB,
        total: memoryTotalMB,
        percentage: memoryPercentage,
      },
      database: dbStatus,
      responseTime: `${responseTime}ms`,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    // Return unhealthy status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      processId: process.pid,
      error: errorMessage,
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

/**
 * HEAD request for lightweight health check
 * Used by load balancers that only check HTTP status
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
