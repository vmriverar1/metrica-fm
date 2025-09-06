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
  Star,
  Quote,
  User,
  Building,
  Calendar,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Award,
  Filter,
  Search
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  testimonial: string;
  rating: number; // 1-5 stars
  avatar?: string;
  status: 'visible' | 'hidden' | 'pending';
  order: number;
  featured: boolean;
  context?: 'services' | 'compromiso' | 'cultura' | 'general';
  location?: string;
  date?: string;
  project_related?: string;
  service_related?: string;
  tags?: string[];
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    verified?: boolean;
    source?: 'direct' | 'google' | 'email' | 'survey' | 'interview';
    language?: 'es' | 'en';
  };
}

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
  allowReordering?: boolean;
  maxTestimonials?: number;
  contextType?: 'services' | 'compromiso' | 'cultura' | 'general';
  showPreview?: boolean;
  showRatingFilter?: boolean;
  showContextFilter?: boolean;
  templates?: Partial<Testimonial>[];
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({
  testimonials = [],
  onChange,
  allowReordering = true,
  maxTestimonials = 50,
  contextType = 'general',
  showPreview = true,
  showRatingFilter = true,
  showContextFilter = true,
  templates = []
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<string>>(new Set());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterContext, setFilterContext] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    position: '',
    company: '',
    testimonial: '',
    rating: 5,
    status: 'visible',
    featured: false,
    context: contextType,
    tags: [],
    metadata: {
      source: 'direct',
      verified: false,
      language: 'es'
    }
  });

  // Agregar nuevo testimonio
  const handleAddTestimonial = () => {
    if (!newTestimonial.name?.trim() || !newTestimonial.testimonial?.trim()) return;

    const id = Date.now().toString();
    const testimonial: Testimonial = {
      id,
      name: newTestimonial.name.trim(),
      position: newTestimonial.position?.trim() || '',
      company: newTestimonial.company?.trim() || '',
      testimonial: newTestimonial.testimonial.trim(),
      rating: newTestimonial.rating || 5,
      status: newTestimonial.status || 'visible',
      order: testimonials.length,
      featured: newTestimonial.featured || false,
      context: newTestimonial.context || contextType,
      location: newTestimonial.location?.trim() || '',
      date: newTestimonial.date || new Date().toISOString().split('T')[0],
      project_related: newTestimonial.project_related?.trim() || '',
      service_related: newTestimonial.service_related?.trim() || '',
      tags: newTestimonial.tags || [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin',
        verified: false,
        source: 'direct',
        language: 'es',
        ...newTestimonial.metadata
      }
    };

    onChange([...testimonials, testimonial]);
    setNewTestimonial({
      name: '',
      position: '',
      company: '',
      testimonial: '',
      rating: 5,
      status: 'visible',
      featured: false,
      context: contextType,
      tags: [],
      metadata: { source: 'direct', verified: false, language: 'es' }
    });
    setShowAddForm(false);
  };

  // Actualizar testimonio existente
  const handleUpdateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updatedTestimonials = testimonials.map(testimonial => 
      testimonial.id === id 
        ? { 
            ...testimonial, 
            ...updates,
            metadata: {
              ...testimonial.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : testimonial
    );
    onChange(updatedTestimonials);
    setEditingId(null);
  };

  // Eliminar testimonio
  const handleDeleteTestimonial = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este testimonio?')) {
      const updatedTestimonials = testimonials.filter(testimonial => testimonial.id !== id);
      onChange(updatedTestimonials);
    }
  };

  // Duplicar testimonio
  const handleDuplicateTestimonial = (testimonial: Testimonial) => {
    const duplicated: Testimonial = {
      ...testimonial,
      id: Date.now().toString(),
      name: `${testimonial.name} (Copia)`,
      order: testimonials.length,
      featured: false,
      metadata: {
        ...testimonial.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    onChange([...testimonials, duplicated]);
  };

  // Reordenar testimonios
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    const items = Array.from(getFilteredTestimonials());
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedTestimonials = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Mantener el resto de testimonios que no están en el filtro
    const otherTestimonials = testimonials.filter(t => !items.find(item => item.id === t.id));
    onChange([...reorderedTestimonials, ...otherTestimonials]);
  };

  // Toggle visibilidad de testimonio
  const toggleTestimonialVisibility = (id: string) => {
    const testimonial = testimonials.find(t => t.id === id);
    if (testimonial) {
      const newStatus = testimonial.status === 'visible' ? 'hidden' : 'visible';
      handleUpdateTestimonial(id, { status: newStatus });
    }
  };

  // Toggle featured
  const toggleTestimonialFeatured = (id: string) => {
    const testimonial = testimonials.find(t => t.id === id);
    if (testimonial) {
      handleUpdateTestimonial(id, { featured: !testimonial.featured });
    }
  };

  // Toggle expansión de testimonio
  const toggleTestimonialExpansion = (id: string) => {
    const newExpanded = new Set(expandedTestimonials);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTestimonials(newExpanded);
  };

  // Aplicar template
  const applyTemplate = (template: Partial<Testimonial>) => {
    setNewTestimonial({
      name: template.name || '',
      position: template.position || '',
      company: template.company || '',
      testimonial: template.testimonial || '',
      rating: template.rating || 5,
      status: 'visible',
      featured: false,
      context: template.context || contextType,
      location: template.location || '',
      service_related: template.service_related || '',
      tags: template.tags || [],
      metadata: { source: 'direct', verified: false, language: 'es', ...template.metadata }
    });
    setShowAddForm(true);
  };

  // Obtener templates por contexto
  const getContextTemplates = () => {
    const contextTemplates = {
      services: [
        {
          name: 'María González',
          position: 'Gerente de Proyectos',
          company: 'Constructora ABC',
          testimonial: 'El servicio de consultoría de Métrica FM fue excepcional. Su expertise técnico y profesionalismo nos ayudó a completar nuestro proyecto a tiempo y dentro del presupuesto.',
          rating: 5,
          context: 'services' as const,
          service_related: 'Consultoría en Gestión de Proyectos',
          tags: ['consultoría', 'gestión', 'profesional']
        },
        {
          name: 'Carlos Mendoza',
          position: 'Director de Obra',
          company: 'Empresa Constructora XYZ',
          testimonial: 'La supervisión técnica brindada por Métrica FM garantizó la calidad y seguridad en cada etapa de construcción. Altamente recomendado.',
          rating: 5,
          context: 'services' as const,
          service_related: 'Supervisión de Obras',
          tags: ['supervisión', 'calidad', 'seguridad']
        }
      ],
      compromiso: [
        {
          name: 'Ana López',
          position: 'Alcaldesa',
          company: 'Municipalidad de San Martín',
          testimonial: 'Métrica FM no solo cumplió con sus compromisos técnicos, sino que también demostró un verdadero compromiso social con nuestra comunidad.',
          rating: 5,
          context: 'compromiso' as const,
          tags: ['compromiso social', 'comunidad', 'responsabilidad']
        },
        {
          name: 'Roberto Vásquez',
          position: 'Líder Comunitario',
          company: 'Asociación Vecinal Los Pinos',
          testimonial: 'Durante el proyecto de infraestructura, Métrica FM mantuvo una comunicación constante con la comunidad y respetó nuestras tradiciones locales.',
          rating: 5,
          context: 'compromiso' as const,
          tags: ['comunicación', 'respeto cultural', 'participación']
        }
      ],
      cultura: [
        {
          name: 'José Ramírez',
          position: 'Ingeniero Senior',
          company: 'Métrica FM',
          testimonial: 'Trabajar en Métrica FM ha sido una experiencia enriquecedora. La cultura de excelencia y el trabajo en equipo son pilares fundamentales de la empresa.',
          rating: 5,
          context: 'cultura' as const,
          tags: ['cultura organizacional', 'excelencia', 'trabajo en equipo']
        },
        {
          name: 'Lucía Torres',
          position: 'Arquitecta',
          company: 'Métrica FM',
          testimonial: 'La empresa fomenta la innovación y el crecimiento profesional. Me siento valorada como profesional y como persona.',
          rating: 5,
          context: 'cultura' as const,
          tags: ['innovación', 'crecimiento', 'valoración personal']
        }
      ]
    };

    return contextTemplates[contextType as keyof typeof contextTemplates] || contextTemplates.services;
  };

  // Filtrar testimonios
  const getFilteredTestimonials = () => {
    return testimonials.filter(testimonial => {
      // Filtro por rating
      if (filterRating !== null && testimonial.rating !== filterRating) return false;
      
      // Filtro por contexto
      if (filterContext !== 'all' && testimonial.context !== filterContext) return false;
      
      // Filtro por featured
      if (filterFeatured !== null && testimonial.featured !== filterFeatured) return false;
      
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          testimonial.name.toLowerCase().includes(searchLower) ||
          testimonial.company?.toLowerCase().includes(searchLower) ||
          testimonial.testimonial.toLowerCase().includes(searchLower) ||
          testimonial.position?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    }).sort((a, b) => a.order - b.order);
  };

  // Renderizar estrellas
  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const filteredTestimonials = getFilteredTestimonials();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Gestión de Testimonios
            <Badge variant="secondary">{testimonials.length}/{maxTestimonials}</Badge>
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
              disabled={testimonials.length >= maxTestimonials}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Testimonio
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros y búsqueda */}
        {!previewMode && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, empresa..."
                  className="pl-10"
                />
              </div>
            </div>

            {showRatingFilter && (
              <div>
                <label className="text-sm font-medium">Rating</label>
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Todos</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>
              </div>
            )}

            {showContextFilter && (
              <div>
                <label className="text-sm font-medium">Contexto</label>
                <select
                  value={filterContext}
                  onChange={(e) => setFilterContext(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">Todos</option>
                  <option value="services">Servicios</option>
                  <option value="compromiso">Compromiso</option>
                  <option value="cultura">Cultura</option>
                  <option value="general">General</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Destacados</label>
              <select
                value={filterFeatured === null ? '' : filterFeatured.toString()}
                onChange={(e) => setFilterFeatured(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full p-2 border rounded"
              >
                <option value="">Todos</option>
                <option value="true">Solo destacados</option>
                <option value="false">No destacados</option>
              </select>
            </div>
          </div>
        )}

        {/* Templates rápidos */}
        {showAddForm && (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Templates de {contextType}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getContextTemplates().map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => applyTemplate(template)}
                    className="justify-start text-left h-auto p-4"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{template.name}</span>
                        {template.rating && renderStars(template.rating)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {template.position} - {template.company}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.testimonial?.substring(0, 80)}...
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de nuevo testimonio */}
        {showAddForm && !previewMode && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre *</label>
                      <Input
                        value={newTestimonial.name || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Rating *</label>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(newTestimonial.rating || 5, true, (rating) => 
                          setNewTestimonial(prev => ({ ...prev, rating }))
                        )}
                        <span className="text-sm text-gray-600">({newTestimonial.rating}/5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Cargo</label>
                      <Input
                        value={newTestimonial.position || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Cargo o posición"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Empresa</label>
                      <Input
                        value={newTestimonial.company || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Testimonio *</label>
                    <Textarea
                      value={newTestimonial.testimonial || ''}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, testimonial: e.target.value }))}
                      placeholder="Escriba el testimonio aquí..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newTestimonial.featured || false}
                        onCheckedChange={(featured) => setNewTestimonial(prev => ({ ...prev, featured }))}
                      />
                      <label className="text-sm font-medium">Destacar</label>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Estado</label>
                      <select
                        value={newTestimonial.status || 'visible'}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, status: e.target.value as Testimonial['status'] }))}
                        className="ml-2 p-1 border rounded"
                      >
                        <option value="visible">Visible</option>
                        <option value="hidden">Oculto</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Contexto</label>
                      <select
                        value={newTestimonial.context || contextType}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, context: e.target.value as Testimonial['context'] }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="services">Servicios</option>
                        <option value="compromiso">Compromiso</option>
                        <option value="cultura">Cultura</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ubicación</label>
                      <Input
                        value={newTestimonial.location || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ciudad, país"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Proyecto Relacionado</label>
                      <Input
                        value={newTestimonial.project_related || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, project_related: e.target.value }))}
                        placeholder="Nombre del proyecto"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Servicio Relacionado</label>
                      <Input
                        value={newTestimonial.service_related || ''}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, service_related: e.target.value }))}
                        placeholder="Servicio específico"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      value={newTestimonial.tags?.join(', ') || ''}
                      onChange={(e) => setNewTestimonial(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fuente</label>
                      <select
                        value={newTestimonial.metadata?.source || 'direct'}
                        onChange={(e) => setNewTestimonial(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, source: e.target.value as any }
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="direct">Directo</option>
                        <option value="google">Google Reviews</option>
                        <option value="email">Email</option>
                        <option value="survey">Encuesta</option>
                        <option value="interview">Entrevista</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Idioma</label>
                      <select
                        value={newTestimonial.metadata?.language || 'es'}
                        onChange={(e) => setNewTestimonial(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, language: e.target.value as 'es' | 'en' }
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newTestimonial.metadata?.verified || false}
                      onCheckedChange={(verified) => setNewTestimonial(prev => ({ 
                        ...prev, 
                        metadata: { ...prev.metadata, verified }
                      }))}
                    />
                    <label className="text-sm font-medium">Testimonio Verificado</label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleAddTestimonial} size="sm">
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
            </CardContent>
          </Card>
        )}

        {/* Vista Preview */}
        {previewMode ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vista Previa de Testimonios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials
                .filter(testimonial => testimonial.status === 'visible')
                .map((testimonial) => (
                  <Card 
                    key={testimonial.id}
                    className={`${testimonial.featured ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">
                            {testimonial.position}
                            {testimonial.company && ` - ${testimonial.company}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(testimonial.rating)}
                            {testimonial.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <blockquote className="text-gray-700 italic">
                        <Quote className="w-4 h-4 text-gray-400 mb-2" />
                        "{testimonial.testimonial}"
                      </blockquote>
                      
                      {testimonial.location && (
                        <p className="text-xs text-gray-500 mt-3">{testimonial.location}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          /* Lista de testimonios para edición */
          allowReordering ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="testimonials">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {filteredTestimonials.map((testimonial, index) => (
                      <TestimonialItem
                        key={testimonial.id}
                        testimonial={testimonial}
                        index={index}
                        editingId={editingId}
                        onEdit={setEditingId}
                        onUpdate={handleUpdateTestimonial}
                        onDelete={handleDeleteTestimonial}
                        onDuplicate={handleDuplicateTestimonial}
                        onToggleVisibility={toggleTestimonialVisibility}
                        onToggleFeatured={toggleTestimonialFeatured}
                        onToggleExpansion={toggleTestimonialExpansion}
                        expanded={expandedTestimonials.has(testimonial.id)}
                        renderStars={renderStars}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {filteredTestimonials.map((testimonial, index) => (
                <TestimonialItem
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onUpdate={handleUpdateTestimonial}
                  onDelete={handleDeleteTestimonial}
                  onDuplicate={handleDuplicateTestimonial}
                  onToggleVisibility={toggleTestimonialVisibility}
                  onToggleFeatured={toggleTestimonialFeatured}
                  onToggleExpansion={toggleTestimonialExpansion}
                  expanded={expandedTestimonials.has(testimonial.id)}
                  renderStars={renderStars}
                  draggable={false}
                />
              ))}
            </div>
          )
        )}

        {filteredTestimonials.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay testimonios que coincidan con los filtros</p>
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset filters
                setFilterRating(null);
                setFilterContext('all');
                setFilterFeatured(null);
                setSearchTerm('');
                setShowAddForm(true);
              }}
              className="mt-2"
            >
              {testimonials.length === 0 ? 'Crear primer testimonio' : 'Limpiar filtros'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de testimonio
interface TestimonialItemProps {
  testimonial: Testimonial;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Testimonial>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (testimonial: Testimonial) => void;
  onToggleVisibility: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  expanded: boolean;
  renderStars: (rating: number, interactive?: boolean, onChange?: (rating: number) => void) => JSX.Element;
  draggable?: boolean;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({
  testimonial,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleFeatured,
  onToggleExpansion,
  expanded,
  renderStars,
  draggable = true
}) => {
  const [editData, setEditData] = useState<Partial<Testimonial>>(testimonial);

  const handleSave = () => {
    onUpdate(testimonial.id, editData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visible': return 'green';
      case 'hidden': return 'gray';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const TestimonialContent = () => (
    <Card className={`${testimonial.status === 'hidden' ? 'opacity-60' : ''} ${testimonial.featured ? 'ring-2 ring-yellow-200' : ''}`}>
      <CardContent className="p-4">
        {editingId === testimonial.id ? (
          // Modo edición
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(editData.rating || 5, true, (rating) => 
                    setEditData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cargo</label>
                <Input
                  value={editData.position || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Empresa</label>
                <Input
                  value={editData.company || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Testimonio</label>
              <Textarea
                value={editData.testimonial || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, testimonial: e.target.value }))}
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
                <User className="w-5 h-5 text-[#003F6F]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    {renderStars(testimonial.rating)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-${getStatusColor(testimonial.status)}-50 text-${getStatusColor(testimonial.status)}-700`}
                    >
                      {testimonial.status}
                    </Badge>
                    {testimonial.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {testimonial.position}
                    {testimonial.company && ` - ${testimonial.company}`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpansion(testimonial.id)}
                  title={expanded ? "Contraer" : "Expandir"}
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFeatured(testimonial.id)}
                  title={testimonial.featured ? "Quitar destacado" : "Destacar"}
                  className={testimonial.featured ? 'text-yellow-600' : ''}
                >
                  <Award className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility(testimonial.id)}
                  title={testimonial.status === 'visible' ? "Ocultar" : "Mostrar"}
                >
                  {testimonial.status === 'visible' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(testimonial)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(testimonial.id)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(testimonial.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Vista previa del testimonio */}
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm text-gray-700 italic line-clamp-2">
                "{testimonial.testimonial}"
              </p>
            </div>

            {/* Contenido expandible */}
            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Testimonio completo:</div>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                    "{testimonial.testimonial}"
                  </p>
                </div>

                {(testimonial.location || testimonial.project_related || testimonial.service_related) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {testimonial.location && (
                      <div>
                        <span className="font-medium text-gray-600">Ubicación:</span>
                        <p className="text-gray-700">{testimonial.location}</p>
                      </div>
                    )}
                    {testimonial.project_related && (
                      <div>
                        <span className="font-medium text-gray-600">Proyecto:</span>
                        <p className="text-gray-700">{testimonial.project_related}</p>
                      </div>
                    )}
                    {testimonial.service_related && (
                      <div>
                        <span className="font-medium text-gray-600">Servicio:</span>
                        <p className="text-gray-700">{testimonial.service_related}</p>
                      </div>
                    )}
                  </div>
                )}

                {testimonial.tags && testimonial.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testimonial.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {testimonial.metadata && (
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Fuente: {testimonial.metadata.source}</div>
                    {testimonial.metadata.verified && (
                      <div className="text-green-600">✓ Verificado</div>
                    )}
                    {testimonial.metadata.updated_at && (
                      <div>Última actualización: {new Date(testimonial.metadata.updated_at).toLocaleDateString()}</div>
                    )}
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
      <Draggable draggableId={testimonial.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <TestimonialContent />
          </div>
        )}
      </Draggable>
    );
  }

  return <TestimonialContent />;
};