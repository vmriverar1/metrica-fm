'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Grid3X3, 
  BarChart3, 
  Compass, 
  Shield, 
  Briefcase, 
  FolderOpen, 
  TrendingUp,
  Zap,
  Settings,
  ExternalLink,
  ArrowRight,
  Eye,
  Activity,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Home,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { ELEMENT_CONFIGS, ElementType } from '@/types/dynamic-elements';
import UniversalCardManager from './UniversalCardManager';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface UnifiedDashboardProps {
  className?: string;
}

export default function UnifiedDashboard({ className = '' }: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState<ElementType>('statistics');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [previewElement, setPreviewElement] = useState<any>(null);
  
  // Hooks para cada tipo de elemento
  const statisticsHook = useDynamicElements('statistics');
  const pillarsHook = useDynamicElements('pillars');
  const policiesHook = useDynamicElements('policies');
  const servicesHook = useDynamicElements('services');
  const projectsHook = useDynamicElements('projects');
  
  // Mapear hooks por tipo
  const hooks = {
    statistics: statisticsHook,
    pillars: pillarsHook,
    policies: policiesHook,
    services: servicesHook,
    projects: projectsHook
  };

  // Obtener iconos por tipo
  const getTypeIcon = (type: ElementType) => {
    switch (type) {
      case 'statistics': return BarChart3;
      case 'pillars': return Compass;
      case 'policies': return Shield;
      case 'services': return Briefcase;
      case 'projects': return FolderOpen;
      default: return Grid3X3;
    }
  };

  // Estadísticas generales mejoradas
  const getDetailedStats = () => {
    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      recentlyUpdated: 0,
      byType: {} as Record<ElementType, {total: number, active: number, lastUpdated?: string}>
    };

    Object.entries(hooks).forEach(([type, hook]) => {
      const total = hook.elements.length;
      const active = hook.elements.filter(el => el.enabled !== false).length;
      const inactive = total - active;
      
      // Encontrar último actualizado
      const lastUpdated = hook.elements
        .filter(el => el.updated_at)
        .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())[0]?.updated_at;

      // Elementos actualizados en los últimos 7 días
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentCount = hook.elements.filter(el => {
        if (!el.updated_at) return false;
        return new Date(el.updated_at) > weekAgo;
      }).length;

      stats.total += total;
      stats.active += active;
      stats.inactive += inactive;
      stats.recentlyUpdated += recentCount;
      stats.byType[type as ElementType] = { total, active, lastUpdated };
    });

    return stats;
  };

  const detailedStats = getDetailedStats();

  // Actividad reciente
  const getRecentActivity = () => {
    const activities: Array<{
      type: ElementType;
      action: string;
      element: any;
      timestamp: Date;
    }> = [];

    Object.entries(hooks).forEach(([type, hook]) => {
      hook.elements.forEach(element => {
        if (element.updated_at) {
          activities.push({
            type: type as ElementType,
            action: element.created_at === element.updated_at ? 'created' : 'updated',
            element,
            timestamp: new Date(element.updated_at)
          });
        }
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  };

  const recentActivity = getRecentActivity();

  // Renderizar preview de elemento
  const renderElementPreview = (element: any, type: ElementType) => {
    const Icon = getTypeIcon(type);
    
    switch (type) {
      case 'statistics':
        return (
          <div className="text-center p-6 border rounded-lg bg-primary/5">
            {element.icon && (
              <div className="mb-4">
                <div className="text-4xl">📊</div>
              </div>
            )}
            <div className="text-3xl font-bold text-primary mb-2">
              {element.value}{element.suffix}
            </div>
            <div className="font-semibold">{element.label}</div>
            <div className="text-sm text-muted-foreground mt-1">{element.description}</div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">{element.title}</div>
                <div className="text-sm text-muted-foreground">
                  {ELEMENT_CONFIGS[type]?.displayName}
                </div>
              </div>
            </div>
            <p className="text-sm">{element.description}</p>
          </div>
        );
    }
  };

  // Formatear fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  // Export/Import functionality
  const exportConfiguration = () => {
    const config = {
      statistics: statisticsHook.elements,
      pillars: pillarsHook.elements,
      policies: policiesHook.elements,
      services: servicesHook.elements,
      projects: projectsHook.elements,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `metrica-dynamic-content-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportConfiguration = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importConfiguration(file);
      }
    };
    input.click();
  };

  const importConfiguration = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        
        // Validate configuration structure
        if (!config.statistics || !config.pillars || !config.policies || !config.services || !config.projects) {
          throw new Error('Archivo de configuración inválido: faltan tipos de elementos requeridos');
        }
        
        // Import elements for each type
        let totalImported = 0;
        
        if (config.statistics?.length > 0) {
          config.statistics.forEach((element: any, index: number) => {
            setTimeout(() => {
              statisticsHook.create({...element, id: `imported-stat-${Date.now()}-${index}`});
              totalImported++;
            }, index * 100);
          });
        }
        
        if (config.pillars?.length > 0) {
          config.pillars.forEach((element: any, index: number) => {
            setTimeout(() => {
              pillarsHook.create({...element, id: `imported-pillar-${Date.now()}-${index}`});
              totalImported++;
            }, index * 100);
          });
        }
        
        if (config.policies?.length > 0) {
          config.policies.forEach((element: any, index: number) => {
            setTimeout(() => {
              policiesHook.create({...element, id: `imported-policy-${Date.now()}-${index}`});
              totalImported++;
            }, index * 100);
          });
        }
        
        if (config.services?.length > 0) {
          config.services.forEach((element: any, index: number) => {
            setTimeout(() => {
              servicesHook.create({...element, id: `imported-service-${Date.now()}-${index}`});
              totalImported++;
            }, index * 100);
          });
        }
        
        if (config.projects?.length > 0) {
          config.projects.forEach((element: any, index: number) => {
            setTimeout(() => {
              projectsHook.create({...element, id: `imported-project-${Date.now()}-${index}`});
              totalImported++;
            }, index * 100);
          });
        }
        
        // Calculate total elements to import
        const totalElements = (config.statistics?.length || 0) + 
                            (config.pillars?.length || 0) + 
                            (config.policies?.length || 0) + 
                            (config.services?.length || 0) + 
                            (config.projects?.length || 0);
        
        // Show success message
        alert(`Configuración importada exitosamente. Se han procesado ${totalElements} elementos.`);
        
      } catch (error) {
        console.error('Error importing configuration:', error);
        alert('Error al importar la configuración: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumbs mejorados */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="flex items-center hover:text-foreground transition-colors">
          <Home className="h-4 w-4 mr-1" />
          Admin
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Gestión de Contenido Dinámico</span>
      </nav>

      {/* Header principal mejorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-8 w-8 text-primary" />
            Dashboard de Contenido Dinámico
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión centralizada de todos los elementos dinámicos del sitio web
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
          >
            {viewMode === 'overview' ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Vista Detallada
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Vista Resumen
              </>
            )}
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Fase 5 - Sistema Unificado
          </Badge>
        </div>
      </div>

      {/* Dashboard de Estadísticas Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elementos</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.total}</div>
            <p className="text-xs text-muted-foreground">
              En todos los tipos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elementos Activos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{detailedStats.active}</div>
            <p className="text-xs text-muted-foreground">
              Visibles en el sitio
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{detailedStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Temporalmente ocultos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actualizados</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{detailedStats.recentlyUpdated}</div>
            <p className="text-xs text-muted-foreground">
              En los últimos 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por tipo mejorado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Tipo de Elemento</CardTitle>
          <CardDescription>
            Estado detallado de cada tipo de contenido dinámico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => {
              const Icon = getTypeIcon(type as ElementType);
              const stats = detailedStats.byType[type as ElementType];
              const hook = hooks[type as ElementType];
              const hasError = hook.error;
              const isLoading = hook.loading;
              
              return (
                <Card 
                  key={type} 
                  className="hover:shadow-md transition-shadow relative group cursor-pointer"
                  onClick={() => setActiveTab(type as ElementType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 relative">
                        <Icon className="h-5 w-5 text-primary" />
                        {hasError && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                        {isLoading && (
                          <RefreshCw className="absolute -top-1 -right-1 w-3 h-3 animate-spin text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{config.pluralName}</h3>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-bold text-lg">{stats?.total || 0}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-lg text-green-600">{stats?.active || 0}</div>
                        <div className="text-xs text-muted-foreground">Activos</div>
                      </div>
                    </div>

                    {stats?.lastUpdated && (
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Último cambio: {formatRelativeTime(new Date(stats.lastUpdated))}
                      </div>
                    )}

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(type as ElementType);
                        }}
                        className="flex-1"
                      >
                        Vista Rápida
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/dynamic-content/${type}`}>
                          Gestión
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimos cambios en los elementos dinámicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = getTypeIcon(activity.type);
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.element.title || activity.element.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action === 'created' ? 'Creado' : 'Actualizado'} en {ELEMENT_CONFIGS[activity.type].pluralName}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accesos rápidos mejorados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Accesos Rápidos
            </CardTitle>
            <CardDescription>
              Herramientas y funciones frecuentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/json-crud/pages/home">
                  <Settings className="h-4 w-4 mr-2" />
                  Editor de Página Principal
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/dynamic-content/statistics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas Mejoradas
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Sitio Web
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={exportConfiguration}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Configuración
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleImportConfiguration}>
                <Upload className="h-4 w-4 mr-2" />
                Importar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión por tipos con vista mejorada */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Elementos</CardTitle>
          <CardDescription>
            Vista rápida y edición de elementos por tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ElementType)}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => {
                const Icon = getTypeIcon(type as ElementType);
                const hook = hooks[type as ElementType];
                const hasError = hook.error;
                
                return (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-2 relative">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.pluralName}</span>
                    {hasError && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => {
              const hook = hooks[type as ElementType];
              
              return (
                <TabsContent key={type} value={type} className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {config.pluralName} ({hook.elements.length})
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/admin/dynamic-content/${type}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Gestor Completo
                      </Link>
                    </Button>
                  </div>

                  {hook.error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{hook.error}</AlertDescription>
                    </Alert>
                  )}

                  <UniversalCardManager
                    elements={hook.elements}
                    elementType={type as ElementType}
                    onAdd={hook.create}
                    onEdit={hook.update}
                    onDelete={hook.delete}
                    onReorder={hook.reorder}
                    loading={hook.loading}
                    error={hook.error}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de preview universal */}
      <Dialog open={!!previewElement} onOpenChange={() => setPreviewElement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa del Elemento</DialogTitle>
            <DialogDescription>
              Así se verá el elemento en el sitio web
            </DialogDescription>
          </DialogHeader>
          {previewElement && (
            <div className="space-y-4">
              {renderElementPreview(previewElement.element, previewElement.type)}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewElement(null)}>
                  Cerrar
                </Button>
                <Button asChild>
                  <Link href={`/admin/dynamic-content/${previewElement.type}`}>
                    Editar Elemento
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}