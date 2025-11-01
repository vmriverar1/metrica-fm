'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Shield, Award, Leaf, Heart, Scale, AlertCircle, Lightbulb, Lock, ChevronLeft, ChevronRight, FileText, ArrowRight } from 'lucide-react';
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

// Componente FlipCard con estado controlado
function FlipCard({ policy, slug }: { policy: any, slug: string }) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    console.log('Mouse Enter - Current isFlipped:', isFlipped);
    // Clear any pending timeout
    if (timeoutRef.current) {
      console.log('Clearing pending timeout');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    console.log('Setting isFlipped to true');
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    console.log('Mouse Leave - Current isFlipped:', isFlipped);
    // Clear any existing timeout
    if (timeoutRef.current) {
      console.log('Clearing existing timeout before setting new one');
      clearTimeout(timeoutRef.current);
    }
    console.log('Setting timeout to flip back');
    timeoutRef.current = setTimeout(() => {
      console.log('Timeout executed - Setting isFlipped to false');
      setIsFlipped(false);
      timeoutRef.current = null;
    }, 200);
  };

  // Log when isFlipped changes
  useEffect(() => {
    console.log('isFlipped state changed to:', isFlipped);
  }, [isFlipped]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    // Si la política tiene PDF, abrirlo en nueva pestaña
    if (policy.pdf) {
      console.log('Card clicked - opening PDF:', policy.pdf);
      window.open(policy.pdf, '_blank', 'noopener,noreferrer');
    } else {
      // Si no tiene PDF, navegar a la página de política
      console.log('Card clicked - navigating to:', `/politicas/${slug}`);
      router.push(`/politicas/${slug}`);
    }
  };

  return (
    <div
      className="flip-card h-full cursor-pointer relative"
      ref={cardRef}
    >
      {/* Capa invisible para capturar eventos - siempre encima */}
      <div
        className="absolute inset-0 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Contenido visual - sin eventos */}
      <div
        className={`flip-card-inner relative h-full ${isFlipped ? 'flipped' : ''}`}
        style={{ pointerEvents: 'none' }}
      >
        {/* Lado frontal */}
        <div className="flip-card-front card group absolute w-full h-full bg-accent/90 backdrop-blur-sm overflow-hidden transition-all duration-500">
          {/* Imagen */}
          <div className="media-container relative aspect-[8/5] overflow-hidden">
            {policy.image && policy.image.trim() !== '' ? (
              <Image
                src={policy.image}
                alt={policy.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
          </div>

          {/* Contenido */}
          <div className="card-text">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="p-1.5 rounded-full bg-white/20"
              >
                <policy.icon
                  className="h-5 w-5 text-white"
                />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-alliance-extrabold text-white">
                {policy.title}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-white/90 font-alliance-medium line-clamp-4 md:line-clamp-3 leading-tight">
              {policy.description}
            </p>
          </div>
        </div>

        {/* Lado trasero */}
        <div className="flip-card-back card absolute w-full h-full bg-gradient-to-br from-cyan-500 to-cyan-600 overflow-hidden">
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-6">
              <div className="p-4 rounded-full bg-white/20 inline-block mb-4">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-alliance-extrabold text-white mb-3">
                {policy.title}
              </h3>
              <p className="text-sm md:text-base text-white/90 mb-6">
                {policy.pdf ? 'Haz clic para ver el documento PDF' : 'Conoce más sobre nuestra política'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 font-alliance-medium rounded-full transition-all duration-300">
              {policy.pdf ? 'Abrir PDF' : 'Ver Documento'}
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Patrón decorativo */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PoliciesCarousel({ data }: PoliciesCarouselProps) {
  const policiesData = data.policies.map(policy => ({
    ...policy,
    icon: iconMap[policy.icon as keyof typeof iconMap] || Award,
    image: policy.image || policy.image_fallback,
    color: '#00A8E8'
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
            {policiesData.map((policy, index) => {
              // Generar slug a partir del título
              const slug = policy.title.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                .replace(/[^a-z0-9]+/g, '-')     // Reemplazar espacios y caracteres especiales con guiones
                .replace(/^-+|-+$/g, '');        // Remover guiones al inicio y final

              return (
                <SwiperSlide key={policy.id} className="h-auto">
                  <FlipCard policy={policy} slug={slug} />
                </SwiperSlide>
              );
            })}
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

        /* Efecto flip 3D */
        .flip-card {
          width: 100%;
          height: 100%;
          perspective: 2000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
          transform-origin: center center;
        }

        .flip-card-inner.flipped {
          transform: rotateY(-180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .flip-card-front {
          z-index: 2;
          transform: rotateY(0deg);
        }

        .flip-card-back {
          transform: rotateY(180deg);
          z-index: 1;
        }

        .policies-swiper .card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .flip-card-inner.flipped .card {
          border-color: rgba(0, 168, 232, 0.5);
          box-shadow: 0 20px 50px rgba(0, 168, 232, 0.3);
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

        /* Desactivar flip en móviles si es necesario */
        @media (hover: none) and (pointer: coarse) {
          .flip-card-inner {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}