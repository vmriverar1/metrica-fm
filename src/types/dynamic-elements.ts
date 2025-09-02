/**
 * Interfaces unificadas para elementos dinámicos del sistema
 * Fase 1 - Plan Cards, Bullets & Statistics
 */

// Base interface para todos los elementos dinámicos
export interface BaseCardElement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  image_fallback?: string;
  order?: number;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Elemento de estadística (ya existente - para estandarizar)
export interface StatisticElement extends BaseCardElement {
  value: number;
  suffix: string;
  label: string;
  // Heredado de BaseCardElement: id, icon, description
}

// Elemento de pilar empresarial
export interface PillarElement extends BaseCardElement {
  // Campos específicos de pilares ya incluidos en BaseCardElement
  // icon: string (Lucide icon name)
  // image: string (URL imagen principal)
  // image_fallback: string (URL imagen fallback)
}

// Elemento de política empresarial
export interface PolicyElement extends BaseCardElement {
  // Similar a PillarElement, usa BaseCardElement
  // Puede tener campos adicionales en el futuro si es necesario
}

// Elemento de servicio secundario
export interface ServiceElement extends BaseCardElement {
  image_url: string;
  image_url_fallback: string;
  icon_url?: string;
  cta?: {
    text?: string;
    url?: string;
  };
}

// Elemento de proyecto destacado
export interface ProjectElement extends BaseCardElement {
  name: string; // nombre del proyecto (puede ser diferente del title)
  type: string; // tipo/categoría: "Comercial", "Industrial", etc.
  image_url: string;
  image_url_fallback: string;
}

// Tipos de elementos soportados por el sistema
export type ElementType = 'statistics' | 'pillars' | 'policies' | 'services' | 'projects';

// Union type para cualquier elemento dinámico
export type DynamicElement = 
  | StatisticElement 
  | PillarElement 
  | PolicyElement 
  | ServiceElement 
  | ProjectElement;

// Props comunes para componentes de gestión
export interface ElementManagerProps<T extends BaseCardElement> {
  elements: T[];
  elementType: ElementType;
  onAdd: (element: Omit<T, 'id' | 'created_at' | 'updated_at'>) => void;
  onEdit: (id: string, element: Partial<T>) => void;
  onDelete: (id: string) => void;
  onReorder: (elements: T[]) => void;
  loading?: boolean;
  error?: string | null;
}

// Configuración específica por tipo de elemento
export interface ElementConfig {
  type: ElementType;
  displayName: string;
  pluralName: string;
  description: string;
  jsonPath: string; // ruta en el JSON: ej. "stats.statistics"
  componentPath: string; // ruta del componente: ej. "/src/components/landing/stats.tsx"
  adminPath: string; // ruta del admin: ej. "/admin/dynamic-content/statistics"
  fields: ElementFieldConfig[];
}

// Configuración de campos por tipo de elemento
export interface ElementFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'image' | 'icon' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // para campos tipo select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Mapa de configuraciones para cada tipo
export const ELEMENT_CONFIGS: Record<ElementType, ElementConfig> = {
  statistics: {
    type: 'statistics',
    displayName: 'Estadística',
    pluralName: 'Estadísticas',
    description: 'Números y métricas destacadas',
    jsonPath: 'stats.statistics',
    componentPath: '/src/components/landing/stats.tsx',
    adminPath: '/admin/dynamic-content/statistics',
    fields: [
      { key: 'icon', label: 'Ícono', type: 'icon', required: true },
      { key: 'value', label: 'Valor', type: 'number', required: true, validation: { min: 0 } },
      { key: 'suffix', label: 'Sufijo', type: 'text', required: true, placeholder: 'M, K, +, %' },
      { key: 'label', label: 'Etiqueta', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true }
    ]
  },
  pillars: {
    type: 'pillars',
    displayName: 'Pilar',
    pluralName: 'Pilares',
    description: 'Pilares fundamentales de la empresa',
    jsonPath: 'pillars.pillars',
    componentPath: '/src/components/landing/pillars-carousel.tsx',
    adminPath: '/admin/dynamic-content/pillars',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true },
      { key: 'icon', label: 'Ícono', type: 'icon', required: true },
      { key: 'image', label: 'Imagen', type: 'image', required: true },
      { key: 'image_fallback', label: 'Imagen Fallback', type: 'image' }
    ]
  },
  policies: {
    type: 'policies',
    displayName: 'Política',
    pluralName: 'Políticas',
    description: 'Políticas empresariales',
    jsonPath: 'policies.policies',
    componentPath: '/src/components/landing/policies-carousel.tsx',
    adminPath: '/admin/dynamic-content/policies',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true },
      { key: 'icon', label: 'Ícono', type: 'icon', required: true },
      { key: 'image', label: 'Imagen', type: 'image', required: true },
      { key: 'image_fallback', label: 'Imagen Fallback', type: 'image' }
    ]
  },
  services: {
    type: 'services',
    displayName: 'Servicio',
    pluralName: 'Servicios',
    description: 'Servicios secundarios',
    jsonPath: 'services.secondary_services',
    componentPath: '/src/components/landing/services.tsx',
    adminPath: '/admin/dynamic-content/services',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true },
      { key: 'image_url', label: 'Imagen URL', type: 'image', required: true },
      { key: 'image_url_fallback', label: 'Imagen Fallback', type: 'image' },
      { key: 'icon_url', label: 'Ícono URL', type: 'image' }
    ]
  },
  projects: {
    type: 'projects',
    displayName: 'Proyecto',
    pluralName: 'Proyectos',
    description: 'Proyectos destacados',
    jsonPath: 'portfolio.featured_projects',
    componentPath: '/src/components/landing/portfolio.tsx',
    adminPath: '/admin/dynamic-content/projects',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Comercial', 'Industrial', 'Residencial', 'Sanitaria', 'Educacional'] },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true },
      { key: 'image_url', label: 'Imagen URL', type: 'image', required: true },
      { key: 'image_url_fallback', label: 'Imagen Fallback', type: 'image' }
    ]
  }
};

// Utilidades para validación de iconos
export const LUCIDE_ICONS = [
  'Award', 'Building', 'TrendingUp', 'Briefcase', 'Compass', 'Network', 
  'ScanSearch', 'ChartBar', 'AlertTriangle', 'Building2', 'Shield', 
  'Leaf', 'Heart', 'Scale', 'Lightbulb', 'Lock', 'Target', 'Users', 
  'Search', 'BarChart', 'UserCheck'
] as const;

export type LucideIconName = typeof LUCIDE_ICONS[number];

// Función para validar si un ícono es válido
export function isValidIcon(icon: string): icon is LucideIconName {
  return LUCIDE_ICONS.includes(icon as LucideIconName);
}

// Templates predefinidos para cada tipo
export interface ElementTemplate<T extends BaseCardElement> {
  id: string;
  name: string;
  description: string;
  elementType: ElementType;
  template: Omit<T, 'id' | 'created_at' | 'updated_at'>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook types
export interface UseDynamicElementsOptions {
  type: ElementType;
  autoLoad?: boolean;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface UseDynamicElementsReturn<T extends BaseCardElement> {
  elements: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (element: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  update: (id: string, element: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  reorder: (elements: T[]) => Promise<void>;
}