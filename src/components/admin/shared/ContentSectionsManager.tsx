'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Copy,
  Eye,
  EyeOff,
  Type,
  List,
  Grid,
  Image,
  Video,
  FileText,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Layout
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface ContentSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'text' | 'list' | 'grid' | 'gallery' | 'video' | 'quote' | 'cta' | 'custom';
  status: 'visible' | 'hidden';
  order: number;
  settings: {
    background_color?: string;
    text_color?: string;
    padding?: string;
    margin?: string;
    border_radius?: string;
    shadow?: boolean;
    full_width?: boolean;
    container_max_width?: string;
    text_alignment?: 'left' | 'center' | 'right' | 'justify';
    animation?: string;
  };
  content_data?: {
    // Para type: 'list'
    list_items?: string[];
    list_style?: 'bullet' | 'numbered' | 'checklist' | 'none';
    
    // Para type: 'grid'
    grid_items?: Array<{
      title: string;
      content: string;
      image?: string;
      link?: string;
    }>;
    columns?: number;
    gap?: string;
    
    // Para type: 'gallery'
    images?: Array<{
      url: string;
      alt: string;
      caption?: string;
    }>;
    gallery_style?: 'masonry' | 'grid' | 'carousel';
    
    // Para type: 'video'
    video_url?: string;
    video_poster?: string;
    autoplay?: boolean;
    
    // Para type: 'quote'
    quote_text?: string;
    quote_author?: string;
    quote_source?: string;
    
    // Para type: 'cta'
    cta_text?: string;
    cta_link?: string;
    cta_style?: 'primary' | 'secondary' | 'outline';
    
    // Para type: 'custom'
    custom_html?: string;
    custom_css?: string;
  };
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    tags?: string[];
    category?: string;
  };
}

interface ContentSectionsManagerProps {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
  allowReordering?: boolean;
  allowCustomTypes?: boolean;
  maxSections?: number;
  contextType?: 'blog' | 'services' | 'compromiso' | 'general';
  availableTypes?: ContentSection['type'][];
  showPreview?: boolean;
  templates?: Partial<ContentSection>[];
}

