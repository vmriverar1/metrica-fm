'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ZoomIn } from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

interface TeamAndMomentsProps {
  teamSection?: {
    title: string;
    subtitle: string;
  };
  members?: Array<{
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    image_fallback: string;
  }>;
  moments?: {
    title: string;
    subtitle: string;
    gallery: Array<{
      id: number;
      title: string;
      description: string;
      image: string;
      image_fallback: string;
    }>;
  };
}

// Filtros por color dominante
const filters = [
  { id: 'all', name: 'Todos', color: '#6B7280', icon: '⭐' },
  { id: 'corporate', name: 'Corporativo', color: '#003F6F', icon: '🔵' },
  { id: 'celebrations', name: 'Celebraciones', color: '#E84E0F', icon: '🟠' },
  { id: 'sustainability', name: 'Sostenibilidad', color: '#059669', icon: '🟢' },
  { id: 'legacy', name: 'Historia', color: '#374151', icon: '⚪' }
];


// Componente de Lightbox
interface LightboxProps {
  moment: any | null;
  onClose: () => void;
}

function Lightbox({ moment, onClose }: LightboxProps) {
  if (!moment) return null;

  const filter = filters.find(f => f.id === moment.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: filter?.color }}
                >
                  {filter?.icon}
                </div>
                <span className="font-medium">{filter?.name}</span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="relative w-full h-[70vh]">
            <img
              src={moment.image}
              alt={moment.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {moment.title}
            </h3>
            <p className="text-gray-600">
              Un momento especial en nuestra historia como empresa
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TeamAndMoments({ teamSection, members, moments }: TeamAndMomentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMoment, setSelectedMoment] = useState<any>(null);

  // Filtrar momentos según la categoría activa
  const filteredMoments = moments?.gallery || [];

  // Obtener tamaño de grid para cada momento
  const getGridSize = (size: string) => {
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2';
      case 'tall':
        return 'col-span-1 row-span-2';
      case 'medium':
      default:
        return 'col-span-1 row-span-1';
    }
  };

  // Obtener filtro de color para cada categoría
  const getCategoryFilter = (category: string) => {
    switch (category) {
      case 'corporate':
        return 'sepia(0.3) hue-rotate(200deg) saturate(1.2)';
      case 'celebrations':
        return 'sepia(0.4) hue-rotate(15deg) saturate(1.3)';
      case 'sustainability':
        return 'sepia(0.3) hue-rotate(80deg) saturate(1.1)';
      case 'legacy':
        return 'grayscale(1) contrast(1.1)';
      default:
        return 'none';
    }
  };

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

    // Animación de entrada de las imágenes del equipo
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

    // Animación de entrada del mosaico
    gsap.fromTo('.moment-card', 
      { 
        opacity: 0, 
        scale: 0.8,
        y: 30
      },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".moments-section",
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, { scope: containerRef });

  // Manejar cambio de filtro sin doble animación
  const handleFilterChange = (filterId: string) => {
    if (filterId === activeFilter) return;
    setActiveFilter(filterId);
  };

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-[#003F6F] via-[#002A4D] to-[#001A33] overflow-hidden">
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Título principal de la sección unificada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white drop-shadow-2xl" style={{
              textShadow: '0 0 30px rgba(232, 78, 15, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {teamSection?.title || 'Nuestro Equipo'}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {teamSection?.subtitle || 'Los rostros detrás de cada proyecto exitoso'}
          </p>
        </motion.div>

        {/* Timeline horizontal del equipo */}
        <div className="relative h-96 overflow-hidden rounded-2xl mb-20">
          <div ref={timelineRef} className="flex items-center h-full space-x-8">
            {(members || []).map((member, index) => (
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
                  
                  {/* Overlay gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                  
                  {/* Información solo visible en hover */}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-300 ${
                    hoveredMember === member.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}>
                    <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-200">{member.role}</p>
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

        {/* Subtítulo para transición a momentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white drop-shadow-2xl" style={{
              textShadow: '0 0 25px rgba(232, 78, 15, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4)'
            }}>
              {moments?.title || 'Momentos que Nos Definen'}
            </span>
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {moments?.subtitle || 'Una galería visual que captura la esencia de nuestra cultura empresarial'}
          </p>
          
          {/* Separador visual */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#E84E0F] to-[#003F6F] mx-auto rounded-full mb-8"></div>

          {/* Indicador visual con colores de marca */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center"
          >

          </motion.div>
        </motion.div>

        {/* Sección de momentos */}
        <div className="moments-section">
          {/* Filtros visuales */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-white text-gray-900 border-white shadow-lg'
                    : 'bg-transparent text-white border-white/30 hover:border-white/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{filter.icon}</span>
                  <span className="font-medium">{filter.name}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Grid de mosaico */}
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-4 gap-4 grid-flow-dense"
            style={{
              gridAutoRows: 'minmax(200px, auto)'
            }}
          >
            <AnimatePresence>
              {filteredMoments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                  className={`moment-card group cursor-pointer ${getGridSize(moment.size)}`}
                  onClick={() => setSelectedMoment(moment)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-full h-full min-h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={moment.image}
                      alt={moment.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      style={{
                        filter: getCategoryFilter(moment.category)
                      }}
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Ícono de zoom */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ZoomIn size={20} className="text-white" />
                      </div>
                    </div>
                    
                    {/* Título */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {moment.title}
                      </h3>
                    </div>

                    {/* Efecto de brillo */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, ${filters.find(f => f.id === moment.category)?.color}40 50%, transparent 70%)`
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Estadísticas del filtro activo */}
          <motion.div
            layout
            className="mt-12 text-center"
          >
            <p className="text-gray-400 text-sm">
              Mostrando {filteredMoments.length} momentos
              {activeFilter !== 'all' && (
                <span className="ml-2 text-white font-medium">
                  • {filters.find(f => f.id === activeFilter)?.name}
                </span>
              )}
            </p>
          </motion.div>
        </div>

      </div>

      {/* Lightbox */}
      <Lightbox 
        moment={selectedMoment} 
        onClose={() => setSelectedMoment(null)} 
      />
    </section>
  );
}