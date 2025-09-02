'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Move, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { BaseCardElement, ElementType, ELEMENT_CONFIGS } from '@/types/dynamic-elements';
import ElementForm from './ElementForm';
import ElementPreview from './ElementPreview';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface UniversalCardManagerProps<T extends BaseCardElement> {
  elements: T[];
  elementType: ElementType;
  onAdd: (element: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEdit: (id: string, element: Partial<T>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (elements: T[]) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function UniversalCardManager<T extends BaseCardElement>({
  elements,
  elementType,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  loading = false,
  error = null
}: UniversalCardManagerProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingElement, setEditingElement] = useState<T | null>(null);
  const [previewElement, setPreviewElement] = useState<T | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const config = ELEMENT_CONFIGS[elementType];
  
  // Filtrar elementos por búsqueda
  const filteredElements = elements.filter(element =>
    element.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredElements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    try {
      setActionLoading('reorder');
      await onReorder(reorderedItems as T[]);
    } catch (error) {
      console.error('Error reordenando elementos:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar creación
  const handleCreate = async (elementData: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setActionLoading('create');
      await onAdd(elementData);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creando elemento:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar edición
  const handleEdit = async (elementData: Partial<T>) => {
    if (!editingElement) return;
    
    try {
      setActionLoading(`edit-${editingElement.id}`);
      await onEdit(editingElement.id, elementData);
      setEditingElement(null);
    } catch (error) {
      console.error('Error editando elemento:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar eliminación
  const handleDelete = async (id: string) => {
    if (!confirm(`¿Estás seguro de eliminar este ${config.displayName.toLowerCase()}?`)) {
      return;
    }
    
    try {
      setActionLoading(`delete-${id}`);
      await onDelete(id);
    } catch (error) {
      console.error('Error eliminando elemento:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DynamicIcon name="Grid3X3" className="h-5 w-5 text-primary" />
                Gestión de {config.pluralName}
              </CardTitle>
              <CardDescription>
                {config.description} • {elements.length} elemento{elements.length !== 1 ? 's' : ''} total{elements.length !== 1 ? 'es' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear {config.displayName}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo {config.displayName}</DialogTitle>
                    <DialogDescription>
                      Completa la información para crear un nuevo {config.displayName.toLowerCase()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto max-h-[70vh]">
                    <ElementForm
                      elementType={elementType}
                      onSubmit={handleCreate}
                      onCancel={() => setShowCreateDialog(false)}
                      loading={actionLoading === 'create'}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Búsqueda */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Buscar ${config.pluralName.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredElements.length} de {elements.length}
            </Badge>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Elementos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Lista de {config.pluralName}
            {actionLoading === 'reorder' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </CardTitle>
          <CardDescription>
            Arrastra y suelta para reordenar los elementos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredElements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay {config.pluralName.toLowerCase()}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? `No se encontraron elementos que coincidan con "${searchTerm}"`
                  : `Crea tu primer ${config.displayName.toLowerCase()} para comenzar`
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear {config.displayName}
                </Button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable 
                droppableId="elements" 
                isDropDisabled={false} 
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-accent/5' : ''}`}
                  >
                    {filteredElements.map((element, index) => (
                      <Draggable 
                        key={element.id} 
                        draggableId={element.id} 
                        index={index}
                        isDragDisabled={!!actionLoading}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 bg-card transition-all ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                              >
                                <Move className="h-4 w-4" />
                              </div>

                              {/* Icon */}
                              <div className="flex-shrink-0">
                                {element.icon && (
                                  <DynamicIcon 
                                    name={element.icon} 
                                    className="h-8 w-8 text-primary" 
                                    fallbackIcon="Circle"
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">{element.title}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    #{element.order || index + 1}
                                  </Badge>
                                  {element.enabled === false && (
                                    <Badge variant="outline" className="text-xs">
                                      Deshabilitado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {element.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <span>ID: {element.id}</span>
                                  {element.updated_at && (
                                    <span>• Actualizado: {new Date(element.updated_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewElement(element)}
                                  disabled={!!actionLoading}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingElement(element)}
                                  disabled={!!actionLoading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(element.id)}
                                  disabled={!!actionLoading}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {actionLoading === `delete-${element.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={!!editingElement} onOpenChange={() => setEditingElement(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar {config.displayName}</DialogTitle>
            <DialogDescription>
              Modifica la información del {config.displayName.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          {editingElement && (
            <div className="overflow-y-auto max-h-[70vh]">
              <ElementForm
                elementType={elementType}
                element={editingElement}
                onSubmit={handleEdit}
                onCancel={() => setEditingElement(null)}
                loading={actionLoading === `edit-${editingElement.id}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={!!previewElement} onOpenChange={() => setPreviewElement(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Vista Previa - {previewElement?.title}</DialogTitle>
            <DialogDescription>
              Así se verá este {config.displayName.toLowerCase()} en el sitio web
            </DialogDescription>
          </DialogHeader>
          {previewElement && (
            <div className="overflow-y-auto max-h-[70vh] p-4">
              <ElementPreview
                element={previewElement}
                elementType={elementType}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}