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
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { COLLECTIONS } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import MegaMenuStats from '@/components/admin/megamenu/MegaMenuStats';
import MegaMenuFilters, { FilterState } from '@/components/admin/megamenu/MegaMenuFilters';
import MenuTreeView from '@/components/admin/megamenu/MenuTreeView';
import MegaMenuActions from '@/components/admin/megamenu/MegaMenuActions';
import MegaMenuEditor from '@/components/admin/megamenu/MegaMenuEditor';

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
      console.log('🔍 [MegaMenu Admin] Cargando datos desde Firestore...');
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      // Obtener documento del mega menú desde Firestore
      const result = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (result.success && result.data) {
        const firestoreData = result.data as any;
        console.log('📊 [MegaMenu Admin] Datos obtenidos:', firestoreData);

        // Crear estructura compatible con el admin
        const megaMenuData: MegaMenuData = {
          settings: firestoreData.settings || {
            enabled: true,
            animation_duration: 300,
            hover_delay: 100,
            mobile_breakpoint: 'md',
            max_items: 10,
            last_updated: new Date().toISOString(),
            version: '1.0.0'
          },
          items: firestoreData.items || [],
          page_mappings: firestoreData.page_mappings || {},
          analytics: firestoreData.analytics || {
            total_clicks: 0,
            most_clicked_item: null,
            last_interaction: null,
            popular_links: []
          }
        };

        setMenuData(megaMenuData);

        if (!showLoading) {
          toast({
            title: "Datos actualizados",
            description: "La configuración del megamenu se ha actualizado"
          });
        }

        console.log('✅ [MegaMenu Admin] Datos cargados exitosamente');
      } else {
        console.error('❌ [MegaMenu Admin] Error obteniendo documento:', result.message);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del megamenu desde Firestore",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [MegaMenu Admin] Error:', error);
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
      console.log('🔄 [MegaMenu Admin] Reordenando items:', newOrder);

      // Obtener documento actual
      const currentResult = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (!currentResult.success || !currentResult.data) {
        throw new Error('No se pudo obtener la configuración actual del mega menú');
      }

      const currentData = currentResult.data as any;
      const currentItems = currentData.items || [];

      // Reordenar items según newOrder
      const reorderedItems = newOrder.map((itemId, index) => {
        const item = currentItems.find((item: any) => item.id === itemId);
        return item ? { ...item, order: index + 1, updated_at: new Date().toISOString() } : null;
      }).filter(Boolean);

      // Agregar items que no estén en newOrder al final
      const remainingItems = currentItems
        .filter((item: any) => !newOrder.includes(item.id))
        .map((item: any, index: number) => ({
          ...item,
          order: reorderedItems.length + index + 1,
          updated_at: new Date().toISOString()
        }));

      const finalItems = [...reorderedItems, ...remainingItems];

      // Actualizar documento en Firestore
      const updateResult = await FirestoreCore.updateDocument(COLLECTIONS.MEGAMENU, 'main', {
        ...currentData,
        items: finalItems,
        settings: {
          ...currentData.settings,
          last_updated: new Date().toISOString()
        }
      });

      if (updateResult.success) {
        await fetchMegaMenuData(false);
        toast({
          title: "Orden actualizado",
          description: "El orden del megamenu se ha actualizado correctamente"
        });
        console.log('✅ [MegaMenu Admin] Orden actualizado exitosamente');
      } else {
        throw new Error(updateResult.message || 'Error actualizando el orden');
      }
    } catch (error) {
      console.error('❌ [MegaMenu Admin] Error reordenando:', error);
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
      console.log('💾 [MegaMenu Admin] Guardando item:', item);
      const isNew = !editingItem;

      // Obtener documento actual
      const currentResult = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (!currentResult.success || !currentResult.data) {
        throw new Error('No se pudo obtener la configuración actual del mega menú');
      }

      const currentData = currentResult.data as any;
      const currentItems = currentData.items || [];

      let updatedItems;
      if (isNew) {
        // Agregar nuevo item
        updatedItems = [...currentItems, item];
        console.log('➕ [MegaMenu Admin] Agregando nuevo item');
      } else {
        // Actualizar item existente
        updatedItems = currentItems.map((existingItem: any) =>
          existingItem.id === item.id ? item : existingItem
        );
        console.log('✏️ [MegaMenu Admin] Actualizando item existente');
      }

      // Actualizar documento en Firestore
      const updateResult = await FirestoreCore.updateDocument(COLLECTIONS.MEGAMENU, 'main', {
        ...currentData,
        items: updatedItems,
        settings: {
          ...currentData.settings,
          last_updated: new Date().toISOString()
        }
      });

      if (updateResult.success) {
        await fetchMegaMenuData(false);
        setShowEditor(false);
        setEditingItem(null);

        toast({
          title: isNew ? "Menú creado" : "Menú actualizado",
          description: `El menú "${item.label}" se ha ${isNew ? 'creado' : 'actualizado'} correctamente`
        });

        console.log('✅ [MegaMenu Admin] Item guardado exitosamente');
      } else {
        throw new Error(updateResult.message || 'Error actualizando el documento');
      }
    } catch (error) {
      console.error('❌ [MegaMenu Admin] Error guardando item:', error);
      throw error; // Re-lanzar para que el editor lo maneje
    }
  };
  
  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingItem(null);
  };
  
  const handleDelete = async (itemId: string) => {
    try {
      console.log('🗑️ [MegaMenu Admin] Eliminando item:', itemId);

      // Obtener documento actual
      const currentResult = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (!currentResult.success || !currentResult.data) {
        throw new Error('No se pudo obtener la configuración actual del mega menú');
      }

      const currentData = currentResult.data as any;
      const currentItems = currentData.items || [];

      // Filtrar item a eliminar
      const updatedItems = currentItems.filter((item: any) => item.id !== itemId);

      // Actualizar documento en Firestore
      const updateResult = await FirestoreCore.updateDocument(COLLECTIONS.MEGAMENU, 'main', {
        ...currentData,
        items: updatedItems,
        settings: {
          ...currentData.settings,
          last_updated: new Date().toISOString()
        }
      });

      if (updateResult.success) {
        await fetchMegaMenuData(false);
        toast({
          title: "Menú eliminado",
          description: "El menú se ha eliminado correctamente"
        });
        console.log('✅ [MegaMenu Admin] Item eliminado exitosamente');
      } else {
        throw new Error(updateResult.message || 'Error eliminando el item');
      }
    } catch (error) {
      console.error('❌ [MegaMenu Admin] Error eliminando item:', error);
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
      console.log('🔄 [MegaMenu Admin] Cambiando estado de item:', itemId);

      const item = menuData?.items.find(i => i.id === itemId);
      if (!item) return;

      // Obtener documento actual
      const currentResult = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (!currentResult.success || !currentResult.data) {
        throw new Error('No se pudo obtener la configuración actual del mega menú');
      }

      const currentData = currentResult.data as any;
      const currentItems = currentData.items || [];

      // Actualizar estado del item
      const updatedItems = currentItems.map((existingItem: any) =>
        existingItem.id === itemId
          ? { ...existingItem, enabled: !existingItem.enabled, updated_at: new Date().toISOString() }
          : existingItem
      );

      // Actualizar documento en Firestore
      const updateResult = await FirestoreCore.updateDocument(COLLECTIONS.MEGAMENU, 'main', {
        ...currentData,
        items: updatedItems,
        settings: {
          ...currentData.settings,
          last_updated: new Date().toISOString()
        }
      });

      if (updateResult.success) {
        await fetchMegaMenuData(false);
        toast({
          title: "Estado actualizado",
          description: `El menú "${item.label}" se ha ${!item.enabled ? 'activado' : 'desactivado'} correctamente`
        });
        console.log('✅ [MegaMenu Admin] Estado cambiado exitosamente');
      } else {
        throw new Error(updateResult.message || 'Error cambiando el estado');
      }
    } catch (error) {
      console.error('❌ [MegaMenu Admin] Error cambiando estado:', error);
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