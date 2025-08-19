'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const HeroTransform = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroImageWrapperRef = useRef<HTMLDivElement>(null);
  const heroBackgroundRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const newContentRef = useRef<HTMLDivElement>(null);
  const newTitleRef = useRef<HTMLHeadingElement>(null);
  const newDescriptionRef = useRef<HTMLParagraphElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  
  const words = ['Trabajamos', 'Creamos', 'Resolvemos', 'Entregamos', 'Transformamos'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Initial state - new content hidden, original content visible
      gsap.set(newContentRef.current, { opacity: 0 });
      
      // Desktop animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          // markers: true, // Uncomment for debugging
        }
      });
      
      // Set initial position to absolute and centered
      gsap.set(heroImageWrapperRef.current, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center"
      });
      
      // Hero image wrapper transformation using scale
      tl.to(heroImageWrapperRef.current, {
        scaleX: 0.6,
        scaleY: 0.45,
        yPercent: -27.5, // Adjust vertical position to align at bottom
        ease: "power2.inOut"
      }, 0);
      
      // Background image slight zoom effect
      tl.to(heroBackgroundRef.current, {
        scale: 1.1,
        ease: "none"
      }, 0);
      
      // Fade out all original content
      tl.to([heroTitleRef.current, heroSubtitleRef.current, heroCTARef.current], {
        opacity: 0,
        y: -50,
        ease: "power2.in",
        duration: 0.5
      }, 0);
      
      // Fade in new content
      tl.fromTo(newContentRef.current, 
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.8
        }, 
        0.3
      );
      
      tl.fromTo(newTitleRef.current, 
        {
          opacity: 0,
          x: -30
        },
        {
          opacity: 1,
          x: 0,
          ease: "power2.out",
          duration: 0.8
        }, 
        0.4
      );
      
      tl.fromTo(newDescriptionRef.current, 
        {
          opacity: 0,
          x: 30
        },
        {
          opacity: 1,
          x: 0,
          ease: "power2.out",
          duration: 0.8
        }, 
        0.5
      );
    });
    
    // Mobile animations (simplified)
    mm.add("(max-width: 767px)", () => {
      // Initial state for mobile
      gsap.set(newContentRef.current, { opacity: 0 });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=80%",
          scrub: 1,
          pin: true
        }
      });
      
      // Set initial position for mobile
      gsap.set(heroImageWrapperRef.current, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center"
      });
      
      // Mobile: Hero image transformation using scale
      tl.to(heroImageWrapperRef.current, {
        scaleX: 0.8,
        scaleY: 0.35,
        yPercent: -20, // Adjusted to lower the image further
        ease: "power2.inOut"
      }, 0);
      
      // Fade out original content
      tl.to([heroTitleRef.current, heroSubtitleRef.current, heroCTARef.current], {
        opacity: 0,
        ease: "power2.in"
      }, 0);
      
      // Fade in new content (stacked on mobile)
      tl.fromTo(newContentRef.current, 
        {
          opacity: 0
        },
        {
          opacity: 1,
          ease: "power2.out"
        }, 
        0.3
      );
    });
    
  }, { scope: containerRef });
  
  // Word rotation effect
  useEffect(() => {
    if (!wordRef.current || !newContentRef.current) return;
    
    // Only animate when the new content is visible
    const checkVisibility = () => {
      const opacity = window.getComputedStyle(newContentRef.current!).opacity;
      return parseFloat(opacity) > 0.5;
    };
    
    let interval: NodeJS.Timeout;
    
    const startWordRotation = () => {
      if (checkVisibility()) {
        interval = setInterval(() => {
          if (wordRef.current) {
            gsap.to(wordRef.current, {
              opacity: 0,
              y: -20,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
                gsap.fromTo(wordRef.current,
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );
              }
            });
          }
        }, 3000);
      }
    };
    
    // Check visibility periodically
    const visibilityCheck = setInterval(() => {
      if (checkVisibility() && !interval) {
        startWordRotation();
        clearInterval(visibilityCheck);
      }
    }, 100);
    
    return () => {
      clearInterval(interval);
      clearInterval(visibilityCheck);
    };
  }, [newContentRef, words.length]);
  
  return (
    <>
      <section ref={containerRef} className="hero-transform-container relative h-screen">
        {/* Hero Wrapper */}
        <div 
          ref={heroWrapperRef} 
          className="hero-wrapper relative h-full w-full overflow-hidden bg-primary"
        >
          {/* Hero Image Wrapper - will transform */}
          <div 
            ref={heroImageWrapperRef}
            className="hero-image-wrapper relative h-full w-full"
          >
            {/* Background Layer */}
            <div 
              ref={heroBackgroundRef}
              className="hero-background absolute inset-0 z-0"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://statom.co.uk/assets/video/2024/Oct/rc-frame-video.mp4" type="video/mp4" />
                Su navegador no soporta el elemento de video.
              </video>
              <div 
                ref={heroOverlayRef}
                className="hero-overlay absolute inset-0 bg-black/40"
              />
            </div>
            
            {/* Original Content Layer */}
            <div 
              ref={heroContentRef}
              className="hero-content relative z-10 h-full flex items-center justify-center"
            >
              <div className="hero-text-wrapper text-center px-4">
                <h1 
                  ref={heroTitleRef}
                  className="hero-title text-5xl md:text-7xl tracking-tight text-white mb-4"
                >
                  <span className="block text-accent" style={{ textShadow: '0 0 30px rgba(232, 78, 15, 0.5)' }}>Dirección Integral</span>
                  <span className="block">de Proyectos</span>
                </h1>
                
                <p 
                  ref={heroSubtitleRef}
                  className="hero-subtitle max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8"
                >
                  que transforman la infraestructura del Perú
                </p>
                
                <div ref={heroCTARef} className="hero-cta">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden bg-primary text-white hover:bg-primary/90"
                    onClick={() => {
                      const statsSection = document.getElementById('stats');
                      if (statsSection) {
                        statsSection.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                  >
                    Descubre DIP
                    <MoveRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 group-hover:animate-shine" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* New Content that appears */}
          <div 
            ref={newContentRef}
            className="new-content absolute left-1/2 transform -translate-x-1/2 w-[80%] md:w-[60%] z-20 pointer-events-none bottom-[calc(21vh+100px)] md:bottom-[calc(45vh+100px)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-4">
              <h2 
                ref={newTitleRef}
                className="text-4xl md:text-6xl"
              >
                <span ref={wordRef} className="text-accent inline-block">{words[currentWordIndex]}</span><br/>
                <span className="text-white">juntos.</span>
              </h2>
              <p 
                ref={newDescriptionRef}
                className="text-lg md:text-xl text-white mt-4 md:mt-0"
              >
                Trabajar en colaboración nos permite ejecutar los proyectos de infraestructura más impactantes del Perú en los sectores de salud, educación, vialidad y saneamiento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroTransform;