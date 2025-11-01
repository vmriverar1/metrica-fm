'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useArticulos, useAutores, useCategorias } from '@/hooks/useNewsletterAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Globe,
  Hash,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import ImageSelector from '@/components/admin/ImageSelector';
import RichTextEditor from '@/components/admin/RichTextEditor';

// Función para generar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .trim()
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

// Función para validar que el slug sea único
async function ensureUniqueSlug(baseSlug: string, articleId?: string, articleService?: any): Promise<string> {
  if (!articleService) return baseSlug;

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const existingArticle = await articleService.getBySlug(uniqueSlug);
      if (!existingArticle || (articleId && existingArticle.id === articleId)) {
        break;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    } catch (error) {
      // Si hay error al buscar, asumimos que no existe
      break;
    }
  }

  return uniqueSlug;
}


export default function NewArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const isEditing = !!articleId;


  // Hooks
  const articulosHook = useArticulos();
  const autoresHook = useAutores();
  const categoriasHook = useCategorias();

  // Estados
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [publishedDate, setPublishedDate] = useState('');
  const [altText, setAltText] = useState('');
  const [hideHeroText, setHideHeroText] = useState(false);

  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Estado para almacenar el artículo cargado
  const [loadedArticle, setLoadedArticle] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);


  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing && articleId && !articulosHook.loading && !hasInitialized) {
      setIsLoadingData(true);
      setHasInitialized(true);

      // Función async para cargar datos
      const loadData = async () => {
        try {
          const article = await articulosHook.getById(articleId);

          if (article) {
            setLoadedArticle(article);
            setIsLoadingData(false);
          } else {
            setIsLoadingData(false);
          }
        } catch (error) {
          console.error('Error loading article:', error);
          setIsLoadingData(false);
        }
      };

      loadData();
    }
  }, [isEditing, articleId, articulosHook.loading, hasInitialized]);

  // Actualizar formulario cuando el artículo se carga
  useEffect(() => {
    if (loadedArticle && !isLoadingData) {
      // Usar requestAnimationFrame para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        setTitle(loadedArticle.title || '');
        setSlug(loadedArticle.slug || '');
        setCategoryId(loadedArticle.category_id || '');
        setAuthorId(loadedArticle.author_id || '');
        setFeatured(loadedArticle.featured || false);
        setFeaturedImage(loadedArticle.featured_image || '');
        setContent(loadedArticle.content || '');
        setExcerpt(loadedArticle.excerpt || '');
        setTags((loadedArticle.tags || []).join(', '));
        setMetaDescription(loadedArticle.seo?.meta_description || '');
        setReadingTime(loadedArticle.reading_time || 0);
        setHideHeroText(loadedArticle.hide_hero_text || false);

        if (loadedArticle.published_date) {
          const date = loadedArticle.published_date.toDate ?
            loadedArticle.published_date.toDate() :
            new Date(loadedArticle.published_date as any);
          setPublishedDate(date.toISOString().slice(0, 16));
        }
      });
    }
  }, [loadedArticle, isLoadingData]);

  // Generar slug automáticamente cuando cambia el título
  useEffect(() => {
    if (title && !isEditingSlug && !isEditing) {
      const newSlug = generateSlug(title);
      setSlug(newSlug);
    }
    setIsDirty(true);
  }, [title, isEditingSlug, isEditing]);

  // Calcular tiempo de lectura automáticamente
  useEffect(() => {
    if (content && readingTime === 0) {
      const wordsPerMinute = 200;
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const estimatedTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      setReadingTime(estimatedTime);
    }
  }, [content, readingTime]);

  // Memoized data with additional filtering
  const categories = useMemo(() => {
    return categoriasHook.categorias.filter(cat => cat && cat.id && typeof cat.id === 'string' && cat.id.trim().length > 0);
  }, [categoriasHook.categorias]);

  const authors = useMemo(() => {
    return autoresHook.autores.filter(author => author && author.id && typeof author.id === 'string' && author.id.trim().length > 0);
  }, [autoresHook.autores]);

  // Establecer autor por defecto (primer autor disponible)
  useEffect(() => {
    if (authors.length > 0 && !authorId && !isEditing) {
      setAuthorId(authors[0].id);
    }
  }, [authors, authorId, isEditing]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!categoryId) {
      alert('Selecciona una categoría');
      return;
    }

    if (!authorId) {
      alert('Selecciona un autor');
      return;
    }

    setSaving(true);

    try {

      // Asegurar slug único
      const finalSlug = await ensureUniqueSlug(
        slug || generateSlug(title),
        isEditing ? articleId : undefined,
        articulosHook
      );

      const articleData: any = {
        title: title.trim(),
        slug: finalSlug,
        category_id: categoryId,
        author_id: authorId,
        featured,
        featured_image: featuredImage,
        content,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        seo: {
          meta_description: metaDescription || excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160)
        },
        reading_time: readingTime || Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
        status: publish ? 'published' : 'draft',
        featured_image_alt: altText || 'Imagen del artículo',
        url: `/blog/${finalSlug}`,
        related_articles: [],
        hide_hero_text: hideHeroText,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Solo agregar published_date si está definida
      if (publish && publishedDate) {
        articleData.published_date = new Date(publishedDate);
      }


      let response;
      if (isEditing) {
        response = await articulosHook.update(articleId!, articleData);
      } else {
        response = await articulosHook.create(articleData);
      }


      if (response.exito) {
        setIsDirty(false);
        router.push('/admin/json-crud/newsletter/articles');
      } else {
        throw new Error(response.mensaje || 'Error al guardar el artículo');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      alert(`Error al guardar el artículo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSlugEdit = async (newSlug: string) => {
    if (newSlug !== slug) {
      const uniqueSlug = await ensureUniqueSlug(newSlug, isEditing ? articleId : undefined, articulosHook);
      setSlug(uniqueSlug);
    }
    setIsEditingSlug(false);
  };

  // Si estamos editando y no hemos cargado los datos todavía, mostrar loading
  if (isEditing && isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/json-crud/newsletter/articles')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Editar artículo' : 'Nuevo artículo'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isDirty ? 'Cambios sin guardar' : 'Todos los cambios guardados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar borrador'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {saving ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del artículo"
                className="text-2xl font-bold border-none p-0 h-auto resize-none focus-visible:ring-0"
                style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
              />
            </div>

            {/* Slug */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>URL:</span>
              <span className="text-gray-400">/blog/</span>
              {isEditingSlug ? (
                <Input
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  onBlur={(e) => handleSlugEdit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSlugEdit(slug);
                    }
                    if (e.key === 'Escape') {
                      setIsEditingSlug(false);
                    }
                  }}
                  className="h-6 text-sm border-none p-0 focus-visible:ring-1"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingSlug(true)}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {slug || 'generar-automaticamente'}
                </button>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de tu artículo aquí..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Autor
                  </label>
                  <Select
                    value={authorId}
                    onValueChange={setAuthorId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar autor" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map(author => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                    Artículo destacado
                  </label>
                  <Switch
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                </div>

                {/* Hide Hero Text */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Ocultar título en hero
                  </label>
                  <Switch
                    checked={hideHeroText}
                    onCheckedChange={setHideHeroText}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagen destacada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageSelector
                  value={featuredImage}
                  onChange={(value) => setFeaturedImage(value as string)}
                  placeholder="Selecciona una imagen destacada"
                  variant="card"
                  size="md"
                  multiSelect={false}
                  acceptedTypes={['jpg', 'jpeg', 'png', 'gif', 'webp']}
                />
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-base flex items-center justify-between cursor-pointer"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span>Opciones avanzadas</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>

              {showAdvanced && (
                <CardContent className="space-y-4">
                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Extracto</label>
                    <Textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Resumen del artículo..."
                      className="text-sm"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {excerpt.length}/200 caracteres
                    </p>
                  </div>

                  {/* Reading Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Tiempo de lectura (min)
                    </label>
                    <Input
                      type="number"
                      value={readingTime}
                      onChange={(e) => setReadingTime(Number(e.target.value))}
                      className="text-sm"
                      min="1"
                      max="60"
                    />
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de publicación
                    </label>
                    <Input
                      type="datetime-local"
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Etiquetas
                    </label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tecnología, desarrollo, etc..."
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separar con comas
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta descripción (SEO)</label>
                    <Textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Descripción para motores de búsqueda..."
                      className="text-sm"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {metaDescription.length}/160 caracteres
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}