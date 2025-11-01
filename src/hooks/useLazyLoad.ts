'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  enabled?: boolean
}

export function useLazyLoad({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  enabled = true
}: LazyLoadOptions = {}) {
  const [inView, setInView] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return
    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) {
            setHasTriggered(true)
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [enabled, hasTriggered, rootMargin, threshold, triggerOnce])

  return { ref, inView, hasTriggered }
}

// Hook for lazy loading heavy components
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  dependencies: unknown[] = []
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { ref, inView } = useLazyLoad()

  useEffect(() => {
    if (!inView || component || loading) return

    setLoading(true)
    setError(null)

    importFn()
      .then((module) => {
        setComponent(module.default)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to load component'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [inView, component, loading, importFn, ...dependencies])

  return { ref, component, loading, error, inView }
}

// Hook for lazy loading animations libraries
export function useLazyAnimation(library: 'gsap' | 'framer' = 'gsap') {
  const [gsap, setGsap] = useState<any>(null)
  const [framerMotion, setFramerMotion] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useLazyLoad({ threshold: 0.05 })

  useEffect(() => {
    if (!inView || loading) return

    setLoading(true)

    const loadLibrary = async () => {
      try {
        if (library === 'gsap') {
          const gsapModule = await import('gsap')
          const { ScrollTrigger } = await import('gsap/ScrollTrigger')
          gsapModule.gsap.registerPlugin(ScrollTrigger)
          setGsap(gsapModule.gsap)
        } else if (library === 'framer') {
          const framerModule = await import('framer-motion')
          setFramerMotion(framerModule)
        }
      } catch (error) {
        console.error(`Failed to load ${library}:`, error)
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [inView, library, loading])

  return {
    ref,
    gsap,
    framerMotion,
    loading,
    inView,
    isReady: library === 'gsap' ? !!gsap : !!framerMotion
  }
}

// Hook for preloading critical resources
export function usePreloadCritical(resources: string[]) {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      
      if (resource.endsWith('.js')) {
        link.as = 'script'
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image'
      } else if (resource.endsWith('.woff2')) {
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
      }
      
      link.href = resource
      document.head.appendChild(link)
    })
  }, [resources])
}

// Lazy wrapper component
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  options?: LazyLoadOptions
}

export function LazyWrapper({ 
  children, 
  fallback = null, 
  className = '',
  options = {}
}: LazyWrapperProps) {
  const { ref, inView } = useLazyLoad(options)

  return (
    <div ref={ref} className={className}>
      {inView ? children : fallback}
    </div>
  )
}