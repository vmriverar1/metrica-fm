'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp,
  FileText,
  Crown,
  Clock,
  ArrowRight,
  Download,
  Play,
  Star,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface KnowledgeCard {
  id: string;
  type: 'guide' | 'insight' | 'case' | 'video' | 'download';
  title: string;
  description: string;
  readTime: string;
  category: string;
  link: string;
  image?: string;
  author?: string;
  views?: number;
  rating?: number;
  featured?: boolean;
  isNew?: boolean;
}

const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'elegir-project-manager',
    type: 'guide',
    title: 'Guía: Cómo Elegir el Project Manager Ideal',
    description: 'Criterios esenciales para seleccionar al profesional que liderará tu proyecto exitosamente.',
    readTime: '5 min',
    category: 'Project Management',
    link: '/blog/guias-tecnicas/elegir-project-manager',
    author: 'Carlos Mendoza',
    views: 2847,
    rating: 4.8,
    featured: true
  },
  {
    id: 'tendencias-construccion-2025',
    type: 'insight',
    title: 'Tendencias 2025 en Construcción Peruana',
    description: 'Análisis profundo de las tecnologías y metodologías que transformarán el sector.',
    readTime: '8 min',
    category: 'Industria & Tendencias',
    link: '/blog/industria-tendencias/construccion-2025',
    author: 'Sofía Herrera',
    views: 1923,
    rating: 4.9,
    isNew: true
  },
  {
    id: 'optimizacion-costos-caso',
    type: 'case',
    title: 'Caso: Optimización de Costos 40% en Torre Corporativa',
    description: 'Cómo logramos reducir significativamente los costos sin comprometer la calidad.',
    readTime: '12 min',
    category: 'Casos de Estudio',
    link: '/blog/casos-estudio/optimizacion-costos-torre',
    author: 'Miguel Rodríguez',
    views: 3156,
    rating: 5.0,
    featured: true
  },
  {
    id: 'certificacion-leed-video',
    type: 'video',
    title: 'Certificación LEED: Paso a Paso',
    description: 'Video guía completa para obtener certificación LEED Gold en tu proyecto.',
    readTime: '15 min',
    category: 'Sostenibilidad',
    link: '/blog/guias-tecnicas/certificacion-leed',
    author: 'Ana Torres',
    views: 4521,
    rating: 4.7
  },
  {
    id: 'metodologia-pmi-download',
    type: 'download',
    title: 'Metodología PMI: Template Completo',
    description: 'Descarga nuestro template exclusivo para implementar metodología PMI en tu proyecto.',
    readTime: '30 pág.',
    category: 'Project Management',
    link: '/downloads/metodologia-pmi-template',
    author: 'Métrica Team',
    views: 1876,
    featured: true
  },
  {
    id: 'futuro-construccion-insight',
    type: 'insight',
    title: 'El Futuro de la Construcción en Perú',
    description: 'Visión estratégica sobre el crecimiento del sector y oportunidades de inversión.',
    readTime: '10 min',
    category: 'Liderazgo & Visión',
    link: '/blog/liderazgo-vision/futuro-construccion-peru',
    author: 'CEO Métrica DIP',
    views: 2134,
    rating: 4.9
  }
];

const getTypeIcon = (type: string) => {
  const icons = {
    guide: <BookOpen className="w-5 h-5" />,
    insight: <TrendingUp className="w-5 h-5" />,
    case: <FileText className="w-5 h-5" />,
    video: <Play className="w-5 h-5" />,
    download: <Download className="w-5 h-5" />
  };
  return icons[type as keyof typeof icons] || <FileText className="w-5 h-5" />;
};

const getTypeColor = (type: string) => {
  const colors = {
    guide: 'text-blue-600 bg-blue-50 border-blue-200',
    insight: 'text-green-600 bg-green-50 border-green-200',
    case: 'text-purple-600 bg-purple-50 border-purple-200',
    video: 'text-red-600 bg-red-50 border-red-200',
    download: 'text-orange-600 bg-orange-50 border-orange-200'
  };
  return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
};

const getTypeLabel = (type: string) => {
  const labels = {
    guide: 'Guía Práctica',
    insight: 'Análisis',
    case: 'Caso de Estudio',
    video: 'Video Tutorial',
    download: 'Descargable'
  };
  return labels[type as keyof typeof labels] || 'Contenido';
};

export default function KnowledgeHub() {
  return (
    <>
      <SectionTransition variant="fade" />
      
      <section id="knowledge-hub" className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Crown className="w-4 h-4" />
              Conocimiento Especializado
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Centro de Conocimiento
            </motion.h2>
            
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Accede a insights, guías y casos de estudio creados por nuestros expertos. 
              Conocimiento práctico que impulsa el éxito de tu proyecto.
            </motion.p>
          </div>

          {/* Featured Content */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {knowledgeCards
                .filter(card => card.featured)
                .slice(0, 2)
                .map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className={cn(
                    "relative h-80 rounded-2xl p-8 transition-all duration-500",
                    "bg-card border-2 cursor-pointer",
                    "hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]",
                    "border-primary/20 bg-gradient-to-br from-card to-primary/5"
                  )}>
                    {/* Featured Badge */}
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Destacado
                      </Badge>
                    </div>

                    {/* Type Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-6",
                      getTypeColor(card.type)
                    )}>
                      {getTypeIcon(card.type)}
                      {getTypeLabel(card.type)}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>

                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {card.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {card.readTime}
                        </div>
                        {card.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {card.views.toLocaleString()} vistas
                          </div>
                        )}
                        {card.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            {card.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="text-xs text-muted-foreground">
                          por <span className="font-medium text-foreground">{card.author}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {card.category}
                        </Badge>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="absolute bottom-6 right-6 left-6">
                      <Button 
                        className="w-full justify-between group/btn opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={() => window.location.href = card.link}
                      >
                        {card.type === 'download' ? 'Descargar' : 'Leer Más'}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Regular Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {knowledgeCards
              .filter(card => !card.featured)
              .map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={cn(
                  "relative h-72 rounded-xl p-6 transition-all duration-300",
                  "bg-card border border-border cursor-pointer",
                  "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
                )}>
                  {/* New Badge */}
                  {card.isNew && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="text-xs">
                        Nuevo
                      </Badge>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mb-4",
                    getTypeColor(card.type)
                  )}>
                    {getTypeIcon(card.type)}
                    {getTypeLabel(card.type)}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {card.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {card.readTime}
                      </div>
                      {card.views && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {card.views.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          por <span className="font-medium text-foreground">{card.author}</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {card.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="absolute bottom-4 right-4 left-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs"
                      onClick={() => window.location.href = card.link}
                    >
                      {card.type === 'download' ? 'Descargar' : card.type === 'video' ? 'Ver Video' : 'Leer Artículo'}
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
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-2xl p-8 max-w-3xl mx-auto border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                ¿Quieres acceso completo a nuestro conocimiento?
              </h3>
              <p className="text-muted-foreground mb-6">
                Suscríbete a nuestro newsletter y recibe contenido exclusivo, 
                guías avanzadas y análisis de mercado directamente en tu bandeja.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/blog'}
                  className="px-8"
                >
                  Explorar Blog Completo
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Suscribirse al Newsletter
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>50+ artículos especializados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Contenido actualizado semanalmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Recursos descargables gratuitos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>
    </>
  );
}