'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Copy,
  Eye,
  EyeOff,
  Share2,
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  ExternalLink
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export interface SocialPlatform {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok' | 'website' | 'custom';
  url: string;
  username?: string;
  status: 'active' | 'inactive' | 'pending';
  order: number;
  metrics?: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement_rate?: number;
    last_post_date?: string;
  };
  display_settings: {
    show_follower_count: boolean;
    show_engagement_rate: boolean;
    show_recent_posts: boolean;
    show_on_footer: boolean;
    show_on_contact: boolean;
    icon_style: 'default' | 'outline' | 'filled' | 'brand';
    custom_icon?: string;
  };
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    verified?: boolean;
    business_account?: boolean;
  };
}

export interface SocialMetric {
  id: string;
  title: string;
  platform: string;
  metric_type: 'followers' | 'engagement' | 'reach' | 'impressions' | 'clicks' | 'shares' | 'comments' | 'likes' | 'custom';
  value: string;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trend_percentage?: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total';
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  status: 'visible' | 'hidden';
  last_updated?: string;
}

export interface SocialCampaign {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused' | 'planned';
  budget?: number;
  currency?: string;
  objectives: string[];
  target_audience?: string;
  hashtags?: string[];
  metrics?: {
    reach?: number;
    impressions?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
  };
  content_links?: Array<{
    platform: string;
    url: string;
    post_type: 'image' | 'video' | 'carousel' | 'story' | 'reel';
  }>;
  order: number;
  featured: boolean;
}

interface SocialMetricsEditorProps {
  platforms: SocialPlatform[];
  metrics: SocialMetric[];
  campaigns: SocialCampaign[];
  onPlatformsChange: (platforms: SocialPlatform[]) => void;
  onMetricsChange: (metrics: SocialMetric[]) => void;
  onCampaignsChange: (campaigns: SocialCampaign[]) => void;
  allowReordering?: boolean;
  contextType?: 'compromiso' | 'cultura' | 'iso' | 'general';
  showPreview?: boolean;
  maxPlatforms?: number;
  maxMetrics?: number;
  templates?: any[];
}

