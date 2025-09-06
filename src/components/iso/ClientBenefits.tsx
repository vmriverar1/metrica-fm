'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  CheckCircle,
  Award,
  Target,
  Building2,
  Zap,
  Star,
  ArrowRight,
  ThumbsUp,
  Globe,
  FileText,
  BarChart3,
  Lightbulb,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Quote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useISOData } from '@/hooks/useISOData';

// Client benefits data
const clientBenefits = [
  {
    id: 'quality-assurance',
    icon: Shield,
    title: 'Garantía de Calidad Total',
    description: 'Procesos estandarizados y documentados que aseguran consistencia excepcional en cada etapa del proyecto.',
    impact: '99.2% satisfacción cliente',
    color: 'blue',
    details: [
      'Protocolos de calidad verificados en cada fase',
      'Revisiones sistemáticas de entregables',
      'Trazabilidad completa de procesos',
      'Auditorías internas periódicas'
    ],
    caseStudy: {
      project: 'Torre Corporativa San Isidro',
      result: 'Entregado con 0 defectos mayores y certificación LEED Gold'
    }
  },
  {
    id: 'time-delivery',
    icon: Clock,
    title: 'Cumplimiento de Plazos Garantizado',
    description: 'Sistema de gestión de cronogramas que asegura entregas puntuales y predecibles.',
    impact: '94.8% proyectos a tiempo',
    color: 'green',
    details: [
      'Planificación detallada con hitos críticos',
      'Monitoreo diario de avances',
      'Gestión proactiva de riesgos',
      'Coordinación optimizada de recursos'
    ],
    caseStudy: {
      project: 'Centro Comercial Plaza Norte Fase II',
      result: 'Inauguración adelantada 2 semanas respecto al cronograma original'
    }
  },
  {
    id: 'cost-control',
    icon: DollarSign,
    title: 'Control Presupuestario Riguroso',
    description: 'Metodologías probadas para mantener los costos dentro del presupuesto aprobado.',
    impact: '96.1% proyectos en presupuesto',
    color: 'orange',
    details: [
      'Estimaciones precisas basadas en históricos',
      'Control de cambios estructurado',
      'Seguimiento semanal de gastos',
      'Alertas tempranas de desviaciones'
    ],
    caseStudy: {
      project: 'Hospital Privado Arequipa',
      result: '3.2% de ahorro final respecto al presupuesto inicial'
    }
  },
  {
    id: 'continuous-improvement',
    icon: TrendingUp,
    title: 'Mejora Continua Sistémica',
    description: 'Cultura organizacional enfocada en optimización constante de procesos y resultados.',
    impact: '23% mejora anual en KPIs',
    color: 'purple',
    details: [
      'Análisis post-proyecto obligatorio',
      'Implementación de lecciones aprendidas',
      'Actualización continua de metodologías',
      'Innovación en herramientas y técnicas'
    ],
    caseStudy: {
      project: 'Complejo Industrial Ventanilla',
      result: '18% reducción en tiempos de construcción vs. proyectos similares'
    }
  },
  {
    id: 'team-expertise',
    icon: Users,
    title: 'Equipo Altamente Competente',
    description: 'Personal certificado y en constante capacitación para brindar servicios excepcionales.',
    impact: '92.4% competencia certificada',
    color: 'emerald',
    details: [
      'Certificaciones profesionales actualizadas',
      'Programas de capacitación continua',
      'Evaluaciones periódicas de desempeño',
      'Especialización en tecnologías avanzadas'
    ],
    caseStudy: {
      project: 'Universidad Privada Trujillo',
      result: 'Reconocimiento como "Proyecto del Año" por Colegio de Ingenieros'
    }
  },
  {
    id: 'risk-management',
    icon: Target,
    title: 'Gestión Integral de Riesgos',
    description: 'Identificación, evaluación y mitigación proactiva de riesgos en todas las fases del proyecto.',
    impact: '0 incidentes de seguridad',
    color: 'red',
    details: [
      'Matriz de riesgos actualizada semanalmente',
      'Planes de contingencia pre-aprobados',
      'Seguros especializados por proyecto',
      'Protocolos de seguridad estrictos'
    ],
    caseStudy: {
      project: 'Clínica Especializada San Borja',
      result: 'Construcción completada sin interrupciones durante pandemia COVID-19'
    }
  }
];

// Client testimonials data
const testimonials = [
  {
    id: 'testimonio-1',
    client: 'Grupo Inmobiliario Prima',
    project: 'Torres Residenciales Barranco',
    position: 'Gerente General',
    name: 'Carlos Mendoza',
    quote: 'La certificación ISO 9001 de Métrica FM nos dio la confianza total para confiarles nuestro proyecto más importante. La calidad y puntualidad fueron excepcionales.',
    rating: 5,
    image: '/images/clients/carlos-mendoza.jpg'
  },
  {
    id: 'testimonio-2',
    client: 'Retail Perú S.A.',
    project: 'Centro Comercial Mall del Sur',
    position: 'Directora de Desarrollo',
    name: 'Patricia Vásquez',
    quote: 'Los procesos certificados ISO garantizaron que cada fase del proyecto se ejecutara con los más altos estándares. Superaron nuestras expectativas.',
    rating: 5,
    image: '/images/clients/patricia-vasquez.jpg'
  },
  {
    id: 'testimonio-3',
    client: 'Corporación Salud Integral',
    project: 'Hospital Moderno Arequipa',
    position: 'CEO',
    name: 'Dr. Miguel Torres',
    quote: 'En un sector tan exigente como salud, la certificación ISO 9001 de Métrica FM fue un factor decisivo. La calidad de construcción es impecable.',
    rating: 5,
    image: '/images/clients/miguel-torres.jpg'
  }
];

export default function ClientBenefits() {
  const { data, loading, error } = useISOData();
  const [selectedBenefit, setSelectedBenefit] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Show loading state
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Cargando beneficios para clientes...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-red-600">Error cargando los beneficios para clientes</p>
          </div>
        </div>
      </section>
    );
  }

  // Extract data from JSON
  const clientBenefitsData = data.client_benefits?.benefits_list || [];
  const testimonialsData = data.testimonials?.testimonials_list || [];
  const sectionData = data.client_benefits?.section || {};

  // Icon mapper
  const iconMap = {
    Shield,
    Clock,
    DollarSign,
    TrendingUp,
    Users,
    Heart,
    Target,
    CheckCircle,
    Award,
    Globe,
    Building2,
    Zap,
    Star,
    ThumbsUp,
    FileText,
    BarChart3,
    Lightbulb,
    Eye
  };

  const benefitColors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Beneficios para Clientes
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {sectionData.title || 'Beneficios para Nuestros Clientes'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {sectionData.subtitle || 'La certificación ISO 9001 se traduce en ventajas tangibles para cada proyecto'}
          </p>
        </motion.div>

        {/* Benefits Interactive Section */}
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          
          {/* Benefits Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-semibold mb-6">Beneficios Principales</h3>
            {clientBenefitsData.map((benefit, index) => {
              const colors = benefitColors[benefit.color as keyof typeof benefitColors];
              const isSelected = selectedBenefit === index;
              const IconComponent = iconMap[benefit.icon as keyof typeof iconMap] || Shield;
              
              return (
                <motion.div
                  key={benefit.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 rounded-lg p-4 border-2",
                    isSelected 
                      ? `${colors.border} ${colors.bg} shadow-lg` 
                      : "border-transparent hover:border-border hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedBenefit(index)}
                  whileHover={{ x: isSelected ? 0 : 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                      isSelected ? colors.bg : "bg-muted"
                    )}>
                      <IconComponent className={cn(
                        "w-6 h-6 transition-colors",
                        isSelected ? colors.text : "text-muted-foreground"
                      )} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-semibold mb-1 transition-colors",
                        isSelected ? colors.text : "text-foreground"
                      )}>
                        {benefit.title}
                      </h4>
                      <div className={cn(
                        "text-sm font-medium",
                        isSelected ? colors.text : "text-muted-foreground"
                      )}>
                        {benefit.impact}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <ChevronRight className={cn("w-5 h-5", colors.text)} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Selected Benefit Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedBenefit}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                {clientBenefitsData[selectedBenefit] && (
                  <Card className="h-full border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          {React.createElement(iconMap[clientBenefitsData[selectedBenefit].icon as keyof typeof iconMap] || Shield, { className: "w-8 h-8 text-primary" })}
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {clientBenefitsData[selectedBenefit].title}
                          </CardTitle>
                          <p className="text-muted-foreground leading-relaxed">
                            {clientBenefitsData[selectedBenefit].description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Impact Metric */}
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Impacto Medible</span>
                        </div>
                        <div className="text-3xl font-bold text-primary mb-2">
                          {clientBenefitsData[selectedBenefit].impact}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Resultado promedio en nuestros proyectos certificados
                        </p>
                      </div>

                      {/* Benefit Details */}
                      <div>
                        <h5 className="font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Cómo lo Garantizamos:
                        </h5>
                        <div className="grid md:grid-cols-2 gap-3">
                          {clientBenefitsData[selectedBenefit].details.map((detail, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 p-3 bg-background rounded-lg"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              <span className="text-sm">{detail}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Case Study */}
                      <div className="bg-muted/50 rounded-lg p-6">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-600" />
                          Caso de Éxito:
                        </h5>
                        <div className="space-y-2">
                          <div className="font-medium text-foreground">
                            {clientBenefitsData[selectedBenefit].case_study.project}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {clientBenefitsData[selectedBenefit].case_study.result}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Client Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Testimonios reales de clientes que han experimentado los beneficios de trabajar 
              con una empresa certificada ISO 9001
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-2" />
                      
                      <div className="flex-1">
                        <blockquote className="text-lg leading-relaxed text-foreground mb-6 italic">
                          "{testimonialsData[currentTestimonial]?.quote}"
                        </blockquote>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary" />
                          </div>
                          
                          <div>
                            <div className="font-semibold text-lg">
                              {testimonialsData[currentTestimonial]?.author}
                            </div>
                            <div className="text-muted-foreground">
                              {testimonialsData[currentTestimonial]?.position}
                            </div>
                            <div className="text-sm text-primary font-medium">
                              {testimonialsData[currentTestimonial]?.company}
                            </div>
                          </div>
                          
                          <div className="ml-auto">
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: testimonialsData[currentTestimonial]?.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {testimonialsData[currentTestimonial]?.project}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      currentTestimonial === index ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Value Proposition Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold mb-2">98.5%</h4>
              <p className="text-muted-foreground">Satisfacción Promedio</p>
              <p className="text-sm text-muted-foreground mt-2">
                Índice de satisfacción en proyectos certificados ISO
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold mb-2">Zero</h4>
              <p className="text-muted-foreground">Incidentes Mayores</p>
              <p className="text-sm text-muted-foreground mt-2">
                Historial de seguridad impecable desde certificación
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-2xl font-bold mb-2">95.4%</h4>
              <p className="text-muted-foreground">Entregas Puntuales</p>
              <p className="text-sm text-muted-foreground mt-2">
                Cumplimiento de cronogramas acordados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold mb-4">
                ¿Listo para Experimentar la Diferencia ISO 9001?
              </h4>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Únete a más de 200 clientes satisfechos que han confiado en nuestra 
                certificación ISO 9001 para sus proyectos más importantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Solicitar Propuesta
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open('/portfolio', '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Casos de Éxito
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}