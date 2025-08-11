'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Imágenes del equipo - selección más reducida y controlada
const teamMembers = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face'
];

export default function TeamTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
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
        <div className="relative h-96 overflow-hidden rounded-2xl">
          <div ref={timelineRef} className="flex items-center h-full space-x-8">
            {teamMembers.map((imageSrc, index) => (
              <motion.div
                key={index}
                className="team-portrait flex-shrink-0 w-64 h-80 relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl relative">
                  <img
                    src={imageSrc}
                    alt={`Miembro del equipo ${index + 1}`}
                    className="w-full h-full object-cover filter grayscale-60 brightness-90 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-500"
                    loading="lazy"
                  />
                  
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                  
                  {/* Efecto de brillo en hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, transparent 20%, #E84E0F40 35%, #003F6F40 65%, transparent 80%)`
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Efectos de desvanecimiento en los bordes con colores de marca */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-900 via-[#003F6F]/10 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-900 via-[#E84E0F]/10 to-transparent pointer-events-none z-10" />
        </div>

        {/* Indicador visual con colores de marca */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">
            Hover para ver en color
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

      </div>
    </section>
  );
}