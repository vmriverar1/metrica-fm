'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

export default function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    let innerX = 0;
    let innerY = 0;

    // Update cursor position
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant position for outer cursor
      gsap.to(cursor, {
        x: mouseX - 20,
        y: mouseY - 20,
        duration: 0,
      });
    };

    // Smooth follow for inner cursor
    const animateInnerCursor = () => {
      innerX += (mouseX - innerX) * 0.1;
      innerY += (mouseY - innerY) * 0.1;

      gsap.set(cursorInner, {
        x: innerX - 6,
        y: innerY - 6,
      });

      requestAnimationFrame(animateInnerCursor);
    };
    animateInnerCursor();

    // Check if element is interactive
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer');

      // Skip if in hero section
      const isInHero = target.closest('#hero, #hero-transform');
      if (isInHero) return;

      setIsPointer(isInteractive);

      if (isInteractive) {
        gsap.to(cursor, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(cursorInner, {
          scale: 0,
          duration: 0.3,
        });
      }
    };

    const handleMouseOut = () => {
      setIsPointer(false);
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
      });
      gsap.to(cursorInner, {
        scale: 1,
        duration: 0.3,
      });
    };

    // Hide cursor when leaving window
    const handleMouseLeave = () => {
      setIsHidden(true);
      gsap.to([cursor, cursorInner], {
        opacity: 0,
        duration: 0.3,
      });
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
      gsap.to([cursor, cursorInner], {
        opacity: 1,
        duration: 0.3,
      });
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Outer cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] mix-blend-difference ${
          isPointer ? 'border-accent' : 'border-white'
        }`}
        style={{
          border: '2px solid',
          borderRadius: '50%',
          transition: 'border-color 0.3s ease',
        }}
      />
      
      {/* Inner dot */}
      <div
        ref={cursorInnerRef}
        className="custom-cursor-inner fixed top-0 left-0 w-3 h-3 bg-accent pointer-events-none z-[9999] rounded-full mix-blend-difference"
      />
      
      <style jsx>{`
        /* Hide default cursor on all elements */
        * {
          cursor: none !important;
        }
        
        /* Show default cursor on hero sections */
        #hero *, #hero-transform * {
          cursor: auto !important;
        }
        
        /* Hide custom cursor on mobile */
        @media (max-width: 768px) {
          .custom-cursor,
          .custom-cursor-inner {
            display: none !important;
          }
          * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
}