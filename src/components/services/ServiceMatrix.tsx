'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Cog, 
  Shield,
  Home,
  Settings,
  Award,
  Leaf,
  Cpu,
  MonitorPlay
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SectionTransition from '@/components/portfolio/SectionTransition';
import { useServiceInteractionTracking } from './ServiceAnalytics';

interface Service {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  benefits: string[];
  caseStudyLink?: string;
  color: string;
}

const services: Service[] = [
  {
    id: 'consultoria-estrategica',
    title: 'Consultoría Estratégica',
    category: 'Consultoría',
    icon: <Building2 className="w-8 h-8" />,
    description: 'Asesoría integral desde la concepción hasta la viabilidad del proyecto',
    benefits: [
      'Reducción de riesgos pre-construcción',
      'Optimización de inversión inicial',
      'Estrategia de desarrollo personalizada'
    ],
    caseStudyLink: '/portfolio?service=consultoria',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'gestion-integral',
    title: 'Gestión Integral',
    category: 'Gestión',
    icon: <Cog className="w-8 h-8" />,
    description: 'Project Management completo con metodologías PMI certificadas',
    benefits: [
      'Control total de cronograma',
      '30% reducción en tiempo',
      'Gestión proactiva de riesgos'
    ],
    caseStudyLink: '/portfolio?service=gestion',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'supervision-tecnica',
    title: 'Supervisión Técnica',
    category: 'Supervisión',
    icon: <Shield className="w-8 h-8" />,
    description: 'Supervisión especializada que garantiza calidad y cumplimiento normativo',
    benefits: [
      'Cumplimiento ISO 9001',
      'Control de calidad 24/7',
      'Reportes en tiempo real'
    ],
    caseStudyLink: '/portfolio?service=supervision',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'desarrollo-inmobiliario',
    title: 'Desarrollo Inmobiliario',
    category: 'Desarrollo',
    icon: <Home className="w-8 h-8" />,
    description: 'Gestión completa de proyectos inmobiliarios desde terreno hasta entrega',
    benefits: [
      'ROI optimizado garantizado',
      'Gestión de permisos integral',
      'Comercialización estratégica'
    ],
    caseStudyLink: '/portfolio?category=vivienda',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'project-management',
    title: 'Project Management',
    category: 'PM',
    icon: <Settings className="w-8 h-8" />,
    description: 'Dirección de proyectos con estándares internacionales PMI/PRINCE2',
    benefits: [
      'Metodología PMI certificada',
      'Stakeholder management',
      'Risk management avanzado'
    ],
    caseStudyLink: '/portfolio?service=pm',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'control-calidad',
    title: 'Control de Calidad',
    category: 'Control',
    icon: <Award className="w-8 h-8" />,
    description: 'Aseguramiento de calidad con protocolos internacionales',
    benefits: [
      'Certificación ISO 9001',
      'Testing y validación',
      'Trazabilidad completa'
    ],
    caseStudyLink: '/iso',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'sostenibilidad',
    title: 'Sostenibilidad & Certificación',
    category: 'Sostenibilidad',
    icon: <Leaf className="w-8 h-8" />,
    description: 'Proyectos sostenibles con certificaciones LEED y BREEAM',
    benefits: [
      'Certificación LEED Gold/Platinum',
      '40% reducción energética',
      'ROI verde a largo plazo'
    ],
    caseStudyLink: '/portfolio?tag=sostenible',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'transformacion-digital',
    title: 'Transformación Digital',
    category: 'Digital',
    icon: <Cpu className="w-8 h-8" />,
    description: 'Implementación de tecnologías 4.0 en construcción',
    benefits: [
      'Digitalización BIM 360°',
      'IoT y sensores avanzados',
      'Dashboard en tiempo real'
    ],
    caseStudyLink: '/blog/guias-tecnicas',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'bim-tecnologia',
    title: 'BIM & Tecnología',
    category: 'Tecnología',
    icon: <MonitorPlay className="w-8 h-8" />,
    description: 'Modelado 3D/4D/5D con tecnologías de realidad virtual',
    benefits: [
      'Modelado 5D completo',
      'VR/AR para validación',
      'Clash detection 99.9%'
    ],
    caseStudyLink: '/blog/guias-tecnicas?tag=bim',
    color: 'from-cyan-500 to-cyan-600'
  }
];

export default function ServiceMatrix() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { trackServiceClick, trackCTAClick } = useServiceInteractionTracking();

  return (
    <>
      <SectionTransition variant="fade" />
      
      <section id="service-matrix" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Elige Tu Ruta al Éxito
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Nueve servicios especializados que cubren cada fase de tu proyecto, 
              desde la concepción hasta la entrega exitosa.
            </motion.p>
          </div>

          {/* Service Grid - 3x3 Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredService(service.id)}
                onHoverEnd={() => setHoveredService(null)}
              >
                <div 
                  className={cn(
                    "relative h-80 rounded-2xl p-8 cursor-pointer transition-all duration-500",
                    "bg-card border border-border",
                    "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2",
                    "group-hover:border-primary/20"
                  )}
                  onClick={() => {
                    setSelectedService(service.id);
                    trackServiceClick(service.id, service.title);
                  }}
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    service.color,
                    hoveredService === service.id ? "opacity-5" : "opacity-0"
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 mb-6 p-3 rounded-xl transition-all duration-300",
                    "bg-primary/10 text-primary",
                    hoveredService === service.id ? "scale-110 bg-primary text-primary-foreground" : ""
                  )}>
                    {service.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <div>
                      <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
                        {service.category}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    {/* Benefits Preview */}
                    <AnimatePresence>
                      {hoveredService === service.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 pt-4 border-t border-border/50"
                        >
                          {service.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CTA Button */}
                  <div className="absolute bottom-6 right-6 left-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "w-full opacity-0 group-hover:opacity-100 transition-all duration-300",
                        "hover:bg-primary hover:text-primary-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (service.caseStudyLink) {
                          trackCTAClick(`service-case-study-${service.id}`, 'Ver Casos de Éxito', service.caseStudyLink);
                          window.location.href = service.caseStudyLink;
                        }
                      }}
                    >
                      Ver Casos de Éxito
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-6">
              ¿No estás seguro cuál servicio necesitas?
            </p>
            <Button 
              size="lg"
              onClick={() => {
                document.getElementById('contact-form')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Consulta Personalizada Gratuita
            </Button>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </section>
    </>
  );
}