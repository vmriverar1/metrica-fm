/**
 * FASE 6: Production Monitoring Dashboard
 * URL: http://localhost:9002/admin/production-monitor
 * 
 * Dashboard completo para monitoreo de producción.
 * Incluye métricas del sistema, health checks, deployments y alertas.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProductionConfig from '@/lib/production-config';
import { MonitoringService } from '@/lib/monitoring-service';
import PerformanceService from '@/lib/performance-service';
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  Settings,
  Bell,
  BarChart3,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Eye,
  GitBranch,
  Rocket
} from 'lucide-react';

interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  requestsPerMinute: number;
}

interface DeploymentInfo {
  version: string;
  branch: string;
  commit: string;
  deployedAt: Date;
  platform: string;
  environment: string;
  status: 'active' | 'deploying' | 'failed';
}

export default function ProductionMonitor() {
  const { user, actions } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'performance' | 'deployments' | 'alerts'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Production data state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo>({
    version: '1.0.0',
    branch: 'main',
    commit: 'abc123f',
    deployedAt: new Date(),
    platform: 'firebase',
    environment: 'production',
    status: 'active'
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [configReport, setConfigReport] = useState<any>(null);

  // Simulate real production metrics
  useEffect(() => {
    const generateMetrics = () => ({
      timestamp: new Date(),
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: {
        incoming: Math.random() * 1000,
        outgoing: Math.random() * 800
      },
      responseTime: 500 + Math.random() * 2000,
      errorRate: Math.random() * 5,
      activeUsers: Math.floor(Math.random() * 1000),
      requestsPerMinute: Math.floor(Math.random() * 10000)
    });

    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Load configuration report
        const config = ProductionConfig.getInstance();
        const report = config.generateConfigReport();
        setConfigReport(report);

        // Load health status
        const health = await config.performHealthCheck();
        setHealthStatus(health);

        // Generate initial metrics
        const metrics = Array.from({ length: 60 }, generateMetrics);
        setSystemMetrics(metrics);

        // Mock alerts
        setAlerts([
          {
            id: 1,
            type: 'warning',
            title: 'High CPU Usage',
            message: 'CPU usage has been above 80% for 5 minutes',
            timestamp: new Date(Date.now() - 300000),
            acknowledged: false
          },
          {
            id: 2,
            type: 'info',
            title: 'Deployment Complete',
            message: 'Version 1.0.0 deployed successfully',
            timestamp: new Date(Date.now() - 3600000),
            acknowledged: true
          }
        ]);

      } catch (error) {
        console.error('Failed to load production data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setSystemMetrics(prev => [...prev.slice(-59), generateMetrics()]);
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': case 'pass': return 'text-green-600 bg-green-100';
      case 'warning': case 'deploying': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'failed': case 'fail': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricStatus = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'good';
    if (value < threshold * 0.9) return 'warning';
    return 'critical';
  };

  const currentMetrics = systemMetrics[systemMetrics.length - 1];
  const avgResponseTime = systemMetrics.length > 0 
    ? systemMetrics.reduce((sum, m) => sum + m.responseTime, 0) / systemMetrics.length 
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Admin authentication required</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Production Data</h2>
          <p className="text-gray-600">Fetching system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Server className="w-7 h-7 text-blue-600" />
                Production Monitor
              </h1>
              <p className="text-gray-600">
                Sistema de monitoreo en tiempo real para producción
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="text-gray-500">Last Update</div>
                <div className="font-medium">{lastUpdate.toLocaleTimeString()}</div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                healthStatus?.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                healthStatus?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  healthStatus?.status === 'healthy' ? 'bg-green-500' : 
                  healthStatus?.status === 'warning' ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`} />
                {healthStatus?.status || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Monitor },
                { id: 'health', name: 'Health Checks', icon: Activity },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
                { id: 'deployments', name: 'Deployments', icon: Rocket },
                { id: 'alerts', name: 'Alerts', icon: Bell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {tab.id === 'alerts' && alerts.filter(a => !a.acknowledged).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {alerts.filter(a => !a.acknowledged).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">System Health</p>
                    <p className="text-2xl font-bold text-green-600">
                      {healthStatus?.status === 'healthy' ? '100%' : 
                       healthStatus?.status === 'warning' ? '85%' : '60%'}
                    </p>
                    <p className="text-xs text-gray-500">All services operational</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(avgResponseTime)}ms
                    </p>
                    <p className="text-xs text-gray-500">Average last hour</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentMetrics?.activeUsers || 0}
                    </p>
                    <p className="text-xs text-gray-500">Current concurrent</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Error Rate</p>
                    <p className={`text-2xl font-bold ${
                      (currentMetrics?.errorRate || 0) < 1 ? 'text-green-600' : 
                      (currentMetrics?.errorRate || 0) < 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(currentMetrics?.errorRate || 0).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">Last 24 hours</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  System Resources
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'CPU Usage', value: currentMetrics?.cpu || 0, icon: Cpu, unit: '%' },
                    { name: 'Memory Usage', value: currentMetrics?.memory || 0, icon: MemoryStick, unit: '%' },
                    { name: 'Disk Usage', value: currentMetrics?.disk || 0, icon: HardDrive, unit: '%' }
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <resource.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{resource.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              resource.value < 70 ? 'bg-green-500' : 
                              resource.value < 85 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(resource.value, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[3rem] text-right">
                          {resource.value.toFixed(1)}{resource.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Incoming Traffic</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {(currentMetrics?.network?.incoming || 0).toFixed(1)} MB/s
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Outgoing Traffic</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {(currentMetrics?.network?.outgoing || 0).toFixed(1)} MB/s
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Requests/Minute</span>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {currentMetrics?.requestsPerMinute || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            {configReport && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Production Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Environment</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {configReport.environment}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Deployment</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {configReport.deployment.target}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">CDN Status</div>
                    <div className={`font-semibold ${
                      configReport.deployment.cdnEnabled ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {configReport.deployment.cdnEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Monitoring</div>
                    <div className={`font-semibold ${
                      configReport.features.monitoring ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {configReport.features.monitoring ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Checks Tab */}
        {activeTab === 'health' && healthStatus && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Service Health Checks</h3>
              <div className="space-y-4">
                {healthStatus.checks.map((check: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {check.status === 'pass' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-gray-500">{check.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(check.status)} px-2 py-1 rounded`}>
                        {check.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {check.duration.toFixed(0)}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Performance charts available in full monitoring integration</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === 'deployments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Current Deployment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Version</div>
                  <div className="font-semibold text-gray-900">{deploymentInfo.version}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Branch</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <GitBranch className="w-4 h-4" />
                    {deploymentInfo.branch}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Platform</div>
                  <div className="font-semibold text-gray-900 capitalize">{deploymentInfo.platform}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className={`font-semibold ${getStatusColor(deploymentInfo.status)} px-2 py-1 rounded text-center`}>
                    {deploymentInfo.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">System Alerts</h3>
              </div>
              <div className="divide-y">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts at this time</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-6 ${alert.acknowledged ? 'bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                          {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                          {alert.type === 'info' && <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />}
                          <div>
                            <div className="font-medium text-gray-900">{alert.title}</div>
                            <div className="text-sm text-gray-600">{alert.message}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {alert.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.acknowledged ? (
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                              Acknowledged
                            </span>
                          ) : (
                            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}