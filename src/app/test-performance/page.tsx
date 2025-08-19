/**
 * FASE 6: Testing Page - Performance Optimizations
 * URL: http://localhost:9002/test-performance
 * 
 * Página para testing de todas las optimizaciones de performance.
 * Incluye tests de cache, lazy loading, debouncing, prefetch y Web Vitals.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  useSmartCache, 
  useLazyLoading, 
  useDebounce, 
  usePrefetch, 
  useWebVitals,
  useOptimizedQuery,
  useComponentPerformance
} from '@/hooks/usePerformanceService';
import PerformanceService from '@/lib/performance-service';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Database,
  Eye,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  Search,
  MousePointer,
  Gauge
} from 'lucide-react';

export default function TestPerformance() {
  const [activeTest, setActiveTest] = useState<string>('cache');
  
  // Component performance tracking
  const componentPerf = useComponentPerformance('TestPerformancePage');

  // Test states
  const [cacheResults, setCacheResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefetchTrigger, setPrefetchTrigger] = useState(false);
  const [lazyImages, setLazyImages] = useState<string[]>([]);

  // Hooks for testing
  const webVitals = useWebVitals();
  
  // Cache test
  const cacheTest = useSmartCache(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return {
        id: Date.now(),
        data: `Test data ${Math.random()}`,
        timestamp: new Date().toISOString()
      };
    },
    { key: 'test-cache-key', cacheName: 'api', enabled: true }
  );

  // Lazy loading test
  const lazyLoad = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    delay: 300
  });

  // Debounce test
  const debouncedSearch = useDebounce((query: string) => {
    console.log('Debounced search executed:', query);
    // Simulate API call
    setCacheResults(prev => [...prev, {
      id: Date.now(),
      query,
      results: Math.floor(Math.random() * 20),
      timestamp: new Date().toISOString()
    }]);
  }, { delay: 500 });

  // Prefetch test
  const prefetchTest = usePrefetch([
    '/api/test-data-1',
    '/api/test-data-2',
    '/static/heavy-image.jpg'
  ], {
    condition: prefetchTrigger,
    priority: 'medium',
    delay: 1000
  });

  // Optimized query test
  const queryTest = useOptimizedQuery(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { results: Math.floor(Math.random() * 100) };
    },
    'SELECT * FROM users WHERE status = "active" ORDER BY created_at DESC',
    [activeTest]
  );

  // Generate test images for lazy loading
  useEffect(() => {
    const images = Array.from({ length: 20 }, (_, i) => 
      `https://picsum.photos/300/200?random=${i + 1}`
    );
    setLazyImages(images);
  }, []);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  const runCacheTest = async () => {
    const startTime = performance.now();
    await cacheTest.refresh();
    const endTime = performance.now();
    
    const result = {
      cached: cacheTest.cached,
      duration: Math.round(endTime - startTime),
      timestamp: new Date().toISOString(),
      data: cacheTest.data
    };
    
    setCacheResults(prev => [...prev, result]);
  };

  const clearCacheTest = () => {
    PerformanceService.clearAllCaches();
    setCacheResults([]);
  };

  const runWebVitalsTest = () => {
    // Simulate performance impact
    const start = Date.now();
    const array = new Array(1000000).fill(0);
    array.forEach((_, i) => {
      array[i] = Math.random();
    });
    console.log('Heavy computation completed in', Date.now() - start, 'ms');
  };

  const testSections = [
    {
      id: 'cache',
      title: 'Smart Cache',
      icon: Database,
      description: 'Test del sistema de cache inteligente con diferentes estrategias'
    },
    {
      id: 'lazy',
      title: 'Lazy Loading',
      icon: Eye,
      description: 'Test de carga diferida de imágenes y contenido'
    },
    {
      id: 'debounce',
      title: 'Debouncing',
      icon: Clock,
      description: 'Test de debouncing para búsquedas y eventos frecuentes'
    },
    {
      id: 'prefetch',
      title: 'Prefetching',
      icon: TrendingUp,
      description: 'Test de prefetch inteligente de recursos'
    },
    {
      id: 'vitals',
      title: 'Web Vitals',
      icon: Gauge,
      description: 'Monitoreo de Core Web Vitals y métricas de performance'
    },
    {
      id: 'query',
      title: 'Query Optimization',
      icon: Search,
      description: 'Optimización automática de consultas y queries'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-7 h-7 text-blue-600" />
                  Performance Testing Suite
                </h1>
                <p className="text-gray-600 mt-1">
                  Testing completo de optimizaciones de performance
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Component Performance</div>
                <div className="font-mono text-xs">
                  Renders: {componentPerf.renderCount} | 
                  Last: {componentPerf.renderTime.toFixed(2)}ms
                </div>
              </div>
            </div>

            {/* Test Navigation */}
            <div className="mt-6 border-b">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {testSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTest(section.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                      activeTest === section.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Content */}
        {activeTest === 'cache' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Smart Cache Testing
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={runCacheTest}
                    disabled={cacheTest.loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {cacheTest.loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run Cache Test
                  </button>
                  <button
                    onClick={clearCacheTest}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear Cache
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`font-semibold ${cacheTest.loading ? 'text-yellow-600' : 'text-green-600'}`}>
                    {cacheTest.loading ? 'Loading...' : 'Ready'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Last Result</div>
                  <div className={`font-semibold ${cacheTest.cached ? 'text-green-600' : 'text-blue-600'}`}>
                    {cacheTest.cached ? 'From Cache' : 'Fresh Data'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Error Status</div>
                  <div className={`font-semibold ${cacheTest.error ? 'text-red-600' : 'text-green-600'}`}>
                    {cacheTest.error ? 'Error' : 'No Errors'}
                  </div>
                </div>
              </div>

              {/* Cache Test Results */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium">Test Results</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {cacheResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No test results yet. Run a cache test to see results.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cacheResults.slice(-10).reverse().map((result, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {result.cached ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-blue-500" />
                            )}
                            <div>
                              <div className="font-medium">
                                {result.cached ? 'Cache Hit' : 'Cache Miss'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(result.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm">
                              {result.duration}ms
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'lazy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5" />
                Lazy Loading Testing
              </h2>
              <p className="text-gray-600 mb-6">
                Scroll down to test lazy loading of images. Images below the fold will load when they come into view.
              </p>
              
              {/* Lazy Load Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Visibility Status</div>
                  <div className={`font-semibold ${lazyLoad.isVisible ? 'text-green-600' : 'text-gray-600'}`}>
                    {lazyLoad.isVisible ? 'Visible' : 'Not Visible'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Load Status</div>
                  <div className={`font-semibold ${lazyLoad.hasLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
                    {lazyLoad.hasLoaded ? 'Loaded' : 'Waiting'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Images Total</div>
                  <div className="font-semibold text-blue-600">{lazyImages.length}</div>
                </div>
              </div>

              {/* Test Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {lazyImages.map((src, index) => (
                  <div key={index} className="relative">
                    <div 
                      ref={index === 10 ? lazyLoad.ref : undefined}
                      className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
                      data-src={src}
                    >
                      {index < 4 ? (
                        <img src={src} alt={`Test ${index}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm">Image {index + 1}</div>
                          <div className="text-xs">Lazy Loading</div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Instructions:</strong> The first 4 images load immediately. 
                  Images 5+ will lazy load as you scroll down. 
                  Image 11 is specially monitored for visibility tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'debounce' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                Debouncing Testing
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query (500ms debounce)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to test debouncing..."
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Search executes 500ms after you stop typing
                </p>
              </div>

              {/* Search Results */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium">Debounced Search Results</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {cacheResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Start typing to see debounced search results
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cacheResults.slice(-5).reverse().map((result, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Search className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="font-medium">"{result.query}"</div>
                                <div className="text-sm text-gray-500">
                                  {result.results} results found
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'prefetch' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                Prefetching Testing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Prefetch Status</div>
                  <div className={`font-semibold ${prefetchTest.prefetched ? 'text-green-600' : 'text-gray-600'}`}>
                    {prefetchTest.prefetched ? 'Resources Prefetched' : 'Not Prefetched'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Trigger Status</div>
                  <div className={`font-semibold ${prefetchTrigger ? 'text-blue-600' : 'text-gray-600'}`}>
                    {prefetchTrigger ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setPrefetchTrigger(!prefetchTrigger)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    prefetchTrigger 
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {prefetchTrigger ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {prefetchTrigger ? 'Disable Prefetch' : 'Enable Prefetch'}
                </button>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Resources to Prefetch:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• /api/test-data-1 (API endpoint)</li>
                    <li>• /api/test-data-2 (API endpoint)</li>
                    <li>• /static/heavy-image.jpg (Image resource)</li>
                  </ul>
                  <p className="text-blue-600 text-xs mt-2">
                    When enabled, these resources will be prefetched with medium priority
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Hover Prefetch Test</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="/test-applications"
                      className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      <MousePointer className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <div className="font-medium">Hover to Prefetch</div>
                      <div className="text-sm text-gray-500">Applications Page</div>
                    </a>
                    <a
                      href="/recruitment-dashboard"
                      className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      <MousePointer className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                      <div className="font-medium">Hover to Prefetch</div>
                      <div className="text-sm text-gray-500">Recruitment Dashboard</div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5" />
                Web Vitals Monitoring
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">LCP</div>
                  <div className={`text-xl font-bold ${
                    !webVitals.lcp ? 'text-gray-400' :
                    webVitals.lcp <= 2500 ? 'text-green-600' :
                    webVitals.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {webVitals.lcp ? Math.round(webVitals.lcp) + 'ms' : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-500">Largest Contentful Paint</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">FID</div>
                  <div className={`text-xl font-bold ${
                    !webVitals.fid ? 'text-gray-400' :
                    webVitals.fid <= 100 ? 'text-green-600' :
                    webVitals.fid <= 300 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {webVitals.fid ? Math.round(webVitals.fid) + 'ms' : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-500">First Input Delay</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">CLS</div>
                  <div className={`text-xl font-bold ${
                    webVitals.cls === null ? 'text-gray-400' :
                    webVitals.cls <= 0.1 ? 'text-green-600' :
                    webVitals.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {webVitals.cls !== null ? webVitals.cls.toFixed(3) : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Score</div>
                  <div className={`text-xl font-bold ${
                    webVitals.score >= 80 ? 'text-green-600' :
                    webVitals.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {webVitals.score}/100
                  </div>
                  <div className="text-xs text-gray-500">Overall Web Vitals</div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={runWebVitalsTest}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Simulate Heavy Load
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Web Vitals Thresholds:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-800">Good</div>
                    <ul className="text-green-700 mt-1 space-y-1">
                      <li>LCP ≤ 2.5s</li>
                      <li>FID ≤ 100ms</li>
                      <li>CLS ≤ 0.1</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-800">Needs Improvement</div>
                    <ul className="text-yellow-700 mt-1 space-y-1">
                      <li>LCP ≤ 4s</li>
                      <li>FID ≤ 300ms</li>
                      <li>CLS ≤ 0.25</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-red-800">Poor</div>
                    <ul className="text-red-700 mt-1 space-y-1">
                      <li>LCP > 4s</li>
                      <li>FID > 300ms</li>
                      <li>CLS > 0.25</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'query' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Search className="w-5 h-5" />
                Query Optimization Testing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Query Status</div>
                  <div className={`font-semibold ${queryTest.loading ? 'text-yellow-600' : 'text-green-600'}`}>
                    {queryTest.loading ? 'Executing...' : 'Complete'}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Result Count</div>
                  <div className="font-semibold text-blue-600">
                    {queryTest.data?.results || 0}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Suggestions</div>
                  <div className="font-semibold text-purple-600">
                    {queryTest.optimization?.suggestions?.length || 0}
                  </div>
                </div>
              </div>

              {queryTest.optimization && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Original Query</h4>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      {queryTest.optimization.query}
                    </div>
                  </div>

                  {queryTest.optimization.optimizedQuery && (
                    <div className="border rounded-lg p-4 border-green-200">
                      <h4 className="font-medium mb-2 text-green-800">Optimized Query</h4>
                      <div className="bg-green-50 p-3 rounded font-mono text-sm">
                        {queryTest.optimization.optimizedQuery}
                      </div>
                    </div>
                  )}

                  {queryTest.optimization.suggestions.length > 0 && (
                    <div className="border rounded-lg p-4 border-yellow-200">
                      <h4 className="font-medium mb-2 text-yellow-800">Optimization Suggestions</h4>
                      <ul className="space-y-1">
                        {queryTest.optimization.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-yellow-700 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => queryTest.rerun()}
                disabled={queryTest.loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {queryTest.loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Query Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}