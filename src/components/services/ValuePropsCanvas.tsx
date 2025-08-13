'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Award,
  DollarSign,
  Leaf,
  Handshake,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface ValueProp {
  id: string;
  icon: React.ReactNode;
  title: string;
  metric: string;
  description: string;
  proofLink: string;
  proofText: string;
  color: string;
  bgColor: string;
}

const valueProps: ValueProp[] = [
  {
    id: 'risk-reduction',
    icon: <Target className="w-8 h-8" />,
    title: 'Reducción de Riesgos',
    metric: '87% menos sobrecostos',
    description: 'Gestión proactiva de riesgos que previene problemas antes de que ocurran',
    proofLink: '/portfolio?highlight=risk-management',
    proofText: 'Ver caso de estudio',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100'
  },
  {
    id: 'execution-speed',
    icon: <Zap className="w-8 h-8" />,
    title: 'Velocidad de Ejecución',
    metric: '30% más rápido',
    description: 'Metodologías optimizadas y equipos especializados para acelerar entrega',
    proofLink: '/blog/casos-estudio?tag=tiempo-optimizado',
    proofText: 'Comparativa de mercado',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-100'
  },
  {
    id: 'quality-guarantee',
    icon: <Award className="w-8 h-8" />,
    title: 'Calidad Garantizada',
    metric: 'ISO 9001 Certificado',
    description: 'Estándares internacionales de calidad en cada fase del proyecto',
    proofLink: '/iso',
    proofText: 'Ver certificación',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-100'
  },
  {
    id: 'roi-optimization',
    icon: <DollarSign className="w-8 h-8" />,
    title: 'ROI Optimizado',
    metric: '25% mayor retorno',
    description: 'Maximización del valor de inversión con estrategias probadas',
    proofLink: '/blog/guias-tecnicas?topic=roi-optimization',
    proofText: 'Análisis financiero',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-100'
  },
  {
    id: 'sustainability',
    icon: <Leaf className="w-8 h-8" />,
    title: 'Sostenibilidad',
    metric: 'LEED Gold/Platinum',
    description: 'Proyectos eco-eficientes que generan valor a largo plazo',
    proofLink: '/portfolio?certification=leed',
    proofText: 'Proyectos verdes',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-100'
  },
  {
    id: 'total-partnership',
    icon: <Handshake className="w-8 h-8" />,
    title: 'Partnership Total',
    metric: '24/7 disponibilidad',
    description: 'Acompañamiento integral desde la concepción hasta post-entrega',
    proofLink: '/about/compromiso',
    proofText: 'Testimonios clientes',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-100'
  }
];

export default function ValuePropsCanvas() {
  return (
    <>
      <SectionTransition variant="fade" />
      
      <section id="value-props" className="py-24 bg-muted/30 relative overflow-hidden">
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
              <TrendingUp className="w-4 h-4" />
              Resultados Comprobables
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Por Qué Nos Eligen
            </motion.h2>
            
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Más que un proveedor de servicios, somos su socio estratégico para el éxito. 
              Cada métrica representa años de experiencia y cientos de proyectos exitosos.
            </motion.p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {valueProps.map((prop, index) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={cn(
                  "relative h-96 rounded-2xl p-8 transition-all duration-500 flex flex-col",
                  "bg-card border-2 cursor-pointer",
                  "hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]",
                  prop.bgColor,
                  "group-hover:border-primary/30"
                )}>
                  {/* Icon Container */}
                  <div className={cn(
                    "mb-6 p-4 rounded-xl transition-all duration-300 w-fit",
                    "bg-white/80 shadow-sm",
                    prop.color,
                    "group-hover:scale-110 group-hover:shadow-lg"
                  )}>
                    {prop.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {prop.title}
                      </h3>
                      
                      <div className="mb-4">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-lg font-bold px-3 py-1.5",
                            prop.color,
                            "bg-white/90"
                          )}
                        >
                          {prop.metric}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {prop.description}
                      </p>
                    </div>

                    {/* Proof Link */}
                    <div className="mt-4 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0",
                          "hover:bg-primary hover:text-primary-foreground",
                          "text-xs"
                        )}
                        onClick={() => window.location.href = prop.proofLink}
                      >
                        {prop.proofText}
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-primary to-accent pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Bar */}
          <motion.div 
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">S/ 2.5B+</div>
                  <div className="text-sm text-muted-foreground">En proyectos gestionados</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">300+</div>
                  <div className="text-sm text-muted-foreground">Proyectos exitosos</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">99%</div>
                  <div className="text-sm text-muted-foreground">Satisfacción del cliente</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Años de experiencia</div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Certificados por las principales organizaciones del sector
                </p>
                <div className="flex items-center justify-center gap-6 opacity-60">
                  <div className="text-xs font-medium">ISO 9001</div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="text-xs font-medium">PMI Certified</div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="text-xs font-medium">LEED Accredited</div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="text-xs font-medium">CAPECO Member</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-6 text-lg">
              ¿Quieres conocer cómo podemos optimizar tu próximo proyecto?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/portfolio'}
                className="px-8"
              >
                Ver Casos de Éxito
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('contact-form')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="px-8"
              >
                Solicitar Consulta
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>
    </>
  );
}