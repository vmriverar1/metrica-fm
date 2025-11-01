'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, Trash2, Edit3, Save, X, Target, Users, Lightbulb, Shield, TrendingUp, Palette, Image as ImageIcon, GripVertical, Folder } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import UnifiedMediaLibrary from './UnifiedMediaLibrary';

interface Value {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  images: string[];
  image_descriptions: string[];
}

interface ValuesEditorProps {
  value?: Value[];
  onChange: (value: Value[]) => void;
  disabled?: boolean;
}

const availableIcons = [
  { value: 'Target', label: 'Target (Excelencia)', icon: Target },
  { value: 'Users', label: 'Users (Colaboración)', icon: Users },
  { value: 'Lightbulb', label: 'Lightbulb (Innovación)', icon: Lightbulb },
  { value: 'Shield', label: 'Shield (Integridad)', icon: Shield },
  { value: 'TrendingUp', label: 'TrendingUp (Crecimiento)', icon: TrendingUp },
  { value: 'Heart', label: 'Heart (Compromiso)', icon: Heart },
];

const availableColors = [
  { value: '#00A8E8', label: 'Naranja Principal', color: '#00A8E8' },
  { value: '#003F6F', label: 'Azul Principal', color: '#003F6F' },
  { value: '#D0D0D0', label: 'Gris Claro', color: '#D0D0D0' },
  { value: '#9D9D9C', label: 'Gris Medio', color: '#9D9D9C' },
  { value: '#646363', label: 'Gris Oscuro', color: '#646363' },
  { value: '#1D1D1B', label: 'Negro', color: '#1D1D1B' },
];

const defaultValue: Omit<Value, 'id'> = {
  title: '',
  description: '',
  icon: 'Target',
  color: '#00A8E8',
  size: 'medium',
  images: [],
  image_descriptions: []
};

