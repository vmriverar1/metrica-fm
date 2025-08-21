'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Upload,
  RefreshCw,
  Eye,
  Archive,
  Star,
  Calendar,
  Tag,
  BarChart3
} from 'lucide-react'

interface DynamicItem {
  id: string
  title: string
  status: 'published' | 'draft' | 'archived'
  category: string
  lastModified: string
  author?: string
  featured?: boolean
  metrics?: {
    views: number
    engagement: number
  }
}

interface DynamicContentManagerProps {
  module: 'newsletter' | 'portfolio' | 'careers'
  items: DynamicItem[]
  categories: string[]
  onCreateItem: () => void
  onEditItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onToggleFeatured: (id: string) => void
  onBulkOperation: (operation: string, ids: string[]) => void
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, any>) => void
  loading?: boolean
}

export default function DynamicContentManager({
  module,
  items,
  categories,
  onCreateItem,
  onEditItem,
  onDeleteItem,
  onToggleFeatured,
  onBulkOperation,
  onSearch,
  onFilter,
  loading = false
}: DynamicContentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Module-specific configurations
  const moduleConfig = {
    newsletter: {
      title: 'Gestión de Artículos',
      itemName: 'artículo',
      icon: '📰',
      fields: ['title', 'author', 'category', 'published_date', 'reading_time'],
      actions: ['publish', 'schedule', 'duplicate']
    },
    portfolio: {
      title: 'Gestión de Proyectos',
      itemName: 'proyecto',
      icon: '🏗️',
      fields: ['title', 'client', 'category', 'completion_date', 'investment'],
      actions: ['feature', 'archive', 'export']
    },
    careers: {
      title: 'Gestión de Ofertas',
      itemName: 'oferta',
      icon: '💼',
      fields: ['title', 'department', 'location', 'posted_date', 'applications'],
      actions: ['activate', 'pause', 'duplicate']
    }
  }

  const config = moduleConfig[module]

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }, [onSearch])

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === items.length 
        ? [] 
        : items.map(item => item.id)
    )
  }

  const handleBulkAction = (action: string) => {
    if (selectedItems.length > 0) {
      onBulkOperation(action, selectedItems)
      setSelectedItems([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {config.title}
            </h1>
            <p className="text-gray-600">
              {items.length} {config.itemName}{items.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        
        <Button onClick={onCreateItem} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo {config.itemName}</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Buscar ${config.itemName}s...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
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

          {/* Active Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(activeFilters).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="px-3 py-1">
                  {key}: {value}
                  <button
                    onClick={() => {
                      const newFilters = { ...activeFilters }
                      delete newFilters[key]
                      setActiveFilters(newFilters)
                      onFilter(newFilters)
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {selectedItems.length} elemento{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                {config.actions.map(action => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction(action)}
                    className="capitalize"
                  >
                    {action}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="published">Publicados</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="archived">Archivados</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
            }>
              {items.map(item => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg font-medium line-clamp-2">
                            {item.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            {item.featured && (
                              <Badge variant="outline" className="text-yellow-600">
                                <Star className="h-3 w-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Categoría: {item.category}</span>
                        {item.author && <span>Autor: {item.author}</span>}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.lastModified)}</span>
                        </div>
                        
                        {item.metrics && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{item.metrics.views}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditItem(item.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      
                      {item.featured !== undefined && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleFeatured(item.id)}
                          className={item.featured ? 'text-yellow-600' : ''}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {items.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay {config.itemName}s aún
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer {config.itemName}
              </p>
              <Button onClick={onCreateItem}>
                <Plus className="h-4 w-4 mr-2" />
                Crear {config.itemName}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Similar content for other tabs */}
        <TabsContent value="published">
          {/* Filter items by status */}
        </TabsContent>
        
        <TabsContent value="draft">
          {/* Filter items by status */}
        </TabsContent>
        
        <TabsContent value="archived">
          {/* Filter items by status */}
        </TabsContent>
      </Tabs>
    </div>
  )
}