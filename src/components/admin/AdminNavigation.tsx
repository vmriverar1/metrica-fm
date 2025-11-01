'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAdminNavigation } from '@/hooks/useAdminNavigation';
import {
  Home,
  FileText,
  Briefcase,
  Mail,
  Settings,
  BarChart3,
  Monitor,
  Search,
  Users,
  Building,
  Menu,
  UserCheck
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description?: string;
}

const mainNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin/dashboard',
    description: 'Panel principal'
  },
  {
    id: 'pages',
    label: 'Páginas',
    icon: FileText,
    path: '/admin/json-crud/pages',
    description: 'Editor de páginas'
  },
  {
    id: 'portfolio',
    label: 'Portafolio',
    icon: Building,
    path: '/admin/json-crud/portfolio',
    description: 'Gestión de proyectos'
  },
  {
    id: 'careers',
    label: 'Empleos',
    icon: Users,
    path: '/admin/json-crud/careers',
    description: 'Bolsa de trabajo'
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    path: '/admin/json-crud/newsletter',
    description: 'Contenido del blog'
  },
  {
    id: 'megamenu',
    label: 'Mega Menu',
    icon: Menu,
    path: '/admin/megamenu',
    description: 'Gestión del mega menú'
  },
  {
    id: 'subscriptions',
    label: 'Suscripciones',
    icon: UserCheck,
    path: '/admin/subscriptions/subscribers',
    description: 'Gestión de suscriptores'
  }
];

const utilityNavItems: NavItem[] = [
  {
    id: 'search',
    label: 'Búsqueda',
    icon: Search,
    path: '/admin/json-crud/search',
    description: 'Buscar contenido'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    path: '/admin/settings',
    description: 'Configuración del sistema'
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: Monitor,
    path: '/admin/production-monitor',
    description: 'Monitor de producción'
  }
];

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className }: AdminNavigationProps) {
  const pathname = usePathname();
  const { navigateTo } = useAdminNavigation();

  const handleNavigation = (item: NavItem) => {
    if (pathname !== item.path) {
      navigateTo(item.path, {
        loadingMessage: `Cargando ${item.label.toLowerCase()}...`
      });
    }
  };

  const isActive = (path: string) => {
    if (pathname.startsWith(path)) return true;
    return pathname === path;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Navegación Principal */}
      <SidebarGroup>
        <SidebarGroupLabel>Principal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item)}
                  isActive={isActive(item.path)}
                  tooltip={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      {/* Navegación de Utilidades */}
      <SidebarGroup>
        <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {utilityNavItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item)}
                  isActive={isActive(item.path)}
                  tooltip={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}