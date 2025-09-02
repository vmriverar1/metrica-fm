'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, Eye } from 'lucide-react';
import apiClient from '@/lib/api-client';
import EnhancedStatisticsManager from './enhanced/EnhancedStatisticsManager';

interface HomePageData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: {
      main: string;
      secondary: string;
    };
    subtitle: string;
    background: {
      video_url: string;
      video_url_fallback: string;
      image_fallback: string;
      image_fallback_internal: string;
      overlay_opacity: number;
    };
    rotating_words: string[];
    transition_text: string;
    cta: {
      text: string;
      target: string;
    };
  };
  stats: {
    statistics: Array<{
      id: string;
      icon: string;
      value: number;
      suffix: string;
      label: string;
      description: string;
    }>;
  };
}

interface HomePageEditorProps {
  className?: string;
}

export const HomePageEditor: React.FC<HomePageEditorProps> = ({ className }) => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/pages/home');
      if (response.success && response.data.content) {
        setData(response.data.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiClient.put('/api/admin/pages/home', {
        content: data
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateData = (path: string, value: any) => {
    if (!data) return;
    
    const pathArray = path.split('.');
    const newData = { ...data };
    let current: any = newData;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      const key = pathArray[i];
      if (key.includes('[') && key.includes(']')) {
        const [arrayKey, indexStr] = key.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        current = current[arrayKey][index];
      } else {
        current = current[key];
      }
    }
    
    const finalKey = pathArray[pathArray.length - 1];
    if (finalKey.includes('[') && finalKey.includes(']')) {
      const [arrayKey, indexStr] = finalKey.split('[');
      const index = parseInt(indexStr.replace(']', ''));
      current[arrayKey][index] = value;
    } else {
      current[finalKey] = value;
    }
    
    setData(newData);
  };

  const addRotatingWord = () => {
    if (!data) return;
    const newWords = [...data.hero.rotating_words, ''];
    updateData('hero.rotating_words', newWords);
  };

  const removeRotatingWord = (index: number) => {
    if (!data) return;
    const newWords = data.hero.rotating_words.filter((_, i) => i !== index);
    updateData('hero.rotating_words', newWords);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos de la página principal...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error al cargar los datos de la página principal</p>
        <Button onClick={fetchHomeData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor de Página Principal</h2>
          <p className="text-gray-600">Configura el contenido de la página de inicio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Vista previa
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">¡Cambios guardados exitosamente!</p>
        </div>
      )}

      {/* Formulario en pestañas */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* Pestaña General */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-title">Título de la página (SEO)</Label>
                <Input
                  id="page-title"
                  value={data.page.title}
                  onChange={(e) => updateData('page.title', e.target.value)}
                  placeholder="Título que aparece en el navegador"
                />
              </div>
              <div>
                <Label htmlFor="page-description">Descripción (SEO)</Label>
                <Textarea
                  id="page-description"
                  value={data.page.description}
                  onChange={(e) => updateData('page.description', e.target.value)}
                  placeholder="Descripción para motores de búsqueda"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Hero */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero-title-main">Título Principal</Label>
                  <Input
                    id="hero-title-main"
                    value={data.hero.title.main}
                    onChange={(e) => updateData('hero.title.main', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-title-secondary">Título Secundario</Label>
                  <Input
                    id="hero-title-secondary"
                    value={data.hero.title.secondary}
                    onChange={(e) => updateData('hero.title.secondary', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <Input
                  id="hero-subtitle"
                  value={data.hero.subtitle}
                  onChange={(e) => updateData('hero.subtitle', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="hero-transition">Texto de transición</Label>
                <Textarea
                  id="hero-transition"
                  value={data.hero.transition_text}
                  onChange={(e) => updateData('hero.transition_text', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Palabras rotatorias */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Palabras rotatorias</Label>
                  <Button size="sm" onClick={addRotatingWord}>Agregar palabra</Button>
                </div>
                <div className="space-y-2">
                  {data.hero.rotating_words.map((word, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={word}
                        onChange={(e) => updateData(`hero.rotating_words[${index}]`, e.target.value)}
                        placeholder="Palabra rotatoria"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRotatingWord(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta-text">Texto del botón</Label>
                  <Input
                    id="cta-text"
                    value={data.hero.cta.text}
                    onChange={(e) => updateData('hero.cta.text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cta-target">Enlace del botón</Label>
                  <Input
                    id="cta-target"
                    value={data.hero.cta.target}
                    onChange={(e) => updateData('hero.cta.target', e.target.value)}
                    placeholder="#seccion o /pagina"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de fondo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bg-video">URL del video principal</Label>
                <Input
                  id="bg-video"
                  value={data.hero.background.video_url}
                  onChange={(e) => updateData('hero.background.video_url', e.target.value)}
                  placeholder="https://ejemplo.com/video.mp4"
                />
              </div>
              <div>
                <Label htmlFor="bg-video-fallback">URL del video de respaldo</Label>
                <Input
                  id="bg-video-fallback"
                  value={data.hero.background.video_url_fallback}
                  onChange={(e) => updateData('hero.background.video_url_fallback', e.target.value)}
                  placeholder="/video/respaldo.mp4"
                />
              </div>
              <div>
                <Label htmlFor="bg-image">Imagen de respaldo</Label>
                <Input
                  id="bg-image"
                  value={data.hero.background.image_fallback}
                  onChange={(e) => updateData('hero.background.image_fallback', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div>
                <Label htmlFor="overlay-opacity">Opacidad del overlay (0-1)</Label>
                <Input
                  id="overlay-opacity"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={data.hero.background.overlay_opacity}
                  onChange={(e) => updateData('hero.background.overlay_opacity', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Estadísticas */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Mejoradas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sistema avanzado con drag & drop, validaciones en tiempo real y preview
              </p>
            </CardHeader>
            <CardContent>
              <EnhancedStatisticsManager
                statistics={data.stats.statistics}
                onChange={(newStats) => updateData('stats.statistics', newStats)}
                onSave={handleSave}
                loading={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Avanzado */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};