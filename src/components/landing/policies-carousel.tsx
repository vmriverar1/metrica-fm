'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Shield, Award, Leaf, Heart, Scale, AlertCircle, Lightbulb, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Datos de políticas con íconos y descripciones
const policiesData = [
  {
    id: 1,
    icon: Award,
    title: 'Política de Calidad',
    description: 'Compromiso con la excelencia en cada proyecto, superando las expectativas de nuestros clientes.',
    image: '/images/policies/quality.jpg',
    color: '#003F6F'
  },
  {
    id: 2,
    icon: Shield,
    title: 'Política de Seguridad y Salud en el Trabajo',
    description: 'Priorizamos la seguridad de nuestros trabajadores con protocolos estrictos y capacitación continua.',
    image: '/images/policies/safety.jpg',
    color: '#003F6F'
  },
  {
    id: 3,
    icon: Leaf,
    title: 'Política de Medio Ambiente',
    description: 'Construimos de manera sostenible, minimizando el impacto ambiental en cada etapa del proyecto.',
    image: '/images/policies/environment.jpg',
    color: '#1E5F8E'
  },
  {
    id: 4,
    icon: Heart,
    title: 'Política de Responsabilidad Social',
    description: 'Contribuimos al desarrollo de las comunidades donde operamos, generando valor compartido.',
    image: '/images/policies/social.jpg',
    color: '#FF6B35'
  },
  {
    id: 5,
    icon: Scale,
    title: 'Política de Ética y Cumplimiento',
    description: 'Actuamos con integridad y transparencia, cumpliendo estrictamente las normativas vigentes.',
    image: '/images/policies/ethics.jpg',
    color: '#E84E0F'
  },
  {
    id: 6,
    icon: AlertCircle,
    title: 'Política de Gestión de Riesgos',
    description: 'Identificamos y gestionamos proactivamente los riesgos para asegurar el éxito del proyecto.',
    image: '/images/policies/risks.jpg',
    color: '#E84E0F'
  },
  {
    id: 7,
    icon: Lightbulb,
    title: 'Política de Innovación y Mejora Continua',
    description: 'Adoptamos tecnologías innovadoras y mejoramos constantemente nuestros procesos.',
    image: '/images/policies/innovation.jpg',
    color: '#E84E0F'
  },
  {
    id: 8,
    icon: Lock,
    title: 'Política de Confidencialidad y Protección de Datos',
    description: 'Protegemos la información confidencial de nuestros clientes con los más altos estándares.',
    image: '/images/policies/privacy.jpg',
    color: '#E84E0F'
  }
];

export default function PoliciesCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isBeginning, setIsBeginning] = useState(false);
  const [isEnd, setIsEnd] = useState(true);
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
    if (titleRef.current) {
      const titleSpans = titleRef.current.querySelectorAll('span');
      entryTl.from(titleSpans, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: 'power4.out',
        clearProps: 'all'
      });
    }

    // Animación de las cards con fade-in
    const cards = containerRef.current?.querySelectorAll('.swiper-slide');
    if (cards) {
      entryTl.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all'
      }, '-=0.6');
    }

    // ScrollTrigger para controlar el carousel (L→R)
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=250%',
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
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
            
            // Dirección izquierda a derecha (invertida)
            const translateValue = minTranslate + (range * (1 - progress));
            
            // Aplicar transformación directamente
            swiper.setTranslate(translateValue);
            swiper.updateProgress();
            swiper.updateActiveIndex();
            
            // Actualizar estados
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
    <section ref={sectionRef} id="policies" className="relative bg-primary overflow-hidden">
      <div className="py-24">
        {/* Header */}
        <div className="container mx-auto px-4 mb-16">
          <h2 ref={titleRef} className="title-section text-4xl md:text-5xl">
            <span className="text-accent">NUESTRAS</span>
            <span className="block text-white">POLÍTICAS</span>
          </h2>
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
            initialSlide={policiesData.length - 1} // Empezar desde el final
            freeMode={false}
            grabCursor={false}
            allowTouchMove={false}
            simulateTouch={false}
            touchRatio={0}
            speed={0}
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
            className="policies-swiper swiper-no-swiping"
          >
            {policiesData.map((policy, index) => (
              <SwiperSlide key={policy.id} className="h-auto">
                <div className="card group relative h-full bg-background/90 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                  {/* Imagen */}
                  <div className="media-container relative aspect-[8/5] overflow-hidden">
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${policy.color}66 0%, ${policy.color}33 100%)`
                      }}
                    />
                    {/* Placeholder para imagen */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <policy.icon className="h-24 w-24 text-white/20" />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="card-text p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="p-2 rounded-full bg-white/10"
                      >
                        <policy.icon 
                          className="h-6 w-6 text-accent"
                        />
                      </div>
                      <h3 className="text-xl font-alliance-extrabold text-white">
                        {policy.title}
                      </h3>
                    </div>
                    <p className="text-white/70 font-alliance-medium line-clamp-3">
                      {policy.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
        </div>
      </div>

      <style jsx global>{`
        .policies-swiper {
          padding: 0 1.5rem;
          will-change: transform;
        }

        .policies-swiper .swiper-wrapper {
          will-change: transform;
        }

        .policies-swiper .swiper-slide {
          height: auto;
          opacity: 0.5;
          transition: opacity 0.5s ease;
          will-change: opacity, transform;
        }

        .policies-swiper .swiper-slide-active {
          opacity: 1;
        }

        .policies-swiper .swiper-slide-next,
        .policies-swiper .swiper-slide-prev {
          opacity: 0.8;
        }

        .policies-swiper .card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .policies-swiper .card:hover {
          border-color: rgba(232, 78, 15, 0.5);
          box-shadow: 0 20px 50px rgba(232, 78, 15, 0.3);
        }

        .policies-swiper .media-container {
          position: relative;
          border-radius: 0.75rem 0.75rem 0 0;
          overflow: hidden;
        }

        .policies-swiper .card-text {
          background: rgba(0, 63, 111, 0.95);
          border-radius: 0 0 0.75rem 0.75rem;
        }

        @media (max-width: 821px) {
          .policies-swiper {
            padding: 0 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}