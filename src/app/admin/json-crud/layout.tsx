/**
 * Layout simplificado que usa el nuevo AdminLayout
 */

'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface LayoutProps {
  children: ReactNode;
}

// Mapeo de rutas a títulos específicos
const routeTitles: Record<string, { title: string; description: string }> = {
  '/admin/json-crud': {
    title: 'Dashboard de Contenido',
    description: 'Panel principal para gestionar todo el contenido JSON'
  },
  '/admin/json-crud/pages': {
    title: 'Gestión de Páginas',
    description: 'Administra las páginas estáticas del sitio web'
  },
  '/admin/json-crud/portfolio': {
    title: 'Gestión de Portfolio',
    description: 'Administra proyectos y categorías del portfolio'
  },
  '/admin/json-crud/careers': {
    title: 'Gestión de Empleos',
    description: 'Administra ofertas laborales y departamentos'
  },
  '/admin/json-crud/newsletter': {
    title: 'Gestión de Newsletter',
    description: 'Administra artículos y contenido del newsletter'
  }
};

export default function JsonCrudLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  
  // Buscar el título más específico para la ruta actual
  const routeConfig = routeTitles[pathname] || {
    title: 'Gestión de Contenido',
    description: 'Sistema JSON CRUD para administrar el contenido del sitio web'
  };

  return (
    <AdminLayout
      title={routeConfig.title}
      description={routeConfig.description}
    >
      {children}
    </AdminLayout>
  );
}