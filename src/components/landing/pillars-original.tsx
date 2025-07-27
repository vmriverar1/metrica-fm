'use client';

import React, { useRef, MouseEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Users, Search, BarChart, Shield, UserCheck } from 'lucide-react';

const pillars = [
  {
    icon: Target,
    title: 'Planificación Estratégica',
    description: 'Definimos la hoja de ruta para el éxito del proyecto, optimizando plazos y recursos desde el inicio.',
  },
  {
    icon: Users,
    title: 'Coordinación Multidisciplinaria',
    description: 'Integramos equipos de diseño, construcción y fiscalización para una ejecución sin fisuras.',
  },
  {
    icon: Search,
    title: 'Supervisión Técnica',
    description: 'Garantizamos que cada etapa de la construcción cumpla con los más altos estándares de ingeniería.',
  },
  {
    icon: BarChart,
    title: 'Control de Calidad y Costos',
    description: 'Implementamos un riguroso control para asegurar la calidad de los materiales y la eficiencia del presupuesto.',
  },
  {
    icon: Shield,
    title: 'Gestión de Riesgos',
    description: 'Identificamos y mitigamos proactivamente los posibles riesgos que puedan afectar al proyecto.',
  },
  {
    icon: UserCheck,
    title: 'Representación del Cliente',
    description: 'Actuamos como sus ojos y oídos en el campo, defendiendo sus intereses en cada decisión.',
  },
];

const PillarCard = ({ pillar }: { pillar: (typeof pillars)[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-[320px] shrink-0 transform-gpu transition-transform duration-300 ease-out bg-card/80 backdrop-blur-sm border-primary/20 hover:border-accent"
    >
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="relative">
        <CardHeader className="flex flex-row items-center gap-4">
          <pillar.icon className="h-10 w-10 text-accent transition-colors duration-300 group-hover:text-white" />
          <CardTitle className="font-headline text-xl text-foreground transition-colors duration-300 group-hover:text-white">{pillar.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 transition-colors duration-300 group-hover:text-white/90">{pillar.description}</p>
        </CardContent>
      </div>
    </Card>
  );
};

export default function Pillars() {
  return (
    <section id="pillars" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">¿Qué es DIP?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
            Nuestra Dirección Integral de Proyectos (DIP) se fundamenta en seis pilares clave para garantizar la excelencia.
          </p>
        </div>
        <div className="flex gap-8 pb-8 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           <style>{`
            .flex.overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {pillars.map((pillar, index) => (
            <PillarCard key={index} pillar={pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}
