import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  
  // Global GSAP settings
  gsap.config({
    nullTargetWarn: false,
    force3D: true,
  });
  
  // Default ease for all animations
  gsap.defaults({
    ease: 'power3.out',
    duration: 1,
  });
}

// Animation utilities
export const fadeInUp = (element: gsap.TweenTarget, delay = 0) => {
  return gsap.from(element, {
    y: 60,
    opacity: 0,
    duration: 1,
    delay,
    ease: 'power3.out',
  });
};

export const fadeIn = (element: gsap.TweenTarget, delay = 0) => {
  return gsap.from(element, {
    opacity: 0,
    duration: 0.8,
    delay,
    ease: 'power2.out',
  });
};

export const staggerFadeInUp = (elements: gsap.TweenTarget, stagger = 0.1, delay = 0) => {
  return gsap.from(elements, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    delay,
    stagger,
    ease: 'power3.out',
  });
};

// Text animations
export const typewriterEffect = (element: gsap.TweenTarget, text: string, duration = 2) => {
  return gsap.to(element, {
    text,
    duration,
    ease: 'none',
  });
};

export const glitchText = (element: gsap.TweenTarget) => {
  const tl = gsap.timeline();
  
  tl.to(element, {
    skewX: 10,
    x: -5,
    duration: 0.1,
    ease: 'power4.inOut',
  })
  .to(element, {
    skewX: 0,
    x: 0,
    duration: 0.1,
    ease: 'power4.inOut',
  })
  .to(element, {
    opacity: 0.8,
    duration: 0.05,
  })
  .to(element, {
    opacity: 1,
    duration: 0.05,
  });
  
  return tl;
};

// ScrollTrigger utilities
export const createScrollTrigger = (
  trigger: string | Element,
  animation: gsap.core.Timeline | gsap.core.Tween,
  options: ScrollTrigger.Vars = {}
) => {
  const defaultOptions: ScrollTrigger.Vars = {
    trigger,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
    ...options,
  };
  
  ScrollTrigger.create({
    animation,
    ...defaultOptions,
  });
};

// Timeline management
export class TimelineManager {
  private timelines: Map<string, gsap.core.Timeline> = new Map();
  
  create(name: string, options?: gsap.TimelineVars): gsap.core.Timeline {
    const timeline = gsap.timeline(options);
    this.timelines.set(name, timeline);
    return timeline;
  }
  
  get(name: string): gsap.core.Timeline | undefined {
    return this.timelines.get(name);
  }
  
  kill(name: string): void {
    const timeline = this.timelines.get(name);
    if (timeline) {
      timeline.kill();
      this.timelines.delete(name);
    }
  }
  
  killAll(): void {
    this.timelines.forEach(timeline => timeline.kill());
    this.timelines.clear();
  }
}

export const timelineManager = new TimelineManager();

// Hover animations
export const createHoverAnimation = (element: Element) => {
  const tl = gsap.timeline({ paused: true });
  
  tl.to(element, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
  });
  
  element.addEventListener('mouseenter', () => tl.play());
  element.addEventListener('mouseleave', () => tl.reverse());
  
  return tl;
};

// Parallax effect
export const createParallax = (element: string | Element, speed = 0.5) => {
  gsap.to(element, {
    yPercent: -50 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

export { gsap, ScrollTrigger, TextPlugin };