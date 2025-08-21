'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Briefcase, 
  FileText,
  Star,
  Eye,
  TrendingUp,
  Calendar,
  Award,
  Link2,
  Upload,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Settings,
  Search,
  Filter,
  Download,
  ExternalLink,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react'

interface Author {
  id: string
  name: string
  email: string
  role: string
  bio: string
  avatar: string
  linkedin?: string
  twitter?: string
  website?: string
  featured: boolean
  active: boolean
  articles_count: number
  total_views: number
  avg_engagement: number
  specializations: string[]
  joined_date: string
  last_article_date?: string
  performance_metrics: {
    total_articles: number
    total_views: number
    avg_reading_time: number
    subscriber_growth: number
    social_shares: number
  }
}

interface AuthorStats {
  totalAuthors: number
  activeAuthors: number
  featuredAuthors: number
  totalArticles: number
  avgArticlesPerAuthor: number
  topPerformers: Author[]
}

interface AuthorManagementProps {
  authors: Author[]
  stats: AuthorStats
  onCreateAuthor: (author: Omit<Author, 'id'>) => Promise<void>
  onUpdateAuthor: (id: string, updates: Partial<Author>) => Promise<void>
  onDeleteAuthor: (id: string) => Promise<void>
  onUploadAvatar: (file: File) => Promise<string>
  onBulkOperation: (operation: string, authorIds: string[]) => Promise<void>
  loading?: boolean
}

export default function AuthorManagement({
  authors,
  stats,
  onCreateAuthor,
  onUpdateAuthor,
  onDeleteAuthor,
  onUploadAvatar,
  onBulkOperation,
  loading = false
}: AuthorManagementProps) {
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'featured'>('all')
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Author>>({
    name: '',
    email: '',
    role: '',
    bio: '',
    avatar: '',
    linkedin: '',
    twitter: '',
    website: '',
    featured: false,
    active: true,
    specializations: []
  })
  const [newSpecialization, setNewSpecialization] = useState('')

  // Filter authors
  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         author.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         author.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         author.specializations.some(spec => 
                           spec.toLowerCase().includes(searchQuery.toLowerCase())
                         )
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && author.active) ||
      (filterStatus === 'inactive' && !author.active) ||
      (filterStatus === 'featured' && author.featured)
    
    return matchesSearch && matchesFilter
  })

  // Handle author selection
  const toggleAuthorSelection = (authorId: string) => {
    setSelectedAuthors(prev => 
      prev.includes(authorId)
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
    )
  }

  const selectAllAuthors = () => {
    setSelectedAuthors(
      selectedAuthors.length === filteredAuthors.length 
        ? []
        : filteredAuthors.map(author => author.id)
    )
  }

  // Handle form operations
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      bio: '',
      avatar: '',
      linkedin: '',
      twitter: '',
      website: '',
      featured: false,
      active: true,
      specializations: []
    })
    setEditingAuthor(null)
    setShowCreateForm(false)
    setNewSpecialization('')
  }

  const handleEdit = (author: Author) => {
    setFormData(author)
    setEditingAuthor(author)
    setShowCreateForm(true)
  }

  const handleSave = async () => {
    try {
      if (editingAuthor) {
        await onUpdateAuthor(editingAuthor.id, formData)
      } else {
        await onCreateAuthor(formData as Omit<Author, 'id'>)
      }
      resetForm()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleDelete = async (authorId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este autor?')) {
      try {
        await onDeleteAuthor(authorId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  // Handle specializations
  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations?.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.filter(s => s !== spec) || []
    }))
  }

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      const avatarUrl = await onUploadAvatar(file)
      setFormData(prev => ({ ...prev, avatar: avatarUrl }))
    } catch (error) {
      console.error('Avatar upload failed:', error)
    }
  }

  // Bulk operations
  const handleBulkOperation = async (operation: string) => {
    if (selectedAuthors.length === 0) return
    
    try {
      await onBulkOperation(operation, selectedAuthors)
      setSelectedAuthors([])
    } catch (error) {
      console.error('Bulk operation failed:', error)
    }
  }

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  // Render author card
  const renderAuthorCard = (author: Author) => {
    const isSelected = selectedAuthors.includes(author.id)
    
    return (
      <Card 
        key={author.id}
        className={`transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleAuthorSelection(author.id)}
              className="mt-1 rounded"
            />
            
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{author.name}</h3>
                  <p className="text-sm text-gray-600">{author.role}</p>
                </div>
                
                <div className="flex items-center space-x-1">
                  {author.featured && (
                    <Badge variant="secondary" className="text-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  <Badge 
                    className={author.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {author.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {author.bio}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {author.specializations.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {author.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{author.specializations.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{author.articles_count}</p>
                  <p className="text-gray-600">Artículos</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{formatNumber(author.total_views)}</p>
                  <p className="text-gray-600">Vistas</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{author.avg_engagement.toFixed(1)}%</p>
                  <p className="text-gray-600">Engagement</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{author.email}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {author.linkedin && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(author)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(author.id)}
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
            Gestión de Autores
          </h1>
          <p className="text-gray-600">
            Administra los autores del blog y sus artículos
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Autor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Autores</p>
                <p className="text-2xl font-bold">{stats.totalAuthors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.activeAuthors}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Destacados</p>
                <p className="text-2xl font-bold">{stats.featuredAuthors}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Artículos</p>
                <p className="text-2xl font-bold">{stats.totalArticles}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio/Autor</p>
                <p className="text-2xl font-bold">{stats.avgArticlesPerAuthor.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar autores por nombre, email, rol o especialización..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="featured">Destacados</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAuthors.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {selectedAuthors.length} autor{selectedAuthors.length !== 1 ? 'es' : ''} seleccionado{selectedAuthors.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkOperation('activate')}
                >
                  Activar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkOperation('deactivate')}
                >
                  Desactivar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkOperation('feature')}
                >
                  Destacar
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

      {/* Authors List */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">
            Autores ({filteredAuthors.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllAuthors}
          >
            {selectedAuthors.length === filteredAuthors.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAuthors.map(renderAuthorCard)}
      </div>

      {filteredAuthors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron autores
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Intenta con términos de búsqueda diferentes' 
              : 'Comienza agregando tu primer autor'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer autor
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Author Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingAuthor ? 'Editar Autor' : 'Nuevo Autor'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del autor"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol/Cargo
                </label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Director General, Arquitecto Senior, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Breve descripción del autor..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="flex items-center space-x-4">
                  {formData.avatar && (
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAvatarUpload(file)
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir imagen
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especializaciones
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.specializations?.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {spec}
                      <button
                        onClick={() => removeSpecialization(spec)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Agregar especialización..."
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  />
                  <Button onClick={addSpecialization} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Autor destacado
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Activo
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingAuthor ? 'Actualizar' : 'Crear'} Autor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}