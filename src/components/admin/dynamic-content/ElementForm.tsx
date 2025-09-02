'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { BaseCardElement, ElementType, ELEMENT_CONFIGS, LUCIDE_ICONS, isValidIcon } from '@/types/dynamic-elements';
import ImageField from '@/components/admin/ImageField';
import IconPicker from './IconPicker';

interface ElementFormProps<T extends BaseCardElement> {
  elementType: ElementType;
  element?: T | null;
  onSubmit: (element: Omit<T, 'id' | 'created_at' | 'updated_at'> | Partial<T>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ElementForm<T extends BaseCardElement>({
  elementType,
  element = null,
  onSubmit,
  onCancel,
  loading = false
}: ElementFormProps<T>) {
  const config = ELEMENT_CONFIGS[elementType];
  const isEditing = !!element;
  
  // Estado del formulario
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Inicializar formulario
  useEffect(() => {
    if (element) {
      // Modo edición - cargar datos existentes
      setFormData(element);
    } else {
      // Modo creación - valores por defecto
      const defaultData: Record<string, any> = {
        title: '',
        description: '',
        order: 0,
        enabled: true
      };

      // Valores por defecto específicos por tipo
      config.fields.forEach(field => {
        if (field.type === 'number') {
          defaultData[field.key] = 0;
        } else if (field.type === 'select' && field.options?.length) {
          defaultData[field.key] = field.options[0];
        } else {
          defaultData[field.key] = '';
        }
      });

      // Campos especiales para cada tipo
      switch (elementType) {
        case 'statistics':
          defaultData.icon = 'Award';
          defaultData.value = 0;
          defaultData.suffix = '';
          defaultData.label = '';
          break;
        case 'projects':
          defaultData.name = '';
          defaultData.type = 'Comercial';
          break;
      }

      setFormData(defaultData);
    }
  }, [element, elementType, config.fields]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const newValidationErrors: string[] = [];

    // Validar campos requeridos
    config.fields.forEach(field => {
      if (field.required && (!formData[field.key] || formData[field.key] === '')) {
        newErrors[field.key] = `${field.label} es requerido`;
      }

      // Validaciones específicas por tipo
      if (formData[field.key]) {
        switch (field.type) {
          case 'number':
            const numValue = Number(formData[field.key]);
            if (isNaN(numValue)) {
              newErrors[field.key] = 'Debe ser un número válido';
            } else if (field.validation?.min && numValue < field.validation.min) {
              newErrors[field.key] = `Debe ser mayor o igual a ${field.validation.min}`;
            } else if (field.validation?.max && numValue > field.validation.max) {
              newErrors[field.key] = `Debe ser menor o igual a ${field.validation.max}`;
            }
            break;

          case 'icon':
            if (!isValidIcon(formData[field.key])) {
              newErrors[field.key] = 'Ícono no válido';
              newValidationErrors.push(`El ícono "${formData[field.key]}" no existe en Lucide React`);
            }
            break;

          case 'url':
          case 'image':
            const urlValue = formData[field.key];
            if (urlValue && !urlValue.startsWith('http') && !urlValue.startsWith('/')) {
              newErrors[field.key] = 'Debe ser una URL válida (http/https) o ruta relativa (/)';
            }
            break;
        }
      }
    });

    // Validaciones adicionales por tipo de elemento
    switch (elementType) {
      case 'statistics':
        if (!formData.label) {
          newErrors.label = 'La etiqueta es requerida para estadísticas';
        }
        if (!formData.suffix) {
          newErrors.suffix = 'El sufijo es requerido para estadísticas';
        }
        break;
      
      case 'projects':
        if (!formData.name) {
          newErrors.name = 'El nombre del proyecto es requerido';
        }
        if (!formData.type) {
          newErrors.type = 'El tipo de proyecto es requerido';
        }
        break;
    }

    setErrors(newErrors);
    setValidationErrors(newValidationErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en campos
  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    // Limpiar error del campo cuando cambie
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...formData };
      
      // Convertir números
      config.fields.forEach(field => {
        if (field.type === 'number' && cleanData[field.key] !== undefined) {
          cleanData[field.key] = Number(cleanData[field.key]);
        }
      });

      // Añadir timestamp de actualización si es edición
      if (isEditing) {
        cleanData.updated_at = new Date().toISOString();
      }

      await onSubmit(cleanData);
    } catch (error) {
      console.error('Error enviando formulario:', error);
      setValidationErrors(['Error al guardar. Por favor, inténtalo de nuevo.']);
    }
  };

  // Renderizar campo según tipo
  const renderField = (field: any) => {
    const hasError = !!errors[field.key];
    const fieldValue = formData[field.key] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.key}
              type="number"
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(field.key, value)}
            >
              <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'icon':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <IconPicker
              value={fieldValue}
              onChange={(value) => handleFieldChange(field.key, value)}
              error={hasError}
            />
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'image':
      case 'url':
        return (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {field.type === 'image' ? (
              <ImageField
                value={fieldValue}
                onChange={(value) => handleFieldChange(field.key, value)}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                id={field.key}
                type="url"
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={hasError ? 'border-destructive' : ''}
              />
            )}
            {hasError && (
              <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Campos del formulario */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map(renderField)}

            {/* Campos adicionales específicos por tipo */}
            {elementType === 'statistics' && (
              <>
                <div>
                  <Label htmlFor="label">
                    Etiqueta <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="label"
                    value={formData.label || ''}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    placeholder="Ej: M2 Construidos"
                    className={errors.label ? 'border-destructive' : ''}
                  />
                  {errors.label && (
                    <p className="text-sm text-destructive mt-1">{errors.label}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="suffix">
                    Sufijo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="suffix"
                    value={formData.suffix || ''}
                    onChange={(e) => handleFieldChange('suffix', e.target.value)}
                    placeholder="Ej: M, K, %, +"
                    className={errors.suffix ? 'border-destructive' : ''}
                  />
                  {errors.suffix && (
                    <p className="text-sm text-destructive mt-1">{errors.suffix}</p>
                  )}
                </div>
              </>
            )}

            {elementType === 'projects' && (
              <div>
                <Label htmlFor="name">
                  Nombre del Proyecto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Ej: Hotel Hilton Balta"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar' : 'Crear'} {config.displayName}
        </Button>
      </div>
    </form>
  );
}