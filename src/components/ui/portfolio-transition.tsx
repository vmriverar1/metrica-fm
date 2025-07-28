'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface PortfolioTransitionProps {
  isActive: boolean;
  children: React.ReactNode;
  variant?: 'split' | 'mask' | 'diagonal';
  className?: string;
}

export default function PortfolioTransition({ 
  isActive, 
  children, 
  variant = 'split',
  className 
}: PortfolioTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const circleMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    if (isActive) {
      // Transition in animations
      switch (variant) {
        case 'split':
          // Split screen reveal
          if (leftMaskRef.current && rightMaskRef.current) {
            tl.set([leftMaskRef.current, rightMaskRef.current], { display: 'block' })
              .fromTo(leftMaskRef.current, 
                { x: '0%' }, 
                { x: '-100%', duration: 1, ease: 'power3.inOut' }
              )
              .fromTo(rightMaskRef.current, 
                { x: '0%' }, 
                { x: '100%', duration: 1, ease: 'power3.inOut' }, 
                '<'
              )
              .set([leftMaskRef.current, rightMaskRef.current], { display: 'none' });
          }
          break;

        case 'mask':
          // Circle mask reveal
          if (circleMaskRef.current) {
            tl.fromTo(containerRef.current,
              { clipPath: 'circle(0% at 50% 50%)' },
              { clipPath: 'circle(150% at 50% 50%)', duration: 1.5, ease: 'power3.out' }
            );
          }
          break;

        case 'diagonal':
          // Diagonal wipe
          tl.fromTo(containerRef.current,
            { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
            { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.2, ease: 'power3.inOut' }
          );
          break;
      }
    } else {
      // Reset states
      gsap.set(containerRef.current, { clipPath: 'none' });
      if (leftMaskRef.current && rightMaskRef.current) {
        gsap.set([leftMaskRef.current, rightMaskRef.current], { display: 'none', x: '0%' });
      }
    }

    return () => {
      tl.kill();
    };
  }, [isActive, variant]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {children}
      
      {variant === 'split' && (
        <>
          <div 
            ref={leftMaskRef}
            className="absolute inset-y-0 left-0 w-1/2 bg-background z-50 hidden"
          />
          <div 
            ref={rightMaskRef}
            className="absolute inset-y-0 right-0 w-1/2 bg-background z-50 hidden"
          />
        </>
      )}
      
      {variant === 'mask' && (
        <div 
          ref={circleMaskRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}