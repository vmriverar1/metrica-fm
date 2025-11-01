'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Search, 
  Tag,
  Hash,
  Palette,
  Eye,
  Save,
  X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string | null;
  order: number;
  count?: number;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

interface CategoryManagerProps {
  categories: Category[];
  onChange: (categories: Category[]) => void;
  allowNesting?: boolean;
  allowReordering?: boolean;
  allowColors?: boolean;
  allowIcons?: boolean;
  maxCategories?: number;
  contextType?: 'blog' | 'services' | 'portfolio' | 'careers' | 'products';
  presetCategories?: Partial<Category>[];
  showCounts?: boolean;
  validation?: {
    nameRequired?: boolean;
    nameMaxLength?: number;
    descriptionMaxLength?: number;
  };
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories = [],
  onChange,
  allowNesting = false,
  allowReordering = true,
  allowColors = true,
  allowIcons = false,
  maxCategories = 20,
  contextType = 'blog',
  presetCategories = [],
  showCounts = true,
  validation = {
    nameRequired: true,
    nameMaxLength: 50,
    descriptionMaxLength: 200
  }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#00A8E8',
    status: 'active'
  });

  // Filtrar categorías por búsqueda
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener categorías raíz (sin parent) para nesting
  const rootCategories = allowNesting 
    ? filteredCategories.filter(cat => !cat.parent_id)
    : filteredCategories;

  // Obtener subcategorías de una categoría padre
  const getSubCategories = (parentId: string) => {
    return filteredCategories.filter(cat => cat.parent_id === parentId);
  };

  // Generar slug automáticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Agregar nueva categoría
  const handleAddCategory = () => {
    if (!newCategory.name?.trim()) return;

    const id = Date.now().toString();
    const category: Category = {
      id,
      name: newCategory.name.trim(),
      slug: generateSlug(newCategory.name.trim()),
      description: newCategory.description?.trim() || '',
      color: newCategory.color || '#00A8E8',
      icon: newCategory.icon || 'Tag',
      parent_id: newCategory.parent_id || null,
      order: categories.length,
      count: 0,
      status: newCategory.status || 'active',
      metadata: newCategory.metadata || {}
    };

    onChange([...categories, category]);
    setNewCategory({ name: '', description: '', color: '#00A8E8', status: 'active' });
    setShowAddForm(false);
  };

  // Actualizar categoría existente
  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id 
        ? { 
            ...cat, 
            ...updates,
            slug: updates.name ? generateSlug(updates.name) : cat.slug
          }
        : cat
    );
    onChange(updatedCategories);
    setEditingId(null);
  };

  // Eliminar categoría
  const handleDeleteCategory = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      const updatedCategories = categories.filter(cat => {
        // Si permite nesting, también eliminar subcategorías
        if (allowNesting && cat.parent_id === id) return false;
        return cat.id !== id;
      });
      onChange(updatedCategories);
    }
  };

  // Reordenar categorías (drag & drop)
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden
    const reorderedCategories = items.map((item, index) => ({
      ...item,
      order: index
    }));

    onChange(reorderedCategories);
  };

  // Aplicar preset de categorías según contexto
  const applyPresetCategories = () => {
    const presets = getPresetsByContext(contextType);
    const newCategories = presets.map((preset, index) => ({
      id: Date.now().toString() + index,
      name: preset.name || '',
      slug: generateSlug(preset.name || ''),
      description: preset.description || '',
      color: preset.color || '#00A8E8',
      icon: preset.icon || 'Tag',
      parent_id: null,
      order: categories.length + index,
      count: 0,
      status: 'active' as const,
      metadata: preset.metadata || {}
    }));

    onChange([...categories, ...newCategories]);
  };

  // Presets por contexto
  const getPresetsByContext = (context: string) => {
    const presets = {
      blog: [
        { name: 'Tecnología', color: '#2563eb', description: 'Artículos sobre innovación y tecnología' },
        { name: 'Construcción', color: '#059669', description: 'Procesos y técnicas de construcción' },
        { name: 'Gestión', color: '#7c3aed', description: 'Gestión de proyectos y equipos' },
        { name: 'Sostenibilidad', color: '#0891b2', description: 'Prácticas sostenibles y medio ambiente' }
      ],
      services: [
        { name: 'Consultoría', color: '#2563eb', description: 'Servicios de consultoría estratégica' },
        { name: 'Gestión', color: '#059669', description: 'Gestión integral de proyectos' },
        { name: 'Supervisión', color: '#7c3aed', description: 'Supervisión técnica especializada' },
        { name: 'Auditoría', color: '#ea580c', description: 'Auditoría y control de calidad' }
      ],
      portfolio: [
        { name: 'Sanitaria', color: '#2563eb', description: 'Proyectos de infraestructura sanitaria' },
        { name: 'Educativa', color: '#059669', description: 'Infraestructura educativa' },
        { name: 'Vial', color: '#7c3aed', description: 'Proyectos viales y transporte' },
        { name: 'Industrial', color: '#ea580c', description: 'Infraestructura industrial' }
      ]
    };
    return presets[context as keyof typeof presets] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Gestión de Categorías
            {showCounts && (
              <Badge variant="secondary">{categories.length}/{maxCategories}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {presetCategories.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={applyPresetCategories}
                disabled={categories.length >= maxCategories}
              >
                <Palette className="w-4 h-4 mr-2" />
                Aplicar Presets
              </Button>
            )}
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              disabled={categories.length >= maxCategories}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Formulario de nueva categoría */}
        {showAddForm && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de la categoría"
                    maxLength={validation.nameMaxLength}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción breve"
                    maxLength={validation.descriptionMaxLength}
                  />
                </div>

                {allowColors && (
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newCategory.color || '#00A8E8'}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={newCategory.color || '#00A8E8'}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#00A8E8"
                      />
                    </div>
                  </div>
                )}

                {allowNesting && categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Categoría Padre</label>
                    <select
                      value={newCategory.parent_id || ''}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, parent_id: e.target.value || null }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Sin categoría padre</option>
                      {rootCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddCategory} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de categorías */}
        {allowReordering ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable 
              droppableId="categories" 
              isDropDisabled={false} 
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {rootCategories.map((category, index) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      index={index}
                      editingId={editingId}
                      onEdit={setEditingId}
                      onUpdate={handleUpdateCategory}
                      onDelete={handleDeleteCategory}
                      allowNesting={allowNesting}
                      allowColors={allowColors}
                      allowIcons={allowIcons}
                      showCounts={showCounts}
                      subCategories={allowNesting ? getSubCategories(category.id) : []}
                      validation={validation}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="space-y-2">
            {rootCategories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
                allowNesting={allowNesting}
                allowColors={allowColors}
                allowIcons={allowIcons}
                showCounts={showCounts}
                subCategories={allowNesting ? getSubCategories(category.id) : []}
                validation={validation}
                draggable={false}
              />
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay categorías{searchTerm ? ' que coincidan con la búsqueda' : ''}</p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(true)}
                className="mt-2"
              >
                Crear primera categoría
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de categoría
interface CategoryItemProps {
  category: Category;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void;
  allowNesting: boolean;
  allowColors: boolean;
  allowIcons: boolean;
  showCounts: boolean;
  subCategories: Category[];
  validation: any;
  draggable?: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  allowNesting,
  allowColors,
  allowIcons,
  showCounts,
  subCategories,
  validation,
  draggable = true
}) => {
  const [editData, setEditData] = useState<Partial<Category>>(category);

  const handleSave = () => {
    onUpdate(category.id, editData);
  };

  const CategoryContent = () => (
    <Card className={`${category.status === 'inactive' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {editingId === category.id ? (
          // Modo edición
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  maxLength={validation.nameMaxLength}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={editData.description || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={validation.descriptionMaxLength}
                />
              </div>
              {allowColors && (
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <input
                    type="color"
                    value={editData.color || '#00A8E8'}
                    onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded border"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={() => onEdit(null)} size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Modo visualización
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {draggable && (
                <Move className="w-4 h-4 text-gray-400 cursor-grab" />
              )}
              {allowColors && (
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.slug}
                  </Badge>
                  {showCounts && category.count !== undefined && (
                    <Badge variant="secondary">
                      <Hash className="w-3 h-3 mr-1" />
                      {category.count}
                    </Badge>
                  )}
                  {category.status === 'inactive' && (
                    <Badge variant="destructive">Inactiva</Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Subcategorías */}
        {allowNesting && subCategories.length > 0 && editingId !== category.id && (
          <div className="mt-4 ml-6 space-y-2">
            {subCategories.map(subCat => (
              <div key={subCat.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>{subCat.name}</span>
                {showCounts && subCat.count !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {subCat.count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (draggable) {
    return (
      <Draggable draggableId={category.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <CategoryContent />
          </div>
        )}
      </Draggable>
    );
  }

  return <CategoryContent />;
};