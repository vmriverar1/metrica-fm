/**
 * API Service for Search System
 * Handles full-text search, indexing, and suggestions across all modules
 */

interface SearchSuggestion {
  id: string
  text: string
  type: 'content' | 'category' | 'author' | 'location' | 'tag'
  count: number
  module: 'newsletter' | 'portfolio' | 'careers'
}

interface SearchFilter {
  key: string
  label: string
  type: 'select' | 'range' | 'date' | 'multiselect'
  options?: { value: string; label: string; count?: number }[]
  min?: number
  max?: number
}

interface SearchResult {
  id: string
  title: string
  content: string
  module: 'newsletter' | 'portfolio' | 'careers'
  category: string
  author?: string
  location?: string
  date: string
  score: number
  highlighted: string
  metadata: Record<string, any>
}

interface SearchQuery {
  query: string
  modules: string[]
  filters: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  took: number
  suggestions?: SearchSuggestion[]
  aggregations?: Record<string, any>
}

interface SearchAnalytics {
  popularQueries: { query: string; count: number; trend: number }[]
  recentQueries: string[]
  noResultQueries: { query: string; count: number }[]
  searchVolume: { date: string; count: number }[]
  avgResponseTime: number
}

class SearchSystemAPI {
  private baseUrl: string

  constructor(baseUrl = '/api/admin/search') {
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
   * Perform full-text search across modules
   */
  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: searchQuery.query,
      modules: searchQuery.modules.join(','),
      ...(searchQuery.sortBy && { sortBy: searchQuery.sortBy }),
      ...(searchQuery.sortOrder && { sortOrder: searchQuery.sortOrder }),
      page: (searchQuery.page || 1).toString(),
      limit: (searchQuery.limit || 20).toString(),
    })

    // Add filters
    Object.entries(searchQuery.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(`filter[${key}]`, value.toString())
      }
    })

    const response = await this.request<SearchResponse>(`?${params}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Search failed')
    }

    return response.data!
  }

  /**
   * Get search suggestions as user types
   */
  async getSuggestions(
    query: string,
    modules: string[] = ['newsletter', 'portfolio', 'careers'],
    limit = 10
  ): Promise<SearchSuggestion[]> {
    if (query.length < 2) return []

    const params = new URLSearchParams({
      q: query,
      modules: modules.join(','),
      limit: limit.toString(),
    })

    const response = await this.request<SearchSuggestion[]>(
      `/suggestions?${params}`
    )

    return response.success ? response.data! : []
  }

  /**
   * Get available filters for search
   */
  async getFilters(modules: string[]): Promise<SearchFilter[]> {
    const params = new URLSearchParams({
      modules: modules.join(','),
    })

    const response = await this.request<SearchFilter[]>(`/filters?${params}`)
    return response.success ? response.data! : []
  }

  /**
   * Build or rebuild search index
   */
  async rebuildIndex(
    modules: string[] = ['newsletter', 'portfolio', 'careers']
  ): Promise<{ success: boolean; message?: string; stats?: any }> {
    const response = await this.request<{
      message: string
      stats: any
    }>('/index/rebuild', {
      method: 'POST',
      body: JSON.stringify({ modules }),
    })

    return {
      success: response.success,
      message: response.data?.message,
      stats: response.data?.stats,
    }
  }

  /**
   * Get search index status
   */
  async getIndexStatus(): Promise<{
    status: 'building' | 'ready' | 'error'
    lastUpdated: string
    totalDocuments: number
    moduleStats: Record<string, { documents: number; lastUpdated: string }>
  }> {
    const response = await this.request<any>('/index/status')
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get index status')
    }

    return response.data!
  }

  /**
   * Add or update document in search index
   */
  async indexDocument(
    module: 'newsletter' | 'portfolio' | 'careers',
    document: {
      id: string
      title: string
      content: string
      category: string
      tags: string[]
      metadata: Record<string, any>
    }
  ): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<{ message: string }>('/index/document', {
      method: 'POST',
      body: JSON.stringify({ module, document }),
    })

    return {
      success: response.success,
      message: response.data?.message,
    }
  }

  /**
   * Remove document from search index
   */
  async removeDocument(
    module: 'newsletter' | 'portfolio' | 'careers',
    documentId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<{ message: string }>(
      `/index/document/${module}/${documentId}`,
      { method: 'DELETE' }
    )

    return {
      success: response.success,
      message: response.data?.message,
    }
  }

  /**
   * Get search analytics
   */
  async getAnalytics(
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<SearchAnalytics> {
    const response = await this.request<SearchAnalytics>(
      `/analytics?timeRange=${timeRange}`
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to get search analytics')
    }

    return response.data!
  }

  /**
   * Track search query for analytics
   */
  async trackSearch(
    query: string,
    results: number,
    responseTime: number,
    modules: string[]
  ): Promise<void> {
    await this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        query,
        results,
        responseTime,
        modules,
        timestamp: new Date().toISOString(),
      }),
    })
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit = 10): Promise<string[]> {
    const response = await this.request<string[]>(
      `/popular?limit=${limit}`
    )

    return response.success ? response.data! : []
  }

  /**
   * Get recent search terms
   */
  async getRecentSearches(limit = 10): Promise<string[]> {
    const response = await this.request<string[]>(
      `/recent?limit=${limit}`
    )

    return response.success ? response.data! : []
  }

  /**
   * Export search data
   */
  async exportSearchData(
    format: 'json' | 'csv' | 'excel',
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/export?format=${format}&timeRange=${timeRange}`,
      {
        method: 'GET',
        headers: {
          'Accept': format === 'json' ? 'application/json' : 
                   format === 'csv' ? 'text/csv' : 
                   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  /**
   * Configure search settings
   */
  async updateSearchSettings(settings: {
    enableAutoComplete?: boolean
    enableSpellCheck?: boolean
    maxSuggestions?: number
    indexUpdateInterval?: number
    searchResultsPerPage?: number
    highlightSettings?: {
      enabled: boolean
      preTag: string
      postTag: string
    }
  }): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<{ message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })

    return {
      success: response.success,
      message: response.data?.message,
    }
  }

  /**
   * Get current search settings
   */
  async getSearchSettings(): Promise<any> {
    const response = await this.request<any>('/settings')
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get search settings')
    }

    return response.data!
  }
}

// Create singleton instance
export const searchSystemAPI = new SearchSystemAPI()

// Export types for use in components
export type {
  SearchSuggestion,
  SearchFilter,
  SearchResult,
  SearchQuery,
  SearchResponse,
  SearchAnalytics,
}