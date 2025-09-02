'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Building,
  CheckCircle
} from 'lucide-react';

interface ScopeItemsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
  title?: string;
  description?: string;
  placeholder?: string;
}

// Plantillas para alcances de certificación ISO 9001
const scopeTemplates = [
  "Dirección integral de proyectos de construcción",
  "Gestión de proyectos de infraestructura",
  "Supervisión y control de obras",
  "Consultoría en construcción",
  "Gestión de calidad en proyectos",
  "Coordinación de equipos multidisciplinarios",
  "Control de cronogramas y presupuestos",
  "Auditorías de procesos constructivos"
];

export default function ScopeItemsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxItems = 10,
  title = "Alcance de Certificación",
  description = "Define los elementos que cubre la certificación ISO 9001",
  placeholder = "ej. Dirección integral de proyectos de construcción"
}: ScopeItemsEditorProps) {

  const addItem = (template?: string) => {
    if (value.length >= maxItems) return;
    
    const newItem = template || '';
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = value.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, newValue: string) => {
    const newItems = value.map((item, i) => 
      i === index ? newValue : item
    );
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...value];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveItem(dragIndex, dropIndex);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxItems}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={() => addItem()}
            disabled={disabled || value.length >= maxItems}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Item
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lista vacía</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega elementos para definir el alcance de tu certificación ISO 9001
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                size="sm"
                onClick={() => addItem()}
                disabled={disabled}
              >
                <Plus className="w-4 h-4 mr-1" />
                Crear Primer Item
              </Button>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">o usar plantillas:</p>
                <div className="flex flex-wrap gap-1 justify-center max-w-md">
                  {scopeTemplates.slice(0, 4).map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(template)}
                      disabled={disabled}
                      className="h-6 text-xs"
                    >
                      {template.length > 25 ? `${template.substring(0, 25)}...` : template}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {value.map((item, index) => (
            <Card
              key={index}
              className="transition-all duration-200 hover:shadow-md"
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="cursor-move p-1 rounded hover:bg-gray-100">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={placeholder}
                      disabled={disabled}
                      className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 font-medium text-gray-900"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista previa compacta */}
      {value.length > 0 && (
        <Card className="bg-gray-50 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">📋 Vista Previa</h4>
            <ul className="space-y-2">
              {value.filter(item => item.trim()).map((item, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Plantillas disponibles */}
      {value.length < maxItems && value.length > 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">💡 Plantillas Sugeridas</h4>
            <div className="flex flex-wrap gap-2">
              {scopeTemplates
                .filter(template => !value.includes(template))
                .slice(0, 6)
                .map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(template)}
                  disabled={disabled}
                  className="text-xs h-7"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {template.length > 30 ? `${template.substring(0, 30)}...` : template}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}