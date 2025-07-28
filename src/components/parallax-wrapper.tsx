'use client';

import React, { useRef, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

interface ParallaxWrapperProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  disabled?: boolean;
}

export default function ParallaxWrapper({ 
  children, 
  speed = 0.5, 
  className = '',
  disabled = false
}: ParallaxWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (disabled || !elementRef.current) return;
    
    gsap.to(elementRef.current, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, { scope: elementRef, dependencies: [speed, disabled] });
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}