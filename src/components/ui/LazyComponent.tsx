'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { useLazyLoad } from '@/hooks/useLazyLoad'

interface LazyComponentProps<T = {}> {
  importFn: () => Promise<{ default: ComponentType<T> }>
  componentProps?: T
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

// Generic lazy component loader
export function LazyComponent<T = {}>({
  importFn,
  componentProps = {} as T,
  fallback = <ComponentSkeleton />,
  errorFallback = <ErrorFallback />,
  className = '',
  threshold = 0.1,
  rootMargin = '100px'
}: LazyComponentProps<T>) {
  const { ref, inView } = useLazyLoad({ threshold, rootMargin })

  if (!inView) {
    return (
      <div ref={ref} className={className}>
        {fallback}
      </div>
    )
  }

  const LazyLoadedComponent = lazy(importFn)

  return (
    <div ref={ref} className={className}>
      <Suspense fallback={fallback}>
        <ErrorBoundary fallback={errorFallback}>
          <LazyLoadedComponent {...componentProps} />
        </ErrorBoundary>
      </Suspense>
    </div>
  )
}

// Error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />
    }

    return this.props.children
  }
}

// Skeleton components for different types
export function ComponentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg h-64 w-full mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export function HeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 ${className}`}>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <div className="bg-gray-300 h-12 rounded-lg mb-6 w-2/3"></div>
          <div className="bg-gray-300 h-6 rounded mb-4 w-1/2"></div>
          <div className="space-y-2 mb-8">
            <div className="bg-gray-300 h-4 rounded w-full"></div>
            <div className="bg-gray-300 h-4 rounded w-4/5"></div>
            <div className="bg-gray-300 h-4 rounded w-3/5"></div>
          </div>
          <div className="bg-gray-300 h-12 rounded-lg w-40"></div>
        </div>
      </div>
    </div>
  )
}

export function PortfolioSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="bg-gray-200 aspect-[4/3] rounded-lg"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-5 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimelineSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse space-y-8 ${className}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="flex-shrink-0 w-20 text-center">
            <div className="bg-gray-200 h-8 w-16 rounded-full mx-auto"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-gray-200 h-6 rounded w-1/3"></div>
            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-4 rounded w-4/5"></div>
            </div>
            <div className="bg-gray-200 aspect-[16/9] rounded-lg w-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="bg-gray-200 h-12 rounded w-24 mx-auto"></div>
            <div className="bg-gray-200 h-4 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ErrorFallback({ 
  error, 
  retry,
  className = ''
}: { 
  error?: Error
  retry?: () => void
  className?: string 
}) {
  return (
    <div className={`text-center p-8 ${className}`}>
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Error al cargar el componente
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Ocurrió un error inesperado'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

// Specific lazy components for common heavy sections
export const LazyPortfolioSection = lazy(() => 
  import('@/components/landing/PortfolioSection').then(module => ({
    default: module.PortfolioSection
  }))
)

export const LazyTimelineSection = lazy(() => 
  import('@/components/landing/TimelineSection').then(module => ({
    default: module.TimelineSection
  }))
)

export const LazyStatsSection = lazy(() => 
  import('@/components/landing/StatsSection').then(module => ({
    default: module.StatsSection
  }))
)

// React import fix
import React from 'react'