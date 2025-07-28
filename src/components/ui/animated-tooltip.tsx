'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export default function AnimatedTooltip({ children, content, className }: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5',
            'bg-foreground text-background text-sm rounded-md',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'whitespace-nowrap pointer-events-none z-50',
            'before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2',
            'before:border-4 before:border-transparent before:border-t-foreground',
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}