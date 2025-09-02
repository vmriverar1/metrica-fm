import * as LucideIcons from 'lucide-react';

// Lista completa de iconos disponibles en Lucide React
export const LUCIDE_ICON_NAMES = Object.keys(LucideIcons).filter(
  name => name !== 'createLucideIcon' && name !== 'Icon' && typeof LucideIcons[name as keyof typeof LucideIcons] === 'function'
).sort();

// Iconos comunes recomendados para estadísticas
export const RECOMMENDED_STAT_ICONS = [
  'Award', 'BarChart3', 'Building', 'Briefcase', 'Calendar',
  'CheckCircle', 'Clock', 'Code', 'Compass', 'Crown',
  'Globe', 'GraduationCap', 'Heart', 'Home', 'Lightbulb',
  'MapPin', 'Medal', 'PieChart', 'Rocket', 'Shield',
  'Star', 'Target', 'TrendingUp', 'Trophy', 'Users',
  'Zap', 'Activity', 'AlertTriangle', 'Archive', 'Camera',
  'Coffee', 'Database', 'DollarSign', 'Eye', 'FileText',
  'Gift', 'Hammer', 'Headphones', 'Key', 'Layers',
  'Mail', 'Monitor', 'Package', 'Phone', 'Settings',
  'Smartphone', 'Tablet', 'Tool', 'Truck', 'Wifi'
];

// Categorías de iconos
export const ICON_CATEGORIES = {
  business: ['Briefcase', 'Building', 'Users', 'TrendingUp', 'BarChart3', 'PieChart', 'DollarSign'],
  achievements: ['Award', 'Trophy', 'Medal', 'Crown', 'Star', 'Target', 'CheckCircle'],
  technology: ['Code', 'Database', 'Monitor', 'Smartphone', 'Wifi', 'Settings', 'Tool'],
  location: ['MapPin', 'Globe', 'Home', 'Compass', 'Truck'],
  time: ['Clock', 'Calendar', 'Activity'],
  communication: ['Mail', 'Phone', 'Headphones', 'Eye'],
  education: ['GraduationCap', 'Lightbulb', 'FileText', 'Archive'],
  general: ['Heart', 'Gift', 'Camera', 'Coffee', 'Key', 'Package', 'Layers']
};

// Validar si un icono existe en Lucide React
export function isValidIcon(iconName: string): boolean {
  return LUCIDE_ICON_NAMES.includes(iconName);
}

// Obtener componente de icono por nombre
export function getIconComponent(iconName: string): React.ComponentType<any> | null {
  if (!isValidIcon(iconName)) {
    return null;
  }
  return LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
}

// Buscar iconos por texto
export function searchIcons(query: string): string[] {
  if (!query) return RECOMMENDED_STAT_ICONS;
  
  const searchTerm = query.toLowerCase();
  return LUCIDE_ICON_NAMES.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm)
  ).slice(0, 20); // Limitar a 20 resultados
}

// Obtener iconos por categoría
export function getIconsByCategory(category: keyof typeof ICON_CATEGORIES): string[] {
  return ICON_CATEGORIES[category] || [];
}

// Obtener todas las categorías disponibles
export function getCategories(): Array<{ key: keyof typeof ICON_CATEGORIES; label: string; icons: string[] }> {
  return Object.entries(ICON_CATEGORIES).map(([key, icons]) => ({
    key: key as keyof typeof ICON_CATEGORIES,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    icons
  }));
}

// Validación avanzada de iconos con sugerencias
export interface IconValidationResult {
  isValid: boolean;
  suggestions: string[];
  category?: string;
  message: string;
}

export function validateIcon(iconName: string): IconValidationResult {
  if (!iconName) {
    return {
      isValid: false,
      suggestions: RECOMMENDED_STAT_ICONS.slice(0, 5),
      message: 'Nombre de icono requerido'
    };
  }

  if (isValidIcon(iconName)) {
    // Encontrar categoría del icono
    const category = Object.entries(ICON_CATEGORIES).find(([_, icons]) => 
      icons.includes(iconName)
    )?.[0];

    return {
      isValid: true,
      suggestions: [],
      category,
      message: `Icono "${iconName}" es válido${category ? ` (categoría: ${category})` : ''}`
    };
  }

  // Buscar sugerencias similares
  const suggestions = searchIcons(iconName).slice(0, 5);
  
  return {
    isValid: false,
    suggestions,
    message: `Icono "${iconName}" no existe en Lucide React`
  };
}

// Utilidades para autocompletado
export interface IconSuggestion {
  name: string;
  category?: string;
  isRecommended: boolean;
}

export function getIconSuggestions(query: string = ''): IconSuggestion[] {
  const searchResults = searchIcons(query);
  
  return searchResults.map(iconName => ({
    name: iconName,
    category: Object.entries(ICON_CATEGORIES).find(([_, icons]) => 
      icons.includes(iconName)
    )?.[0],
    isRecommended: RECOMMENDED_STAT_ICONS.includes(iconName)
  }));
}

// Formatear nombre de icono para mostrar
export function formatIconName(iconName: string): string {
  return iconName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}