'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  Link2, 
  Image as ImageIcon, 
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  TestTube,
  Copy
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ImageField from '@/components/admin/ImageField';
import MegaMenuPreview from './MegaMenuPreview';
import PageAutocomplete from './PageAutocomplete';
import { toast } from '@/hooks/use-toast-simple';

interface MegaMenuSubLink {
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
}

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
    links: MegaMenuSubLink[];
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

interface MegaMenuEditorProps {
  item?: MegaMenuItem | null;
  onSave: (item: MegaMenuItem) => void;
  onCancel: () => void;
  availablePages?: Array<{ path: string; title: string; }>;
}

const MegaMenuEditor: React.FC<MegaMenuEditorProps> = ({
  item,
  onSave,
  onCancel,
  availablePages = []
}) => {
  const [editingItem, setEditingItem] = useState<MegaMenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Inicializar item para edición
  useEffect(() => {
    if (item) {
      setEditingItem({ ...item });
    } else {
      // Crear nuevo item
      const newItem: MegaMenuItem = {
        id: `menu_${Date.now()}`,
        order: 1,
        enabled: true,
        type: 'simple',
        label: '',
        href: '',
        icon: 'Menu',
        description: '',
        is_internal: true,
        page_mapping: '',
        click_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setEditingItem(newItem);
    }
  }, [item]);

  const iconOptions = [
    { value: 'Menu', label: 'Menú' },
    { value: 'Home', label: 'Casa' },
    { value: 'Briefcase', label: 'Maletín' },
    { value: 'Users', label: 'Usuarios' },
    { value: 'FolderOpen', label: 'Carpeta' },
    { value: 'Mail', label: 'Email' },
    { value: 'Phone', label: 'Teléfono' },
    { value: 'Settings', label: 'Configuración' },
    { value: 'Star', label: 'Estrella' },
    { value: 'Award', label: 'Premio' },
    { value: 'Target', label: 'Objetivo' },
    { value: 'Zap', label: 'Rayo' },
    { value: 'TrendingUp', label: 'Tendencia' },
    { value: 'Building', label: 'Edificio' },
    { value: 'MapPin', label: 'Ubicación' },
    { value: 'Globe', label: 'Global' },
    { value: 'CheckCircle', label: 'Check' },
    { value: 'Shield', label: 'Escudo' },
    { value: 'Hammer', label: 'Herramienta' },
    { value: 'Lightbulb', label: 'Bombilla' }
  ];

  const highlightColors = [
    { value: 'primary', label: 'Azul Principal', class: 'bg-primary' },
    { value: 'accent', label: 'Naranja Acento', class: 'bg-accent' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
    { value: 'red', label: 'Rojo', class: 'bg-red-500' },
    { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' }
  ];

  const backgroundGradients = [
    { value: 'from-primary/20 to-accent/20', label: 'Azul a Naranja' },
    { value: 'from-accent/20 to-primary/20', label: 'Naranja a Azul' },
    { value: 'from-green-500/20 to-blue-500/20', label: 'Verde a Azul' },
    { value: 'from-purple-500/20 to-pink-500/20', label: 'Púrpura a Rosa' },
    { value: 'from-black/20 to-gray-500/20', label: 'Negro a Gris' }
  ];

  if (!editingItem) return null;

  const updateField = <K extends keyof MegaMenuItem>(field: K, value: MegaMenuItem[K]) => {
    setEditingItem(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateSubmenuField = (section: 'section1' | 'section3', field: string, value: any) => {
    setEditingItem(prev => {
      if (!prev) return null;
      
      // Crear submenu si no existe
      if (!prev.submenu) {
        prev.submenu = {
          layout: 'three_column',
          section1: { title: '', description: '', highlight_color: 'primary' },
          links: [],
          section3: {
            type: 'promotional',
            title: '',
            description: '',
            image: '',
            cta: { text: '', href: '', type: 'internal' },
            background_gradient: 'from-primary/20 to-accent/20'
          }
        };
      }

      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          [section]: {
            ...prev.submenu[section],
            [field]: value
          }
        }
      };
    });
  };

  const updateCTAField = (field: string, value: any) => {
    setEditingItem(prev => {
      if (!prev?.submenu) return prev;
      
      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          section3: {
            ...prev.submenu.section3,
            cta: {
              ...prev.submenu.section3.cta,
              [field]: value
            }
          }
        }
      };
    });
  };

  const addSublink = () => {
    const newLink: MegaMenuSubLink = {
      id: `link_${Date.now()}`,
      title: 'Nuevo Enlace',
      description: 'Descripción del enlace',
      href: '',
      icon: 'Link',
      enabled: true,
      is_internal: true,
      page_mapping: '',
      order: (editingItem.submenu?.links.length || 0) + 1,
      click_count: 0
    };

    setEditingItem(prev => {
      if (!prev) return null;
      
      if (!prev.submenu) {
        prev.submenu = {
          layout: 'three_column',
          section1: { title: '', description: '', highlight_color: 'primary' },
          links: [],
          section3: {
            type: 'promotional',
            title: '',
            description: '',
            image: '',
            cta: { text: '', href: '', type: 'internal' },
            background_gradient: 'from-primary/20 to-accent/20'
          }
        };
      }

      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          links: [...prev.submenu.links, newLink]
        }
      };
    });
  };

  const updateSublink = (linkId: string, field: keyof MegaMenuSubLink, value: any) => {
    setEditingItem(prev => {
      if (!prev?.submenu) return prev;
      
      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          links: prev.submenu.links.map(link => 
            link.id === linkId ? { ...link, [field]: value } : link
          )
        }
      };
    });
  };

  const removeSublink = (linkId: string) => {
    setEditingItem(prev => {
      if (!prev?.submenu) return prev;
      
      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          links: prev.submenu.links.filter(link => link.id !== linkId)
        }
      };
    });
  };

  const handleSublinkReorder = (result: DropResult) => {
    if (!result.destination || !editingItem?.submenu) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedLinks = Array.from(editingItem.submenu.links);
    const [reorderedItem] = reorderedLinks.splice(sourceIndex, 1);
    reorderedLinks.splice(destinationIndex, 0, reorderedItem);

    // Actualizar orden
    const updatedLinks = reorderedLinks.map((link, index) => ({
      ...link,
      order: index + 1
    }));

    setEditingItem(prev => {
      if (!prev?.submenu) return prev;
      
      return {
        ...prev,
        submenu: {
          ...prev.submenu,
          links: updatedLinks
        }
      };
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Validaciones básicas
    if (!editingItem.label.trim()) {
      toast({
        title: "Error",
        description: "El nombre del menú es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (editingItem.type === 'simple' && !editingItem.href?.trim()) {
      toast({
        title: "Error", 
        description: "Los menús simples requieren una URL",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const itemToSave = {
        ...editingItem,
        updated_at: new Date().toISOString()
      };

      await onSave(itemToSave);
      
      toast({
        title: "Guardado exitoso",
        description: `El menú "${editingItem.label}" se ha guardado correctamente`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el menú",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMenuType = () => {
    const newType = editingItem.type === 'simple' ? 'megamenu' : 'simple';
    updateField('type', newType);
    
    if (newType === 'simple') {
      // Limpiar submenu al cambiar a simple
      updateField('submenu', undefined);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Contenido Principal Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Info del menú */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <DynamicIcon name={editingItem.icon} className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">{editingItem.label || 'Nuevo Menú'}</h2>
              <Badge variant={editingItem.type === 'megamenu' ? 'default' : 'secondary'}>
                {editingItem.type === 'megamenu' ? 'MegaMenu' : 'Simple'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {item ? 'Editar menú existente' : 'Crear nuevo menú'}
            </p>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Edición */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="links">Enlaces</TabsTrigger>
                <TabsTrigger value="promo" disabled={editingItem.type === 'simple'}>
                  Promocional
                </TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
              </TabsList>

              {/* Tab General */}
              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuración General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Nombre del menú */}
                    <div>
                      <Label htmlFor="label">Nombre del Menú *</Label>
                      <Input
                        id="label"
                        value={editingItem.label}
                        onChange={(e) => updateField('label', e.target.value)}
                        placeholder="ej: Servicios, Nosotros, Contacto..."
                        maxLength={30}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingItem.label.length}/30 caracteres
                      </p>
                    </div>

                    {/* Descripción */}
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={editingItem.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Descripción breve del menú..."
                        rows={3}
                        maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingItem.description.length}/150 caracteres
                      </p>
                    </div>

                    {/* Icono */}
                    <div>
                      <Label>Icono</Label>
                      <Select value={editingItem.icon} onValueChange={(value) => updateField('icon', value)}>
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <DynamicIcon name={editingItem.icon} className="h-4 w-4" />
                              {iconOptions.find(opt => opt.value === editingItem.icon)?.label || editingItem.icon}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={option.value} className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de menú */}
                    <div className="space-y-2">
                      <Label>Tipo de Menú</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingItem.type === 'megamenu'}
                          onCheckedChange={toggleMenuType}
                        />
                        <span className="text-sm">
                          {editingItem.type === 'megamenu' ? 'MegaMenu (con submenú)' : 'Simple (enlace directo)'}
                        </span>
                      </div>
                    </div>

                    {/* URL (solo para menús simples) */}
                    {editingItem.type === 'simple' && (
                      <div>
                        <Label htmlFor="href">URL del Enlace *</Label>
                        <Input
                          id="href"
                          value={editingItem.href || ''}
                          onChange={(e) => updateField('href', e.target.value)}
                          placeholder="/pagina, https://ejemplo.com"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            checked={editingItem.is_internal}
                            onCheckedChange={(checked) => updateField('is_internal', checked)}
                          />
                          <span className="text-sm">
                            {editingItem.is_internal ? 'Enlace interno' : 'Enlace externo'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estado */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingItem.enabled}
                        onCheckedChange={(checked) => updateField('enabled', checked)}
                      />
                      <span className="text-sm">
                        {editingItem.enabled ? 'Menú activo' : 'Menú inactivo'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Enlaces (solo para megamenus) */}
              {editingItem.type === 'megamenu' && (
                <TabsContent value="links" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="h-5 w-5" />
                          Enlaces del Submenú ({editingItem.submenu?.links.length || 0})
                        </CardTitle>
                        <Button type="button" onClick={addSublink} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Enlace
                        </Button>
                      </div>
                      <CardDescription>
                        Configura los enlaces que aparecerán en el dropdown del megamenú
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Sección 1 del megamenú */}
                      <div className="space-y-4 mb-6">
                        <h4 className="font-medium text-sm">Información Principal</h4>
                        <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                          <div>
                            <Label>Título Principal</Label>
                            <Input
                              value={editingItem.submenu?.section1.title || ''}
                              onChange={(e) => updateSubmenuField('section1', 'title', e.target.value)}
                              placeholder="Título que aparece en la primera columna"
                            />
                          </div>
                          <div>
                            <Label>Descripción</Label>
                            <Textarea
                              value={editingItem.submenu?.section1.description || ''}
                              onChange={(e) => updateSubmenuField('section1', 'description', e.target.value)}
                              placeholder="Descripción detallada..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Color de Resaltado</Label>
                            <Select 
                              value={editingItem.submenu?.section1.highlight_color || 'primary'} 
                              onValueChange={(value) => updateSubmenuField('section1', 'highlight_color', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {highlightColors.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`}></div>
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Lista de enlaces */}
                      <div className="space-y-4 mt-6">
                        <h4 className="font-medium text-sm">Enlaces de Navegación</h4>
                        
                        {(!editingItem.submenu?.links || editingItem.submenu.links.length === 0) ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No hay enlaces configurados</p>
                            <Button type="button" onClick={addSublink} variant="outline" size="sm" className="mt-2">
                              Agregar Primer Enlace
                            </Button>
                          </div>
                        ) : (
                          <DragDropContext onDragEnd={handleSublinkReorder}>
                            <Droppable 
                              droppableId="sublinks" 
                              isDropDisabled={false} 
                              isCombineEnabled={false}
                              ignoreContainerClipping={false}
                            >
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                                  {editingItem.submenu!.links
                                    .sort((a, b) => a.order - b.order)
                                    .map((link, index) => (
                                      <Draggable key={link.id} draggableId={link.id} index={index} isDragDisabled={false}>
                                        {(provided, snapshot) => (
                                          <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                          >
                                            <CardContent className="p-4">
                                              <div className="flex items-start gap-3">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="mt-2 p-1 hover:bg-gray-100 rounded cursor-grab"
                                                >
                                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                                </div>
                                                
                                                <div className="flex-1 space-y-3">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                      <Label className="text-xs">Título</Label>
                                                      <Input
                                                        value={link.title}
                                                        onChange={(e) => updateSublink(link.id, 'title', e.target.value)}
                                                        placeholder="Título del enlace"
                                                        size={20}
                                                      />
                                                    </div>
                                                    <div>
                                                      <Label className="text-xs">URL</Label>
                                                      <PageAutocomplete
                                                        value={link.href}
                                                        onChange={(value, isInternal, pageMapping) => {
                                                          updateSublink(link.id, 'href', value);
                                                          if (isInternal !== undefined) {
                                                            updateSublink(link.id, 'is_internal', isInternal);
                                                          }
                                                          if (pageMapping) {
                                                            updateSublink(link.id, 'page_mapping', pageMapping);
                                                          }
                                                        }}
                                                        onInternalChange={(isInternal) => {
                                                          updateSublink(link.id, 'is_internal', isInternal);
                                                        }}
                                                        isInternal={link.is_internal}
                                                        placeholder="Buscar página..."
                                                        showToggle={false}
                                                        className="w-full"
                                                      />
                                                    </div>
                                                  </div>
                                                  
                                                  <div>
                                                    <Label className="text-xs">Descripción</Label>
                                                    <Input
                                                      value={link.description}
                                                      onChange={(e) => updateSublink(link.id, 'description', e.target.value)}
                                                      placeholder="Descripción breve del enlace"
                                                    />
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                      <Label className="text-xs">Icono:</Label>
                                                      <Select 
                                                        value={link.icon} 
                                                        onValueChange={(value) => updateSublink(link.id, 'icon', value)}
                                                      >
                                                        <SelectTrigger className="w-32">
                                                          <SelectValue>
                                                            <DynamicIcon name={link.icon} className="h-3 w-3" />
                                                          </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {iconOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                              <div className="flex items-center gap-2">
                                                                <DynamicIcon name={option.value} className="h-3 w-3" />
                                                                {option.label}
                                                              </div>
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                      <Switch
                                                        checked={link.enabled}
                                                        onCheckedChange={(checked) => updateSublink(link.id, 'enabled', checked)}
                                                      />
                                                      <Label className="text-xs">Activo</Label>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                      <Switch
                                                        checked={link.is_internal}
                                                        onCheckedChange={(checked) => updateSublink(link.id, 'is_internal', checked)}
                                                      />
                                                      <Label className="text-xs">Interno</Label>
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeSublink(link.id)}
                                                  className="text-red-600 hover:text-red-700"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}
                                      </Draggable>
                                    ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {/* Tab Promocional (solo para megamenus) */}
              {editingItem.type === 'megamenu' && (
                <TabsContent value="promo" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Sección Promocional
                      </CardTitle>
                      <CardDescription>
                        Configura la tercera columna del megamenú con contenido promocional
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Título promocional */}
                      <div>
                        <Label>Título Promocional</Label>
                        <Input
                          value={editingItem.submenu?.section3.title || ''}
                          onChange={(e) => updateSubmenuField('section3', 'title', e.target.value)}
                          placeholder="¿Necesitas una consulta?"
                        />
                      </div>
                      
                      {/* Descripción promocional */}
                      <div>
                        <Label>Descripción</Label>
                        <Textarea
                          value={editingItem.submenu?.section3.description || ''}
                          onChange={(e) => updateSubmenuField('section3', 'description', e.target.value)}
                          placeholder="Agenda una reunión gratuita con nuestros expertos"
                          rows={3}
                        />
                      </div>
                      
                      {/* Imagen promocional */}
                      <div>
                        <Label>Imagen de Fondo</Label>
                        <ImageField
                          value={editingItem.submenu?.section3.image || ''}
                          onChange={(value) => updateSubmenuField('section3', 'image', value)}
                          accept="image/*"
                          placeholder="Selecciona una imagen promocional"
                        />
                      </div>
                      
                      {/* Gradiente de fondo */}
                      <div>
                        <Label>Gradiente de Fondo</Label>
                        <Select 
                          value={editingItem.submenu?.section3.background_gradient || 'from-primary/20 to-accent/20'}
                          onValueChange={(value) => updateSubmenuField('section3', 'background_gradient', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {backgroundGradients.map((gradient) => (
                              <SelectItem key={gradient.value} value={gradient.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient.value}`}></div>
                                  {gradient.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      {/* Call to Action */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Botón de Acción (CTA)</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Texto del Botón</Label>
                            <Input
                              value={editingItem.submenu?.section3.cta?.text || ''}
                              onChange={(e) => updateCTAField('text', e.target.value)}
                              placeholder="Agendar Consulta"
                            />
                          </div>
                          <div>
                            <Label>URL del Botón</Label>
                            <Input
                              value={editingItem.submenu?.section3.cta?.href || ''}
                              onChange={(e) => updateCTAField('href', e.target.value)}
                              placeholder="/contacto"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingItem.submenu?.section3.cta?.type === 'internal'}
                            onCheckedChange={(checked) => updateCTAField('type', checked ? 'internal' : 'external')}
                          />
                          <span className="text-sm">
                            {editingItem.submenu?.section3.cta?.type === 'internal' ? 'Enlace interno' : 'Enlace externo'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {/* Tab Avanzado */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuración Avanzada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ID del menú */}
                    <div>
                      <Label>ID del Menú</Label>
                      <Input
                        value={editingItem.id}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Identificador único del menú (no editable)
                      </p>
                    </div>
                    
                    {/* Orden */}
                    <div>
                      <Label>Orden de Aparición</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editingItem.order}
                        onChange={(e) => updateField('order', parseInt(e.target.value) || 1)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Posición del menú en la barra de navegación
                      </p>
                    </div>
                    
                    {/* Page mapping */}
                    {editingItem.is_internal && (
                      <div>
                        <Label>Mapeo de Página</Label>
                        <Input
                          value={editingItem.page_mapping || ''}
                          onChange={(e) => updateField('page_mapping', e.target.value)}
                          placeholder="nombre-pagina"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Identificador interno para rastreo y análisis
                        </p>
                      </div>
                    )}
                    
                    {/* Estadísticas */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-3">Estadísticas</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Clicks:</span>
                          <span className="font-medium ml-2">{editingItem.click_count}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estado:</span>
                          <Badge variant={editingItem.enabled ? 'default' : 'secondary'} className="ml-2">
                            {editingItem.enabled ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Creado:</span>
                          <span className="font-medium ml-2">
                            {new Date(editingItem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Modificado:</span>
                          <span className="font-medium ml-2">
                            {new Date(editingItem.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Layout del submenu (solo para megamenus) */}
                    {editingItem.type === 'megamenu' && (
                      <div>
                        <Label>Layout del Submenú</Label>
                        <Select 
                          value={editingItem.submenu?.layout || 'three_column'}
                          onValueChange={(value) => updateSubmenuField('section1', 'layout', value)}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="three_column">Tres Columnas</SelectItem>
                            <SelectItem value="two_column" disabled>Dos Columnas (Próximamente)</SelectItem>
                            <SelectItem value="full_width" disabled>Ancho Completo (Próximamente)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Actualmente solo se soporta el layout de tres columnas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel de Preview */}
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Vista Previa en Tiempo Real
                  </CardTitle>
                  <CardDescription>
                    Visualización de cómo se verá el menú en el sitio web
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Preview en tiempo real */}
                  <MegaMenuPreview 
                    item={editingItem}
                    showDeviceToggle={false}
                    showInteractions={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Footer con botones de acción */}
      <div className="border-t bg-muted/50 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuEditor;