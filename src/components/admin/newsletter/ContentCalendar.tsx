'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Send,
  AlertCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  FileText,
  Star,
  Target,
  TrendingUp,
  BarChart3,
  List,
  Grid3X3,
  Settings
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  type: 'article' | 'newsletter' | 'social' | 'campaign'
  status: 'idea' | 'draft' | 'review' | 'scheduled' | 'published'
  author_id: string
  author_name: string
  category: string
  tags: string[]
  planned_date: string
  published_date?: string
  deadline?: string
  priority: 'low' | 'medium' | 'high'
  description?: string
  estimated_time: number
  progress: number
  dependencies?: string[]
  assignees: string[]
  notes?: string
}

interface CalendarEvent {
  id: string
  title: string
  type: string
  status: string
  date: string
  color: string
  items: ContentItem[]
}

interface ContentCalendarProps {
  items: ContentItem[]
  authors: { id: string; name: string; color: string }[]
  categories: { id: string; name: string; color: string }[]
  onCreateItem: (item: Omit<ContentItem, 'id'>) => Promise<void>
  onUpdateItem: (id: string, updates: Partial<ContentItem>) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onDragItem: (itemId: string, newDate: string) => Promise<void>
  onBulkOperation: (operation: string, itemIds: string[]) => Promise<void>
  loading?: boolean
}

