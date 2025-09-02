'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Edit3, Save, X, User, Briefcase, FileText, Image as ImageIcon } from 'lucide-react';
import ImageField from './ImageField';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  image_fallback: string;
}

interface TeamMembersEditorProps {
  value?: TeamMember[];
  onChange: (value: TeamMember[]) => void;
  disabled?: boolean;
}

const defaultMember: Omit<TeamMember, 'id'> = {
  name: '',
  role: '',
  description: '',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
  image_fallback: '/img/team/member.jpg'
};

export default function TeamMembersEditor({ 
  value = [], 
  onChange, 
  disabled = false 
}: TeamMembersEditorProps) {
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TeamMember | null>(null);

  const addMember = () => {
    const newId = Math.max(0, ...value.map(m => m.id)) + 1;
    const newMember: TeamMember = {
      ...defaultMember,
      id: newId,
      name: `Nuevo Miembro ${newId}`,
      role: 'Especialista'
    };
    
    onChange([...value, newMember]);
    setEditingMember(newId);
    setEditForm(newMember);
  };

  const removeMember = (id: number) => {
    onChange(value.filter(member => member.id !== id));
    if (editingMember === id) {
      setEditingMember(null);
      setEditForm(null);
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member.id);
    setEditForm({ ...member });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    onChange(value.map(member => 
      member.id === editForm.id ? editForm : member
    ));
    
    setEditingMember(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setEditForm(null);
  };

  const updateEditForm = (field: keyof TeamMember, newValue: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: newValue });
  };

  const MemberCard = ({ member }: { member: TeamMember }) => {
    const isEditing = editingMember === member.id;
    
    if (isEditing && editForm) {
      return (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editando Miembro #{member.id}
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
                    <User className="w-4 h-4" />
                    Nombre Completo
                  </Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => updateEditForm('name', e.target.value)}
                    placeholder="Carlos Mendoza"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Cargo/Rol
                  </Label>
                  <Input
                    value={editForm.role}
                    onChange={(e) => updateEditForm('role', e.target.value)}
                    placeholder="Director Ejecutivo"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descripción/Bio
                  </Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="Ingeniero Civil con 20+ años liderando proyectos de infraestructura..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  Foto del Miembro
                </Label>
                <ImageField
                  value={editForm.image}
                  onChange={(newValue) => updateEditForm('image', newValue)}
                  label=""
                  placeholder="URL de la imagen del miembro"
                  required={false}
                  disabled={false}
                  description="Preferir formato 3:4 (600x800px)"
                />

                <div className="mt-3">
                  <Label>Imagen Fallback (local)</Label>
                  <Input
                    value={editForm.image_fallback}
                    onChange={(e) => updateEditForm('image_fallback', e.target.value)}
                    placeholder="/img/team/carlos-mendoza.jpg"
                    className="mt-1"
                  />
                </div>
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
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = member.image_fallback || '/img/placeholder-team.jpg';
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {member.role}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {member.description}
                  </p>
                </div>
                
                {!disabled && (
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(member)}
                      className="px-2"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMember(member.id)}
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
              <Users className="w-5 h-5" />
              Miembros del Equipo
              <Badge variant="outline">{value.length} miembros</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los perfiles individuales de los miembros del equipo con sus roles y descripciones.
            </p>
          </div>
          
          {!disabled && (
            <Button onClick={addMember}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Miembro
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {value.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay miembros del equipo</h3>
            <p className="text-sm mb-4">Agrega el primer miembro del equipo para comenzar</p>
            {!disabled && (
              <Button onClick={addMember}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Miembro
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {value.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Usar fotos profesionales en proporción 3:4 (600x800px)</li>
            <li>• Descripciones entre 100-200 palabras resaltando experiencia</li>
            <li>• Roles específicos y descriptivos (ej: "Director Técnico Senior")</li>
            <li>• Mantener un orden lógico: gerentes, coordinadores, especialistas</li>
            <li>• Incluir certificaciones relevantes in descripción</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}