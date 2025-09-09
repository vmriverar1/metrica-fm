'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NavigationLink from '@/components/ui/NavigationLink';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import PortfolioProgress from '@/components/ui/portfolio-progress';
import PortfolioTransition from '@/components/ui/portfolio-transition';
import { HomePageData } from '@/types/home';
import { EmptyContentNotice, PlaceholderNotice } from '@/components/ui/development-notice';


interface PortfolioProps {
  data: HomePageData['portfolio'];
}

const Portfolio = React.memo(function Portfolio({ data }: PortfolioProps) {
  const projects = data.featured_projects.map(project => ({
    ...project,
    imageUrl: project.image_url || project.image_url_fallback
  }));
  
  // Check if we have projects or placeholder data
  const hasProjects = data?.featured_projects && data.featured_projects.length > 0;
  const isPlaceholder = data?.section?.title?.includes('Agrega') || data?.section?.subtitle?.includes('importantes') || false;
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!api) {
      return;
    }
 
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  
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
        // markers: true,
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
            const progress = self.progress;
            
            // Aplicar clases CSS para transición de color
            if (sectionRef.current) {
              if (progress >= 0.3) {
                // Agregar clase azul y mantenerla
                if (!sectionRef.current.classList.contains('overlay-blue-in')) {
                  sectionRef.current.classList.add('overlay-blue-in');
                  sectionRef.current.classList.remove('overlay-blue-out');
                }
              } else if (progress < 0.3) {
                // Solo quitar clase azul cuando se hace scroll hacia arriba
                if (sectionRef.current.classList.contains('overlay-blue-in')) {
                  sectionRef.current.classList.remove('overlay-blue-in');
                  sectionRef.current.classList.add('overlay-blue-out');
                }
              }
            }
            
            // Parpadeo de flechas cuando está completamente expandido
            if (progress >= 0.39 && progress <= 0.41) {
              const arrows = carouselWrapperRef.current?.querySelectorAll('.carousel-previous, .carousel-next');
              if (
                arrows &&
                carouselWrapperRef.current &&
                !carouselWrapperRef.current.dataset.arrowsFlashed
              ) {
                carouselWrapperRef.current.dataset.arrowsFlashed = 'true';
                arrows.forEach(arrow => {
                  gsap.to(arrow, {
                    opacity: 0,
                    duration: 0.2,
                    repeat: 5,
                    yoyo: true,
                    ease: 'power2.inOut',
                    onComplete: () => {
                      gsap.set(arrow, { opacity: 1 });
                    }
                  });
                });
              }
            } else if (progress < 0.35 || progress > 0.45) {
              // Reset flag cuando está fuera del rango
              if (carouselWrapperRef.current) {
                delete carouselWrapperRef.current.dataset.arrowsFlashed;
              }
            }
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
          height: '90vh',
          duration: 0.05,
          ease: 'power4.out'
        }, 0.85)
        
        // Fase 4b: Contraer carousel de vuelta al tamaño original (85-95%)
        .to(carouselWrapperRef.current, {
          width: '90vw',
          height: '90vh',
          marginLeft: () => {
            // Calcular margen para centrar con 90vw
            return -(window.innerWidth * 0.9 - originalWidth) / 2;
          },
          marginTop: () => {
            // Calcular margen para centrar con 90vh
            return -(window.innerHeight * 0.9 - originalHeight) / 2;
          },
          borderRadius: '0.5rem',
          duration: 0.10,
          ease: 'power4.out',
          onComplete: () => {
            if (carouselWrapperRef.current) {
              carouselWrapperRef.current.classList.remove('is-expanding');
              
              // Mantener el tamaño al 90% con posicionamiento sticky
              gsap.set(carouselWrapperRef.current, { 
                zIndex: 10,
                width: '90vw',
                height: '90vh',
                borderRadius: '0.5rem'
              });
              
              // Mantener altura de tarjetas del proyecto al 90%
              gsap.set('.project-card', {
                height: '90vh'
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
          scrub: false
        },
        opacity: 1,
        duration: 0.5
      });
    });
    
    // Animaciones móviles
    mm.add("(max-width: 767px)", () => {
      // Animaciones de entrada móvil
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
        return;
      }
      
      // ScrollTrigger para mobile expansion
      const expansionTl = gsap.timeline({
        scrollTrigger: {
          trigger: carouselWrapperRef.current,
          start: "center center",
          end: "+=200%",
          pin: sectionRef.current,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            if (sectionRef.current) {
              if (progress >= 0.3) {
                if (!sectionRef.current.classList.contains('overlay-blue-in')) {
                  sectionRef.current.classList.add('overlay-blue-in');
                  sectionRef.current.classList.remove('overlay-blue-out');
                }
              } else if (progress < 0.3) {
                if (sectionRef.current.classList.contains('overlay-blue-in')) {
                  sectionRef.current.classList.remove('overlay-blue-in');
                  sectionRef.current.classList.add('overlay-blue-out');
                }
              }
            }
          }
        }
      });
      
      // Animación de expansión móvil
      expansionTl
        .to([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: -20,
          duration: 0.15,
          ease: 'power3.in'
        }, 0)
        .to(carouselWrapperRef.current, {
          width: '100vw',
          height: '100vh',
          marginLeft: () => {
            const carousel = carouselWrapperRef.current;
            if (!carousel) return 0;
            const rect = carousel.getBoundingClientRect();
            return -(window.innerWidth - rect.width) / 2;
          },
          marginTop: () => {
            const carousel = carouselWrapperRef.current;
            if (!carousel) return 0;
            const rect = carousel.getBoundingClientRect();
            return -(window.innerHeight - rect.height) / 2;
          },
          borderRadius: 0,
          duration: 0.25,
          ease: 'power2.inOut',
          onStart: () => {
            if (carouselWrapperRef.current) {
              gsap.set(carouselWrapperRef.current, { zIndex: 9999 });
            }
          }
        }, 0.15)
        .to('.project-card', {
          height: '100vh',
          duration: 0.15,
          ease: 'power2.inOut'
        }, 0.15)
        .set({}, {}, "+=0.7"); // Mantener expandido sin contraer
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
    <section ref={sectionRef} id="portfolio" className="relative w-full pt-16 pb-0 bg-background transition-colors duration-1000">
        <div ref={containerRef} className="" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {/* Development notices */}
            {isPlaceholder && (
              <PlaceholderNotice section="el portafolio" />
            )}
            {!hasProjects && !isPlaceholder && (
              <EmptyContentNotice section="proyectos destacados" />
            )}
            
            <div className="text-center mb-12">
                <h2 ref={titleRef} className="portfolio-title title-section text-4xl md:text-5xl">{data.section.title}</h2>
                <p ref={subtitleRef} className="portfolio-subtitle mt-4 max-w-2xl mx-auto text-lg text-foreground/70 font-alliance-medium">
                    {data.section.subtitle}
                </p>
            </div>
            <div ref={carouselWrapperRef} className="carousel-wrapper relative overflow-hidden rounded-lg" style={{ contain: 'layout' }}>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    setApi={setApi}
                    className="w-full"
                >
                    <CarouselContent>
                        {projects.map((project, index) => (
                            <CarouselItem key={index}>
                                <div className="project-card h-[60vh] w-full relative rounded-lg overflow-hidden flex items-center justify-center group" data-index={index}>
                                        <div className="absolute inset-0 overflow-hidden">
                                            {project.imageUrl && project.imageUrl !== '/img/portfolio/proyecto1.jpg' ? (
                                              <Image
                                                  src={project.imageUrl}
                                                  alt={project.name}
                                                  fill
                                                  sizes="100vw"
                                                  className="project-image object-cover z-0 transition-all ease-out group-hover:saturate-150 filter grayscale-0 saturate-100 brightness-50 scale-125 animate-ken-burns"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                                <div className="text-center text-white">
                                                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                                                    <span className="text-3xl">🏗️</span>
                                                  </div>
                                                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                                                  <p className="text-sm opacity-90">Imagen del proyecto</p>
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                        <div className="project-overlay absolute inset-0 bg-black/50 transition-opacity duration-300"></div>
                                        <div className="project-content relative z-10 text-white text-center p-8 max-w-4xl mx-auto">
                                            <Badge 
                                                variant="secondary" 
                                                className={cn(
                                                    "mb-4 bg-accent/80 text-accent-foreground border-transparent transition-all duration-500",
                                                    current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                                )}
                                                style={{
                                                    transitionDelay: current === index ? '300ms' : '0ms'
                                                }}
                                            >
                                                {project.type}
                                            </Badge>
                                            <h3 
                                                className={cn(
                                                    "title-section text-4xl md:text-6xl mb-4 transition-all duration-700",
                                                    current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                                )}
                                                style={{
                                                    transitionDelay: current === index ? '500ms' : '0ms'
                                                }}
                                            >
                                                {project.name}
                                            </h3>
                                            <p 
                                                className={cn(
                                                    "text-lg md:text-xl text-white/80 mb-8 font-alliance-medium transition-all duration-700",
                                                    current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                                )}
                                                style={{
                                                    transitionDelay: current === index ? '700ms' : '0ms'
                                                }}
                                            >
                                                {project.description}
                                            </p>
                                            <NavigationLink 
                                                href={data.section.cta.url}
                                                loadingMessage="Cargando portafolio completo..."
                                            >
                                                <Button 
                                                    variant="outline" 
                                                    className={cn(
                                                        "bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-700",
                                                        current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                                    )}
                                                    style={{
                                                        transitionDelay: current === index ? '900ms' : '0ms'
                                                    }}
                                                >
                                                    {data.section.cta.text}
                                                </Button>
                                            </NavigationLink>
                                        </div>
                                    </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="carousel-previous absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/20 hover:bg-black/40 border-none transition-all duration-200 h-10 w-10 rounded-full backdrop-blur-sm hover:scale-110 shadow-lg" />
                    <CarouselNext className="carousel-next absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/20 hover:bg-black/40 border-none transition-all duration-200 h-10 w-10 rounded-full backdrop-blur-sm hover:scale-110 shadow-lg" />
                    {count > 0 && (
                      <PortfolioProgress 
                        current={current} 
                        total={count} 
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
                      />
                    )}
                </Carousel>
            </div>
        </div>
        
        {/* Transición a Pillars */}
        <div className="portfolio-transition absolute -bottom-10 left-0 right-0 h-20 pointer-events-none z-20">
            <div className="transition-gradient w-full h-full bg-gradient-to-b from-transparent to-background/50"></div>
        </div>
    </section>
  );
});

export default Portfolio;