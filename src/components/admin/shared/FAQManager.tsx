'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Search, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Eye,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  status: 'active' | 'inactive';
  tags?: string[];
  helpful_count?: number;
  last_updated?: string;
  context?: 'contact' | 'services' | 'careers' | 'general';
}

interface FAQManagerProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
  allowCategories?: boolean;
  allowReordering?: boolean;
  allowTags?: boolean;
  maxFAQs?: number;
  contextType?: 'contact' | 'services' | 'careers' | 'general';
  categories?: string[];
  showHelpfulCounts?: boolean;
  allowExport?: boolean;
  allowImport?: boolean;
  validation?: {
    questionRequired?: boolean;
    questionMaxLength?: number;
    answerRequired?: boolean;
    answerMaxLength?: number;
  };
}

export const FAQManager: React.FC<FAQManagerProps> = ({
  faqs = [],
  onChange,
  allowCategories = true,
  allowReordering = true,
  allowTags = true,
  maxFAQs = 50,
  contextType = 'general',
  categories = [],
  showHelpfulCounts = false,
  allowExport = true,
  allowImport = true,
  validation = {
    questionRequired: true,
    questionMaxLength: 200,
    answerRequired: true,
    answerMaxLength: 1000
  }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newFAQ, setNewFAQ] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    category: categories[0] || '',
    status: 'active',
    tags: []
  });

  // Filtrar FAQs
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas de FAQs existentes
  const usedCategories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];
  const allCategories = [...new Set([...categories, ...usedCategories])];

  // Agregar nueva FAQ
  const handleAddFAQ = () => {
    if (!newFAQ.question?.trim() || !newFAQ.answer?.trim()) return;

    const id = Date.now().toString();
    const faq: FAQ = {
      id,
      question: newFAQ.question.trim(),
      answer: newFAQ.answer.trim(),
      category: newFAQ.category || undefined,
      order: faqs.length,
      status: newFAQ.status || 'active',
      tags: newFAQ.tags || [],
      helpful_count: 0,
      last_updated: new Date().toISOString(),
      context: contextType
    };

    onChange([...faqs, faq]);
    setNewFAQ({ question: '', answer: '', category: categories[0] || '', status: 'active', tags: [] });
    setShowAddForm(false);
  };

  // Actualizar FAQ existente
  const handleUpdateFAQ = (id: string, updates: Partial<FAQ>) => {
    const updatedFAQs = faqs.map(faq => 
      faq.id === id 
        ? { 
            ...faq, 
            ...updates,
            last_updated: new Date().toISOString()
          }
        : faq
    );
    onChange(updatedFAQs);
    setEditingId(null);
  };

  // Eliminar FAQ
  const handleDeleteFAQ = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta FAQ?')) {
      const updatedFAQs = faqs.filter(faq => faq.id !== id);
      onChange(updatedFAQs);
    }
  };

  // Reordenar FAQs
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    const items = Array.from(filteredFAQs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedFAQs = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Mantener FAQs no filtradas y actualizar las reordenadas
    const otherFAQs = faqs.filter(faq => !filteredFAQs.includes(faq));
    onChange([...otherFAQs, ...reorderedFAQs]);
  };

  // Duplicar FAQ
  const handleDuplicateFAQ = (faq: FAQ) => {
    const duplicated: FAQ = {
      ...faq,
      id: Date.now().toString(),
      question: `${faq.question} (Copia)`,
      order: faqs.length,
      last_updated: new Date().toISOString()
    };
    onChange([...faqs, duplicated]);
  };

  // Exportar FAQs
  const handleExportFAQs = () => {
    const dataStr = JSON.stringify(filteredFAQs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faqs-${contextType}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Aplicar templates según contexto
  const applyContextTemplates = () => {
    const templates = getTemplatesByContext(contextType);
    const newFAQs = templates.map((template, index) => ({
      id: Date.now().toString() + index,
      question: template.question,
      answer: template.answer,
      category: template.category || '',
      order: faqs.length + index,
      status: 'active' as const,
      tags: template.tags || [],
      helpful_count: 0,
      last_updated: new Date().toISOString(),
      context: contextType
    }));

    onChange([...faqs, ...newFAQs]);
  };

  const getTemplatesByContext = (context: string) => {
    const templates = {
      contact: [
        {
          question: '¿Cuál es el horario de atención?',
          answer: 'Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM, y sábados de 9:00 AM a 1:00 PM.',
          category: 'horarios',
          tags: ['horario', 'atención']
        },
        {
          question: '¿Cómo puedo solicitar una cotización?',
          answer: 'Puedes solicitar una cotización completando nuestro formulario de contacto o llamando directamente a nuestros teléfonos.',
          category: 'cotizaciones',
          tags: ['cotización', 'presupuesto']
        }
      ],
      services: [
        {
          question: '¿Qué servicios ofrecen?',
          answer: 'Ofrecemos consultoría estratégica, gestión integral de proyectos, supervisión técnica y auditoría de calidad.',
          category: 'servicios',
          tags: ['servicios', 'consultoría']
        },
        {
          question: '¿Cuánto tiempo dura un proyecto típico?',
          answer: 'La duración varía según la complejidad del proyecto, pero típicamente oscila entre 6 meses y 2 años.',
          category: 'plazos',
          tags: ['tiempo', 'duración', 'plazos']
        }
      ],
      careers: [
        {
          question: '¿Cómo puedo aplicar a una vacante?',
          answer: 'Puedes aplicar a través de nuestro portal de empleos o enviando tu CV a nuestro correo de recursos humanos.',
          category: 'aplicaciones',
          tags: ['trabajo', 'aplicar', 'cv']
        },
        {
          question: '¿Ofrecen oportunidades de crecimiento?',
          answer: 'Sí, contamos con programas de desarrollo profesional y oportunidades de crecimiento interno.',
          category: 'desarrollo',
          tags: ['crecimiento', 'desarrollo', 'carrera']
        }
      ]
    };
    return templates[context as keyof typeof templates] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Gestión de FAQ
            <Badge variant="secondary">{faqs.length}/{maxFAQs}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Editar' : 'Preview'}
            </Button>
            {allowExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFAQs}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={applyContextTemplates}
              disabled={faqs.length >= maxFAQs}
            >
              <Plus className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              disabled={faqs.length >= maxFAQs}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva FAQ
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar preguntas, respuestas o tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {allowCategories && allCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Formulario de nueva FAQ */}
        {showAddForm && !previewMode && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pregunta *</label>
                  <Input
                    value={newFAQ.question || ''}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="¿Cuál es tu pregunta?"
                    maxLength={validation.questionMaxLength}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Respuesta *</label>
                  <Textarea
                    value={newFAQ.answer || ''}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Proporciona una respuesta clara y completa"
                    maxLength={validation.answerMaxLength}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allowCategories && (
                    <div>
                      <label className="text-sm font-medium">Categoría</label>
                      <select
                        value={newFAQ.category || ''}
                        onChange={(e) => setNewFAQ(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Sin categoría</option>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {allowTags && (
                    <div>
                      <label className="text-sm font-medium">Tags (separados por comas)</label>
                      <Input
                        value={newFAQ.tags?.join(', ') || ''}
                        onChange={(e) => setNewFAQ(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddFAQ} size="sm">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preguntas Frecuentes</h3>
            {filteredFAQs.map((faq, index) => (
              <Collapsible key={faq.id}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 border border-t-0 rounded-b-lg">
                  <p className="text-gray-700">{faq.answer}</p>
                  {allowTags && faq.tags && faq.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {faq.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          /* Lista de FAQs para edición */
          allowReordering ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable 
                droppableId="faqs" 
                isDropDisabled={false} 
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {filteredFAQs.map((faq, index) => (
                      <FAQItem
                        key={faq.id}
                        faq={faq}
                        index={index}
                        editingId={editingId}
                        onEdit={setEditingId}
                        onUpdate={handleUpdateFAQ}
                        onDelete={handleDeleteFAQ}
                        onDuplicate={handleDuplicateFAQ}
                        allowCategories={allowCategories}
                        allowTags={allowTags}
                        showHelpfulCounts={showHelpfulCounts}
                        categories={allCategories}
                        validation={validation}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  index={index}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onUpdate={handleUpdateFAQ}
                  onDelete={handleDeleteFAQ}
                  onDuplicate={handleDuplicateFAQ}
                  allowCategories={allowCategories}
                  allowTags={allowTags}
                  showHelpfulCounts={showHelpfulCounts}
                  categories={allCategories}
                  validation={validation}
                  draggable={false}
                />
              ))}
            </div>
          )
        )}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay FAQs{searchTerm || selectedCategory !== 'all' ? ' que coincidan con los filtros' : ''}</p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(true)}
                className="mt-2"
              >
                Crear primera FAQ
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de FAQ
interface FAQItemProps {
  faq: FAQ;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<FAQ>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (faq: FAQ) => void;
  allowCategories: boolean;
  allowTags: boolean;
  showHelpfulCounts: boolean;
  categories: string[];
  validation: any;
  draggable?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  allowCategories,
  allowTags,
  showHelpfulCounts,
  categories,
  validation,
  draggable = true
}) => {
  const [editData, setEditData] = useState<Partial<FAQ>>(faq);

  const handleSave = () => {
    onUpdate(faq.id, editData);
  };

  const FAQContent = () => (
    <Card className={`${faq.status === 'inactive' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {editingId === faq.id ? (
          // Modo edición
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pregunta</label>
              <Input
                value={editData.question || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, question: e.target.value }))}
                maxLength={validation.questionMaxLength}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Respuesta</label>
              <Textarea
                value={editData.answer || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, answer: e.target.value }))}
                maxLength={validation.answerMaxLength}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allowCategories && (
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    value={editData.category || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {allowTags && (
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={editData.tags?.join(', ') || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              )}
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
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {draggable && (
                  <Move className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              </div>
              
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(faq)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(faq.id)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(faq.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Metadatos */}
            <div className="flex flex-wrap gap-2 mt-3">
              {faq.category && allowCategories && (
                <Badge variant="outline">{faq.category}</Badge>
              )}
              {faq.tags && faq.tags.length > 0 && allowTags && (
                <div className="flex gap-1">
                  {faq.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {showHelpfulCounts && faq.helpful_count !== undefined && (
                <Badge variant="outline" className="text-xs">
                  👍 {faq.helpful_count}
                </Badge>
              )}
              {faq.status === 'inactive' && (
                <Badge variant="destructive">Inactiva</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (draggable) {
    return (
      <Draggable draggableId={faq.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <FAQContent />
          </div>
        )}
      </Draggable>
    );
  }

  return <FAQContent />;
};