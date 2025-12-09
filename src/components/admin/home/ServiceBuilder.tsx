'use client';

import React, { useState } from 'react';
import { Settings, Plus, Eye, EyeOff, Upload, ExternalLink, Star, Trash2, Edit3, Save, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import ImageSelector from '@/components/admin/ImageSelector';

interface Service {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  icon_url?: string;
  is_main?: boolean;
  width?: '1/3' | '2/3' | '3/3';
  cta?: {
    text: string;
    url: string;
  };
}

interface ServicesData {
  section: {
    title: string;
    subtitle: string;
  };
  main_service: Service;
  secondary_services: Service[];
}

interface ServiceBuilderProps {
  mainService: Service;
  secondaryServices: Service[];
  onChange: (services: ServicesData) => void;
  imageUpload?: boolean;
  iconLibrary?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const ServiceBuilder: React.FC<ServiceBuilderProps> = ({
  mainService,
  secondaryServices,
  onChange,
  imageUpload = true,
  iconLibrary = true,
  sectionTitle = '',
  sectionSubtitle = ''
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [editingService, setEditingService] = useState<number | null>(null); // null = main, 0-3 = secondary

  const handleMainServiceChange = (field: keyof Service, value: any) => {
    const updatedMainService = { ...mainService, [field]: value };
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: updatedMainService,
      secondary_services: secondaryServices
    });
  };

  const handleSecondaryServiceChange = (index: number, field: keyof Service, value: any) => {
    const updatedSecondaryServices = [...secondaryServices];
    updatedSecondaryServices[index] = { ...updatedSecondaryServices[index], [field]: value };
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
  };

  const addSecondaryService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      title: '',
      description: '',
      image_url: '',
      icon_url: '',
      is_main: false,
      width: '1/3'
    };
    
    const updatedSecondaryServices = [...secondaryServices, newService];
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
    
    // Set editing to the new service
    setEditingService(updatedSecondaryServices.length - 1);
  };

  const removeSecondaryService = (index: number) => {
    if (secondaryServices.length <= 1) {
      alert('Debe mantener al menos un servicio secundario');
      return;
    }
    
    const updatedSecondaryServices = secondaryServices.filter((_, i) => i !== index);
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
    
    // Reset editing if we were editing the removed service
    if (editingService === index) {
      setEditingService(null);
    } else if (editingService !== null && editingService > index) {
      setEditingService(editingService - 1);
    }
  };

  const duplicateService = (index: number) => {
    const serviceToDuplicate = secondaryServices[index];
    const newService: Service = {
      ...serviceToDuplicate,
      id: `service-${Date.now()}`,
      title: `${serviceToDuplicate.title} (Copia)`,
      width: serviceToDuplicate.width || '1/3'
    };
    
    const updatedSecondaryServices = [...secondaryServices];
    updatedSecondaryServices.splice(index + 1, 0, newService);
    
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
    
    // Set editing to the new service
    setEditingService(index + 1);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(secondaryServices);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: items
    });

    // Update editing index if needed
    if (editingService === result.source.index) {
      setEditingService(result.destination.index);
    } else if (editingService !== null) {
      if (result.source.index < editingService && result.destination.index >= editingService) {
        setEditingService(editingService - 1);
      } else if (result.source.index > editingService && result.destination.index <= editingService) {
        setEditingService(editingService + 1);
      }
    }
  };

  const handleWidthChange = (index: number, newWidth: '1/3' | '2/3' | '3/3') => {
    const updatedSecondaryServices = [...secondaryServices];
    updatedSecondaryServices[index] = { ...updatedSecondaryServices[index], width: newWidth };
    onChange({
      section: { title: sectionTitle, subtitle: sectionSubtitle },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
  };

  // Función para obtener clases CSS según el ancho
  const getWidthClass = (width: '1/3' | '2/3' | '3/3' | undefined): string => {
    switch (width) {
      case '2/3': return 'col-span-2';
      case '3/3': return 'col-span-3';
      case '1/3':
      default: return 'col-span-1';
    }
  };

  // Función para obtener descripción del ancho
  const getWidthLabel = (width: '1/3' | '2/3' | '3/3' | undefined): string => {
    switch (width) {
      case '2/3': return 'Ancho 2/3';
      case '3/3': return 'Ancho completo';
      case '1/3':
      default: return 'Ancho 1/3';
    }
  };

  const toggleMainService = (targetIndex: number) => {
    // Si ya es el servicio principal, lo quitamos de principal
    if (targetIndex === -1) {
      // Quitar de principal (convertir mainService en secundario)
      const demotedMainService: Service = {
        ...mainService,
        id: `service-${Date.now()}`,
        is_main: false,
        width: '1/3'
      };
      
      // Crear un servicio principal vacío/placeholder
      const emptyMain: Service = { 
        id: 'main', 
        title: '', 
        description: '', 
        is_main: false  // No hay servicio principal
      };
      
      const newSecondaryServices = [demotedMainService, ...secondaryServices];
        
      onChange({
        section: { title: sectionTitle, subtitle: sectionSubtitle },
        main_service: emptyMain,
        secondary_services: newSecondaryServices
      });
    } else {
      // Hacer principal un servicio secundario
      const serviceToPromote = secondaryServices[targetIndex];
      const newMainService = { ...serviceToPromote, is_main: true };
      
      // Si el main actual tiene contenido, convertirlo en secundario
      let newSecondaryServices = [...secondaryServices];
      newSecondaryServices.splice(targetIndex, 1); // Remover el servicio promovido
      
      // Solo agregar el main anterior si tiene contenido
      if (mainService.title || mainService.description || mainService.image_url) {
        const demotedMainService: Service = {
          ...mainService,
          id: `service-${Date.now()}`,
          is_main: false,
          width: '1/3'
        };
        newSecondaryServices.unshift(demotedMainService);
      }
      
      onChange({
        section: { title: sectionTitle, subtitle: sectionSubtitle },
        main_service: newMainService,
        secondary_services: newSecondaryServices
      });
    }
  };

  const ServiceCard = ({ service, isMain, index }: { service: Service; isMain: boolean; index?: number }) => {
    const hasMainContent = isMain && (service.title || service.description || service.image_url);
    const isRealMain = isMain && service.is_main; // Solo es principal si tiene is_main: true
    
    // Si es el slot principal pero está vacío, mostrar placeholder
    if (isMain && !hasMainContent) {
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
          <div className="flex flex-col items-center gap-2 py-4">
            <Star className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No hay servicio principal</p>
            <p className="text-xs text-gray-400">Haz click en la estrella de cualquier servicio para hacerlo principal</p>
          </div>
        </div>
      );
    }

    return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      isRealMain 
        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleMainService(isMain ? -1 : index || 0)}
            className={`h-5 w-5 p-0 ${isRealMain ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
            title={isRealMain ? "Quitar como principal" : "Hacer principal"}
          >
            <Star className={`h-4 w-4 ${isRealMain ? 'fill-yellow-500' : ''}`} />
          </Button>
          <Badge variant={isRealMain ? "default" : "secondary"}>
            {isRealMain ? 'Principal' : `Servicio ${(index || 0) + 1}`}
          </Badge>
          {!isMain && (
            <Badge variant="outline" className="text-xs">
              {getWidthLabel(service.width)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasMainContent && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingService(isMain ? -1 : index || 0)}
              className="h-6 w-6 p-0"
              title="Editar"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
          {!isMain && index !== undefined && (
            <>
              {/* Botones de ancho */}
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWidthChange(index, '1/3')}
                  className={`h-6 w-6 p-0 ${service.width === '1/3' ? 'text-blue-600' : 'text-gray-400'}`}
                  title="Ancho 1/3"
                >
                  <span className="text-xs font-bold">1</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWidthChange(index, '2/3')}
                  className={`h-6 w-6 p-0 ${service.width === '2/3' ? 'text-blue-600' : 'text-gray-400'}`}
                  title="Ancho 2/3"
                >
                  <span className="text-xs font-bold">2</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWidthChange(index, '3/3')}
                  className={`h-6 w-6 p-0 ${service.width === '3/3' ? 'text-blue-600' : 'text-gray-400'}`}
                  title="Ancho completo"
                >
                  <span className="text-xs font-bold">3</span>
                </Button>
              </div>
              
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => duplicateService(index)}
                className="h-6 w-6 p-0"
                title="Duplicar"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSecondaryService(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                title="Eliminar"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          {service.icon_url && (
            <img
              src={service.icon_url}
              alt="Icono del servicio"
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <h4 className="font-semibold text-sm line-clamp-1">{service.title || 'Sin título'}</h4>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{service.description || ''}</p>
        
        {service.image_url && (
          <div className="w-full h-20 bg-gray-100 rounded border overflow-hidden relative">
            <img
              src={service.image_url}
              alt={service.title || 'Imagen del servicio'}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Si falla, ocultar imagen y mostrar placeholder
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center" style={{display: 'none'}}>
              <span className="text-xs text-gray-600">Imagen no disponible</span>
            </div>
          </div>
        )}
        
        {service.cta && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <ExternalLink className="h-3 w-3" />
            {service.cta.text}
          </div>
        )}
      </div>
    </div>
    );
  };

  const ServiceEditor = ({ service, isMain, index }: { service: Service; isMain: boolean; index?: number }) => {
    const handleChange = (field: keyof Service, value: any) => {
      if (isMain) {
        handleMainServiceChange(field, value);
      } else if (index !== undefined) {
        handleSecondaryServiceChange(index, field, value);
      }
    };

    const handleCTAChange = (field: string, value: string) => {
      const newCTA = { ...service.cta, [field]: value };
      handleChange('cta', newCTA);
    };

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isMain && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
              {isMain ? 'Servicio Principal (DIP)' : `Servicio Secundario ${(index || 0) + 1}`}
              <Badge variant={isMain ? "default" : "outline"}>
                {service.id}
              </Badge>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleMainService(isMain ? -1 : index || 0)}
              className={`flex items-center gap-1 ${service.is_main ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
              title={service.is_main ? "Quitar como principal" : "Hacer principal"}
            >
              <Star className={`h-4 w-4 ${service.is_main ? 'fill-yellow-500' : ''}`} />
              {service.is_main ? 'Es Principal' : 'Hacer Principal'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Textos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Servicio *
                </label>
                <Input
                  key={`title-${service.id}`}
                  defaultValue={service.title}
                  onBlur={(e) => handleChange('title', e.target.value)}
                  placeholder="ej: Dirección Integral de Proyectos"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{service.title?.length || 0}/50</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <Textarea
                  key={`desc-${service.id}`}
                  defaultValue={service.description}
                  onBlur={(e) => handleChange('description', e.target.value)}
                  placeholder="Describa los beneficios y alcance del servicio..."
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{service.description?.length || 0}/200</p>
              </div>

              {/* Control de ancho - solo para servicios secundarios */}
              {!isMain && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancho de la Card
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={service.width === '1/3' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('width', '1/3')}
                      className="flex-1"
                    >
                      1/3
                    </Button>
                    <Button
                      type="button"
                      variant={service.width === '2/3' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('width', '2/3')}
                      className="flex-1"
                    >
                      2/3
                    </Button>
                    <Button
                      type="button"
                      variant={service.width === '3/3' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('width', '3/3')}
                      className="flex-1"
                    >
                      Completo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Controla qué tan ancha será esta card en la grilla de servicios
                  </p>
                </div>
              )}
            </div>

            {/* Recursos y CTA */}
            <div className="space-y-4">
              {imageUpload && (
                <div>
                  <ImageSelector
                    value={service.image_url || ''}
                    onChange={(newValue) => handleChange('image_url', newValue)}
                    label="Imagen del Servicio"
                    placeholder="Seleccionar imagen..."
                    required={false}
                    disabled={false}
                    description="Imagen principal que se mostrará en la card del servicio"
                  />
                </div>
              )}

              {iconLibrary && (
                <div>
                  <ImageSelector
                    value={service.icon_url || ''}
                    onChange={(newValue) => handleChange('icon_url', newValue)}
                    label="Icono del Servicio"
                    placeholder="Seleccionar icono..."
                    required={false}
                    disabled={false}
                    description="Icono pequeño que representa el servicio (opcional)"
                  />
                </div>
              )}

              {/* CTA */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Call to Action (Opcional)</h4>
                <div className="space-y-2">
                  <Input
                    key={`cta-text-${service.id}`}
                    defaultValue={service.cta?.text || ''}
                    onBlur={(e) => handleCTAChange('text', e.target.value)}
                    placeholder="Texto del botón (ej: Conoce más sobre DIP)"
                    maxLength={30}
                  />
                  <Input
                    key={`cta-url-${service.id}`}
                    defaultValue={service.cta?.url || ''}
                    onBlur={(e) => handleCTAChange('url', e.target.value)}
                    placeholder="URL de destino (ej: /services)"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSecondaryService}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Servicio
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
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">
              Vista Previa: 1 Principal + {secondaryServices.length} Secundarios
            </h3>
            
            {/* Servicio Principal */}
            <div className="mb-6">
              <ServiceCard service={mainService} isMain={true} />
            </div>
            
            {/* Servicios Secundarios en Grid con ancho dinámico */}
            <div className="grid grid-cols-3 gap-4">
              {secondaryServices.map((service, index) => (
                <div key={service.id} className={getWidthClass(service.width)}>
                  <ServiceCard 
                    service={service} 
                    isMain={false} 
                    index={index} 
                  />
                </div>
              ))}
            </div>
            
            {/* Mensaje si no hay servicios secundarios */}
            {secondaryServices.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay servicios secundarios configurados</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSecondaryService}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Servicio
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {!showPreview && (
          <div className="space-y-6">
            {/* Vista compacta con cards para gestión rápida */}
            {editingService === null && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Vista rápida - Gestión de servicios</h4>
                  <Badge variant="outline">{secondaryServices.length + 1} servicios total</Badge>
                </div>
                
                {/* Servicio Principal Card */}
                <div className="mb-4 relative group">
                  {/* Edit Button para servicio principal */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingService(null)} // null = main service
                      className="h-8 w-8 p-0 bg-white shadow-md"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  <ServiceCard service={mainService} isMain={true} />
                </div>
                
                {/* Servicios Secundarios Cards con drag & drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="services" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-3 gap-4"
                      >
                        {secondaryServices.map((service, index) => (
                          <Draggable key={service.id} draggableId={service.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${getWidthClass(service.width)} ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              >
                                <Card className="relative group">
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                  >
                                    <div className="bg-white shadow-md rounded p-1">
                                      <GripVertical className="h-4 w-4 text-gray-500" />
                                    </div>
                                  </div>

                                  {/* Edit Button */}
                                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingService(index)}
                                      className="h-8 w-8 p-0 bg-white shadow-md"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <ServiceCard
                                    service={service}
                                    isMain={false}
                                    index={index}
                                  />
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {/* Mensaje si no hay servicios secundarios */}
                {secondaryServices.length === 0 && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <Settings className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay servicios secundarios</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSecondaryService}
                      className="mt-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Primer Servicio
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Editor individual cuando se selecciona un servicio específico */}
            {editingService !== null && (
              <>
                {/* Botón para volver atrás */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(null)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Volver a Vista General
                  </Button>
                  <Badge variant="secondary">
                    {editingService === -1 ? 'Editando Servicio Principal' : `Editando Servicio ${editingService + 1}`}
                  </Badge>
                </div>

                {/* Servicio Principal Editor */}
                {editingService === -1 && (
                  <ServiceEditor service={mainService} isMain={true} />
                )}

                {/* Servicios Secundarios Editor */}
                {editingService !== -1 && editingService >= 0 && secondaryServices[editingService] && (
                  <ServiceEditor 
                    service={secondaryServices[editingService]} 
                    isMain={false} 
                    index={editingService} 
                  />
                )}
              </>
            )}

            {/* Navegación entre servicios */}
            {secondaryServices.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant={editingService === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingService(null)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Vista General
                  </Button>
                  
                  <Button
                    type="button"
                    variant={editingService === -1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingService(-1)}
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    Principal
                  </Button>
                  
                  {secondaryServices.map((_, index) => (
                    <Button
                      type="button"
                      key={index}
                      variant={editingService === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditingService(index)}
                    >
                      Servicio {index + 1}
                    </Button>
                  ))}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSecondaryService}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800"
                  >
                    <Plus className="h-3 w-3" />
                    Nuevo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">{secondaryServices.length + 1}</p>
              <p className="text-xs text-gray-600">Total Servicios</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00A8E8]">
                {[mainService, ...secondaryServices].filter(s => s.title && s.description).length}
              </p>
              <p className="text-xs text-gray-600">Completos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {[mainService, ...secondaryServices].filter(s => s.cta?.text && s.cta?.url).length}
              </p>
              <p className="text-xs text-gray-600">Con CTA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {[mainService, ...secondaryServices].filter(s => s.image_url).length}
              </p>
              <p className="text-xs text-gray-600">Con Imagen</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ServiceBuilder;