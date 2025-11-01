'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Video, 
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { MediaAssetSchema } from '@/lib/schemas/page-schemas';

// Types
type MediaAsset = z.infer<typeof MediaAssetSchema>;

interface ButtonConfig {
  text: string;
  href: string;
}

interface HeroConfig {
  title: string | { main: string; secondary?: string };
  subtitle?: string;
  description?: string;
  background?: MediaAsset;
  backgroundImage?: string; // Legacy support
  overlay?: boolean;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  metadata?: {
    stats?: string[];
    centerText?: string;
  };
}

interface UniversalHeroEditorProps {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
  onSave?: () => Promise<void>;
  onReset?: () => void;
  className?: string;
}

export default function UniversalHeroEditor({
  config,
  onChange,
  onSave,
  onReset,
  className = ''
}: UniversalHeroEditorProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Helper functions
  const updateConfig = (updates: Partial<HeroConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateBackground = (updates: Partial<MediaAsset>) => {
    const newBackground = { ...config.background, ...updates };
    updateConfig({ background: newBackground });
  };

  const updateTitle = (titleUpdate: string | { main: string; secondary?: string }) => {
    updateConfig({ title: titleUpdate });
  };

  const updateButton = (type: 'primary' | 'secondary', updates: Partial<ButtonConfig>) => {
    const currentButton = type === 'primary' ? config.primaryButton : config.secondaryButton;
    const newButton = { ...currentButton, ...updates };
    
    if (type === 'primary') {
      updateConfig({ primaryButton: newButton });
    } else {
      updateConfig({ secondaryButton: newButton });
    }
  };

  const updateMetadata = (updates: Partial<HeroConfig['metadata']>) => {
    const newMetadata = { ...config.metadata, ...updates };
    updateConfig({ metadata: newMetadata });
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave();
      toast({
        title: 'Guardado exitoso',
        description: 'La configuración del hero se ha guardado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la configuración. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast({
        title: 'Configuración restablecida',
        description: 'Se han restaurado los valores originales.',
      });
    }
  };

  const validateMedia = (url: string): { isValid: boolean; type: 'video' | 'image' | 'unknown' } => {
    if (!url) return { isValid: false, type: 'unknown' };
    
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const isVideo = videoExts.some(ext => url.toLowerCase().includes(ext));
    const isImage = imageExts.some(ext => url.toLowerCase().includes(ext));
    
    return {
      isValid: isVideo || isImage,
      type: isVideo ? 'video' : isImage ? 'image' : 'unknown'
    };
  };

  // Get title as string for editing
  const titleAsString = typeof config.title === 'string' ? config.title : config.title?.main || '';
  const titleSecondary = typeof config.title === 'string' ? '' : config.title?.secondary || '';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Editor Universal de Hero
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura títulos, medios de fondo (imágenes/videos) y botones de acción
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={!onReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={saving || !onSave}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="media">Medios</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título Principal *</Label>
                  <Input
                    id="title"
                    value={titleAsString}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Ej: Bienvenidos a Métrica FM"
                  />
                </div>

                <div>
                  <Label htmlFor="title-secondary">Título Secundario</Label>
                  <Input
                    id="title-secondary"
                    value={titleSecondary}
                    onChange={(e) => updateTitle({ main: titleAsString, secondary: e.target.value })}
                    placeholder="Ej: Dirección Integral de Proyectos"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={config.subtitle || ''}
                    onChange={(e) => updateConfig({ subtitle: e.target.value })}
                    placeholder="Ej: Liderando el sector construcción"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={config.description || ''}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="Descripción detallada del hero..."
                    rows={3}
                  />
                </div>

                {/* Metadata */}
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Metadatos Adicionales</h4>
                  
                  <div>
                    <Label htmlFor="center-text">Texto Central</Label>
                    <Input
                      id="center-text"
                      value={config.metadata?.centerText || ''}
                      onChange={(e) => updateMetadata({ centerText: e.target.value })}
                      placeholder="Texto que aparece en el centro del hero"
                    />
                  </div>

                  <div>
                    <Label>Estadísticas (separadas por comas)</Label>
                    <Textarea
                      value={config.metadata?.stats?.join(', ') || ''}
                      onChange={(e) => {
                        const stats = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        updateMetadata({ stats });
                      }}
                      placeholder="15 años de experiencia, 200+ proyectos, 95% satisfacción"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Configuración de Medios de Fondo</h4>
                  <Badge variant="outline">
                    {config.background?.type || 'Sin configurar'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="media-type">Tipo de Media</Label>
                    <Select
                      value={config.background?.type || 'image'}
                      onValueChange={(value: 'image' | 'video') => 
                        updateBackground({ type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Imagen
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="overlay-opacity">Opacidad del Overlay</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[config.background?.overlay_opacity || 0.4]}
                        onValueChange={([value]) => updateBackground({ overlay_opacity: value })}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {Math.round((config.background?.overlay_opacity || 0.4) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {config.background?.type === 'video' && (
                  <div>
                    <Label htmlFor="primary-video">URL del Video Principal</Label>
                    <Input
                      id="primary-video"
                      value={config.background?.primary_url || ''}
                      onChange={(e) => updateBackground({ primary_url: e.target.value })}
                      placeholder="https://ejemplo.com/video.mp4"
                    />
                    {config.background?.primary_url && (
                      <div className="mt-2">
                        {validateMedia(config.background.primary_url).isValid ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">URL de video válida</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">URL de video inválida</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="fallback-image">Imagen de Fallback *</Label>
                  <Input
                    id="fallback-image"
                    value={config.background?.fallback_url || config.backgroundImage || ''}
                    onChange={(e) => {
                      updateBackground({ fallback_url: e.target.value });
                      // Also update legacy backgroundImage for compatibility
                      updateConfig({ backgroundImage: e.target.value });
                    }}
                    placeholder="/images/hero-background.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta imagen se mostrará si el video falla o como imagen principal
                  </p>
                </div>

                {/* Media Preview */}
                {(config.background?.fallback_url || config.backgroundImage) && (
                  <div className="space-y-2">
                    <Label>Vista Previa</Label>
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={config.background?.fallback_url || config.backgroundImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-black"
                        style={{ opacity: config.background?.overlay_opacity || 0.4 }}
                      />
                    </div>
                  </div>
                )}

                {/* Overlay toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="overlay">Mostrar Overlay</Label>
                    <p className="text-xs text-muted-foreground">
                      Capa semitransparente sobre el fondo
                    </p>
                  </div>
                  <Switch
                    id="overlay"
                    checked={config.overlay !== false}
                    onCheckedChange={(checked) => updateConfig({ overlay: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="space-y-6">
              <div className="space-y-6">
                {/* Primary Button */}
                <div className="space-y-4">
                  <h4 className="font-medium">Botón Principal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-text">Texto del Botón</Label>
                      <Input
                        id="primary-text"
                        value={config.primaryButton?.text || ''}
                        onChange={(e) => updateButton('primary', { text: e.target.value })}
                        placeholder="Ver Servicios"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primary-href">Enlace</Label>
                      <Input
                        id="primary-href"
                        value={config.primaryButton?.href || ''}
                        onChange={(e) => updateButton('primary', { href: e.target.value })}
                        placeholder="/services"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Secondary Button */}
                <div className="space-y-4">
                  <h4 className="font-medium">Botón Secundario</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondary-text">Texto del Botón</Label>
                      <Input
                        id="secondary-text"
                        value={config.secondaryButton?.text || ''}
                        onChange={(e) => updateButton('secondary', { text: e.target.value })}
                        placeholder="Contactar"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary-href">Enlace</Label>
                      <Input
                        id="secondary-href"
                        value={config.secondaryButton?.href || ''}
                        onChange={(e) => updateButton('secondary', { href: e.target.value })}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview buttons */}
                {(config.primaryButton?.text || config.secondaryButton?.text) && (
                  <div className="space-y-2">
                    <Label>Vista Previa de Botones</Label>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      {config.primaryButton?.text && (
                        <Button>
                          {config.primaryButton.text}
                        </Button>
                      )}
                      {config.secondaryButton?.text && (
                        <Button variant="outline">
                          {config.secondaryButton.text}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}