export const ContentSectionsManager: React.FC<ContentSectionsManagerProps> = ({
  sections = [],
  onChange,
  allowReordering = true,
  allowCustomTypes = false,
  maxSections = 20,
  contextType = 'general',
  availableTypes = ['text', 'list', 'grid', 'gallery', 'video', 'quote', 'cta'],
  showPreview = true,
  templates = []
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [newSection, setNewSection] = useState<Partial<ContentSection>>({
    title: '',
    subtitle: '',
    content: '',
    type: 'text',
    status: 'visible',
    settings: {
      text_alignment: 'left',
      full_width: false,
      shadow: false
    },
    content_data: {}
  });

  // Tipos de sección con sus iconos
  const sectionTypeIcons = {
    text: Type,
    list: List,
    grid: Grid,
    gallery: Image,
    video: Video,
    quote: FileText,
    cta: Layout,
    custom: FileText
  };

  // Agregar nueva sección
  const handleAddSection = () => {
    if (!newSection.title?.trim()) return;

    const id = Date.now().toString();
    const section: ContentSection = {
      id,
      title: newSection.title.trim(),
      subtitle: newSection.subtitle?.trim() || '',
      content: newSection.content?.trim() || '',
      type: newSection.type || 'text',
      status: newSection.status || 'visible',
      order: sections.length,
      settings: {
        text_alignment: 'left',
        full_width: false,
        shadow: false,
        ...newSection.settings
      },
      content_data: newSection.content_data || {},
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin'
      }
    };

    onChange([...sections, section]);
    setNewSection({
      title: '',
      subtitle: '',
      content: '',
      type: 'text',
      status: 'visible',
      settings: { text_alignment: 'left', full_width: false, shadow: false },
      content_data: {}
    });
    setShowAddForm(false);
  };

  // Actualizar sección existente
  const handleUpdateSection = (id: string, updates: Partial<ContentSection>) => {
    const updatedSections = sections.map(section => 
      section.id === id 
        ? { 
            ...section, 
            ...updates,
            metadata: {
              ...section.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : section
    );
    onChange(updatedSections);
    setEditingId(null);
  };

  // Eliminar sección
  const handleDeleteSection = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta sección?')) {
      const updatedSections = sections.filter(section => section.id !== id);
      onChange(updatedSections);
    }
  };

  // Duplicar sección
  const handleDuplicateSection = (section: ContentSection) => {
    const duplicated: ContentSection = {
      ...section,
      id: Date.now().toString(),
      title: `${section.title} (Copia)`,
      order: sections.length,
      metadata: {
        ...section.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    onChange([...sections, duplicated]);
  };

  // Reordenar secciones
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedSections = items.map((item, index) => ({
      ...item,
      order: index
    }));

    onChange(reorderedSections);
  };

  // Toggle visibilidad de sección
  const toggleSectionVisibility = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      handleUpdateSection(id, {
        status: section.status === 'visible' ? 'hidden' : 'visible'
      });
    }
  };

  // Toggle expansión de sección
  const toggleSectionExpansion = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  // Aplicar template
  const applyTemplate = (template: Partial<ContentSection>) => {
    setNewSection({
      title: template.title || '',
      subtitle: template.subtitle || '',
      content: template.content || '',
      type: template.type || 'text',
      status: 'visible',
      settings: { text_alignment: 'left', full_width: false, shadow: false, ...template.settings },
      content_data: template.content_data || {}
    });
    setShowAddForm(true);
  };

  // Obtener templates por contexto
  const getContextTemplates = () => {
    const contextTemplates = {
      blog: [
        {
          title: 'Introducción',
          type: 'text' as const,
          content: 'Párrafo introductorio del artículo...',
          settings: { text_alignment: 'left' as const }
        },
        {
          title: 'Lista de Puntos Clave',
          type: 'list' as const,
          content: 'Puntos principales del tema:',
          content_data: {
            list_items: ['Punto 1', 'Punto 2', 'Punto 3'],
            list_style: 'bullet' as const
          }
        },
        {
          title: 'Galería de Imágenes',
          type: 'gallery' as const,
          content: 'Imágenes relacionadas con el tema',
          content_data: {
            images: [],
            gallery_style: 'grid' as const
          }
        }
      ],
      services: [
        {
          title: 'Descripción del Servicio',
          type: 'text' as const,
          content: 'Descripción detallada del servicio ofrecido...',
          settings: { text_alignment: 'left' as const }
        },
        {
          title: 'Beneficios Principales',
          type: 'grid' as const,
          content: 'Principales beneficios de nuestro servicio:',
          content_data: {
            grid_items: [
              { title: 'Beneficio 1', content: 'Descripción...' },
              { title: 'Beneficio 2', content: 'Descripción...' }
            ],
            columns: 2
          }
        },
        {
          title: 'Llamada a la Acción',
          type: 'cta' as const,
          content: 'Contacta con nosotros para más información',
          content_data: {
            cta_text: 'Solicitar Información',
            cta_link: '/contact',
            cta_style: 'primary' as const
          }
        }
      ],
      compromiso: [
        {
          title: 'Nuestro Compromiso',
          type: 'quote' as const,
          content: '',
          content_data: {
            quote_text: 'Comprometidos con la excelencia y la sostenibilidad en cada proyecto.',
            quote_author: 'Equipo Métrica FM',
            quote_source: 'Política de Calidad'
          }
        },
        {
          title: 'Iniciativas Actuales',
          type: 'list' as const,
          content: 'Nuestras iniciativas de responsabilidad social:',
          content_data: {
            list_items: ['Educación comunitaria', 'Medio ambiente', 'Desarrollo local'],
            list_style: 'checklist' as const
          }
        }
      ]
    };

    return contextTemplates[contextType as keyof typeof contextTemplates] || contextTemplates.blog;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Gestión de Secciones de Contenido
            <Badge variant="secondary">{sections.length}/{maxSections}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {showPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Editar' : 'Preview'}
              </Button>
            )}
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              disabled={sections.length >= maxSections}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sección
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Templates rápidos */}
        {showAddForm && (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Templates de {contextType}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {getContextTemplates().map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        {React.createElement(sectionTypeIcons[template.type!], { className: "w-4 h-4" })}
                        <span className="font-medium">{template.title}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{template.type}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de nueva sección */}
        {showAddForm && !previewMode && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      value={newSection.title || ''}
                      onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la sección"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo de Sección</label>
                    <select
                      value={newSection.type || 'text'}
                      onChange={(e) => setNewSection(prev => ({ ...prev, type: e.target.value as ContentSection['type'] }))}
                      className="w-full p-2 border rounded"
                    >
                      {availableTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Subtítulo</label>
                  <Input
                    value={newSection.subtitle || ''}
                    onChange={(e) => setNewSection(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Subtítulo opcional"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Contenido</label>
                  <Textarea
                    value={newSection.content || ''}
                    onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenido de la sección..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddSection} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vista Preview */}
        {previewMode ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vista Previa de Secciones</h3>
            {sections
              .filter(section => section.status === 'visible')
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div 
                  key={section.id}
                  className="border rounded-lg p-6"
                  style={{
                    backgroundColor: section.settings.background_color || 'transparent',
                    color: section.settings.text_color || 'inherit',
                    textAlign: section.settings.text_alignment || 'left'
                  }}
                >
                  <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  {section.subtitle && (
                    <h3 className="text-lg text-gray-600 mb-4">{section.subtitle}</h3>
                  )}
                  <div className="prose max-w-none">
                    {section.content && <p>{section.content}</p>}
                    
                    {/* Renderizado específico por tipo */}
                    {section.type === 'list' && section.content_data?.list_items && (
                      <ul className="mt-4">
                        {section.content_data.list_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}

                    {section.type === 'grid' && section.content_data?.grid_items && (
                      <div className={`grid grid-cols-${section.content_data.columns || 2} gap-4 mt-4`}>
                        {section.content_data.grid_items.map((item, index) => (
                          <div key={index} className="border rounded p-4">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'quote' && section.content_data?.quote_text && (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic mt-4">
                        <p>"{section.content_data.quote_text}"</p>
                        {section.content_data.quote_author && (
                          <footer className="text-sm text-gray-600 mt-2">
                            - {section.content_data.quote_author}
                          </footer>
                        )}
                      </blockquote>
                    )}

                    {section.type === 'cta' && section.content_data?.cta_text && (
                      <div className="mt-4 text-center">
                        <Button 
                          variant={section.content_data.cta_style === 'primary' ? 'default' : 'outline'}
                          size="lg"
                        >
                          {section.content_data.cta_text}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Lista de secciones para edición */
          allowReordering ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {sections.map((section, index) => (
                      <ContentSectionItem
                        key={section.id}
                        section={section}
                        index={index}
                        editingId={editingId}
                        onEdit={setEditingId}
                        onUpdate={handleUpdateSection}
                        onDelete={handleDeleteSection}
                        onDuplicate={handleDuplicateSection}
                        onToggleVisibility={toggleSectionVisibility}
                        onToggleExpansion={toggleSectionExpansion}
                        expanded={expandedSections.has(section.id)}
                        sectionTypeIcons={sectionTypeIcons}
                        availableTypes={availableTypes}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <ContentSectionItem
                  key={section.id}
                  section={section}
                  index={index}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onUpdate={handleUpdateSection}
                  onDelete={handleDeleteSection}
                  onDuplicate={handleDuplicateSection}
                  onToggleVisibility={toggleSectionVisibility}
                  onToggleExpansion={toggleSectionExpansion}
                  expanded={expandedSections.has(section.id)}
                  sectionTypeIcons={sectionTypeIcons}
                  availableTypes={availableTypes}
                  draggable={false}
                />
              ))}
            </div>
          )
        )}

        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay secciones de contenido configuradas</p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              Crear primera sección
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de sección
interface ContentSectionItemProps {
  section: ContentSection;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ContentSection>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (section: ContentSection) => void;
  onToggleVisibility: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  expanded: boolean;
  sectionTypeIcons: any;
  availableTypes: ContentSection['type'][];
  draggable?: boolean;
}

const ContentSectionItem: React.FC<ContentSectionItemProps> = ({
  section,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleExpansion,
  expanded,
  sectionTypeIcons,
  availableTypes,
  draggable = true
}) => {
  const [editData, setEditData] = useState<Partial<ContentSection>>(section);
  const IconComponent = sectionTypeIcons[section.type];

  const handleSave = () => {
    onUpdate(section.id, editData);
  };

  const ContentSectionContent = () => (
    <Card className={`${section.status === 'hidden' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {editingId === section.id ? (
          // Modo edición
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={editData.type || 'text'}
                  onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as ContentSection['type'] }))}
                  className="w-full p-2 border rounded"
                >
                  {availableTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Subtítulo</label>
              <Input
                value={editData.subtitle || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                value={editData.content || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={() => onEdit(null)} size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Modo visualización
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {draggable && (
                  <Move className="w-4 h-4 text-gray-400 cursor-grab" />
                )}
                <IconComponent className="w-5 h-5 text-[#003F6F]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {section.type}
                    </Badge>
                    {section.status === 'hidden' && (
                      <Badge variant="destructive">Oculta</Badge>
                    )}
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-gray-600">{section.subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpansion(section.id)}
                  title={expanded ? "Contraer" : "Expandir"}
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility(section.id)}
                  title={section.status === 'visible' ? "Ocultar" : "Mostrar"}
                >
                  {section.status === 'visible' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(section)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(section.id)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(section.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contenido expandible */}
            {expanded && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Contenido:</strong>
                </div>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {section.content || <em>Sin contenido</em>}
                </p>
                
                {/* Información adicional según tipo */}
                {section.type === 'list' && section.content_data?.list_items && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-600">Items de la lista:</div>
                    <ul className="text-sm text-gray-600 ml-4">
                      {section.content_data.list_items.slice(0, 3).map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                      {section.content_data.list_items.length > 3 && (
                        <li>... y {section.content_data.list_items.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}

                {section.metadata?.updated_at && (
                  <div className="mt-2 text-xs text-gray-400">
                    Última actualización: {new Date(section.metadata.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (draggable) {
    return (
      <Draggable draggableId={section.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <ContentSectionContent />
          </div>
        )}
      </Draggable>
    );
  }

  return <ContentSectionContent />;
};