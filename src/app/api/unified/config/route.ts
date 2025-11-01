/**
 * Unified API Configuration Endpoint
 * Provides configuration information for all systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIConfigManager, ENDPOINT_REGISTRY } from '@/lib/api/unified-config';
import { APIResponse } from '@/lib/api/unified-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const type = searchParams.get('type') || 'all';

    if (system) {
      // Get specific system configuration
      const config = APIConfigManager.getConfig(system);

      switch (type) {
        case 'ratelimits':
          return APIResponse.success(
            config.rateLimits,
            `Rate limits for ${system} system`
          );

        case 'features':
          return APIResponse.success(
            config.features,
            `Features for ${system} system`
          );

        case 'caching':
          return APIResponse.success(
            config.caching,
            `Caching configuration for ${system} system`
          );

        case 'endpoints':
          return APIResponse.success(
            ENDPOINT_REGISTRY[system] || [],
            `Endpoints for ${system} system`
          );

        default:
          return APIResponse.success(
            {
              ...config,
              endpoints: ENDPOINT_REGISTRY[system] || []
            },
            `Full configuration for ${system} system`
          );
      }
    } else {
      // Get all systems configuration
      const allConfigs = {
        newsletter: APIConfigManager.getConfig('newsletter'),
        portfolio: APIConfigManager.getConfig('portfolio'),
        careers: APIConfigManager.getConfig('careers'),
        public: APIConfigManager.getConfig('public')
      };

      const allEndpoints = ENDPOINT_REGISTRY;

      return APIResponse.success(
        {
          configs: allConfigs,
          endpoints: allEndpoints,
          metadata: {
            totalSystems: Object.keys(allConfigs).length,
            totalEndpoints: Object.values(allEndpoints).flat().length
          }
        },
        'All systems configuration'
      );
    }
  } catch (error) {
    console.error('Error fetching API configuration:', error);
    return APIResponse.error(
      'CONFIG_ERROR',
      'Failed to fetch API configuration',
      500
    );
  }
}