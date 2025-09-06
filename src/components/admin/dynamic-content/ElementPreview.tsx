'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { BaseCardElement, ElementType, StatisticElement, PillarElement, PolicyElement, ServiceElement, ProjectElement } from '@/types/dynamic-elements';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Image from 'next/image';

interface ElementPreviewProps {
  element: BaseCardElement;
  elementType: ElementType;
}

export default function ElementPreview({ element, elementType }: ElementPreviewProps) {
  const renderStatisticPreview = (stat: StatisticElement) => (
    <Card className="text-center p-4">
      <div className="inline-block mb-4">
        <DynamicIcon 
          name={stat.icon || 'Award'}
          className="h-12 w-12 text-accent mx-auto"
          fallbackIcon="Award"
        />
      </div>
      <div className="text-4xl font-bold text-foreground mb-2">
        {stat.value}{stat.suffix}
      </div>
      <div className="text-foreground/70 font-medium">
        {stat.label}
      </div>
      {stat.description && (
        <div className="text-sm text-muted-foreground mt-2">
          {stat.description}
        </div>
      )}
    </Card>
  );

  const renderPillarPreview = (pillar: PillarElement) => (
    <Card className="group relative h-full bg-card/80 backdrop-blur-sm border-primary/20 hover:border-accent transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,123,196,0.3)] hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative">
        <CardHeader className="flex flex-col items-center text-center gap-4 pb-4">
          <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all duration-500">
            <DynamicIcon 
              name={pillar.icon || 'Compass'}
              className="h-12 w-12 text-accent transition-all duration-500 group-hover:text-white"
              fallbackIcon="Compass"
            />
          </div>
          <CardTitle className="text-xl text-foreground transition-colors duration-300 group-hover:text-white">
            {pillar.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground transition-colors duration-300 group-hover:text-white/90">
            {pillar.description}
          </p>
          {pillar.image && (
            <div className="mt-4 relative h-32 rounded-lg overflow-hidden">
              <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                className="object-cover"
                onError={(e) => {
                  if (pillar.image_fallback) {
                    (e.target as HTMLImageElement).src = pillar.image_fallback;
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );

  const renderPolicyPreview = (policy: PolicyElement) => (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <DynamicIcon 
              name={policy.icon || 'Award'}
              className="h-8 w-8 text-primary"
              fallbackIcon="Award"
            />
          </div>
          <div>
            <CardTitle className="text-lg">{policy.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-muted-foreground">{policy.description}</p>
        {policy.image && (
          <div className="mt-4 relative h-40 rounded-lg overflow-hidden">
            <Image
              src={policy.image}
              alt={policy.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                if (policy.image_fallback) {
                  (e.target as HTMLImageElement).src = policy.image_fallback;
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderServicePreview = (service: ServiceElement) => (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {service.image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              if (service.image_url_fallback) {
                (e.target as HTMLImageElement).src = service.image_url_fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}
      
      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          {service.icon_url && (
            <div className="flex-shrink-0">
              <Image
                src={service.icon_url}
                alt=""
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-muted-foreground line-clamp-3">
              {service.description}
            </p>
            {service.cta?.text && (
              <div className="mt-4">
                <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {service.cta.text}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectPreview = (project: ProjectElement) => (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      {project.image_url && (
        <div className="relative h-64 overflow-hidden">
          <Image
            src={project.image_url}
            alt={project.name || project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              if (project.image_url_fallback) {
                (e.target as HTMLImageElement).src = project.image_url_fallback;
              }
            }}
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {project.type}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{project.name || project.title}</h3>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <p className="text-muted-foreground">{project.description}</p>
      </CardContent>
    </Card>
  );

  const renderPreview = () => {
    switch (elementType) {
      case 'statistics':
        return renderStatisticPreview(element as StatisticElement);
      case 'pillars':
        return renderPillarPreview(element as PillarElement);
      case 'policies':
        return renderPolicyPreview(element as PolicyElement);
      case 'services':
        return renderServicePreview(element as ServiceElement);
      case 'projects':
        return renderProjectPreview(element as ProjectElement);
      default:
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Preview no disponible para este tipo de elemento.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Información del elemento */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">Información del Elemento</h4>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div>ID: <code className="bg-muted px-1 rounded">{element.id}</code></div>
                <div>Orden: {element.order || 'No definido'}</div>
                {element.enabled !== undefined && (
                  <div>Estado: {element.enabled ? 'Habilitado' : 'Deshabilitado'}</div>
                )}
              </div>
            </div>
            <Badge variant="outline">
              {elementType}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preview del elemento */}
      <div>
        <h4 className="font-medium mb-3">Vista Previa en el Sitio Web</h4>
        <div className="border-2 border-dashed border-muted p-4 rounded-lg bg-background">
          {renderPreview()}
        </div>
      </div>

      {/* Notas sobre el preview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Esta es una aproximación de cómo se verá el elemento en el sitio web. 
          El diseño final puede variar según el contexto y otros estilos aplicados.
        </AlertDescription>
      </Alert>
    </div>
  );
}