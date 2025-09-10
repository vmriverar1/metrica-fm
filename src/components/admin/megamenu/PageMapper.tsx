'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search,
  ExternalLink,
  Home,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast-simple';

interface PageMapping {
  key: string;
  exists: boolean;
  path: string;
  title: string;
  last_checked: string;
  status_code?: number;
  response_time?: number;
  error_message?: string;
}

interface PageMapperProps {
  mappings: Record<string, PageMapping>;
  onMappingsUpdate: (mappings: Record<string, PageMapping>) => void;
  className?: string;
}

const PageMapper: React.FC<PageMapperProps> = ({
  mappings,
  onMappingsUpdate,
  className
}) => {
  const [checking, setChecking] = useState<Set<string>>(new Set());
  const [checkingAll, setCheckingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'exists' | 'broken' | 'unchecked'>('all');

  // Simular verificación de página interna
  const checkInternalPage = async (path: string): Promise<{ exists: boolean; status_code?: number; response_time?: number; error?: string }> => {
    const startTime = Date.now();
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      // Páginas que sabemos que existen
      const existingPages = [
        '/',
        '/nosotros', 
        '/servicios',
        '/servicios/supervision',
        '/servicios/consultoria',
        '/servicios/gestion',
        '/portafolio',
        '/portafolio/destacados',
        '/portafolio/casos-exito',
        '/contacto',
        '/blog',
        '/carreras'
      ];
      
      const exists = existingPages.includes(path);
      const responseTime = Date.now() - startTime;
      
      if (exists) {
        return {
          exists: true,
          status_code: 200,
          response_time: responseTime
        };
      } else {
        return {
          exists: false,
          status_code: 404,
          response_time: responseTime,
          error: 'Página no encontrada'
        };
      }
    } catch (error) {
      return {
        exists: false,
        status_code: 500,
        response_time: Date.now() - startTime,
        error: 'Error de conexión'
      };
    }
  };

  const checkSinglePage = async (key: string, mapping: PageMapping) => {
    setChecking(prev => new Set([...prev, key]));
    
    try {
      const result = await checkInternalPage(mapping.path);
      
      const updatedMapping: PageMapping = {
        ...mapping,
        exists: result.exists,
        last_checked: new Date().toISOString(),
        status_code: result.status_code,
        response_time: result.response_time,
        error_message: result.error
      };
      
      const updatedMappings = {
        ...mappings,
        [key]: updatedMapping
      };
      
      onMappingsUpdate(updatedMappings);
      
      toast({
        title: result.exists ? "Página verificada" : "Página no encontrada",
        description: `${mapping.path} - ${result.status_code} (${result.response_time}ms)`,
        variant: result.exists ? "default" : "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: `No se pudo verificar ${mapping.path}`,
        variant: "destructive"
      });
    } finally {
      setChecking(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const checkAllPages = async () => {
    setCheckingAll(true);
    const keys = Object.keys(mappings);
    
    try {
      // Verificar páginas en lotes para no sobrecargar
      const batchSize = 3;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (key) => {
            await checkSinglePage(key, mappings[key]);
            // Pequeño delay entre verificaciones
            await new Promise(resolve => setTimeout(resolve, 200));
          })
        );
      }
      
      toast({
        title: "Verificación completa",
        description: `Se verificaron ${keys.length} páginas`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Error durante la verificación masiva",
        variant: "destructive"
      });
    } finally {
      setCheckingAll(false);
    }
  };

  const getFilteredMappings = () => {
    let filtered = Object.entries(mappings);
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(([key, mapping]) =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de estado
    switch (filter) {
      case 'exists':
        filtered = filtered.filter(([_, mapping]) => mapping.exists);
        break;
      case 'broken':
        filtered = filtered.filter(([_, mapping]) => !mapping.exists && mapping.last_checked);
        break;
      case 'unchecked':
        filtered = filtered.filter(([_, mapping]) => !mapping.last_checked);
        break;
    }
    
    return filtered;
  };

  const getStatusIcon = (mapping: PageMapping) => {
    if (!mapping.last_checked) {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
    
    if (mapping.exists) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (mapping.status_code === 404) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (mapping: PageMapping) => {
    if (!mapping.last_checked) {
      return <Badge variant="secondary">Sin verificar</Badge>;
    }
    
    if (mapping.exists) {
      return <Badge variant="default">Activa</Badge>;
    } else {
      return <Badge variant="destructive">Error {mapping.status_code}</Badge>;
    }
  };

  const stats = {
    total: Object.keys(mappings).length,
    exists: Object.values(mappings).filter(m => m.exists).length,
    broken: Object.values(mappings).filter(m => !m.exists && m.last_checked).length,
    unchecked: Object.values(mappings).filter(m => !m.last_checked).length
  };

  const filteredMappings = getFilteredMappings();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Mapeo de Páginas Internas
                <Badge variant="outline">{stats.total} páginas</Badge>
              </CardTitle>
              <CardDescription>
                Gestión y verificación de páginas internas del sitio web
              </CardDescription>
            </div>
            <Button 
              onClick={checkAllPages} 
              disabled={checkingAll}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkingAll ? 'animate-spin' : ''}`} />
              {checkingAll ? 'Verificando...' : 'Verificar Todas'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.exists}</div>
              <div className="text-sm text-green-600">Activas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.broken}</div>
              <div className="text-sm text-red-600">Rotas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.unchecked}</div>
              <div className="text-sm text-gray-600">Sin verificar</div>
            </div>
          </div>

          {/* Barra de progreso de salud */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Salud del sitio</span>
              <span>{stats.total > 0 ? Math.round((stats.exists / stats.total) * 100) : 0}% activas</span>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.exists / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>

          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
                <TabsTrigger value="exists">Activas ({stats.exists})</TabsTrigger>
                <TabsTrigger value="broken">Rotas ({stats.broken})</TabsTrigger>
                <TabsTrigger value="unchecked">Sin verificar ({stats.unchecked})</TabsTrigger>
              </TabsList>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar páginas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value={filter} className="space-y-3 mt-6">
              {filteredMappings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron páginas que coincidan con los filtros</p>
                </div>
              ) : (
                filteredMappings.map(([key, mapping]) => (
                  <Card key={key} className="transition-all hover:shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(mapping)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{mapping.title}</h4>
                              {getStatusBadge(mapping)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                <code className="bg-gray-100 px-1 rounded text-xs">{mapping.path}</code>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span>Mapeo:</span>
                                <code className="bg-blue-100 px-1 rounded text-xs">{key}</code>
                              </div>
                              
                              {mapping.last_checked && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(mapping.last_checked).toLocaleString()}</span>
                                </div>
                              )}
                              
                              {mapping.response_time && (
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  <span>{mapping.response_time}ms</span>
                                </div>
                              )}
                            </div>
                            
                            {mapping.error_message && (
                              <p className="text-xs text-red-600 mt-1">{mapping.error_message}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkSinglePage(key, mapping)}
                            disabled={checking.has(key)}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${checking.has(key) ? 'animate-spin' : ''}`} />
                            {checking.has(key) ? 'Verificando...' : 'Verificar'}
                          </Button>
                          
                          {mapping.exists && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(mapping.path, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageMapper;