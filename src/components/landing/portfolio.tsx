'use client';

import React from 'react';
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
  return (
    <section id="portfolio" className="relative w-full py-24 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl md:text-5xl font-bold">Proyectos Destacados</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                    Conoce el impacto de nuestro trabajo a través de algunos de los proyectos que hemos dirigido.
                </p>
            </div>
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
                            <div className="h-[60vh] w-full relative rounded-lg overflow-hidden flex items-center justify-center group">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="z-0 transition-all duration-500 group-hover:saturate-150 group-hover:scale-105 filter grayscale-0 saturate-100 brightness-50"
                                />
                                <div className="absolute inset-0 bg-black/50"></div>
                                <div className="relative z-10 text-white text-center p-8 max-w-4xl mx-auto">
                                    <Badge variant="secondary" className="mb-4 bg-accent/80 text-accent-foreground border-transparent">{project.type}</Badge>
                                    <h3 className="font-headline text-4xl md:text-6xl font-bold mb-4">{project.name}</h3>
                                    <p className="text-lg md:text-xl text-white/80 mb-8">{project.description}</p>
                                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                                        Ver más detalles
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-white/20 hover:bg-white/40 border-none" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-white/20 hover:bg-white/40 border-none" />
            </Carousel>
        </div>
    </section>
  );
}