export const SocialMetricsEditor: React.FC<SocialMetricsEditorProps> = ({
  platforms = [],
  metrics = [],
  campaigns = [],
  onPlatformsChange,
  onMetricsChange,
  onCampaignsChange,
  allowReordering = true,
  contextType = 'general',
  showPreview = true,
  maxPlatforms = 20,
  maxMetrics = 15,
  templates = []
}) => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [newPlatform, setNewPlatform] = useState<Partial<SocialPlatform>>({
    name: '',
    platform: 'facebook',
    url: '',
    status: 'active',
    display_settings: {
      show_follower_count: true,
      show_engagement_rate: false,
      show_recent_posts: false,
      show_on_footer: true,
      show_on_contact: false,
      icon_style: 'default'
    }
  });

  const [newMetric, setNewMetric] = useState<Partial<SocialMetric>>({
    title: '',
    platform: 'facebook',
    metric_type: 'followers',
    value: '',
    trend: 'up',
    period: 'monthly',
    status: 'visible'
  });

  // Iconos de plataformas
  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
    website: Globe,
    custom: Share2
  };

  const platformColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    website: '#6B7280',
    custom: '#8B5CF6'
  };

  // Agregar nueva plataforma
  const handleAddPlatform = () => {
    if (!newPlatform.name?.trim() || !newPlatform.url?.trim()) return;

    const id = Date.now().toString();
    const platform: SocialPlatform = {
      id,
      name: newPlatform.name.trim(),
      platform: newPlatform.platform || 'facebook',
      url: newPlatform.url.trim(),
      username: newPlatform.username?.trim() || '',
      status: newPlatform.status || 'active',
      order: platforms.length,
      display_settings: {
        show_follower_count: true,
        show_engagement_rate: false,
        show_recent_posts: false,
        show_on_footer: true,
        show_on_contact: false,
        icon_style: 'default',
        ...newPlatform.display_settings
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin',
        verified: false,
        business_account: false
      }
    };

    onPlatformsChange([...platforms, platform]);
    setNewPlatform({
      name: '',
      platform: 'facebook',
      url: '',
      status: 'active',
      display_settings: {
        show_follower_count: true,
        show_engagement_rate: false,
        show_recent_posts: false,
        show_on_footer: true,
        show_on_contact: false,
        icon_style: 'default'
      }
    });
    setShowAddForm(false);
  };

  // Agregar nueva métrica
  const handleAddMetric = () => {
    if (!newMetric.title?.trim() || !newMetric.value?.trim()) return;

    const id = Date.now().toString();
    const metric: SocialMetric = {
      id,
      title: newMetric.title.trim(),
      platform: newMetric.platform || 'facebook',
      metric_type: newMetric.metric_type || 'followers',
      value: newMetric.value.trim(),
      unit: newMetric.unit?.trim() || '',
      trend: newMetric.trend || 'up',
      trend_percentage: newMetric.trend_percentage || 0,
      period: newMetric.period || 'monthly',
      description: newMetric.description?.trim() || '',
      order: metrics.length,
      status: newMetric.status || 'visible',
      last_updated: new Date().toISOString()
    };

    onMetricsChange([...metrics, metric]);
    setNewMetric({
      title: '',
      platform: 'facebook',
      metric_type: 'followers',
      value: '',
      trend: 'up',
      period: 'monthly',
      status: 'visible'
    });
    setShowAddForm(false);
  };

  // Actualizar plataforma
  const handleUpdatePlatform = (id: string, updates: Partial<SocialPlatform>) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === id 
        ? { 
            ...platform, 
            ...updates,
            metadata: {
              ...platform.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : platform
    );
    onPlatformsChange(updatedPlatforms);
    setEditingId(null);
  };

  // Actualizar métrica
  const handleUpdateMetric = (id: string, updates: Partial<SocialMetric>) => {
    const updatedMetrics = metrics.map(metric => 
      metric.id === id 
        ? { 
            ...metric, 
            ...updates,
            last_updated: new Date().toISOString()
          }
        : metric
    );
    onMetricsChange(updatedMetrics);
    setEditingId(null);
  };

  // Eliminar plataforma
  const handleDeletePlatform = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta plataforma?')) {
      const updatedPlatforms = platforms.filter(platform => platform.id !== id);
      onPlatformsChange(updatedPlatforms);
    }
  };

  // Eliminar métrica
  const handleDeleteMetric = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta métrica?')) {
      const updatedMetrics = metrics.filter(metric => metric.id !== id);
      onMetricsChange(updatedMetrics);
    }
  };

  // Toggle visibilidad
  const togglePlatformVisibility = (id: string) => {
    const platform = platforms.find(p => p.id === id);
    if (platform) {
      handleUpdatePlatform(id, {
        status: platform.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  const toggleMetricVisibility = (id: string) => {
    const metric = metrics.find(m => m.id === id);
    if (metric) {
      handleUpdateMetric(id, {
        status: metric.status === 'visible' ? 'hidden' : 'visible'
      });
    }
  };

  // Toggle expansión
  const toggleItemExpansion = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Reordenar (drag & drop)
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    if (activeTab === 'platforms') {
      const items = Array.from(platforms);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      const reorderedPlatforms = items.map((item, index) => ({
        ...item,
        order: index
      }));

      onPlatformsChange(reorderedPlatforms);
    } else if (activeTab === 'metrics') {
      const items = Array.from(metrics);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      const reorderedMetrics = items.map((item, index) => ({
        ...item,
        order: index
      }));

      onMetricsChange(reorderedMetrics);
    }
  };

  // Obtener templates por contexto
  const getContextTemplates = () => {
    const contextTemplates = {
      compromiso: [
        {
          type: 'platform',
          name: 'LinkedIn Corporativo',
          platform: 'linkedin',
          url: 'https://linkedin.com/company/metrica-dip',
          display_settings: { show_follower_count: true, show_on_footer: true }
        },
        {
          type: 'platform',
          name: 'Facebook Responsabilidad Social',
          platform: 'facebook',
          url: 'https://facebook.com/metricadip.responsabilidad',
          display_settings: { show_recent_posts: true, show_on_contact: true }
        }
      ],
      cultura: [
        {
          type: 'platform',
          name: 'Instagram Cultura',
          platform: 'instagram',
          url: 'https://instagram.com/metricadip_cultura',
          display_settings: { show_recent_posts: true, show_engagement_rate: true }
        },
        {
          type: 'metric',
          title: 'Engagement Rate',
          platform: 'instagram',
          metric_type: 'engagement',
          value: '4.2',
          unit: '%',
          trend: 'up'
        }
      ]
    };

    return contextTemplates[contextType as keyof typeof contextTemplates] || contextTemplates.cultura;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Editor de Métricas Sociales
            <Badge variant="secondary">{platforms.length + metrics.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {showPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Editar' : 'Preview'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Plataformas ({platforms.length})
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Métricas ({metrics.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Campañas ({campaigns.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Plataformas Sociales */}
          <TabsContent value="platforms" className="space-y-6">
            {/* Templates rápidos */}
            {showAddForm && (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">Templates de {contextType}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getContextTemplates()
                      .filter(template => template.type === 'platform')
                      .map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewPlatform(template);
                            setShowAddForm(true);
                          }}
                          className="justify-start text-left h-auto p-3"
                        >
                          <div className="flex items-center gap-2">
                            {React.createElement(platformIcons[template.platform as keyof typeof platformIcons], { 
                              className: "w-4 h-4",
                              style: { color: platformColors[template.platform as keyof typeof platformColors] }
                            })}
                            <span className="font-medium">{template.name}</span>
                          </div>
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario nueva plataforma */}
            {showAddForm && !previewMode && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nombre *</label>
                        <Input
                          value={newPlatform.name || ''}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Facebook Métrica FM"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Plataforma</label>
                        <select
                          value={newPlatform.platform || 'facebook'}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, platform: e.target.value as SocialPlatform['platform'] }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter</option>
                          <option value="youtube">YouTube</option>
                          <option value="website">Website</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">URL *</label>
                      <Input
                        value={newPlatform.url || ''}
                        onChange={(e) => setNewPlatform(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://facebook.com/metricadip"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={newPlatform.username || ''}
                        onChange={(e) => setNewPlatform(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="@metricadip"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddPlatform} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botón agregar plataforma */}
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                disabled={platforms.length >= maxPlatforms}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plataforma
              </Button>
            )}

            {/* Lista de plataformas */}
            {previewMode ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vista Previa de Plataformas</h3>
                <div className="flex flex-wrap gap-4">
                  {platforms
                    .filter(platform => platform.status === 'active')
                    .sort((a, b) => a.order - b.order)
                    .map((platform) => {
                      const IconComponent = platformIcons[platform.platform];
                      return (
                        <div 
                          key={platform.id}
                          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <IconComponent 
                            className="w-5 h-5" 
                            style={{ color: platformColors[platform.platform] }}
                          />
                          <span className="font-medium">{platform.name}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="platforms">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {platforms.map((platform, index) => (
                        <SocialPlatformItem
                          key={platform.id}
                          platform={platform}
                          index={index}
                          editingId={editingId}
                          onEdit={setEditingId}
                          onUpdate={handleUpdatePlatform}
                          onDelete={handleDeletePlatform}
                          onToggleVisibility={togglePlatformVisibility}
                          onToggleExpansion={toggleItemExpansion}
                          expanded={expandedItems.has(platform.id)}
                          platformIcons={platformIcons}
                          platformColors={platformColors}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>

          {/* Tab: Métricas */}
          <TabsContent value="metrics" className="space-y-6">
            {/* Formulario nueva métrica */}
            {showAddForm && !previewMode && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Título *</label>
                        <Input
                          value={newMetric.title || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Seguidores en Facebook"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Plataforma</label>
                        <select
                          value={newMetric.platform || 'facebook'}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, platform: e.target.value }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter</option>
                          <option value="youtube">YouTube</option>
                          <option value="general">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Valor *</label>
                        <Input
                          value={newMetric.value || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="1,250"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Unidad</label>
                        <Input
                          value={newMetric.unit || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="K, %, M"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Tendencia</label>
                        <select
                          value={newMetric.trend || 'up'}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, trend: e.target.value as SocialMetric['trend'] }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="up">Subiendo</option>
                          <option value="down">Bajando</option>
                          <option value="stable">Estable</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddMetric} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botón agregar métrica */}
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                disabled={metrics.length >= maxMetrics}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Métrica
              </Button>
            )}

            {/* Lista de métricas */}
            {previewMode ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vista Previa de Métricas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics
                    .filter(metric => metric.status === 'visible')
                    .sort((a, b) => a.order - b.order)
                    .map((metric) => (
                      <Card key={metric.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{metric.title}</h4>
                          <div className="flex items-center gap-1">
                            {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                            {metric.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-[#003F6F]">
                          {metric.value}{metric.unit}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {metric.platform} • {metric.period}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="metrics">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {metrics.map((metric, index) => (
                        <SocialMetricItem
                          key={metric.id}
                          metric={metric}
                          index={index}
                          editingId={editingId}
                          onEdit={setEditingId}
                          onUpdate={handleUpdateMetric}
                          onDelete={handleDeleteMetric}
                          onToggleVisibility={toggleMetricVisibility}
                          onToggleExpansion={toggleItemExpansion}
                          expanded={expandedItems.has(metric.id)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>

          {/* Tab: Campañas */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Gestión de campañas disponible próximamente</p>
            </div>
          </TabsContent>
        </Tabs>

        {(platforms.length === 0 && metrics.length === 0 && campaigns.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay métricas sociales configuradas</p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              Comenzar configuración
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de plataforma social
interface SocialPlatformItemProps {
  platform: SocialPlatform;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SocialPlatform>) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  expanded: boolean;
  platformIcons: any;
  platformColors: any;
}

const SocialPlatformItem: React.FC<SocialPlatformItemProps> = ({
  platform,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onToggleExpansion,
  expanded,
  platformIcons,
  platformColors
}) => {
  const [editData, setEditData] = useState<Partial<SocialPlatform>>(platform);
  const IconComponent = platformIcons[platform.platform];

  const handleSave = () => {
    onUpdate(platform.id, editData);
  };

  return (
    <Draggable draggableId={platform.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className={platform.status === 'inactive' ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              {editingId === platform.id ? (
                // Modo edición
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        value={editData.url || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => onEdit(null)} size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Move className="w-4 h-4 text-gray-400 cursor-grab" />
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: platformColors[platform.platform] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{platform.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {platform.platform}
                          </Badge>
                          {platform.status === 'inactive' && (
                            <Badge variant="destructive">Inactivo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{platform.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleExpansion(platform.id)}
                        title={expanded ? "Contraer" : "Expandir"}
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleVisibility(platform.id)}
                        title={platform.status === 'active' ? "Desactivar" : "Activar"}
                      >
                        {platform.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(platform.id)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(platform.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {expanded && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>URL:</strong> <a href={platform.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{platform.url}</a></p>
                        {platform.metadata?.verified && (
                          <p className="text-green-600">✓ Cuenta verificada</p>
                        )}
                        {platform.metadata?.updated_at && (
                          <p>Última actualización: {new Date(platform.metadata.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

// Componente individual de métrica social
interface SocialMetricItemProps {
  metric: SocialMetric;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SocialMetric>) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  expanded: boolean;
}

const SocialMetricItem: React.FC<SocialMetricItemProps> = ({
  metric,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onToggleExpansion,
  expanded
}) => {
  const [editData, setEditData] = useState<Partial<SocialMetric>>(metric);

  const handleSave = () => {
    onUpdate(metric.id, editData);
  };

  return (
    <Draggable draggableId={metric.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className={metric.status === 'hidden' ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              {editingId === metric.id ? (
                // Modo edición
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Título</label>
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Valor</label>
                      <Input
                        value={editData.value || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => onEdit(null)} size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Move className="w-4 h-4 text-gray-400 cursor-grab" />
                      <BarChart3 className="w-5 h-5 text-[#003F6F]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{metric.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {metric.platform}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                            {metric.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                            {metric.trend === 'stable' && <div className="w-3 h-3 bg-gray-400 rounded-full" />}
                          </div>
                          {metric.status === 'hidden' && (
                            <Badge variant="destructive">Oculto</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#003F6F]">
                            {metric.value}{metric.unit}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {metric.period}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleExpansion(metric.id)}
                        title={expanded ? "Contraer" : "Expandir"}
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleVisibility(metric.id)}
                        title={metric.status === 'visible' ? "Ocultar" : "Mostrar"}
                      >
                        {metric.status === 'visible' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(metric.id)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(metric.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {expanded && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-gray-600 space-y-1">
                        {metric.description && (
                          <p><strong>Descripción:</strong> {metric.description}</p>
                        )}
                        <p><strong>Tipo de métrica:</strong> {metric.metric_type}</p>
                        {metric.trend_percentage && (
                          <p><strong>Cambio:</strong> {metric.trend_percentage}%</p>
                        )}
                        {metric.last_updated && (
                          <p>Actualizado: {new Date(metric.last_updated).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};