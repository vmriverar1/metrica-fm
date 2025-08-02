'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'reveal' | 'scale' | 'curtain';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
}

export default function SectionTransition({
  children,
  className = '',
  variant = 'fade',
  direction = 'up',
  duration = 1,
  delay = 0
}: SectionTransitionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !triggerRef.current) return;

    const section = sectionRef.current;
    const trigger = triggerRef.current;

    // Set initial state based on variant
    const getInitialState = () => {
      switch (variant) {
        case 'slide':
          return {
            opacity: 0,
            x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
            y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0
          };
        case 'reveal':
          return {
            opacity: 0,
            clipPath: getClipPath(direction, false)
          };
        case 'scale':
          return {
            opacity: 0,
            scale: 0.8,
            transformOrigin: 'center center'
          };
        case 'curtain':
          return {
            opacity: 0,
            scaleY: 0,
            transformOrigin: 'center top'
          };
        default: // fade
          return {
            opacity: 0,
            y: 30
          };
      }
    };

    const getClipPath = (dir: string, revealed: boolean) => {
      const hidden = revealed ? '100%' : '0%';
      const visible = revealed ? '0%' : '100%';
      
      switch (dir) {
        case 'left':
          return `inset(0 ${hidden} 0 0)`;
        case 'right':
          return `inset(0 0 0 ${hidden})`;
        case 'down':
          return `inset(${hidden} 0 0 0)`;
        default: // up
          return `inset(0 0 ${hidden} 0)`;
      }
    };

    const getAnimationProperties = () => {
      switch (variant) {
        case 'slide':
          return {
            opacity: 1,
            x: 0,
            y: 0,
            duration,
            ease: "power3.out"
          };
        case 'reveal':
          return {
            opacity: 1,
            clipPath: getClipPath(direction, true),
            duration,
            ease: "power2.inOut"
          };
        case 'scale':
          return {
            opacity: 1,
            scale: 1,
            duration,
            ease: "back.out(1.7)"
          };
        case 'curtain':
          return {
            opacity: 1,
            scaleY: 1,
            duration,
            ease: "power2.inOut"
          };
        default: // fade
          return {
            opacity: 1,
            y: 0,
            duration,
            ease: "power2.out"
          };
      }
    };

    // Set initial state
    gsap.set(section, getInitialState());

    // Create animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        onEnter: () => {
          gsap.to(section, {
            ...getAnimationProperties(),
            delay
          });
        }
      }
    });

    // Additional cinematic effects
    if (variant === 'curtain' || variant === 'reveal') {
      // Add subtle shake effect for dramatic reveals
      tl.to(section, {
        x: "+=2",
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut"
      }, delay + duration * 0.8);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [variant, direction, duration, delay]);

  return (
    <div ref={triggerRef} className={`section-transition-trigger ${className}`}>
      <div ref={sectionRef} className="section-transition-content">
        {children}
      </div>
    </div>
  );
}

// HOC for easier usage
export function withSectionTransition<T extends object>(
  Component: React.ComponentType<T>,
  transitionProps?: Partial<SectionTransitionProps>
) {
  return function WrappedComponent(props: T) {
    return (
      <SectionTransition {...transitionProps}>
        <Component {...props} />
      </SectionTransition>
    );
  };
}