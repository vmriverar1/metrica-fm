'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Star,
  User,
  Building,
  Calendar,
  Quote,
  Eye,
  EyeOff,
  Image,
  Link
} from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  position: string;
  company: string;
  project: string;
  rating: number;
  date: string;
  avatar: string;
}

interface TestimonialsEditorProps {
  value: Testimonial[];
  onChange: (value: Testimonial[]) => void;
  disabled?: boolean;
  maxTestimonials?: number;
}

// Avatares por defecto de Unsplash
const defaultAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b332c823?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop&crop=face'
];

// Plantillas de testimonios comunes
const testimonialTemplates = [
  {
    quote: "La certificación ISO 9001 de Métrica DIP nos da la confianza total de que nuestros proyectos serán ejecutados con los más altos estándares de calidad. Su sistema de gestión es impecable.",
    position: "Director de Proyectos",
    project: "Torres del Parque"
  },
  {
    quote: "Desde que trabajamos con Métrica DIP certificada ISO 9001, la predictibilidad de nuestros proyectos mejoró drásticamente. Cumplimiento de plazos y calidad garantizada.",
    position: "Gerente General",
    project: "Centro Comercial"
  },
  {
    quote: "Su sistema de gestión de calidad ISO 9001 es excepcional. Cada proceso está documentado, cada entregable verificado. La transparencia y profesionalismo son incomparables.",
    position: "Director de Operaciones",
    project: "Complejo Industrial"
  }
];

export default function TestimonialsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxTestimonials = 10
}: TestimonialsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<number | null>(null);

  const addTestimonial = (template?: typeof testimonialTemplates[0]) => {
    if (value.length >= maxTestimonials) return;
    
    const newId = Math.max(0, ...value.map(t => t.id || 0)) + 1;
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    
    const newTestimonial: Testimonial = {
      id: newId,
      quote: template?.quote || '',
      author: '',
      position: template?.position || '',
      company: '',
      project: template?.project || '',
      rating: 5,
      date: new Date().getFullYear().toString(),
      avatar: randomAvatar
    };
    
    onChange([...value, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = value.filter((_, i) => i !== index);
    onChange(newTestimonials);
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, newValue: any) => {
    const newTestimonials = value.map((testimonial, i) => 
      i === index ? { ...testimonial, [field]: newValue } : testimonial
    );
    onChange(newTestimonials);
  };

  const moveTestimonial = (fromIndex: number, toIndex: number) => {
    const newTestimonials = [...value];
    const [movedTestimonial] = newTestimonials.splice(fromIndex, 1);
    newTestimonials.splice(toIndex, 0, movedTestimonial);
    onChange(newTestimonials);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveTestimonial(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={onChange ? () => onChange(star) : undefined}
            disabled={disabled || !onChange}
            className={`${onChange ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Testimonios ISO 9001</h3>
          <p className="text-sm text-gray-600">
            Gestiona testimonios de clientes sobre la calidad certificada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxTestimonials}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={() => addTestimonial()}
            disabled={disabled || value.length >= maxTestimonials}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Testimonio
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Quote className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay testimonios</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega testimonios de clientes que hablen sobre la calidad certificada ISO 9001
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                size="sm"
                onClick={() => addTestimonial()}
                disabled={disabled}
              >
                <Plus className="w-4 h-4 mr-1" />
                Crear Testimonio
              </Button>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">o usar plantilla:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {testimonialTemplates.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTestimonial(template)}
                      disabled={disabled}
                      className="h-6 text-xs"
                    >
                      Plantilla {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {value.map((testimonial, index) => {
            const isPreview = previewMode === index;

            return (
              <Card
                key={testimonial.id || index}
                className={`transition-all duration-200 ${
                  draggedIndex === index ? 'shadow-lg scale-105' : 'hover:shadow-md'
                }`}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="cursor-move p-1 rounded hover:bg-gray-100">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {testimonial.avatar ? (
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.author} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400 m-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {testimonial.author || `Testimonio ${index + 1}`}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {testimonial.position} • {testimonial.company}
                        </p>
                        <div className="mt-1">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewMode(isPreview ? null : index)}
                        className="h-8"
                      >
                        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestimonial(index)}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Cita */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Testimonio
                    </label>
                    <Textarea
                      value={testimonial.quote}
                      onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                      placeholder="Escribe el testimonio del cliente sobre la calidad ISO 9001..."
                      rows={4}
                      disabled={disabled}
                      className="resize-none"
                    />
                  </div>

                  {/* Información del autor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Nombre del Cliente
                      </label>
                      <Input
                        value={testimonial.author}
                        onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
                        placeholder="ej. Carlos Mendoza"
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cargo/Posición
                      </label>
                      <Input
                        value={testimonial.position}
                        onChange={(e) => updateTestimonial(index, 'position', e.target.value)}
                        placeholder="ej. Director de Proyectos"
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Empresa
                      </label>
                      <Input
                        value={testimonial.company}
                        onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                        placeholder="ej. Grupo Inmobiliario Premium"
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Proyecto
                      </label>
                      <Input
                        value={testimonial.project}
                        onChange={(e) => updateTestimonial(index, 'project', e.target.value)}
                        placeholder="ej. Torres del Parque San Isidro"
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* Rating y fecha */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Calificación
                      </label>
                      {renderStars(testimonial.rating, disabled ? undefined : 
                        (rating) => updateTestimonial(index, 'rating', rating)
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Año
                      </label>
                      <Input
                        value={testimonial.date}
                        onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
                        placeholder="ej. 2024"
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      URL del Avatar
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={testimonial.avatar}
                        onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                        placeholder="https://ejemplo.com/foto.jpg"
                        disabled={disabled}
                        className="flex-1"
                      />
                      <Select
                        value=""
                        onValueChange={(value) => updateTestimonial(index, 'avatar', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Predefinido" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultAvatars.map((avatar, avatarIndex) => (
                            <SelectItem key={avatarIndex} value={avatar}>
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={avatar} 
                                  alt={`Avatar ${avatarIndex + 1}`} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span>Avatar {avatarIndex + 1}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview */}
                  {isPreview && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h5 className="text-xs font-medium text-gray-500 mb-3">VISTA PREVIA</h5>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                              {testimonial.avatar ? (
                                <img 
                                  src={testimonial.avatar} 
                                  alt={testimonial.author} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-8 h-8 text-gray-400 m-2" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <blockquote className="text-gray-900 mb-4 italic">
                              "{testimonial.quote || 'Testimonio del cliente...'}"
                            </blockquote>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {testimonial.author || 'Nombre del Cliente'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {testimonial.position || 'Posición'} • {testimonial.company || 'Empresa'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {testimonial.project || 'Proyecto'} • {testimonial.date}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {renderStars(testimonial.rating)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}