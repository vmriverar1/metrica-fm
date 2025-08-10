import { SkeletonCard } from '@/components/ui/skeleton-loader';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="h-screen bg-primary/10 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 bg-primary/20 rounded-lg mx-auto max-w-2xl"></div>
          <div className="h-6 bg-primary/20 rounded mx-auto max-w-lg"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}