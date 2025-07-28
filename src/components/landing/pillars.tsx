'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Users, Search, BarChart, Shield, UserCheck } from 'lucide-react';
import ParallaxWrapper from '@/components/parallax-wrapper';

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

const PillarCard = ({ pillar, index }: { pillar: (typeof pillars)[0], index: number }) => {
  return (
    <Card
      className="pillar-card group relative h-full bg-card/80 backdrop-blur-sm border-primary/20 hover:border-accent transition-all duration-500 hover:shadow-[0_20px_50px_rgba(232,78,15,0.3)] hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animation: 'fadeInUp 0.8s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative">
        <CardHeader className="flex flex-col items-center text-center gap-4 pb-4">
          <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <pillar.icon className="h-12 w-12 text-accent transition-all duration-500 group-hover:text-white group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_rgba(232,78,15,0.5)]" />
          </div>
          <CardTitle className="text-xl text-foreground transition-colors duration-300 group-hover:text-white">{pillar.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-foreground/80 transition-colors duration-300 group-hover:text-white/90">{pillar.description}</p>
        </CardContent>
      </div>
    </Card>
  );
};

export default function Pillars() {
  return (
    <section id="pillars" className="py-24 bg-background overflow-hidden">
      {/* Background sutil con parallax */}
      <ParallaxWrapper speed={0.2} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
      </ParallaxWrapper>
      
      <div className="container mx-auto px-4 relative z-10">
        <ParallaxWrapper speed={0.05} className="text-center mb-16">
          <h2 className="title-section text-4xl md:text-5xl mb-4">¿Qué es DIP?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70 font-alliance-medium">
            Nuestra Dirección Integral de Proyectos (DIP) se fundamenta en seis pilares clave para garantizar la excelencia.
          </p>
        </ParallaxWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pillars.map((pillar, index) => (
            <PillarCard key={index} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}