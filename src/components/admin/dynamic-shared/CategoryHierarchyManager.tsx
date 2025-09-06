'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  BarChart3,
  Eye,
  EyeOff,
  Star,
  ArrowUp,
  ArrowDown,
  Settings,
  Palette,
  Hash
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  parent_id?: string
  order: number
  featured: boolean
  visible: boolean
  item_count: number
  children?: Category[]
  metadata?: Record<string, any>
}

interface CategoryHierarchyManagerProps {
  module: 'newsletter' | 'portfolio' | 'careers'
  categories: Category[]
  onCreateCategory: (parentId?: string) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onReorderCategories: (categories: Category[]) => void
  onToggleVisibility: (id: string) => void
  onToggleFeatured: (id: string) => void
  onUpdateCategoryColor: (id: string, color: string) => void
  onUpdateCategoryIcon: (id: string, icon: string) => void
  maxDepth?: number
  allowNesting?: boolean
}

export default function CategoryHierarchyManager({
  module,
  categories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  onToggleVisibility,
  onToggleFeatured,
  onUpdateCategoryColor,
  onUpdateCategoryIcon,
  maxDepth = 3,
  allowNesting = true
}: CategoryHierarchyManagerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree')
  const [showMetrics, setShowMetrics] = useState(true)

  // Module configurations
  const moduleConfig = {
    newsletter: {
      title: 'Categorías de Artículos',
      icon: '📰',
      defaultCategories: ['Tendencias', 'Casos de Estudio', 'Guías Técnicas', 'Liderazgo'],
      colors: ['#007bc4', '#003F6F', '#34D399', '#8B5CF6', '#F59E0B']
    },
    portfolio: {
      title: 'Categorías de Proyectos',
      icon: '🏗️',
      defaultCategories: ['Oficina', 'Retail', 'Industria', 'Hotelería', 'Educación', 'Vivienda', 'Salud'],
      colors: ['#007bc4', '#003F6F', '#34D399', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
    },
    careers: {
      title: 'Departamentos',
      icon: '💼',
      defaultCategories: ['Ingeniería', 'Arquitectura', 'Administración', 'Ventas', 'Legal'],
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }
  }

  const config = moduleConfig[module]

  // Build hierarchical structure
  const buildHierarchy = useCallback((cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Create map and initialize children arrays
    cats.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Build hierarchy
    cats.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id)
        if (parent) {
          parent.children!.push(category)
        } else {
          rootCategories.push(category)
        }
      } else {
        rootCategories.push(category)
      }
    })

    // Sort by order
    const sortByOrder = (cats: Category[]) => {
      cats.sort((a, b) => a.order - b.order)
      cats.forEach(cat => {
        if (cat.children) {
          sortByOrder(cat.children)
        }
      })
    }

    sortByOrder(rootCategories)
    return rootCategories
  }, [])

  const hierarchicalCategories = buildHierarchy(categories)

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedCategory || draggedCategory === targetId) return

    // Implement reordering logic here
    // This would involve updating the parent_id and order of categories
    console.log(`Moving category ${draggedCategory} to ${targetId}`)
    
    setDraggedCategory(null)
  }

  // Get category depth
  const getCategoryDepth = (category: Category, depth = 0): number => {
    if (!category.parent_id) return depth
    
    const parent = categories.find(c => c.id === category.parent_id)
    if (!parent) return depth
    
    return getCategoryDepth(parent, depth + 1)
  }

  // Render category item
  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isSelected = selectedCategory === category.id

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`group flex items-center space-x-2 p-3 rounded-lg border transition-all ${
            isSelected 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, category.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, category.id)}
          onClick={() => setSelectedCategory(category.id)}
        >
          {/* Drag Handle */}
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100" />

          {/* Expand/Collapse */}
          {allowNesting && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(category.id)
              }}
              className="p-1"
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Icon */}
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-sm"
            style={{ 
              backgroundColor: category.color || '#gray-200',
              color: category.color ? '#white' : '#gray-600'
            }}
          >
            {category.icon || (hasChildren ? <Folder className="h-3 w-3" /> : <Tag className="h-3 w-3" />)}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 truncate">
                {category.name}
              </span>
              
              {category.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              
              {!category.visible && (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-500 truncate">
                {category.description}
              </p>
            )}
          </div>

          {/* Metrics */}
          {showMetrics && (
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>{category.item_count}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(category.id)
              }}
            >
              {category.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFeatured(category.id)
              }}
            >
              <Star className={`h-3 w-3 ${category.featured ? 'text-yellow-500 fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEditCategory(category)
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            {allowNesting && getCategoryDepth(category) < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCreateCategory(category.id)
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteCategory(category.id)
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && category.children && (
          <div className="space-y-1">
            {category.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Render flat view
  const renderFlatView = () => {
    return (
      <div className="space-y-2">
        {categories
          .sort((a, b) => a.order - b.order)
          .map(category => renderCategory(category, 0))}
      </div>
    )
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
              {categories.length} categoría{categories.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'tree' ? 'flat' : 'tree')}
          >
            {viewMode === 'tree' ? (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Vista plana
              </>
            ) : (
              <>
                <Folder className="h-4 w-4 mr-2" />
                Vista árbol
              </>
            )}
          </Button>
          
          <Button onClick={() => onCreateCategory()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva categoría
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Destacadas</p>
                <p className="text-2xl font-bold">
                  {categories.filter(c => c.featured).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visibles</p>
                <p className="text-2xl font-bold">
                  {categories.filter(c => c.visible).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con elementos</p>
                <p className="text-2xl font-bold">
                  {categories.filter(c => c.item_count > 0).length}
                </p>
              </div>
              <Hash className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Categorías</CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay categorías aún
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando categorías para organizar el contenido
              </p>
              <div className="space-y-2">
                <Button onClick={() => onCreateCategory()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera categoría
                </Button>
                <div className="text-sm text-gray-500">
                  Sugerencias: {config.defaultCategories.join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === 'tree' ? (
                <div className="space-y-1">
                  {hierarchicalCategories.map(category => renderCategory(category))}
                </div>
              ) : (
                renderFlatView()
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Selected Category */}
      {selectedCategory && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">
                  Categoría seleccionada: {categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <p className="text-sm text-blue-600">
                  {categories.find(c => c.id === selectedCategory)?.item_count} elementos
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Palette className="h-4 w-4 mr-1" />
                  Color
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}