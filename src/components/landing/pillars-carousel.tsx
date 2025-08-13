'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Navigation } from 'swiper/modules';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Target, Users, Search, BarChart, Shield, UserCheck, Compass, Network, ScanSearch, ChartBar, AlertTriangle, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Datos actualizados con imágenes placeholder
const pillarsData = [
  {
    id: 1,
    icon: Compass,
    title: 'Planificación Estratégica',
    description: 'Definimos la hoja de ruta para el éxito del proyecto, optimizando plazos y recursos desde el inicio.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    color: '#E84E0F'
  },
  {
    id: 2,
    icon: Network,
    title: 'Coordinación Multidisciplinaria',
    description: 'Integramos equipos de diseño, construcción y fiscalización para una ejecución sin fisuras.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    color: '#E84E0F'
  },
  {
    id: 3,
    icon: ScanSearch,
    title: 'Supervisión Técnica',
    description: 'Garantizamos que cada etapa de la construcción cumpla con los más altos estándares de ingeniería.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    color: '#E84E0F'
  },
  {
    id: 4,
    icon: ChartBar,
    title: 'Control de Calidad y Costos',
    description: 'Implementamos un riguroso control para asegurar la calidad de los materiales y la eficiencia del presupuesto.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    color: '#E84E0F'
  },
  {
    id: 5,
    icon: AlertTriangle,
    title: 'Gestión de Riesgos',
    description: 'Identificamos y mitigamos proactivamente los posibles riesgos que puedan afectar al proyecto.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    color: '#E84E0F'
  },
  {
    id: 6,
    icon: Building2,
    title: 'Representación del Cliente',
    description: 'Actuamos como sus ojos y oídos en el campo, defendiendo sus intereses en cada decisión.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    color: '#E84E0F'
  }
];

