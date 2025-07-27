import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useRef } from 'react';

interface AnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
}

export const useScrollAnimation = (
  animationCallback: (gsap: typeof gsap, trigger: Element | null) => void,
  options: AnimationOptions = {}
) => {
  const triggerRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!triggerRef.current) return;
    
    const ctx = gsap.context(() => {
      animationCallback(gsap, triggerRef.current);
    }, triggerRef.current);
    
    return () => ctx.revert();
  }, { scope: triggerRef });
  
  return triggerRef;
};

export const useSectionAnimation = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!sectionRef.current) return;
    
    const elements = sectionRef.current.querySelectorAll('.animate-on-scroll');
    
    elements.forEach((element, index) => {
      gsap.from(element, {
        y: 60,
        opacity: 0,
        duration: 1,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });
    });
    
    // Animate any stagger groups
    const staggerGroups = sectionRef.current.querySelectorAll('.stagger-group');
    staggerGroups.forEach((group) => {
      const children = group.children;
      gsap.from(children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });
    });
    
  }, { scope: sectionRef });
  
  return sectionRef;
};

export const useHoverAnimation = (scale = 1.05, duration = 0.3) => {
  const elementRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!elementRef.current) return;
    
    const tl = gsap.timeline({ paused: true });
    
    tl.to(elementRef.current, {
      scale,
      duration,
      ease: 'power2.out'
    });
    
    const handleEnter = () => tl.play();
    const handleLeave = () => tl.reverse();
    
    elementRef.current.addEventListener('mouseenter', handleEnter);
    elementRef.current.addEventListener('mouseleave', handleLeave);
    
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('mouseenter', handleEnter);
        elementRef.current.removeEventListener('mouseleave', handleLeave);
      }
    };
  }, { scope: elementRef });
  
  return elementRef;
};

export const useTextReveal = () => {
  const textRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!textRef.current) return;
    
    const splitText = textRef.current.innerText.split('');
    textRef.current.innerHTML = splitText
      .map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');
    
    const chars = textRef.current.querySelectorAll('span');
    
    gsap.from(chars, {
      opacity: 0,
      y: 20,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.5,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }, { scope: textRef });
  
  return textRef;
};