'use client';

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useSectionAnimation } from '@/hooks/use-gsap-animations';
import ParallaxWrapper from '@/components/parallax-wrapper';

const mainService = {
  title: 'Dirección Integral de Proyectos (DIP)',
  description: 'Lideramos tu proyecto desde la concepción hasta la entrega, asegurando el cumplimiento de objetivos en tiempo, costo y calidad.',
  imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
  className: 'lg:col-span-2 bg-primary text-primary-foreground',
  isMain: true,
};

const secondaryServices = [
  {
    title: 'Gerencia de Proyectos (PMO)',
    description: 'Implementamos y gestionamos oficinas de proyectos para estandarizar procesos y maximizar la eficiencia.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
  },
  {
    title: 'Supervisión de Obras',
    description: 'Vigilancia técnica y administrativa para que la construcción se ejecute según los planos y normativas.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
  },
  {
    title: 'Gestión de Contratos',
    description: 'Administramos los contratos de obra para prevenir conflictos y asegurar el cumplimiento de las obligaciones.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
  },
  {
    title: 'Control de Calidad',
    description: 'Aseguramos que todos los materiales y procesos constructivos cumplan con los más altos estándares.',
    imageUrl: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
  },
];

const ServiceCard = ({ service, index }: { 
  service: (typeof secondaryServices)[0] & { isMain?: boolean, className?: string },
  index: number 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Card entrance animation - increased stagger for better effect
    tl.from(cardRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      delay: service.isMain ? 0 : index * 0.3,
      ease: 'power3.out'
    })
    // Image animation
    .from(imageRef.current, {
      scale: 1.3,
      duration: 1.2,
      ease: 'power2.out'
    }, '-=0.8')
    // Content animation
    .from(contentRef.current?.children || [], {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.6');
    
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
    
    cardRef.current.addEventListener('mouseenter', () => hoverTl.play());
    cardRef.current.addEventListener('mouseleave', () => hoverTl.reverse());
    
  }, { scope: cardRef });
  
  return (
    <div ref={cardRef} className="h-full">
      <Card className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm h-full',
        service.isMain ? service.className : 'bg-card'
      )}>
        <CardContent ref={contentRef} className="p-6 flex flex-col flex-grow">
          <h3 className={cn(
            'text-2xl font-bold mb-2 line-clamp-3',
             service.isMain ? 'text-white' : 'text-foreground'
          )}>
            {service.title}
          </h3>
          <p className={cn(
            'mb-4 flex-grow',
             service.isMain ? 'text-white/80' : 'text-foreground/70'
          )}>
            {service.description}
          </p>
          <div className="flex justify-end mt-auto">
            <div ref={arrowRef} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
        <div ref={imageRef} className="relative h-48 w-full overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Card>
    </div>
  );
};

const MainServiceCard = ({ service }: { service: typeof mainService }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Main card special entrance
    tl.from(cardRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .from(imageRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, '-=1')
    .from(contentRef.current?.children || [], {
      x: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.8');
    
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
    
    cardRef.current.addEventListener('mouseenter', () => hoverTl.play());
    cardRef.current.addEventListener('mouseleave', () => hoverTl.reverse());
    
  }, { scope: cardRef });
  
  return (
    <div ref={cardRef} className="h-full">
      <Card className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm h-full',
        service.className
      )}>
        <CardContent ref={contentRef} className="p-6 flex flex-col flex-grow">
          <h3 className="title-section text-3xl mb-4 text-white">
            {service.title}
          </h3>
          <p className="mb-6 flex-grow text-white/80 font-alliance-medium">
            {service.description}
          </p>
          <div className="flex justify-start mt-auto">
            <div ref={arrowRef} className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-accent-foreground">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div ref={imageRef} className="relative h-64 w-full overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Card>
    </div>
  );
};

export default function Services() {
  const sectionRef = useSectionAnimation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  useGSAP(() => {
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
    
  }, { scope: sectionRef });
  
  return (
    <section ref={sectionRef} id="services" className="py-24 bg-white overflow-hidden relative">
      {/* Background con efecto parallax */}
      <ParallaxWrapper speed={0.3} className="inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      </ParallaxWrapper>
      
      <div className="container mx-auto px-4 relative z-10">
        <ParallaxWrapper speed={0.1} className="text-center mb-12">
          <h2 ref={titleRef} className="title-section text-4xl md:text-5xl">
            Nuestros Servicios
          </h2>
          <p ref={subtitleRef} className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70 font-alliance-medium">
            Ofrecemos un portafolio de servicios especializados para asegurar el éxito de proyectos de infraestructura complejos.
          </p>
        </ParallaxWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainServiceCard service={mainService} />
          </div>
          {secondaryServices.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}