export default function ContentCalendar({
  items,
  authors,
  categories,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onDragItem,
  onBulkOperation,
  loading = false
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Status configurations
  const statusConfig = {
    idea: { color: 'bg-gray-100 text-gray-800', label: 'Idea' },
    draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Borrador' },
    review: { color: 'bg-blue-100 text-blue-800', label: 'Revisión' },
    scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Programado' },
    published: { color: 'bg-green-100 text-green-800', label: 'Publicado' }
  }

  const typeConfig = {
    article: { icon: <FileText className="h-4 w-4" />, label: 'Artículo', color: '#3B82F6' },
    newsletter: { icon: <Send className="h-4 w-4" />, label: 'Newsletter', color: '#10B981' },
    social: { icon: <Star className="h-4 w-4" />, label: 'Social Media', color: '#F59E0B' },
    campaign: { icon: <Target className="h-4 w-4" />, label: 'Campaña', color: '#EF4444' }
  }

  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-800', label: 'Baja' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
    high: { color: 'bg-red-100 text-red-800', label: 'Alta' }
  }

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesAuthor = filterAuthor === 'all' || item.author_id === filterAuthor
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      
      return matchesSearch && matchesAuthor && matchesCategory && matchesStatus
    })
  }, [items, searchQuery, filterAuthor, filterCategory, filterStatus])

  // Generate calendar data
  const calendarData = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startOfCalendar = new Date(startOfMonth)
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay())
    
    const days = []
    const current = new Date(startOfCalendar)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0]
      const dayItems = filteredItems.filter(item => 
        item.planned_date.split('T')[0] === dateStr
      )
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        isToday: current.toDateString() === new Date().toDateString(),
        items: dayItems
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate, filteredItems])

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAllVisible = () => {
    setSelectedItems(
      selectedItems.length === filteredItems.length 
        ? []
        : filteredItems.map(item => item.id)
    )
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    
    if (draggedItem) {
      onDragItem(draggedItem, dateStr)
      setDraggedItem(null)
    }
  }

  // Bulk operations
  const handleBulkOperation = async (operation: string) => {
    if (selectedItems.length === 0) return
    
    try {
      await onBulkOperation(operation, selectedItems)
      setSelectedItems([])
    } catch (error) {
      console.error('Bulk operation failed:', error)
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // Get month statistics
  const monthStats = useMemo(() => {
    const monthItems = items.filter(item => {
      const itemDate = new Date(item.planned_date)
      return itemDate.getMonth() === currentDate.getMonth() &&
             itemDate.getFullYear() === currentDate.getFullYear()
    })
    
    return {
      total: monthItems.length,
      published: monthItems.filter(item => item.status === 'published').length,
      scheduled: monthItems.filter(item => item.status === 'scheduled').length,
      inProgress: monthItems.filter(item => ['draft', 'review'].includes(item.status)).length,
      overdue: monthItems.filter(item => 
        item.deadline && new Date(item.deadline) < new Date() && item.status !== 'published'
      ).length
    }
  }, [items, currentDate])

  // Render calendar day
  const renderCalendarDay = (day: any) => {
    const { date, dateStr, isCurrentMonth, isToday, items: dayItems } = day
    
    return (
      <div
        key={dateStr}
        className={`min-h-24 border border-gray-200 p-2 ${
          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, dateStr)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600' : ''}`}>
            {date.getDate()}
          </span>
          
          {dayItems.length > 0 && (
            <span className="text-xs text-gray-500">
              {dayItems.length}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          {dayItems.slice(0, 3).map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onClick={() => setEditingItem(item)}
              className={`text-xs p-1 rounded cursor-pointer truncate transition-colors ${
                selectedItems.includes(item.id) 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:shadow-sm'
              }`}
              style={{ 
                backgroundColor: typeConfig[item.type].color + '20',
                borderLeft: `3px solid ${typeConfig[item.type].color}`
              }}
            >
              <div className="flex items-center space-x-1">
                {typeConfig[item.type].icon}
                <span className="truncate">{item.title}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <Badge size="sm" className={statusConfig[item.status].color}>
                  {statusConfig[item.status].label}
                </Badge>
                {item.priority === 'high' && (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
          ))}
          
          {dayItems.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayItems.length - 3} más
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            setSelectedDate(dateStr)
            setShowCreateModal(true)
          }}
          className="w-full mt-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          + Agregar
        </button>
      </div>
    )
  }

  // Render list view item
  const renderListItem = (item: ContentItem) => {
    const isSelected = selectedItems.includes(item.id)
    const author = authors.find(a => a.id === item.author_id)
    const category = categories.find(c => c.id === item.category)
    
    return (
      <Card 
        key={item.id}
        className={`transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleItemSelection(item.id)}
              className="mt-1 rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={priorityConfig[item.priority].color}>
                    {priorityConfig[item.priority].label}
                  </Badge>
                  <Badge className={statusConfig[item.status].color}>
                    {statusConfig[item.status].label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  {typeConfig[item.type].icon}
                  <span>{typeConfig[item.type].label}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{author?.name}</span>
                </div>
                
                {category && (
                  <div className="flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(item.planned_date).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{item.progress}%</span>
                  
                  <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario Editorial
          </h1>
          <p className="text-gray-600">
            Planifica y gestiona el contenido de tu blog
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contenido
          </Button>
          
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Este Mes</p>
                <p className="text-2xl font-bold">{monthStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publicados</p>
                <p className="text-2xl font-bold">{monthStats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Programados</p>
                <p className="text-2xl font-bold">{monthStats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold">{monthStats.inProgress}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold">{monthStats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar contenido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los autores</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
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
                <Button variant="outline" size="sm" onClick={() => handleBulkOperation('schedule')}>
                  Programar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkOperation('publish')}>
                  Publicar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkOperation('archive')}>
                  Archivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('delete')}
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

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="month">
              <Calendar className="h-4 w-4 mr-2" />
              Mes
            </TabsTrigger>
            <TabsTrigger value="week">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
          </TabsList>
          
          {viewMode !== 'list' && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold min-w-48 text-center">
                {new Intl.DateTimeFormat('es-ES', { 
                  month: 'long', 
                  year: 'numeric' 
                }).format(currentDate)}
              </h2>
              
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
            </div>
          )}
        </div>

        {/* Month View */}
        <TabsContent value="month">
          <Card>
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-4 text-center font-medium text-gray-700 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Body */}
              <div className="grid grid-cols-7">
                {calendarData.map(renderCalendarDay)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Week View */}
        <TabsContent value="week">
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vista semanal
                </h3>
                <p className="text-gray-600">
                  La vista semanal estará disponible próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Contenido ({filteredItems.length})
              </h2>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllVisible}
              >
                {selectedItems.length === filteredItems.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </Button>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay contenido programado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza creando tu primer elemento de contenido
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear contenido
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(renderListItem)}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal would go here */}
      {/* For brevity, I'm not including the full modal implementation */}
    </div>
  )
}