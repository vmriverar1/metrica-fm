'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Copy,
  Edit2,
  MoreHorizontal,
  Award,
  Shield,
  Leaf,
  Heart,
  Scale,
  Lightbulb,
  Lock,
  Wand2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ImageField from '../ImageField';
import BulkOperations from '../BulkOperations';

interface PolicyItem {
  id: number | string;
  icon: string;
  title: string;
  description: string;
  content?: string;
  priority?: 'high' | 'medium' | 'low';
  image?: string;
  image_fallback?: string;
}

interface PolicyTemplate {
  id: string;
  name: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  template: {
    title: string;
    description: string;
    content: string;
  };
}

interface EnhancedPoliciesManagerProps {
  policies: PolicyItem[];
  onChange: (policies: PolicyItem[]) => void;
  maxPolicies?: number;
  templates?: PolicyTemplate[] | Record<string, any>;
  onSave?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

interface PolicyValidationErrors {
  [key: string]: string[];
}

export default function EnhancedPoliciesManager({
  policies,
  onChange,
  maxPolicies = 12,
  templates = [],
  onSave,
  loading = false,
  className = ''
}: EnhancedPoliciesManagerProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<PolicyValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Iconos específicos para políticas empresariales
  const availableIcons = {
    'Award': { icon: Award, label: 'Premio (Calidad)', color: 'text-yellow-600' },
    'Shield': { icon: Shield, label: 'Escudo (Seguridad)', color: 'text-green-600' },
    'Leaf': { icon: Leaf, label: 'Hoja (Medio Ambiente)', color: 'text-green-500' },
    'Heart': { icon: Heart, label: 'Corazón (Responsabilidad Social)', color: 'text-red-500' },
    'Scale': { icon: Scale, label: 'Balanza (Ética)', color: 'text-purple-600' },
    'AlertCircle': { icon: AlertCircle, label: 'Alerta (Gestión de Riesgos)', color: 'text-orange-600' },
    'Lightbulb': { icon: Lightbulb, label: 'Bombilla (Innovación)', color: 'text-blue-500' },
    'Lock': { icon: Lock, label: 'Candado (Confidencialidad)', color: 'text-gray-600' }
  };

  // Templates predefinidos para políticas comunes
  const defaultTemplates: PolicyTemplate[] = [
    {
      id: 'quality',
      name: 'Política de Calidad',
      icon: 'Award',
      priority: 'high',
      template: {
        title: 'Compromiso con la Calidad',
        description: 'Nos comprometemos a entregar proyectos que superen las expectativas de nuestros clientes.',
        content: 'Implementamos sistemas de gestión de calidad ISO 9001 en todos nuestros procesos...'
      }
    },
    {
      id: 'safety',
      name: 'Política de Seguridad',
      icon: 'Shield',
      priority: 'high',
      template: {
        title: 'Seguridad Primero',
        description: 'La seguridad de nuestro equipo y proyectos es nuestra máxima prioridad.',
        content: 'Cumplimos con todas las normativas de seguridad ocupacional y protocolos de seguridad en obra...'
      }
    },
    {
      id: 'environment',
      name: 'Política Ambiental',
      icon: 'Leaf',
      priority: 'medium',
      template: {
        title: 'Compromiso Ambiental',
        description: 'Desarrollamos proyectos sostenibles que respetan y protegen el medio ambiente.',
        content: 'Implementamos prácticas de construcción sostenible y gestión de residuos...'
      }
    },
    {
      id: 'ethics',
      name: 'Código de Ética',
      icon: 'Scale',
      priority: 'high',
      template: {
        title: 'Integridad y Transparencia',
        description: 'Actuamos con integridad, transparencia y responsabilidad en todas nuestras operaciones.',
        content: 'Mantenemos los más altos estándares éticos en nuestras relaciones comerciales...'
      }
    }
  ];

  // Convertir templates (objeto o array) a array de PolicyTemplate
  const getTemplatesArray = (): PolicyTemplate[] => {
    if (!templates) return [];
    
    if (Array.isArray(templates)) {
      return templates;
    }
    
    // Si es un objeto, convertir a array
    return Object.entries(templates).map(([key, template]) => ({
      id: key,
      name: template.title || key,
      icon: template.icon || 'Award',
      priority: template.priority || 'medium',
      template: {
        title: template.title || '',
        description: template.description || '',
        content: template.content || ''
      }
    } as PolicyTemplate));
  };

  const allTemplates = [...defaultTemplates, ...getTemplatesArray()];

  // Validar política individual
  const validatePolicy = (policy: PolicyItem): string[] => {
    const errors: string[] = [];
    
    if (!policy.title.trim()) {
      errors.push('El título de la política es requerido');
    }
    
    if (policy.title.length > 60) {
      errors.push('El título no puede exceder 60 caracteres');
    }
    
    if (!policy.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (policy.description.length > 150) {
      errors.push('La descripción no puede exceder 150 caracteres');
    }
    
    if (policy.content && policy.content.length > 1000) {
      errors.push('El contenido no puede exceder 1000 caracteres');
    }
    
    if (!policy.icon || !availableIcons[policy.icon as keyof typeof availableIcons]) {
      errors.push('Icono no válido o no seleccionado');
    }
    
    if (policy.image && !isValidUrl(policy.image)) {
      errors.push('URL de imagen principal no es válida');
    }
    
    if (policy.image_fallback && !isValidUrl(policy.image_fallback)) {
      errors.push('URL de imagen fallback no es válida');
    }
    
    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.includes('public/');
    }
  };

  // Validar todas las políticas
  useEffect(() => {
    const newErrors: PolicyValidationErrors = {};
    policies.forEach(policy => {
      const policyErrors = validatePolicy(policy);
      if (policyErrors.length > 0) {
        newErrors[policy.id.toString()] = policyErrors;
      }
    });
    setErrors(newErrors);
  }, [policies]);

  // Manejar reordenamiento
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(policies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  // Agregar nueva política
  const addPolicy = () => {
    if (policies.length >= maxPolicies) return;
    
    const newPolicy: PolicyItem = {
      id: Date.now(),
      icon: 'Award',
      title: 'Nueva Política',
      description: 'Descripción de la política empresarial',
      content: '',
      priority: 'medium',
      image: '',
      image_fallback: ''
    };
    onChange([...policies, newPolicy]);
    setEditingId(newPolicy.id.toString());
  };

  // Agregar desde template
  const addFromTemplate = (template: PolicyTemplate) => {
    if (policies.length >= maxPolicies) return;
    
    const newPolicy: PolicyItem = {
      id: Date.now(),
      icon: template.icon,
      title: template.template.title,
      description: template.template.description,
      content: template.template.content,
      priority: template.priority,
      image: '',
      image_fallback: ''
    };
    onChange([...policies, newPolicy]);
    setEditingId(newPolicy.id.toString());
    setShowTemplates(false);
  };

  // Eliminar política
  const removePolicy = (id: number | string) => {
    onChange(policies.filter(policy => policy.id !== id));
  };

  // Duplicar política
  const duplicatePolicy = (policy: PolicyItem) => {
    if (policies.length >= maxPolicies) return;
    
    const newPolicy: PolicyItem = {
      ...policy,
      id: Date.now(),
      title: `${policy.title} (Copia)`
    };
    onChange([...policies, newPolicy]);
    setEditingId(newPolicy.id.toString());
  };

  // Actualizar política
  const updatePolicy = (id: number | string, field: keyof PolicyItem, value: any) => {
    onChange(policies.map(policy => 
      policy.id === id 
        ? { ...policy, [field]: field === 'id' ? (isNaN(Number(value)) ? value : Number(value)) : value }
        : policy
    ));
  };

  // Renderizar icono
  const renderIcon = (iconName: string, className = "h-6 w-6") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Award;
    const color = availableIcons[iconName as keyof typeof availableIcons]?.color || 'text-yellow-600';
    return <IconComponent className={`${className} ${color}`} />;
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;

  // Renderizar preview de la política
  const renderPolicyPreview = (policy: PolicyItem) => {
    const hasErrors = errors[policy.id.toString()]?.length > 0;

    return (
      <Card key={policy.id} className={`transition-all duration-300 hover:shadow-lg ${hasErrors ? 'border-red-200' : ''}`}>
        <div className="relative">
          {/* Imagen */}
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            {policy.image ? (
              <img
                src={policy.image}
                alt={policy.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (policy.image_fallback) {
                    (e.target as HTMLImageElement).src = policy.image_fallback;
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {renderIcon(policy.icon, 'h-12 w-12')}
              </div>
            )}
          </div>

          {/* Contenido */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {renderIcon(policy.icon, 'h-5 w-5')}
                <div className="text-lg font-semibold">{policy.title}</div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline">Política {policy.id}</Badge>
                {policy.priority && (
                  <Badge className={getPriorityColor(policy.priority)}>
                    {policy.priority.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3">
              {policy.description}
            </div>
            {policy.content && (
              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {policy.content}
              </div>
            )}
          </CardContent>

          {/* Indicador de errores */}
          {hasErrors && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Renderizar formulario de edición
  const renderPolicyForm = (policy: PolicyItem, index: number) => {
    const policyErrors = errors[policy.id.toString()] || [];
    const isEditing = editingId === policy.id.toString();

    return (
      <Draggable key={policy.id.toString()} draggableId={policy.id.toString()} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              transition-all duration-200
              ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
              ${policyErrors.length > 0 ? 'border-red-200' : ''}
              ${isEditing ? 'border-primary shadow-md' : ''}
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>
                  <div className="flex items-center gap-2">
                    {renderIcon(policy.icon, 'h-5 w-5')}
                    <Badge variant={policyErrors.length > 0 ? 'destructive' : 'secondary'}>
                      Política #{index + 1}
                    </Badge>
                    {policy.priority && (
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {policyErrors.length === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : policy.id.toString())}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicatePolicy(policy)}
                    title="Duplicar"
                    disabled={policies.length >= maxPolicies}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removePolicy(policy.id)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Errores */}
              {policyErrors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {policyErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            {isEditing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div>
                      <Label>ID de la política</Label>
                      <Input
                        type="number"
                        value={policy.id}
                        onChange={(e) => updatePolicy(policy.id, 'id', e.target.value)}
                        className="bg-muted"
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Título de la política *</Label>
                      <Input
                        value={policy.title}
                        onChange={(e) => updatePolicy(policy.id, 'title', e.target.value)}
                        placeholder="Nombre de la política empresarial"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {policy.title.length}/60 caracteres
                      </p>
                    </div>

                    <div>
                      <Label>Icono *</Label>
                      <Select
                        value={policy.icon}
                        onValueChange={(value) => updatePolicy(policy.id, 'icon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              {renderIcon(policy.icon, "h-4 w-4")}
                              {availableIcons[policy.icon as keyof typeof availableIcons]?.label || policy.icon}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(availableIcons).map(([key, iconData]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <iconData.icon className={`h-4 w-4 ${iconData.color}`} />
                                {iconData.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Prioridad</Label>
                      <Select
                        value={policy.priority || 'medium'}
                        onValueChange={(value) => updatePolicy(policy.id, 'priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta Prioridad</SelectItem>
                          <SelectItem value="medium">Prioridad Media</SelectItem>
                          <SelectItem value="low">Baja Prioridad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Descripción *</Label>
                      <Textarea
                        value={policy.description}
                        onChange={(e) => updatePolicy(policy.id, 'description', e.target.value)}
                        placeholder="Descripción breve de la política"
                        rows={3}
                        maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {policy.description.length}/150 caracteres
                      </p>
                    </div>

                    <div>
                      <Label>Contenido detallado</Label>
                      <Textarea
                        value={policy.content || ''}
                        onChange={(e) => updatePolicy(policy.id, 'content', e.target.value)}
                        placeholder="Contenido completo de la política (opcional)"
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(policy.content || '').length}/1000 caracteres
                      </p>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-4">
                    <div>
                      <ImageField
                        value={policy.image || ''}
                        onChange={(value) => updatePolicy(policy.id, 'image', value)}
                        label="Imagen principal"
                        placeholder="URL o ruta de la imagen de la política"
                      />
                    </div>

                    <div>
                      <ImageField
                        value={policy.image_fallback || ''}
                        onChange={(value) => updatePolicy(policy.id, 'image_fallback', value)}
                        label="Imagen de respaldo"
                        placeholder="URL o ruta de imagen alternativa"
                      />
                    </div>

                    {/* Vista previa */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
                      <div className="aspect-video w-full bg-background rounded overflow-hidden">
                        {policy.image ? (
                          <img
                            src={policy.image}
                            alt={policy.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (policy.image_fallback) {
                                (e.target as HTMLImageElement).src = policy.image_fallback;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {renderIcon(policy.icon, 'h-12 w-12')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </Draggable>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Políticas Empresariales ({policies.length}/{maxPolicies})
          </h3>
          <p className="text-sm text-muted-foreground">
            Gestión de políticas corporativas - Arrastra para reordenar, haz clic en editar para modificar
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBulkOps(!showBulkOps)}
            className="flex items-center gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
            Bulk Ops
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Templates
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            onClick={addPolicy}
            disabled={policies.length >= maxPolicies}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Política
          </Button>
          
          {onSave && (
            <Button 
              type="button"
              onClick={onSave}
              disabled={loading || hasErrors}
              className="min-w-20"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates de Políticas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona un template para crear rápidamente políticas comunes
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addFromTemplate(template)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {renderIcon(template.icon, 'h-8 w-8')}
                    </div>
                    <div className="font-medium text-sm mb-1">{template.name}</div>
                    <Badge className={getPriorityColor(template.priority)}>
                      {template.priority.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de errores */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hay {Object.keys(errors).length} políticas con errores. 
            Revisa los campos marcados antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode */}
      {previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {policies.map(policy => (
            <div key={policy.id}>
              {renderPolicyPreview(policy)}
            </div>
          ))}
        </div>
      ) : (
        /* Edit Mode con Drag & Drop */
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="policies-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  space-y-4 min-h-24 p-2 rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/20' : ''}
                `}
              >
                {policies.map((policy, index) => renderPolicyForm(policy, index))}
                {provided.placeholder}
                
                {/* Mensaje cuando no hay políticas */}
                {policies.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay políticas empresariales</p>
                    <p className="text-sm">Haz clic en "Agregar Política" o usa un template para comenzar</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Bulk Operations */}
      {showBulkOps && (
        <BulkOperations
          items={policies}
          itemType="policies"
          onUpdate={onChange}
          maxItems={maxPolicies}
        />
      )}

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
        <p><strong>📋 Consejos para Políticas Empresariales:</strong></p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Las políticas de alta prioridad aparecen primero en la página</li>
          <li>Usa iconos que representen claramente el tipo de política</li>
          <li>Mantén las descripciones concisas pero informativas</li>
          <li>El contenido detallado es opcional pero recomendado para políticas importantes</li>
          <li>Usa los templates para crear políticas estándar rápidamente</li>
          <li>Las imágenes ayudan a hacer las políticas más atractivas visualmente</li>
        </ul>
      </div>
    </div>
  );
}