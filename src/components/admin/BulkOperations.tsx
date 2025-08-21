'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  MoreHorizontal, 
  Trash2, 
  Copy, 
  Edit, 
  RotateCcw,
  Wand2,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BulkOperationsProps {
  items: any[];
  itemType: 'statistics' | 'services' | 'projects' | 'pillars' | 'policies' | 'rotating-words';
  onUpdate: (items: any[]) => void;
  maxItems?: number;
}

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  requiresValue?: boolean;
  valueType?: 'text' | 'textarea' | 'select' | 'number';
  valueOptions?: { value: string; label: string }[];
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  items,
  itemType,
  onUpdate,
  maxItems = 20
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [operationValue, setOperationValue] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState<string>('');

  // Define operations based on item type
  const getAvailableOperations = (): BulkOperation[] => {
    const commonOps: BulkOperation[] = [
      {
        id: 'delete',
        name: 'Eliminar seleccionados',
        description: 'Elimina los elementos seleccionados',
        icon: Trash2
      },
      {
        id: 'duplicate',
        name: 'Duplicar seleccionados',
        description: 'Crea copias de los elementos seleccionados',
        icon: Copy
      },
      {
        id: 'move_up',
        name: 'Mover arriba',
        description: 'Mueve los elementos hacia arriba en la lista',
        icon: ArrowUp
      },
      {
        id: 'move_down',
        name: 'Mover abajo',
        description: 'Mueve los elementos hacia abajo en la lista',
        icon: ArrowDown
      }
    ];

    switch (itemType) {
      case 'statistics':
        return [
          ...commonOps,
          {
            id: 'update_suffix',
            name: 'Cambiar sufijo',
            description: 'Actualiza el sufijo de todas las estadísticas seleccionadas',
            icon: Edit,
            requiresValue: true,
            valueType: 'select',
            valueOptions: [
              { value: '+', label: 'Más (+)' },
              { value: 'K', label: 'Miles (K)' },
              { value: 'M', label: 'Millones (M)' },
              { value: '%', label: 'Porcentaje (%)' },
              { value: '', label: 'Sin sufijo' }
            ]
          },
          {
            id: 'round_values',
            name: 'Redondear valores',
            description: 'Redondea los valores numéricos a números enteros',
            icon: Wand2
          }
        ];
      
      case 'services':
        return [
          ...commonOps,
          {
            id: 'update_cta',
            name: 'Actualizar CTA',
            description: 'Cambia el texto del botón de acción',
            icon: Edit,
            requiresValue: true,
            valueType: 'text'
          }
        ];
      
      case 'projects':
        return [
          ...commonOps,
          {
            id: 'change_category',
            name: 'Cambiar categoría',
            description: 'Asigna una nueva categoría a los proyectos seleccionados',
            icon: Edit,
            requiresValue: true,
            valueType: 'select',
            valueOptions: [
              { value: 'Sanitaria', label: 'Sanitaria' },
              { value: 'Educativa', label: 'Educativa' },
              { value: 'Vial', label: 'Vial' },
              { value: 'Saneamiento', label: 'Saneamiento' },
              { value: 'Industrial', label: 'Industrial' },
              { value: 'Comercial', label: 'Comercial' }
            ]
          }
        ];
      
      case 'pillars':
        return [
          ...commonOps,
          {
            id: 'apply_template',
            name: 'Aplicar template',
            description: 'Aplica un template de descripción estándar',
            icon: Wand2,
            requiresValue: true,
            valueType: 'select',
            valueOptions: [
              { value: 'dip_standard', label: 'Estándar DIP' },
              { value: 'client_focused', label: 'Enfoque Cliente' },
              { value: 'technical', label: 'Técnico Especializado' }
            ]
          }
        ];
      
      case 'policies':
        return [
          ...commonOps,
          {
            id: 'set_priority',
            name: 'Establecer prioridad',
            description: 'Asigna nivel de prioridad a las políticas',
            icon: Edit,
            requiresValue: true,
            valueType: 'select',
            valueOptions: [
              { value: 'high', label: 'Alta' },
              { value: 'medium', label: 'Media' },
              { value: 'low', label: 'Baja' }
            ]
          }
        ];
      
      case 'rotating-words':
        return [
          ...commonOps,
          {
            id: 'capitalize',
            name: 'Capitalizar',
            description: 'Convierte la primera letra en mayúscula',
            icon: Edit
          },
          {
            id: 'lowercase',
            name: 'Minúsculas',
            description: 'Convierte todo el texto a minúsculas',
            icon: Edit
          },
          {
            id: 'check_length',
            name: 'Validar longitud',
            description: 'Identifica palabras muy largas (>15 caracteres)',
            icon: AlertTriangle
          }
        ];
      
      default:
        return commonOps;
    }
  };

  // Get field to display for each item type
  const getItemDisplayField = (item: any): string => {
    switch (itemType) {
      case 'statistics':
        return `${item.label || 'Sin etiqueta'} (${item.value || 0}${item.suffix || ''})`;
      case 'services':
        return item.name || 'Sin nombre';
      case 'projects':
        return `${item.name || 'Sin nombre'} - ${item.type || 'Sin categoría'}`;
      case 'pillars':
        return item.title || 'Sin título';
      case 'policies':
        return item.name || 'Sin nombre';
      case 'rotating-words':
        return typeof item === 'string' ? item : 'Palabra vacía';
      default:
        return 'Elemento';
    }
  };

  // Get sortable fields
  const getSortableFields = () => {
    switch (itemType) {
      case 'statistics':
        return [
          { value: 'order', label: 'Orden original' },
          { value: 'label', label: 'Etiqueta' },
          { value: 'value', label: 'Valor numérico' }
        ];
      case 'services':
      case 'projects':
      case 'pillars':
      case 'policies':
        return [
          { value: 'order', label: 'Orden original' },
          { value: 'name', label: 'Nombre' }
        ];
      case 'rotating-words':
        return [
          { value: 'order', label: 'Orden original' },
          { value: 'length', label: 'Longitud' },
          { value: 'alphabetical', label: 'Alfabético' }
        ];
      default:
        return [{ value: 'order', label: 'Orden original' }];
    }
  };

  // Toggle item selection
  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Select all items
  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((_, index) => index));
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (!filterText) return true;
    const displayText = getItemDisplayField(item).toLowerCase();
    return displayText.includes(filterText.toLowerCase());
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal: any = a;
    let bVal: any = b;

    switch (sortBy) {
      case 'label':
      case 'name':
        aVal = (a.label || a.name || '').toLowerCase();
        bVal = (b.label || b.name || '').toLowerCase();
        break;
      case 'value':
        aVal = a.value || 0;
        bVal = b.value || 0;
        break;
      case 'length':
        aVal = typeof a === 'string' ? a.length : 0;
        bVal = typeof b === 'string' ? b.length : 0;
        break;
      case 'alphabetical':
        aVal = (typeof a === 'string' ? a : '').toLowerCase();
        bVal = (typeof b === 'string' ? b : '').toLowerCase();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Execute bulk operation
  const executeBulkOperation = () => {
    if (!selectedOperation || selectedItems.length === 0) return;

    const operation = getAvailableOperations().find(op => op.id === selectedOperation);
    if (!operation) return;

    // Check if operation requires value
    if (operation.requiresValue && !operationValue) {
      alert('Esta operación requiere un valor');
      return;
    }

    let newItems = [...items];

    switch (selectedOperation) {
      case 'delete':
        // Delete selected items
        newItems = items.filter((_, index) => !selectedItems.includes(index));
        break;

      case 'duplicate':
        // Duplicate selected items
        const itemsToDuplicate = selectedItems.map(index => ({ ...items[index] }));
        newItems = [...items, ...itemsToDuplicate];
        break;

      case 'move_up':
        // Move items up (swap with previous)
        const sortedUp = [...selectedItems].sort((a, b) => a - b);
        sortedUp.forEach(index => {
          if (index > 0) {
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
          }
        });
        break;

      case 'move_down':
        // Move items down (swap with next)
        const sortedDown = [...selectedItems].sort((a, b) => b - a);
        sortedDown.forEach(index => {
          if (index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
          }
        });
        break;

      // Type-specific operations
      case 'update_suffix':
        selectedItems.forEach(index => {
          if (newItems[index]) {
            newItems[index].suffix = operationValue;
          }
        });
        break;

      case 'round_values':
        selectedItems.forEach(index => {
          if (newItems[index] && newItems[index].value) {
            newItems[index].value = Math.round(newItems[index].value);
          }
        });
        break;

      case 'update_cta':
        selectedItems.forEach(index => {
          if (newItems[index]) {
            if (!newItems[index].cta) newItems[index].cta = {};
            newItems[index].cta.text = operationValue;
          }
        });
        break;

      case 'change_category':
        selectedItems.forEach(index => {
          if (newItems[index]) {
            newItems[index].type = operationValue;
          }
        });
        break;

      case 'set_priority':
        selectedItems.forEach(index => {
          if (newItems[index]) {
            newItems[index].priority = operationValue;
          }
        });
        break;

      case 'capitalize':
        selectedItems.forEach(index => {
          if (typeof newItems[index] === 'string') {
            newItems[index] = newItems[index].charAt(0).toUpperCase() + 
                             newItems[index].slice(1).toLowerCase();
          }
        });
        break;

      case 'lowercase':
        selectedItems.forEach(index => {
          if (typeof newItems[index] === 'string') {
            newItems[index] = newItems[index].toLowerCase();
          }
        });
        break;
    }

    onUpdate(newItems);
    setSelectedItems([]);
    setSelectedOperation('');
    setOperationValue('');
  };

  // Add new item
  const addNewItem = () => {
    if (items.length >= maxItems) {
      alert(`Máximo ${maxItems} elementos permitidos`);
      return;
    }

    let newItem: any;
    
    switch (itemType) {
      case 'statistics':
        newItem = { icon: 'BarChart', value: 0, suffix: '', label: 'Nueva estadística', description: '' };
        break;
      case 'services':
        newItem = { name: 'Nuevo servicio', description: '', cta: { text: 'Ver más', link: '#' } };
        break;
      case 'projects':
        newItem = { id: `project-${Date.now()}`, name: 'Nuevo proyecto', type: 'Industrial', description: '' };
        break;
      case 'pillars':
        newItem = { id: Date.now(), icon: 'Building2', title: 'Nuevo pilar', description: '', image: '', image_fallback: '' };
        break;
      case 'policies':
        newItem = { name: 'Nueva política', description: '', icon: 'Shield', priority: 'medium' };
        break;
      case 'rotating-words':
        newItem = 'Nueva palabra';
        break;
      default:
        newItem = {};
    }

    onUpdate([...items, newItem]);
  };

  const operations = getAvailableOperations();
  const sortableFields = getSortableFields();
  const selectedOperation_obj = operations.find(op => op.id === selectedOperation);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MoreHorizontal className="h-5 w-5" />
              Operaciones Masivas
              <Badge variant="outline">{items.length} elementos</Badge>
            </CardTitle>
            <CardDescription>
              Gestiona múltiples elementos de forma eficiente
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewItem}
              disabled={items.length >= maxItems}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filter and Sort Controls */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Filtrar elementos..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              {sortableFields.map(field => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>

        {/* Item List */}
        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <Checkbox
              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm font-medium">
              Seleccionar todo ({selectedItems.length}/{filteredItems.length})
            </span>
          </div>
          
          {sortedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                checked={selectedItems.includes(index)}
                onCheckedChange={() => toggleItemSelection(index)}
              />
              
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate">
                  {getItemDisplayField(item)}
                </span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              {filterText ? 'No se encontraron elementos con ese filtro' : 'No hay elementos para mostrar'}
            </div>
          )}
        </div>

        {/* Bulk Operations */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">
                {selectedItems.length} elemento{selectedItems.length > 1 ? 's' : ''} seleccionado{selectedItems.length > 1 ? 's' : ''}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar operación..." />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map(operation => (
                      <SelectItem key={operation.id} value={operation.id}>
                        <div className="flex items-center gap-2">
                          <operation.icon className="h-4 w-4" />
                          {operation.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOperation_obj?.requiresValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor requerido:
                  </label>
                  {selectedOperation_obj.valueType === 'select' && selectedOperation_obj.valueOptions ? (
                    <Select value={operationValue} onValueChange={setOperationValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar valor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedOperation_obj.valueOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : selectedOperation_obj.valueType === 'textarea' ? (
                    <Textarea
                      value={operationValue}
                      onChange={(e) => setOperationValue(e.target.value)}
                      placeholder="Ingrese el valor..."
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={operationValue}
                      onChange={(e) => setOperationValue(e.target.value)}
                      placeholder="Ingrese el valor..."
                      type={selectedOperation_obj.valueType === 'number' ? 'number' : 'text'}
                    />
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={executeBulkOperation}
                  disabled={!selectedOperation || (selectedOperation_obj?.requiresValue && !operationValue)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Ejecutar Operación
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedItems([])}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>

              {selectedOperation_obj && (
                <p className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                  ℹ️ {selectedOperation_obj.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{items.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{selectedItems.length}</div>
            <div className="text-xs text-gray-600">Seleccionados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{maxItems - items.length}</div>
            <div className="text-xs text-gray-600">Disponibles</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkOperations;