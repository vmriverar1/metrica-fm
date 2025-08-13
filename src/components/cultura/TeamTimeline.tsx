'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Datos del equipo con información profesional
const teamMembers = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    role: 'Director Ejecutivo',
    description: 'Ingeniero Civil con 20+ años liderando proyectos de infraestructura. Master en Project Management, especialista en metodologías PMI.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'Ana Torres',
    role: 'Gerente de Operaciones',
    description: 'Arquitecta especializada en sostenibilidad y certificaciones LEED. Experta en BIM y tecnologías de construcción 4.0.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'Miguel Rodríguez',
    role: 'Supervisor Técnico Senior',
    description: 'Ingeniero con certificación ISO 9001, especialista en control de calidad y gestión de riesgos en construcción.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 4,
    name: 'Sofía Herrera',
    role: 'Project Manager',
    description: 'PMP certificada con experiencia en gestión integral de proyectos residenciales y comerciales de gran escala.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 5,
    name: 'Roberto Silva',
    role: 'Consultor Estratégico',
    description: 'MBA especializado en desarrollo inmobiliario, experto en análisis de factibilidad y optimización de ROI.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 6,
    name: 'Patricia Vega',
    role: 'Directora de Calidad',
    description: 'Ingeniera Industrial con especialización en sistemas de gestión de calidad y procesos de mejora continua.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 7,
    name: 'Diego Morales',
    role: 'BIM Manager',
    description: 'Especialista en modelado 5D y tecnologías VR/AR aplicadas a la construcción. Certificado Autodesk Expert.',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=800&fit=crop&crop=face'
  },
  {
    id: 8,
    name: 'Carmen López',
    role: 'Coordinadora de Proyectos',
    description: 'Arquitecta con experiencia en coordinación multidisciplinaria y gestión de stakeholders en proyectos complejos.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face'
  }
];

export default function TeamTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  useGSAP(() => {
    if (!containerRef.current || !timelineRef.current) return;

    // Animación horizontal controlada y suave
    const timeline = timelineRef.current;
    const totalWidth = timeline.scrollWidth;
    
    // Scroll horizontal suave
    gsap.to(timeline, {
      x: -(totalWidth - window.innerWidth),
      duration: 20,
      ease: "none",
      repeat: -1,
      yoyo: true
    });

    // Animación de entrada de las imágenes
    gsap.fromTo('.team-portrait', 
      { 
        opacity: 0, 
        scale: 0.8,
        filter: 'grayscale(100%) brightness(0.7)'
      },
      { 
        opacity: 1, 
        scale: 1,
        filter: 'grayscale(60%) brightness(0.9)',
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-[#003F6F] via-[#002A4D] to-[#001A33] overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E0F] to-[#003F6F]">
              Nuestro Equipo
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Los rostros detrás de cada proyecto exitoso
          </p>
        </motion.div>

        {/* Timeline horizontal */}
        <div className="relative h-96 overflow-hidden rounded-2xl mb-16">
          <div ref={timelineRef} className="flex items-center h-full space-x-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className="team-portrait flex-shrink-0 w-64 h-80 relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover filter grayscale-60 brightness-90 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-500"
                    loading="lazy"
                  />
                  
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Información básica siempre visible */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-200">{member.role}</p>
                  </div>
                  
                  {/* Descripción expandida en hover */}
                  <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm p-4 flex flex-col justify-center transition-all duration-300 ${
                    hoveredMember === member.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}>
                    <div className="text-center text-white">
                      <h3 className="text-xl font-bold mb-2 text-[#E84E0F]">{member.name}</h3>
                      <p className="text-sm font-medium mb-3 text-[#003F6F]">{member.role}</p>
                      <p className="text-xs leading-relaxed text-gray-200">{member.description}</p>
                    </div>
                  </div>
                  
                  {/* Efecto de brillo en hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(45deg, transparent 20%, #E84E0F40 35%, #003F6F40 65%, transparent 80%)`
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Efectos de desvanecimiento en los bordes con colores de marca */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#003F6F] via-[#002A4D]/10 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#003F6F] via-[#E84E0F]/10 to-transparent pointer-events-none z-10" />
        </div>

        {/* Subtítulo para continuidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E0F] to-[#003F6F]">
              Momentos que Nos Definen
            </span>
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Una galería visual que captura la esencia de nuestra cultura empresarial
          </p>
          
          {/* Indicador visual con colores de marca */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center"
          >
            <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">
              Hover para conocer al equipo
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#E84E0F]"></div>
                <span className="text-xs text-gray-500">Excelencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#003F6F]"></div>
                <span className="text-xs text-gray-500">Profesionalismo</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}