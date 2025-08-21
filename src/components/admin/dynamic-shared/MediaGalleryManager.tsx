'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Image, 
  Video, 
  File, 
  Trash2, 
  Edit, 
  Download, 
  Eye,
  Copy,
  Move,
  Star,
  Grid3X3,
  List,
  Search,
  Filter,
  FolderPlus,
  RotateCcw,
  Crop,
  Palette,
  Maximize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  thumbnail?: string
  size: number
  format: string
  dimensions?: { width: number; height: number }
  duration?: number
  alt_text?: string
  caption?: string
  tags: string[]
  category?: string
  stage?: string // For portfolio galleries (inicio, proceso, final)
  order: number
  uploaded_at: string
  uploaded_by: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  metadata?: Record<string, any>
}

interface MediaGallery {
  id: string
  name: string
  type: 'portfolio' | 'newsletter' | 'careers' | 'general'
  items: MediaItem[]
  settings: {
    auto_optimize: boolean
    watermark: boolean
    generate_thumbnails: boolean
    allowed_formats: string[]
    max_file_size: number
  }
}

interface MediaGalleryManagerProps {
  module: 'newsletter' | 'portfolio' | 'careers'
  galleries: MediaGallery[]
  currentGallery?: string
  onUploadFiles: (files: FileList, galleryId?: string, stage?: string) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
  onUpdateItem: (itemId: string, updates: Partial<MediaItem>) => Promise<void>
  onCreateGallery: (name: string, type: string) => Promise<void>
  onDeleteGallery: (galleryId: string) => Promise<void>
  onOptimizeItem: (itemId: string) => Promise<void>
  onGenerateThumbnail: (itemId: string) => Promise<void>
  maxFileSize?: number
  allowedFormats?: string[]
}

