'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Shield, Award, Leaf, Heart, Scale, AlertCircle, Lightbulb, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { HomePageData } from '@/types/home';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Icon mapping
const iconMap = {
  'Award': Award,
  'Shield': Shield,
  'Leaf': Leaf,
  'Heart': Heart,
  'Scale': Scale,
  'AlertCircle': AlertCircle,
  'Lightbulb': Lightbulb,
  'Lock': Lock,
} as const;

interface PoliciesCarouselProps {
  data: HomePageData['policies'];
}

export default function PoliciesCarousel({ data }: PoliciesCarouselProps) {
  const policiesData = data.policies.map(policy => ({
    ...policy,
    icon: iconMap[policy.icon as keyof typeof iconMap] || Award,
    image: policy.image || policy.image_fallback,
    color: '#E84E0F'
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isBeginning, setIsBeginning] = useState(false);
  const [isEnd, setIsEnd] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Cards visibles desde el principio - sin fade-in

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
    <section ref={sectionRef} id="policies" className="relative bg-primary overflow-hidden h-screen">
      <div className="py-24">
        {/* Header */}
        <div className="container mx-auto px-4 mb-16">
          <h2 ref={titleRef} className="title-section text-4xl md:text-5xl">
            {data.section.title.split(' ').map((word, index) => (
              <span key={index} className={index === 0 ? "text-accent" : "block text-white"}>
                {word}
              </span>
            ))}
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
            grabCursor={isMobile}
            allowTouchMove={isMobile} // Habilitar touch solo en móvil
            simulateTouch={isMobile}
            touchRatio={isMobile ? 1 : 0}
            speed={isMobile ? 300 : 0} // Velocidad condicional
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
                <div className="card group relative h-full bg-accent/90 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-accent">
                  {/* Imagen */}
                  <div className="media-container relative aspect-[8/5] overflow-hidden">
                    <Image 
                      src={policy.image}
                      alt={policy.title}
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
                        <policy.icon 
                          className="h-6 w-6 text-white"
                        />
                      </div>
                      <h3 className="text-xl font-alliance-extrabold text-white">
                        {policy.title}
                      </h3>
                    </div>
                    <p className="text-white/90 font-alliance-medium line-clamp-3">
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
          height: 65vh !important;
          opacity: 1;
          transition: opacity 0.5s ease;
          will-change: transform;
        }


        /* Tablet y desktop */
        @media (min-width: 768px) {
          .policies-swiper .swiper-slide {
            height: 45vh !important;
          }
        }

        .policies-swiper .card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .policies-swiper .card:hover {
          border-color: rgba(232, 78, 15, 0.5);
          box-shadow: 0 20px 50px rgba(232, 78, 15, 0.3);
        }

        .policies-swiper .media-container {
          position: relative;
          border-radius: 0.75rem 0.75rem 0 0;
          overflow: hidden;
          flex: 1;
          min-height: 0;
        }

        .policies-swiper .card-text {
          background: rgba(0, 63, 111, 0.95);
          border-radius: 0 0 0.75rem 0.75rem;
          flex-shrink: 0;
          padding: 1.5rem;
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