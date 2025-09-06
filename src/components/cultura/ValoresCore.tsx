'use client';

import React, { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Shield, Zap, Users, Globe, Award, Rocket } from 'lucide-react';

const valoresData = [
  {
    id: 'excelencia',
    icon: Award,
    title: 'Excelencia',
    description: 'Buscamos la perfección en cada proyecto que emprendemos',
    color: '#003f6f',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'innovacion',
    icon: Rocket,
    title: 'Innovación',
    description: 'Aplicamos las últimas tecnologías y metodologías',
    color: '#e84e0f',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'integridad',
    icon: Shield,
    title: 'Integridad',
    description: 'Actuamos con transparencia y ética en todas nuestras relaciones',
    color: '#003f6f',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'colaboracion',
    icon: Users,
    title: 'Colaboración',
    description: 'Fomentamos el trabajo en equipo y la sinergia',
    color: '#e84e0f',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'sostenibilidad',
    icon: Globe,
    title: 'Sostenibilidad',
    description: 'Comprometidos con el desarrollo responsable y el medio ambiente',
    color: '#003f6f',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'agilidad',
    icon: Zap,
    title: 'Agilidad',
    description: 'Adaptamos rápidamente a los cambios y desafíos del mercado',
    color: '#e84e0f',
    bgColor: 'bg-orange-50'
  }
];

export default function ValoresCore() {
  const sectionRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !circleRef.current) return;

    // Animación del título principal
    gsap.fromTo('.valores-title',
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animación del círculo central
    gsap.fromTo(circleRef.current,
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.valores-container',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animación de los valores con efecto orbital
    gsap.fromTo('.valor-item',
      { 
        scale: 0,
        opacity: 0,
        x: (i) => Math.cos((i * 360 / 6) * Math.PI / 180) * 200,
        y: (i) => Math.sin((i * 360 / 6) * Math.PI / 180) * 200
      },
      {
        scale: 1,
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1.5,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.valores-container',
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Rotación continua sutil del círculo central
    gsap.to(circleRef.current, {
      rotation: 360,
      duration: 60,
      ease: 'none',
      repeat: -1
    });

    // Hover animations para cada valor
    gsap.utils.toArray('.valor-item').forEach((item: any) => {
      const hoverTl = gsap.timeline({ paused: true });
      
      hoverTl.to(item, {
        scale: 1.1,
        y: -10,
        duration: 0.3,
        ease: 'power2.out'
      });

      item.addEventListener('mouseenter', () => hoverTl.play());
      item.addEventListener('mouseleave', () => hoverTl.reverse());
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-accent/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-primary/20 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="valores-title text-5xl md:text-6xl font-alliance-extrabold text-primary mb-6">
            Nuestros Valores
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-alliance-medium">
            Los principios fundamentales que guían cada decisión y acción en Métrica FM
          </p>
        </div>

        <div className="valores-container relative max-w-5xl mx-auto">
          {/* Círculo central */}
          <div 
            ref={circleRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl z-10"
          >
            <div className="text-center text-white">
              <div className="text-4xl font-alliance-extrabold mb-2">DIP</div>
              <div className="text-sm font-alliance-medium opacity-90">Valores Core</div>
            </div>
          </div>

          {/* Grid de valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24">
            {valoresData.map((valor, index) => (
              <div 
                key={valor.id}
                className={`valor-item ${valor.bgColor} rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm group`}
                style={{ 
                  gridColumn: index >= 3 ? `${(index - 3) + 1} / ${(index - 3) + 2}` : `${index + 1} / ${index + 2}`,
                  marginTop: index >= 3 ? '4rem' : '0'
                }}
              >
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: valor.color }}
                >
                  <valor.icon className="w-10 h-10 text-white" />
                </div>
                
                <h3 
                  className="text-2xl font-alliance-extrabold mb-4 group-hover:scale-105 transition-transform duration-300"
                  style={{ color: valor.color }}
                >
                  {valor.title}
                </h3>
                
                <p className="text-muted-foreground font-alliance-medium leading-relaxed">
                  {valor.description}
                </p>

                {/* Línea decorativa */}
                <div 
                  className="w-16 h-1 mx-auto mt-6 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: valor.color }}
                />
              </div>
            ))}
          </div>

          {/* Líneas conectoras decorativas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 1 }}>
            {valoresData.map((_, index) => (
              <line
                key={index}
                x1="50%"
                y1="50%"
                x2={`${30 + (index % 3) * 20}%`}
                y2={`${index < 3 ? '20%' : '80%'}`}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="text-primary/30"
              />
            ))}
          </svg>
        </div>
      </div>

      <style jsx>{`
        .valor-item {
          position: relative;
          backdrop-filter: blur(10px);
        }

        .valor-item::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, #003f6f, #e84e0f);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .valor-item:hover::before {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .valores-container .grid {
            grid-template-columns: 1fr;
          }
          
          .valor-item {
            grid-column: 1 / 2 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}