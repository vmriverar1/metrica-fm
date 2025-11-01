// FASE 4D: Performance Reporting API Endpoints
// API para recibir reportes de performance y Web Vitals

import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  sessionId: string;
  metric: {
    id: string;
    name: string;
    value: number;
    rating: string;
    url: string;
    timestamp: number;
  };
  timestamp: number;
}

interface PerformanceReport {
  sessionId: string;
  metrics: any[];
  pageLoadTime: number;
  customMetrics: { [key: string]: number };
  errors: any[];
  timestamp: number;
}

// In-memory storage for development (use proper database in production)
const performanceData: Map<string, PerformanceMetric[]> = new Map();
const performanceReports: PerformanceReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PerformanceMetric;

    // Validate the data
    if (!body.sessionId || !body.metric) {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      );
    }

    // Store the metric
    const sessionMetrics = performanceData.get(body.sessionId) || [];
    sessionMetrics.push(body);
    performanceData.set(body.sessionId, sessionMetrics);

    // Log important metrics for monitoring
    const { name, value, rating } = body.metric;
    console.log(`[PERFORMANCE] ${name}: ${value.toFixed(2)} (${rating}) - Session: ${body.sessionId}`);

    // If this is a poor metric, log for immediate attention
    if (rating === 'poor') {
      console.warn(`[PERFORMANCE ALERT] Poor ${name} score: ${value.toFixed(2)} at ${body.metric.url}`);
    }

    // Firebase App Hosting cost tracking
    if (name === 'TTFB' || name === 'LCP') {
      // Track metrics that affect hosting costs
      trackFirebaseHostingMetric(name, value, body.metric.url);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing performance metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle full performance reports
export async function PUT(request: NextRequest) {
  try {
    const report = await request.json() as PerformanceReport;

    // Validate the report
    if (!report.sessionId || !report.metrics) {
      return NextResponse.json(
        { error: 'Invalid performance report' },
        { status: 400 }
      );
    }

    // Store the full report
    performanceReports.push(report);

    // Analyze the report for cost optimization insights
    const insights = analyzePerformanceReport(report);

    console.log(`[PERFORMANCE REPORT] Session ${report.sessionId}:`, {
      pageLoadTime: report.pageLoadTime,
      customMetrics: Object.keys(report.customMetrics).length,
      errors: report.errors.length,
      insights: insights.length
    });

    // Log Firestore usage metrics
    const firestoreMetrics = Object.entries(report.customMetrics)
      .filter(([key]) => key.startsWith('firestore_'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: number });

    if (Object.keys(firestoreMetrics).length > 0) {
      console.log('[FIRESTORE USAGE]', firestoreMetrics);
    }

    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error processing performance report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get performance statistics
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const timeframe = url.searchParams.get('timeframe') || '24h';

  try {
    if (sessionId) {
      // Get specific session data
      const sessionMetrics = performanceData.get(sessionId) || [];
      return NextResponse.json({
        sessionId,
        metrics: sessionMetrics,
        count: sessionMetrics.length
      });
    }

    // Get aggregate statistics
    const stats = getPerformanceStatistics(timeframe);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error retrieving performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function trackFirebaseHostingMetric(metricName: string, value: number, url: string) {
  // Track metrics that impact Firebase App Hosting costs
  const costImpact = calculateCostImpact(metricName, value);

  console.log(`[FIREBASE HOSTING COST] ${metricName}: ${value.toFixed(2)}ms - Impact: ${costImpact}`);

  // Store for cost analysis
  // In production, this would go to a proper analytics service
}

function calculateCostImpact(metricName: string, value: number): string {
  // Simple cost impact calculation based on Web Vitals
  switch (metricName) {
    case 'TTFB':
      if (value > 1800) return 'HIGH - Slow server response increases bandwidth costs';
      if (value > 800) return 'MEDIUM - Consider optimizing server response';
      return 'LOW - Good server response time';

    case 'LCP':
      if (value > 4000) return 'HIGH - Poor loading affects user engagement';
      if (value > 2500) return 'MEDIUM - Room for improvement in loading speed';
      return 'LOW - Good loading performance';

    default:
      return 'MONITORED';
  }
}

function analyzePerformanceReport(report: PerformanceReport): string[] {
  const insights: string[] = [];

  // Check page load time
  if (report.pageLoadTime > 5000) {
    insights.push('Page load time is slow - consider optimizing critical resources');
  }

  // Check for Firestore usage patterns
  const firestoreReads = Object.entries(report.customMetrics)
    .filter(([key]) => key.includes('firestore_reads'))
    .reduce((sum, [, value]) => sum + value, 0);

  if (firestoreReads > 50) {
    insights.push(`High Firestore read count (${firestoreReads}) - consider implementing caching`);
  }

  // Check cache performance
  const cacheHits = Object.entries(report.customMetrics)
    .filter(([key]) => key.includes('cache_') && key.includes('hit'))
    .reduce((sum, [, value]) => sum + value, 0);

  const cacheMisses = Object.entries(report.customMetrics)
    .filter(([key]) => key.includes('cache_') && key.includes('miss'))
    .reduce((sum, [, value]) => sum + value, 0);

  const cacheHitRate = cacheHits / (cacheHits + cacheMisses);
  if (cacheHitRate < 0.7) {
    insights.push(`Cache hit rate is low (${(cacheHitRate * 100).toFixed(1)}%) - optimize caching strategy`);
  }

  // Check for errors
  if (report.errors.length > 0) {
    insights.push(`${report.errors.length} JavaScript errors detected - may impact user experience`);
  }

  return insights;
}

function getPerformanceStatistics(timeframe: string) {
  const now = Date.now();
  const timeframeMs = getTimeframeMs(timeframe);
  const cutoff = now - timeframeMs;

  // Filter recent data
  const recentMetrics = Array.from(performanceData.values())
    .flat()
    .filter(metric => metric.timestamp > cutoff);

  const recentReports = performanceReports
    .filter(report => report.timestamp > cutoff);

  // Calculate statistics
  const metricsByName = recentMetrics.reduce((acc, metric) => {
    if (!acc[metric.metric.name]) {
      acc[metric.metric.name] = [];
    }
    acc[metric.metric.name].push(metric.metric.value);
    return acc;
  }, {} as { [key: string]: number[] });

  const stats = Object.entries(metricsByName).reduce((acc, [name, values]) => {
    const sorted = values.sort((a, b) => a - b);
    acc[name] = {
      count: values.length,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
    return acc;
  }, {} as any);

  // Firebase hosting cost estimates
  const totalFirestoreReads = recentReports
    .reduce((sum, report) => {
      return sum + Object.entries(report.customMetrics)
        .filter(([key]) => key.includes('firestore_reads'))
        .reduce((readSum, [, value]) => readSum + value, 0);
    }, 0);

  return {
    timeframe,
    totalSessions: new Set(recentMetrics.map(m => m.sessionId)).size,
    totalMetrics: recentMetrics.length,
    totalReports: recentReports.length,
    webVitals: stats,
    firebaseHosting: {
      estimatedFirestoreReads: totalFirestoreReads,
      estimatedMonthlyCost: calculateEstimatedCost(totalFirestoreReads, recentReports.length),
    },
    timestamp: now,
  };
}

function getTimeframeMs(timeframe: string): number {
  switch (timeframe) {
    case '1h': return 60 * 60 * 1000;
    case '6h': return 6 * 60 * 60 * 1000;
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

function calculateEstimatedCost(firestoreReads: number, sessions: number): string {
  // Very rough cost estimation for Firebase App Hosting
  const readsPerMonth = (firestoreReads / sessions) * 30 * 100; // Assuming 100 sessions/day
  const firestoreCost = (readsPerMonth / 50000) * 0.06; // $0.06 per 50K reads
  const hostingCost = 2; // Base hosting cost

  const totalCost = firestoreCost + hostingCost;

  return `~$${totalCost.toFixed(2)}/month`;
}