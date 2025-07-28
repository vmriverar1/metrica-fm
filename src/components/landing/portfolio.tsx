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
      // Animaciones de escritorio
      
      // Primero, crear animaciones de entrada
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
      
      // Verificar si todos los refs están disponibles
      if (!carouselWrapperRef.current || !sectionRef.current || !titleRef.current || !subtitleRef.current) {
        console.warn('Portfolio refs not ready');
        return;
      }
      
      // Primero, crear un trigger para hacer el carousel sticky cuando llegue al centro
      ScrollTrigger.create({
        trigger: carouselWrapperRef.current,
        start: "center center",
        end: "+=100%",
        markers: true,
        onEnter: () => {
          // Hacer el carousel sticky al entrar
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'sticky',
              top: '50%',
              zIndex: 10
            });
          }
        },
        onLeaveBack: () => {
          // Volver a la posición normal al hacer scroll hacia arriba
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'relative',
              top: 'auto',
              zIndex: 1
            });
          }
        },
        onLeave: () => {
          // Volver a la posición normal al pasar el scroll
          if (carouselWrapperRef.current) {
            gsap.set(carouselWrapperRef.current, {
              position: 'relative',
              top: 'auto',
              zIndex: 1
            });
          }
        }
      });
      
      // Luego, crear el efecto de expansión cuando el carousel esté centrado
      const expansionTl = gsap.timeline({
        scrollTrigger: {
          trigger: carouselWrapperRef.current,
          start: "center center",  // Cuando el centro del carousel llega al centro del viewport
          end: "+=300%",          // Duración total aumentada para más tiempo expandido
          pin: sectionRef.current, // Fijar toda la sección
          pinSpacing: true,       // Mantener espaciado
          scrub: 1,              // Desplazamiento suave
          invalidateOnRefresh: true, // Recalcular al cambiar tamaño de ventana
          onUpdate: (self) => {
            console.log('Progress:', self.progress);
          }
        }
      });
      
      // Almacenar dimensiones originales
      let originalWidth = 0;
      let originalHeight = 0;
      let originalMarginLeft = 0;
      let originalMarginTop = 0;
      
      // Establecer estado inicial
      gsap.set(carouselWrapperRef.current, {
        position: 'relative',
        zIndex: 1,
      });
      
      // Fase 1: Desvanecer título y subtítulo (0-15%)
      expansionTl
        .to([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: -30,
          duration: 0.15,
          ease: 'power3.in',
          stagger: 0.05
        }, 0)
        
        // Fase 2a: Comenzar a expandir altura de tarjetas del proyecto (15-25%)
        .to('.project-card', {
          height: '100vh',
          duration: 0.15,
          ease: 'power2.inOut'
        }, 0.15)
        
        // Fase 2b: Expandir ancho y alto del carousel (15-40%)
        .to(carouselWrapperRef.current, {
          width: '100vw',
          height: '100vh',
          marginLeft: () => {
            // Calcular margen negativo para centrar horizontalmente
            const carousel = carouselWrapperRef.current;
            if (!carousel) return 0;
            const rect = carousel.getBoundingClientRect();
            
            // Almacenar valores originales
            originalWidth = rect.width;
            originalHeight = rect.height;
            originalMarginLeft = -(window.innerWidth - rect.width) / 2;
            
            return originalMarginLeft;
          },
          marginTop: () => {
            // Calcular margen negativo para centrar verticalmente
            const carousel = carouselWrapperRef.current;
            if (!carousel) return 0;
            const rect = carousel.getBoundingClientRect();
            originalMarginTop = -(window.innerHeight - rect.height) / 2;
            
            return originalMarginTop;
          },
          borderRadius: 0,
          duration: 0.25,
          ease: 'power4.inOut',
          onStart: () => {
            if (carouselWrapperRef.current) {
              carouselWrapperRef.current.classList.add('is-expanding');
              gsap.set(carouselWrapperRef.current, { 
                zIndex: 9999
              });
            }
          }
        }, 0.15)
        
        // Fase 3: Mantener estado expandido (40-85%)
        .set({}, {}, "+=0.45")
        
        // Fase 4a: Comenzar a contraer altura de tarjetas del proyecto (85-90%)
        .to('.project-card', {
          height: '60vh',
          duration: 0.05,
          ease: 'power4.out'
        }, 0.85)
        
        // Fase 4b: Contraer carousel de vuelta al tamaño original (85-95%)
        .to(carouselWrapperRef.current, {
          width: () => originalWidth + 'px',
          height: () => originalHeight + 'px',
          marginLeft: 0,
          marginTop: 0,
          borderRadius: '0.5rem',
          duration: 0.10,
          ease: 'power4.out',
          onComplete: () => {
            if (carouselWrapperRef.current) {
              carouselWrapperRef.current.classList.remove('is-expanding');
              
              // Limpiar estilos inline pero mantener posicionamiento sticky
              gsap.set(carouselWrapperRef.current, { 
                zIndex: 10,
                width: '',
                height: '',
                marginLeft: '',
                marginTop: '',
                borderRadius: ''
              });
              
              // Limpiar altura de tarjetas del proyecto
              gsap.set('.project-card', {
                height: ''
              });
            }
          }
        }, 0.85)
        
        // Fase 5: Aparecer título y subtítulo (95-100%)
        .to([titleRef.current, subtitleRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.05,
          ease: 'power2.out',
          stagger: 0.05,
          clearProps: 'all'
        }, 0.95);
      
      // Animaciones individuales de tarjetas de proyecto
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
        
        // Efecto parallax de imagen - movimiento sutil
        const image = card.querySelector('.project-image');
        if (image) {
          // Establecer posición inicial para compensar el parallax
          gsap.set(image, { yPercent: 5 });
          
          gsap.to(image, {
            yPercent: -5,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: false
            }
          });
        }
        
        // Efectos hover
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
      
      // Animación de transición sutil a Pillars
      gsap.to('.transition-gradient', {
        scrollTrigger: {
          trigger: '.portfolio-transition',
          start: 'top 90%',
          end: 'bottom 70%',
          scrub: true
        },
        opacity: 1,
        duration: 0.5
      });
    });
    
    // Animaciones móviles
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
  
  // Animar botones de navegación del carousel
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
    <section ref={sectionRef} id="portfolio" className="relative w-full pt-16 pb-0 bg-background">
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
                    <CarouselPrevious className="carousel-previous absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-white/20 hover:bg-white/40 border-none transition-all duration-300" />
                    <CarouselNext className="carousel-next absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-white/20 hover:bg-white/40 border-none transition-all duration-300" />
                </Carousel>
            </div>
        </div>
        
        {/* Transición a Pillars */}
        <div className="portfolio-transition absolute -bottom-10 left-0 right-0 h-20 pointer-events-none z-20">
            <div className="transition-gradient w-full h-full bg-gradient-to-b from-transparent to-background/50"></div>
        </div>
    </section>
  );
}