'use client'

import { Suspense } from 'react'
import { usePageData, LoadingStateWrapper } from '@/hooks/useLoadingStates'
import { useLazyAnimation, LazyWrapper } from '@/hooks/useLazyLoad'
import OptimizedMedia, { createMediaAsset } from '@/components/ui/OptimizedMedia'
import { 
  LazyComponent,
  HeroSkeleton,
  PortfolioSkeleton,
  StatsSkeleton 
} from '@/components/ui/LazyComponent'

// Example of optimized page component following Phase 5 patterns
export default function OptimizedPageExample() {
  // Use standardized loading states
  const { data, loading, error, success, retry, canRetry } = usePageData('home')

  return (
    <LoadingStateWrapper
      loading={loading}
      error={error}
      success={success}
      data={data}
      canRetry={canRetry}
      onRetry={retry}
      loadingComponent={<PageSkeleton />}
    >
      {data && (
        <div className="min-h-screen">
          {/* Hero Section - Critical, loads immediately */}
          <OptimizedHeroSection data={data.hero} />
          
          {/* Stats Section - Lazy loaded with animation */}
          <LazyStatsSection />
          
          {/* Portfolio Section - Heavy component, lazy loaded */}
          <LazyPortfolioSection />
          
          {/* Contact Section - Far down, lazy loaded with intersection observer */}
          <LazyWrapper
            className="py-20"
            options={{ threshold: 0.05, rootMargin: '200px' }}
            fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}
          >
            <ContactSection />
          </LazyWrapper>
        </div>
      )}
    </LoadingStateWrapper>
  )
}

// Optimized Hero Section with media optimization
function OptimizedHeroSection({ data }: { data: any }) {
  const heroMedia = createMediaAsset(
    data.background_video,
    data.background_image,
    'Hero background',
    'video'
  )

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Media - Optimized */}
      <div className="absolute inset-0">
        <OptimizedMedia
          media={heroMedia}
          priority={true} // Critical resource
          className="w-full h-full"
          sizes="100vw" // Full viewport
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl text-white">
          <h1 className="text-6xl font-bold mb-6">
            {data.title}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {data.subtitle}
          </p>
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            {data.cta_text}
          </button>
        </div>
      </div>
    </section>
  )
}

// Lazy Stats Section with GSAP animation
function LazyStatsSection() {
  const { ref, gsap, isReady } = useLazyAnimation('gsap')

  // Animation effect when GSAP is loaded and in view
  React.useEffect(() => {
    if (isReady && gsap) {
      gsap.fromTo(
        '.stat-item',
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%'
          }
        }
      )
    }
  }, [isReady, gsap])

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '676.8K', label: 'Metros Construidos', suffix: 'm²' },
            { value: '1.47M', label: 'Metros Supervisados', suffix: 'm²' },
            { value: '3.1B', label: 'Valor en Proyectos', suffix: '' },
            { value: '97', label: 'Satisfacción Cliente', suffix: '%' }
          ].map((stat, index) => (
            <div key={index} className="stat-item text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}<span className="text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Lazy Portfolio Section - Heavy component
function LazyPortfolioSection() {
  return (
    <LazyComponent
      importFn={() => import('@/components/landing/PortfolioSection')}
      fallback={<PortfolioSkeleton className="py-20" />}
      className="py-20"
      threshold={0.1}
      rootMargin="100px"
    />
  )
}

// Contact Section - Simple component for lazy loading demo
function ContactSection() {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          ¿Tienes un proyecto en mente?
        </h2>
        <p className="text-xl opacity-90 mb-8">
          Conversemos sobre cómo podemos ayudarte
        </p>
        <button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
          Contactar Ahora
        </button>
      </div>
    </section>
  )
}

// Page skeleton for initial load
function PageSkeleton() {
  return (
    <div className="min-h-screen">
      <HeroSkeleton className="h-screen" />
      <StatsSkeleton className="py-20 bg-gray-50" />
      <PortfolioSkeleton className="py-20" />
      <div className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/20 h-12 w-96 rounded-lg mx-auto mb-6"></div>
          <div className="bg-white/20 h-6 w-64 rounded mx-auto mb-8"></div>
          <div className="bg-white/20 h-12 w-40 rounded-lg mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

// React import
import React from 'react'