export default function MediaGalleryManager({
  module,
  galleries,
  currentGallery,
  onUploadFiles,
  onDeleteItem,
  onUpdateItem,
  onCreateGallery,
  onDeleteGallery,
  onOptimizeItem,
  onGenerateThumbnail,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'pdf']
}: MediaGalleryManagerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [selectedGallery, setSelectedGallery] = useState(currentGallery || galleries[0]?.id)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Module configurations
  const moduleConfig = {
    newsletter: {
      title: 'Gestión de Multimedia - Blog',
      icon: '📰',
      stages: ['featured', 'gallery', 'inline'],
      stageLabels: { featured: 'Imagen destacada', gallery: 'Galería', inline: 'En línea' }
    },
    portfolio: {
      title: 'Gestión de Multimedia - Portfolio',
      icon: '🏗️',
      stages: ['inicio', 'proceso', 'final'],
      stageLabels: { inicio: 'Estado inicial', proceso: 'En construcción', final: 'Proyecto terminado' }
    },
    careers: {
      title: 'Gestión de Multimedia - Careers',
      icon: '💼',
      stages: ['hero', 'team', 'office'],
      stageLabels: { hero: 'Imagen principal', team: 'Equipo', office: 'Oficinas' }
    }
  }

  const config = moduleConfig[module]

  // Get current gallery data
  const currentGalleryData = galleries.find(g => g.id === selectedGallery)
  const allItems = currentGalleryData?.items || []

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStage = filterStage === 'all' || item.stage === filterStage
    
    return matchesSearch && matchesType && matchesStage
  })

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList, stage?: string) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return extension && allowedFormats.includes(extension) && file.size <= maxFileSize
    })

    if (validFiles.length !== files.length) {
      console.warn('Some files were rejected due to format or size constraints')
    }

    if (validFiles.length > 0) {
      try {
        await onUploadFiles(validFiles as any, selectedGallery, stage)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }, [selectedGallery, onUploadFiles, allowedFormats, maxFileSize])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  // Select/deselect items
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAllItems = () => {
    setSelectedItems(
      selectedItems.length === filteredItems.length 
        ? []
        : filteredItems.map(item => item.id)
    )
  }

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    
    try {
      await Promise.all(selectedItems.map(id => onDeleteItem(id)))
      setSelectedItems([])
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const handleBulkOptimize = async () => {
    if (selectedItems.length === 0) return
    
    try {
      await Promise.all(selectedItems.map(id => onOptimizeItem(id)))
    } catch (error) {
      console.error('Bulk optimize failed:', error)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get file type icon
  const getFileTypeIcon = (type: string, format: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Volume2 className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Render media item
  const renderMediaItem = (item: MediaItem) => {
    const isSelected = selectedItems.includes(item.id)
    
    if (viewMode === 'list') {
      return (
        <div
          key={item.id}
          className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleItemSelection(item.id)}
            className="rounded"
          />
          
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {item.type === 'image' ? (
              <img
                src={item.thumbnail || item.url}
                alt={item.alt_text}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                {getFileTypeIcon(item.type, item.format)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              {item.stage && (
                <Badge variant="outline">
                  {config.stageLabels[item.stage] || item.stage}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>{item.format.toUpperCase()}</span>
              <span>{formatFileSize(item.size)}</span>
              {item.dimensions && (
                <span>{item.dimensions.width}×{item.dimensions.height}</span>
              )}
              {item.duration && (
                <span>{formatDuration(item.duration)}</span>
              )}
            </div>
            
            {item.caption && (
              <p className="text-sm text-gray-600 mt-1 truncate">{item.caption}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewItem(item)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateItem(item.id, {})}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteItem(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // Grid view
    return (
      <div
        key={item.id}
        className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
          isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleItemSelection(item.id)}
          className="absolute top-2 left-2 z-10 rounded"
        />
        
        {item.type === 'image' ? (
          <img
            src={item.thumbnail || item.url}
            alt={item.alt_text}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              {getFileTypeIcon(item.type, item.format)}
              <p className="mt-2 text-sm font-medium">{item.format.toUpperCase()}</p>
            </div>
          </div>
        )}
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(item.status)} size="sm">
            {item.status === 'uploading' && (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            )}
            {item.status === 'ready' && (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            {item.status === 'error' && (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {item.status}
          </Badge>
        </div>
        
        {/* Stage indicator */}
        {item.stage && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" size="sm">
              {config.stageLabels[item.stage] || item.stage}
            </Badge>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreviewItem(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUpdateItem(item.id, {})}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDeleteItem(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* File info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
          <p className="text-white text-sm font-medium truncate">{item.name}</p>
          <p className="text-gray-300 text-xs">
            {formatFileSize(item.size)}
            {item.dimensions && ` • ${item.dimensions.width}×${item.dimensions.height}`}
          </p>
        </div>
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
              {allItems.length} archivo{allItems.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir archivos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateGallery('Nueva galería', module)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Nueva galería
          </Button>
        </div>
      </div>

      {/* Gallery Selection */}
      {galleries.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Galería actual:
              </label>
              <select
                value={selectedGallery}
                onChange={(e) => setSelectedGallery(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1"
              >
                {galleries.map(gallery => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.name} ({gallery.items.length} archivos)
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFormats.map(f => `.${f}`).join(',')}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </h3>
        <p className="text-gray-600 mb-4">
          Formatos soportados: {allowedFormats.join(', ')}
        </p>
        <p className="text-sm text-gray-500">
          Tamaño máximo: {formatFileSize(maxFileSize)}
        </p>
        
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          Seleccionar archivos
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar archivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los tipos</option>
                <option value="image">Imágenes</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documentos</option>
              </select>
              
              {config.stages.length > 0 && (
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">Todas las etapas</option>
                  {config.stages.map(stage => (
                    <option key={stage} value={stage}>
                      {config.stageLabels[stage] || stage}
                    </option>
                  ))}
                </select>
              )}
              
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
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
                  {selectedItems.length} archivo{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkOptimize}>
                  <Settings className="h-4 w-4 mr-1" />
                  Optimizar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
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

      {/* Media Grid/List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Archivos multimedia ({filteredItems.length})
            </CardTitle>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllItems}
            >
              {selectedItems.length === filteredItems.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay archivos
              </h3>
              <p className="text-gray-600 mb-4">
                Sube archivos para comenzar a gestionar tu galería multimedia
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Subir primer archivo
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                : 'space-y-2'
            }>
              {filteredItems.map(renderMediaItem)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{previewItem.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              {previewItem.type === 'image' ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.alt_text}
                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                />
              ) : previewItem.type === 'video' ? (
                <video
                  src={previewItem.url}
                  controls
                  className="max-w-full max-h-[60vh] mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">
                    {getFileTypeIcon(previewItem.type, previewItem.format)}
                  </div>
                  <p className="text-lg font-medium">{previewItem.name}</p>
                  <p className="text-gray-600">{previewItem.format.toUpperCase()}</p>
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tamaño:</span>
                  <span>{formatFileSize(previewItem.size)}</span>
                </div>
                
                {previewItem.dimensions && (
                  <div className="flex justify-between">
                    <span>Dimensiones:</span>
                    <span>{previewItem.dimensions.width}×{previewItem.dimensions.height}</span>
                  </div>
                )}
                
                {previewItem.duration && (
                  <div className="flex justify-between">
                    <span>Duración:</span>
                    <span>{formatDuration(previewItem.duration)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Subido:</span>
                  <span>{new Date(previewItem.uploaded_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}