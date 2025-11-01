'use client'

import { useState, useCallback, useEffect } from 'react'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

interface LoadingStatesConfig {
  defaultState?: LoadingState
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

interface LoadingStatesReturn {
  state: LoadingState
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  isIdle: boolean
  error: Error | null
  setLoading: () => void
  setSuccess: () => void
  setError: (error: Error | string) => void
  setIdle: () => void
  reset: () => void
  retry: () => void
  canRetry: boolean
  retryCount: number
}

export function useLoadingStates(config: LoadingStatesConfig = {}): LoadingStatesReturn {
  const {
    defaultState = 'idle',
    timeout = 30000, // 30 seconds
    retryAttempts = 3,
    retryDelay = 1000
  } = config

  const [state, setState] = useState<LoadingState>(defaultState)
  const [error, setErrorState] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const setLoading = useCallback(() => {
    setState('loading')
    setErrorState(null)
    
    // Set timeout for loading state
    if (timeout > 0) {
      const id = setTimeout(() => {
        setState('error')
        setErrorState(new Error('Operation timed out'))
      }, timeout)
      setTimeoutId(id)
    }
  }, [timeout])

  const setSuccess = useCallback(() => {
    setState('success')
    setErrorState(null)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  const setError = useCallback((errorInput: Error | string) => {
    setState('error')
    const errorObject = errorInput instanceof Error 
      ? errorInput 
      : new Error(errorInput)
    setErrorState(errorObject)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  const setIdle = useCallback(() => {
    setState('idle')
    setErrorState(null)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  const reset = useCallback(() => {
    setState(defaultState)
    setErrorState(null)
    setRetryCount(0)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [defaultState, timeoutId])

  const retry = useCallback(async () => {
    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1)
      
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      setState('loading')
      setErrorState(null)
    }
  }, [retryCount, retryAttempts, retryDelay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return {
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
    error,
    setLoading,
    setSuccess,
    setError,
    setIdle,
    reset,
    retry,
    canRetry: retryCount < retryAttempts && state === 'error',
    retryCount
  }
}

// Hook for page data loading with standardized pattern
export function usePageData<T>(
  pageName: string,
  fetchFn?: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null)
  const loading = useLoadingStates({
    defaultState: 'loading',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 2000
  })

  const loadData = useCallback(async () => {
    try {
      loading.setLoading()

      let result: T
      
      if (fetchFn) {
        result = await fetchFn()
      } else {
        // Default API fetch
        const response = await fetch(`/api/admin/pages/${pageName}`, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch ${pageName} data: ${response.status}`)
        }

        const apiResult = await response.json()
        if (!apiResult.success) {
          throw new Error(apiResult.error || 'Failed to load page data')
        }

        result = apiResult.data?.content || apiResult.data
      }

      setData(result)
      loading.setSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to load ${pageName} data`
      loading.setError(errorMessage)
    }
  }, [pageName, fetchFn, loading])

  // Auto-retry logic
  useEffect(() => {
    if (loading.canRetry && loading.isError) {
      const retryTimeout = setTimeout(() => {
        loading.retry().then(() => loadData())
      }, 3000) // Auto-retry after 3 seconds

      return () => clearTimeout(retryTimeout)
    }
  }, [loading.canRetry, loading.isError, loading.retry, loadData])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading: loading.isLoading,
    error: loading.error?.message || null,
    success: loading.isSuccess,
    retry: () => loading.retry().then(() => loadData()),
    canRetry: loading.canRetry,
    retryCount: loading.retryCount,
    reloadData: loadData
  }
}

// Hook for API operations with loading states
export function useAsyncOperation<T, P extends any[] = []>(
  operation: (...params: P) => Promise<T>,
  config?: LoadingStatesConfig
) {
  const [data, setData] = useState<T | null>(null)
  const loading = useLoadingStates(config)

  const execute = useCallback(async (...params: P) => {
    try {
      loading.setLoading()
      const result = await operation(...params)
      setData(result)
      loading.setSuccess()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Operation failed')
      loading.setError(errorMessage)
      throw error
    }
  }, [operation, loading])

  const executeWithRetry = useCallback(async (...params: P) => {
    let lastError: unknown
    
    for (let attempt = 0; attempt <= (config?.retryAttempts || 3); attempt++) {
      try {
        return await execute(...params)
      } catch (error) {
        lastError = error
        if (attempt < (config?.retryAttempts || 3)) {
          await new Promise(resolve => 
            setTimeout(resolve, config?.retryDelay || 1000)
          )
        }
      }
    }
    
    throw lastError
  }, [execute, config])

  return {
    data,
    execute,
    executeWithRetry,
    ...loading
  }
}

// Component wrapper for standardized loading states
interface LoadingStateWrapperProps {
  loading: boolean
  error: string | null
  success: boolean
  data: any
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: React.ReactNode
  canRetry?: boolean
  onRetry?: () => void
}

export function LoadingStateWrapper({
  loading,
  error,
  success,
  data,
  loadingComponent = <DefaultLoadingComponent />,
  errorComponent,
  emptyComponent = <DefaultEmptyComponent />,
  children,
  canRetry = false,
  onRetry
}: LoadingStateWrapperProps) {
  if (loading) {
    return <>{loadingComponent}</>
  }

  if (error) {
    return errorComponent || (
      <DefaultErrorComponent 
        error={error} 
        canRetry={canRetry} 
        onRetry={onRetry} 
      />
    )
  }

  if (success && !data) {
    return <>{emptyComponent}</>
  }

  return <>{children}</>
}

// Default components
function DefaultLoadingComponent() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-gray-600">Cargando...</span>
    </div>
  )
}

function DefaultErrorComponent({ 
  error, 
  canRetry, 
  onRetry 
}: { 
  error: string
  canRetry?: boolean
  onRetry?: () => void 
}) {
  return (
    <div className="text-center p-8">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

function DefaultEmptyComponent() {
  return (
    <div className="text-center p-8">
      <div className="text-gray-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos</h3>
      <p className="text-gray-600">No se encontraron datos para mostrar</p>
    </div>
  )
}