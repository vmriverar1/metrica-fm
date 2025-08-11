'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, Users, Trophy, Clock, MapPin, Target } from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Datos de la cultura empresarial organizados por categorías
const cultureData = {
  historia: {
    title: "Nuestra Historia",
    icon: Clock,
    color: "#E84E0F",
    stats: [
      { label: "Años en el mercado", value: "15+", description: "Experiencia consolidada en dirección de proyectos" },
      { label: "Proyectos completados", value: "200+", description: "Obras exitosas en todo el Perú" },
      { label: "Clientes satisfechos", value: "150+", description: "Empresas que confían en nosotros" }
    ]
  },
  equipo: {
    title: "Nuestro Equipo",
    icon: Users,
    color: "#003F6F", 
    stats: [
      { label: "Profesionales", value: "45+", description: "Especialistas multidisciplinarios" },
      { label: "Ingenierías", value: "8", description: "Diferentes especialidades técnicas" },
      { label: "Certificaciones", value: "25+", description: "Acreditaciones profesionales activas" }
    ]
  },
  alcance: {
    title: "Alcance Nacional",
    icon: MapPin,
    color: "#E84E0F",
    stats: [
      { label: "Regiones", value: "12", description: "Presencia en todo el territorio peruano" },
      { label: "Sectores", value: "6", description: "Industrial, minero, energía, inmobiliario" },
      { label: "Especialidades", value: "10+", description: "Áreas de expertise técnico" }
    ]
  },
  logros: {
    title: "Reconocimientos",
    icon: Trophy,
    color: "#003F6F",
    stats: [
      { label: "Premios", value: "8", description: "Reconocimientos a la excelencia" },
      { label: "ISO certificado", value: "2", description: "Sistemas de gestión implementados" },
      { label: "Satisfacción", value: "98%", description: "Índice de clientes satisfechos" }
    ]
  }
};

interface StatCardProps {
  category: keyof typeof cultureData;
  data: typeof cultureData[keyof typeof cultureData];
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ category, data, index, isActive, onClick }: StatCardProps) {
  const Icon = data.icon;
  
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

export default function CultureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<keyof typeof cultureData>('historia');

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
            Cultura en Números
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Los datos que reflejan nuestro compromiso con la excelencia y el crecimiento sostenido en el sector de construcción
          </p>
        </motion.div>

        {/* Grid de tarjetas estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {Object.entries(cultureData).map(([category, data], index) => (
            <StatCard
              key={category}
              category={category as keyof typeof cultureData}
              data={data}
              index={index}
              isActive={activeCategory === category}
              onClick={() => setActiveCategory(category as keyof typeof cultureData)}
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
                style={{ backgroundColor: `${cultureData[activeCategory].color}20` }}
              >
                {React.createElement(cultureData[activeCategory].icon, {
                  size: 32,
                  style: { color: cultureData[activeCategory].color }
                })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {cultureData[activeCategory].title}
                </h3>
                <p className="text-gray-600">
                  Explora los números que definen esta área
                </p>
              </div>
            </div>

            {/* Gráfico visual de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cultureData[activeCategory].stats.map((stat, index) => (
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
                    style={{ color: cultureData[activeCategory].color }}
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