export default function PillarsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useGSAP(() => {
    if (!sectionRef.current || !swiperRef.current) return;

    // Timeline para animaciones de entrada
    const entryTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true
      }
    });

    // Animación del título con fade y movimiento
    entryTl.from(titleRef.current, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      clearProps: 'all'
    });

    // Animación del subtítulo completo
    if (subtitleRef.current) {
      entryTl.from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all'
      }, '-=0.8');
    }

    // Cards visibles desde el principio - sin fade-in

    // ScrollTrigger para controlar el carousel (R→L)
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=250%', // Más espacio para scroll suave
        pin: true,
        pinSpacing: true,
        scrub: 1.5, // Suavizar el movimiento
        anticipatePin: 1,
        onEnter: () => setIsPinned(true),
        onLeave: () => setIsPinned(false),
        onEnterBack: () => setIsPinned(true),
        onLeaveBack: () => setIsPinned(false),
        onUpdate: (self) => {
          if (swiperRef.current && swiperRef.current.swiper) {
            const progress = self.progress;
            const swiper = swiperRef.current.swiper;
            
            // Calcular posición basada en el progreso
            const maxTranslate = swiper.maxTranslate();
            const minTranslate = swiper.minTranslate();
            const range = maxTranslate - minTranslate;
            
            // Dirección derecha a izquierda
            const translateValue = minTranslate + (range * progress);
            
            // Aplicar transformación directamente
            swiper.setTranslate(translateValue);
            swiper.updateProgress();
            swiper.updateActiveIndex();
            
            // Actualizar estado de navegación
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }
        }
      }
    });

  }, { scope: sectionRef });

  // Funciones de navegación manual
  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper && isPinned) {
      const swiper = swiperRef.current.swiper;
      swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper && isPinned) {
      const swiper = swiperRef.current.swiper;
      swiper.slideNext();
    }
  };

  return (
    <section ref={sectionRef} id="pillars" className="relative bg-background overflow-hidden h-screen">
      <div className="py-24">
        {/* Header */}
        <div className="container mx-auto px-4 mb-16 text-center">
          <h2 ref={titleRef} className="title-section text-4xl md:text-5xl mb-4">
            ¿Qué es DIP?
          </h2>
          <p ref={subtitleRef} className="max-w-2xl mx-auto text-lg text-foreground/70 font-alliance-medium">
            Nuestra Dirección Integral de Proyectos <span className="text-accent font-alliance-extrabold">(DIP)</span> se fundamenta en seis pilares clave para garantizar la excelencia.
          </p>
        </div>

        {/* Carousel Container */}
        <div ref={containerRef} className="carousel-container relative">
          {/* Navigation Arrows - Solo desktop */}
          <div className={`navigation-container hidden lg:block transition-opacity duration-300 ${isPinned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={handlePrev}
              className={`swiper-prev absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-110 ${isBeginning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isBeginning}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className={`swiper-next absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-110 ${isEnd ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isEnd}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <Swiper
            ref={swiperRef}
            modules={[FreeMode, Mousewheel]}
            spaceBetween={24}
            slidesPerView={1.05}
            centeredSlides={true}
            freeMode={false}
            grabCursor={false}
            allowTouchMove={false} // Desactivar touch/drag
            simulateTouch={false}
            touchRatio={0}
            speed={0} // Sin transiciones propias de Swiper
            breakpoints={{
              640: {
                slidesPerView: 1.5,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 2.25,
                spaceBetween: 48,
              },
            }}
            className="pillars-swiper swiper-no-swiping"
          >
            {pillarsData.map((pillar, index) => (
              <SwiperSlide key={pillar.id} className="h-auto">
                <div className="card group relative h-full bg-accent/90 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-accent">
                  {/* Imagen */}
                  <div className="media-container relative aspect-[8/5] overflow-hidden">
                    <Image 
                      src={pillar.image}
                      alt={pillar.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="card-text">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="p-2 rounded-full bg-white/20"
                      >
                        <pillar.icon 
                          className="h-6 w-6 text-white"
                        />
                      </div>
                      <h3 className="text-xl font-alliance-extrabold text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-white/90 font-alliance-medium line-clamp-3">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
        </div>
      </div>

      <style jsx global>{`
        .carousel-container {
          --swiper-column-gap: 1.5rem;
          --swiper-slides-perview: 2.25;
          --swiper-slides-perview-md-down: 1.05;
          --media-aspect-ratio: 8 / 5;
        }

        .pillars-swiper {
          padding: 0 1.5rem;
          will-change: transform;
        }

        .pillars-swiper .swiper-wrapper {
          will-change: transform;
        }

        .pillars-swiper .swiper-slide {
          height: 45vh !important;
          opacity: 1;
          transition: opacity 0.5s ease;
          will-change: transform;
        }

        .card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #E84E0F, #FF6B35, #003F6F, #E84E0F);
          background-size: 400% 400%;
          border-radius: 0.75rem;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.5s ease;
          animation: glowRotate 3s linear infinite;
        }

        @keyframes glowRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .card:hover::before {
          opacity: 0.8;
        }

        .card:hover {
          border-color: transparent;
          box-shadow: 
            0 20px 50px rgba(232, 78, 15, 0.3),
            0 0 30px rgba(232, 78, 15, 0.2),
            inset 0 0 20px rgba(232, 78, 15, 0.1);
          transform: translateY(-4px) scale(1.02);
        }

        .media-container {
          position: relative;
          border-radius: 0.75rem 0.75rem 0 0;
          overflow: hidden;
          flex: 1;
          min-height: 0;
        }

        .card-text {
          background: rgba(29, 29, 27, 0.95);
          border-radius: 0 0 0.75rem 0.75rem;
          flex-shrink: 0;
          padding: 1.5rem;
        }

        @media (max-width: 821px) {
          .carousel-container {
            --swiper-slides-perview: var(--swiper-slides-perview-md-down);
          }
          
          .pillars-swiper {
            padding: 0 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}