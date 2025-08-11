'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Cpu, 
  Zap, 
  Eye, 
  Layers, 
  Smartphone, 
  Cloud,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Tecnologías e innovaciones de Métrica DIP
const technologies = [
  {
    id: 'bim',
    title: 'Modelado BIM',
    subtitle: 'Building Information Modeling',
    icon: Layers,
    color: '#E84E0F',
    description: 'Modelado 3D inteligente que integra toda la información del proyecto',
    features: ['Coordinación 3D', 'Detección de conflictos', 'Simulación 4D', 'Gestión 5D'],
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Centro Comercial Plaza Norte',
      result: '35% reducción en tiempos de construcción',
      savings: 'S/. 2.3M en ahorro de costos'
    }
  },
  {
    id: 'drones',
    title: 'Tecnología Drone',
    subtitle: 'Topografía y Supervisión Aérea',
    icon: Eye,
    color: '#003F6F',
    description: 'Inspección y monitoreo de obras con tecnología de punta',
    features: ['Fotogrametría', 'Mapeo 3D', 'Inspección estructural', 'Seguimiento de progreso'],
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Complejo Industrial Lurín',
      result: '90% reducción en tiempo de levantamiento',
      savings: '78% ahorro en costos topográficos'
    }
  },
  {
    id: 'ai',
    title: 'Inteligencia Artificial',
    subtitle: 'Análisis Predictivo y Optimización',
    icon: Cpu,
    color: '#E84E0F',
    description: 'IA aplicada para optimizar recursos y predecir riesgos en proyectos',
    features: ['Análisis predictivo', 'Optimización de recursos', 'Gestión de riesgos', 'Automatización'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Torre Corporativa San Isidro',
      result: '25% mejora en eficiencia de recursos',
      savings: 'Reducción del 40% en retrabajos'
    }
  },
  {
    id: 'iot',
    title: 'IoT & Sensores',
    subtitle: 'Monitoreo en Tiempo Real',
    icon: Smartphone,
    color: '#003F6F',
    description: 'Sensores inteligentes para monitoreo continuo de estructuras',
    features: ['Sensores estructurales', 'Monitoreo ambiental', 'Alertas automáticas', 'Dashboard en tiempo real'],
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Puente Peatonal Miraflores',
      result: 'Monitoreo 24/7 de integridad estructural',
      savings: '100% prevención de fallas críticas'
    }
  },
  {
    id: 'cloud',
    title: 'Cloud Computing',
    subtitle: 'Colaboración Global y Almacenamiento',
    icon: Cloud,
    color: '#E84E0F',
    description: 'Plataforma en la nube para colaboración en tiempo real',
    features: ['Acceso global', 'Sincronización automática', 'Backup seguro', 'Colaboración en tiempo real'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Campus Universidad del Pacífico',
      result: 'Colaboración simultánea de 12 especialistas',
      savings: '60% reducción en reuniones presenciales'
    }
  },
  {
    id: 'automation',
    title: 'Automatización',
    subtitle: 'Procesos Inteligentes y Eficientes',
    icon: Zap,
    color: '#003F6F',
    description: 'Automatización de procesos repetitivos y generación de reportes',
    features: ['Reportes automáticos', 'Cálculos inteligentes', 'Flujos de trabajo', 'Integración de sistemas'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
    caseStudy: {
      project: 'Complejo Residencial Magdalena',
      result: '70% automatización de reportes',
      savings: '15 horas/semana liberadas para análisis estratégico'
    }
  }
];

interface TechCardProps {
  tech: typeof technologies[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function TechCard({ tech, index, isActive, onClick }: TechCardProps) {
  const Icon = tech.icon;
  
  return (
    <motion.div
      onClick={onClick}
      className={`tech-card cursor-pointer p-6 rounded-2xl border-2 transition-all duration-500 ${
        isActive 
          ? 'bg-white shadow-2xl border-transparent scale-105 z-10' 
          : 'bg-white/90 hover:bg-white shadow-lg border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ y: isActive ? 0 : -8 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tech.color}20` }}
        >
          <Icon size={28} style={{ color: tech.color }} />
        </div>
        {isActive && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tech.color }}
          >
            <Play size={12} className="text-white ml-0.5" />
          </motion.div>
        )}
      </div>

      {/* Contenido */}
      <h3 className="text-xl font-bold text-gray-800 mb-1">
        {tech.title}
      </h3>
      <p className="text-sm font-medium mb-3" style={{ color: tech.color }}>
        {tech.subtitle}
      </p>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {tech.description}
      </p>

      {/* Features preview */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tech.features.slice(0, 2).map((feature, i) => (
          <span 
            key={i}
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tech.color }}
          >
            {feature}
          </span>
        ))}
        {tech.features.length > 2 && (
          <span className="text-xs text-gray-400 px-2 py-1">
            +{tech.features.length - 2} más
          </span>
        )}
      </div>

      {/* Case study preview */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Caso de estudio:</span>
          <span className="font-medium">{tech.caseStudy.project}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TechInnovationHub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTech, setActiveTech] = useState('bim');
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTechData = technologies.find(t => t.id === activeTech);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Animación de entrada de las tarjetas
    gsap.fromTo('.tech-card', 
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
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, { scope: containerRef });

  const toggleSimulation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    // Reset logic can be added here
  };

  return (
    <section ref={containerRef} className="py-20 bg-primary">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E0F] to-[#003F6F]">
              Centro de Innovación Tecnológica
            </span>
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-4xl mx-auto leading-relaxed">
            Las tecnologías de vanguardia que aplicamos para revolucionar la industria de la construcción
          </p>
        </motion.div>

        {/* Grid de tecnologías */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {technologies.map((tech, index) => (
            <TechCard
              key={tech.id}
              tech={tech}
              index={index}
              isActive={activeTech === tech.id}
              onClick={() => setActiveTech(tech.id)}
            />
          ))}
        </div>

        {/* Panel de demostración interactiva */}
        {activeTechData && (
          <motion.div
            layout
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-200"
          >
            <motion.div
              key={activeTech}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header del panel */}
              <div className="p-8 bg-gradient-to-r from-primary to-primary/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: `${activeTechData.color}20` }}
                    >
                      {React.createElement(activeTechData.icon, {
                        size: 32,
                        style: { color: activeTechData.color }
                      })}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-primary-foreground">
                        {activeTechData.title}
                      </h3>
                      <p className="text-lg" style={{ color: activeTechData.color }}>
                        {activeTechData.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Controles de simulación */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={toggleSimulation}
                      className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <Pause size={20} className="text-primary-foreground" />
                      ) : (
                        <Play size={20} className="text-primary-foreground ml-1" />
                      )}
                    </motion.button>
                    <motion.button
                      onClick={resetSimulation}
                      className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/30"
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw size={20} className="text-primary-foreground" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Contenido principal del panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                
                {/* Imagen demostrativa */}
                <div className="relative">
                  <motion.div
                    className="rounded-2xl overflow-hidden shadow-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img
                      src={activeTechData.image}
                      alt={activeTechData.title}
                      className="w-full h-80 object-cover"
                    />
                    
                    {/* Overlay animado */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(45deg, ${activeTechData.color}20 0%, transparent 50%, ${activeTechData.color}20 100%)`
                      }}
                      animate={{
                        opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3
                      }}
                      transition={{
                        duration: 2,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>

                {/* Información detallada */}
                <div className="space-y-6">
                  
                  {/* Descripción */}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                      Descripción de la Tecnología
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {activeTechData.description}
                    </p>
                  </div>

                  {/* Características principales */}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                      Características Principales
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {activeTechData.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <ArrowRight size={16} style={{ color: activeTechData.color }} />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Caso de estudio */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      📊 Caso de Estudio Exitoso
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 text-sm">Proyecto: </span>
                        <span className="text-gray-800 font-medium">{activeTechData.caseStudy.project}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Resultado: </span>
                        <span style={{ color: activeTechData.color }} className="font-medium">
                          {activeTechData.caseStudy.result}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Impacto: </span>
                        <span className="text-green-600 font-medium">
                          {activeTechData.caseStudy.savings}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-primary-foreground/80 mb-6">
            ¿Quieres conocer más sobre nuestras innovaciones tecnológicas?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#E84E0F] to-[#003F6F] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Solicitar Demostración Técnica
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}