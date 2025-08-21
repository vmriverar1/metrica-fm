'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Zap, 
  Clock, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Archive,
  Settings,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCache } from '@/lib/intelligent-cache';
import type { CacheStats } from '@/lib/intelligent-cache';

interface CacheMonitorProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  showDetailedView?: boolean;
  className?: string;
}

const CacheMonitor: React.FC<CacheMonitorProps> = ({
  isVisible = false,
  onToggleVisibility,
  showDetailedView = false,
  className = ''
}) => {
  const cache = useCache();
  const [stats, setStats] = useState<CacheStats>({
    entries: 0,
    size: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    compressions: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Actualizar estadísticas cada 5 segundos
  useEffect(() => {
    const updateStats = () => {
      setStats(cache.getStats());
    };

    updateStats(); // Actualización inicial
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [cache, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setStats(cache.getStats());
  };

  const handleClearCache = () => {
    if (confirm('¿Estás seguro de limpiar todo el cache? Esto puede afectar el rendimiento temporalmente.')) {
      cache.clear();
      handleRefresh();
    }
  };

  const handleClearHomeCache = () => {
    cache.clearByTag('home');
    handleRefresh();
  };

  const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getHitRateColor = (hitRate: number): string => {
    if (hitRate >= 80) return 'text-green-600';
    if (hitRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHitRateStatus = (hitRate: number): string => {
    if (hitRate >= 80) return 'Excelente';
    if (hitRate >= 60) return 'Bueno';
    if (hitRate >= 40) return 'Regular';
    return 'Necesita optimización';
  };

  // Vista flotante compacta
  if (!showDetailedView) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        {!isVisible ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVisibility}
            className="bg-white shadow-lg"
          >
            <Database className="w-4 h-4 mr-2" />
            Cache
          </Button>
        ) : (
          <Card className="w-64 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Cache Monitor
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="w-6 h-6 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              {/* Hit Rate */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Hit Rate</span>
                  <span className={getHitRateColor(stats.hitRate)}>
                    {stats.hitRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.hitRate} className="h-1" />
                <span className="text-xs text-gray-500">
                  {getHitRateStatus(stats.hitRate)}
                </span>
              </div>

              {/* Entradas y Tamaño */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Entradas</div>
                  <div className="font-medium">{stats.entries}</div>
                </div>
                <div>
                  <div className="text-gray-500">Tamaño</div>
                  <div className="font-medium">{formatSize(stats.size)}</div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHomeCache}
                  className="flex-1 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista detallada para el panel de administración
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Cache Intelligence</h3>
          <p className="text-sm text-gray-600">
            Monitoreo y optimización del sistema de cache
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHomeCache}
            className="text-orange-600 hover:text-orange-700"
          >
            <Archive className="w-4 h-4 mr-2" />
            Limpiar Home
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Todo
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hit Rate</p>
                <p className={`text-lg font-bold ${getHitRateColor(stats.hitRate)}`}>
                  {stats.hitRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <Progress value={stats.hitRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        {/* Entradas en Cache */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Entradas</p>
                <p className="text-lg font-bold text-gray-900">{stats.entries}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Elementos almacenados
            </p>
          </CardContent>
        </Card>

        {/* Tamaño del Cache */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tamaño</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatSize(stats.size)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Memoria utilizada
            </p>
          </CardContent>
        </Card>

        {/* Compresiones */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Compresiones</p>
                <p className="text-lg font-bold text-gray-900">{stats.compressions}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Datos optimizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hit Rate</span>
              <div className="flex items-center gap-2">
                <Badge className={stats.hitRate >= 80 ? 'bg-green-100 text-green-800' : 
                                stats.hitRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}>
                  {getHitRateStatus(stats.hitRate)}
                </Badge>
                <span className="font-medium">{stats.hitRate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Miss Rate</span>
              <span className="font-medium">{stats.missRate.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Evictions</span>
              <div className="flex items-center gap-2">
                {stats.evictions > 0 ? (
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="font-medium">{stats.evictions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Optimización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Uso de memoria</span>
                <span>{formatSize(stats.size)} / 50MB</span>
              </div>
              <Progress value={(stats.size / (50 * 1024 * 1024)) * 100} className="h-2" />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compresiones</span>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="font-medium">{stats.compressions}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> El cache se optimiza automáticamente eliminando 
                entradas menos usadas cuando se alcanza el límite.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones de Cache específicas para Home */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Configuración de Home.json
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-sm font-medium">Crítico</span>
              </div>
              <p className="text-xs text-gray-600">Hero (30min), Stats (10min)</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-sm font-medium">Alto</span>
              </div>
              <p className="text-xs text-gray-600">Services (1h), Portfolio (30min)</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Bajo</span>
              </div>
              <p className="text-xs text-gray-600">Pillars (2h), Policies (4h)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheMonitor;