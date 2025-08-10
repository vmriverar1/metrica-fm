'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Database, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useCacheMonitoring } from '@/hooks/useAdvancedCache';

interface PerformanceDashboardProps {
  pageType: 'blog' | 'careers' | 'article' | 'job';
  position?: 'fixed' | 'relative';
  className?: string;
}

export default function PerformanceDashboard({ 
  pageType, 
  position = 'fixed',
  className 
}: PerformanceDashboardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('performance');
  
  const performanceMonitor = usePerformanceMonitor(pageType);
  const analytics = useAdvancedAnalytics(pageType);
  const cacheMonitoring = useCacheMonitoring();

  // Only show in development or when debug flag is set
  const showDashboard = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

  if (!showDashboard) return null;

  const performanceScore = performanceMonitor.getPerformanceScore();
  const cacheStats = cacheMonitoring.getAllStats();
  const realTimeMetrics = analytics.getRealTimeMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn(
      "z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl max-w-sm",
      position === 'fixed' && "fixed bottom-4 right-4",
      isCollapsed && "w-12 h-12",
      !isCollapsed && "w-80 max-h-96 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {!isCollapsed && (
            <>
              <span className="font-semibold text-sm">Performance</span>
              <div className="flex items-center gap-1">
                {getScoreIcon(performanceScore)}
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  getScoreColor(performanceScore)
                )}>
                  {performanceScore}
                </span>
              </div>
            </>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="p-3">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="performance" className="text-xs">Perf</TabsTrigger>
                <TabsTrigger value="cache" className="text-xs">Cache</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-3 mt-3">
                <div className="space-y-2">
                  {/* Core Web Vitals */}
                  <div className="text-xs font-medium text-muted-foreground">Core Web Vitals</div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">LCP</div>
                      <div className="text-sm font-medium">
                        {formatTime(performanceMonitor.metrics.lcp)}
                      </div>
                      <div className={cn("text-xs", 
                        (performanceMonitor.metrics.lcp || 0) <= 2500 ? "text-green-600" : 
                        (performanceMonitor.metrics.lcp || 0) <= 4000 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {(performanceMonitor.metrics.lcp || 0) <= 2500 ? "Good" : 
                         (performanceMonitor.metrics.lcp || 0) <= 4000 ? "Needs Work" : "Poor"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">FID</div>
                      <div className="text-sm font-medium">
                        {formatTime(performanceMonitor.metrics.fid)}
                      </div>
                      <div className={cn("text-xs", 
                        (performanceMonitor.metrics.fid || 0) <= 100 ? "text-green-600" : 
                        (performanceMonitor.metrics.fid || 0) <= 300 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {(performanceMonitor.metrics.fid || 0) <= 100 ? "Good" : 
                         (performanceMonitor.metrics.fid || 0) <= 300 ? "Needs Work" : "Poor"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">CLS</div>
                      <div className="text-sm font-medium">
                        {performanceMonitor.metrics.cls?.toFixed(3) || 'N/A'}
                      </div>
                      <div className={cn("text-xs", 
                        (performanceMonitor.metrics.cls || 0) <= 0.1 ? "text-green-600" : 
                        (performanceMonitor.metrics.cls || 0) <= 0.25 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {(performanceMonitor.metrics.cls || 0) <= 0.1 ? "Good" : 
                         (performanceMonitor.metrics.cls || 0) <= 0.25 ? "Needs Work" : "Poor"}
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Resources:</span>
                      <span className="font-medium">{performanceMonitor.metrics.resourceCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Page Load:</span>
                      <span className="font-medium">{formatTime(performanceMonitor.metrics.pageLoadTime)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>TTFB:</span>
                      <span className="font-medium">{formatTime(performanceMonitor.metrics.ttfb)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Cache Tab */}
              <TabsContent value="cache" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Cache Performance</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Hit Rate:</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={cacheMonitoring.getTotalHitRate() * 100} 
                          className="w-16 h-2"
                        />
                        <span className="text-xs font-medium">
                          {(cacheMonitoring.getTotalHitRate() * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">Blog Cache</div>
                        <div className="text-sm font-medium">
                          {cacheStats.blog.size} items
                        </div>
                        <div className="text-xs text-green-600">
                          {formatBytes(cacheStats.blog.memory)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Careers Cache</div>
                        <div className="text-sm font-medium">
                          {cacheStats.careers.size} items
                        </div>
                        <div className="text-xs text-green-600">
                          {formatBytes(cacheStats.careers.memory)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-2 border-t">
                      <span>Total Memory:</span>
                      <span className="font-medium">
                        {formatBytes(cacheMonitoring.getTotalMemoryUsage())}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">User Session</div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.round(realTimeMetrics.sessionDuration / 1000)}s
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Page Views:</span>
                      <span className="font-medium">{realTimeMetrics.pageViews}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Events:</span>
                      <span className="font-medium">{realTimeMetrics.eventsCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Scroll Depth:</span>
                      <span className="font-medium">
                        {performanceMonitor.metrics.scrollDepth}%
                      </span>
                    </div>
                  </div>

                  {pageType === 'article' && (
                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Content Engagement</div>
                      <div className="flex justify-between text-xs">
                        <span>Score:</span>
                        <span className="font-medium text-primary">
                          {realTimeMetrics.contentEngagementScore || 0}/100
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Performance</div>
                    <div className="flex items-center gap-2">
                      <Progress value={realTimeMetrics.performanceScore} className="flex-1 h-2" />
                      <span className="text-xs font-medium">
                        {realTimeMetrics.performanceScore}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-1 p-3 pt-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1 h-7 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => analytics.exportSessionData()}
                className="flex-1 h-7 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating performance indicator
export function FloatingPerformanceIndicator({ pageType }: { pageType: 'blog' | 'careers' | 'article' | 'job' }) {
  const performanceMonitor = usePerformanceMonitor(pageType);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if performance is poor or in debug mode
    const shouldShow = performanceMonitor.getPerformanceScore() < 75 || 
      (typeof window !== 'undefined' && window.location.search.includes('debug=true'));
    setShow(shouldShow);
  }, [performanceMonitor]);

  if (!show) return null;

  const score = performanceMonitor.getPerformanceScore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3"
    >
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <div className="text-sm">
          <span className="text-muted-foreground">Performance: </span>
          <span className={cn("font-semibold",
            score >= 90 ? "text-green-600" :
            score >= 75 ? "text-yellow-600" :
            score >= 50 ? "text-orange-600" : "text-red-600"
          )}>
            {score}/100
          </span>
        </div>
        {score < 50 && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
      </div>
    </motion.div>
  );
}