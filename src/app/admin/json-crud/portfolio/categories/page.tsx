'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Building2,
  Image,
  Tag,
  BarChart3,
  Settings,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import DynamicForm from '@/components/admin/DynamicForm';
import ImageSelector from '@/components/admin/ImageSelector';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  backgroundImage?: string; // Imagen para el hero de la categoría
  isActive: boolean;
  projectCount: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const PortfolioCategoriesPage = () => {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const router = useRouter();

  // Cargar categorías desde Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await FirestoreCore.getDocuments('portfolio_categories', {
          orderBy: [{ field: 'sortOrder', direction: 'asc' }]
        });

        if (result.success && result.data) {
          setCategories(result.data);
          console.log(`✅ Loaded ${result.data.length} categories from Firestore`);
        } else {
          console.error('❌ Error loading categories:', result.error);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === null || category.isActive === filterActive;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleEditCategory = (category: PortfolioCategory) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleViewCategory = (category: PortfolioCategory) => {
    setSelectedCategory(category);
    setIsEditing(false);
    setActiveTab('view');
  };

  const handleCreateCategory = async (data: any) => {
    try {
      const newCategory = {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description,
        icon: data.icon || '📁',
        color: data.color,
        backgroundImage: data.backgroundImage || '',
        isActive: data.isActive,
        projectCount: 0,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await FirestoreCore.createDocument('portfolio_categories', newCategory);

      if (result.success) {
        const createdCategory = { ...newCategory, id: result.data?.id };
        setCategories(prev => [...prev, createdCategory]);
        setActiveTab('list');
        console.log('✅ Category created successfully');
      } else {
        console.error('❌ Error creating category:', result.error);
        alert('Error al crear la categoría: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error creating category:', error);
      alert('Error al crear la categoría');
    }
  };

  const handleSaveCategory = async (data: any) => {
    if (!selectedCategory) return;

    try {
      const updatedCategory = {
        ...data,
        updatedAt: new Date().toISOString(),
        slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      const result = await FirestoreCore.updateDocument('portfolio_categories', selectedCategory.id, updatedCategory);

      if (result.success) {
        setCategories(prev => prev.map(c =>
          c.id === selectedCategory.id ? { ...c, ...updatedCategory } : c
        ));
        setActiveTab('list');
        setSelectedCategory(null);
        console.log('✅ Category updated successfully');
      } else {
        console.error('❌ Error updating category:', result.error);
        alert('Error al actualizar la categoría: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.projectCount > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.projectCount} proyectos asociados.`);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

    try {
      const result = await FirestoreCore.deleteDocument('portfolio_categories', categoryId);

      if (result.success) {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        console.log('✅ Category deleted successfully');
      } else {
        console.error('❌ Error deleting category:', result.error);
        alert('Error al eliminar la categoría: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      const updatedData = {
        isActive: !category.isActive,
        updatedAt: new Date().toISOString()
      };

      const result = await FirestoreCore.updateDocument('portfolio_categories', categoryId, updatedData);

      if (result.success) {
        setCategories(prev => prev.map(c =>
          c.id === categoryId ? { ...c, ...updatedData } : c
        ));
        console.log('✅ Category status updated successfully');
      } else {
        console.error('❌ Error updating category status:', result.error);
        alert('Error al actualizar el estado: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      alert('Error al cambiar el estado');
    }
  };

  const columns = [
    {
      key: 'backgroundImage',
      label: 'Imagen',
      render: (value: string, row: PortfolioCategory) => (
        <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
          {value ? (
            <img
              src={value}
              alt={`Imagen de ${row.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs" style="background-color: ${row.color}20; color: ${row.color}">
                      ${row.icon}
                    </div>
                  </div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: `${row.color}20`, color: row.color }}
              >
                {row.icon}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Categoría',
      render: (value: string, row: PortfolioCategory) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate">{value}</div>
            <div className="text-xs text-gray-500 truncate">/{row.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value: boolean, row: PortfolioCategory) => (
        <div className="flex flex-col items-center gap-1">
          <Badge className={getStatusColor(value)} size="sm">
            {value ? 'Activa' : 'Inactiva'}
          </Badge>
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleStatus(row.id)}
            size="sm"
          />
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: handleViewCategory,
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditCategory,
      color: 'text-green-600 hover:text-green-800'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: (category: PortfolioCategory) => handleDeleteCategory(category.id),
      color: 'text-red-600 hover:text-red-800'
    }
  ];

  const formSchema = {
    title: 'Editar Categoría',
    fields: [
      {
        key: 'name',
        label: 'Nombre',
        type: 'text',
        required: true,
        placeholder: 'Nombre de la categoría'
      },
      {
        key: 'description',
        label: 'Descripción',
        type: 'textarea',
        required: true,
        placeholder: 'Descripción de la categoría'
      },
      {
        key: 'icon',
        label: 'Icono (Emoji)',
        type: 'text',
        placeholder: '🏢'
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        required: true
      },
      {
        key: 'backgroundImage',
        label: 'Imagen de Fondo',
        type: 'image',
        placeholder: 'Seleccionar imagen para el hero de la categoría',
        description: 'Imagen que se mostrará en el hero de la página de la categoría'
      },
      {
        key: 'sortOrder',
        label: 'Orden',
        type: 'number',
        required: true,
        min: 1
      },
      {
        key: 'isActive',
        label: 'Estado Activo',
        type: 'checkbox'
      },
      {
        key: 'seoTitle',
        label: 'Título SEO',
        type: 'text',
        placeholder: 'Título para motores de búsqueda'
      },
      {
        key: 'seoDescription',
        label: 'Descripción SEO',
        type: 'textarea',
        placeholder: 'Descripción para motores de búsqueda'
      }
    ]
  };

  const totalProjects = categories.reduce((sum, cat) => sum + cat.projectCount, 0);
  const activeCategories = categories.filter(cat => cat.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F6F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003F6F]">🏷️ Categorías del Portfolio</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Administra las categorías de proyectos del portfolio
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setActiveTab('create')}
            className="bg-[#00A8E8] hover:bg-[#00A8E8]/90 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nueva Categoría</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-6 w-6 md:h-8 md:w-8 text-[#003F6F] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{categories.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Total Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-[#00A8E8] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{totalProjects}</p>
                <p className="text-xs md:text-sm text-gray-600">Total Proyectos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{activeCategories}</p>
                <p className="text-xs md:text-sm text-gray-600">Categorías Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 md:h-8 md:w-8 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{categories.length - activeCategories}</p>
                <p className="text-xs md:text-sm text-gray-600">Categorías Inactivas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Categorías</TabsTrigger>
          <TabsTrigger value="view">Vista Previa</TabsTrigger>
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="create">Crear Nueva</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="relative w-full lg:flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Button
                  variant={filterActive === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(null)}
                >
                  Todas
                </Button>
                <Button
                  variant={filterActive === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(true)}
                >
                  Activas
                </Button>
                <Button
                  variant={filterActive === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(false)}
                >
                  Inactivas
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Exp</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Importar</span>
                  <span className="sm:hidden">Imp</span>
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categorías ({filteredCategories.length})
              </CardTitle>
              <CardDescription>
                Gestiona las categorías de proyectos del portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="min-w-[800px] p-6">
                    <DataTable
                      data={filteredCategories}
                      columns={columns}
                      actions={actions}
                      searchable={false}
                    />
                  </div>
                </div>
              </div>

              {/* Vista de tarjetas para móvil y tablet */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            {category.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{category.name}</h3>
                            <p className="text-xs text-gray-500 truncate">/{category.slug}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {actions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => action.onClick(category)}
                                className={`p-2 rounded-md hover:bg-gray-100 ${action.color} transition-colors`}
                                title={action.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{category.projectCount}</span>
                            </div>
                            
                            <Badge variant="outline" className="font-mono text-xs">
                              #{category.sortOrder}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(category.isActive)} size="sm">
                              {category.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                            <Switch
                              checked={category.isActive}
                              onCheckedChange={() => handleToggleStatus(category.id)}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 text-right">
                          {new Date(category.updatedAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron categorías
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view">
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa: {selectedCategory.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color }}
                      >
                        {selectedCategory.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
                        <p className="text-gray-500">/{selectedCategory.slug}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Descripción:</label>
                      <p className="mt-1">{selectedCategory.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado:</label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedCategory.isActive)}>
                            {selectedCategory.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Proyectos:</label>
                        <div className="mt-1 flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{selectedCategory.projectCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Color:</label>
                        <div className="mt-1 flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedCategory.color }}
                          />
                          <span className="font-mono text-sm">{selectedCategory.color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Orden:</label>
                        <p className="mt-1 font-medium">{selectedCategory.sortOrder}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedCategory.backgroundImage && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Imagen de Fondo:</label>
                        <div className="mt-1 w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="h-12 w-12 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">
                            {selectedCategory.backgroundImage}
                          </span>
                        </div>
                      </div>
                    )}

                    {(selectedCategory.seoTitle || selectedCategory.seoDescription) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">SEO:</label>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          {selectedCategory.seoTitle && (
                            <div>
                              <span className="text-sm font-medium">Título:</span>
                              <p className="text-sm">{selectedCategory.seoTitle}</p>
                            </div>
                          )}
                          {selectedCategory.seoDescription && (
                            <div>
                              <span className="text-sm font-medium">Descripción:</span>
                              <p className="text-sm">{selectedCategory.seoDescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Creado:</label>
                        <p>{new Date(selectedCategory.createdAt).toLocaleString('es-ES')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Actualizado:</label>
                        <p>{new Date(selectedCategory.updatedAt).toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una categoría para ver los detalles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {selectedCategory && isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Editar Categoría: {selectedCategory.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  fields={formSchema.fields}
                  title={formSchema.title}
                  initialValues={selectedCategory}
                  onSubmit={handleSaveCategory}
                  onCancel={() => setActiveTab('list')}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una categoría para editar</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Categoría</CardTitle>
              <CardDescription>
                Crea una nueva categoría para organizar los proyectos del portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicForm
                fields={formSchema.fields}
                title="Nueva Categoría"
                initialValues={{
                  isActive: true,
                  sortOrder: categories.length + 1,
                  color: '#6b7280'
                }}
                onSubmit={handleCreateCategory}
                onCancel={() => setActiveTab('list')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioCategoriesPage;