/**
 * API Service for Dynamic Content Management
 * Handles CRUD operations for Newsletter, Portfolio, and Careers modules
 */

interface DynamicContentItem {
  id: string
  title: string
  status: 'published' | 'draft' | 'archived'
  category: string
  lastModified: string
  author?: string
  featured?: boolean
  metadata?: Record<string, any>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginationParams {
  page: number
  limit: number
  search?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class DynamicContentAPI {
  private baseUrl: string

  constructor(baseUrl = '/api/admin/dynamic') {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * Get paginated content for a specific module
   */
  async getContent<T = DynamicContentItem>(
    module: 'newsletter' | 'portfolio' | 'careers',
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    })

    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(`filter[${key}]`, value.toString())
        }
      })
    }

    return this.request<PaginatedResponse<T>>(`/${module}?${searchParams}`)
  }

  /**
   * Get single content item by ID
   */
  async getContentById<T = DynamicContentItem>(
    module: 'newsletter' | 'portfolio' | 'careers',
    id: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`/${module}/${id}`)
  }

  /**
   * Create new content item
   */
  async createContent<T = DynamicContentItem>(
    module: 'newsletter' | 'portfolio' | 'careers',
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`/${module}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update existing content item
   */
  async updateContent<T = DynamicContentItem>(
    module: 'newsletter' | 'portfolio' | 'careers',
    id: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`/${module}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete content item
   */
  async deleteContent(
    module: 'newsletter' | 'portfolio' | 'careers',
    id: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/${module}/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bulk operations
   */
  async bulkOperation<T = DynamicContentItem>(
    module: 'newsletter' | 'portfolio' | 'careers',
    operation: 'delete' | 'publish' | 'archive' | 'feature',
    ids: string[]
  ): Promise<ApiResponse<{ affected: number; results: T[] }>> {
    return this.request<{ affected: number; results: T[] }>(`/${module}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ operation, ids }),
    })
  }

  /**
   * Get categories for a module
   */
  async getCategories(
    module: 'newsletter' | 'portfolio' | 'careers'
  ): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/${module}/categories`)
  }

  /**
   * Create or update category
   */
  async saveCategory(
    module: 'newsletter' | 'portfolio' | 'careers',
    category: any
  ): Promise<ApiResponse<any>> {
    const method = category.id ? 'PUT' : 'POST'
    const endpoint = category.id 
      ? `/${module}/categories/${category.id}` 
      : `/${module}/categories`

    return this.request<any>(endpoint, {
      method,
      body: JSON.stringify(category),
    })
  }

  /**
   * Delete category
   */
  async deleteCategory(
    module: 'newsletter' | 'portfolio' | 'careers',
    id: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/${module}/categories/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Upload media files
   */
  async uploadMedia(
    module: 'newsletter' | 'portfolio' | 'careers',
    files: FileList,
    options: {
      galleryId?: string
      stage?: string
      category?: string
    } = {}
  ): Promise<ApiResponse<any[]>> {
    const formData = new FormData()
    
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    if (options.galleryId) formData.append('galleryId', options.galleryId)
    if (options.stage) formData.append('stage', options.stage)
    if (options.category) formData.append('category', options.category)

    try {
      const response = await fetch(`${this.baseUrl}/${module}/media/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Upload failed: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Get media gallery
   */
  async getMediaGallery(
    module: 'newsletter' | 'portfolio' | 'careers',
    galleryId?: string
  ): Promise<ApiResponse<any>> {
    const endpoint = galleryId 
      ? `/${module}/media/galleries/${galleryId}`
      : `/${module}/media/galleries`
    
    return this.request<any>(endpoint)
  }

  /**
   * Optimize media item
   */
  async optimizeMedia(
    module: 'newsletter' | 'portfolio' | 'careers',
    mediaId: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/${module}/media/${mediaId}/optimize`, {
      method: 'POST',
    })
  }

  /**
   * Delete media item
   */
  async deleteMedia(
    module: 'newsletter' | 'portfolio' | 'careers',
    mediaId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/${module}/media/${mediaId}`, {
      method: 'DELETE',
    })
  }
}

// Create singleton instance
export const dynamicContentAPI = new DynamicContentAPI()

// Export types for use in components
export type { 
  DynamicContentItem, 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse 
}