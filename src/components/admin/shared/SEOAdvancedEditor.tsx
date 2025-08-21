'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search,
  Globe,
  Share2,
  Eye,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';

export interface SEOData {
  // Básico
  title: string;
  description: string;
  keywords?: string[];
  canonical_url?: string;
  
  // Open Graph
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  og_locale?: string;
  og_site_name?: string;
  
  // Twitter Card
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_creator?: string;
  twitter_site?: string;
  
  // Schema.org
  schema_type?: string;
  schema_data?: Record<string, any>;
  
  // Técnico
  robots?: string;
  viewport?: string;
  language?: string;
  geo_region?: string;
  geo_placename?: string;
  
  // Analytics
  google_analytics?: string;
  facebook_pixel?: string;
  google_tag_manager?: string;
}

interface SEOAdvancedEditorProps {
  data: SEOData;
  onChange: (data: SEOData) => void;
  contextType?: 'blog' | 'services' | 'portfolio' | 'contact' | 'general';
  siteName?: string;
  siteUrl?: string;
  showAnalytics?: boolean;
  showSchema?: boolean;
  showPreview?: boolean;
  validation?: {
    titleMinLength?: number;
    titleMaxLength?: number;
    descriptionMinLength?: number;
    descriptionMaxLength?: number;
    keywordsMax?: number;
  };
}

