'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  fallbackIcon?: keyof typeof LucideIcons;
  [key: string]: any; // Para otras props de iconos
}

/**
 * Componente que renderiza dinámicamente cualquier icono de Lucide
 * con fallback automático si el icono no existe
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  className, 
  size,
  fallbackIcon = 'HelpCircle',
  ...props 
}) => {
  // Buscar el icono en LucideIcons
  const IconComponent = (LucideIcons as any)[name];
  
  // Si no existe, usar el icono de fallback
  const FinalIcon = IconComponent || (LucideIcons as any)[fallbackIcon];
  
  // Log warning si el icono no existe (solo en desarrollo)
  if (!IconComponent && process.env.NODE_ENV === 'development') {
    console.warn(`Icono "${name}" no encontrado en Lucide, usando "${fallbackIcon}" como fallback`);
  }
  
  // Si tampoco existe el fallback, usar HelpCircle
  if (!FinalIcon) {
    console.error(`Ni el icono "${name}" ni el fallback "${fallbackIcon}" existen`);
    return <LucideIcons.HelpCircle className={cn('h-4 w-4', className)} size={size} {...props} />;
  }
  
  return <FinalIcon className={cn('h-4 w-4', className)} size={size} {...props} />;
};

/**
 * Hook para obtener componente de icono dinámicamente
 */
export const useIcon = (name: string, fallbackIcon: keyof typeof LucideIcons = 'HelpCircle') => {
  const IconComponent = (LucideIcons as any)[name];
  const FallbackIcon = (LucideIcons as any)[fallbackIcon];
  
  if (!IconComponent && process.env.NODE_ENV === 'development') {
    console.warn(`Icono "${name}" no encontrado en Lucide, usando "${fallbackIcon}" como fallback`);
  }
  
  return IconComponent || FallbackIcon || LucideIcons.HelpCircle;
};

export default DynamicIcon;