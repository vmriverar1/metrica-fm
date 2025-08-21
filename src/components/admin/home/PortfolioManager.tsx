'use client';

import React, { useState } from 'react';
import { Folder, Eye, EyeOff, GripVertical, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import BulkOperations from '../BulkOperations';

interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url?: string;
  image_url_fallback?: string;
}

interface PortfolioManagerProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  categories?: string[];
  imageUpload?: boolean;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  projects,
  onChange,
  categories = ['Sanitaria', 'Educativa', 'Vial', 'Saneamiento', 'Industrial', 'Comercial'],
  imageUpload = true
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);

  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    onChange(updatedProjects);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedProjects = [...projects];
    const draggedProject = updatedProjects[draggedIndex];
    
    // Remove dragged item
    updatedProjects.splice(draggedIndex, 1);
    // Insert at new position
    updatedProjects.splice(dropIndex, 0, draggedProject);
    
    onChange(updatedProjects);
    setDraggedIndex(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Sanitaria': 'bg-red-100 text-red-800',
      'Educativa': 'bg-blue-100 text-blue-800',
      'Vial': 'bg-yellow-100 text-yellow-800',
      'Saneamiento': 'bg-green-100 text-green-800',
      'Industrial': 'bg-purple-100 text-purple-800',
      'Comercial': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
        {project.image_url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-xs text-gray-600">
              📸 {project.image_url.split('/').pop()?.substring(0, 20)}...
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-400">Sin imagen</span>
          </div>
        )}
        
        <Badge className={`absolute top-2 left-2 ${getCategoryColor(project.type)}`}>
          {project.type}
        </Badge>
        
        <Badge variant="secondary" className="absolute top-2 right-2">
          #{index + 1}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {project.name || 'Proyecto sin nombre'}
        </h4>
        <p className="text-xs text-gray-600 line-clamp-3 min-h-[3rem]">
          {project.description || 'Sin descripción disponible'}
        </p>
      </div>
    </div>
  );

  const ProjectEditor = ({ project, index }: { project: Project; index: number }) => (
    <Card 
      key={project.id}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
      className={`transition-all duration-200 ${
        draggedIndex === index 
          ? 'opacity-50 border-blue-300' 
          : 'hover:border-gray-300'
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
          <span>Proyecto Destacado {index + 1}</span>
          <Badge variant="outline">{project.id}</Badge>
          <Badge className={getCategoryColor(project.type)}>
            {project.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proyecto *
              </label>
              <Input
                value={project.name}
                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                placeholder="ej: Hospital Nacional de Alta Complejidad"
                maxLength={80}
              />
              <p className="text-xs text-gray-500 mt-1">{project.name?.length || 0}/80</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <Select
                value={project.type}
                onValueChange={(value) => handleProjectChange(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(project.type)} variant="secondary">
                        {project.type}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(category)} variant="secondary">
                          {category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Proyecto
              </label>
              <Input
                value={project.id}
                onChange={(e) => handleProjectChange(index, 'id', e.target.value)}
                placeholder="ej: hospital-nacional"
                maxLength={30}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Descripción e Imágenes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Proyecto *
              </label>
              <Textarea
                value={project.description}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                placeholder="Describa el alcance, beneficiarios y logros del proyecto..."
                rows={4}
                maxLength={250}
              />
              <p className="text-xs text-gray-500 mt-1">{project.description?.length || 0}/250</p>
            </div>

            {imageUpload && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Principal (URL)
                  </label>
                  <Input
                    value={project.image_url || ''}
                    onChange={(e) => handleProjectChange(index, 'image_url', e.target.value)}
                    placeholder="https://metrica-dip.com/images/proyecto.jpg"
                    type="url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Fallback (local)
                  </label>
                  <Input
                    value={project.image_url_fallback || ''}
                    onChange={(e) => handleProjectChange(index, 'image_url_fallback', e.target.value)}
                    placeholder="/img/portfolio/proyecto.jpg"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Portfolio Project Manager
              <Badge variant="outline">{projects.length} Proyectos</Badge>
            </CardTitle>
            <CardDescription>
              Gestione los {projects.length} proyectos destacados del portfolio. Arrastre para reordenar.
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Editar' : 'Preview'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Mode */}
        {showPreview && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">
              Vista Previa: Proyectos Destacados
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {!showPreview && (
          <div className="space-y-6">
            {projects.map((project, index) => (
              <ProjectEditor key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {/* Stats by Category */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución por Categoría:</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = projects.filter(p => p.type === category).length;
              return count > 0 ? (
                <Badge key={category} className={getCategoryColor(category)} variant="secondary">
                  {category}: {count}
                </Badge>
              ) : null;
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">{projects.length}</p>
              <p className="text-xs text-gray-600">Total Proyectos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E84E0F]">
                {projects.filter(p => p.name && p.description && p.type).length}
              </p>
              <p className="text-xs text-gray-600">Completos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.image_url || p.image_url_fallback).length}
              </p>
              <p className="text-xs text-gray-600">Con Imagen</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(projects.map(p => p.type)).size}
              </p>
              <p className="text-xs text-gray-600">Categorías</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips para Proyectos Destacados:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Nombres:</strong> Use nombres oficiales completos de proyectos</li>
            <li>• <strong>Variedad:</strong> Incluya diferentes categorías para mostrar versatilidad</li>
            <li>• <strong>Descripciones:</strong> Destaque el impacto y beneficiarios del proyecto</li>
            <li>• <strong>Orden:</strong> Los proyectos más importantes van primero (arrastre para reordenar)</li>
            <li>• <strong>Imágenes:</strong> Use fotos reales de los proyectos terminados</li>
          </ul>
        </div>

        {/* Bulk Operations */}
        {showBulkOps && (
          <BulkOperations
            items={projects}
            itemType="projects"
            onUpdate={onChange}
            maxItems={8}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;