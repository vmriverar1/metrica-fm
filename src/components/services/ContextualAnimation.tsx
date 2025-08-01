'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface ContextualAnimationProps {
  ambiente: string;
  isActive: boolean;
}

export default function ContextualAnimation({ ambiente, isActive }: ContextualAnimationProps) {
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !animationRef.current) return;

    const container = animationRef.current;
    let animation: gsap.core.Timeline;

    switch (ambiente) {
      case 'corporate':
        animation = createCorporateAnimation(container);
        break;
      case 'construction':
        animation = createConstructionAnimation(container);
        break;
      case 'technical':
        animation = createTechnicalAnimation(container);
        break;
      case 'consulting':
        animation = createConsultingAnimation(container);
        break;
      case 'engineering':
        animation = createEngineeringAnimation(container);
        break;
      case 'innovation':
        animation = createInnovationAnimation(container);
        break;
      default:
        animation = createDefaultAnimation(container);
    }

    return () => {
      if (animation) animation.kill();
    };
  }, [ambiente, isActive]);

  const renderAnimationElements = () => {
    switch (ambiente) {
      case 'corporate':
        return (
          <div className="relative w-24 h-16">
            <div className="bar bar-1 absolute bottom-0 left-2 w-3 h-4 bg-primary rounded-t" />
            <div className="bar bar-2 absolute bottom-0 left-7 w-3 h-8 bg-primary rounded-t" />
            <div className="bar bar-3 absolute bottom-0 left-12 w-3 h-6 bg-primary rounded-t" />
            <div className="bar bar-4 absolute bottom-0 left-17 w-3 h-12 bg-accent rounded-t" />
            <div className="growth-line absolute top-2 left-0 w-full h-0.5 bg-white/50" />
          </div>
        );

      case 'construction':
        return (
          <div className="relative w-24 h-16">
            <div className="crane-base absolute bottom-0 left-8 w-1 h-12 bg-accent" />
            <div className="crane-arm absolute top-2 left-4 w-16 h-0.5 bg-accent origin-left" />
            <div className="crane-cable absolute top-3 right-2 w-0.5 h-8 bg-accent/70" />
            <div className="load absolute bottom-2 right-2 w-2 h-2 bg-primary" />
            <div className="building-frame absolute bottom-0 left-2 w-4 h-8 border border-white/50" />
          </div>
        );

      case 'technical':
        return (
          <div className="relative w-24 h-16">
            <div className="blueprint-grid absolute inset-0 opacity-30">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`grid-line-${i} absolute bg-white/30`} />
              ))}
            </div>
            <div className="measuring-tool absolute top-4 left-4 w-12 h-0.5 bg-accent" />
            <div className="compass-center absolute top-6 left-10 w-1 h-1 bg-white rounded-full" />
            <div className="compass-arc absolute top-6 left-10 w-8 h-8 border border-white/50 rounded-full" />
          </div>
        );

      case 'consulting':
        return (
          <div className="relative w-24 h-16">
            <div className="network-node node-1 absolute top-2 left-4 w-2 h-2 bg-primary rounded-full" />
            <div className="network-node node-2 absolute top-6 left-12 w-2 h-2 bg-accent rounded-full" />
            <div className="network-node node-3 absolute top-10 left-8 w-2 h-2 bg-white rounded-full" />
            <div className="network-node node-4 absolute top-8 left-16 w-2 h-2 bg-primary rounded-full" />
            <div className="connection conn-1 absolute top-3 left-5 w-6 h-0.5 bg-white/50" />
            <div className="connection conn-2 absolute top-7 left-9 w-4 h-0.5 bg-white/50" />
          </div>
        );

      case 'engineering':
        return (
          <div className="relative w-24 h-16">
            <div className="gear-1 absolute top-4 left-6 w-6 h-6 border-2 border-white/70 rounded-full" />
            <div className="gear-2 absolute top-6 left-12 w-4 h-4 border-2 border-accent/70 rounded-full" />
            <div className="gear-teeth-1 absolute top-2 left-8 w-2 h-2 bg-white/50" />
            <div className="gear-teeth-2 absolute top-8 left-14 w-1.5 h-1.5 bg-accent/50" />
            <div className="precision-line absolute bottom-2 left-2 w-16 h-0.5 bg-primary" />
          </div>
        );

      case 'innovation':
        return (
          <div className="relative w-24 h-16">
            <div className="lightbulb-base absolute bottom-4 left-10 w-3 h-4 bg-white/20 rounded-t-full" />
            <div className="lightbulb-glow absolute bottom-8 left-9 w-5 h-6 bg-accent/30 rounded-full blur-sm" />
            <div className="spark spark-1 absolute top-2 left-6 w-1 h-1 bg-accent rounded-full" />
            <div className="spark spark-2 absolute top-4 left-16 w-1 h-1 bg-white rounded-full" />
            <div className="spark spark-3 absolute top-8 left-4 w-1 h-1 bg-primary rounded-full" />
            <div className="energy-wave absolute top-6 left-8 w-8 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
        );

      default:
        return (
          <div className="relative w-24 h-16">
            <div className="pulse-center absolute top-8 left-12 w-2 h-2 bg-accent rounded-full" />
            <div className="pulse-ring absolute top-6 left-10 w-6 h-6 border border-accent/50 rounded-full" />
          </div>
        );
    }
  };

  return (
    <div ref={animationRef} className="contextual-animation">
      {renderAnimationElements()}
    </div>
  );
}

// Funciones de animación específicas
function createCorporateAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  
  tl.from('.bar', {
    scaleY: 0,
    transformOrigin: 'bottom',
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
  })
  .to('.growth-line', {
    scaleX: 1,
    transformOrigin: 'left',
    duration: 1,
    ease: 'power2.inOut'
  }, 0.5);

  return tl;
}

function createConstructionAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  
  tl.to('.crane-arm', {
    rotation: -10,
    duration: 1,
    ease: 'power2.inOut'
  })
  .to('.load', {
    y: -20,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0.5)
  .to('.building-frame', {
    scaleY: 1.5,
    transformOrigin: 'bottom',
    duration: 1,
    ease: 'power2.out'
  }, 1);

  return tl;
}

function createTechnicalAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1 });
  
  // Animar líneas de grid apareciendo
  tl.from('[class*="grid-line"]', {
    scaleX: 0,
    transformOrigin: 'left',
    duration: 0.3,
    stagger: 0.1
  })
  .to('.compass-arc', {
    rotation: 360,
    duration: 3,
    ease: 'none'
  }, 0.5);

  return tl;
}

function createConsultingAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  
  tl.from('.network-node', {
    scale: 0,
    duration: 0.5,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  })
  .from('.connection', {
    scaleX: 0,
    transformOrigin: 'left',
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  }, 0.8);

  return tl;
}

function createEngineeringAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to('.gear-1', {
    rotation: 360,
    duration: 4,
    ease: 'none'
  })
  .to('.gear-2', {
    rotation: -360,
    duration: 3,
    ease: 'none'
  }, 0)
  .to('.precision-line', {
    scaleX: 1,
    transformOrigin: 'left',
    duration: 1,
    ease: 'power2.inOut'
  }, 0.5);

  return tl;
}

function createInnovationAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  
  tl.to('.lightbulb-glow', {
    scale: 1.5,
    opacity: 0.8,
    duration: 0.5,
    ease: 'power2.out'
  })
  .from('.spark', {
    scale: 0,
    duration: 0.3,
    stagger: 0.1,
    ease: 'back.out(2)'
  }, 0.2)
  .to('.energy-wave', {
    scaleX: 1,
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut'
  }, 0.5);

  return tl;
}

function createDefaultAnimation(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to('.pulse-ring', {
    scale: 2,
    opacity: 0,
    duration: 2,
    ease: 'power2.out'
  });

  return tl;
}