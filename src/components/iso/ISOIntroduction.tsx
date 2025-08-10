'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Users, 
  Zap, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Building2,
  Award,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { currentCertification } from '@/data/iso-sample';
import { cn } from '@/lib/utils';

const benefits = [
  {
    icon: Shield,
    title: 'Garantía de Calidad',
    description: 'Procesos estandarizados y documentados que aseguran la consistencia en cada proyecto.',
    color: 'text-blue-600'
  },
  {
    icon: Target,
    title: 'Enfoque al Cliente',
    description: 'Sistema centrado en superar las expectativas de nuestros clientes en cada entrega.',
    color: 'text-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Mejora Continua',
    description: 'Cultura organizacional orientada a la optimización constante de nuestros procesos.',
    color: 'text-purple-600'
  },
  {
    icon: Users,
    title: 'Equipo Competente',
    description: 'Personal calificado y en constante capacitación para brindar servicios excepcionales.',
    color: 'text-orange-600'
  }
];

const scopeItems = [
  'Dirección integral de proyectos de construcción',
  'Gestión de proyectos de infraestructura',
  'Supervisión y control de obras',
  'Consultoría en construcción'
];

const whyImportant = [
  {
    icon: Building2,
    title: 'Sector Construcción',
    description: 'La industria de la construcción requiere estándares rigurosos para garantizar seguridad, calidad y cumplimiento normativo.',
    stats: '85% de clientes prefieren empresas certificadas'
  },
  {
    icon: Globe,
    title: 'Estándar Internacional',
    description: 'ISO 9001 es reconocido mundialmente como la norma de referencia para sistemas de gestión de calidad.',
    stats: '1M+ organizaciones certificadas globalmente'
  },
  {
    icon: Award,
    title: 'Competitividad',
    description: 'La certificación nos posiciona como líder en calidad frente a la competencia en el mercado peruano.',
    stats: '40% mayor confianza del mercado'
  }
];

export default function ISOIntroduction() {
  return (
    <section className="py-20 bg-muted/30">
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
            Sistema de Gestión de Calidad
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            ¿Qué es <span className="text-primary">ISO 9001</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            ISO 9001:2015 es el estándar internacional para sistemas de gestión de calidad, 
            que nos permite demostrar nuestra capacidad de proporcionar servicios que 
            satisfacen consistentemente los requisitos del cliente y las regulaciones aplicables.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          
          {/* Left Column - Why Important */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-8 text-foreground">
              ¿Por qué es importante en construcción?
            </h3>
            
            <div className="space-y-6">
              {whyImportant.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="border-l-4 border-l-primary bg-background hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <item.icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                          <p className="text-muted-foreground mb-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="text-sm font-medium text-primary">
                            {item.stats}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Scope & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Certification Scope */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Alcance de Nuestra Certificación
              </h3>
              
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {scopeItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <div className="text-sm text-muted-foreground">
                      <strong>Certificado por:</strong> {currentCertification.certifyingBody}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Vigencia:</strong> {currentCertification.expiryDate.toLocaleDateString('es-PE')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-foreground text-background">
                <CardContent className="p-6 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        7
                      </div>
                      <div className="text-sm opacity-80">
                        Años Certificados
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        100%
                      </div>
                      <div className="text-sm opacity-80">
                        Conformidad Auditorías
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Beneficios para Nuestros Clientes
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La certificación ISO 9001 se traduce en ventajas concretas para cada proyecto que gestionamos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-background border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className={cn(
                        "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-muted group-hover:bg-primary/10"
                      )}>
                        <benefit.icon className={cn("w-8 h-8 transition-colors duration-300", benefit.color)} />
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h4>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold mb-4">
                ¿Quieres conocer más sobre nuestros procesos de calidad?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    document.getElementById('process-map')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Ver Procesos de Calidad
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Descargar Política de Calidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}