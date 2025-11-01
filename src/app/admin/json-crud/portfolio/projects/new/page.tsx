'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjects, useCategories } from '@/hooks/usePortfolioAdmin';
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
  Building2,
  MapPin,
  Calendar,
  Clock,
  Star,
  DollarSign,
  Ruler,
  Users,
  Briefcase
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
async function ensureUniqueSlug(baseSlug: string, projectId?: string, projectsHook?: any): Promise<string> {
  if (!projectsHook) return baseSlug;

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const existingProject = await projectsHook.getBySlug(uniqueSlug);
      if (!existingProject || (projectId && existingProject.id === projectId)) {
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

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const isEditing = !!projectId;


  // Hooks
  const projectsHook = useProjects();
  const categoriesHook = useCategories();

  // Estados básicos
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState('999');

  // Estados de contenido
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Estados de información del proyecto
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hideDates, setHideDates] = useState(false); // Checkbox para ocultar fechas
  const [investment, setInvestment] = useState('');
  const [area, setArea] = useState('');
  const [team, setTeam] = useState('');
  const [duration, setDuration] = useState('');

  // Estados de metadatos
  const [tags, setTags] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [order, setOrder] = useState('0');

  // Estados de control
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Estado para almacenar el proyecto cargado
  const [loadedProject, setLoadedProject] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);


  // Cargar datos si estamos editando
  useEffect(() => {
    console.log('🎯 [PORTFOLIO] useEffect de carga - isEditing:', isEditing, 'projectId:', projectId, 'loading:', projectsHook.loading, 'hasInitialized:', hasInitialized);

    if (isEditing && projectId && !projectsHook.loading && !hasInitialized) {
      console.log('✅ [PORTFOLIO] Condiciones de carga cumplidas, iniciando loadData...');
      setIsLoadingData(true);
      setHasInitialized(true);

      // Función async para cargar datos
      const loadData = async () => {
        try {
          console.log('🔄 [PORTFOLIO] Llamando projectsHook.getById con ID:', projectId);
          const project = await projectsHook.getById(projectId);

          if (project) {
            console.log('📦 [PORTFOLIO] Datos recibidos de Firestore:', project);
            console.log('📦 [PORTFOLIO] Claves del objeto:', Object.keys(project));

            // Los datos vienen anidados en project.project
            const projectData = project.project || project;

            console.log('📦 [PORTFOLIO] Datos del proyecto:', projectData);
            console.log('📦 [PORTFOLIO] Category:', projectData.category);
            console.log('📦 [PORTFOLIO] Category ID:', projectData.category_id);
            console.log('📦 [PORTFOLIO] Gallery:', projectData.gallery);
            console.log('📦 [PORTFOLIO] Full Description:', projectData.full_description);
            console.log('📦 [PORTFOLIO] Technical Details:', projectData.technical_details);
            console.log('📦 [PORTFOLIO] Tags:', projectData.tags);
            console.log('💾 [PORTFOLIO] Guardando proyecto en loadedProject...');

            // Guardar los datos del proyecto directamente, no el objeto envolvente
            setLoadedProject(projectData);
            setIsLoadingData(false);
            console.log('✅ [PORTFOLIO] loadedProject actualizado y isLoadingData = false');
          } else {
            console.error('❌ [ProjectForm] Proyecto no encontrado o nulo');
            setIsLoadingData(false);
          }
        } catch (error) {
          console.error('💥 [ProjectForm] Error al cargar proyecto:', error);
          setIsLoadingData(false);
        }
      };

      // Cargar inmediatamente, sin timeout
      loadData();
    } else {
    }
  }, [isEditing, projectId, projectsHook.loading, hasInitialized]);

  // Actualizar formulario cuando el proyecto se carga
  useEffect(() => {
    console.log('📊 [PORTFOLIO] useEffect check - loadedProject:', !!loadedProject, 'isLoadingData:', isLoadingData);
    console.log('📊 [PORTFOLIO] loadedProject actual:', loadedProject);

    if (loadedProject && !isLoadingData) {
      console.log('✅ [PORTFOLIO] Condiciones cumplidas, actualizando formulario...');
      console.log('📋 [PORTFOLIO] Datos del proyecto a cargar:', {
        title: loadedProject.title,
        slug: loadedProject.slug,
        description: loadedProject.description,
        gallery: loadedProject.gallery,
        keys: Object.keys(loadedProject)
      });

      // Usar requestAnimationFrame para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        console.log('🔄 [PORTFOLIO] Actualizando formulario con datos cargados...');

        // Campos básicos
        const titleValue = loadedProject.title || '';
        const slugValue = loadedProject.slug || '';
        console.log('📝 Title:', titleValue, 'Slug:', slugValue);
        setTitle(titleValue);
        setSlug(slugValue);

        // Asegurar que categoryId sea un string, no un objeto
        const catValue = loadedProject.category || loadedProject.category_id;
        if (typeof catValue === 'object' && catValue && catValue.id) {
          setCategoryId(String(catValue.id));
        } else if (typeof catValue === 'string') {
          setCategoryId(catValue);
        } else {
          setCategoryId('');
        }

        setStatus(loadedProject.status || 'draft');
        setFeatured(loadedProject.featured || false);
        setFeaturedOrder(loadedProject.featured_order?.toString() || '999');

        // Manejar descripciones - pueden venir con diferentes nombres
        const descValue = loadedProject.description || loadedProject.short_description || '';
        const fullDescValue = loadedProject.full_description || loadedProject.fullDescription || loadedProject.description || '';
        console.log('📝 Description:', descValue);
        console.log('📝 Full Description:', fullDescValue);
        setDescription(descValue);
        setFullDescription(fullDescValue);
        setTechnicalDetails(loadedProject.technical_details || loadedProject.technicalDetails || '');

        const featuredImageValue = loadedProject.featured_image || loadedProject.featuredImage || '';
        console.log('🖼️ Featured Image:', featuredImageValue);
        setFeaturedImage(featuredImageValue);

        // Procesar gallery - es un array simple de strings con las rutas
        if (Array.isArray(loadedProject.gallery)) {
          console.log('📸 [PORTFOLIO] Gallery cargada:', loadedProject.gallery);
          // Gallery es un array de strings simples con las rutas
          setGallery(loadedProject.gallery.filter(item => typeof item === 'string' && item.length > 0));
        } else if (Array.isArray(loadedProject.images)) {
          // Fallback: Si no hay gallery pero sí images, usar images
          console.log('📸 [PORTFOLIO] Usando images en lugar de gallery:', loadedProject.images);
          setGallery(loadedProject.images.map((img: any) =>
            typeof img === 'object' && img.url ? String(img.url) : ''
          ).filter(Boolean));
        } else {
          console.log('⚠️ [PORTFOLIO] No se encontró gallery ni images');
          setGallery([]);
        }

        setClient(loadedProject.client || '');
        setLocation(loadedProject.location || '');

        // Cargar el campo hide_dates si existe
        const shouldHideDates = loadedProject.hide_dates || false;
        console.log('📖 [ProjectForm] Cargando hide_dates desde Firestore:', loadedProject.hide_dates);
        console.log('📖 [ProjectForm] shouldHideDates calculado:', shouldHideDates);
        setHideDates(shouldHideDates);

        // Manejar fechas - pueden venir como timestamps de Firestore
        // NO usar created_at/updated_at como fallback porque siempre existen
        if (!shouldHideDates) {
          if (loadedProject.start_date || loadedProject.startDate) {
            const date = loadedProject.start_date || loadedProject.startDate;
            if (date && date.seconds) {
              // Es un timestamp de Firestore
              const jsDate = new Date(date.seconds * 1000);
              setStartDate(jsDate.toISOString().slice(0, 10));
            } else if (date && date.toDate && typeof date.toDate === 'function') {
              setStartDate(date.toDate().toISOString().slice(0, 10));
            } else if (typeof date === 'string') {
              setStartDate(date.slice(0, 10));
            }
          }

          if (loadedProject.end_date || loadedProject.endDate) {
            const date = loadedProject.end_date || loadedProject.endDate;
            if (date && date.seconds) {
              // Es un timestamp de Firestore
              const jsDate = new Date(date.seconds * 1000);
              setEndDate(jsDate.toISOString().slice(0, 10));
            } else if (date && date.toDate && typeof date.toDate === 'function') {
              setEndDate(date.toDate().toISOString().slice(0, 10));
            } else if (typeof date === 'string') {
              setEndDate(date.slice(0, 10));
            }
          }
        } else {
          // Si hide_dates está activo, limpiar fechas
          setStartDate('');
          setEndDate('');
        }

        // Investment puede venir como 'budget' en Firestore
        setInvestment(loadedProject.investment || loadedProject.budget || loadedProject.metadata?.investment || '');
        setArea(loadedProject.area || '');
        setTeam(loadedProject.team || '');
        setDuration(loadedProject.duration || loadedProject.metadata?.timeline || '');

        setTags(Array.isArray(loadedProject.tags) ? loadedProject.tags.join(', ') : loadedProject.tags || '');
        setMetaDescription(loadedProject.meta_description || loadedProject.metaDescription || loadedProject.short_description || '');
        setOrder(loadedProject.order?.toString() || '0');

        console.log('✅ [PORTFOLIO] Formulario actualizado completamente');
      });
    } else {
      console.log('⏳ [PORTFOLIO] Esperando datos... loadedProject:', !!loadedProject, 'isLoadingData:', isLoadingData);
    }
  }, [loadedProject, isLoadingData]);

  // Generar slug automáticamente cuando cambia el título
  useEffect(() => {
    if (title && !isEditingSlug && !isEditing) {
      const generateUniqueSlug = async () => {
        const baseSlug = generateSlug(title);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, undefined, projectsHook);
        setSlug(uniqueSlug);
      };
      generateUniqueSlug();
    }
  }, [title, isEditingSlug, isEditing, projectsHook]);

  // Marcar como modificado cuando cambian los campos
  useEffect(() => {
    if (isEditing) {
      setIsDirty(true);
    }
  }, [title, description, categoryId, client, location, investment, area]);

  // Get categories from hook with robust validation
  const categories = Array.isArray(categoriesHook.categories) ? categoriesHook.categories : [];

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!title.trim()) {
      alert('El título del proyecto es obligatorio');
      return;
    }

    if (!categoryId) {
      alert('Debe seleccionar una categoría');
      return;
    }

    setSaving(true);

    try {
      // Generar slug - si no hay título, usar timestamp
      const baseSlug = slug || (title.trim() ? generateSlug(title) : `proyecto-${Date.now()}`);
      const uniqueSlug = await ensureUniqueSlug(
        baseSlug,
        isEditing ? projectId : undefined,
        projectsHook
      );

      // Preparar datos del proyecto
      const projectData = {
        title: title.trim(), // Asegurar que el título no tenga espacios extras
        slug: uniqueSlug,
        category: categoryId, // Asegurar que se envía el ID de la categoría
        status,
        featured,
        featured_order: featured ? parseInt(featuredOrder) : 999,
        description,
        full_description: fullDescription,
        technical_details: technicalDetails,
        featured_image: featuredImage,
        gallery: gallery.filter(Boolean),
        client,
        location,
        // Si hideDates es true, guardar null, sino usar las fechas ingresadas
        start_date: hideDates ? null : (startDate || null),
        end_date: hideDates ? null : (endDate || null),
        hide_dates: hideDates, // Campo explícito para indicar que no se deben mostrar fechas
        investment,
        area,
        team,
        duration,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        meta_description: metaDescription,
        order: parseInt(order),
        updated_at: new Date()
      };

      console.log('💾 [ProjectForm] Guardando proyecto con hideDates:', hideDates);
      console.log('💾 [ProjectForm] projectData.hide_dates:', projectData.hide_dates);
      console.log('📦 [ProjectForm] Datos completos a enviar:', projectData);
      console.log('📋 [ProjectForm] Verificación: title =', projectData.title, 'category =', projectData.category);

      let response;
      if (isEditing) {
        response = await projectsHook.update(projectId!, projectData);
      } else {
        response = await projectsHook.create(projectData);
      }

      if (response.success) {
        // Redirigir a la lista de proyectos
        router.push('/admin/json-crud/portfolio/projects');
      } else {
        console.error('Error saving project:', response.error);

        // Proporcionar mensaje más específico según el error
        let errorMessage = 'Error al guardar el proyecto';
        if (response.error === 'INVALID_INPUT') {
          errorMessage = 'Por favor, complete todos los campos requeridos (Título y Categoría)';
        } else if (response.error === 'SLUG_EXISTS') {
          errorMessage = 'Ya existe un proyecto con ese slug. Por favor, modifique el título o slug';
        } else if (response.error === 'INVALID_CATEGORY') {
          errorMessage = 'La categoría seleccionada no existe. Por favor, seleccione una categoría válida';
        } else if (response.error) {
          errorMessage = `Error: ${response.error}`;
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  // Manejar actualización del slug
  const handleSlugUpdate = async () => {
    if (slug) {
      const uniqueSlug = await ensureUniqueSlug(
        slug,
        isEditing ? projectId : undefined,
        projectsHook
      );
      setSlug(uniqueSlug);
    }
    setIsEditingSlug(false);
  };

  // Agregar imagen a la galería
  const handleAddToGallery = (imageUrl: string) => {
    if (imageUrl && !gallery.includes(imageUrl)) {
      setGallery([...gallery, imageUrl]);
    }
  };

  // Remover imagen de la galería
  const handleRemoveFromGallery = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  // Si estamos editando y no hemos cargado los datos todavía, mostrar loading
  if (isEditing && isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del proyecto...</p>
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
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Modifica los detalles del proyecto' : 'Crea un nuevo proyecto para el portfolio'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/portfolio/${categoryId}/${slug}`, '_blank')}
                disabled={!slug || !categoryId}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título del Proyecto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Centro Comercial Plaza Norte"
                    className={`text-xl font-semibold ${!title.trim() && saving ? 'border-red-500' : ''}`}
                    required
                  />
                  {!title.trim() && saving && (
                    <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Slug (URL)
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditingSlug(!isEditingSlug)}
                        className="ml-2 text-blue-500 text-xs hover:underline"
                      >
                        {isEditingSlug ? 'Cancelar' : 'Editar'}
                      </button>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="centro-comercial-plaza-norte"
                      disabled={!isEditingSlug && isEditing}
                      className="font-mono text-sm"
                    />
                    {isEditingSlug && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSlugUpdate}
                      >
                        Validar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /portfolio/{categoryId}/{slug || 'slug-del-proyecto'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
                <CardDescription>
                  Describe el proyecto de manera clara y concisa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción corta</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción breve para las tarjetas del portfolio..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción completa</label>
                  <RichTextEditor
                    value={fullDescription}
                    onChange={setFullDescription}
                    placeholder="Descripción detallada del proyecto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detalles técnicos</label>
                  <Textarea
                    value={technicalDetails}
                    onChange={(e) => setTechnicalDetails(e.target.value)}
                    placeholder="Especificaciones técnicas, materiales utilizados, metodología..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
                <CardDescription>
                  Detalles específicos sobre el cliente, ubicación y métricas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Cliente
                    </label>
                    <Input
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Ubicación
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Lima, Perú"
                    />
                  </div>

                  {/* Checkbox para ocultar fechas */}
                  <div className="col-span-full">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="hide-dates"
                        checked={hideDates}
                        onCheckedChange={(checked) => {
                          setHideDates(checked);
                          // Si se marca, limpiar fechas
                          if (checked) {
                            setStartDate('');
                            setEndDate('');
                          }
                        }}
                      />
                      <label htmlFor="hide-dates" className="text-sm font-medium cursor-pointer">
                        Ocultar fechas (no mostrar año en el proyecto)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-10">
                      Activa esta opción si no deseas mostrar información de fechas en el proyecto
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Fecha de inicio
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={hideDates}
                      className={hideDates ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Fecha de finalización
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={hideDates}
                      className={hideDates ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Inversión
                    </label>
                    <Input
                      value={investment}
                      onChange={(e) => setInvestment(e.target.value)}
                      placeholder="Ej: $2.5M USD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Ruler className="inline h-4 w-4 mr-1" />
                      Área
                    </label>
                    <Input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Ej: 15,000 m²"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Users className="inline h-4 w-4 mr-1" />
                      Equipo
                    </label>
                    <Input
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      placeholder="Ej: 50 profesionales"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Duración
                    </label>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ej: 18 meses"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <label className="block text-sm font-medium mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                  >
                    <SelectTrigger className={`w-full ${!categoryId && saving ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={
                        categoriesHook.loading ? "Cargando categorías..." :
                        categories.length === 0 ? "No hay categorías disponibles" :
                        "Seleccionar categoría"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesHook.loading ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="empty" disabled>No hay categorías</SelectItem>
                      ) : (
                        categories.map((cat: any, index: number) => {
                          // Verificar que cat sea un objeto válido
                          if (typeof cat !== 'object' || !cat) {
                            return null;
                          }

                          // Extraer propiedades de forma segura
                          const catId = String(cat.id || cat._id || `cat-${index}`);
                          const catName = String(cat.name || cat.title || 'Sin nombre');

                          // Verificar que no estemos devolviendo undefined o un objeto
                          if (!catId || !catName) {
                            return null;
                          }

                          return (
                            <SelectItem key={catId} value={catId}>
                              {catName}
                            </SelectItem>
                          );
                        }).filter((item) => item !== null && item !== undefined)
                      )}
                    </SelectContent>
                  </Select>
                  {!categoryId && saving && (
                    <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>
                  )}
                  {categoriesHook.error && (
                    <p className="text-xs text-red-500 mt-1">
                      Error cargando categorías: {typeof categoriesHook.error === 'string' ? categoriesHook.error : 'Error desconocido'}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Proyecto Destacado
                    </label>
                    <Switch
                      checked={featured}
                      onCheckedChange={setFeatured}
                    />
                  </div>

                  {featured && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Orden de destacado</label>
                      <Input
                        type="number"
                        value={featuredOrder}
                        onChange={(e) => setFeaturedOrder(e.target.value)}
                        placeholder="999"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Menor número = aparece primero
                      </p>
                    </div>
                  )}
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium mb-2">Orden general</label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagen Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageSelector
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  label=""
                />
                {featuredImage && (
                  <div className="mt-3">
                    <img
                      src={featuredImage}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Galería de Imágenes
                </CardTitle>
                <CardDescription>
                  Agrega múltiples imágenes del proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ImageSelector
                    value=""
                    onChange={handleAddToGallery}
                    label="Agregar imagen"
                  />

                  {gallery.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {gallery.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Galería ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFromGallery(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    SEO & Metadatos
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>

              {showAdvanced && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Hash className="inline h-4 w-4 mr-1" />
                      Etiquetas
                    </label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="retail, comercial, lima (separadas por comas)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Meta descripción</label>
                    <Textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Descripción para motores de búsqueda (máx. 160 caracteres)"
                      rows={3}
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