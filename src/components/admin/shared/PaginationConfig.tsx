'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  List,
  Grid,
  Calendar,
  Filter,
  Search,
  Eye
} from 'lucide-react';

export interface PaginationSettings {
  items_per_page: number;
  show_page_numbers: boolean;
  show_first_last: boolean;
  show_prev_next: boolean;
  show_page_info: boolean;
  show_items_per_page_selector: boolean;
  items_per_page_options: number[];
  max_page_links: number;
  pagination_style: 'simple' | 'numbered' | 'infinite' | 'load_more';
  position: 'top' | 'bottom' | 'both';
  alignment: 'left' | 'center' | 'right';
  size: 'sm' | 'md' | 'lg';
  show_total_count: boolean;
  loading_text: string;
  no_results_text: string;
  labels: {
    previous: string;
    next: string;
    first: string;
    last: string;
    page: string;
    of: string;
    items: string;
    showing: string;
    to: string;
    results: string;
    load_more: string;
  };
  advanced_options?: {
    enable_url_params: boolean;
    enable_keyboard_navigation: boolean;
    enable_touch_gestures: boolean;
    auto_scroll_to_top: boolean;
    remember_page: boolean;
    page_param_name: string;
    per_page_param_name: string;
  };
}

interface PaginationConfigProps {
  settings: PaginationSettings;
  onChange: (settings: PaginationSettings) => void;
  contextType?: 'blog' | 'portfolio' | 'careers' | 'general';
  showAdvancedOptions?: boolean;
  showPreview?: boolean;
  maxItemsPerPage?: number;
}

export const PaginationConfig: React.FC<PaginationConfigProps> = ({
  settings,
  onChange,
  contextType = 'general',
  showAdvancedOptions = true,
  showPreview = true,
  maxItemsPerPage = 100
}) => {
  const [activePreviewPage, setActivePreviewPage] = useState(1);

  const updateSetting = (key: keyof PaginationSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const updateLabel = (key: keyof PaginationSettings['labels'], value: string) => {
    onChange({
      ...settings,
      labels: {
        ...settings.labels,
        [key]: value
      }
    });
  };

  const updateAdvancedOption = (key: keyof NonNullable<PaginationSettings['advanced_options']>, value: any) => {
    onChange({
      ...settings,
      advanced_options: {
        ...settings.advanced_options,
        [key]: value
      }
    });
  };

  const applyContextDefaults = () => {
    const defaults = getDefaultsByContext(contextType);
    onChange({ ...settings, ...defaults });
  };

  const getDefaultsByContext = (context: string) => {
    const defaults = {
      blog: {
        items_per_page: 6,
        pagination_style: 'numbered' as const,
        show_page_numbers: true,
        show_total_count: true,
        items_per_page_options: [6, 12, 18, 24],
        loading_text: 'Cargando artículos...',
        no_results_text: 'No se encontraron artículos'
      },
      portfolio: {
        items_per_page: 9,
        pagination_style: 'load_more' as const,
        show_page_numbers: false,
        show_total_count: true,
        items_per_page_options: [9, 18, 27, 36],
        loading_text: 'Cargando proyectos...',
        no_results_text: 'No se encontraron proyectos'
      },
      careers: {
        items_per_page: 8,
        pagination_style: 'numbered' as const,
        show_page_numbers: true,
        show_total_count: true,
        items_per_page_options: [8, 16, 24, 32],
        loading_text: 'Cargando ofertas...',
        no_results_text: 'No hay ofertas disponibles'
      }
    };
    return defaults[context as keyof typeof defaults] || defaults.blog;
  };

  // Componente de preview de paginación
  const PaginationPreview = () => {
    const totalItems = 147; // Simulado
    const totalPages = Math.ceil(totalItems / settings.items_per_page);
    const startItem = (activePreviewPage - 1) * settings.items_per_page + 1;
    const endItem = Math.min(activePreviewPage * settings.items_per_page, totalItems);

    if (settings.pagination_style === 'infinite' || settings.pagination_style === 'load_more') {
      return (
        <div className={`flex justify-${settings.alignment} mt-4`}>
          <Button 
            variant="outline" 
            size={settings.size}
            className="gap-2"
          >
            {settings.pagination_style === 'load_more' ? (
              <>
                <MoreHorizontal className="w-4 h-4" />
                {settings.labels.load_more}
              </>
            ) : (
              'Scroll infinito activo'
            )}
          </Button>
        </div>
      );
    }

    const getPageNumbers = () => {
      const pages = [];
      const maxLinks = settings.max_page_links;
      const half = Math.floor(maxLinks / 2);
      
      let start = Math.max(1, activePreviewPage - half);
      let end = Math.min(totalPages, start + maxLinks - 1);
      
      if (end - start + 1 < maxLinks) {
        start = Math.max(1, end - maxLinks + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    return (
      <div className="space-y-4">
        {settings.show_page_info && (
          <div className={`text-sm text-gray-600 text-${settings.alignment}`}>
            {settings.labels.showing} {startItem} {settings.labels.to} {endItem} {settings.labels.of} {totalItems} {settings.labels.results}
          </div>
        )}
        
        <div className={`flex items-center gap-2 justify-${settings.alignment}`}>
          {settings.show_first_last && activePreviewPage > 1 && (
            <Button 
              variant="outline" 
              size={settings.size}
              onClick={() => setActivePreviewPage(1)}
            >
              {settings.labels.first}
            </Button>
          )}
          
          {settings.show_prev_next && activePreviewPage > 1 && (
            <Button 
              variant="outline" 
              size={settings.size}
              onClick={() => setActivePreviewPage(activePreviewPage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {settings.labels.previous}
            </Button>
          )}
          
          {settings.show_page_numbers && (
            <div className="flex items-center gap-1">
              {getPageNumbers().map(pageNum => (
                <Button
                  key={pageNum}
                  variant={pageNum === activePreviewPage ? "default" : "outline"}
                  size={settings.size}
                  onClick={() => setActivePreviewPage(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
          )}
          
          {settings.show_prev_next && activePreviewPage < totalPages && (
            <Button 
              variant="outline" 
              size={settings.size}
              onClick={() => setActivePreviewPage(activePreviewPage + 1)}
              className="gap-1"
            >
              {settings.labels.next}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          
          {settings.show_first_last && activePreviewPage < totalPages && (
            <Button 
              variant="outline" 
              size={settings.size}
              onClick={() => setActivePreviewPage(totalPages)}
            >
              {settings.labels.last}
            </Button>
          )}
        </div>
        
        {settings.show_items_per_page_selector && (
          <div className={`flex items-center gap-2 text-sm justify-${settings.alignment}`}>
            <span>{settings.labels.items} por página:</span>
            <select 
              value={settings.items_per_page}
              onChange={(e) => updateSetting('items_per_page', parseInt(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              {settings.items_per_page_options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
        
        {settings.show_total_count && (
          <div className={`text-xs text-gray-500 text-${settings.alignment}`}>
            Total: {totalItems} elementos
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Paginación
            <Badge variant="outline">{contextType}</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={applyContextDefaults}
          >
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Defaults
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuración Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Items por Página</label>
              <Input
                type="number"
                value={settings.items_per_page}
                onChange={(e) => updateSetting('items_per_page', parseInt(e.target.value) || 10)}
                min={1}
                max={maxItemsPerPage}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Estilo de Paginación</label>
              <select
                value={settings.pagination_style}
                onChange={(e) => updateSetting('pagination_style', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="simple">Simple (Anterior/Siguiente)</option>
                <option value="numbered">Numerada</option>
                <option value="infinite">Scroll Infinito</option>
                <option value="load_more">Cargar Más</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Posición</label>
              <select
                value={settings.position}
                onChange={(e) => updateSetting('position', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="top">Superior</option>
                <option value="bottom">Inferior</option>
                <option value="both">Ambos</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Alineación</label>
              <select
                value={settings.alignment}
                onChange={(e) => updateSetting('alignment', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tamaño</label>
              <select
                value={settings.size}
                onChange={(e) => updateSetting('size', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="sm">Pequeño</option>
                <option value="md">Mediano</option>
                <option value="lg">Grande</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Máximo Enlaces</label>
              <Input
                type="number"
                value={settings.max_page_links}
                onChange={(e) => updateSetting('max_page_links', parseInt(e.target.value) || 7)}
                min={3}
                max={15}
              />
            </div>
          </div>
        </div>

        {/* Opciones de Visualización */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Opciones de Visualización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'show_page_numbers', label: 'Mostrar números de página' },
              { key: 'show_first_last', label: 'Botones Primera/Última' },
              { key: 'show_prev_next', label: 'Botones Anterior/Siguiente' },
              { key: 'show_page_info', label: 'Información de página' },
              { key: 'show_items_per_page_selector', label: 'Selector items/página' },
              { key: 'show_total_count', label: 'Mostrar total de items' }
            ].map(option => (
              <div key={option.key} className="flex items-center space-x-2">
                <Switch
                  checked={settings[option.key as keyof PaginationSettings] as boolean}
                  onCheckedChange={(checked) => updateSetting(option.key as keyof PaginationSettings, checked)}
                  id={option.key}
                />
                <label htmlFor={option.key} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones por Página */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Opciones por Página</h3>
          <div>
            <label className="text-sm font-medium">Opciones disponibles (separadas por comas)</label>
            <Input
              value={settings.items_per_page_options.join(', ')}
              onChange={(e) => {
                const options = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                updateSetting('items_per_page_options', options);
              }}
              placeholder="10, 20, 50, 100"
            />
          </div>
        </div>

        {/* Textos y Etiquetas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Textos y Etiquetas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Texto "Anterior"</label>
              <Input
                value={settings.labels.previous}
                onChange={(e) => updateLabel('previous', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto "Siguiente"</label>
              <Input
                value={settings.labels.next}
                onChange={(e) => updateLabel('next', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto "Primera"</label>
              <Input
                value={settings.labels.first}
                onChange={(e) => updateLabel('first', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto "Última"</label>
              <Input
                value={settings.labels.last}
                onChange={(e) => updateLabel('last', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto de Carga</label>
              <Input
                value={settings.loading_text}
                onChange={(e) => updateSetting('loading_text', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto Sin Resultados</label>
              <Input
                value={settings.no_results_text}
                onChange={(e) => updateSetting('no_results_text', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Opciones Avanzadas */}
        {showAdvancedOptions && settings.advanced_options && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opciones Avanzadas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'enable_url_params', label: 'Habilitar parámetros URL' },
                { key: 'enable_keyboard_navigation', label: 'Navegación por teclado' },
                { key: 'enable_touch_gestures', label: 'Gestos táctiles' },
                { key: 'auto_scroll_to_top', label: 'Auto scroll al top' },
                { key: 'remember_page', label: 'Recordar página actual' }
              ].map(option => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Switch
                    checked={settings.advanced_options![option.key as keyof NonNullable<PaginationSettings['advanced_options']>] as boolean}
                    onCheckedChange={(checked) => updateAdvancedOption(option.key as keyof NonNullable<PaginationSettings['advanced_options']>, checked)}
                    id={option.key}
                  />
                  <label htmlFor={option.key} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Parámetro de Página</label>
                <Input
                  value={settings.advanced_options.page_param_name}
                  onChange={(e) => updateAdvancedOption('page_param_name', e.target.value)}
                  placeholder="page"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Parámetro Items/Página</label>
                <Input
                  value={settings.advanced_options.per_page_param_name}
                  onChange={(e) => updateAdvancedOption('per_page_param_name', e.target.value)}
                  placeholder="per_page"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Vista Previa</h3>
              <Eye className="w-5 h-5" />
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <PaginationPreview />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Función para obtener configuración por defecto
export const getDefaultPaginationSettings = (contextType: string = 'general'): PaginationSettings => {
  return {
    items_per_page: 10,
    show_page_numbers: true,
    show_first_last: false,
    show_prev_next: true,
    show_page_info: true,
    show_items_per_page_selector: true,
    items_per_page_options: [10, 20, 50],
    max_page_links: 7,
    pagination_style: 'numbered',
    position: 'bottom',
    alignment: 'center',
    size: 'md',
    show_total_count: true,
    loading_text: 'Cargando...',
    no_results_text: 'No se encontraron resultados',
    labels: {
      previous: 'Anterior',
      next: 'Siguiente',
      first: 'Primera',
      last: 'Última',
      page: 'Página',
      of: 'de',
      items: 'Elementos',
      showing: 'Mostrando',
      to: 'a',
      results: 'resultados',
      load_more: 'Cargar Más'
    },
    advanced_options: {
      enable_url_params: true,
      enable_keyboard_navigation: false,
      enable_touch_gestures: false,
      auto_scroll_to_top: true,
      remember_page: false,
      page_param_name: 'page',
      per_page_param_name: 'per_page'
    }
  };
};