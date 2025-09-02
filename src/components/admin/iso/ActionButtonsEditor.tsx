'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Download, 
  FileText, 
  ExternalLink,
  Eye,
  Share,
  Link,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Building,
  Award,
  Search,
  ArrowRight
} from 'lucide-react';

interface ActionButton {
  text: string;
  type: 'primary' | 'outline' | 'secondary' | 'ghost';
  icon: string;
  action: string;
}

interface ActionButtonsEditorProps {
  value: ActionButton[];
  onChange: (value: ActionButton[]) => void;
  disabled?: boolean;
  maxButtons?: number;
}

// Iconos disponibles para botones
const availableIcons = [
  { name: 'Download', icon: Download, description: 'Descargar archivo' },
  { name: 'FileText', icon: FileText, description: 'Documento o texto' },
  { name: 'ExternalLink', icon: ExternalLink, description: 'Enlace externo' },
  { name: 'Eye', icon: Eye, description: 'Ver o visualizar' },
  { name: 'Share', icon: Share, description: 'Compartir' },
  { name: 'Link', icon: Link, description: 'Enlace general' },
  { name: 'Mail', icon: Mail, description: 'Correo electrónico' },
  { name: 'Phone', icon: Phone, description: 'Teléfono' },
  { name: 'MapPin', icon: MapPin, description: 'Ubicación' },
  { name: 'Calendar', icon: Calendar, description: 'Calendario o fecha' },
  { name: 'Users', icon: Users, description: 'Equipo o contacto' },
  { name: 'Building', icon: Building, description: 'Empresa o edificio' },
  { name: 'Award', icon: Award, description: 'Certificación o premio' },
  { name: 'Search', icon: Search, description: 'Buscar o explorar' },
  { name: 'ArrowRight', icon: ArrowRight, description: 'Continuar o siguiente' }
];

