/**
 * API Service for Analytics Dashboard
 * Handles metrics, performance data, and reporting across all modules
 */

interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  timeRange: string
  module?: string
}

interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

interface AnalyticsData {
  overview: {
    totalItems: number
    totalViews: number
    totalEngagement: number
    avgPerformance: number
  }
  modules: {
    newsletter: {
      articles: number
      authors: number
      categories: number
      totalReads: number
      avgReadTime: number
      topArticles: { id: string; title: string; views: number }[]
      readsOverTime: ChartDataPoint[]
      categoryDistribution: { category: string; count: number; percentage: number }[]
    }
    portfolio: {
      projects: number
      clients: number
      categories: number
      totalInvestment: number
      avgProjectValue: number
      topProjects: { id: string; title: string; views: number; investment: number }[]
      projectsOverTime: ChartDataPoint[]
      investmentByCategory: { category: string; amount: number; percentage: number }[]
      geographicDistribution: Record<string, number>
    }
    careers: {
      activeJobs: number
      applications: number
      departments: number
      avgTimeToHire: number
      fillRate: number
      topJobs: { id: string; title: string; applications: number }[]
      applicationsOverTime: ChartDataPoint[]
      departmentDistribution: { department: string; jobs: number; applications: number }[]
    }
  }
  performance: {
    pageLoadTimes: Record<string, number>
    searchQueries: { query: string; count: number }[]
    popularContent: { id: string; title: string; module: string; views: number }[]
    userJourney: { step: string; users: number; dropoff: number }[]
  }
}

interface ReportConfig {
  modules: string[]
  timeRange: '7d' | '30d' | '90d' | '1y'
  metrics: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeCharts: boolean
  includeRawData: boolean
}

interface CustomMetric {
  id: string
  name: string
  description: string
  query: string
  module: string
  type: 'count' | 'sum' | 'avg' | 'percentage'
  format: 'number' | 'currency' | 'percentage' | 'duration'
}

class AnalyticsAPI {
  private baseUrl: string

  constructor(baseUrl = '/api/admin/analytics') {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(
    modules: string[] = ['newsletter', 'portfolio', 'careers'],
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<AnalyticsData> {
    const params = new URLSearchParams({
      modules: modules.join(','),
      timeRange,
    })

    const response = await this.request<AnalyticsData>(`?${params}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch analytics data')
    }

    return response.data!
  }

  /**
   * Get specific metrics for a module
   */
  async getModuleMetrics(
    module: 'newsletter' | 'portfolio' | 'careers',
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<AnalyticsMetric[]> {
    const response = await this.request<AnalyticsMetric[]>(
      `/modules/${module}?timeRange=${timeRange}`
    )

    return response.success ? response.data! : []
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    pageLoadTimes: Record<string, number>
    apiResponseTimes: Record<string, number>
    errorRates: Record<string, number>
    uptime: number
    throughput: number
  }> {
    const response = await this.request<any>(
      `/performance?timeRange=${timeRange}`
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch performance metrics')
    }

    return response.data!
  }

  /**
   * Get user engagement metrics
   */
  async getEngagementMetrics(
    module?: string,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    sessionDuration: number
    pageViews: number
    bounceRate: number
    conversions: number
    topContent: { id: string; title: string; engagement: number }[]
    engagementOverTime: ChartDataPoint[]
  }> {
    const params = new URLSearchParams({ timeRange })
    if (module) params.append('module', module)

    const response = await this.request<any>(`/engagement?${params}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch engagement metrics')
    }

    return response.data!
  }

  /**
   * Track custom event
   */
  async trackEvent(
    event: string,
    properties: Record<string, any>,
    module?: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<{ message: string }>('/events/track', {
      method: 'POST',
      body: JSON.stringify({
        event,
        properties,
        module,
        timestamp: new Date().toISOString(),
      }),
    })

    return {
      success: response.success,
      message: response.data?.message,
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeData(): Promise<{
    activeUsers: number
    currentViews: { page: string; users: number }[]
    recentEvents: { event: string; count: number; timestamp: string }[]
    systemStatus: 'healthy' | 'warning' | 'error'
  }> {
    const response = await this.request<any>('/realtime')

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch real-time data')
    }

    return response.data!
  }

  /**
   * Generate and download report
   */
  async generateReport(config: ReportConfig): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`)
    }

    return response.blob()
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<{
    id: string
    name: string
    description: string
    modules: string[]
    metrics: string[]
    defaultTimeRange: string
  }[]> {
    const response = await this.request<any[]>('/reports/templates')
    return response.success ? response.data! : []
  }

  /**
   * Schedule automated report
   */
  async scheduleReport(schedule: {
    templateId: string
    frequency: 'daily' | 'weekly' | 'monthly'
    timeRange: '7d' | '30d' | '90d'
    recipients: string[]
    format: 'pdf' | 'excel'
    enabled: boolean
  }): Promise<{ success: boolean; scheduleId?: string; message?: string }> {
    const response = await this.request<{ scheduleId: string; message: string }>(
      '/reports/schedule',
      {
        method: 'POST',
        body: JSON.stringify(schedule),
      }
    )

    return {
      success: response.success,
      scheduleId: response.data?.scheduleId,
      message: response.data?.message,
    }
  }

  /**
   * Get custom metrics
   */
  async getCustomMetrics(): Promise<CustomMetric[]> {
    const response = await this.request<CustomMetric[]>('/metrics/custom')
    return response.success ? response.data! : []
  }

  /**
   * Create custom metric
   */
  async createCustomMetric(metric: Omit<CustomMetric, 'id'>): Promise<{
    success: boolean
    metric?: CustomMetric
    message?: string
  }> {
    const response = await this.request<{ metric: CustomMetric; message: string }>(
      '/metrics/custom',
      {
        method: 'POST',
        body: JSON.stringify(metric),
      }
    )

    return {
      success: response.success,
      metric: response.data?.metric,
      message: response.data?.message,
    }
  }

  /**
   * Get goal tracking data
   */
  async getGoals(): Promise<{
    id: string
    name: string
    target: number
    current: number
    progress: number
    deadline: string
    status: 'on-track' | 'at-risk' | 'missed'
  }[]> {
    const response = await this.request<any[]>('/goals')
    return response.success ? response.data! : []
  }

  /**
   * Set or update goal
   */
  async setGoal(goal: {
    name: string
    target: number
    deadline: string
    metric: string
    module?: string
  }): Promise<{ success: boolean; goalId?: string; message?: string }> {
    const response = await this.request<{ goalId: string; message: string }>(
      '/goals',
      {
        method: 'POST',
        body: JSON.stringify(goal),
      }
    )

    return {
      success: response.success,
      goalId: response.data?.goalId,
      message: response.data?.message,
    }
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(
    funnel: string[],
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    steps: { step: string; users: number; conversion: number }[]
    totalConversion: number
    dropoffPoints: { step: string; dropoff: number }[]
  }> {
    const response = await this.request<any>('/funnel', {
      method: 'POST',
      body: JSON.stringify({ funnel, timeRange }),
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to get funnel analysis')
    }

    return response.data!
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(
    metric: string,
    timeRange: '30d' | '90d' | '1y' = '90d'
  ): Promise<{
    cohorts: { period: string; users: number; retention: number[] }[]
    avgRetention: number[]
    insights: string[]
  }> {
    const response = await this.request<any>(
      `/cohort?metric=${metric}&timeRange=${timeRange}`
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to get cohort analysis')
    }

    return response.data!
  }

  /**
   * Export analytics data
   */
  async exportData(
    modules: string[],
    timeRange: '7d' | '30d' | '90d' | '1y',
    format: 'csv' | 'json' | 'excel'
  ): Promise<Blob> {
    const params = new URLSearchParams({
      modules: modules.join(','),
      timeRange,
      format,
    })

    const response = await fetch(`${this.baseUrl}/export?${params}`)

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }
}

// Create singleton instance
export const analyticsAPI = new AnalyticsAPI()

// Export types for use in components
export type {
  AnalyticsData,
  AnalyticsMetric,
  ChartDataPoint,
  ReportConfig,
  CustomMetric,
}