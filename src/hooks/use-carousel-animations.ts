import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface UseCarouselAnimationsProps {
  sectionRef: React.RefObject<HTMLElement>;
  titleRef?: React.RefObject<HTMLElement>;
  subtitleRef?: React.RefObject<HTMLElement>;
  containerRef?: React.RefObject<HTMLElement>;
  onComplete?: () => void;
}

export function useCarouselAnimations({
  sectionRef,
  titleRef,
  subtitleRef,
  containerRef,
  onComplete
}: UseCarouselAnimationsProps) {
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Timeline para animaciones de entrada
    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onComplete
      }
    });

    // Animación del título
    if (titleRef?.current) {
      // Si tiene spans internos (para stagger)
      const titleElements = titleRef.current.querySelectorAll('span');
      if (titleElements.length > 0) {
        tl.current.from(titleElements, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power4.out',
          clearProps: 'all'
        });
      } else {
        // Animar el título completo
        tl.current.from(titleRef.current, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
          clearProps: 'all'
        });
      }
    }

    // Animación del subtítulo
    if (subtitleRef?.current) {
      const subtitleElements = subtitleRef.current.querySelectorAll('span');
      if (subtitleElements.length > 0) {
        tl.current.from(subtitleElements, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.8');
      } else {
        tl.current.from(subtitleRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.8');
      }
    }

    // Animación de las cards
    if (containerRef?.current) {
      const cards = containerRef.current.querySelectorAll('.swiper-slide');
      if (cards.length > 0) {
        tl.current.from(cards, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'all'
        }, '-=0.4');
      }
    }

    return () => {
      tl.current?.kill();
    };
  }, { scope: sectionRef });

  return tl.current;
}