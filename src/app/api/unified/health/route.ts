/**
 * Unified API Health Check Endpoint
 * Provides health status for all systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIHealthCheck } from '@/lib/api/unified-config';
import { APIResponse } from '@/lib/api/unified-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');

    if (system) {
      // Check specific system
      const health = await APIHealthCheck.checkSystemHealth(system);
      return APIResponse.success(health, `Health check for ${system} system`);
    } else {
      // Check all systems
      const health = await APIHealthCheck.checkAllSystems();
      return APIResponse.success(health, 'Overall system health check');
    }
  } catch (error) {
    console.error('Error in health check:', error);
    return APIResponse.error(
      'HEALTH_CHECK_ERROR',
      'Failed to perform health check',
      500
    );
  }
}