export default function ValuesEditor({
  value = [],
  onChange,
  disabled = false
}: ValuesEditorProps) {
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Value | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const addValue = () => {
    const newId = `value-${Date.now()}`;
    const newValue: Value = {
      ...defaultValue,
      id: newId,
      title: 'Nuevo Valor',
      description: 'Descripción del nuevo valor empresarial'
    };
    
    onChange([...value, newValue]);
    setEditingValue(newId);
    setEditForm(newValue);
  };

  const removeValue = (id: string) => {
    onChange(value.filter(val => val.id !== id));
    if (editingValue === id) {
      setEditingValue(null);
      setEditForm(null);
    }
  };

  const startEdit = (val: Value) => {
    setEditingValue(val.id);
    setEditForm({ ...val });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    onChange(value.map(val => 
      val.id === editForm.id ? editForm : val
    ));
    
    setEditingValue(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingValue(null);
    setEditForm(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const updateEditForm = (field: keyof Value, newValue: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: newValue });
  };

  const updateImageDescriptions = (images: string[]) => {
    if (!editForm) return;
    
    // Ajustar descripciones al número de imágenes
    const descriptions = [...editForm.image_descriptions];
    while (descriptions.length < images.length) {
      descriptions.push('Descripción de la imagen');
    }
    while (descriptions.length > images.length) {
      descriptions.pop();
    }
    
    setEditForm({ 
      ...editForm, 
      images: images,
      image_descriptions: descriptions 
    });
  };

  const updateImageDescription = (index: number, description: string) => {
    if (!editForm) return;
    
    const newDescriptions = [...editForm.image_descriptions];
    newDescriptions[index] = description;
    setEditForm({ ...editForm, image_descriptions: newDescriptions });
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = availableIcons.find(i => i.value === iconName);
    return iconConfig ? iconConfig.icon : Target;
  };

  const ValueCard = ({ val }: { val: Value }) => {
    const isEditing = editingValue === val.id;
    const IconComponent = getIconComponent(val.icon);
    
    if (isEditing && editForm) {
      return (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editando: {editForm.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>
                  <Save className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div>
                  <Label>Título del Valor</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => updateEditForm('title', e.target.value)}
                    placeholder="Excelencia"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="Descripción detallada del valor..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ícono</Label>
                    <Select 
                      value={editForm.icon} 
                      onValueChange={(val) => updateEditForm('icon', val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map(icon => {
                          const Icon = icon.icon;
                          return (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tamaño</Label>
                    <Select 
                      value={editForm.size} 
                      onValueChange={(val) => updateEditForm('size', val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Mediano</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableColors.map(colorOption => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => updateEditForm('color', colorOption.value)}
                        className={`p-2 rounded border-2 text-xs ${
                          editForm.color === colorOption.value 
                            ? 'border-primary' 
                            : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: colorOption.color }}
                      >
                        <div 
                          className="w-full h-4 rounded"
                          style={{ 
                            backgroundColor: colorOption.color,
                            color: colorOption.value === '#D0D0D0' ? '#000' : '#fff'
                          }}
                        >
                          {editForm.color === colorOption.value && '✓'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Galería e imágenes */}
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Galería de Imágenes
                  </Label>

                  {/* Preview de imágenes seleccionadas */}
                  {editForm.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {editForm.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => {
                              const newImages = editForm.images.filter((_, i) => i !== idx);
                              const newDescriptions = editForm.image_descriptions.filter((_, i) => i !== idx);
                              setEditForm({
                                ...editForm,
                                images: newImages,
                                image_descriptions: newDescriptions
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaLibrary(true)}
                    className="w-full"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {editForm.images.length > 0 ? 'Gestionar Imágenes' : 'Seleccionar Imágenes desde Biblioteca'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Abre la biblioteca de medios estilo WordPress para seleccionar imágenes
                  </p>
                </div>

                {/* Descripciones de imágenes */}
                {editForm.images.length > 0 && (
                  <div>
                    <Label>Descripciones de Imágenes</Label>
                    <div className="space-y-2 mt-2">
                      {editForm.images.map((_, index) => (
                        <Input
                          key={index}
                          value={editForm.image_descriptions[index] || ''}
                          onChange={(e) => updateImageDescription(index, e.target.value)}
                          placeholder={`Descripción de la imagen ${index + 1}`}
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            {!disabled && (
              <div className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-1">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
            )}

            {/* Ícono */}
            <div
              className="flex-shrink-0 p-3 rounded-lg"
              style={{ backgroundColor: `${val.color}20`, color: val.color }}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{val.title}</h4>
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${val.color}20`, 
                        color: val.color 
                      }}
                    >
                      {val.size}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {val.description}
                  </p>
                  
                  {val.images.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      <ImageIcon className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {val.images.length} imagen{val.images.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {!disabled && (
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(val)}
                      className="px-2"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeValue(val.id)}
                      className="px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Valores Empresariales
              <Badge variant="outline">{value.length} valores</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los valores fundamentales de la empresa con sus íconos, colores e imágenes representativas.
            </p>
          </div>
          
          {!disabled && (
            <Button onClick={addValue}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Valor
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {value.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay valores definidos</h3>
            <p className="text-sm mb-4">Agrega el primer valor empresarial para comenzar</p>
            {!disabled && (
              <Button onClick={addValue}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Valor
              </Button>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="values-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {value.map((val, index) => (
                    <Draggable
                      key={val.id}
                      draggableId={val.id}
                      index={index}
                      isDragDisabled={disabled || editingValue === val.id}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <ValueCard val={val} />
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

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Contenido:</h5>
              <ul className="space-y-1">
                <li>• Títulos concisos (1-2 palabras)</li>
                <li>• Descripciones de 100-150 palabras</li>
                <li>• 2-4 imágenes representativas por valor</li>
                <li>• Descripciones específicas por imagen</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Diseño:</h5>
              <ul className="space-y-1">
                <li>• Usar colores de la marca consistentemente</li>
                <li>• Iconos que representen el concepto</li>
                <li>• Tamaños: large para destacados, medium/small para otros</li>
                <li>• Máximo 6-8 valores para mejor legibilidad</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Unified Media Library Modal */}
      {editForm && (
        <UnifiedMediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(selectedImages) => {
            const imageUrls = selectedImages.map(img => img.url);
            updateImageDescriptions(imageUrls);
            setShowMediaLibrary(false);
          }}
          multiSelect={true}
          selectedImages={editForm.images}
          title="Seleccionar Imágenes para el Valor"
        />
      )}
    </Card>
  );
}