export const SEOAdvancedEditor: React.FC<SEOAdvancedEditorProps> = ({
  data,
  onChange,
  contextType = 'general',
  siteName = 'Métrica DIP',
  siteUrl = 'https://metrica-dip.com',
  showAnalytics = true,
  showSchema = true,
  showPreview = true,
  validation = {
    titleMinLength: 10,
    titleMaxLength: 60,
    descriptionMinLength: 120,
    descriptionMaxLength: 160,
    keywordsMax: 10
  }
}) => {
  const [seoScore, setSeoScore] = useState(0);
  const [seoIssues, setSeoIssues] = useState<string[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Calcular score SEO automáticamente
  useEffect(() => {
    calculateSEOScore();
  }, [data]);

  const calculateSEOScore = () => {
    let score = 0;
    const issues: string[] = [];

    // Título (25 puntos)
    if (data.title) {
      if (data.title.length >= validation.titleMinLength! && data.title.length <= validation.titleMaxLength!) {
        score += 25;
      } else {
        issues.push(`Título debe tener entre ${validation.titleMinLength}-${validation.titleMaxLength} caracteres`);
      }
    } else {
      issues.push('Título requerido');
    }

    // Descripción (25 puntos)
    if (data.description) {
      if (data.description.length >= validation.descriptionMinLength! && data.description.length <= validation.descriptionMaxLength!) {
        score += 25;
      } else {
        issues.push(`Descripción debe tener entre ${validation.descriptionMinLength}-${validation.descriptionMaxLength} caracteres`);
      }
    } else {
      issues.push('Descripción requerida');
    }

    // Keywords (10 puntos)
    if (data.keywords && data.keywords.length > 0) {
      score += 10;
      if (data.keywords.length > validation.keywordsMax!) {
        issues.push(`Máximo ${validation.keywordsMax} keywords recomendadas`);
      }
    } else {
      issues.push('Keywords recomendadas');
    }

    // Open Graph (20 puntos)
    if (data.og_title && data.og_description && data.og_image) {
      score += 20;
    } else {
      issues.push('Open Graph incompleto (título, descripción, imagen)');
    }

    // Twitter Card (10 puntos)
    if (data.twitter_card && data.twitter_title && data.twitter_description) {
      score += 10;
    } else {
      issues.push('Twitter Card incompleto');
    }

    // Schema.org (10 puntos)
    if (showSchema && data.schema_type && data.schema_data) {
      score += 10;
    } else if (showSchema) {
      issues.push('Schema.org recomendado');
    }

    setSeoScore(score);
    setSeoIssues(issues);
  };

  const handleFieldChange = (field: keyof SEOData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    handleFieldChange('keywords', keywords);
  };

  const applyContextDefaults = () => {
    const defaults = getDefaultsByContext(contextType);
    onChange({
      ...data,
      ...defaults
    });
  };

  const getDefaultsByContext = (context: string) => {
    const defaults = {
      blog: {
        og_type: 'article',
        twitter_card: 'summary_large_image' as const,
        schema_type: 'Article',
        robots: 'index, follow'
      },
      services: {
        og_type: 'website',
        twitter_card: 'summary' as const,
        schema_type: 'Service',
        robots: 'index, follow'
      },
      portfolio: {
        og_type: 'website',
        twitter_card: 'summary_large_image' as const,
        schema_type: 'CreativeWork',
        robots: 'index, follow'
      },
      contact: {
        og_type: 'website',
        twitter_card: 'summary' as const,
        schema_type: 'ContactPage',
        robots: 'index, follow'
      }
    };
    return defaults[context as keyof typeof defaults] || defaults.blog;
  };

  const generateSchemaData = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': data.schema_type || 'WebPage',
      name: data.title,
      description: data.description,
      url: data.canonical_url || siteUrl
    };

    if (contextType === 'contact') {
      return {
        ...baseSchema,
        '@type': 'ContactPage',
        mainEntity: {
          '@type': 'Organization',
          name: siteName,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'PE',
            addressRegion: 'Lima'
          }
        }
      };
    }

    return baseSchema;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Avanzado
            <div className="flex items-center gap-2">
              <Progress value={seoScore} className="w-20" />
              <Badge variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}>
                {seoScore}%
              </Badge>
            </div>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={applyContextDefaults}
            >
              <Target className="w-4 h-4 mr-2" />
              Aplicar Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={calculateSEOScore}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalcular
            </Button>
          </div>
        </div>

        {/* SEO Issues */}
        {seoIssues.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Mejoras recomendadas:</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {seoIssues.map((issue, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
            {showSchema && <TabsTrigger value="schema">Schema</TabsTrigger>}
            {showPreview && <TabsTrigger value="preview">Preview</TabsTrigger>}
          </TabsList>

          {/* Tab Básico */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Título SEO *</label>
                <span className={`text-xs ${data.title?.length > validation.titleMaxLength! ? 'text-red-500' : 'text-gray-500'}`}>
                  {data.title?.length || 0}/{validation.titleMaxLength}
                </span>
              </div>
              <Input
                value={data.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Título optimizado para SEO"
                maxLength={validation.titleMaxLength}
              />
              <p className="text-xs text-gray-500 mt-1">
                Aparece en pestañas del navegador y resultados de búsqueda
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Descripción SEO *</label>
                <span className={`text-xs ${data.description?.length > validation.descriptionMaxLength! ? 'text-red-500' : 'text-gray-500'}`}>
                  {data.description?.length || 0}/{validation.descriptionMaxLength}
                </span>
              </div>
              <Textarea
                value={data.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Descripción que aparece en resultados de búsqueda"
                maxLength={validation.descriptionMaxLength}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Meta descripción que aparece bajo el título en Google
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Keywords</label>
              <Input
                value={data.keywords?.join(', ') || ''}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                placeholder="palabra1, palabra2, palabra3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las palabras clave con comas (máximo {validation.keywordsMax})
              </p>
              {data.keywords && data.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">URL Canónica</label>
              <Input
                value={data.canonical_url || ''}
                onChange={(e) => handleFieldChange('canonical_url', e.target.value)}
                placeholder={`${siteUrl}/ejemplo`}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL principal de esta página (previene contenido duplicado)
              </p>
            </div>
          </TabsContent>

          {/* Tab Social */}
          <TabsContent value="social" className="space-y-6">
            {/* Open Graph */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Open Graph (Facebook, LinkedIn)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">OG Título</label>
                  <Input
                    value={data.og_title || ''}
                    onChange={(e) => handleFieldChange('og_title', e.target.value)}
                    placeholder={data.title || 'Título para redes sociales'}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">OG Tipo</label>
                  <select
                    value={data.og_type || 'website'}
                    onChange={(e) => handleFieldChange('og_type', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="product">Product</option>
                    <option value="profile">Profile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">OG Descripción</label>
                <Textarea
                  value={data.og_description || ''}
                  onChange={(e) => handleFieldChange('og_description', e.target.value)}
                  placeholder={data.description || 'Descripción para redes sociales'}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">OG Imagen</label>
                <Input
                  value={data.og_image || ''}
                  onChange={(e) => handleFieldChange('og_image', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 1200x630px, formato JPG/PNG
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">OG Sitio</label>
                  <Input
                    value={data.og_site_name || siteName}
                    onChange={(e) => handleFieldChange('og_site_name', e.target.value)}
                    placeholder={siteName}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">OG Locale</label>
                  <Input
                    value={data.og_locale || 'es_PE'}
                    onChange={(e) => handleFieldChange('og_locale', e.target.value)}
                    placeholder="es_PE"
                  />
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Twitter Card</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Card Type</label>
                  <select
                    value={data.twitter_card || 'summary'}
                    onChange={(e) => handleFieldChange('twitter_card', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Twitter Site</label>
                  <Input
                    value={data.twitter_site || ''}
                    onChange={(e) => handleFieldChange('twitter_site', e.target.value)}
                    placeholder="@metricadip"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Twitter Título</label>
                <Input
                  value={data.twitter_title || ''}
                  onChange={(e) => handleFieldChange('twitter_title', e.target.value)}
                  placeholder={data.title || 'Título para Twitter'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Twitter Descripción</label>
                <Textarea
                  value={data.twitter_description || ''}
                  onChange={(e) => handleFieldChange('twitter_description', e.target.value)}
                  placeholder={data.description || 'Descripción para Twitter'}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Twitter Imagen</label>
                <Input
                  value={data.twitter_image || ''}
                  onChange={(e) => handleFieldChange('twitter_image', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab Técnico */}
          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Robots</label>
                <select
                  value={data.robots || 'index, follow'}
                  onChange={(e) => handleFieldChange('robots', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="index, follow">Index, Follow</option>
                  <option value="noindex, follow">NoIndex, Follow</option>
                  <option value="index, nofollow">Index, NoFollow</option>
                  <option value="noindex, nofollow">NoIndex, NoFollow</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Idioma</label>
                <select
                  value={data.language || 'es'}
                  onChange={(e) => handleFieldChange('language', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Viewport</label>
              <Input
                value={data.viewport || 'width=device-width, initial-scale=1'}
                onChange={(e) => handleFieldChange('viewport', e.target.value)}
                placeholder="width=device-width, initial-scale=1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Geo Región</label>
                <Input
                  value={data.geo_region || ''}
                  onChange={(e) => handleFieldChange('geo_region', e.target.value)}
                  placeholder="PE-LIM"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Geo Ubicación</label>
                <Input
                  value={data.geo_placename || ''}
                  onChange={(e) => handleFieldChange('geo_placename', e.target.value)}
                  placeholder="Lima, Perú"
                />
              </div>
            </div>

            {showAnalytics && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Analytics & Tracking</h3>
                
                <div>
                  <label className="text-sm font-medium">Google Analytics ID</label>
                  <Input
                    value={data.google_analytics || ''}
                    onChange={(e) => handleFieldChange('google_analytics', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Google Tag Manager</label>
                  <Input
                    value={data.google_tag_manager || ''}
                    onChange={(e) => handleFieldChange('google_tag_manager', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Facebook Pixel</label>
                  <Input
                    value={data.facebook_pixel || ''}
                    onChange={(e) => handleFieldChange('facebook_pixel', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab Schema */}
          {showSchema && (
            <TabsContent value="schema" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Schema.org Structured Data</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFieldChange('schema_data', generateSchemaData())}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generar Auto
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Schema Type</label>
                <select
                  value={data.schema_type || 'WebPage'}
                  onChange={(e) => handleFieldChange('schema_type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="WebPage">WebPage</option>
                  <option value="Article">Article</option>
                  <option value="Service">Service</option>
                  <option value="Organization">Organization</option>
                  <option value="ContactPage">ContactPage</option>
                  <option value="CreativeWork">CreativeWork</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Schema Data (JSON-LD)</label>
                <Textarea
                  value={JSON.stringify(data.schema_data || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleFieldChange('schema_data', parsed);
                    } catch (err) {
                      // Ignore parse errors while typing
                    }
                  }}
                  placeholder="{ }"
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(data.schema_data, null, 2))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Probar en Google
                    </Button>
                  </a>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Tab Preview */}
          {showPreview && (
            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Vista Previa</h3>
                <div className="flex gap-2">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>

              {/* Google Search Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Google Search Results</h4>
                <div className={`border rounded-lg p-4 ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
                  <div className="text-xs text-green-700 mb-1">
                    {data.canonical_url || siteUrl}
                  </div>
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {data.title || 'Título de la página'}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {data.description || 'Descripción de la página que aparece en los resultados de búsqueda...'}
                  </div>
                </div>
              </div>

              {/* Facebook Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Facebook/LinkedIn Share</h4>
                <div className={`border rounded-lg overflow-hidden ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-lg'}`}>
                  {data.og_image && (
                    <div className="bg-gray-200 h-48 flex items-center justify-center">
                      <img 
                        src={data.og_image} 
                        alt="OG Preview" 
                        className="max-h-full max-w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      {new URL(data.canonical_url || siteUrl).hostname}
                    </div>
                    <div className="font-semibold mb-1">
                      {data.og_title || data.title || 'Título de la página'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {data.og_description || data.description || 'Descripción de la página...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Twitter Card</h4>
                <div className={`border rounded-lg overflow-hidden ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-lg'}`}>
                  {data.twitter_image && data.twitter_card === 'summary_large_image' && (
                    <div className="bg-gray-200 h-48 flex items-center justify-center">
                      <img 
                        src={data.twitter_image} 
                        alt="Twitter Preview" 
                        className="max-h-full max-w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="font-semibold mb-1">
                      {data.twitter_title || data.title || 'Título de la página'}
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                      {data.twitter_description || data.description || 'Descripción de la página...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      🔗 {new URL(data.canonical_url || siteUrl).hostname}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};