'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const projects = [
  {
    name: 'Hospital Nacional de Alta Complejidad',
    type: 'Sanitaria',
    description: 'Supervisión integral de la construcción y equipamiento del hospital más moderno de la región.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg'
  },
  {
    name: 'Institución Educativa Emblemática "Futuro"',
    type: 'Educativa',
    description: 'Dirección del proyecto para la modernización de infraestructura educativa para más de 5,000 estudiantes.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg'
  },
  {
    name: 'Autopista del Sol - Tramo IV',
    type: 'Vial',
    description: 'Control de calidad y supervisión técnica en uno de los corredores viales más importantes del país.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg'
  },
  {
    name: 'Planta de Tratamiento de Aguas Residuales',
    type: 'Saneamiento',
    description: 'Gestión de proyecto para la ampliación y modernización de la planta, beneficiando a 2 millones de personas.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg'
  },
];

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Desktop animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1
        }
      });
      
      // Animate title and subtitle
      tl.from('.portfolio-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('.portfolio-subtitle', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.carousel-wrapper', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.3');
      
      // Individual project card animations
      gsap.utils.toArray('.project-card').forEach((card: any, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          y: 100,
          opacity: 0,
          duration: 1,
          delay: index * 0.1,
          ease: 'power3.out'
        });
        
        // Image parallax effect
        const image = card.querySelector('.project-image');
        if (image) {
          gsap.to(image, {
            yPercent: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        }
        
        // Hover effects
        const projectOverlay = card.querySelector('.project-overlay');
        const projectContent = card.querySelector('.project-content');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(image, {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
          });
          gsap.to(projectOverlay, {
            opacity: 0.7,
            duration: 0.3
          });
          gsap.to(projectContent, {
            y: -10,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(image, {
            scale: 1.05,
            duration: 0.6,
            ease: 'power2.out'
          });
          gsap.to(projectOverlay, {
            opacity: 0.5,
            duration: 0.3
          });
          gsap.to(projectContent, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    });
    
    // Mobile animations
    mm.add("(max-width: 767px)", () => {
      gsap.from('.portfolio-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
      
      gsap.from('.portfolio-subtitle', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      });
    });
    
  }, { scope: containerRef });
  
  // Animate carousel navigation buttons
  useGSAP(() => {
    const prevButton = containerRef.current?.querySelector('.carousel-previous');
    const nextButton = containerRef.current?.querySelector('.carousel-next');
    
    if (prevButton) {
      gsap.set(prevButton, { x: -100, opacity: 0 });
      gsap.to(prevButton, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: 1,
        ease: 'power3.out'
      });
    }
    
    if (nextButton) {
      gsap.set(nextButton, { x: 100, opacity: 0 });
      gsap.to(nextButton, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: 1,
        ease: 'power3.out'
      });
    }
  }, { scope: containerRef });
  
  return (
    <section ref={sectionRef} id="portfolio" className="relative w-full py-24 bg-background">
        <div ref={containerRef} className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="portfolio-title font-headline text-4xl md:text-5xl font-bold">Proyectos Destacados</h2>
                <p className="portfolio-subtitle mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                    Conoce el impacto de nuestro trabajo a través de algunos de los proyectos que hemos dirigido.
                </p>
            </div>
            <div className="carousel-wrapper">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {projects.map((project, index) => (
                            <CarouselItem key={index}>
                                <div className="project-card h-[60vh] w-full relative rounded-lg overflow-hidden flex items-center justify-center group">
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.name}
                                        layout="fill"
                                        objectFit="cover"
                                        className="project-image z-0 transition-all duration-500 group-hover:saturate-150 filter grayscale-0 saturate-100 brightness-50 scale-105"
                                    />
                                    <div className="project-overlay absolute inset-0 bg-black/50 transition-opacity duration-300"></div>
                                    <div className="project-content relative z-10 text-white text-center p-8 max-w-4xl mx-auto">
                                        <Badge variant="secondary" className="mb-4 bg-accent/80 text-accent-foreground border-transparent">{project.type}</Badge>
                                        <h3 className="font-headline text-4xl md:text-6xl font-bold mb-4">{project.name}</h3>
                                        <p className="text-lg md:text-xl text-white/80 mb-8">{project.description}</p>
                                        <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                                            Ver más detalles
                                        </Button>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="carousel-previous absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-white/20 hover:bg-white/40 border-none transition-all duration-300" />
                    <CarouselNext className="carousel-next absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-white/20 hover:bg-white/40 border-none transition-all duration-300" />
                </Carousel>
            </div>
        </div>
    </section>
  );
}