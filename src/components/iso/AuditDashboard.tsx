'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Building2,
  Target,
  ArrowRight,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertCircle,
  Eye,
  Plus,
  Search,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { auditRecords } from '@/data/iso-sample';
import { AuditRecord, AuditType, AuditResult } from '@/types/iso';
import { cn } from '@/lib/utils';

// Dashboard metrics calculations
const calculateMetrics = (audits: AuditRecord[]) => {
  const currentYear = new Date().getFullYear();
  const currentYearAudits = audits.filter(audit => audit.date.getFullYear() === currentYear);
  const lastYearAudits = audits.filter(audit => audit.date.getFullYear() === currentYear - 1);
  
  const totalAudits = currentYearAudits.length;
  const completedAudits = currentYearAudits.filter(audit => audit.result !== undefined).length;
  const pendingAudits = totalAudits - completedAudits;
  
  const conformityRate = completedAudits > 0 ? 
    (currentYearAudits.filter(audit => audit.result === 'conformity').length / completedAudits) * 100 : 0;
  
  const minorFindings = currentYearAudits.filter(audit => audit.result === 'minor_findings').length;
  const majorFindings = currentYearAudits.filter(audit => audit.result === 'major_findings').length;
  
  const yearOverYearChange = lastYearAudits.length > 0 ? 
    ((totalAudits - lastYearAudits.length) / lastYearAudits.length) * 100 : 0;

  return {
    totalAudits,
    completedAudits,
    pendingAudits,
    conformityRate,
    minorFindings,
    majorFindings,
    yearOverYearChange
  };
};

const auditTypeConfig = {
  internal: {
    label: 'Auditoría Interna',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    icon: Building2
  },
  external: {
    label: 'Auditoría Externa',
    color: 'text-green-600', 
    bg: 'bg-green-100',
    border: 'border-green-200',
    icon: Shield
  },
  surveillance: {
    label: 'Auditoría de Seguimiento',
    color: 'text-purple-600',
    bg: 'bg-purple-100', 
    border: 'border-purple-200',
    icon: Eye
  },
  recertification: {
    label: 'Recertificación',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    icon: Award
  }
};

const auditResultConfig = {
  conformity: {
    label: 'Conformidad',
    color: 'text-green-600',
    bg: 'bg-green-100',
    icon: CheckCircle
  },
  minor_findings: {
    label: 'Hallazgos Menores',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100', 
    icon: AlertTriangle
  },
  major_findings: {
    label: 'Hallazgos Mayores',
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: XCircle
  },
  non_conformity: {
    label: 'No Conformidad',
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: XCircle
  }
};

interface AuditScopeBadgeProps {
  scope: string[];
}

const AuditScopeBadges: React.FC<AuditScopeBadgeProps> = ({ scope }) => (
  <>
    {scope.map((item, idx) => (
      <Badge key={idx} variant="outline" className="text-xs">
        {item}
      </Badge>
    ))}
  </>
);

