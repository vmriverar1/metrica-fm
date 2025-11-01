'use client';

import React, { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Eye, Target, Heart, Lightbulb } from 'lucide-react';

const visionMisionData = [
  {
    id: 'vision',
    icon: Eye,
    title: 'Visión',
    content: 'Ser la empresa líder en dirección integral de proyectos en el Perú, reconocida por nuestra excelencia técnica, innovación y compromiso con el desarrollo sostenible del país.',
    color: 'from-blue-600 to-blue-800',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
  },
  {
    id: 'mision',
    icon: Target,
    title: 'Misión',
    content: 'Transformar ideas en realidades construidas, brindando servicios integrales de gestión de proyectos que superen las expectativas de nuestros clientes y contribuyan al progreso del Perú.',
    color: 'from-cyan-600 to-cyan-800',
    image: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800&h=600&fit=crop'
  },
  {
    id: 'proposito',
    icon: Heart,
    title: 'Propósito',
    content: 'Construir el futuro del Perú a través de proyectos que mejoren la calidad de vida de las personas y fortalezcan la infraestructura nacional.',
    color: 'from-red-600 to-red-800',
    image: 'https://images.unsplash.com/photo-1529220502050-f15e570c634e?w=800&h=600&fit=crop'
  },
  {
    id: 'innovacion',
    icon: Lightbulb,
    title: 'Innovación',
    content: 'Aplicamos las últimas tecnologías y metodologías para estar siempre a la vanguardia en la gestión de proyectos de infraestructura.',
    color: 'from-green-600 to-green-800',
    image: 'https://images.unsplash.com/photo-1558618828-fbd25c85cd64?w=800&h=600&fit=crop'
  }
];

export default function VisionMision() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Animación de entrada para el título
    gsap.fromTo('.section-title', 
      { y: 100, opacity: 0 },
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

    // Animación escalonada para las cards
    gsap.fromTo('.vision-card',
      { 
        y: 150, 
        opacity: 0,
        rotateX: 45
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.vision-cards-container',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Parallax para las imágenes de fondo
    gsap.utils.toArray('.card-image').forEach((img: any) => {
      gsap.to(img, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.vision-card'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4">
        <h2 className="section-title text-5xl md:text-6xl font-alliance-extrabold text-center text-primary mb-20">
          Nuestra Esencia
        </h2>

        <div className="vision-cards-container grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {visionMisionData.map((item, index) => (
            <div 
              key={item.id}
              className="vision-card group relative overflow-hidden rounded-2xl h-80 md:h-96"
            >
              {/* Imagen de fondo con parallax */}
              <div 
                className="card-image absolute inset-0 bg-cover bg-center transform scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              
              {/* Overlay con gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-85 group-hover:opacity-75 transition-opacity duration-500`} />
              
              {/* Contenido */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-alliance-extrabold group-hover:scale-105 transition-transform duration-300">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-lg font-alliance-medium leading-relaxed opacity-95 group-hover:opacity-100 transition-opacity duration-300">
                  {item.content}
                </p>
              </div>

              {/* Efectos hover */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .vision-card {
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .vision-card:hover {
          transform: translateY(-10px) rotateX(5deg);
          box-shadow: 
            0 25px 50px rgba(0, 63, 111, 0.25),
            0 12px 24px rgba(0, 63, 111, 0.15);
        }

        .vision-card:nth-child(even) {
          animation-delay: 0.2s;
        }

        @media (max-width: 768px) {
          .vision-card {
            height: 20rem;
          }
        }
      `}</style>
    </section>
  );
}