'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Calendar, Award } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioHero() {
  const { pageData, allProjects, isLoading, error } = usePortfolio();
  const [counters, setCounters] = useState({
    projects: 0,
    years: 0,
    categories: 0,
    cities: 0
  });

  // Refs para animaciones GSAP
  const heroRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const targetValues = {
    projects: pageData?.hero.stats.projects.value || allProjects.length,
    years: pageData?.hero.stats.experience.value || 15,
    categories: pageData?.hero.stats.categories.value || 7,
    cities: pageData?.hero.stats.cities.value || new Set(allProjects.map(p => p.location.city)).size
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      if (progress >= 1) {
        setCounters(targetValues);
        clearInterval(timer);
      } else {
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setCounters({
          projects: Math.floor(targetValues.projects * easeOut),
          years: Math.floor(targetValues.years * easeOut),
          categories: Math.floor(targetValues.categories * easeOut),
          cities: Math.floor(targetValues.cities * easeOut)
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [allProjects.length, pageData]);

  // GSAP Parallax and animations setup
  useEffect(() => {
    if (!heroRef.current || !backgroundRef.current || !contentRef.current) return;

    const hero = heroRef.current;
    const background = backgroundRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const title = titleRef.current;
    const stats = statsRef.current;

    // Parallax effect for background
    gsap.to(background, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    // Overlay fade effect
    if (overlay) {
      gsap.to(overlay, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });
    }

    // Content parallax (slower than background)
    gsap.to(content, {
      yPercent: -25,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    // Title cinematic entrance
    if (title) {
      gsap.fromTo(title.querySelectorAll('h1 > *'), 
        {
          opacity: 0,
          y: 100,
          rotationX: 90
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.5
        }
      );
    }

    // Stats reveal animation
    if (stats) {
      gsap.fromTo(stats.children,
        {
          opacity: 0,
          y: 50,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 1.2
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Show loading state if data isn't ready
  if (isLoading) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando portfolio...</p>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden flex items-center justify-center bg-gradient-to-r from-red-900 to-red-800">
        <div className="text-white text-center">
          <p>Error al cargar el portfolio: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0">
        <div 
          ref={backgroundRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 will-change-transform"
          style={{
            backgroundImage: `url("${pageData?.hero.background_image || pageData?.hero.background_image_fallback || "https://metrica-dip.com/images/slider-inicio-es/01.jpg"}")`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0"
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 h-full flex items-center will-change-transform">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Main title with glitch effect */}
            <div ref={titleRef} className="mb-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="relative inline-block">
                  {pageData?.hero.title.split(' ')[0] || 'Nuestro'}
                  {/* Glitch effect layers */}
                  <span className="absolute inset-0 text-accent opacity-20 transform translate-x-1 translate-y-1">
                    {pageData?.hero.title.split(' ')[0] || 'Nuestro'}
                  </span>
                  <span className="absolute inset-0 text-blue-400 opacity-20 transform -translate-x-1 -translate-y-1">
                    {pageData?.hero.title.split(' ')[0] || 'Nuestro'}
                  </span>
                </span>{' '}
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-accent"
                >
                  {pageData?.hero.title.split(' ').slice(1).join(' ') || 'Portafolio'}
                </motion.span>
              </h1>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed"
            >
              {pageData?.hero.subtitle || 'Explora la diversidad y el impacto de nuestros proyectos de infraestructura que transforman espacios y potencian el crecimiento en todo el Perú.'}
            </motion.p>

            {/* Animated statistics */}
            <div 
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl"
            >
              {/* Projects count */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {counters.projects}+
                </div>
                <div className="text-sm md:text-base text-white/80">
                  {pageData?.hero.stats.projects.label || 'Proyectos Completados'}
                </div>
              </div>

              {/* Years of experience */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {counters.years}
                </div>
                <div className="text-sm md:text-base text-white/80">
                  {pageData?.hero.stats.experience.label || 'Años de Experiencia'}
                </div>
              </div>

              {/* Categories */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {counters.categories}
                </div>
                <div className="text-sm md:text-base text-white/80">
                  {pageData?.hero.stats.categories.label || 'Categorías de Proyecto'}
                </div>
              </div>

              {/* Cities */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {counters.cities}
                </div>
                <div className="text-sm md:text-base text-white/80">
                  {pageData?.hero.stats.cities.label || 'Ciudades de Impacto'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}