export default function AuditDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | AuditType>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'currentYear' | 'lastYear' | 'allTime'>('currentYear');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = calculateMetrics(auditRecords);

  // Filter audits based on current selections
  const filteredAudits = auditRecords.filter(audit => {
    const matchesFilter = selectedFilter === 'all' || audit.type === selectedFilter;
    const matchesSearch = audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.scope.some(scope => scope.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTimeframe = true;
    const currentYear = new Date().getFullYear();
    if (selectedTimeframe === 'currentYear') {
      matchesTimeframe = audit.date.getFullYear() === currentYear;
    } else if (selectedTimeframe === 'lastYear') {
      matchesTimeframe = audit.date.getFullYear() === currentYear - 1;
    }
    
    return matchesFilter && matchesSearch && matchesTimeframe;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // Simulated data refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

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
            Dashboard de Auditorías
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Sistema de <span className="text-primary">Monitoreo de Auditorías</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Seguimiento en tiempo real de nuestras auditorías internas y externas, 
            con métricas de desempeño y análisis de conformidad.
          </p>
        </motion.div>

        {/* Dashboard Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-between items-center gap-4 mb-12"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar auditorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="currentYear">Año Actual</option>
              <option value="lastYear">Año Pasado</option>
              <option value="allTime">Todos los Años</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </motion.div>

        {/* Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {metrics.yearOverYearChange > 0 ? '+' : ''}{metrics.yearOverYearChange.toFixed(1)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{metrics.totalAudits}</div>
              <div className="text-sm text-muted-foreground">Total Auditorías</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {metrics.completedAudits}/{metrics.totalAudits}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{metrics.conformityRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tasa Conformidad</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.minorFindings + metrics.majorFindings} total
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{metrics.minorFindings}</div>
              <div className="text-sm text-muted-foreground">Hallazgos Menores</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <Badge variant={metrics.majorFindings === 0 ? "secondary" : "destructive"} className="text-xs">
                  {metrics.majorFindings === 0 ? 'Excelente' : 'Atención'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{metrics.majorFindings}</div>
              <div className="text-sm text-muted-foreground">Hallazgos Mayores</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Audit List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Tabs */}
            <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="internal">Internas</TabsTrigger>
                <TabsTrigger value="external">Externas</TabsTrigger>
                <TabsTrigger value="surveillance">Seguimiento</TabsTrigger>
                <TabsTrigger value="recertification">Recertificación</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedFilter} className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredAudits.map((audit, index) => {
                      const typeConfig = auditTypeConfig[audit.type];
                      const resultConfig = audit.result ? auditResultConfig[audit.result] : null;
                      
                      return (
                        <motion.div
                          key={audit.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className={cn(
                            "border-l-4 hover:shadow-md transition-shadow",
                            typeConfig.border
                          )}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center",
                                    typeConfig.bg
                                  )}>
                                    <typeConfig.icon className={cn("w-6 h-6", typeConfig.color)} />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <Badge className={cn("text-xs", typeConfig.bg, typeConfig.color)}>
                                        {typeConfig.label}
                                      </Badge>
                                      {resultConfig && (
                                        <Badge className={cn("text-xs", resultConfig.bg, resultConfig.color)}>
                                          <resultConfig.icon className="w-3 h-3 mr-1" />
                                          {resultConfig.label}
                                        </Badge>
                                      )}
                                      {!audit.result && (
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="w-3 h-3 mr-1" />
                                          Pendiente
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <h4 className="font-semibold text-lg mb-1">
                                      Auditoría {audit.date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                                    </h4>
                                    
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{audit.date.toLocaleDateString('es-PE')}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{audit.auditor}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-sm font-medium text-foreground mb-1">
                                    Duración: {audit.duration} días
                                  </div>
                                  {audit.nextFollowUp && (
                                    <div className="text-xs text-muted-foreground">
                                      Seguimiento: {audit.nextFollowUp.toLocaleDateString('es-PE')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Alcance de la Auditoría:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    <AuditScopeBadges scope={audit.scope} />
                                  </div>
                                </div>

                                {audit.findings && audit.findings.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Hallazgos:</h5>
                                    <div className="space-y-1">
                                      {audit.findings.slice(0, 2).map((finding, idx) => (
                                        <div key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                                          {finding}
                                        </div>
                                      ))}
                                      {audit.findings.length > 2 && (
                                        <div className="text-xs text-primary">
                                          +{audit.findings.length - 2} hallazgos adicionales
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-border">
                                  <div className="text-xs text-muted-foreground">
                                    ID: {audit.id}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm">
                                      <FileText className="w-3 h-3 mr-1" />
                                      Ver Reporte
                                    </Button>
                                    {audit.result && (
                                      <Button variant="ghost" size="sm">
                                        <Download className="w-3 h-3 mr-1" />
                                        Certificado
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredAudits.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No se encontraron auditorías con los filtros seleccionados
                      </p>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            
            {/* Conformity Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Meta de Conformidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso Anual</span>
                      <span className="font-medium">{metrics.conformityRate.toFixed(1)}% / 95%</span>
                    </div>
                    <Progress value={metrics.conformityRate} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{metrics.completedAudits}</div>
                      <div className="text-xs text-muted-foreground">Completadas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{metrics.pendingAudits}</div>
                      <div className="text-xs text-muted-foreground">Pendientes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Distribución por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(auditTypeConfig).map(([key, config]) => {
                    const count = filteredAudits.filter(audit => audit.type === key).length;
                    const percentage = filteredAudits.length > 0 ? (count / filteredAudits.length) * 100 : 0;
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", config.bg)} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Auditoría
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Seguimiento
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Datos
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Audits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Próximas Auditorías
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-4">
                    <div className="font-medium text-sm">Auditoría de Seguimiento</div>
                    <div className="text-xs text-muted-foreground">15 de Mayo, 2025</div>
                    <div className="text-xs text-primary">En 3 meses</div>
                  </div>
                  <div className="border-l-2 border-orange-500 pl-4">
                    <div className="font-medium text-sm">Recertificación ISO 9001</div>
                    <div className="text-xs text-muted-foreground">10 de Agosto, 2025</div>
                    <div className="text-xs text-orange-600">En 6 meses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                ¿Necesitas acceso completo al dashboard de auditorías?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  <Shield className="w-4 h-4 mr-2" />
                  Solicitar Acceso
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Documentación
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