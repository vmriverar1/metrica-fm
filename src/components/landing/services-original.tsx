'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

const ServiceCard = ({ service }: { service: (typeof secondaryServices)[0] & { isMain?: boolean, className?: string } }) => {
  return (
    <Card className={cn(
      'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl',
      service.isMain ? service.className : 'bg-card'
    )}>
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className={cn(
          'font-headline text-2xl font-bold mb-2 line-clamp-3',
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
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground group-hover:scale-110 transition-transform">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
      <div className="relative h-48 w-full">
        <Image
          src={service.imageUrl}
          alt={service.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </Card>
  );
};

const MainServiceCard = ({ service }: { service: typeof mainService }) => {
    return (
      <Card className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl',
        service.className
      )}>
        <CardContent className="p-6 flex flex-col flex-grow">
          <h3 className="font-headline text-3xl font-bold mb-4 text-white">
            {service.title}
          </h3>
          <p className="mb-6 flex-grow text-white/80">
            {service.description}
          </p>
          <div className="flex justify-start mt-auto">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-accent-foreground group-hover:scale-110 transition-transform">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div className="relative h-64 w-full">
          <Image
            src={service.imageUrl}
            alt={service.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Card>
    );
  };

export default function Services() {
  return (
    <section id="services" className="py-24 bg-background/95">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Nuestros Servicios</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
            Ofrecemos un portafolio de servicios especializados para asegurar el éxito de proyectos de infraestructura complejos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainServiceCard service={mainService} />
          </div>
          {secondaryServices.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
