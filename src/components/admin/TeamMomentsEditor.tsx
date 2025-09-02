'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Trash2, Edit3, Save, X, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import ImageField from './ImageField';

interface TeamMoment {
  id: number;
  title: string;
  description: string;
  image: string;
  image_fallback: string;
}

interface TeamMomentsEditorProps {
  value?: TeamMoment[];
  onChange: (value: TeamMoment[]) => void;
  disabled?: boolean;
}

const defaultMoment: Omit<TeamMoment, 'id'> = {
  title: '',
  description: '',
  image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center',
  image_fallback: '/img/moments/moment.jpg'
};

export default function TeamMomentsEditor({ 
  value = [], 
  onChange, 
  disabled = false 
}: TeamMomentsEditorProps) {
  const [editingMoment, setEditingMoment] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TeamMoment | null>(null);

  const addMoment = () => {
    const newId = Math.max(0, ...value.map(m => m.id)) + 1;
    const newMoment: TeamMoment = {
      ...defaultMoment,
      id: newId,
      title: `Nuevo Momento ${newId}`,
      description: 'Descripción del momento especial'
    };
    
    onChange([...value, newMoment]);
    setEditingMoment(newId);
    setEditForm(newMoment);
  };

  const removeMoment = (id: number) => {
    onChange(value.filter(moment => moment.id !== id));
    if (editingMoment === id) {
      setEditingMoment(null);
      setEditForm(null);
    }
  };

  const startEdit = (moment: TeamMoment) => {
    setEditingMoment(moment.id);
    setEditForm({ ...moment });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    onChange(value.map(moment => 
      moment.id === editForm.id ? editForm : moment
    ));
    
    setEditingMoment(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingMoment(null);
    setEditForm(null);
  };

  const updateEditForm = (field: keyof TeamMoment, newValue: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: newValue });
  };

  const MomentCard = ({ moment }: { moment: TeamMoment }) => {
    const isEditing = editingMoment === moment.id;
    
    if (isEditing && editForm) {
      return (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editando Momento #{moment.id}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información básica */}
              <div className="space-y-3">
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Título del Momento
                  </Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => updateEditForm('title', e.target.value)}
                    placeholder="Celebración ISO 9001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descripción
                  </Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="Renovación exitosa de nuestra certificación ISO 9001:2015"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Imagen Fallback (local)</Label>
                  <Input
                    value={editForm.image_fallback}
                    onChange={(e) => updateEditForm('image_fallback', e.target.value)}
                    placeholder="/img/moments/iso-celebration.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagen del Momento
                </Label>
                <ImageField
                  value={editForm.image}
                  onChange={(newValue) => updateEditForm('image', newValue)}
                  label=""
                  placeholder="URL de la imagen del momento"
                  required={false}
                  disabled={false}
                  description="Preferir formato 4:3 (800x600px) para mejor visualización"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex">
            {/* Imagen */}
            <div className="w-32 h-24 flex-shrink-0">
              <img
                src={moment.image}
                alt={moment.title}
                className="w-full h-full object-cover rounded-l-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = moment.image_fallback || '/img/placeholder-moment.jpg';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate">
                    {moment.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {moment.description}
                  </p>
                </div>
                
                {!disabled && (
                  <div className="flex gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(moment)}
                      className="px-2"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMoment(moment.id)}
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
              <Camera className="w-5 h-5" />
              Momentos Destacados
              <Badge variant="outline">{value.length} momentos</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Galería de celebraciones, logros y experiencias especiales que fortalecen al equipo.
            </p>
          </div>
          
          {!disabled && (
            <Button onClick={addMoment}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Momento
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {value.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay momentos destacados</h3>
            <p className="text-sm mb-4">Agrega el primer momento especial para comenzar la galería</p>
            {!disabled && (
              <Button onClick={addMoment}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Momento
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {value.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Sugerencias para momentos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Tipos de momentos:</h5>
              <ul className="space-y-1">
                <li>• Certificaciones y reconocimientos</li>
                <li>• Workshops y capacitaciones</li>
                <li>• Celebraciones de logros</li>
                <li>• Inauguraciones y eventos</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Recomendaciones técnicas:</h5>
              <ul className="space-y-1">
                <li>• Imágenes en formato 4:3 (800x600px)</li>
                <li>• Títulos concisos y descriptivos</li>
                <li>• Descripciones de 50-100 palabras</li>
                <li>• Fotos con buena iluminación</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}