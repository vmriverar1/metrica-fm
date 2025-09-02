'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/utils';

interface MegaMenuSubLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  enabled: boolean;
  is_internal: boolean;
  page_mapping: string;
  order: number;
  click_count: number;
}

interface MegaMenuItem {
  id: string;
  order: number;
  enabled: boolean;
  type: 'megamenu' | 'simple';
  label: string;
  href?: string | null;
  icon: string;
  description: string;
  is_internal?: boolean;
  page_mapping?: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  submenu?: {
    layout: string;
    section1: {
      title: string;
      description: string;
      highlight_color: string;
    };
    links: MegaMenuSubLink[];
    section3: {
      type: string;
      title: string;
      description: string;
      image: string;
      cta: {
        text: string;
        href: string;
        type: string;
        page_mapping?: string;
      };
      background_gradient: string;
    };
  };
}

interface MegaMenuPreviewProps {
  item: MegaMenuItem;
  className?: string;
  showDeviceToggle?: boolean;
  showInteractions?: boolean;
}

const MegaMenuPreview: React.FC<MegaMenuPreviewProps> = ({
  item,
  className,
  showDeviceToggle = true,
  showInteractions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  const getHighlightColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'accent': return 'text-accent';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'red': return 'text-red-600';
      case 'yellow': return 'text-yellow-600';
      default: return 'text-primary';
    }
  };

  const getGradientClass = (gradient: string) => {
    return `bg-gradient-to-br ${gradient}`;
  };

  const handleLinkClick = (linkId: string) => {
    if (showInteractions) {
      setClickedLinks(prev => new Set([...prev, linkId]));
      
      // Remover el efecto después de 1 segundo
      setTimeout(() => {
        setClickedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(linkId);
          return newSet;
        });
      }, 1000);
    }
  };

  const deviceDimensions = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-full max-w-2xl',
    mobile: 'w-full max-w-sm'
  };

  const PreviewContent = () => (
    <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
      {/* Barra de navegación simulada */}
      <div className="bg-gradient-to-r from-primary to-accent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="font-bold">Métrica DIP</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-white/10 transition-all duration-200",
                  isHovered && item.type === 'megamenu' && "bg-white/10"
                )}
              >
                <DynamicIcon name={item.icon} className="h-4 w-4 mr-2" />
                {item.label}
                {item.type === 'megamenu' && (
                  <ChevronDown className={cn(
                    "ml-1 h-3 w-3 transition-transform duration-200",
                    isHovered && "rotate-180"
                  )} />
                )}
              </Button>
              
              {/* Dropdown del megamenu */}
              {item.type === 'megamenu' && isHovered && item.submenu && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
                  <div className="w-screen max-w-4xl bg-white rounded-lg shadow-2xl border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-8">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Primera columna - Información */}
                        <div className="space-y-4">
                          <h3 className={cn(
                            "text-2xl font-bold",
                            getHighlightColorClass(item.submenu.section1.highlight_color)
                          )}>
                            {item.submenu.section1.title || 'Título Principal'}
                          </h3>
                          <p className="text-base text-gray-600 leading-relaxed">
                            {item.submenu.section1.description || 'Descripción del menú principal que aparecerá en la primera columna.'}
                          </p>
                        </div>
                        
                        {/* Segunda columna - Enlaces */}
                        <div className="space-y-2">
                          {item.submenu.links.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <DynamicIcon name="Link" className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Sin enlaces configurados</p>
                            </div>
                          ) : (
                            item.submenu.links
                              .filter(link => link.enabled)
                              .sort((a, b) => a.order - b.order)
                              .map((link) => (
                                <div
                                  key={link.id}
                                  onClick={() => handleLinkClick(link.id)}
                                  className={cn(
                                    "block select-none rounded-lg px-4 py-3 transition-all cursor-pointer group",
                                    "hover:bg-accent hover:text-white hover:translate-x-1",
                                    clickedLinks.has(link.id) && "bg-green-100 scale-105"
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <DynamicIcon 
                                      name={link.icon} 
                                      className="h-4 w-4 mt-0.5 text-gray-600 group-hover:text-white" 
                                    />
                                    <div>
                                      <div className="text-sm font-semibold leading-none text-gray-900 group-hover:text-white">
                                        {link.title}
                                      </div>
                                      {link.description && (
                                        <p className="line-clamp-2 text-sm leading-snug text-gray-600 mt-1 group-hover:text-white/90">
                                          {link.description}
                                        </p>
                                      )}
                                      {!link.is_internal && (
                                        <ExternalLink className="h-3 w-3 inline-block ml-1 opacity-60" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                        
                        {/* Tercera columna - Promocional */}
                        <div className="relative">
                          <div className={cn(
                            "relative h-full min-h-[200px] rounded-xl overflow-hidden group cursor-pointer",
                            getGradientClass(item.submenu.section3.background_gradient || 'from-primary/20 to-accent/20')
                          )}>
                            {/* Imagen de fondo simulada */}
                            {item.submenu.section3.image ? (
                              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                                <div className="text-center">
                                  <DynamicIcon name="Image" className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                                  <p className="text-xs text-gray-600">
                                    {item.submenu.section3.image.split('/').pop()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <DynamicIcon name="ImageIcon" className="h-16 w-16 text-white/30" />
                              </div>
                            )}
                            
                            {/* Gradiente overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            
                            {/* Contenido promocional */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform group-hover:translate-y-[-4px]">
                              <h4 className="text-lg font-bold mb-2">
                                {item.submenu.section3.title || '¿Necesitas ayuda?'}
                              </h4>
                              <p className="text-sm leading-relaxed opacity-90 mb-4">
                                {item.submenu.section3.description || 'Descripción promocional que invita a la acción.'}
                              </p>
                              {item.submenu.section3.cta && (
                                <div className="inline-block">
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                  >
                                    {item.submenu.section3.cta.text || 'Saber más'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Otros menús simulados */}
            <Button variant="ghost" className="text-white/70 hover:bg-white/10">
              Portafolio
            </Button>
            <Button variant="ghost" className="text-white/70 hover:bg-white/10">
              Nosotros
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Área de contenido simulada */}
      <div className="p-8 bg-gray-50 min-h-[200px]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Vista Previa del Menú
            </h2>
            <p className="text-gray-600 mb-6">
              Pasa el cursor sobre "{item.label}" en la navegación para ver el menú en acción
            </p>
            
            {/* Información del menú */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DynamicIcon name={item.icon} className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge variant={item.enabled ? "default" : "secondary"}>
                    {item.enabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium">
                      {item.type === 'megamenu' ? 'MegaMenu' : 'Menú Simple'}
                    </span>
                  </div>
                  {item.type === 'megamenu' && item.submenu && (
                    <div className="flex justify-between">
                      <span>Enlaces:</span>
                      <span className="font-medium">{item.submenu.links.length}</span>
                    </div>
                  )}
                  {item.href && (
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span className="font-medium truncate ml-2">{item.href}</span>
                    </div>
                  )}
                </div>
                
                {showInteractions && clickedLinks.size > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">¡Enlace clickeado!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selector de dispositivo */}
      {showDeviceToggle && (
        <Tabs value={device} onValueChange={(value: any) => setDevice(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Escritorio
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-2">
              <Tablet className="h-4 w-4" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Móvil
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop">
            <div className={deviceDimensions.desktop}>
              <PreviewContent />
            </div>
          </TabsContent>
          
          <TabsContent value="tablet">
            <div className={deviceDimensions.tablet}>
              <PreviewContent />
            </div>
          </TabsContent>
          
          <TabsContent value="mobile">
            <div className={deviceDimensions.mobile}>
              <div className="text-center p-4 text-muted-foreground text-sm">
                📱 En móvil, los megamenús se muestran como menú hamburguesa
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {!showDeviceToggle && (
        <div className={deviceDimensions[device]}>
          <PreviewContent />
        </div>
      )}
    </div>
  );
};

export default MegaMenuPreview;