'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Clock,
  Zap,
  Target,
  Brain,
  Globe,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Settings,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { observability } from '@/services/observability';
import { abTestingManager } from '@/services/advancedABTesting';
import { createIntegrationManager } from '@/services/externalIntegrations';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'percentage' | 'currency' | 'time' | 'bytes';
  icon: React.ReactNode;
  category: 'performance' | 'users' | 'content' | 'business' | 'system';
  priority: 'high' | 'medium' | 'low';
  trend: number[]; // Historical data points
  target?: number;
  description?: string;
}

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
  data: Array<{
    name: string;
    value: number;
    category?: string;
    timestamp?: Date;
  }>;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UnifiedMetricsDashboardProps {
  className?: string;
  defaultTimeRange?: 'hour' | 'day' | 'week' | 'month' | 'quarter';
  allowExport?: boolean;
  realTimeUpdates?: boolean;
}

const TIME_RANGES = {
  hour: { label: '1 Hour', minutes: 60 },
  day: { label: '24 Hours', minutes: 1440 },
  week: { label: '7 Days', minutes: 10080 },
  month: { label: '30 Days', minutes: 43200 },
  quarter: { label: '3 Months', minutes: 129600 }
};

const METRIC_CATEGORIES = {
  performance: { label: 'Performance', color: 'bg-blue-500', icon: <Zap className="w-4 h-4" /> },
  users: { label: 'Users', color: 'bg-green-500', icon: <Users className="w-4 h-4" /> },
  content: { label: 'Content', color: 'bg-purple-500', icon: <BarChart3 className="w-4 h-4" /> },
  business: { label: 'Business', color: 'bg-cyan-500', icon: <Target className="w-4 h-4" /> },
  system: { label: 'System', color: 'bg-red-500', icon: <Activity className="w-4 h-4" /> }
};

export default function UnifiedMetricsDashboard({
  className,
  defaultTimeRange = 'day',
  allowExport = true,
  realTimeUpdates = true
}: UnifiedMetricsDashboardProps) {
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>(defaultTimeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  // Data state
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [abTestResults, setABTestResults] = useState<any[]>([]);

  // Load dashboard data
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get observability data
      const obsData = observability.getObservabilityDashboard();
      
      // Get A/B testing data
      const runningTests = abTestingManager.getRunningTests();
      
      // Get integration status
      const integrationManager = createIntegrationManager();
      const integrationResults = await integrationManager.testAllConnections();

      // Transform data into metrics
      const newMetrics = await generateMetrics(obsData, runningTests, integrationResults);
      const newCharts = generateCharts(obsData, runningTests);
      const newAlerts = generateAlerts(obsData, integrationResults);

      setMetrics(newMetrics);
      setCharts(newCharts);
      setSystemStatus(obsData.systemStatus);
      setABTestResults(runningTests);
      setAlerts(newAlerts);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setAlerts(prev => [...prev, {
        id: 'load-error',
        type: 'error',
        title: 'Data Load Error',
        message: 'Failed to load dashboard data',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Auto-refresh setup
  useEffect(() => {
    loadDashboardData();
    
    if (realTimeUpdates && refreshInterval > 0) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadDashboardData, refreshInterval, realTimeUpdates]);

  // Generate metrics from raw data
  const generateMetrics = async (obsData: any, tests: any[], integrations: any): Promise<MetricCard[]> => {
    return [
      {
        id: 'page_views',
        title: 'Page Views',
        value: obsData.keyMetrics.pageViews,
        change: 12.5,
        changeType: 'increase',
        format: 'number',
        icon: <Eye className="w-4 h-4" />,
        category: 'users',
        priority: 'high',
        trend: [100, 120, 135, 150, 180, 200, 185],
        target: 1000,
        description: 'Total page views across blog and careers'
      },
      {
        id: 'avg_response_time',
        title: 'Avg Response Time',
        value: obsData.keyMetrics.avgResponseTime,
        change: -8.2,
        changeType: 'decrease',
        format: 'time',
        icon: <Clock className="w-4 h-4" />,
        category: 'performance',
        priority: 'high',
        trend: [800, 750, 720, 680, 650, 620, 580],
        target: 500,
        description: 'Average API response time in milliseconds'
      },
      {
        id: 'active_users',
        title: 'Active Users',
        value: obsData.keyMetrics.activeUsers,
        change: 5.7,
        changeType: 'increase',
        format: 'number',
        icon: <Users className="w-4 h-4" />,
        category: 'users',
        priority: 'medium',
        trend: [80, 85, 92, 88, 95, 102, 98],
        description: 'Currently active users on the platform'
      },
      {
        id: 'error_rate',
        title: 'Error Rate',
        value: (obsData.keyMetrics.errorRate / obsData.keyMetrics.pageViews * 100).toFixed(2),
        change: -15.3,
        changeType: 'decrease',
        format: 'percentage',
        icon: <AlertTriangle className="w-4 h-4" />,
        category: 'system',
        priority: 'high',
        trend: [2.5, 2.1, 1.8, 1.5, 1.2, 1.0, 0.8],
        target: 1,
        description: 'Percentage of requests resulting in errors'
      },
      {
        id: 'ab_tests_running',
        title: 'A/B Tests Running',
        value: tests.length,
        change: 0,
        changeType: 'neutral',
        format: 'number',
        icon: <Brain className="w-4 h-4" />,
        category: 'business',
        priority: 'medium',
        trend: [3, 4, 5, 4, 6, 5, tests.length],
        description: 'Number of active A/B tests'
      },
      {
        id: 'conversion_rate',
        title: 'Conversion Rate',
        value: '3.2',
        change: 18.5,
        changeType: 'increase',
        format: 'percentage',
        icon: <Target className="w-4 h-4" />,
        category: 'business',
        priority: 'high',
        trend: [2.1, 2.3, 2.8, 2.9, 3.1, 3.0, 3.2],
        target: 5,
        description: 'Overall conversion rate across all funnels'
      },
      {
        id: 'system_uptime',
        title: 'System Uptime',
        value: '99.9',
        change: 0.1,
        changeType: 'increase',
        format: 'percentage',
        icon: <CheckCircle className="w-4 h-4" />,
        category: 'system',
        priority: 'high',
        trend: [99.8, 99.9, 99.9, 99.8, 99.9, 100, 99.9],
        target: 99.9,
        description: 'System availability percentage'
      },
      {
        id: 'content_engagement',
        title: 'Content Engagement',
        value: '4.2',
        change: 7.3,
        changeType: 'increase',
        format: 'number',
        icon: <BarChart3 className="w-4 h-4" />,
        category: 'content',
        priority: 'medium',
        trend: [3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2],
        description: 'Average engagement score across content'
      }
    ];
  };

  // Generate charts from raw data
  const generateCharts = (obsData: any, tests: any[]): ChartData[] => {
    return [
      {
        id: 'traffic_sources',
        title: 'Traffic Sources',
        type: 'pie',
        data: [
          { name: 'Direct', value: 35, category: 'direct' },
          { name: 'Google Search', value: 40, category: 'organic' },
          { name: 'Social Media', value: 15, category: 'social' },
          { name: 'Referrals', value: 10, category: 'referral' }
        ],
        config: {
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          showLegend: true
        }
      },
      {
        id: 'performance_timeline',
        title: 'Performance Over Time',
        type: 'line',
        data: [
          { name: '00:00', value: 850, timestamp: new Date() },
          { name: '04:00', value: 720, timestamp: new Date() },
          { name: '08:00', value: 920, timestamp: new Date() },
          { name: '12:00', value: 1100, timestamp: new Date() },
          { name: '16:00', value: 980, timestamp: new Date() },
          { name: '20:00', value: 750, timestamp: new Date() }
        ],
        config: {
          xAxis: 'time',
          yAxis: 'response_time',
          showGrid: true,
          colors: ['#3B82F6']
        }
      },
      {
        id: 'conversion_funnel',
        title: 'Conversion Funnel',
        type: 'funnel',
        data: [
          { name: 'Page Views', value: 1000 },
          { name: 'Engaged Users', value: 650 },
          { name: 'Form Started', value: 320 },
          { name: 'Form Completed', value: 180 },
          { name: 'Converted', value: 95 }
        ],
        config: {
          colors: ['#10B981']
        }
      },
      {
        id: 'ab_test_performance',
        title: 'A/B Test Performance',
        type: 'bar',
        data: tests.slice(0, 5).map((test, index) => ({
          name: test.name,
          value: Math.random() * 100,
          category: test.status
        })),
        config: {
          colors: ['#8B5CF6', '#F59E0B'],
          showLegend: true
        }
      }
    ];
  };

  // Generate alerts from system data
  const generateAlerts = (obsData: any, integrations: any): DashboardAlert[] => {
    const alerts: DashboardAlert[] = [];

    // System health alerts
    if (obsData.systemStatus.overall !== 'operational') {
      alerts.push({
        id: 'system-status',
        type: 'warning',
        title: 'System Status Alert',
        message: `System status is ${obsData.systemStatus.overall}`,
        timestamp: new Date()
      });
    }

    // Integration alerts
    Object.entries(integrations).forEach(([name, result]: [string, any]) => {
      if (!result.success) {
        alerts.push({
          id: `integration-${name}`,
          type: 'error',
          title: 'Integration Error',
          message: `${name} integration is failing`,
          timestamp: new Date()
        });
      }
    });

    // Performance alerts
    if (obsData.keyMetrics.avgResponseTime > 2000) {
      alerts.push({
        id: 'performance-alert',
        type: 'warning',
        title: 'Performance Alert',
        message: 'Response times are above threshold',
        timestamp: new Date()
      });
    }

    return alerts;
  };

  // Filter metrics by category
  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return metrics;
    return metrics.filter(m => m.category === selectedCategory);
  }, [metrics, selectedCategory]);

  // Format metric values
  const formatMetricValue = (value: string | number, format: MetricCard['format']): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (format) {
      case 'percentage':
        return `${numValue}%`;
      case 'currency':
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(numValue);
      case 'time':
        return `${numValue}ms`;
      case 'bytes':
        return `${(numValue / 1024 / 1024).toFixed(1)} MB`;
      case 'number':
      default:
        return typeof value === 'number' ? value.toLocaleString() : value.toString();
    }
  };

  // Export dashboard data
  const exportData = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: filteredMetrics,
      charts,
      systemStatus,
      abTestResults,
      alerts
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics and system monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          
          {allowExport && (
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={(value: keyof typeof TIME_RANGES) => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIME_RANGES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(METRIC_CATEGORIES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
          <SelectTrigger className="w-40">
            <RefreshCw className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Manual</SelectItem>
            <SelectItem value="10000">10s</SelectItem>
            <SelectItem value="30000">30s</SelectItem>
            <SelectItem value="60000">1m</SelectItem>
            <SelectItem value="300000">5m</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  alert.type === 'error' && "bg-red-50 border-red-200 text-red-800",
                  alert.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800",
                  alert.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800",
                  alert.type === 'success' && "bg-green-50 border-green-200 text-green-800"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm opacity-80">{alert.message}</div>
                </div>
                <div className="text-xs opacity-60">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
                {alert.action && (
                  <Button size="sm" variant="outline" onClick={alert.action.onClick}>
                    {alert.action.label}
                  </Button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <div className={cn(
                    "p-2 rounded-full",
                    METRIC_CATEGORIES[metric.category].color,
                    "text-white"
                  )}>
                    {metric.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetricValue(metric.value, metric.format)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={cn(
                      "flex items-center gap-1",
                      metric.changeType === 'increase' && "text-green-600",
                      metric.changeType === 'decrease' && metric.category === 'performance' ? "text-green-600" : "text-red-600",
                      metric.changeType === 'neutral' && "text-gray-600"
                    )}>
                      {metric.changeType === 'increase' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : metric.changeType === 'decrease' ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : null}
                      {Math.abs(metric.change)}%
                    </div>
                    <span>from last {timeRange}</span>
                  </div>
                  
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress to target</span>
                        <span>{Math.round((parseFloat(metric.value.toString()) / metric.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(parseFloat(metric.value.toString()) / metric.target) * 100}
                        className="h-1"
                      />
                    </div>
                  )}

                  {metric.description && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {metric.description}
                    </div>
                  )}
                </CardContent>
                
                {/* Priority indicator */}
                <div className={cn(
                  "absolute top-0 right-0 w-2 h-full",
                  metric.priority === 'high' && "bg-red-500",
                  metric.priority === 'medium' && "bg-yellow-500",
                  metric.priority === 'low' && "bg-green-500"
                )}></div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Charts and Detailed Views */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="tests">A/B Tests</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <Card key={chart.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {chart.title}
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {/* Chart placeholder - in production, integrate with chart library */}
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>{chart.type.toUpperCase()} Chart</p>
                      <p className="text-sm">{chart.data.length} data points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(systemStatus.components).map(([name, component]: [string, any]) => (
                <Card key={name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {name}
                    </CardTitle>
                    <Badge variant={
                      component.status === 'healthy' ? 'default' :
                      component.status === 'degraded' ? 'secondary' : 'destructive'
                    }>
                      {component.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Response: {component.responseTime}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last check: {new Date(component.lastCheck).toLocaleTimeString()}
                    </div>
                    {component.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {component.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {abTestResults.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{test.name}</CardTitle>
                  <Badge variant="secondary">{test.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs">
                      Variants: {test.variants.length}
                    </div>
                    <div className="text-xs">
                      Started: {new Date(test.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      Primary Metric: {test.metrics.primary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {observability.logger.getLogs({ limit: 20 }).map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded text-sm",
                      log.level === 'error' && "bg-red-50",
                      log.level === 'warn' && "bg-yellow-50",
                      log.level === 'info' && "bg-blue-50"
                    )}
                  >
                    <Badge variant={
                      log.level === 'error' ? 'destructive' :
                      log.level === 'warn' ? 'secondary' : 'default'
                    }>
                      {log.level}
                    </Badge>
                    <div className="flex-1">
                      <div>{log.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.source}:{log.category} - {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}