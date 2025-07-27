'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import ParticleBackground from './particle-background';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out'
      }
    });
    
    // Animate background image
    tl.from('.hero-bg', {
      scale: 1.2,
      opacity: 0,
      duration: 1.5
    })
    // Animate overlay
    .from('.hero-overlay', {
      opacity: 0,
      duration: 1
    }, '-=1')
    // Animate title spans separately for glitch effect
    .from('.hero-title-1', {
      y: 100,
      opacity: 0,
      skewY: 10,
      duration: 1
    }, '-=0.5')
    .from('.hero-title-2', {
      y: 100,
      opacity: 0,
      skewY: -10,
      duration: 1
    }, '-=0.8')
    // Add glitch effect on title
    .to('.hero-title-1', {
      skewX: 2,
      x: -2,
      duration: 0.1,
      yoyo: true,
      repeat: 2,
      ease: 'power4.inOut'
    }, '-=0.2')
    // Animate subtitle
    .from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8
    }, '-=0.5')
    // Animate button with scale
    .from('.hero-cta', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.3');
    
    // Add continuous subtle animation to title
    gsap.to('.hero-title-1', {
      textShadow: '0 0 30px rgba(231, 78, 15, 0.8)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
    
    // Parallax effect on scroll
    gsap.to('.hero-bg', {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    
  }, { scope: containerRef });
  
  // Enhanced hover animation for CTA button
  useEffect(() => {
    const button = document.querySelector('.hero-cta');
    if (!button) return;
    
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    button.addEventListener('mouseenter', () => hoverTl.play());
    button.addEventListener('mouseleave', () => hoverTl.reverse());
    
    return () => {
      button.removeEventListener('mouseenter', () => hoverTl.play());
      button.removeEventListener('mouseleave', () => hoverTl.reverse());
    };
  }, []);
  
  return (
    <section ref={heroRef} id="hero" className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <Image
          src="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="hero-bg absolute inset-0 z-0"
          data-ai-hint="architecture building"
        />
        <ParticleBackground />
        <div className="hero-overlay absolute inset-0 bg-black/50"></div>
      </div>
      <div className="z-10 flex flex-col items-center text-center px-4 text-white">
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="hero-title-1 text-glow block">Dirección Integral</span>
          <span className="hero-title-2 block">de Proyectos</span>
        </h1>
        <p className="hero-subtitle mt-4 max-w-3xl text-lg md:text-xl text-white/80">
          que transforman la infraestructura del Perú
        </p>
        <Link href="#pillars">
          <Button size="lg" className="hero-cta mt-8 group relative overflow-hidden bg-white text-primary hover:bg-white/90">
            Explorar DIP
            <MoveRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 group-hover:animate-shine" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;