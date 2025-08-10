'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  TrendingUp,
  FileCheck,
  Users,
  Target,
  ChevronRight,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { certificationTimeline } from '@/data/iso-sample';
import { cn } from '@/lib/utils';

const eventTypeConfig = {
  initial_certification: {
    icon: Award,
    label: 'Certificación Inicial',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  recertification: {
    icon: Shield,
    label: 'Recertificación',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  surveillance_audit: {
    icon: FileCheck,
    label: 'Auditoría de Seguimiento',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200'
  },
  scope_extension: {
    icon: TrendingUp,
    label: 'Ampliación de Alcance',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200'
  }
};

const statusConfig = {
  completed: {
    icon: CheckCircle,
    label: 'Completado',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  scheduled: {
    icon: Clock,
    label: 'Programado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  in_progress: {
    icon: AlertTriangle,
    label: 'En Progreso',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  }
};

const outcomeConfig = {
  certificate_issued: {
    label: 'Certificado Emitido',
    color: 'text-green-700',
    icon: Award
  },
  certificate_maintained: {
    label: 'Certificado Mantenido',
    color: 'text-blue-700',
    icon: Shield
  },
  minor_findings: {
    label: 'Hallazgos Menores',
    color: 'text-yellow-700',
    icon: AlertTriangle
  },
  major_findings: {
    label: 'Hallazgos Mayores',
    color: 'text-red-700',
    icon: AlertTriangle
  }
};

export default function CertificationTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to timeline progress
  const timelineProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // Sort timeline by year
  const sortedTimeline = [...certificationTimeline].sort((a, b) => a.year - b.year);
  
  const currentYear = new Date().getFullYear();
  const completedEvents = sortedTimeline.filter(event => event.status === 'completed');
  const upcomingEvents = sortedTimeline.filter(event => event.status !== 'completed');

  return (
    <section className="py-20 bg-muted/30" ref={containerRef}>
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
            Historia de Certificación
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Cronología de <span className="text-primary">Certificación ISO</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Desde 2018, hemos mantenido consistentemente nuestros estándares de calidad 
            a través de auditorías regulares y procesos de mejora continua.
          </p>
        </motion.div>

        {/* Timeline Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">7</div>
              <div className="text-sm text-muted-foreground">Años Certificados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">8</div>
              <div className="text-sm text-muted-foreground">Eventos Completados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Éxito en Auditorías</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">2027</div>
              <div className="text-sm text-muted-foreground">Vigencia Hasta</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border">
            <motion.div
              className="absolute top-0 left-0 w-full bg-primary origin-top"
              style={{ 
                scaleY: useTransform(scrollYProgress, [0, 0.8], [0, 1]),
                height: '100%'
              }}
            />
          </div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {sortedTimeline.map((event, index) => {
              const eventConfig = eventTypeConfig[event.event];
              const statusDetails = statusConfig[event.status];
              const outcomeDetails = event.outcome ? outcomeConfig[event.outcome] : null;
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="relative flex items-start gap-8"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      className={cn(
                        "w-16 h-16 rounded-full border-4 border-background flex items-center justify-center shadow-lg",
                        eventConfig.bgColor
                      )}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <eventConfig.icon className={cn("w-7 h-7", eventConfig.color)} />
                    </motion.div>
                    
                    {/* Connection Line */}
                    {index < sortedTimeline.length - 1 && (
                      <div className="absolute top-16 left-1/2 w-0.5 h-8 bg-border transform -translate-x-1/2" />
                    )}
                  </div>

                  {/* Event Card */}
                  <motion.div
                    className="flex-1 pb-8"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "border-l-4 transition-all duration-300 hover:shadow-lg",
                      eventConfig.borderColor,
                      event.status === 'scheduled' && "border-dashed"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={cn("text-xs", eventConfig.bgColor, eventConfig.color)}>
                                {eventConfig.label}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", statusDetails.bgColor, statusDetails.color)}
                              >
                                <statusDetails.icon className="w-3 h-3 mr-1" />
                                {statusDetails.label}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {event.year} - {eventConfig.label}
                            </h3>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {event.year}
                            </div>
                            {event.year === currentYear && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mt-1">
                                <Star className="w-3 h-3 mr-1" />
                                Actual
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Ente Certificador:</span>
                            <span>{event.certifyingBody}</span>
                          </div>
                          
                          {outcomeDetails && (
                            <div className="flex items-center gap-2 text-sm">
                              <outcomeDetails.icon className={cn("w-4 h-4", outcomeDetails.color)} />
                              <span className="font-medium">Resultado:</span>
                              <span className={outcomeDetails.color}>{outcomeDetails.label}</span>
                            </div>
                          )}
                          
                          {event.validUntil && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Válido hasta:</span>
                              <span>{event.validUntil.toLocaleDateString('es-PE')}</span>
                            </div>
                          )}
                          
                          {event.notes && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress Indicator for Future Events */}
                        {event.status === 'scheduled' && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Programado para Q2 2025</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons for Completed Events */}
                        {event.status === 'completed' && event.outcome === 'certificate_issued' && (
                          <div className="mt-4 pt-4 border-t border-border flex justify-end">
                            <motion.button
                              whileHover={{ x: 5 }}
                              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              Ver certificado
                              <ChevronRight className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">
                  Compromiso Continuo con la Calidad
                </h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                  Nuestra trayectoria de 7 años manteniendo la certificación ISO 9001 
                  demuestra nuestro compromiso inquebrantable con la excelencia operativa 
                  y la satisfacción del cliente.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-primary font-semibold mb-1">
                      Próxima Auditoría
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      Q2 2025
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary font-semibold mb-1">
                      Certificación Vigente
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      Hasta 2027
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary font-semibold mb-1">
                      Historial de Éxito
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      100%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}