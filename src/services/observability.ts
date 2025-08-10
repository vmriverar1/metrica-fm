'use client';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  category: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stack?: string;
  tags: string[];
}

export interface Metric {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  value: number;
  timestamp: Date;
  dimensions: Record<string, string>;
  unit?: string;
  description?: string;
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'silenced';
  triggeredAt?: Date;
  resolvedAt?: Date;
  notifications: NotificationChannel[];
  metadata: Record<string, any>;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  timeWindow: number; // minutes
  evaluationFrequency: number; // minutes
  minDataPoints: number;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string; // email address, slack channel, webhook URL, phone number
  enabled: boolean;
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage';
  components: {
    frontend: HealthCheck;
    api: HealthCheck;
    database: HealthCheck;
    cache: HealthCheck;
    integrations: HealthCheck[];
    cdn: HealthCheck;
  };
  incidents: Array<{
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    startTime: Date;
    endTime?: Date;
    updates: Array<{
      timestamp: Date;
      message: string;
      status: string;
    }>;
  }>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private logLevel: LogEntry['level'] = 'info';

  constructor(maxLogs?: number, logLevel?: LogEntry['level']) {
    this.maxLogs = maxLogs || 10000;
    this.logLevel = logLevel || 'info';
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels: Record<LogEntry['level'], number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };
    return levels[level] >= levels[this.logLevel];
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    source: string,
    category: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      source,
      category,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId(),
      metadata,
      stack: error?.stack,
      tags: this.generateTags(level, source, category)
    };
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Add to in-memory logs
    this.logs.push(entry);

    // Trim logs if exceeding max size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with color coding
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m'  // magenta
    };
    const reset = '\x1b[0m';
    
    console.log(
      `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ` +
      `${entry.timestamp.toISOString()} ` +
      `${entry.source}:${entry.category} - ${entry.message}`
    );

    if (entry.metadata) {
      console.log('Metadata:', entry.metadata);
    }

    if (entry.stack) {
      console.log('Stack trace:', entry.stack);
    }

    // Send to external logging service
    this.sendToExternalLogger(entry);
  }

  debug(message: string, source: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, source, category, metadata);
    this.log(entry);
  }

  info(message: string, source: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, source, category, metadata);
    this.log(entry);
  }

  warn(message: string, source: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, source, category, metadata);
    this.log(entry);
  }

  error(message: string, source: string, category: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('error', message, source, category, metadata, error);
    this.log(entry);
  }

  fatal(message: string, source: string, category: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('fatal', message, source, category, metadata, error);
    this.log(entry);
  }

  getLogs(filters?: {
    level?: LogEntry['level'];
    source?: string;
    category?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.source) {
        filteredLogs = filteredLogs.filter(log => log.source === filters.source);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, this would get the current user ID from auth context
    return typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // Get session ID from storage or generate one
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
    return undefined;
  }

  private getCurrentRequestId(): string | undefined {
    // In a real app, this would be set by middleware
    return `req_${Date.now()}`;
  }

  private generateTags(level: LogEntry['level'], source: string, category: string): string[] {
    const tags = [level, source, category];
    
    // Add environment tag
    tags.push(process.env.NODE_ENV || 'development');
    
    // Add client-side specific tags
    if (typeof window !== 'undefined') {
      tags.push('client-side');
      tags.push(`browser-${navigator.userAgent.split(' ')[0]}`);
    }
    
    return tags;
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // In production, send to external logging service (DataDog, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production' && process.env.EXTERNAL_LOGGING_ENDPOINT) {
      try {
        await fetch(process.env.EXTERNAL_LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (error) {
        console.error('Failed to send log to external service:', error);
      }
    }
  }
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private timers: Map<string, Date> = new Map();

  increment(name: string, dimensions: Record<string, string> = {}, value: number = 1): void {
    const key = this.createMetricKey(name, dimensions);
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);

    this.recordMetric({
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'counter',
      value: currentValue + value,
      timestamp: new Date(),
      dimensions
    });
  }

  gauge(name: string, value: number, dimensions: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, dimensions);
    this.gauges.set(key, value);

    this.recordMetric({
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'gauge',
      value,
      timestamp: new Date(),
      dimensions
    });
  }

  histogram(name: string, value: number, dimensions: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, dimensions);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    this.recordMetric({
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'histogram',
      value,
      timestamp: new Date(),
      dimensions
    });
  }

  startTimer(name: string, dimensions: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, dimensions);
    this.timers.set(key, new Date());
  }

  endTimer(name: string, dimensions: Record<string, string> = {}): number {
    const key = this.createMetricKey(name, dimensions);
    const startTime = this.timers.get(key);
    
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime.getTime();
    this.timers.delete(key);

    this.recordMetric({
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'timer',
      value: duration,
      timestamp: new Date(),
      dimensions,
      unit: 'milliseconds'
    });

    return duration;
  }

  private createMetricKey(name: string, dimensions: Record<string, string>): string {
    const dimensionString = Object.entries(dimensions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return dimensionString ? `${name}[${dimensionString}]` : name;
  }

  private recordMetric(metric: Metric): void {
    this.metrics.push(metric);
    
    // Trim metrics if too many (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to external metrics service
    this.sendToExternalMetrics(metric);
  }

  private async sendToExternalMetrics(metric: Metric): Promise<void> {
    // In production, send to external metrics service (DataDog, New Relic, etc.)
    if (process.env.NODE_ENV === 'production' && process.env.METRICS_ENDPOINT) {
      try {
        await fetch(process.env.METRICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric)
        });
      } catch (error) {
        console.error('Failed to send metric to external service:', error);
      }
    }
  }

  getMetrics(filters?: {
    name?: string;
    type?: Metric['type'];
    startTime?: Date;
    endTime?: Date;
  }): Metric[] {
    let filteredMetrics = [...this.metrics];

    if (filters) {
      if (filters.name) {
        filteredMetrics = filteredMetrics.filter(m => m.name === filters.name);
      }
      if (filters.type) {
        filteredMetrics = filteredMetrics.filter(m => m.type === filters.type);
      }
      if (filters.startTime) {
        filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filteredMetrics = filteredMetrics.filter(m => m.timestamp <= filters.endTime!);
      }
    }

    return filteredMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getStatistics(name: string, type: Metric['type']): {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
    latest: number;
  } | null {
    const metrics = this.getMetrics({ name, type });
    
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: metrics[0].value // Latest value (first in sorted array)
    };
  }
}

