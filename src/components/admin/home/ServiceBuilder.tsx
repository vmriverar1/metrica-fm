'use client';

import React, { useState } from 'react';
import { Settings, Plus, Eye, EyeOff, Upload, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Service {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  image_url_fallback?: string;
  icon_url?: string;
  is_main?: boolean;
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
}

const ServiceBuilder: React.FC<ServiceBuilderProps> = ({
  mainService,
  secondaryServices,
  onChange,
  imageUpload = true,
  iconLibrary = true
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [editingService, setEditingService] = useState<number | null>(null); // null = main, 0-3 = secondary

  const handleMainServiceChange = (field: keyof Service, value: any) => {
    const updatedMainService = { ...mainService, [field]: value };
    onChange({
      section: { title: '', subtitle: '' }, // These are managed separately
      main_service: updatedMainService,
      secondary_services: secondaryServices
    });
  };

  const handleSecondaryServiceChange = (index: number, field: keyof Service, value: any) => {
    const updatedSecondaryServices = [...secondaryServices];
    updatedSecondaryServices[index] = { ...updatedSecondaryServices[index], [field]: value };
    onChange({
      section: { title: '', subtitle: '' },
      main_service: mainService,
      secondary_services: updatedSecondaryServices
    });
  };

  const ServiceCard = ({ service, isMain, index }: { service: Service; isMain: boolean; index?: number }) => (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      isMain 
        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isMain && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          <Badge variant={isMain ? "default" : "secondary"}>
            {isMain ? 'Principal' : `Servicio ${(index || 0) + 2}`}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditingService(isMain ? null : index || 0)}
          className="h-6 w-6 p-0"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-sm line-clamp-1">{service.title || 'Sin título'}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{service.description || 'Sin descripción'}</p>
        
        {service.image_url && (
          <div className="w-full h-20 bg-gray-100 rounded border overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-xs text-gray-600">Imagen: {service.image_url.split('/').pop()}</span>
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
          <CardTitle className="text-lg flex items-center gap-2">
            {isMain && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
            {isMain ? 'Servicio Principal (DIP)' : `Servicio Secundario ${(index || 0) + 2}`}
            <Badge variant={isMain ? "default" : "outline"}>
              {service.id}
            </Badge>
          </CardTitle>
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
                  value={service.title}
                  onChange={(e) => handleChange('title', e.target.value)}
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
                  value={service.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describa los beneficios y alcance del servicio..."
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{service.description?.length || 0}/200</p>
              </div>
            </div>

            {/* Recursos y CTA */}
            <div className="space-y-4">
              {imageUpload && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen Principal (URL)
                    </label>
                    <Input
                      value={service.image_url || ''}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen Fallback (local)
                    </label>
                    <Input
                      value={service.image_url_fallback || ''}
                      onChange={(e) => handleChange('image_url_fallback', e.target.value)}
                      placeholder="/img/services/servicio.jpg"
                    />
                  </div>
                </>
              )}

              {iconLibrary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono (URL)
                  </label>
                  <Input
                    value={service.icon_url || ''}
                    onChange={(e) => handleChange('icon_url', e.target.value)}
                    placeholder="/img/ico-service-1.png"
                  />
                </div>
              )}

              {/* CTA */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Call to Action (Opcional)</h4>
                <div className="space-y-2">
                  <Input
                    value={service.cta?.text || ''}
                    onChange={(e) => handleCTAChange('text', e.target.value)}
                    placeholder="Texto del botón (ej: Conoce más sobre DIP)"
                    maxLength={30}
                  />
                  <Input
                    value={service.cta?.url || ''}
                    onChange={(e) => handleCTAChange('url', e.target.value)}
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
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editor Visual de Servicios
              <Badge variant="outline">1 Principal + 4 Secundarios</Badge>
            </CardTitle>
            <CardDescription>
              Configure el servicio principal (DIP) destacado y los 4 servicios secundarios.
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Mode */}
        {showPreview && (
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">
              Vista Previa: Servicio Principal + Grid 2x2
            </h3>
            
            {/* Servicio Principal */}
            <div className="mb-6">
              <ServiceCard service={mainService} isMain={true} />
            </div>
            
            {/* Servicios Secundarios en Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {secondaryServices.map((service, index) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  isMain={false} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {!showPreview && (
          <div className="space-y-6">
            {/* Servicio Principal siempre visible o cuando está seleccionado */}
            {(editingService === null || editingService === undefined) && (
              <ServiceEditor service={mainService} isMain={true} />
            )}

            {/* Servicios Secundarios */}
            {secondaryServices.map((service, index) => (
              (editingService === index || editingService === null) && (
                <ServiceEditor 
                  key={service.id}
                  service={service} 
                  isMain={false} 
                  index={index} 
                />
              )
            ))}

            {/* Navegación entre servicios */}
            {editingService !== null && (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  Ver Principal
                </Button>
                {secondaryServices.map((_, index) => (
                  <Button
                    type="button"
                    key={index}
                    variant={editingService === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditingService(index)}
                  >
                    Servicio {index + 2}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  Ver Todos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">5</p>
              <p className="text-xs text-gray-600">Total Servicios</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E84E0F]">
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

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips para Servicios Efectivos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Principal:</strong> DIP debe destacar claramente sus beneficios únicos</li>
            <li>• <strong>Títulos:</strong> Mantenga títulos concisos y descriptivos (máximo 50 chars)</li>
            <li>• <strong>Descripciones:</strong> Enfoque en beneficios, no solo características</li>
            <li>• <strong>CTAs:</strong> Use verbos de acción específicos ("Conoce más", "Solicita consulta")</li>
            <li>• <strong>Imágenes:</strong> Use fotos reales de proyectos cuando sea posible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceBuilder;