import { gsap } from 'gsap';

// Simple GSAP export without plugins for debugging
export { gsap };

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