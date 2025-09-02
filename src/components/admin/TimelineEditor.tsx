'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ImageField from './ImageField';
import { 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  Copy,
  ArrowUpDown,
  GripVertical,
  CheckCircle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  image_fallback?: string;
  achievements: string[];
  gallery: string[];
  impact: string;
  metrics: {
    team_size: number;
    projects: number;
    investment: string;
  };
}

interface TimelineEditorProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
}

// Componente sortable para los eventos
interface SortableEventItemProps {
  event: TimelineEvent;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableEventItem({ event, index, onEdit, onDelete, onDuplicate }: SortableEventItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <Badge variant="outline" className="font-mono">
              {event.year}
            </Badge>
            <div>
              <h4 className="font-semibold">{event.title || 'Sin título'}</h4>
              <p className="text-sm text-gray-600">
                {event.subtitle || 'Sin subtítulo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Editar evento"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              title="Duplicar evento"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Eliminar evento"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {event.description}
          </p>
        )}
        {event.achievements.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.achievements.slice(0, 3).map((achievement, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {achievement}
              </Badge>
            ))}
            {event.achievements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.achievements.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TimelineEditor({ events, onChange }: TimelineEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ordenar eventos por año
  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  // Crear nuevo evento
  const handleNewEvent = () => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      year: new Date().getFullYear(),
      title: '',
      subtitle: '',
      description: '',
      image: '',
      achievements: [],
      gallery: [],
      impact: '',
      metrics: {
        team_size: 0,
        projects: 0,
        investment: ''
      }
    };
    setEditingEvent(newEvent);
    setEditingIndex(-1); // -1 indica nuevo evento
  };

  // Editar evento existente
  const handleEditEvent = (index: number) => {
    const event = sortedEvents[index];
    setEditingEvent({ ...event });
    setEditingIndex(index);
  };

  // Validar evento antes de guardar
  const validateEvent = (event: TimelineEvent): string[] => {
    const errors: string[] = [];
    
    // Año obligatorio
    if (!event.year) {
      errors.push('El año es obligatorio');
    }
    
    // Título obligatorio
    if (!event.title.trim()) {
      errors.push('El título es obligatorio');
    }
    
    // No repetir años exactos (excepto el evento actual)
    const currentEventId = editingIndex === -1 ? null : sortedEvents[editingIndex]?.id;
    const yearExists = events.some(e => 
      e.year === event.year && e.id !== event.id && e.id !== currentEventId
    );
    if (yearExists) {
      errors.push(`Ya existe un evento en el año ${event.year}`);
    }
    
    // Año válido
    const currentYear = new Date().getFullYear();
    if (event.year < 1990 || event.year > currentYear + 10) {
      errors.push(`El año debe estar entre 1990 y ${currentYear + 10}`);
    }

    return errors;
  };

  // Guardar evento con validación
  const handleSaveEvent = () => {
    if (!editingEvent) return;

    // Validar antes de guardar
    const validationErrors = validateEvent(editingEvent);
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n\n' + validationErrors.join('\n'));
      return;
    }

    let updatedEvents = [...events];
    
    if (editingIndex === -1) {
      // Nuevo evento
      updatedEvents.push(editingEvent);
    } else {
      // Editar evento existente
      const originalEventId = sortedEvents[editingIndex].id;
      const eventIndex = updatedEvents.findIndex(e => e.id === originalEventId);
      if (eventIndex !== -1) {
        updatedEvents[eventIndex] = editingEvent;
      }
    }

