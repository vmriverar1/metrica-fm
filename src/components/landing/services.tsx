'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useSectionAnimation } from '@/hooks/use-gsap-animations';
import ParallaxWrapper from '@/components/parallax-wrapper';
import CanvasParticles from '@/components/canvas-particles';
import TiltCard from '@/components/tilt-card';
import NavigationLink from '@/components/ui/NavigationLink';
import { HomePageData } from '@/types/home';


interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    image_url?: string;
    icon_url?: string;
    imageUrl?: string;
    iconUrl?: string;
    isMain?: boolean;
    className?: string;
    width?: '1/3' | '2/3' | '3/3';
    cta?: {
      text: string;
      url: string;
    };
  };
  index: number;
  hideCTA?: boolean;
}

const ServiceCard = ({ service, index, hideCTA = false }: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useGSAP(() => {
    if (!cardRef.current || !imageRef.current || !contentRef.current || !arrowRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Card entrance animation - faster and more responsive
    tl.from(cardRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.6,
      delay: service.isMain ? 0 : index * 0.1,
      ease: 'power3.out'
    })
    // Image animation
    .from(imageRef.current, {
      scale: 1.2,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.5')
    // Content animation
    .from(contentRef.current?.children || [], {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.4');
    
    // Hover animations
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl
      .to(imageRef.current, {
        scale: 1.1,
        duration: 0.5,
        ease: 'power2.out'
      })
      .to(arrowRef.current, {
        x: 5,
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      }, 0)
      .to(cardRef.current, {
        y: -5,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        duration: 0.3,
        ease: 'power2.out'
      }, 0);
    
    const handleMouseEnter = () => hoverTl.play();
    const handleMouseLeave = () => hoverTl.reverse();
    
    cardRef.current.addEventListener('mouseenter', handleMouseEnter);
    cardRef.current.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', handleMouseEnter);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
    
  }, { scope: cardRef, dependencies: [service, index] });
  
  const cardContent = (
    <TiltCard
      className="h-full"
      maxTilt={10}
      scale={1.02}
    >
          <Card 
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm h-full liquid-distortion cursor-pointer',
              service.isMain ? service.className : 'bg-card'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
          {/* Canvas particles overlay */}
          <CanvasParticles
            isActive={isHovered}
            particleCount={30}
            color={service.isMain ? '#ffffff' : '#00A8E8'}
            className="z-10"
          />
          <CardContent ref={contentRef} className="p-6 flex flex-col flex-grow relative z-20">
            <div className="flex items-start gap-3 mb-2">
              {(service.iconUrl || service.icon_url) && (
                <Image 
                  src={service.iconUrl || service.icon_url}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain flex-shrink-0 mt-1"
                />
              )}
              <h3 className={cn(
                'text-2xl font-bold line-clamp-3',
                 service.isMain ? 'text-white' : 'text-foreground'
              )}>
                {service.title}
              </h3>
            </div>
            <p className={cn(
              'mb-4 flex-grow',
               service.isMain ? 'text-white/80' : 'text-foreground/70'
            )}>
              {service.description}
            </p>
            {!hideCTA && (
              <div className="flex justify-end mt-auto">
                <div ref={arrowRef} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            )}
          </CardContent>
          <div ref={imageRef} className="relative h-48 w-full overflow-hidden">
            {(service.imageUrl || service.image_url) ? (
              <Image
                src={service.imageUrl || service.image_url || '/images/proyectos/placeholder.jpg'}
                alt={service.title}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <ArrowRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </TiltCard>
  );

  return (
    <div ref={cardRef} className="h-full">
      {!hideCTA && service.cta?.url ? (
        <NavigationLink href={service.cta.url} loadingMessage="Navegando a Servicios...">
          {cardContent}
        </NavigationLink>
      ) : (
        cardContent
      )}
    </div>
  );
};

interface MainServiceCardProps {
  service: {
    id?: string;
    title: string;
    description: string;
    image_url?: string;
    icon_url?: string;
    is_main?: boolean;
    width?: '1/3' | '2/3' | '3/3';
    cta?: {
      text: string;
      url: string;
    };
    imageUrl?: string;
    iconUrl?: string;
    className?: string;
  };
  hideCTA?: boolean;
}

const MainServiceCard = ({ service, hideCTA = false }: MainServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current || !imageRef.current || !contentRef.current || !arrowRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Main card special entrance - faster
    tl.from(cardRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out'
    })
    .from(imageRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')
    .from(contentRef.current?.children || [], {
      x: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.5');
    
    // Special hover for main card
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl
      .to(cardRef.current, {
        scale: 1.02,
        boxShadow: '0 30px 60px rgba(231, 78, 15, 0.3)',
        duration: 0.4,
        ease: 'power2.out'
      })
      .to(arrowRef.current, {
        rotation: 45,
        scale: 1.3,
        duration: 0.3,
        ease: 'power2.out'
      }, 0);
    
    const handleMouseEnter = () => hoverTl.play();
    const handleMouseLeave = () => hoverTl.reverse();
    
    cardRef.current.addEventListener('mouseenter', handleMouseEnter);
    cardRef.current.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', handleMouseEnter);
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
    
  }, { scope: cardRef, dependencies: [service] });

  const cardContent = (
    <Card className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm h-full cursor-pointer',
          service.className
        )}>
        <CardContent ref={contentRef} className="p-6 flex flex-col flex-grow">
          <h3 className="title-section text-3xl mb-4 text-white">
            {service.title}
          </h3>
          <p className="mb-6 flex-grow text-white/80 font-alliance-medium">
            {service.description}
          </p>
          {!hideCTA && (
            <div className="flex justify-start mt-auto">
              <div ref={arrowRef} className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-accent-foreground">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          )}
        </CardContent>
        <div ref={imageRef} className="relative h-64 w-full overflow-hidden">
          {(service.imageUrl || service.image_url) ? (
            <Image
              src={service.imageUrl || service.image_url || ''}
              alt={service.title}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <ArrowRight className="h-12 w-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/60">Sin imagen</p>
              </div>
            </div>
          )}
        </div>
      </Card>
  );

  return (
    <div ref={cardRef} className="h-full">
      {!hideCTA && service.cta?.url ? (
        <NavigationLink href={service.cta.url} loadingMessage="Navegando a Servicios...">
          {cardContent}
        </NavigationLink>
      ) : (
        cardContent
      )}
    </div>
  );
};

interface ServicesProps {
  data: HomePageData['services'];
  hideCTA?: boolean;
}

export default function Services({ data, hideCTA = false }: ServicesProps) {
  const sectionRef = useSectionAnimation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  useGSAP(() => {
    // Verificar que los elementos existan antes de animar
    if (!titleRef.current || !subtitleRef.current) return;
    
    // Animate section title
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
    
    tl.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    .from(subtitleRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');
    
  }, { scope: sectionRef, dependencies: [data] });

  // Determinar si hay estructura de servicio principal o usar services_list
  const hasExpectedStructure = data.main_service && data.secondary_services;
  const hasMainService = data.main_service?.is_main &&
    (data.main_service?.title || data.main_service?.description || data.main_service?.image_url);

  // Combinar todos los servicios para renderizado dinámico
  const allServices = hasExpectedStructure ? [
    ...(hasMainService ? [{ ...data.main_service, isMain: true }] : []),
    ...(data.secondary_services || []).map(service => ({ ...service, isMain: false }))
  ] : (data.services_list || []).map(service => ({ ...service, isMain: false }));
  
  return (
    <section ref={sectionRef} id="services" className="py-24 bg-white overflow-hidden relative">
      {/* Background con efecto parallax */}
      <ParallaxWrapper speed={0.3} className="inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      </ParallaxWrapper>
      
      <div className="container mx-auto px-4 relative z-10">
        <ParallaxWrapper speed={0.1} className="text-center mb-12">
          <h2 ref={titleRef} className="title-section text-4xl md:text-5xl">
            {data.section.title}
          </h2>
          <p ref={subtitleRef} className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70 font-alliance-medium">
            {data.section.subtitle}
          </p>
        </ParallaxWrapper>

        {/* Grid dinámico con centrado automático */}
        <div className="flex flex-wrap justify-center gap-8">
          {allServices.map((service, index) => {
            // Determinar el ancho según la cantidad de servicios y el width configurado
            const servicesCount = allServices.length;
            const serviceWidth = service.width;

            // Clases de ancho responsivas - 2 columnas en pantallas grandes
            let widthClass = 'w-full sm:w-[calc(50%-1rem)]'; // Por defecto 1/2

            if (serviceWidth === '2/2') {
              widthClass = 'w-full';
            } else if (servicesCount === 1) {
              widthClass = 'w-full max-w-2xl';
            }

            return (
              <div
                key={service.id}
                className={widthClass}
              >
                {service.isMain ? (
                  <MainServiceCard
                    service={{
                      ...service,
                      className: 'bg-primary text-primary-foreground',
                      imageUrl: service.image_url
                    }}
                    hideCTA={hideCTA}
                  />
                ) : (
                  <ServiceCard
                    service={{
                      ...service,
                      imageUrl: service.image_url
                    }}
                    index={index}
                    hideCTA={hideCTA}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Placeholder cuando no hay servicios configurados */}
        {allServices.length === 0 && (
          <div className="mb-8 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600">No hay servicios configurados</p>
              <p className="text-sm text-gray-400">Configure los servicios desde el administrador</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}