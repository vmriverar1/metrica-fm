'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  ArrowRight,
  Briefcase,
  UserCheck,
  Award,
  Building,
  Target,
  Zap,
  Factory,
  DollarSign
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import MissionVision from './MissionVision';

interface CierreTransformProps {
  historiaData?: any;
}

// Mapeo de iconos - sincronizado con EnhancedStatisticsManager
const iconMap = {
  'Briefcase': Briefcase,
  'Users': Users,
  'UserCheck': UserCheck,
  'Award': Award,
  'Building': Building,
  'Target': Target,
  'TrendingUp': TrendingUp,
  'Zap': Zap,
  'Factory': Factory,
  'DollarSign': DollarSign
} as const;

const statsDefault = [
  { icon: Briefcase, end: 200, label: 'Proyectos Exitosos', prefix: '', suffix: '+' },
  { icon: Award, end: 14, label: 'Años de Experiencia', prefix: '', suffix: '' },
  { icon: Users, end: 50, label: 'Profesionales Especializados', prefix: '', suffix: '+' },
  { icon: Target, end: 98, label: 'Satisfacción del Cliente', prefix: '', suffix: '%' },
];

const StatCard = ({ stat, index }: { stat: typeof statsDefault[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current || !numberRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 95%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Animate card entrance
    tl.from(cardRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'power3.out'
    })
    // Animate icon
    .from(iconRef.current, {
      scale: 0,
      rotation: 180,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    // Counter animation
    .to(numberRef.current, {
      textContent: stat.end,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: stat.end % 1 === 0 ? 1 : 0.1 }, // Si es entero snap a 1, si tiene decimales snap a 0.1
      onUpdate: function() {
        if (numberRef.current) {
          // Extraer solo el número del contenido actual (ignorando prefix/suffix)
          const currentText = numberRef.current.textContent || '0';
          const numMatch = currentText.match(/[\d.]+/);
          const currentValue = numMatch ? Number(numMatch[0]) : 0;
          // Si el número objetivo tiene decimales, mostrarlos. Si no, mostrar entero.
          const displayValue = stat.end % 1 === 0
            ? Math.floor(currentValue)
            : currentValue.toFixed(1);
          numberRef.current.textContent = (stat.prefix || '') + displayValue + stat.suffix;
        }
      }
    }, '-=0.4');
    
    // Hover animation for icon
    if (iconRef.current && cardRef.current) {
      const iconElement = iconRef.current.querySelector('svg');
      if (iconElement) {
        const iconHover = gsap.to(iconElement, {
          scale: 1.2,
          duration: 0.3,
          paused: true,
          ease: 'power2.out'
        });
        
        cardRef.current.addEventListener('mouseenter', () => iconHover.play());
        cardRef.current.addEventListener('mouseleave', () => iconHover.reverse());
      }
    }
    
  }, { scope: cardRef });
  
  return (
    <div ref={cardRef} className="text-center p-4 cursor-pointer transition-colors hover:bg-accent/5">
      <div ref={iconRef} className="inline-block">
        <stat.icon className="h-12 w-12 text-accent mx-auto mb-4" />
      </div>
      <p ref={numberRef} className="text-4xl font-alliance-extrabold text-foreground">
        {stat.prefix}0{stat.suffix}
      </p>
      <p className="text-foreground/70 mt-2 font-alliance-medium">{stat.label}</p>
    </div>
  );
};

export default function CierreTransform({ historiaData }: CierreTransformProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Usar datos del JSON si están disponibles
  const achievementSummary = historiaData?.achievement_summary;
  const stats = achievementSummary?.metrics
    ? achievementSummary.metrics.map((metric: any) => {
        // Leer el icono desde los datos o usar Award por defecto
        const iconKey = (metric.icon || 'Award') as keyof typeof iconMap;
        const IconComponent = iconMap[iconKey] || Award;

        // Usar campos separados si están disponibles (nuevo formato)
        const hasNewFormat = metric.prefix !== undefined || metric.suffix !== undefined || metric.value !== undefined;

        let num: number;
        let prefix: string;
        let suffix: string;

        if (hasNewFormat) {
          // Nuevo formato con campos separados
          num = typeof metric.value === 'number' ? metric.value : parseFloat(metric.value) || 0;
          prefix = metric.prefix || '';
          suffix = metric.suffix || '';
        } else {
          // Formato antiguo - parsear del campo number
          const numMatch = metric.number.match(/[\d.]+/);
          num = numMatch ? parseFloat(numMatch[0]) : 0;

          // Extraer prefijo (caracteres no numéricos al inicio)
          const prefixMatch = metric.number.match(/^[^\d.]+/);
          prefix = prefixMatch ? prefixMatch[0] : '';

          // Extraer sufijo (caracteres no numéricos al final)
          const suffixMatch = metric.number.match(/[^\d.]+$/);
          suffix = suffixMatch ? suffixMatch[0] : '';
        }

        return {
          icon: IconComponent,
          end: num,
          label: metric.label,
          prefix: prefix,
          suffix: suffix,
          description: metric.description
        };
      })
    : statsDefault;
  
  useGSAP(() => {
    if (!sectionRef.current) return;
    
    // Animación de entrada para el título
    gsap.from('.section-title', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
  }, { scope: sectionRef });
  
  return (
    <>
      {/* Sección de Misión y Visión */}
      <MissionVision />

      {/* Sección de Estadísticas */}
      <section ref={sectionRef} id="cierre-transform-section" className="relative py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-4xl md:text-5xl font-alliance-extrabold text-center text-primary mb-16">
            {achievementSummary?.title || 'Nuestra Trayectoria'}
          </h2>
          
          <div className="w-[80vw] md:w-[65vw] mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/10 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} stat={stat} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      {historiaData?.call_to_action && (
        <section className="relative bg-background py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-alliance-extrabold text-primary mb-8">
              {historiaData.call_to_action.title}
            </h3>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {historiaData.call_to_action.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href={historiaData.call_to_action.primary_button.href}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-alliance-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                <span>{historiaData.call_to_action.primary_button.text}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link 
                href={historiaData.call_to_action.secondary_button.href}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full font-alliance-medium hover:bg-accent/90 transition-all duration-300 hover:scale-105"
              >
                <span>{historiaData.call_to_action.secondary_button.text}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}