'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search,
  Globe,
  Clock,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface ExternalLink {
  url: string;
  title: string;
  menu_item: string;
  status: 'active' | 'broken' | 'redirect' | 'blocked' | 'unchecked';
  status_code?: number;
  response_time?: number;
  redirect_url?: string;
  last_checked?: string;
  error_message?: string;
  security_check?: 'safe' | 'warning' | 'dangerous';
}

interface LinkValidatorProps {
  links: ExternalLink[];
  onLinksUpdate: (links: ExternalLink[]) => void;
  className?: string;
}

const LinkValidator: React.FC<LinkValidatorProps> = ({
  links,
  onLinksUpdate,
  className
}) => {
  const [checking, setChecking] = useState<Set<string>>(new Set());
  const [checkingAll, setCheckingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'broken' | 'redirect' | 'unchecked'>('all');

  // Simular verificación de enlace externo
  const validateExternalLink = async (url: string): Promise<{
    status: 'active' | 'broken' | 'redirect' | 'blocked';
    status_code?: number;
    response_time?: number;
    redirect_url?: string;
    error?: string;
    security_check?: 'safe' | 'warning' | 'dangerous';
  }> => {
    const startTime = Date.now();
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
      
      // Enlaces que simulamos como activos
      const activeLinks = [
        'https://linkedin.com/company/metrica-dip',
        'https://facebook.com/metricadip',
        'https://instagram.com/metricadip',
        'https://youtube.com/metricadip',
        'mailto:info@metricadip.com',
        'tel:+51999999999'
      ];
      
      // Enlaces que simulamos como redirects
      const redirectLinks = [
        'http://linkedin.com/company/metrica-dip',
        'http://facebook.com/metricadip'
      ];
      
      // Enlaces que simulamos como rotos
      const brokenLinks = [
        'https://old-site.com',
        'https://broken-link.com'
      ];
      
      const responseTime = Date.now() - startTime;
      
      // Determinar seguridad del enlace
      let securityCheck: 'safe' | 'warning' | 'dangerous' = 'safe';
      if (url.startsWith('http://')) {
        securityCheck = 'warning'; // HTTP no seguro
      }
      if (url.includes('suspicious') || url.includes('malware')) {
        securityCheck = 'dangerous';
      }
      
      if (activeLinks.some(link => url.includes(link.replace('https://', '').replace('http://', '')))) {
        return {
          status: 'active',
          status_code: 200,
          response_time: responseTime,
          security_check: securityCheck
        };
      }
      
      if (redirectLinks.includes(url)) {
        return {
          status: 'redirect',
          status_code: 301,
          response_time: responseTime,
          redirect_url: url.replace('http://', 'https://'),
          security_check: securityCheck
        };
      }
      
      if (brokenLinks.includes(url)) {
        return {
          status: 'broken',
          status_code: 404,
          response_time: responseTime,
          error: 'Página no encontrada',
          security_check: securityCheck
        };
      }
      
      // Por defecto, simular como activo con probabilidad
      const isActive = Math.random() > 0.2; // 80% de probabilidad de estar activo
      
      if (isActive) {
        return {
          status: 'active',
          status_code: 200,
          response_time: responseTime,
          security_check: securityCheck
        };
      } else {
        return {
          status: 'broken',
          status_code: 500,
          response_time: responseTime,
          error: 'Error del servidor',
          security_check: securityCheck
        };
      }
      
    } catch (error) {
      return {
        status: 'broken',
        status_code: 0,
        response_time: Date.now() - startTime,
        error: 'Error de conexión',
        security_check: 'warning'
      };
    }
  };

  const checkSingleLink = async (index: number) => {
    const link = links[index];
    setChecking(prev => new Set([...prev, link.url]));
    
    try {
      const result = await validateExternalLink(link.url);
      
      const updatedLink: ExternalLink = {
        ...link,
        status: result.status,
        status_code: result.status_code,
        response_time: result.response_time,
        redirect_url: result.redirect_url,
        error_message: result.error,
        security_check: result.security_check,
        last_checked: new Date().toISOString()
      };
      
      const updatedLinks = [...links];
      updatedLinks[index] = updatedLink;
      onLinksUpdate(updatedLinks);
      
      toast({
        title: getStatusText(result.status),
        description: `${link.url} - ${result.status_code} (${result.response_time}ms)`,
        variant: result.status === 'active' ? "default" : "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Error de validación",
        description: `No se pudo validar ${link.url}`,
        variant: "destructive"
      });
    } finally {
      setChecking(prev => {
        const newSet = new Set(prev);
        newSet.delete(link.url);
        return newSet;
      });
    }
  };

  const checkAllLinks = async () => {
    setCheckingAll(true);
    
    try {
      // Validar enlaces en lotes para no sobrecargar
      const batchSize = 2;
      for (let i = 0; i < links.length; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, links.length - i) }, (_, index) => i + index);
        
        await Promise.all(
          batch.map(async (index) => {
            await checkSingleLink(index);
            // Pequeño delay entre validaciones
            await new Promise(resolve => setTimeout(resolve, 500));
          })
        );
      }
      
      toast({
        title: "Validación completa",
        description: `Se validaron ${links.length} enlaces externos`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Error durante la validación masiva",
        variant: "destructive"
      });
    } finally {
      setCheckingAll(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Enlace activo';
      case 'broken': return 'Enlace roto';
      case 'redirect': return 'Redirección';
      case 'blocked': return 'Enlace bloqueado';
      default: return 'Estado desconocido';
    }
  };

  const getStatusIcon = (link: ExternalLink) => {
    if (!link.last_checked) {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
    
    switch (link.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'redirect':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'broken':
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (link: ExternalLink) => {
    if (!link.last_checked) {
      return <Badge variant="secondary">Sin verificar</Badge>;
    }
    
    switch (link.status) {
      case 'active':
        return <Badge variant="default">Activo</Badge>;
      case 'redirect':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Redirección</Badge>;
      case 'broken':
        return <Badge variant="destructive">Roto</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getSecurityIcon = (security: string | undefined) => {
    switch (security) {
      case 'safe':
        return <Shield className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'dangerous':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getFilteredLinks = () => {
    let filtered = [...links];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.menu_item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de estado
    switch (filter) {
      case 'active':
        filtered = filtered.filter(link => link.status === 'active');
        break;
      case 'broken':
        filtered = filtered.filter(link => link.status === 'broken' || link.status === 'blocked');
        break;
      case 'redirect':
        filtered = filtered.filter(link => link.status === 'redirect');
        break;
      case 'unchecked':
        filtered = filtered.filter(link => link.status === 'unchecked');
        break;
    }
    
    return filtered;
  };

  const stats = {
    total: links.length,
    active: links.filter(l => l.status === 'active').length,
    broken: links.filter(l => l.status === 'broken' || l.status === 'blocked').length,
    redirect: links.filter(l => l.status === 'redirect').length,
    unchecked: links.filter(l => l.status === 'unchecked').length
  };

  const filteredLinks = getFilteredLinks();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Validación de Enlaces Externos
                <Badge variant="outline">{stats.total} enlaces</Badge>
              </CardTitle>
              <CardDescription>
                Verificación automática de enlaces externos y validación de seguridad
              </CardDescription>
            </div>
            <Button 
              onClick={checkAllLinks} 
              disabled={checkingAll}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkingAll ? 'animate-spin' : ''}`} />
              {checkingAll ? 'Validando...' : 'Validar Todos'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-green-600">Activos</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{stats.redirect}</div>
              <div className="text-xs text-yellow-600">Redirecciones</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{stats.broken}</div>
              <div className="text-xs text-red-600">Rotos</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-600">{stats.unchecked}</div>
              <div className="text-xs text-gray-600">Sin verificar</div>
            </div>
          </div>

          {/* Barra de progreso de salud */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Salud de enlaces externos</span>
              <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% activos</span>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>

          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">Activos ({stats.active})</TabsTrigger>
                <TabsTrigger value="redirect">Redirecciones ({stats.redirect})</TabsTrigger>
                <TabsTrigger value="broken">Rotos ({stats.broken})</TabsTrigger>
                <TabsTrigger value="unchecked">Sin verificar ({stats.unchecked})</TabsTrigger>
              </TabsList>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar enlaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value={filter} className="space-y-3 mt-6">
              {filteredLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron enlaces que coincidan con los filtros</p>
                </div>
              ) : (
                filteredLinks.map((link, index) => (
                  <Card key={link.url} className="transition-all hover:shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(link)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{link.title}</h4>
                              {getStatusBadge(link)}
                              {link.security_check && getSecurityIcon(link.security_check)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span className="truncate max-w-xs">{link.url}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span>Menú:</span>
                                <Badge variant="outline" className="text-xs">{link.menu_item}</Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {link.last_checked && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(link.last_checked).toLocaleString()}</span>
                                </div>
                              )}
                              
                              {link.response_time && (
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  <span>{link.response_time}ms</span>
                                </div>
                              )}
                              
                              {link.status_code && (
                                <div className="flex items-center gap-1">
                                  <span>HTTP {link.status_code}</span>
                                </div>
                              )}
                            </div>
                            
                            {link.redirect_url && (
                              <p className="text-xs text-blue-600 mt-1">
                                Redirige a: {link.redirect_url}
                              </p>
                            )}
                            
                            {link.error_message && (
                              <p className="text-xs text-red-600 mt-1">{link.error_message}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkSingleLink(index)}
                            disabled={checking.has(link.url)}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${checking.has(link.url) ? 'animate-spin' : ''}`} />
                            {checking.has(link.url) ? 'Validando...' : 'Validar'}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
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

export default LinkValidator;