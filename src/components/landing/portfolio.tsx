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
import { gsap, ScrollTrigger } from '@/lib/gsap';
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
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Desktop animations
      
      // First, create entrance animations
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
      
      gsap.from(subtitleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      });
      
      gsap.from(carouselWrapperRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      });
      
      // Check if all refs are available
      if (!carouselWrapperRef.current || !sectionRef.current || !titleRef.current || !subtitleRef.current) {
        console.warn('Portfolio refs not ready');
        return;
      }
      
      // First, create a trigger to make carousel sticky when it reaches center
      ScrollTrigger.create({
        trigger: carouselWrapperRef.current,
        start: "center center",
        end: "+=300%",
        markers: true,
        onEnter: () => {
          // Make carousel sticky when entering
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'sticky',
              top: '50%',
              zIndex: 10
            });
          }
        },
        onLeaveBack: () => {
          // Return to normal position when scrolling back up
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'relative',
              top: 'auto',
              zIndex: 1
            });
          }
        },
        onLeave: () => {
          // Return to normal position when scrolling past
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'relative',
              top: 'auto',
              zIndex: 1
            });
          }
        }
      });
      
      // Then, create the expansion effect when carousel is centered
      const expansionTl = gsap.timeline({
        scrollTrigger: {
          trigger: carouselWrapperRef.current,
          start: "center center",  // When carousel center hits viewport center
          end: "+=300%",          // Effect duration
          pin: sectionRef.current, // Pin the entire section
          pinSpacing: true,       // Maintain spacing
          scrub: 1,              // Smooth scrubbing
          invalidateOnRefresh: true, // Recalculate on window resize
          onUpdate: (self) => {
            console.log('Progress:', self.progress);
          }
        }
      });
      
      // Store original dimensions
      let originalWidth = 0;
      let originalMarginLeft = 0;
      
      // Set initial state
      gsap.set(carouselWrapperRef.current, {
        position: 'relative',
        zIndex: 1,
      });
      
      // Phase 1: Fade out title and subtitle (0-15%)
      expansionTl
        .to([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: -30,
          duration: 0.15,
          ease: 'power2.in',
          stagger: 0.05
        }, 0)
        
        // Phase 2: Expand carousel width only (15-40%)
        .to(carouselWrapperRef.current, {
          width: '100vw',
          marginLeft: () => {
            // Calculate negative margin to center horizontally
            const carousel = carouselWrapperRef.current;
            if (!carousel) return 0;
            const rect = carousel.getBoundingClientRect();
            
            // Store original values
            originalWidth = rect.width;
            const leftOffset = rect.left;
            originalMarginLeft = -(window.innerWidth - rect.width) / 2;
            
            return originalMarginLeft;
          },
          borderRadius: 0,
          duration: 0.25,
          ease: 'power3.inOut',
          onStart: () => {
            if (carouselWrapperRef.current) {
              carouselWrapperRef.current.classList.add('is-expanding');
              gsap.set(carouselWrapperRef.current, { 
                pointerEvents: 'none',
                zIndex: 9999
              });
            }
          }
        }, 0.15)
        
        // Phase 3: Hold expanded state (40-60%)
        .set({}, {}, "+=0.2")
        
        // Phase 4: Contract back to original size (60-85%)
        .to(carouselWrapperRef.current, {
          width: () => originalWidth + 'px',
          marginLeft: 0,
          borderRadius: '0.5rem',
          duration: 0.25,
          ease: 'power3.inOut',
          onComplete: () => {
            if (carouselWrapperRef.current) {
              carouselWrapperRef.current.classList.remove('is-expanding');
              
              // Clear inline styles but keep sticky positioning
              gsap.set(carouselWrapperRef.current, { 
                pointerEvents: 'auto',
                zIndex: 10,
                width: '',
                marginLeft: '',
                borderRadius: ''
              });
            }
          }
        }, 0.6)
        
        // Phase 5: Fade in title and subtitle (85-100%)
        .to([titleRef.current, subtitleRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
          stagger: 0.05,
          clearProps: 'all'
        }, 0.85);
      
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
        
        // Image parallax effect - subtle movement
        const image = card.querySelector('.project-image');
        if (image) {
          // Set initial position to compensate for parallax
          gsap.set(image, { yPercent: 5 });
          
          gsap.to(image, {
            yPercent: -5,
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
            filter: 'brightness(60%) saturate(150%)',
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
            filter: 'brightness(50%) saturate(100%)',
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
        <div ref={containerRef} className="" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div className="text-center mb-12">
                <h2 ref={titleRef} className="portfolio-title font-headline text-4xl md:text-5xl font-bold">Proyectos Destacados</h2>
                <p ref={subtitleRef} className="portfolio-subtitle mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                    Conoce el impacto de nuestro trabajo a través de algunos de los proyectos que hemos dirigido.
                </p>
            </div>
            <div ref={carouselWrapperRef} className="carousel-wrapper relative overflow-hidden rounded-lg" style={{ contain: 'layout' }}>
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
                                    <div className="absolute inset-0 overflow-hidden">
                                        <Image
                                            src={project.imageUrl}
                                            alt={project.name}
                                            fill
                                            sizes="100vw"
                                            className="project-image object-cover z-0 transition-all duration-500 group-hover:saturate-150 filter grayscale-0 saturate-100 brightness-50 scale-110"
                                        />
                                    </div>
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