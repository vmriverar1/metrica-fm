'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Cog, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qualityProcesses } from '@/data/iso-sample';
import { getProcessCategoryLabel } from '@/types/iso';
import { cn } from '@/lib/utils';

const processCategories = [
  {
    id: 'strategic',
    label: 'Estratégicos',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Procesos que definen la dirección y objetivos de la organización'
  },
  {
    id: 'operational',
    label: 'Operativos',
    icon: Cog,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Procesos que agregan valor directo al cliente'
  },
  {
    id: 'support',
    label: 'Soporte',
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Procesos que brindan soporte a las operaciones principales'
  },
  {
    id: 'improvement',
    label: 'Mejora',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Procesos enfocados en la mejora continua del sistema'
  }
];

const systemPrinciples = [
  {
    icon: Eye,
    title: 'Enfoque al Cliente',
    description: 'Comprender y satisfacer las necesidades actuales y futuras de los clientes.',
    metric: '98% satisfacción'
  },
  {
    icon: Shield,
    title: 'Liderazgo',
    description: 'La dirección establece unidad de propósito y dirección de la organización.',
    metric: '100% compromiso'
  },
  {
    icon: Users,
    title: 'Participación del Personal',
    description: 'El personal competente y comprometido es esencial para la organización.',
    metric: '92% competencia'
  },
  {
    icon: Settings,
    title: 'Enfoque Basado en Procesos',
    description: 'Los resultados se alcanzan más eficientemente con un enfoque por procesos.',
    metric: '45 procesos'
  },
  {
    icon: RefreshCw,
    title: 'Mejora Continua',
    description: 'La mejora continua del desempeño global debe ser un objetivo permanente.',
    metric: '23 proyectos'
  },
  {
    icon: BarChart3,
    title: 'Toma de Decisiones Basada en Evidencia',
    description: 'Las decisiones eficaces se basan en el análisis de datos e información.',
    metric: '100% conformidad'
  }
];

export default function QualitySystem() {
  const [selectedCategory, setSelectedCategory] = useState('strategic');
  const [hoveredPrinciple, setHoveredPrinciple] = useState<number | null>(null);

  const filteredProcesses = qualityProcesses.filter(
    process => process.category === selectedCategory
  );

  return (
    <section className="py-20 bg-background">
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
            Gestión de Calidad
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Nuestro Sistema de <span className="text-primary">Gestión de Calidad</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Un sistema integral basado en procesos que garantiza la excelencia en cada proyecto, 
            desde la planificación hasta la entrega final.
          </p>
        </motion.div>

        {/* Quality Principles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-semibold text-center mb-12">
            Principios de Gestión de Calidad
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemPrinciples.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                onMouseEnter={() => setHoveredPrinciple(index)}
                onMouseLeave={() => setHoveredPrinciple(null)}
                className="group"
              >
                <Card className={cn(
                  "h-full transition-all duration-300 cursor-pointer",
                  "hover:shadow-lg hover:border-primary/30",
                  hoveredPrinciple === index && "border-primary/50 shadow-lg"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                        hoveredPrinciple === index ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <principle.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {principle.title}
                        </h4>
                        <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                          {principle.description}
                        </p>
                        <div className="text-sm font-medium text-primary">
                          {principle.metric}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-3xl font-semibold text-center mb-12">
            Procesos Certificados
          </h3>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            {/* Category Tabs */}
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1 bg-muted">
                {processCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <category.icon className={cn(
                      "w-6 h-6 transition-colors",
                      selectedCategory === category.id ? category.color : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Category Description */}
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {processCategories.find(cat => cat.id === selectedCategory)?.description}
              </p>
            </motion.div>

            {/* Process Cards */}
            {processCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {filteredProcesses.map((process, index) => (
                      <motion.div
                        key={process.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <Card className={cn(
                          "h-full border-l-4 hover:shadow-lg transition-all duration-300",
                          category.borderColor
                        )}>
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xl font-semibold mb-2">
                                  {process.name}
                                </h4>
                                <Badge className={cn(
                                  "text-xs",
                                  category.bgColor,
                                  category.color,
                                  category.borderColor
                                )}>
                                  {getProcessCategoryLabel(process.category)}
                                </Badge>
                              </div>
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                category.bgColor
                              )}>
                                <category.icon className={cn("w-5 h-5", category.color)} />
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                              {process.description}
                            </p>
                            
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Responsable:</h5>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-muted-foreground">{process.owner}</span>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-sm mb-2">Entradas Clave:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {process.inputs.slice(0, 2).map((input, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {input}
                                    </Badge>
                                  ))}
                                  {process.inputs.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{process.inputs.length - 2} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-sm mb-2">Salidas Principales:</h5>
                                <div className="space-y-1">
                                  {process.outputs.slice(0, 2).map((output, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                                      <span className="text-xs text-muted-foreground">{output}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center pt-4 border-t border-border">
                                <div className="text-xs text-muted-foreground">
                                  Próxima revisión: {process.nextReview.toLocaleDateString('es-PE')}
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  Ver más
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                    {/* Empty state if no processes */}
                    {filteredProcesses.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-2 text-center py-12"
                      >
                        <div className="text-muted-foreground">
                          <Cog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No hay procesos disponibles en esta categoría</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* System Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">45</div>
                  <div className="text-sm text-muted-foreground">Procesos Documentados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Auditorías Completadas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Conformidad</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">7</div>
                  <div className="text-sm text-muted-foreground">Años de Experiencia ISO</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                document.getElementById('process-map')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Ver Mapa de Procesos Interactivo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Descargar Manual de Calidad
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}