class AlertManager {
  private alerts: Alert[] = [];
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(logger: Logger, metrics: MetricsCollector) {
    this.logger = logger;
    this.metrics = metrics;
    this.startAlertEvaluation();
  }

  createAlert(alert: Omit<Alert, 'id' | 'status' | 'triggeredAt' | 'resolvedAt'>): string {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      triggeredAt: undefined,
      resolvedAt: undefined
    };

    this.alerts.push(newAlert);
    
    this.logger.info(
      `Alert created: ${newAlert.name}`,
      'AlertManager',
      'alert_lifecycle',
      { alertId: newAlert.id, condition: newAlert.condition }
    );

    return newAlert.id;
  }

  updateAlert(alertId: string, updates: Partial<Alert>): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;

    this.alerts[alertIndex] = { ...this.alerts[alertIndex], ...updates };
    
    this.logger.info(
      `Alert updated: ${this.alerts[alertIndex].name}`,
      'AlertManager',
      'alert_lifecycle',
      { alertId, updates }
    );

    return true;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status === 'resolved') return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.logger.info(
      `Alert resolved: ${alert.name}`,
      'AlertManager',
      'alert_lifecycle',
      { alertId }
    );

    return true;
  }

  private startAlertEvaluation(): void {
    // Evaluate alerts every minute
    setInterval(() => {
      this.evaluateAlerts();
    }, 60000);
  }

  private evaluateAlerts(): void {
    const activeAlerts = this.alerts.filter(a => a.status === 'active');

    activeAlerts.forEach(alert => {
      try {
        const shouldTrigger = this.evaluateAlertCondition(alert.condition);
        
        if (shouldTrigger && !alert.triggeredAt) {
          this.triggerAlert(alert);
        } else if (!shouldTrigger && alert.triggeredAt && alert.status === 'active') {
          this.resolveAlert(alert.id);
        }
      } catch (error) {
        this.logger.error(
          `Failed to evaluate alert: ${alert.name}`,
          'AlertManager',
          'alert_evaluation',
          error instanceof Error ? error : undefined,
          { alertId: alert.id }
        );
      }
    });
  }

  private evaluateAlertCondition(condition: AlertCondition): boolean {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - condition.timeWindow * 60 * 1000);
    
    const metrics = this.metrics.getMetrics({
      name: condition.metric,
      startTime,
      endTime
    });

    if (metrics.length < condition.minDataPoints) {
      return false; // Not enough data points
    }

    // Get the latest metric value
    const latestMetric = metrics[0];
    if (!latestMetric) return false;

    // Evaluate condition
    switch (condition.operator) {
      case 'gt':
        return latestMetric.value > condition.threshold;
      case 'gte':
        return latestMetric.value >= condition.threshold;
      case 'lt':
        return latestMetric.value < condition.threshold;
      case 'lte':
        return latestMetric.value <= condition.threshold;
      case 'eq':
        return latestMetric.value === condition.threshold;
      case 'neq':
        return latestMetric.value !== condition.threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(alert: Alert): Promise<void> {
    alert.triggeredAt = new Date();
    alert.status = 'active';

    this.logger.warn(
      `Alert triggered: ${alert.name}`,
      'AlertManager',
      'alert_triggered',
      {
        alertId: alert.id,
        severity: alert.severity,
        condition: alert.condition
      }
    );

    // Send notifications
    await this.sendAlertNotifications(alert);

    // Record alert trigger metric
    this.metrics.increment('alerts.triggered', {
      alert_name: alert.name,
      severity: alert.severity
    });
  }

  private async sendAlertNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.notifications.filter(c => c.enabled)) {
      try {
        await this.sendNotification(alert, channel);
      } catch (error) {
        this.logger.error(
          `Failed to send alert notification via ${channel.type}`,
          'AlertManager',
          'notification_error',
          error instanceof Error ? error : undefined,
          { alertId: alert.id, channelType: channel.type, target: channel.target }
        );
      }
    }
  }

  private async sendNotification(alert: Alert, channel: NotificationChannel): Promise<void> {
    const message = this.formatAlertMessage(alert);

    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(channel.target, alert.name, message);
        break;
      case 'slack':
        await this.sendSlackNotification(channel.target, message);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel.target, alert);
        break;
      case 'sms':
        await this.sendSMSNotification(channel.target, message);
        break;
    }

    this.logger.info(
      `Alert notification sent via ${channel.type}`,
      'AlertManager',
      'notification_sent',
      { alertId: alert.id, channelType: channel.type }
    );
  }

  private formatAlertMessage(alert: Alert): string {
    return `🚨 ALERT: ${alert.name}\n\n` +
           `Severity: ${alert.severity.toUpperCase()}\n` +
           `Description: ${alert.description}\n` +
           `Condition: ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}\n` +
           `Triggered at: ${alert.triggeredAt?.toISOString()}`;
  }

  private async sendEmailNotification(email: string, subject: string, message: string): Promise<void> {
    // In production, integrate with email service
    console.log(`Email notification sent to ${email}: ${subject}`);
  }

  private async sendSlackNotification(channel: string, message: string): Promise<void> {
    // In production, integrate with Slack API
    console.log(`Slack notification sent to ${channel}: ${message}`);
  }

  private async sendWebhookNotification(url: string, alert: Alert): Promise<void> {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert_id: alert.id,
        name: alert.name,
        severity: alert.severity,
        status: alert.status,
        triggered_at: alert.triggeredAt,
        condition: alert.condition
      })
    });
  }

  private async sendSMSNotification(phone: string, message: string): Promise<void> {
    // In production, integrate with SMS service (Twilio, etc.)
    console.log(`SMS notification sent to ${phone}: ${message}`);
  }

  getAlerts(filters?: { status?: Alert['status']; severity?: Alert['severity'] }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters) {
      if (filters.status) {
        filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
      }
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
      }
    }

    return filteredAlerts.sort((a, b) => 
      (b.triggeredAt?.getTime() || 0) - (a.triggeredAt?.getTime() || 0)
    );
  }
}

class HealthMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(logger: Logger, metrics: MetricsCollector) {
    this.logger = logger;
    this.metrics = metrics;
    this.setupDefaultHealthChecks();
    this.startHealthMonitoring();
  }

  private setupDefaultHealthChecks(): void {
    // Frontend health (always healthy if code is running)
    this.addHealthCheck('frontend', 'Frontend Application', async () => ({
      status: 'healthy',
      responseTime: 0,
      details: { version: '1.0.0', timestamp: new Date().toISOString() }
    }));

    // API health
    this.addHealthCheck('api', 'API Endpoints', async () => {
      try {
        const start = Date.now();
        const response = await fetch('/api/health', { method: 'HEAD' });
        const responseTime = Date.now() - start;
        
        return {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
          details: { status_code: response.status }
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Database health (mock)
    this.addHealthCheck('database', 'Database Connection', async () => {
      // Mock database check
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      const responseTime = Date.now() - start;

      return {
        status: Math.random() > 0.1 ? 'healthy' : 'degraded', // 90% healthy
        responseTime,
        details: { 
          connections: Math.floor(Math.random() * 100),
          query_time_avg: Math.random() * 50
        }
      };
    });

    // Cache health (mock)
    this.addHealthCheck('cache', 'Cache System', async () => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      const responseTime = Date.now() - start;

      return {
        status: Math.random() > 0.05 ? 'healthy' : 'degraded', // 95% healthy
        responseTime,
        details: { 
          hit_rate: Math.random(),
          memory_usage: Math.random() * 100
        }
      };
    });
  }

  addHealthCheck(id: string, name: string, checkFunction: () => Promise<{
    status: HealthCheck['status'];
    responseTime: number;
    details?: Record<string, any>;
    error?: string;
  }>): void {
    this.healthChecks.set(id, {
      id,
      name,
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: 0,
      details: {},
      error: undefined
    });

    // Store the check function separately (not serializable)
    (this.healthChecks.get(id) as any).checkFunction = checkFunction;
  }

  private startHealthMonitoring(): void {
    // Run health checks every 30 seconds
    setInterval(async () => {
      await this.runAllHealthChecks();
    }, 30000);

    // Initial run
    setTimeout(() => this.runAllHealthChecks(), 1000);
  }

  private async runAllHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.healthChecks.entries()).map(async ([id, check]) => {
      try {
        const checkFunction = (check as any).checkFunction;
        if (checkFunction) {
          const result = await checkFunction();
          
          this.healthChecks.set(id, {
            id,
            name: check.name,
            status: result.status,
            lastCheck: new Date(),
            responseTime: result.responseTime,
            details: result.details,
            error: result.error
          });

          // Record metrics
          this.metrics.gauge(`health.${id}.response_time`, result.responseTime, { service: id });
          this.metrics.gauge(`health.${id}.status`, result.status === 'healthy' ? 1 : 0, { service: id });

          if (result.status !== 'healthy') {
            this.logger.warn(
              `Health check failed: ${check.name}`,
              'HealthMonitor',
              'health_check',
              { serviceId: id, status: result.status, error: result.error }
            );
          }
        }
      } catch (error) {
        this.healthChecks.set(id, {
          id,
          name: check.name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        this.logger.error(
          `Health check error: ${check.name}`,
          'HealthMonitor',
          'health_check_error',
          error instanceof Error ? error : undefined,
          { serviceId: id }
        );
      }
    });

    await Promise.all(checkPromises);
  }

  getSystemStatus(): SystemStatus {
    const components = Array.from(this.healthChecks.values());
    const unhealthyComponents = components.filter(c => c.status === 'unhealthy').length;
    const degradedComponents = components.filter(c => c.status === 'degraded').length;

    let overall: SystemStatus['overall'];
    if (unhealthyComponents > 0) {
      overall = 'outage';
    } else if (degradedComponents > 0) {
      overall = 'degraded';
    } else {
      overall = 'operational';
    }

    // Mock system status structure
    return {
      overall,
      components: {
        frontend: this.healthChecks.get('frontend') || this.createUnknownHealthCheck('frontend'),
        api: this.healthChecks.get('api') || this.createUnknownHealthCheck('api'),
        database: this.healthChecks.get('database') || this.createUnknownHealthCheck('database'),
        cache: this.healthChecks.get('cache') || this.createUnknownHealthCheck('cache'),
        integrations: [], // Would be populated with external integration health
        cdn: this.createUnknownHealthCheck('cdn') // Mock CDN health
      },
      incidents: [] // Would be populated with active incidents
    };
  }

  private createUnknownHealthCheck(id: string): HealthCheck {
    return {
      id,
      name: id,
      status: 'unhealthy',
      lastCheck: new Date(),
      responseTime: 0,
      error: 'Health check not configured'
    };
  }

  getHealthCheck(id: string): HealthCheck | null {
    return this.healthChecks.get(id) || null;
  }

  getAllHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }
}

// Main Observability class that brings everything together
export class ObservabilityManager {
  public logger: Logger;
  public metrics: MetricsCollector;
  public alerts: AlertManager;
  public health: HealthMonitor;

  constructor(config?: {
    logLevel?: LogEntry['level'];
    maxLogs?: number;
  }) {
    this.logger = new Logger(config?.maxLogs, config?.logLevel);
    this.metrics = new MetricsCollector();
    this.alerts = new AlertManager(this.logger, this.metrics);
    this.health = new HealthMonitor(this.logger, this.metrics);

    this.setupDefaultAlerts();
    this.logger.info('Observability system initialized', 'ObservabilityManager', 'startup');
  }

  private setupDefaultAlerts(): void {
    // High error rate alert
    this.alerts.createAlert({
      name: 'High Error Rate',
      description: 'Error rate is above acceptable threshold',
      condition: {
        metric: 'errors.count',
        operator: 'gt',
        threshold: 10,
        timeWindow: 5, // 5 minutes
        evaluationFrequency: 1, // Check every minute
        minDataPoints: 3
      },
      severity: 'high',
      notifications: [
        { type: 'email', target: 'dev-team@metricadip.com', enabled: true },
        { type: 'slack', target: '#alerts', enabled: true }
      ],
      metadata: { team: 'engineering', escalation: 'on-call' }
    });

    // Slow response time alert
    this.alerts.createAlert({
      name: 'Slow Response Time',
      description: 'API response time is above acceptable threshold',
      condition: {
        metric: 'api.response_time',
        operator: 'gt',
        threshold: 3000, // 3 seconds
        timeWindow: 10,
        evaluationFrequency: 2,
        minDataPoints: 5
      },
      severity: 'medium',
      notifications: [
        { type: 'slack', target: '#performance', enabled: true }
      ],
      metadata: { team: 'engineering' }
    });

    // System health alert
    this.alerts.createAlert({
      name: 'System Unhealthy',
      description: 'Critical system component is unhealthy',
      condition: {
        metric: 'health.database.status',
        operator: 'eq',
        threshold: 0, // 0 = unhealthy, 1 = healthy
        timeWindow: 2,
        evaluationFrequency: 1,
        minDataPoints: 2
      },
      severity: 'critical',
      notifications: [
        { type: 'email', target: 'ops-team@metricadip.com', enabled: true },
        { type: 'slack', target: '#critical-alerts', enabled: true },
        { type: 'sms', target: '+51999999999', enabled: false }
      ],
      metadata: { team: 'ops', escalation: 'immediate' }
    });
  }

  // Convenience methods for common operations
  trackPageView(url: string, userId?: string): void {
    this.metrics.increment('page_views.total', { page: url });
    this.logger.info(`Page view: ${url}`, 'WebApp', 'navigation', { userId });
  }

  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.metrics.increment('user_actions.total', { action });
    this.logger.info(`User action: ${action}`, 'WebApp', 'user_interaction', { userId, ...metadata });
  }

  trackError(error: Error, context?: string, userId?: string): void {
    this.metrics.increment('errors.count', { context: context || 'unknown' });
    this.logger.error(
      `Application error: ${error.message}`,
      'WebApp',
      'error',
      error,
      { userId, context }
    );
  }

  trackAPICall(endpoint: string, method: string, statusCode: number, responseTime: number): void {
    this.metrics.increment('api.calls.total', { endpoint, method, status: statusCode.toString() });
    this.metrics.histogram('api.response_time', responseTime, { endpoint, method });
    
    if (statusCode >= 400) {
      this.metrics.increment('api.errors.total', { endpoint, method, status: statusCode.toString() });
    }
  }

  getObservabilityDashboard(): {
    systemStatus: SystemStatus;
    recentLogs: LogEntry[];
    activeAlerts: Alert[];
    keyMetrics: {
      pageViews: number;
      errorRate: number;
      avgResponseTime: number;
      activeUsers: number;
    };
  } {
    const systemStatus = this.health.getSystemStatus();
    const recentLogs = this.logger.getLogs({ limit: 50 });
    const activeAlerts = this.alerts.getAlerts({ status: 'active' });

    // Calculate key metrics
    const pageViewStats = this.metrics.getStatistics('page_views.total', 'counter');
    const errorStats = this.metrics.getStatistics('errors.count', 'counter');
    const responseTimeStats = this.metrics.getStatistics('api.response_time', 'histogram');

    return {
      systemStatus,
      recentLogs,
      activeAlerts,
      keyMetrics: {
        pageViews: pageViewStats?.sum || 0,
        errorRate: errorStats?.sum || 0,
        avgResponseTime: responseTimeStats?.average || 0,
        activeUsers: Math.floor(Math.random() * 100) // Mock active users
      }
    };
  }
}

// Global instance
export const observability = new ObservabilityManager({
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Export individual services for direct use
export const logger = observability.logger;
export const metrics = observability.metrics;
export const alerts = observability.alerts;
export const health = observability.health;