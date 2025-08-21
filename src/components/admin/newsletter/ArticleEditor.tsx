'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  Eye, 
  Send, 
  Clock, 
  Calendar, 
  Tag, 
  Image, 
  Link2, 
  Bold, 
  Italic, 
  List, 
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  FileText,
  Globe,
  Share2,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  X,
  Plus,
  Edit,
  Trash2,
  Star
} from 'lucide-react'

interface Article {
  id?: string
  title: string
  slug: string
  category: string
  author_id: string
  featured_image: string
  featured_image_alt: string
  excerpt: string
  content: string
  published_date?: string
  reading_time: number
  featured: boolean
  tags: string[]
  seo_description: string
  social_image: string
  url: string
  related_articles: string[]
  gallery?: { url: string; caption: string }[]
  status: 'draft' | 'published' | 'scheduled'
  scheduled_date?: string
}

interface Author {
  id: string
  name: string
  email: string
  role: string
  bio: string
  avatar: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

interface ArticleEditorProps {
  article?: Article
  authors: Author[]
  categories: Category[]
  relatedArticles: { id: string; title: string }[]
  onSave: (article: Article) => Promise<void>
  onPublish: (article: Article) => Promise<void>
  onSchedule: (article: Article, date: string) => Promise<void>
  onPreview: (article: Article) => void
  onUploadImage: (file: File) => Promise<string>
  loading?: boolean
}

export default function ArticleEditor({
  article,
  authors,
  categories,
  relatedArticles,
  onSave,
  onPublish,
  onSchedule,
  onPreview,
  onUploadImage,
  loading = false
}: ArticleEditorProps) {
  const [formData, setFormData] = useState<Article>({
    title: '',
    slug: '',
    category: '',
    author_id: '',
    featured_image: '',
    featured_image_alt: '',
    excerpt: '',
    content: '',
    reading_time: 0,
    featured: false,
    tags: [],
    seo_description: '',
    social_image: '',
    url: '',
    related_articles: [],
    gallery: [],
    status: 'draft',
    ...article
  })

  const [currentTab, setCurrentTab] = useState('content')
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [newTag, setNewTag] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Calculate reading time based on content
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  // Calculate SEO score
  const calculateSeoScore = useCallback(() => {
    let score = 0
    const checks = [
      { condition: formData.title.length >= 30 && formData.title.length <= 60, points: 20 },
      { condition: formData.seo_description.length >= 120 && formData.seo_description.length <= 160, points: 20 },
      { condition: formData.excerpt.length >= 50 && formData.excerpt.length <= 160, points: 15 },
      { condition: formData.tags.length >= 3 && formData.tags.length <= 8, points: 15 },
      { condition: formData.featured_image !== '', points: 10 },
      { condition: formData.content.length >= 300, points: 10 },
      { condition: formData.content.includes(formData.title.split(' ')[0]), points: 10 }
    ]
    
    checks.forEach(check => {
      if (check.condition) score += check.points
    })
    
    setSeoScore(score)
  }, [formData])

  // Calculate readability score
  const calculateReadabilityScore = useCallback(() => {
    const sentences = formData.content.split(/[.!?]+/).length - 1
    const words = formData.content.split(/\s+/).length
    const avgWordsPerSentence = words / (sentences || 1)
    
    let score = 100
    if (avgWordsPerSentence > 20) score -= (avgWordsPerSentence - 20) * 2
    if (avgWordsPerSentence > 30) score -= 20
    
    setReadabilityScore(Math.max(0, Math.min(100, score)))
  }, [formData.content])

  // Update form data
  const updateFormData = (updates: Partial<Article>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
  }

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    updateFormData({ 
      title,
      slug: generateSlug(title),
      url: `/blog/${generateSlug(title)}`
    })
  }

  // Handle content change and recalculate reading time
  const handleContentChange = (content: string) => {
    updateFormData({ 
      content,
      reading_time: calculateReadingTime(content)
    })
  }

  // Handle tag addition
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'featured' | 'gallery') => {
    try {
      const imageUrl = await onUploadImage(file)
      
      if (type === 'featured') {
        updateFormData({ 
          featured_image: imageUrl,
          social_image: imageUrl,
          featured_image_alt: `Imagen para el artículo: ${formData.title}`
        })
      } else {
        const newGalleryItem = { url: imageUrl, caption: '' }
        updateFormData({ 
          gallery: [...(formData.gallery || []), newGalleryItem] 
        })
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData)
      setIsDirty(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle publish
  const handlePublish = async () => {
    setSaving(true)
    try {
      await onPublish({ ...formData, status: 'published', published_date: new Date().toISOString() })
      setIsDirty(false)
    } catch (error) {
      console.error('Publish failed:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle schedule
  const handleSchedule = async () => {
    if (!scheduleDate) return
    
    setSaving(true)
    try {
      await onSchedule({ ...formData, status: 'scheduled' }, scheduleDate)
      setIsDirty(false)
    } catch (error) {
      console.error('Schedule failed:', error)
    } finally {
      setSaving(false)
    }
  }

  // Insert markdown formatting
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const newText = before + selectedText + after
    
    const newContent = 
      formData.content.substring(0, start) + 
      newText + 
      formData.content.substring(end)
    
    handleContentChange(newContent)
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  // Calculate scores when content changes
  useEffect(() => {
    calculateSeoScore()
    calculateReadabilityScore()
  }, [formData, calculateSeoScore, calculateReadabilityScore])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {article?.id ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h1>
          <p className="text-gray-600">
            {formData.status === 'published' ? 'Publicado' : 
             formData.status === 'scheduled' ? 'Programado' : 'Borrador'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPreview(formData)}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista previa
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={loading || saving || !isDirty}
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar
          </Button>
          
          {formData.status !== 'published' && (
            <Button
              onClick={handlePublish}
              disabled={loading || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SEO Score</p>
                <p className="text-2xl font-bold">{seoScore}/100</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                seoScore >= 80 ? 'bg-green-100 text-green-600' :
                seoScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {seoScore >= 80 ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lectura</p>
                <p className="text-2xl font-bold">{formData.reading_time} min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Palabras</p>
                <p className="text-2xl font-bold">{formData.content.split(/\s+/).length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Editor */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="meta">Metadatos</TabsTrigger>
          <TabsTrigger value="media">Multimedia</TabsTrigger>
          <TabsTrigger value="seo">SEO & Social</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Artículo
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ingresa el título del artículo..."
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/60 caracteres
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => updateFormData({ slug: e.target.value })}
                  placeholder="slug-del-articulo"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{formData.slug}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData({ category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autor
                  </label>
                  <select
                    value={formData.author_id}
                    onChange={(e) => updateFormData({ author_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar autor</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name} - {author.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extracto
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => updateFormData({ excerpt: e.target.value })}
                  placeholder="Breve descripción del artículo..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.excerpt.length}/160 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Editor de Contenido</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('# ', '')}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('## ', '')}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('- ', '')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('> ', '')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('`', '`')}>
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Escribe el contenido del artículo en Markdown..."
                rows={20}
                className="font-mono"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>Soporte completo para Markdown</span>
                <span>{formData.content.split(/\s+/).length} palabras</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Tab */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tags y Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags del Artículo
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar nuevo tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => updateFormData({ featured: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Artículo destacado
                </label>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artículos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {relatedArticles.map(article => (
                  <div key={article.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.related_articles.includes(article.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ 
                            related_articles: [...formData.related_articles, article.id] 
                          })
                        } else {
                          updateFormData({ 
                            related_articles: formData.related_articles.filter(id => id !== article.id) 
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{article.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programar publicación
                </label>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <Button
                    onClick={handleSchedule}
                    disabled={!scheduleDate || saving}
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Imagen Destacada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.featured_image ? (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt={formData.featured_image_alt}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateFormData({ featured_image: '', featured_image_alt: '' })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Subir imagen destacada
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar imagen
                  </Button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto alternativo (Alt text)
                </label>
                <Input
                  value={formData.featured_image_alt}
                  onChange={(e) => updateFormData({ featured_image_alt: e.target.value })}
                  placeholder="Descripción de la imagen para accesibilidad..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Galería del Artículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {formData.gallery?.map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => {
                        const newGallery = [...(formData.gallery || [])]
                        newGallery.splice(index, 1)
                        updateFormData({ gallery: newGallery })
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar imagen a galería
              </Button>
            </CardContent>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(file, formData.featured_image ? 'gallery' : 'featured')
              }
            }}
            className="hidden"
          />
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimización SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => updateFormData({ seo_description: e.target.value })}
                  placeholder="Descripción que aparecerá en los resultados de búsqueda..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seo_description.length}/160 caracteres
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen Social (Open Graph)
                </label>
                <Input
                  value={formData.social_image}
                  onChange={(e) => updateFormData({ social_image: e.target.value })}
                  placeholder="URL de la imagen para redes sociales..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recomendado: 1200x630px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa Social</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                    {formData.social_image && (
                      <img
                        src={formData.social_image}
                        alt="Social preview"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-600 hover:underline">
                      {formData.title || 'Título del artículo'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.seo_description || formData.excerpt || 'Descripción del artículo...'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      metrica-dip.com
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}