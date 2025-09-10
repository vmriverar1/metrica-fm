'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Settings,
  RefreshCw,
  Download,
  Upload,
  Zap,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast-simple';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import { FilterState } from '@/components/admin/megamenu/MegaMenuFilters';

// Lazy load heavy admin components
const MegaMenuStats = dynamic(() => import('@/components/admin/megamenu/MegaMenuStats'), {
  loading: () => <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />
});

const MegaMenuFilters = dynamic(() => import('@/components/admin/megamenu/MegaMenuFilters'), {
  loading: () => <div className="h-20 bg-muted/30 animate-pulse rounded-lg" />
});

const MenuTreeView = dynamic(() => import('@/components/admin/megamenu/MenuTreeView'), {
  loading: () => <div className="h-64 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const MegaMenuEditor = dynamic(() => import('@/components/admin/megamenu/MegaMenuEditor'), {
  loading: () => <div className="h-96 bg-muted/10 animate-pulse rounded-lg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

interface MegaMenuItem {
  id: string;
  order: number;
  enabled: boolean;
  type: 'megamenu' | 'simple';
  label: string;
  href?: string | null;
  icon: string;
  description: string;
  is_internal?: boolean;
  page_mapping?: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  submenu?: {
    layout: string;
    section1: {
      title: string;
      description: string;
      highlight_color: string;
    };
    links: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
      icon: string;
      enabled: boolean;
      is_internal: boolean;
      page_mapping: string;
      order: number;
      click_count: number;
    }>;
    section3: {
      type: string;
      title: string;
      description: string;
      image: string;
      cta: {
        text: string;
        href: string;
        type: string;
        page_mapping?: string;
      };
      background_gradient: string;
    };
  };
}

interface MegaMenuData {
  settings: {
    enabled: boolean;
    animation_duration: number;
    hover_delay: number;
    mobile_breakpoint: string;
    max_items: number;
    last_updated: string;
    version: string;
  };
  items: MegaMenuItem[];
  page_mappings: Record<string, any>;
  analytics: {
    total_clicks: number;
    most_clicked_item: string | null;
    last_interaction: string | null;
    popular_links: any[];
  };
}

export default function MegaMenuAdminPage() {
  const [menuData, setMenuData] = useState<MegaMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<MegaMenuItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Estado de filtros unificado
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    type: 'all',
    enabled: 'all',
    sortBy: 'order',
    sortDirection: 'asc',
    minClicks: 0,
    hasSublinks: 'all',
    hasImages: 'all'
  });

  // Cargar datos del megamenu
  useEffect(() => {
    fetchMegaMenuData();
  }, []);

  const fetchMegaMenuData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const response = await fetch('/api/admin/megamenu');
      if (response.ok) {
        const data = await response.json();
        setMenuData(data);
        
        if (!showLoading) {
          toast({
            title: "Datos actualizados",
            description: "La configuración del megamenu se ha actualizado"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del megamenu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error de conexión al cargar los datos",
        variant: "destructive"
      });
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  };

  // Función de filtrado avanzada
  const getFilteredAndSortedItems = () => {
    if (!menuData?.items) return [];
    
    let filtered = menuData.items.filter(item => {
      // Búsqueda por texto
      const searchMatches = !filters.searchTerm || 
        item.label.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.submenu?.links?.some(link => 
          link.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          link.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ) || false);
      
      // Filtro por tipo
      const typeMatches = filters.type === 'all' || item.type === filters.type;
      
      // Filtro por estado
      const enabledMatches = filters.enabled === 'all' || 
        (filters.enabled === 'enabled' && item.enabled) ||
        (filters.enabled === 'disabled' && !item.enabled);
      
      // Filtro por clicks mínimos
      const totalClicks = (item.click_count || 0) + 
        (item.submenu?.links?.reduce((acc, link) => acc + (link.click_count || 0), 0) || 0);
      const clicksMatches = totalClicks >= filters.minClicks;
      
      // Filtro por sublinks
      const sublinksMatches = filters.hasSublinks === 'all' ||
        (filters.hasSublinks === 'with' && item.submenu?.links?.length > 0) ||
        (filters.hasSublinks === 'without' && (!item.submenu || !item.submenu.links?.length));
      
      // Filtro por imágenes
      const imagesMatches = filters.hasImages === 'all' ||
        (filters.hasImages === 'with' && item.submenu?.section3?.image) ||
        (filters.hasImages === 'without' && !item.submenu?.section3?.image);
      
      // Filtro por fechas
      let dateMatches = true;
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const itemDate = new Date(item.updated_at);
        if (filters.dateRange.from && itemDate < filters.dateRange.from) dateMatches = false;
        if (filters.dateRange.to && itemDate > filters.dateRange.to) dateMatches = false;
      }
      
      return searchMatches && typeMatches && enabledMatches && clicksMatches && 
             sublinksMatches && imagesMatches && dateMatches;
    });
    
    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'label':
          aValue = a.label.toLowerCase();
          bValue = b.label.toLowerCase();
          break;
        case 'clicks':
          aValue = a.click_count + (a.submenu?.links.reduce((acc, link) => acc + link.click_count, 0) || 0);
          bValue = b.click_count + (b.submenu?.links.reduce((acc, link) => acc + link.click_count, 0) || 0);
          break;
        case 'updated':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'order':
        default:
          aValue = a.order;
          bValue = b.order;
          break;
      }
      
      if (filters.sortDirection === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };
  
  const filteredItems = getFilteredAndSortedItems();

  // Funciones de manejo de acciones
  const handleReorder = async (newOrder: string[]) => {
    try {
      const response = await fetch('/api/admin/megamenu/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: newOrder })
      });
      
      if (response.ok) {
        await fetchMegaMenuData(false);
        toast({
          title: "Orden actualizado",
          description: "El orden del megamenu se ha actualizado correctamente"
        });
      } else {
        throw new Error('Error al reordenar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden",
        variant: "destructive"
      });
    }
  };
  
  const handleEdit = (item: MegaMenuItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };
  
  const handleCreateNew = () => {
    setEditingItem(null);
    setShowEditor(true);
  };
  
  const handleEditorSave = async (item: MegaMenuItem) => {
    try {
      const isNew = !editingItem;
      const url = isNew ? '/api/admin/megamenu' : `/api/admin/megamenu/${item.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      if (response.ok) {
        await fetchMegaMenuData(false);
        setShowEditor(false);
        setEditingItem(null);
        
        toast({
          title: isNew ? "Menú creado" : "Menú actualizado",
          description: `El menú "${item.label}" se ha ${isNew ? 'creado' : 'actualizado'} correctamente`
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      throw error; // Re-lanzar para que el editor lo maneje
    }
  };
  
  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingItem(null);
  };
  
  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/megamenu/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchMegaMenuData(false);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el menú",
        variant: "destructive"
      });
    }
  };
  
  const handlePreview = (item: MegaMenuItem) => {
    // La funcionalidad de preview está en MegaMenuActions
  };
  
  const handleAddSublink = (itemId: string) => {
    toast({
      title: "Próximamente",
      description: "Agregar sublink - Funcionalidad en desarrollo"
    });
  };
  
  const handleDuplicate = (item: MegaMenuItem) => {
    toast({
      title: "Próximamente",
      description: `Duplicar "${item.label}" - Funcionalidad en desarrollo`
    });
  };
  
  const handleToggleEnabled = async (itemId: string) => {
    try {
      const item = menuData?.items.find(i => i.id === itemId);
      if (!item) return;
      
      const response = await fetch(`/api/admin/megamenu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, enabled: !item.enabled })
      });
      
      if (response.ok) {
        await fetchMegaMenuData(false);
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del menú",
        variant: "destructive"
      });
    }
  };
  
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: 'all',
      enabled: 'all',
      sortBy: 'order',
      sortDirection: 'asc',
      minClicks: 0,
      hasSublinks: 'all',
      hasImages: 'all'
    });
  };

  if (loading) {
    return (
      <AdminLayout
        title="Gestión del Mega Menu"
        description="Administra la navegación principal del sitio web"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión del Mega Menu"
      description="Administra la navegación principal del sitio web"
    >
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Menu className="h-8 w-8 text-primary" />
            Administrador de MegaMenu
            <Badge variant="outline" className="ml-2">
              Fase 2
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema avanzado de gestión de navegación con drag & drop
          </p>
          {menuData?.settings && (
            <p className="text-xs text-muted-foreground">
              Última actualización: {new Date(menuData.settings.last_updated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchMegaMenuData(false)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Menú
          </Button>
        </div>
      </div>

      {/* Estadísticas Avanzadas */}
      <MegaMenuStats 
        items={menuData?.items || []} 
        analytics={menuData?.analytics}
      />

      {/* Filtros Avanzados */}
      <MegaMenuFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalItems={menuData?.items.length || 0}
        filteredItems={filteredItems.length}
        onClearFilters={clearFilters}
        showAdvanced={showAdvancedFilters}
        onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Vista de Árbol con Drag & Drop */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Vista de Árbol Interactiva ({filteredItems.length})
              </CardTitle>
              <CardDescription>
                Arrastra y suelta para reordenar • Click para expandir megamenús • Acciones rápidas disponibles
              </CardDescription>
            </div>
            {filteredItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {filteredItems.filter(item => item.enabled).length} activos de {filteredItems.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No se encontraron menús
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajusta los filtros o crea un nuevo menú para comenzar
              </p>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Menú
              </Button>
            </div>
          ) : (
            <MenuTreeView
              items={filteredItems}
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
              onAddSublink={handleAddSublink}
              loading={refreshing}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Editor Modal/Overlay */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300">
          <div 
            className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-background border rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-muted/50 to-muted/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                {editingItem ? `Editar: ${editingItem.label}` : 'Crear Nuevo Menú'}
                <Badge variant="outline" className="ml-2">
                  Editor Avanzado
                </Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditorCancel}
                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                title="Cerrar editor"
              >
                ✕
              </Button>
            </div>
            
            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-hidden">
              <MegaMenuEditor
                item={editingItem}
                onSave={handleEditorSave}
                onCancel={handleEditorCancel}
                availablePages={[]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}