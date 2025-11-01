'use client';

// FASE 4E: Performance & Cost Monitoring Dashboard
// Dashboard para monitorear performance y costos de Firebase App Hosting

import { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  DollarSign,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface WebVitalsStat {
  count: number;
  average: number;
  median: number;
  p75: number;
  p95: number;
  min: number;
  max: number;
}

interface PerformanceStats {
  timeframe: string;
  totalSessions: number;
  totalMetrics: number;
  webVitals: {
    CLS?: WebVitalsStat;
    FCP?: WebVitalsStat;
    FID?: WebVitalsStat;
    LCP?: WebVitalsStat;
    TTFB?: WebVitalsStat;
  };
  firebaseHosting: {
    estimatedFirestoreReads: number;
    estimatedMonthlyCost: string;
  };
  timestamp: number;
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/performance/report?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  const getWebVitalRating = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    } as const;

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMetricValue = (metricName: string, value: number) => {
    if (metricName === 'CLS') return value.toFixed(3);
    return Math.round(value).toString() + 'ms';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Firebase App Hosting & Web Vitals Monitoring</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {!stats ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No performance data available for the selected timeframe.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Sessions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
              <div className="text-xs text-gray-500">{stats.timeframe}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Web Vitals</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMetrics}</div>
              <div className="text-xs text-gray-500">metrics collected</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Firestore Reads</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.firebaseHosting.estimatedFirestoreReads.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">estimated reads</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Est. Cost</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.firebaseHosting.estimatedMonthlyCost}
              </div>
              <div className="text-xs text-gray-500">monthly projection</div>
            </div>
          </div>

          {/* Web Vitals Metrics */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Core Web Vitals</h2>
              <p className="text-sm text-gray-600">Performance metrics that impact user experience and SEO</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(stats.webVitals).map(([metric, data]) => {
                  if (!data) return null;

                  const rating = getWebVitalRating(metric, data.average);

                  return (
                    <div key={metric} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{metric}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(rating)}`}>
                          {rating.replace('-', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average:</span>
                          <span className="font-medium">{formatMetricValue(metric, data.average)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">P75:</span>
                          <span>{formatMetricValue(metric, data.p75)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">P95:</span>
                          <span>{formatMetricValue(metric, data.p95)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Samples:</span>
                          <span>{data.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cost Optimization Insights */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Cost Optimization</h2>
              <p className="text-sm text-gray-600">Firebase App Hosting cost insights and recommendations</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Usage */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Current Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Firestore Reads ({timeframe}):</span>
                      <span className="font-medium">{stats.firebaseHosting.estimatedFirestoreReads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sessions ({timeframe}):</span>
                      <span className="font-medium">{stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Reads per Session:</span>
                      <span className="font-medium">
                        {stats.totalSessions > 0
                          ? (stats.firebaseHosting.estimatedFirestoreReads / stats.totalSessions).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Monthly Projection:</span>
                      <span className="font-bold text-green-600">{stats.firebaseHosting.estimatedMonthlyCost}</span>
                    </div>
                  </div>
                </div>

                {/* Optimization Recommendations */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Optimization Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">FASE 3 Optimizations Active</div>
                        <div className="text-sm text-gray-600">Firestore Lite + Caching + Bundles</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">FASE 4 PWA Features</div>
                        <div className="text-sm text-gray-600">Advanced caching + Offline support</div>
                      </div>
                    </div>

                    {(stats.firebaseHosting.estimatedFirestoreReads / stats.totalSessions) > 20 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">High Read Count</div>
                          <div className="text-sm text-gray-600">Consider more aggressive caching</div>
                        </div>
                      </div>
                    )}

                    {stats.webVitals.LCP && stats.webVitals.LCP.average > 3000 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">Slow LCP</div>
                          <div className="text-sm text-gray-600">Optimize critical resource loading</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}