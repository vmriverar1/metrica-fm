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

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
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

  // Datos simulados de categorías de portfolio
  useEffect(() => {
    const mockCategories: PortfolioCategory[] = [
      {
        id: '1',
        name: 'Educación',
        slug: 'educacion',
        description: 'Proyectos de infraestructura educativa, colegios, universidades y centros de capacitación',
        icon: '🎓',
        color: '#2563eb',
        image: '/images/categories/education.jpg',
        isActive: true,
        projectCount: 12,
        sortOrder: 1,
        seoTitle: 'Proyectos de Educación - Métrica DIP',
        seoDescription: 'Infraestructura educativa de calidad para el desarrollo académico',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-08-20T10:00:00Z'
      },
      {
        id: '2',
        name: 'Salud',
        slug: 'salud',
        description: 'Hospitales, clínicas, centros de salud y proyectos de infraestructura médica',
        icon: '🏥',
        color: '#dc2626',
        image: '/images/categories/health.jpg',
        isActive: true,
        projectCount: 8,
        sortOrder: 2,
        seoTitle: 'Proyectos de Salud - Métrica DIP',
        seoDescription: 'Infraestructura de salud moderna y funcional',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2025-08-19T15:30:00Z'
      },
      {
        id: '3',
        name: 'Oficinas',
        slug: 'oficina',
        description: 'Edificios corporativos, oficinas administrativas y espacios de trabajo modernos',
        icon: '🏢',
        color: '#7c3aed',
        image: '/images/categories/office.jpg',
        isActive: true,
        projectCount: 15,
        sortOrder: 3,
        seoTitle: 'Proyectos de Oficinas - Métrica DIP',
        seoDescription: 'Espacios de trabajo modernos y eficientes',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2025-08-18T09:45:00Z'
      },
      {
        id: '4',
        name: 'Hotelería',
        slug: 'hoteleria',
        description: 'Hoteles, resorts, hostales y proyectos de turismo y hospitalidad',
        icon: '🏨',
        color: '#059669',
        image: '/images/categories/hospitality.jpg',
        isActive: true,
        projectCount: 6,
        sortOrder: 4,
        seoTitle: 'Proyectos de Hotelería - Métrica DIP',
        seoDescription: 'Infraestructura turística y hotelera de calidad',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2025-08-17T14:20:00Z'
      },
      {
        id: '5',
        name: 'Industria',
        slug: 'industria',
        description: 'Plantas industriales, fábricas, almacenes y proyectos de manufactura',
        icon: '🏭',
        color: '#ea580c',
        image: '/images/categories/industry.jpg',
        isActive: true,
        projectCount: 10,
        sortOrder: 5,
        seoTitle: 'Proyectos Industriales - Métrica DIP',
        seoDescription: 'Infraestructura industrial eficiente y segura',
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2025-08-16T11:10:00Z'
      },
      {
        id: '6',
        name: 'Retail',
        slug: 'retail',
        description: 'Centros comerciales, tiendas, supermercados y espacios comerciales',
        icon: '🛍️',
        color: '#dc2626',
        image: '/images/categories/retail.jpg',
        isActive: true,
        projectCount: 9,
        sortOrder: 6,
        seoTitle: 'Proyectos Retail - Métrica DIP',
        seoDescription: 'Espacios comerciales atractivos y funcionales',
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2025-08-15T16:30:00Z'
      },
      {
        id: '7',
        name: 'Vivienda',
        slug: 'vivienda',
        description: 'Condominios, departamentos, casas y proyectos residenciales',
        icon: '🏠',
        color: '#0891b2',
        image: '/images/categories/residential.jpg',
        isActive: true,
        projectCount: 18,
        sortOrder: 7,
        seoTitle: 'Proyectos de Vivienda - Métrica DIP',
        seoDescription: 'Proyectos residenciales modernos y confortables',
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2025-08-14T13:45:00Z'
      },
      {
        id: '8',
        name: 'Infraestructura',
        slug: 'infraestructura',
        description: 'Carreteras, puentes, obras públicas y proyectos de infraestructura urbana',
        icon: '🌉',
        color: '#6b7280',
        image: '/images/categories/infrastructure.jpg',
        isActive: false,
        projectCount: 4,
        sortOrder: 8,
        seoTitle: 'Proyectos de Infraestructura - Métrica DIP',
        seoDescription: 'Infraestructura pública para el desarrollo urbano',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2025-08-13T08:15:00Z'
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
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

  const handleSaveCategory = (data: any) => {
    if (selectedCategory) {
      setCategories(prev => prev.map(c => 
        c.id === selectedCategory.id 
          ? { 
              ...c, 
              ...data, 
              updatedAt: new Date().toISOString(),
              slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
          : c
      ));
      setActiveTab('list');
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.projectCount > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.projectCount} proyectos asociados.`);
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories(prev => prev.map(c => 
      c.id === categoryId 
        ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
        : c
    ));
  };

  const columns = [
    {
      key: 'name',
      label: 'Categoría',
      render: (value: string, row: PortfolioCategory) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${row.color}20`, color: row.color }}
          >
            {row.icon}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">/{row.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 line-clamp-2">{value}</p>
        </div>
      )
    },
    {
      key: 'projectCount',
      label: 'Proyectos',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value: boolean, row: PortfolioCategory) => (
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(value)}>
            {value ? 'Activa' : 'Inactiva'}
          </Badge>
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleStatus(row.id)}
            size="sm"
          />
        </div>
      )
    },
    {
      key: 'sortOrder',
      label: 'Orden',
      render: (value: number) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: 'updatedAt',
      label: 'Actualizado',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('es-ES')}
        </span>
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
        name: 'name',
        label: 'Nombre',
        type: 'text',
        required: true,
        placeholder: 'Nombre de la categoría'
      },
      {
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        required: true,
        placeholder: 'Descripción de la categoría'
      },
      {
        name: 'icon',
        label: 'Icono (Emoji)',
        type: 'text',
        placeholder: '🏢'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        required: true
      },
      {
        name: 'sortOrder',
        label: 'Orden',
        type: 'number',
        required: true,
        min: 1
      },
      {
        name: 'isActive',
        label: 'Estado Activo',
        type: 'checkbox'
      },
      {
        name: 'seoTitle',
        label: 'Título SEO',
        type: 'text',
        placeholder: 'Título para motores de búsqueda'
      },
      {
        name: 'seoDescription',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Categorías del Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Administra las categorías de proyectos del portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('create')}
            className="bg-[#E84E0F] hover:bg-[#E84E0F]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-8 w-8 text-[#003F6F]" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-gray-600">Total Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-[#E84E0F]" />
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-sm text-gray-600">Total Proyectos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCategories}</p>
                <p className="text-sm text-gray-600">Categorías Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{categories.length - activeCategories}</p>
                <p className="text-sm text-gray-600">Categorías Inactivas</p>
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
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
            <CardContent>
              <DataTable
                data={filteredCategories}
                columns={columns}
                actions={actions}
                searchable={false}
              />
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
                    {selectedCategory.image && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Imagen:</label>
                        <div className="mt-1 w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="h-12 w-12 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">
                            {selectedCategory.image}
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
                  schema={formSchema}
                  data={selectedCategory}
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
                schema={{
                  ...formSchema,
                  title: 'Nueva Categoría'
                }}
                data={{
                  isActive: true,
                  sortOrder: categories.length + 1,
                  color: '#6b7280'
                }}
                onSubmit={(data) => {
                  const newCategory: PortfolioCategory = {
                    id: Date.now().toString(),
                    name: data.name,
                    slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    description: data.description,
                    icon: data.icon || '📁',
                    color: data.color,
                    isActive: data.isActive,
                    projectCount: 0,
                    sortOrder: data.sortOrder,
                    seoTitle: data.seoTitle,
                    seoDescription: data.seoDescription,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setCategories(prev => [...prev, newCategory]);
                  setActiveTab('list');
                }}
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