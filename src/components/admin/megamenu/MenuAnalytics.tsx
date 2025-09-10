'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MousePointer, 
  Eye, 
  Clock,
  Users,
  Globe,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { toast } from '@/hooks/use-toast-simple';

interface MenuInteraction {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  submenu_link_id?: string;
  submenu_link_name?: string;
  action: 'hover' | 'click' | 'view';
  timestamp: string;
  user_agent?: string;
  session_id: string;
  page_url: string;
  is_mobile: boolean;
}

interface MenuAnalytics {
  total_interactions: number;
  unique_sessions: number;
  avg_session_duration: number;
  most_popular_menu: string;
  most_popular_sublink: string;
  bounce_rate: number;
  conversion_rate: number;
  interactions_by_day: Array<{ date: string; count: number }>;
  interactions_by_menu: Array<{ menu_id: string; menu_name: string; count: number; unique_users: number }>;
  interactions_by_device: Array<{ device: string; count: number; percentage: number }>;
  popular_paths: Array<{ path: string; count: number }>;
}

interface MenuAnalyticsProps {
  menuItems: any[];
  className?: string;
}

const MenuAnalytics: React.FC<MenuAnalyticsProps> = ({
  menuItems,
  className
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeFrame, setTimeFrame] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [loading, setLoading] = useState(false);

  // Datos simulados de analytics
  const mockInteractions: MenuInteraction[] = [
    {
      id: '1',
      menu_item_id: 'services',
      menu_item_name: 'Servicios',
      submenu_link_id: 'supervision',
      submenu_link_name: 'Supervisión de Obras',
      action: 'click',
      timestamp: '2025-09-01T10:30:00Z',
      session_id: 'session1',
      page_url: 'https://metricadip.com/',
      is_mobile: false
    },
    {
      id: '2',
      menu_item_id: 'services',
      menu_item_name: 'Servicios',
      action: 'hover',
      timestamp: '2025-09-01T10:29:45Z',
      session_id: 'session1',
      page_url: 'https://metricadip.com/',
      is_mobile: false
    },
    {
      id: '3',
      menu_item_id: 'portfolio',
      menu_item_name: 'Portafolio',
      submenu_link_id: 'destacados',
      submenu_link_name: 'Proyectos Destacados',
      action: 'click',
      timestamp: '2025-09-01T11:15:00Z',
      session_id: 'session2',
      page_url: 'https://metricadip.com/',
      is_mobile: true
    }
  ];

  // Calcular analytics
  const analytics: MenuAnalytics = useMemo(() => {
    const interactions = mockInteractions;
    const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
    
    // Interacciones por menú
    const menuInteractions = new Map();
    interactions.forEach(interaction => {
      const key = interaction.menu_item_id;
      const existing = menuInteractions.get(key) || { 
        menu_id: key, 
        menu_name: interaction.menu_item_name, 
        count: 0, 
        unique_users: new Set() 
      };
      existing.count++;
      existing.unique_users.add(interaction.session_id);
      menuInteractions.set(key, existing);
    });

    const interactionsByMenu = Array.from(menuInteractions.values()).map(item => ({
      ...item,
      unique_users: item.unique_users.size
    }));

    // Interacciones por dispositivo
    const deviceCounts = { mobile: 0, desktop: 0 };
    interactions.forEach(i => {
      if (i.is_mobile) deviceCounts.mobile++;
      else deviceCounts.desktop++;
    });

    const interactionsByDevice = [
      { device: 'Desktop', count: deviceCounts.desktop, percentage: Math.round((deviceCounts.desktop / interactions.length) * 100) },
      { device: 'Mobile', count: deviceCounts.mobile, percentage: Math.round((deviceCounts.mobile / interactions.length) * 100) }
    ];

    // Rutas populares
    const pathCounts = new Map();
    interactions.forEach(i => {
      const path = i.submenu_link_name ? 
        `${i.menu_item_name} → ${i.submenu_link_name}` : 
        i.menu_item_name;
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    });

    const popularPaths = Array.from(pathCounts.entries()).map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // Datos por día (simulados)
    const today = new Date();
    const interactionsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      };
    });

    return {
      total_interactions: interactions.length + 247, // Agregar datos simulados
      unique_sessions: uniqueSessions + 89,
      avg_session_duration: 145, // segundos
      most_popular_menu: interactionsByMenu.sort((a, b) => b.count - a.count)[0]?.menu_name || 'Servicios',
      most_popular_sublink: 'Supervisión de Obras',
      bounce_rate: 23.5,
      conversion_rate: 12.8,
      interactions_by_day: interactionsByDay,
      interactions_by_menu: interactionsByMenu,
      interactions_by_device: interactionsByDevice,
      popular_paths: popularPaths
    };
  }, [mockInteractions]);

  const refreshAnalytics = async () => {
    setLoading(true);
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    
    toast({
      title: "Analytics actualizados",
      description: "Los datos se han actualizado correctamente"
    });
  };

  const exportData = () => {
    const data = {
      analytics,
      generated_at: new Date().toISOString(),
      time_frame: timeFrame
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megamenu-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Datos exportados",
      description: "El archivo de analytics se ha descargado"
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics del MegaMenu
                <Badge variant="outline">Últimos {timeFrame}</Badge>
              </CardTitle>
              <CardDescription>
                Análisis de interacciones y uso del sistema de navegación
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={refreshAnalytics} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filtros de tiempo */}
          <div className="flex items-center gap-4">
            <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
                <SelectItem value="custom">Rango personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            {timeFrame === 'custom' && (
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Seleccionar fechas"
              />
            )}
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="menus">Por Menú</TabsTrigger>
              <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            </TabsList>

            {/* Tab Resumen */}
            <TabsContent value="overview" className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">{analytics.total_interactions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Interacciones</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(15.3)}
                          <span className={`text-xs ${getTrendColor(15.3)}`}>+15.3%</span>
                        </div>
                      </div>
                      <MousePointer className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{analytics.unique_sessions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Sesiones Únicas</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(8.7)}
                          <span className={`text-xs ${getTrendColor(8.7)}`}>+8.7%</span>
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{analytics.avg_session_duration}s</p>
                        <p className="text-sm text-muted-foreground">Duración Promedio</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(-2.1)}
                          <span className={`text-xs ${getTrendColor(-2.1)}`}>-2.1%</span>
                        </div>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{analytics.conversion_rate}%</p>
                        <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(5.2)}
                          <span className={`text-xs ${getTrendColor(5.2)}`}>+5.2%</span>
                        </div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de interacciones por día */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interacciones por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-1">
                    {analytics.interactions_by_day.slice(-14).map((day, index) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-primary rounded-t w-full transition-all hover:bg-primary/80"
                          style={{ height: `${(day.count / 60) * 100}%`, minHeight: '4px' }}
                          title={`${day.date}: ${day.count} interacciones`}
                        />
                        <span className="text-xs text-muted-foreground mt-2 rotate-45 origin-left">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Menús más populares */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Menús Más Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.interactions_by_menu
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((menu, index) => (
                        <div key={menu.menu_id} className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{menu.menu_name}</h4>
                              <span className="text-sm text-muted-foreground">
                                {menu.count} interacciones
                              </span>
                            </div>
                            <Progress value={(menu.count / analytics.total_interactions) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {menu.unique_users} usuarios únicos
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Por Menú */}
            <TabsContent value="menus" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {menuItems.map((menuItem) => {
                  const menuStats = analytics.interactions_by_menu.find(m => m.menu_id === menuItem.id) || 
                    { count: 0, unique_users: 0 };
                  
                  return (
                    <Card key={menuItem.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                              <span className="text-xs">🍔</span>
                            </div>
                            {menuItem.label}
                          </CardTitle>
                          <Badge variant={menuItem.enabled ? "default" : "secondary"}>
                            {menuItem.enabled ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-primary">{menuStats.count}</p>
                            <p className="text-xs text-muted-foreground">Interacciones</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{menuStats.unique_users}</p>
                            <p className="text-xs text-muted-foreground">Usuarios</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">
                              {menuStats.count > 0 ? Math.round((menuStats.count / menuStats.unique_users) * 10) / 10 : 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Promedio</p>
                          </div>
                        </div>
                        
                        {menuItem.submenu && menuItem.submenu.links.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Subenlaces populares:</p>
                            <div className="space-y-2">
                              {menuItem.submenu.links.slice(0, 3).map((link: any) => (
                                <div key={link.id} className="flex items-center justify-between text-sm">
                                  <span className="truncate">{link.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.floor(Math.random() * 50)} clicks
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab Comportamiento */}
            <TabsContent value="behavior" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rutas más populares */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rutas de Navegación</CardTitle>
                    <CardDescription>
                      Caminos más seguidos por los usuarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popular_paths.slice(0, 8).map((path, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            <span className="text-sm">{path.path}</span>
                          </div>
                          <Badge variant="outline">{path.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas de comportamiento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de rebote</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{analytics.bounce_rate}%</span>
                        {getTrendIcon(-3.2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tiempo promedio en menú</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">2.3s</span>
                        {getTrendIcon(0.8)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interacciones por sesión</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">3.7</span>
                        {getTrendIcon(1.2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de conversión a submenú</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">67%</span>
                        {getTrendIcon(5.4)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Dispositivos */}
            <TabsContent value="devices" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución por dispositivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribución por Dispositivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.interactions_by_device.map((device) => (
                        <div key={device.device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>{device.device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{device.count}</span>
                              <span className="text-sm text-muted-foreground">({device.percentage}%)</span>
                            </div>
                          </div>
                          <Progress value={device.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Rendimiento por dispositivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento por Dispositivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Desktop - Tiempo de respuesta</span>
                          <span className="text-sm font-medium">145ms</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Mobile - Tiempo de respuesta</span>
                          <span className="text-sm font-medium">230ms</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Desktop - Tasa de conversión</span>
                          <span className="text-sm font-medium">15.2%</span>
                        </div>
                        <Progress value={76} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Mobile - Tasa de conversión</span>
                          <span className="text-sm font-medium">9.8%</span>
                        </div>
                        <Progress value={49} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuAnalytics;