/**
 * Unified API Statistics Endpoint
 * Provides usage statistics for all systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import { APIResponse } from '@/lib/api/unified-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');

    if (system) {
      // Get specific system stats
      switch (system) {
        case 'portfolio':
          const portfolioStats = await portfolioProjectService.getPortfolioStats();
          return APIResponse.success(portfolioStats, `Statistics for ${system} system`);

        case 'careers':
          const careersStats = await careerPositionService.getCareersStats();
          return APIResponse.success(careersStats, `Statistics for ${system} system`);

        case 'newsletter':
          const newsletterStats = await newsletterArticleService.getNewsletterStats();
          return APIResponse.success(newsletterStats, `Statistics for ${system} system`);

        default:
          return APIResponse.badRequest(`Unknown system: ${system}`);
      }
    } else {
      // Get all systems stats
      const [portfolioStats, careersStats, newsletterStats] = await Promise.all([
        portfolioProjectService.getPortfolioStats().catch(() => null),
        careerPositionService.getCareersStats().catch(() => null),
        newsletterArticleService.getNewsletterStats().catch(() => null)
      ]);

      const unifiedStats = {
        portfolio: portfolioStats,
        careers: careersStats,
        newsletter: newsletterStats,
        summary: {
          totalProjects: portfolioStats?.totalProjects || 0,
          totalJobs: careersStats?.totalPositions || 0,
          totalArticles: newsletterStats?.totalArticles || 0,
          totalSubscribers: newsletterStats?.totalSubscribers || 0,
          totalApplications: careersStats?.totalApplications || 0,
          overallHealth: 'healthy' // Could be calculated based on various metrics
        }
      };

      return APIResponse.success(unifiedStats, 'Unified system statistics');
    }
  } catch (error) {
    console.error('Error fetching API statistics:', error);
    return APIResponse.error(
      'STATS_ERROR',
      'Failed to fetch API statistics',
      500
    );
  }
}