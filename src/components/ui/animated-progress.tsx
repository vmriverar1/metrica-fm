'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface AnimatedProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export default function AnimatedProgress({ 
  value, 
  max, 
  size = 120, 
  strokeWidth = 8,
  className = '',
  color = '#007bc4'
}: AnimatedProgressProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;

  useEffect(() => {
    if (!progressRef.current || !valueRef.current) return;

    // Animate circle
    gsap.fromTo(progressRef.current,
      {
        strokeDashoffset: circumference
      },
      {
        strokeDashoffset: circumference - (percentage / 100) * circumference,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: progressRef.current,
          start: 'top 80%',
          once: true
        }
      }
    );

    // Animate number
    gsap.fromTo(valueRef.current,
      {
        textContent: 0
      },
      {
        textContent: value,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: valueRef.current,
          start: 'top 80%',
          once: true
        }
      }
    );
  }, [value, percentage, circumference]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        
        {/* Progress circle */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 10px ${color}40)`
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          ref={valueRef}
          className="text-2xl font-alliance-extrabold"
        >
          0
        </span>
        <span className="text-sm text-muted-foreground">
          / {max}
        </span>
      </div>
    </div>
  );
}