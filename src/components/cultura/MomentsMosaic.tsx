'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ZoomIn } from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Filtros por color dominante
const filters = [
  { id: 'all', name: 'Todos', color: '#6B7280', icon: '⭐' },
  { id: 'corporate', name: 'Corporativo', color: '#003F6F', icon: '🔵' },
  { id: 'celebrations', name: 'Celebraciones', color: '#00A8E8', icon: '🟠' },
  { id: 'sustainability', name: 'Sostenibilidad', color: '#059669', icon: '🟢' },
  { id: 'legacy', name: 'Historia', color: '#374151', icon: '⚪' }
];

// Momentos organizados por categorías con sus colores dominantes
const moments = [
  // Corporativo (Azul)
  {
    id: 1,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    title: 'Dirección estratégica',
    size: 'large'
  },
  {
    id: 2,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    title: 'Planificación de proyectos',
    size: 'medium'
  },
  {
    id: 3,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop',
    title: 'Reuniones ejecutivas',
    size: 'tall'
  },
  
  // Celebraciones (Naranja)
  {
    id: 4,
    category: 'celebrations',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    title: 'Logros del equipo',
    size: 'large'
  },
  {
    id: 5,
    category: 'celebrations',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop',
    title: 'Eventos corporativos',
    size: 'medium'
  },
  {
    id: 6,
    category: 'celebrations',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    title: 'Reconocimientos',
    size: 'medium'
  },

  // Sostenibilidad (Verde)
  {
    id: 7,
    category: 'sustainability',
    image: 'https://images.unsplash.com/photo-1581092795442-1094e1b1bfaa?w=400&h=600&fit=crop',
    title: 'Tecnología sostenible',
    size: 'tall'
  },
  {
    id: 8,
    category: 'sustainability',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
    title: 'Proyectos verdes',
    size: 'large'
  },
  {
    id: 9,
    category: 'sustainability',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    title: 'Innovación ambiental',
    size: 'medium'
  },

  // Historia (B&N)
  {
    id: 10,
    category: 'legacy',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
    title: 'Nuestros orígenes',
    size: 'large'
  },
  {
    id: 11,
    category: 'legacy',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop',
    title: 'Evolución empresarial',
    size: 'tall'
  },
  {
    id: 12,
    category: 'legacy',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=400&h=300&fit=crop',
    title: 'Hitos históricos',
    size: 'medium'
  }
];

// Componente de Lightbox
interface LightboxProps {
  moment: typeof moments[0] | null;
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

export default function MomentsMosaic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMoment, setSelectedMoment] = useState<typeof moments[0] | null>(null);

  // Filtrar momentos según la categoría activa
  const filteredMoments = activeFilter === 'all' 
    ? moments 
    : moments.filter(moment => moment.category === activeFilter);

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
    if (!containerRef.current) return;

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
          trigger: containerRef.current,
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
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-[#003F6F] via-[#002A4D] to-[#001A33]">
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Separador visual sin título repetido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-1 bg-gradient-to-r from-[#00A8E8] to-[#003F6F] mx-auto rounded-full"></div>
        </motion.div>

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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]"
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
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
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

      {/* Lightbox */}
      <Lightbox 
        moment={selectedMoment} 
        onClose={() => setSelectedMoment(null)} 
      />
    </section>
  );
}