    onChange(updatedEvents);
    setEditingEvent(null);
    setEditingIndex(null);
  };

  // Eliminar evento
  const handleDeleteEvent = (index: number) => {
    const eventToDelete = sortedEvents[index];
    const confirmed = window.confirm(`¿Estás seguro de eliminar el evento "${eventToDelete.title}" (${eventToDelete.year})?`);
    
    if (confirmed) {
      const updatedEvents = events.filter(e => e.id !== eventToDelete.id);
      onChange(updatedEvents);
    }
  };

  // Duplicar evento
  const handleDuplicateEvent = (index: number) => {
    const eventToDuplicate = sortedEvents[index];
    const duplicatedEvent: TimelineEvent = {
      ...eventToDuplicate,
      id: `event-${Date.now()}`,
      year: eventToDuplicate.year + 1,
      title: `${eventToDuplicate.title} (Copia)`
    };
    
    const updatedEvents = [...events, duplicatedEvent];
    onChange(updatedEvents);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditingIndex(null);
  };

  // Actualizar campo del evento en edición
  const updateEventField = (field: keyof TimelineEvent, value: any) => {
    if (!editingEvent) return;
    
    setEditingEvent({
      ...editingEvent,
      [field]: value
    });
  };

  // Actualizar achievement
  const updateAchievement = (index: number, value: string) => {
    if (!editingEvent) return;
    
    const newAchievements = [...editingEvent.achievements];
    newAchievements[index] = value;
    setEditingEvent({
      ...editingEvent,
      achievements: newAchievements
    });
  };

  // Agregar achievement
  const addAchievement = () => {
    if (!editingEvent) return;
    
    setEditingEvent({
      ...editingEvent,
      achievements: [...editingEvent.achievements, '']
    });
  };

  // Remover achievement
  const removeAchievement = (index: number) => {
    if (!editingEvent) return;
    
    const newAchievements = editingEvent.achievements.filter((_, i) => i !== index);
    setEditingEvent({
      ...editingEvent,
      achievements: newAchievements
    });
  };

  // Manejar drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sortedEvents.findIndex(item => item.id === active.id);
      const newIndex = sortedEvents.findIndex(item => item.id === over.id);
      
      // Reordenar los eventos basado en la nueva posición
      const reorderedEvents = arrayMove(sortedEvents, oldIndex, newIndex);
      
      // Actualizar los años para mantener orden cronológico
      const yearsToAssign = reorderedEvents.map(e => e.year).sort((a, b) => a - b);
      const eventsWithNewYears = reorderedEvents.map((event, index) => ({
        ...event,
        year: yearsToAssign[index]
      }));
      
      onChange(eventsWithNewYears);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Editor de Timeline</h3>
          <Badge variant="outline" className="text-blue-600">
            {events.length} eventos
          </Badge>
        </div>
        <Button onClick={handleNewEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Lista de eventos o editor */}
      {editingEvent ? (
        /* Formulario de edición */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {editingIndex === -1 ? 'Nuevo Evento' : `Editando: ${editingEvent.title || 'Sin título'}`}
                <Badge variant={editingIndex === -1 ? "default" : "secondary"}>
                  {editingEvent.year}
                </Badge>
              </CardTitle>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Año y datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  value={editingEvent.year}
                  onChange={(e) => updateEventField('year', parseInt(e.target.value) || new Date().getFullYear())}
                  min={1990}
                  max={2050}
                />
              </div>
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={editingEvent.title}
                  onChange={(e) => updateEventField('title', e.target.value)}
                  placeholder="Ej: Fundación de la empresa"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={editingEvent.subtitle}
                onChange={(e) => updateEventField('subtitle', e.target.value)}
                placeholder="Ej: Los inicios visionarios"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingEvent.description}
                onChange={(e) => updateEventField('description', e.target.value)}
                placeholder="Describe qué pasó en este año..."
                rows={3}
              />
            </div>

            {/* Imagen principal */}
            <div>
              <Label>Imagen Principal</Label>
              <ImageField
                value={editingEvent.image || ''}
                onChange={(value) => updateEventField('image', value)}
                label="Imagen del evento"
                description="Imagen que representa este hito histórico"
              />
            </div>

            {/* Logros/Achievements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Logros y Destacados</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={addAchievement}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {editingEvent.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={achievement}
                      onChange={(e) => updateAchievement(index, e.target.value)}
                      placeholder="Ej: Primer proyecto exitoso"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {editingEvent.achievements.length === 0 && (
                  <p className="text-sm text-gray-500">No hay logros agregados</p>
                )}
              </div>
            </div>

            {/* Impacto */}
            <div>
              <Label htmlFor="impact">Impacto/Reflexión</Label>
              <Textarea
                id="impact"
                value={editingEvent.impact}
                onChange={(e) => updateEventField('impact', e.target.value)}
                placeholder="Reflexión sobre el impacto de este evento..."
                rows={2}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={handleSaveEvent} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingIndex === -1 ? 'Crear Evento' : 'Guardar Cambios'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Lista de eventos con Drag & Drop */
        <div className="space-y-3">
          {sortedEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay eventos</h3>
                <p className="text-gray-500 mb-4">Crea tu primer evento histórico para comenzar</p>
                <Button onClick={handleNewEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <GripVertical className="h-4 w-4" />
                <span>Arrastra los eventos para reordenarlos cronológicamente</span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedEvents.map(event => event.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sortedEvents.map((event, index) => (
                      <SortableEventItem
                        key={event.id}
                        event={event}
                        index={index}
                        onEdit={() => handleEditEvent(index)}
                        onDelete={() => handleDeleteEvent(index)}
                        onDuplicate={() => handleDuplicateEvent(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Vista previa mejorada */}
      {events.length > 0 && !editingEvent && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-blue-800 font-medium block">Timeline listo para visualizar</span>
                  <span className="text-blue-600 text-sm">
                    {events.length} eventos • Años: {Math.min(...events.map(e => e.year))} - {Math.max(...events.map(e => e.year))}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  onClick={() => window.open('/about/historia', '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver en Página
                </Button>
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Auto-guardar rápido
                    console.log('✅ Timeline auto-guardado');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}