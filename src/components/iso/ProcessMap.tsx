'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Cog, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Eye,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qualityProcesses } from '@/data/iso-sample';
import { QualityProcess, ProcessStatus } from '@/types/iso';
import { cn } from '@/lib/utils';

// Process map data structure
const processMapData = {
  strategic: {
    id: 'strategic',
    title: 'Procesos Estratégicos',
    color: 'blue',
    position: { x: 20, y: 10 },
    size: { width: 60, height: 20 },
    processes: qualityProcesses.filter(p => p.category === 'strategic')
  },
  operational: {
    id: 'operational', 
    title: 'Procesos Operativos',
    color: 'green',
    position: { x: 20, y: 45 },
    size: { width: 60, height: 30 },
    processes: qualityProcesses.filter(p => p.category === 'operational')
  },
  support: {
    id: 'support',
    title: 'Procesos de Soporte',
    color: 'orange',
    position: { x: 20, y: 85 },
    size: { width: 60, height: 20 },
    processes: qualityProcesses.filter(p => p.category === 'support')
  },
  improvement: {
    id: 'improvement',
    title: 'Procesos de Mejora',
    color: 'purple',
    position: { x: 85, y: 30 },
    size: { width: 12, height: 50 },
    processes: qualityProcesses.filter(p => p.category === 'improvement')
  }
};

// Flow connections between processes
const processFlows = [
  { from: 'strategic', to: 'operational', type: 'direct' },
  { from: 'support', to: 'operational', type: 'support' },
  { from: 'operational', to: 'improvement', type: 'feedback' },
  { from: 'improvement', to: 'strategic', type: 'improvement' }
];

const statusConfig = {
  active: { color: 'text-green-600', bg: 'bg-green-100', label: 'Activo' },
  review: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En Revisión' },
  inactive: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Inactivo' }
};

interface ProcessMapProps {
  id?: string;
}

export default function ProcessMap({ id = "process-map" }: ProcessMapProps) {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [hoveredProcess, setHoveredProcess] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlows, setShowFlows] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const mapRef = useRef<HTMLDivElement>(null);

  // Auto-play animation cycle
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef<number>();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (autoPlay) {
      const categories = Object.keys(processMapData);
      let currentIndex = 0;

      const cycle = () => {
        setSelectedProcess(categories[currentIndex]);
        currentIndex = (currentIndex + 1) % categories.length;
        autoPlayRef.current = window.setTimeout(cycle, 3000);
      };

      autoPlayRef.current = window.setTimeout(cycle, 1000);
    } else {
      if (autoPlayRef.current) {
        window.clearTimeout(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        window.clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay]);

  const getProcessColor = (category: string) => {
    const colors = {
      strategic: 'blue',
      operational: 'green', 
      support: 'orange',
      improvement: 'purple'
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const getProcessCount = (category: string) => {
    return processMapData[category as keyof typeof processMapData]?.processes.length || 0;
  };

  const renderFlowArrow = (from: string, to: string, type: string) => {
    const fromData = processMapData[from as keyof typeof processMapData];
    const toData = processMapData[to as keyof typeof processMapData];
    
    if (!fromData || !toData) return null;

    const arrowStyle = {
      direct: 'text-blue-500',
      support: 'text-orange-500', 
      feedback: 'text-purple-500',
      improvement: 'text-green-500'
    };

    return (
      <motion.div
        key={`${from}-${to}`}
        className={cn(
          "absolute flex items-center justify-center pointer-events-none",
          arrowStyle[type as keyof typeof arrowStyle]
        )}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showFlows ? 0.7 : 0,
          scale: showFlows ? 1 : 0
        }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{
          left: `${(fromData.position.x + toData.position.x) / 2}%`,
          top: `${(fromData.position.y + toData.position.y) / 2}%`,
        }}
      >
        <motion.div
          animate={{ 
            rotateZ: isAnimating ? 360 : 0,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotateZ: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          {type === 'direct' && <ArrowRight className="w-6 h-6" />}
          {type === 'support' && <ArrowUpRight className="w-6 h-6" />}
          {type === 'feedback' && <ArrowDown className="w-6 h-6" />}
          {type === 'improvement' && <RefreshCw className="w-6 h-6" />}
        </motion.div>
      </motion.div>
    );
  };

  const selectedProcessData = selectedProcess ? processMapData[selectedProcess as keyof typeof processMapData] : null;

  return (
    <section id={id} className="py-20 bg-background">
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
            Mapa de Procesos Interactivo
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Sistema de <span className="text-primary">Gestión por Procesos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Visualización interactiva de nuestro sistema integrado de gestión de calidad 
            según la norma ISO 9001:2015, mostrando las interrelaciones entre procesos.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-2">
            <Button
              variant={autoPlay ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-2"
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoPlay ? 'Pausar' : 'Auto Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProcess(null);
                setAutoPlay(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFlows ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFlows(!showFlows)}
            >
              <Zap className="w-4 h-4 mr-2" />
              {showFlows ? 'Ocultar Flujos' : 'Mostrar Flujos'}
            </Button>
            <Button
              variant={viewMode === 'detailed' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              {viewMode === 'overview' ? 'Vista Detallada' : 'Vista General'}
            </Button>
          </div>
        </motion.div>

        {/* Interactive Process Map */}
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* Process Map Visualization */}
          <div className="lg:col-span-2">
            <motion.div
              ref={mapRef}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-8 min-h-[600px] overflow-hidden"
            >
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" 
                     style={{
                       backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(var(--primary)) 1px, transparent 0)',
                       backgroundSize: '20px 20px'
                     }} 
                />
              </div>

              {/* Process Categories */}
              {Object.entries(processMapData).map(([key, data]) => (
                <motion.div
                  key={key}
                  className={cn(
                    "absolute cursor-pointer transition-all duration-300",
                    selectedProcess === key && "z-10"
                  )}
                  style={{
                    left: `${data.position.x}%`,
                    top: `${data.position.y}%`,
                    width: `${data.size.width}%`,
                    height: `${data.size.height}%`,
                  }}
                  onMouseEnter={() => setHoveredProcess(key)}
                  onMouseLeave={() => setHoveredProcess(null)}
                  onClick={() => setSelectedProcess(selectedProcess === key ? null : key)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  animate={{
                    scale: selectedProcess === key ? 1.05 : 1,
                    y: selectedProcess === key ? -4 : 0
                  }}
                >
                  <Card className={cn(
                    "h-full border-2 transition-all duration-300",
                    selectedProcess === key 
                      ? "border-primary shadow-2xl shadow-primary/20" 
                      : hoveredProcess === key 
                        ? "border-primary/50 shadow-lg"
                        : "border-border hover:border-primary/30"
                  )}>
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className="text-center">
                        <div className={cn(
                          "w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 transition-colors",
                          selectedProcess === key 
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}>
                          {key === 'strategic' && <Target className="w-6 h-6" />}
                          {key === 'operational' && <Cog className="w-6 h-6" />}
                          {key === 'support' && <Users className="w-6 h-6" />}
                          {key === 'improvement' && <TrendingUp className="w-6 h-6" />}
                        </div>
                        
                        <h3 className={cn(
                          "font-semibold mb-2 transition-colors",
                          selectedProcess === key ? "text-primary" : "text-foreground"
                        )}>
                          {data.title}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getProcessCount(key)} procesos
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Flow Arrows */}
              {processFlows.map(({ from, to, type }) => 
                renderFlowArrow(from, to, type)
              )}

              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 border"
              >
                <h4 className="font-semibold text-sm mb-3">Leyenda</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                    <span>Flujo Directo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-3 h-3 text-orange-500" />
                    <span>Soporte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-3 h-3 text-purple-500" />
                    <span>Retroalimentación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-green-500" />
                    <span>Mejora</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Process Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Información del Proceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {selectedProcessData ? (
                    <motion.div
                      key={selectedProcess}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-lg font-semibold mb-2 text-primary">
                          {selectedProcessData.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedProcessData.processes.length} procesos certificados
                        </p>
                      </div>

                      <div className="space-y-4">
                        {selectedProcessData.processes.slice(0, viewMode === 'detailed' ? undefined : 3).map((process, index) => (
                          <motion.div
                            key={process.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="border border-border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm">{process.name}</h5>
                              <Badge 
                                className={cn(
                                  "text-xs",
                                  statusConfig.active.bg,
                                  statusConfig.active.color
                                )}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {statusConfig.active.label}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3">
                              {process.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{process.owner}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Rev. {process.nextReview.toLocaleDateString('es-PE')}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {viewMode === 'overview' && selectedProcessData.processes.length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setViewMode('detailed')}
                          >
                            Ver {selectedProcessData.processes.length - 3} procesos más
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Selecciona un proceso en el mapa para ver sus detalles
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAutoPlay(true)}
                      >
                        <Play className="w-3 h-3 mr-2" />
                        Iniciar Tour Automático
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Estadísticas del Sistema</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{qualityProcesses.length}</div>
                    <div className="text-xs text-muted-foreground">Procesos Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4</div>
                    <div className="text-xs text-muted-foreground">Categorías</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">Certificados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Auditorías</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Process Category Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(processMapData).map(([key, data]) => (
              <Card 
                key={key}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg",
                  selectedProcess === key && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedProcess(selectedProcess === key ? null : key)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {key === 'strategic' && <Target className="w-6 h-6 text-primary" />}
                    {key === 'operational' && <Cog className="w-6 h-6 text-primary" />}
                    {key === 'support' && <Users className="w-6 h-6 text-primary" />}
                    {key === 'improvement' && <TrendingUp className="w-6 h-6 text-primary" />}
                  </div>
                  <h4 className="font-semibold mb-2">{data.title}</h4>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {getProcessCount(key)}
                  </div>
                  <div className="text-sm text-muted-foreground">procesos</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold mb-4">
                ¿Quieres conocer más sobre nuestros procesos?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  <FileText className="w-4 h-4 mr-2" />
                  Descargar Manual de Procesos
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Métricas de Desempeño
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