// Tipos de botón disponibles
const buttonTypes = [
  { 
    value: 'primary', 
    label: 'Primario', 
    description: 'Botón de acción principal (azul sólido)',
    className: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  { 
    value: 'outline', 
    label: 'Contorno', 
    description: 'Botón con borde (fondo transparente)',
    className: 'border border-blue-600 text-blue-600 hover:bg-blue-50'
  },
  { 
    value: 'secondary', 
    label: 'Secundario', 
    description: 'Botón de acción secundaria (gris)',
    className: 'bg-gray-600 text-white hover:bg-gray-700'
  },
  { 
    value: 'ghost', 
    label: 'Fantasma', 
    description: 'Botón minimalista (solo texto)',
    className: 'text-blue-600 hover:bg-blue-50'
  }
];

// Acciones comunes predefinidas
const commonActions = [
  { value: 'download_certificate', label: 'Descargar Certificado', icon: 'Download' },
  { value: 'view_certificate', label: 'Ver Certificado', icon: 'Eye' },
  { value: 'scroll_to_policy', label: 'Ver Política de Calidad', icon: 'FileText' },
  { value: 'scroll_to_benefits', label: 'Ver Beneficios', icon: 'ArrowRight' },
  { value: 'contact_us', label: 'Contactar', icon: 'Mail' },
  { value: 'verify_certificate', label: 'Verificar Certificado', icon: 'Search' },
  { value: 'external_link', label: 'Enlace Externo', icon: 'ExternalLink' },
  { value: 'custom', label: 'Acción Personalizada', icon: 'Link' }
];

export default function ActionButtonsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxButtons = 4
}: ActionButtonsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addButton = () => {
    if (value.length >= maxButtons) return;
    
    const newButton: ActionButton = {
      text: '',
      type: 'primary',
      icon: 'Download',
      action: 'download_certificate'
    };
    
    onChange([...value, newButton]);
  };

  const removeButton = (index: number) => {
    const newButtons = value.filter((_, i) => i !== index);
    onChange(newButtons);
  };

  const updateButton = (index: number, field: keyof ActionButton, newValue: string) => {
    const newButtons = value.map((button, i) => 
      i === index ? { ...button, [field]: newValue } : button
    );
    onChange(newButtons);
  };

  const moveButton = (fromIndex: number, toIndex: number) => {
    const newButtons = [...value];
    const [movedButton] = newButtons.splice(fromIndex, 1);
    newButtons.splice(toIndex, 0, movedButton);
    onChange(newButtons);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveButton(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = availableIcons.find(icon => icon.name === iconName);
    return iconObj ? iconObj.icon : Download;
  };

  const getButtonTypeInfo = (type: string) => {
    return buttonTypes.find(bt => bt.value === type) || buttonTypes[0];
  };

  const handleActionChange = (index: number, actionValue: string) => {
    const commonAction = commonActions.find(action => action.value === actionValue);
    if (commonAction) {
      // Auto-llenar texto e icono basado en la acción seleccionada
      const updatedButton = {
        ...value[index],
        action: actionValue,
        icon: commonAction.icon
      };
      
      // Si el texto está vacío, usar el label de la acción
      if (!value[index].text.trim()) {
        updatedButton.text = commonAction.label;
      }
      
      const newButtons = value.map((button, i) => 
        i === index ? updatedButton : button
      );
      onChange(newButtons);
    } else {
      updateButton(index, 'action', actionValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Botones de Acción Hero</h3>
          <p className="text-sm text-gray-600">
            Configura los botones de llamada a la acción en la sección hero
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxButtons}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={addButton}
            disabled={disabled || value.length >= maxButtons}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Botón
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay botones</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega botones de acción para mejorar la interactividad del hero
            </p>
            <Button
              type="button"
              size="sm"
              onClick={addButton}
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Primer Botón
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {value.map((button, index) => {
            const IconComponent = getIconComponent(button.icon);
            const buttonTypeInfo = getButtonTypeInfo(button.type);

            return (
              <Card
                key={index}
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
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Botón {index + 1}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {button.text || 'Sin texto'} • {buttonTypeInfo.label}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeButton(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Texto del botón */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Texto del Botón
                    </label>
                    <Input
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                      placeholder="ej. Descargar Certificado"
                      disabled={disabled}
                      className="w-full"
                    />
                  </div>

                  {/* Tipo y Icono */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tipo de Botón
                      </label>
                      <Select
                        value={button.type}
                        onValueChange={(value: 'primary' | 'outline' | 'secondary' | 'ghost') => 
                          updateButton(index, 'type', value)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded ${
                                button.type === 'primary' ? 'bg-blue-600' :
                                button.type === 'outline' ? 'border-2 border-blue-600' :
                                button.type === 'secondary' ? 'bg-gray-600' :
                                'bg-transparent border border-gray-300'
                              }`}></div>
                              <span>{buttonTypeInfo.label}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {buttonTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded ${
                                  type.value === 'primary' ? 'bg-blue-600' :
                                  type.value === 'outline' ? 'border-2 border-blue-600' :
                                  type.value === 'secondary' ? 'bg-gray-600' :
                                  'bg-transparent border border-gray-300'
                                }`}></div>
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Icono
                      </label>
                      <Select
                        value={button.icon}
                        onValueChange={(value) => updateButton(index, 'icon', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{button.icon}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map(({ name, icon: Icon, description }) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-600" />
                                <div className="flex flex-col">
                                  <span>{name}</span>
                                  <span className="text-xs text-gray-500">{description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Acción */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Acción del Botón
                    </label>
                    <Select
                      value={button.action}
                      onValueChange={(value) => handleActionChange(index, value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una acción" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonActions.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            <div className="flex items-center space-x-2">
                              {availableIcons.find(icon => icon.name === action.icon)?.icon && 
                                React.createElement(
                                  availableIcons.find(icon => icon.name === action.icon)!.icon, 
                                  { className: "w-4 h-4 text-gray-600" }
                                )
                              }
                              <span>{action.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo para acción personalizada */}
                  {button.action === 'custom' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Acción Personalizada
                      </label>
                      <Input
                        value={button.action === 'custom' ? '' : button.action}
                        onChange={(e) => updateButton(index, 'action', e.target.value)}
                        placeholder="ej. scroll_to_section, open_modal, redirect_to_page"
                        disabled={disabled}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Define una acción personalizada que será manejada por JavaScript
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-xs font-medium text-gray-500 mb-3">VISTA PREVIA</h5>
                    <div className="flex items-center justify-center">
                      <button
                        className={`
                          px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                          flex items-center space-x-2 text-sm
                          ${buttonTypeInfo.className}
                        `}
                        disabled
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{button.text || 'Texto del botón'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Acción: {button.action} • Tipo: {buttonTypeInfo.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}