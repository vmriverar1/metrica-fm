'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight, ChevronDown } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { HomePageData } from '@/types/home';
import { analytics } from '@/lib/analytics';

// Video functionality removed - using static image instead

interface HeroTransformProps {
  data: HomePageData['hero'];
}

// Helper function to determine the correct background image source
const getBackgroundImageSrc = (background: HomePageData['hero']['background']): string => {
  // If type is explicitly set to 'image', use image_fallback_internal (the main editable field)
  if (background.type === 'image' && background.image_fallback_internal) {
    return background.image_fallback_internal;
  }

  // If no type is set (legacy data), default to image mode and use fallback logic
  if (!background.type) {
    // Priority: image_fallback_internal > image_fallback > image_main > default
    return background.image_fallback_internal ||
           background.image_fallback ||
           background.image_main ||
           "/images/proyectos/hero-background.jpg";
  }

  // For video type, use image_fallback_internal as poster/fallback
  return background.image_fallback_internal ||
         background.image_fallback ||
         "/images/proyectos/hero-background.jpg";
};

const HeroTransform = ({ data }: HeroTransformProps) => {
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
  const isoLogoRef = useRef<HTMLDivElement>(null);
  const apprologLogoRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  
  const words = data?.rotating_words || ['Maximiza', 'Optimiza', 'Impulsa'];
  const cta = data?.cta || { text: 'Conocer más', target: '#services' };
  const title = data?.title || { main: 'Métrica', secondary: 'FM' };
  const subtitle = data?.subtitle || 'Dirección Integral de Proyectos';
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
      
      // Fade out all original content including logos and scroll arrow
      tl.to([heroTitleRef.current, heroSubtitleRef.current, heroCTARef.current, isoLogoRef.current, apprologLogoRef.current, scrollArrowRef.current], {
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
        yPercent: -15, // Adjusted to lower the image further
        ease: "power2.inOut"
      }, 0);
      
      // Fade out original content including logos and scroll arrow
      tl.to([heroTitleRef.current, heroSubtitleRef.current, heroCTARef.current, isoLogoRef.current, apprologLogoRef.current, scrollArrowRef.current], {
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
              {/* Video mode: show video if type is video AND has video_url */}
              {data.background.type === 'video' && data.background.video_url ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster={data.background.image_fallback || "/images/proyectos/hero-background.jpg"}
                >
                  <source src={data.background.video_url} type="video/mp4" />
                  {data.background.video_url_fallback && (
                    <source src={data.background.video_url_fallback} type="video/mp4" />
                  )}
                  <img
                    src={data.background.image_fallback || "/images/proyectos/hero-background.jpg"}
                    alt="Métrica FM - Proyectos de construcción"
                    className="w-full h-full object-cover"
                  />
                </video>
              ) : (
                /* Image mode: use image_main if type is image, otherwise fallback logic */
                <img
                  src={getBackgroundImageSrc(data.background)}
                  alt="Métrica FM - Proyectos de construcción"
                  className="w-full h-full object-cover"
                />
              )}
              <div
                ref={heroOverlayRef}
                className="hero-overlay absolute inset-0"
                style={{ backgroundColor: `rgba(0, 0, 0, ${data.background.overlay_opacity || 0.5})` }}
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
                  <span className="block text-accent" style={{ textShadow: '0 0 30px rgba(0, 168, 232, 0.5)' }}>{title.main}</span>
                  <span className="block">{title.secondary}</span>
                </h1>
                
                <p
                  ref={heroSubtitleRef}
                  className="hero-subtitle max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8"
                >
                  {subtitle}
                </p>

                <div ref={heroCTARef} className="hero-cta">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-primary text-white hover:bg-primary/90"
                    onClick={() => {
                      // Track CTA click
                      analytics.buttonClick('hero_cta_main', 'hero_section');
                      analytics.logEvent('hero_cta_click', {
                        cta_text: cta.text,
                        cta_target: cta.target,
                        location: 'hero_section'
                      });

                      const targetElement = document.querySelector(cta.target);
                      if (targetElement) {
                        targetElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                  >
                    {cta.text}
                    <MoveRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 group-hover:animate-shine" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Indicador de scroll */}
            <div
              ref={scrollArrowRef}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
              style={{ zIndex: 10 }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/70 text-sm font-alliance-medium tracking-wider">DESLIZA</span>
                <svg
                  className="w-6 h-6 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

            {/* Left side logos - responsive layout */}
            <div ref={isoLogoRef} className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-30 flex flex-row md:flex-col gap-2">
              <div>
                <img
                  src="/images/proyectos/LOGO ISO/logo iso.webp"
                  alt="Certificación ISO"
                  className="w-14 h-14 md:w-28 md:h-28 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                  style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                />
              </div>
            </div>

          </div>
          
          {/* New Content that appears */}
          <div 
            ref={newContentRef}
            className="new-content absolute left-1/2 transform -translate-x-1/2 w-[80%] md:w-[60%] z-20 pointer-events-none bottom-[calc(21vh+100px)] min-[480px]:bottom-[calc(21vh+200px)] md:bottom-[calc(45vh+100px)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-4">
              <h2
                ref={newTitleRef}
                className="text-4xl md:text-5xl"
              >
                <span className="text-accent">Soluciones</span><br/>
                <span ref={wordRef} className="text-white inline-block">{words[currentWordIndex]}.</span>
              </h2>
              <p 
                ref={newDescriptionRef}
                className="text-lg md:text-xl text-white mt-4 md:mt-0"
              >
                {data.transition_text}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroTransform;