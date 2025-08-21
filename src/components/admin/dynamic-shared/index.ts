/**
 * Dynamic Shared Components Index
 * Exports all shared components for dynamic content management
 */

// Core components
export { default as DynamicContentManager } from './DynamicContentManager'
export { default as SearchSystemManager } from './SearchSystemManager'
export { default as CategoryHierarchyManager } from './CategoryHierarchyManager'
export { default as MediaGalleryManager } from './MediaGalleryManager'
export { default as AnalyticsDashboard } from './AnalyticsDashboard'

// API services
export { dynamicContentAPI } from '@/lib/api/dynamic-content'
export { searchSystemAPI } from '@/lib/api/search-system'
export { analyticsAPI } from '@/lib/api/analytics'

// Types
export type { DynamicContentItem, ApiResponse, PaginationParams, PaginatedResponse } from '@/lib/api/dynamic-content'
export type { SearchSuggestion, SearchFilter, SearchResult, SearchQuery, SearchResponse, SearchAnalytics } from '@/lib/api/search-system'
export type { AnalyticsData, AnalyticsMetric, ChartDataPoint, ReportConfig, CustomMetric } from '@/lib/api/analytics'