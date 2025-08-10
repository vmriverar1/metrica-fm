import { SkeletonCard } from '@/components/ui/skeleton-loader';

export default function CareersLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="h-screen bg-primary/10 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 bg-primary/20 rounded-lg mx-auto max-w-2xl"></div>
          <div className="h-6 bg-primary/20 rounded mx-auto max-w-lg"></div>
        </div>
      </div>
      
      {/* Benefits Section Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="h-8 bg-primary/20 rounded mx-auto max-w-md mb-4 animate-pulse"></div>
          <div className="h-4 bg-primary/20 rounded mx-auto max-w-lg animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-primary/5 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4"></div>
              <div className="h-6 bg-primary/20 rounded mb-2"></div>
              <div className="h-4 bg-primary/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Jobs Grid Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}