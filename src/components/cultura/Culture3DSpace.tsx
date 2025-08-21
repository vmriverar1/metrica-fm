'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, Users, Trophy, Clock, MapPin, Target } from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Mapeo de iconos por nombre
const iconMap = {
  Clock,
  Users,
  MapPin,
  Trophy,
  Building2,
  Target
};

interface CultureShowcaseProps {
  title?: string;
  subtitle?: string;
  categories?: {
    [key: string]: {
      title: string;
      icon: string;
      color: string;
      stats: Array<{
        label: string;
        value: string;
        description: string;
      }>;
    };
  };
}

interface StatCardProps {
  category: string;
  data: {
    title: string;
    icon: string;
    color: string;
    stats: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  };
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ category, data, index, isActive, onClick }: StatCardProps) {
  const Icon = (iconMap as any)[data.icon] || Clock;
  
  return (
    <motion.div
      onClick={onClick}
      className={`stat-card cursor-pointer p-6 rounded-2xl border-2 transition-all duration-500 ${
        isActive 
          ? 'bg-white shadow-2xl border-transparent scale-105' 
          : 'bg-white/80 hover:bg-white shadow-lg border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between mb-6">
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: `${data.color}20` }}
        >
          <Icon 
            size={24} 
            style={{ color: data.color }}
          />
        </div>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
        )}
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {data.title}
      </h3>

      {/* Estadísticas */}
      <div className="space-y-4">
        {data.stats.map((stat, statIndex) => (
          <motion.div
            key={statIndex}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: isActive ? 1 : 0.7, 
              x: 0,
              transition: { delay: statIndex * 0.1 }
            }}
          >
            <div>
              <div className="flex items-end space-x-2">
                <span 
                  className="text-2xl font-bold"
                  style={{ color: data.color }}
                >
                  {stat.value}
                </span>
                <span className="text-sm text-gray-600 mb-1">
                  {stat.label}
                </span>
              </div>
              {isActive && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-gray-500 mt-1"
                >
                  {stat.description}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function CultureShowcase({ title, subtitle, categories }: CultureShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('historia');

  useGSAP(() => {
    if (!containerRef.current) return;

    // Animación de entrada de las tarjetas
    gsap.fromTo('.stat-card', 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#003F6F] mb-6">
            {title || 'Cultura en Números'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle || 'Los datos que reflejan nuestro compromiso con la excelencia y el crecimiento sostenido en el sector de construcción'}
          </p>
        </motion.div>

        {/* Grid de tarjetas estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {Object.entries(categories || {}).map(([category, data], index) => (
            <StatCard
              key={category}
              category={category}
              data={data}
              index={index}
              isActive={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>

        {/* Panel de información expandida */}
        <motion.div
          layout
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div 
                className="p-4 rounded-full"
                style={{ backgroundColor: `${categories?.[activeCategory]?.color || '#003F6F'}20` }}
              >
                {React.createElement((iconMap as any)[categories?.[activeCategory]?.icon || 'Clock'], {
                  size: 32,
                  style: { color: categories?.[activeCategory]?.color || '#003F6F' }
                })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {categories?.[activeCategory]?.title || 'Categoría'}
                </h3>
                <p className="text-gray-600">
                  Explora los números que definen esta área
                </p>
              </div>
            </div>

            {/* Gráfico visual de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(categories?.[activeCategory]?.stats || []).map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="text-4xl font-bold mb-2"
                    style={{ color: categories?.[activeCategory]?.color || '#003F6F' }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-gray-600">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            ¿Quieres ser parte de nuestro crecimiento?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-[#E84E0F] to-[#003F6F] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Únete al Equipo
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}