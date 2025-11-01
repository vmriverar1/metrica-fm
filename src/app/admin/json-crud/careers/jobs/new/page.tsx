'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobs, useDepartments } from '@/hooks/useCareersAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
async function ensureUniqueSlug(baseSlug: string, jobId?: string, jobsHook?: any): Promise<string> {
  if (!jobsHook) return baseSlug;

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const existingJob = await jobsHook.getBySlug(uniqueSlug);
      if (!existingJob || (jobId && existingJob.id === jobId)) {
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

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');
  const isEditing = !!jobId;


  // Hooks
  const jobsHook = useJobs();
  const departmentsHook = useDepartments();

  // Estados básicos
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('draft');
  const [type, setType] = useState('full-time');
  const [level, setLevel] = useState('mid');
  const [featured, setFeatured] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [remote, setRemote] = useState(false);
  const [hybrid, setHybrid] = useState(false);

  // Estados de contenido
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [essentialRequirements, setEssentialRequirements] = useState('');
  const [preferredRequirements, setPreferredRequirements] = useState('');

  // Estados de ubicación
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('Perú');

  // Estados de compensación
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('PEN');
  const [salaryPeriod, setSalaryPeriod] = useState('monthly');
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);

  // Estados de fechas y metadatos
  const [deadline, setDeadline] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [tags, setTags] = useState('');

  // Estados de control
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Estado para almacenar el job cargado
  const [loadedJob, setLoadedJob] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Función para llenar el formulario con los datos
  const fillFormWithJobData = (job: any) => {
    setTitle(job.title);
    setSlug(job.slug);
    setDepartmentId(job.departmentId);
    setStatus(job.status);
    setType(job.type);
    setLevel(job.level);
    setFeatured(job.featured || false);
    setUrgent(job.urgent || false);
    setRemote(job.remote || false);
    setHybrid(job.hybrid || false);
    setShortDescription(job.shortDescription || '');
    setFullDescription(job.fullDescription || '');
    setResponsibilities((job.responsibilities || []).join('\n'));
    setEssentialRequirements((job.requirements?.essential || []).join('\n'));
    setPreferredRequirements((job.requirements?.preferred || []).join('\n'));

    // Manejar ubicación que puede ser string u objeto
    if (typeof job.location === 'object' && job.location) {
      setLocation(job.location.city || '');
      setRegion(job.location.state || '');
      setCountry(job.location.country || 'Perú');
      setRemote(job.location.remote_allowed || false);
    } else {
      setLocation(job.location || '');
      setRegion(job.region || '');
      setCountry(job.country || 'Perú');
    }

    setSalaryMin(job.salary?.min?.toString() || '');
    setSalaryMax(job.salary?.max?.toString() || '');
    setSalaryCurrency(job.salary?.currency || 'PEN');
    setSalaryPeriod(job.salary?.period || 'monthly');
    setSalaryNegotiable(job.salary?.negotiable || false);

    if (job.deadline) {
      const date = job.deadline.toDate ? job.deadline.toDate() : new Date(job.deadline as any);
      setDeadline(date.toISOString().slice(0, 10));
    }

    setExperienceYears(job.experienceYears?.toString() || '0');
    setTags((job.tags || []).join(', '));
  };

  // Función para verificar si el formulario se llenó correctamente
  const isFormFilled = () => {
    return title.trim() !== '';
  };

  // Función de retry para llenar el formulario
  const startRetrySystem = (job: any) => {

    // Verificar después de 2000ms si el formulario se llenó
    setTimeout(() => {
      if (!isFormFilled() && job) {

        const interval = setInterval(() => {
          fillFormWithJobData(job);

          // Verificar si se llenó exitosamente
          setTimeout(() => {
            if (isFormFilled()) {
              clearInterval(interval);
              setRetryInterval(null);
              setIsLoadingData(false);
            }
          }, 50); // Pequeña pausa para que se actualicen los estados

        }, 200);

        setRetryInterval(interval);

        // Timeout de seguridad para evitar retry infinito (10 segundos máximo)
        setTimeout(() => {
          if (interval) {
            clearInterval(interval);
            setRetryInterval(null);
            setIsLoadingData(false);
          }
        }, 10000);
      }
    }, 2100); // 100ms después del timeout principal
  };


  // Cargar datos si estamos editando
  useEffect(() => {

    if (isEditing && jobId && !jobsHook.loading && !hasInitialized) {
      setIsLoadingData(true);
      setHasInitialized(true);

      // Función async para cargar datos
      const loadData = async () => {
        try {
          const job = await jobsHook.getById(jobId);

          if (job) {
            setLoadedJob(job);
            setIsLoadingData(false);
          } else {
            console.error('❌ [JobForm] Job no encontrado o nulo');
            setIsLoadingData(false);
          }
        } catch (error) {
          console.error('💥 [JobForm] Error al cargar job:', error);
          setIsLoadingData(false);
        }
      };

      // Cargar inmediatamente, sin timeout
      loadData();
    } else {
    }
  }, [isEditing, jobId, jobsHook.loading, hasInitialized]);

  // Actualizar formulario cuando el job se carga
  useEffect(() => {
    if (loadedJob && !isLoadingData) {

      // Usar requestAnimationFrame para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        setTitle(loadedJob.title || '');
        setSlug(loadedJob.slug || '');
        setDepartmentId(loadedJob.departmentId || '');
        setStatus(loadedJob.status || 'draft');
        setType(loadedJob.type || 'full-time');
        setLevel(loadedJob.level || 'mid');
        setFeatured(loadedJob.featured || false);
        setUrgent(loadedJob.urgent || false);
        setRemote(loadedJob.remote || false);
        setHybrid(loadedJob.hybrid || false);
        setShortDescription(loadedJob.shortDescription || '');
        setFullDescription(loadedJob.fullDescription || '');
        setResponsibilities((loadedJob.responsibilities || []).join('\n'));
        setEssentialRequirements((loadedJob.requirements?.essential || []).join('\n'));
        setPreferredRequirements((loadedJob.requirements?.preferred || []).join('\n'));

        // Manejar ubicación que puede ser string u objeto
        if (typeof loadedJob.location === 'object' && loadedJob.location) {
          setLocation(loadedJob.location.city || '');
          setRegion(loadedJob.location.state || '');
          setCountry(loadedJob.location.country || 'Perú');
          setRemote(loadedJob.location.remote_allowed || false);
        } else {
          setLocation(loadedJob.location || '');
          setRegion(loadedJob.region || '');
          setCountry(loadedJob.country || 'Perú');
        }

        setSalaryMin(loadedJob.salary?.min?.toString() || '');
        setSalaryMax(loadedJob.salary?.max?.toString() || '');
        setSalaryCurrency(loadedJob.salary?.currency || 'PEN');
        setSalaryPeriod(loadedJob.salary?.period || 'monthly');
        setSalaryNegotiable(loadedJob.salary?.negotiable || false);

        if (loadedJob.deadline) {
          const date = loadedJob.deadline.toDate ?
            loadedJob.deadline.toDate() :
            new Date(loadedJob.deadline as any);
          setDeadline(date.toISOString().slice(0, 10));
        }

        setExperienceYears(loadedJob.experienceYears?.toString() || '0');
        setTags((loadedJob.tags || []).join(', '));

      });
    }
  }, [loadedJob, isLoadingData]);

  // Generar slug automáticamente cuando cambia el título
  useEffect(() => {
    if (title && !isEditingSlug && !isEditing) {
      const generateUniqueSlug = async () => {
        const baseSlug = generateSlug(title);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, undefined, jobsHook);
        setSlug(uniqueSlug);
      };
      generateUniqueSlug();
    }
    setIsDirty(true);
  }, [title, isEditingSlug, isEditing, jobsHook]);

  // Datos memoizados
  const departments = useMemo(() => {
    return departmentsHook.departments.filter(dept => dept && dept.id);
  }, [departmentsHook.departments]);

  const handleSave = async (makeActive = false) => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!departmentId) {
      alert('Selecciona un departamento');
      return;
    }

    if (!shortDescription.trim()) {
      alert('La descripción corta es obligatoria');
      return;
    }

    setSaving(true);

    try {
      // Asegurar slug único
      const finalSlug = await ensureUniqueSlug(
        slug || generateSlug(title),
        isEditing ? jobId : undefined,
        jobsHook
      );

      const jobData: any = {
        title: title.trim(),
        slug: finalSlug,
        departmentId,
        status: makeActive ? 'active' : status,
        type,
        level,
        featured,
        urgent,
        remote,
        hybrid,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        responsibilities: responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        requirements: {
          essential: essentialRequirements.split('\n').map(r => r.trim()).filter(Boolean),
          preferred: preferredRequirements.split('\n').map(r => r.trim()).filter(Boolean)
        },
        location: {
          city: location.trim(),
          state: region.trim(),
          country: country.trim(),
          remote_allowed: remote
        },
        experienceYears: parseInt(experienceYears) || 0,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        postedAt: new Date(),
        updatedAt: new Date()
      };

      // Agregar salario si se especifica
      if (salaryMin || salaryMax) {
        jobData.salary = {
          min: parseInt(salaryMin) || 0,
          max: parseInt(salaryMax) || 0,
          currency: salaryCurrency,
          period: salaryPeriod,
          negotiable: salaryNegotiable
        };
      }

      // Agregar deadline si se especifica
      if (deadline) {
        jobData.deadline = new Date(deadline);
      }

      let response;
      if (isEditing) {
        response = await jobsHook.update(jobId!, jobData);
      } else {
        response = await jobsHook.create(jobData);
      }

      if (response.exito) {
        setIsDirty(false);
        router.push('/admin/json-crud/careers/jobs');
      } else {
        throw new Error(response.mensaje || 'Error al guardar el trabajo');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert(`Error al guardar el trabajo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  // Si estamos editando y no hemos cargado los datos todavía, mostrar loading
  if (isEditing && isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del trabajo...</p>
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
                onClick={() => router.push('/admin/json-crud/careers/jobs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {isEditing ? 'Editar trabajo' : 'Nuevo trabajo'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isDirty ? 'Cambios sin guardar' : 'Todos los cambios guardados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar borrador'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {saving ? 'Publicando...' : 'Publicar trabajo'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Trabajo *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Ingeniero Civil Senior"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsEditingSlug(true);
                      }}
                      onBlur={() => setIsEditingSlug(false)}
                      placeholder="slug-del-trabajo"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEditingSlug
                      ? 'Editando slug manualmente'
                      : 'Se genera automáticamente del título y verifica que sea único'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name || dept.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel
                    </label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Intermedio</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Tiempo completo</SelectItem>
                        <SelectItem value="part-time">Medio tiempo</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="internship">Prácticas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Años de experiencia
                    </label>
                    <Input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={featured}
                      onCheckedChange={setFeatured}
                    />
                    <label htmlFor="featured" className="text-sm flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Destacado
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="urgent"
                      checked={urgent}
                      onCheckedChange={setUrgent}
                    />
                    <label htmlFor="urgent" className="text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Urgente
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Corta *
                  </label>
                  <Textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Resumen breve del trabajo..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {shortDescription.length}/300 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Completa
                  </label>
                  <Textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Descripción detallada del trabajo..."
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsabilidades Clave
                  </label>
                  <Textarea
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="Una responsabilidad por línea..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requisitos Esenciales
                  </label>
                  <Textarea
                    value={essentialRequirements}
                    onChange={(e) => setEssentialRequirements(e.target.value)}
                    placeholder="Un requisito por línea..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requisitos Preferidos
                  </label>
                  <Textarea
                    value={preferredRequirements}
                    onChange={(e) => setPreferredRequirements(e.target.value)}
                    placeholder="Un requisito preferido por línea..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Section */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span>Configuración Avanzada</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {showAdvanced && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiquetas
                    </label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="javascript, react, remoto (separar con comas)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha límite
                    </label>
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Lima"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Región
                  </label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Lima"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Perú"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remote"
                      checked={remote}
                      onCheckedChange={setRemote}
                    />
                    <label htmlFor="remote" className="text-sm">
                      Trabajo remoto
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hybrid"
                      checked={hybrid}
                      onCheckedChange={setHybrid}
                    />
                    <label htmlFor="hybrid" className="text-sm">
                      Trabajo híbrido
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Compensación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mín.
                    </label>
                    <Input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máx.
                    </label>
                    <Input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEN">Soles (PEN)</SelectItem>
                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período
                    </label>
                    <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="negotiable"
                    checked={salaryNegotiable}
                    onCheckedChange={setSalaryNegotiable}
                  />
                  <label htmlFor="negotiable" className="text-sm">
                    Salario negociable
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}