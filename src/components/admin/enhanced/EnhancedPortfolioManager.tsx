'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Folder,
  Copy,
  Edit2,
  MoreHorizontal
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ImageSelector from '../ImageSelector';
import BulkOperations from '../BulkOperations';

interface ProjectItem {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url?: string;
  link_url?: string;
  featured_order?: number;
}

interface EnhancedPortfolioManagerProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
  categories?: string[];
  onSave?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

interface ProjectValidationErrors {
  [key: string]: string[];
}

export default function EnhancedPortfolioManager({
  projects,
  onChange,
  categories = ['Sanitaria', 'Educativa', 'Vial', 'Saneamiento', 'Industrial', 'Comercial'],
  onSave,
  loading = false,
  className = ''
}: EnhancedPortfolioManagerProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<ProjectValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(categories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Initialize featured_order for projects that don't have it
  useEffect(() => {
    const needsOrder = projects.some(project => project.featured_order === undefined);
    if (needsOrder) {
      const projectsWithOrder = projects.map((project, index) => ({
        ...project,
        featured_order: project.featured_order ?? index
      }));
      onChange(projectsWithOrder);
    }
  }, [projects, onChange]);

  // Cargar categorías dinámicamente desde Firestore
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        console.log('🔥 [FIRESTORE] Loading portfolio categories...');
        const response = await fetch('/api/portfolio/categories');
        const result = await response.json();

        if (result.success && result.data) {
          // Extraer solo los nombres de las categorías
          const categoryNames = result.data.map((category: any) => category.name);
          setDynamicCategories(categoryNames);
          console.log('✅ [FIRESTORE] Categories loaded:', categoryNames);
        } else {
          console.warn('⚠️ [FIRESTORE] Failed to load categories, using fallback:', result.error);
          setDynamicCategories(categories);
        }
      } catch (error) {
        console.error('❌ [FIRESTORE] Error loading categories:', error);
        setDynamicCategories(categories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [categories]);

  // Validar proyecto individual
  const validateProject = (project: ProjectItem): string[] => {
    const errors: string[] = [];
    
    if (!project.name.trim()) {
      errors.push('El nombre del proyecto es requerido');
    }
    
    if (!project.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!project.type) {
      errors.push('La categoría es requerida');
    }
    
    if (project.image_url && !isValidUrl(project.image_url)) {
      errors.push('URL de imagen principal no es válida');
    }

    if (project.link_url && !isValidUrl(project.link_url)) {
      errors.push('URL del enlace no es válida');
    }

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.includes('public/');
    }
  };

  // Validar todos los proyectos
  useEffect(() => {
    const newErrors: ProjectValidationErrors = {};
    projects.forEach(project => {
      const projectErrors = validateProject(project);
      if (projectErrors.length > 0) {
        newErrors[project.id] = projectErrors;
      }
    });
    setErrors(newErrors);
  }, [projects]);

  // Manejar reordenamiento
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Assign featured_order based on new position
    const reorderedItems = items.map((item, index) => ({
      ...item,
      featured_order: index
    }));

    onChange(reorderedItems);
  };

  // Agregar nuevo proyecto
  const addProject = () => {
    const newProject: ProjectItem = {
      id: `project-${Date.now()}`,
      name: 'Nuevo Proyecto',
      type: '',
      description: 'Descripción del proyecto',
      image_url: '',
      link_url: '',
      featured_order: projects.length // Assign order as last position
    };
    onChange([...projects, newProject]);
    setEditingId(newProject.id);
  };

  // Eliminar proyecto
  const removeProject = (id: string) => {
    const filteredProjects = projects.filter(project => project.id !== id);
    // Reassign featured_order to maintain sequence
    const reorderedProjects = filteredProjects.map((project, index) => ({
      ...project,
      featured_order: index
    }));
    onChange(reorderedProjects);
  };

  // Duplicar proyecto
  const duplicateProject = (project: ProjectItem) => {
    const newProject: ProjectItem = {
      ...project,
      id: `project-${Date.now()}`,
      name: `${project.name} (Copia)`,
      featured_order: projects.length // Assign order as last position
    };
    onChange([...projects, newProject]);
    setEditingId(newProject.id);
  };

  // Actualizar proyecto
  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange(projects.map(project => 
      project.id === id 
        ? { ...project, [field]: value }
        : project
    ));
  };

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;

  // Renderizar preview del proyecto
  const renderProjectPreview = (project: ProjectItem) => {
    const hasErrors = errors[project.id]?.length > 0;

    return (
      <Card key={project.id} className={`transition-all duration-300 hover:shadow-lg ${hasErrors ? 'border-red-200' : ''}`}>
        <div className="relative">
          {/* Imagen */}
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Folder className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Contenido */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-lg font-semibold">{project.name}</div>
              <Badge variant="secondary">{project.type}</Badge>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </div>
          </CardContent>

          {/* Indicador de errores */}
          {hasErrors && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Renderizar formulario de edición
  const renderProjectForm = (project: ProjectItem, index: number) => {
    const projectErrors = errors[project.id] || [];
    const isEditing = editingId === project.id;

    return (
      <Draggable key={project.id} draggableId={project.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              transition-all duration-200
              ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
              ${projectErrors.length > 0 ? 'border-red-200' : ''}
              ${isEditing ? 'border-primary shadow-md' : ''}
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>
                  <Badge variant={projectErrors.length > 0 ? 'destructive' : 'secondary'}>
                    Proyecto #{index + 1}
                  </Badge>
                  {projectErrors.length === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : project.id)}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateProject(project)}
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeProject(project.id)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Errores */}
              {projectErrors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {projectErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            {isEditing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div>
                      <Label>ID del proyecto</Label>
                      <Input
                        value={project.id}
                        onChange={(e) => updateProject(project.id, 'id', e.target.value)}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label>Nombre del proyecto *</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder="Nombre descriptivo del proyecto"
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <Label>Categoría *</Label>
                      <Input
                        value={project.type}
                        onChange={(e) => updateProject(project.id, 'type', e.target.value)}
                        placeholder="Ej: Sanitaria, Educativa, Vial, etc."
                        className={errors[project.id]?.includes('La categoría es requerida') ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Escribe el nombre de la categoría libremente
                      </p>
                    </div>

                    <div>
                      <Label>Descripción *</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        placeholder="Descripción detallada del proyecto"
                        rows={4}
                        maxLength={300}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.description.length}/300 caracteres
                      </p>
                    </div>

                    <div>
                      <Label>Enlace del proyecto (opcional)</Label>
                      <Input
                        value={project.link_url || ''}
                        onChange={(e) => updateProject(project.id, 'link_url', e.target.value)}
                        placeholder="https://... o /ruta-interna"
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Si se deja vacío, usará el enlace por defecto del portfolio
                      </p>
                    </div>
                  </div>

                  {/* Imagen */}
                  <div className="space-y-4">
                    <div>
                      <ImageSelector
                        value={project.image_url || ''}
                        onChange={(value) => updateProject(project.id, 'image_url', value)}
                        label="Imagen principal"
                        placeholder="Seleccionar imagen principal..."
                        variant="card"
                        size="md"
                      />
                    </div>

                    {/* Vista previa */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
                      <div className="aspect-video w-full bg-background rounded overflow-hidden">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Folder className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </Draggable>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Proyectos Destacados ({projects.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Arrastra para reordenar, haz clic en editar para modificar
            {categoriesLoading && (
              <span className="inline-flex items-center gap-1 ml-2 text-primary">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Cargando categorías...
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBulkOps(!showBulkOps)}
            className="flex items-center gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
            Bulk Ops
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          
          <Button type="button" onClick={addProject}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Proyecto
          </Button>
          
          {onSave && (
            <Button 
              type="button"
              onClick={onSave}
              disabled={loading || hasErrors}
              className="min-w-20"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de errores */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hay {Object.keys(errors).length} proyectos con errores. 
            Revisa los campos marcados antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode */}
      {previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(project => (
            <div key={project.id}>
              {renderProjectPreview(project)}
            </div>
          ))}
        </div>
      ) : (
        /* Edit Mode con Drag & Drop */
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  space-y-4 min-h-24 p-2 rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/20' : ''}
                `}
              >
                {projects.map((project, index) => renderProjectForm(project, index))}
                {provided.placeholder}
                
                {/* Mensaje cuando no hay proyectos */}
                {projects.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay proyectos</p>
                    <p className="text-sm">Haz clic en "Agregar Proyecto" para comenzar</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Bulk Operations */}
      {showBulkOps && (
        <BulkOperations
          items={projects}
          itemType="projects"
          onUpdate={onChange}
          maxItems={12}
        />
      )}
    </div>
  );
}