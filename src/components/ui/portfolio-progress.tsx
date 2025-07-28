'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PortfolioProgressProps {
  current: number;
  total: number;
  className?: string;
}

export default function PortfolioProgress({ current, total, className }: PortfolioProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((current / total) * 100);
  }, [current, total]);

  return (
    <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-50", className)}>
      {/* Progress bar */}
      <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Chapter markers */}
      <div className="flex justify-between items-center">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === current 
                ? "bg-accent w-8" 
                : index < current 
                  ? "bg-white/60" 
                  : "bg-white/30"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Current/Total indicator */}
      <div className="text-center mt-4 text-white/70 text-sm font-alliance-medium">
        <span className="text-accent font-alliance-extrabold">{String(current + 1).padStart(2, '0')}</span>
        <span className="mx-2">/</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>
    </div>
  );
}