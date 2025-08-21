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
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    id: 'json-crud',
    label: 'Editor de Contenido',
    icon: FileText,
    path: '/admin/json-crud',
    description: 'Gestión de contenido'
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
    path: '/admin/json-crud/settings',
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
  compact?: boolean;
}

export default function AdminNavigation({ className, compact = false }: AdminNavigationProps) {
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
    if (path === '/admin/json-crud' && pathname === '/admin/json-crud') return true;
    if (path !== '/admin/json-crud' && pathname.startsWith(path)) return true;
    return pathname === path;
  };

  const NavButton = ({ item }: { item: NavItem }) => (
    <Button
      variant={isActive(item.path) ? 'default' : 'ghost'}
      className={cn(
        "w-full justify-start h-auto p-3",
        isActive(item.path) && "bg-primary text-primary-foreground shadow-sm"
      )}
      onClick={() => handleNavigation(item)}
    >
      <item.icon className={cn("h-4 w-4", compact ? "" : "mr-3")} />
      {!compact && (
        <div className="text-left flex-1">
          <div className="font-medium">{item.label}</div>
          {item.description && (
            <div className="text-xs opacity-70">{item.description}</div>
          )}
        </div>
      )}
    </Button>
  );

  return (
    <nav className={cn("space-y-2", className)}>
      {/* Navegación Principal */}
      <div className="space-y-1">
        {!compact && (
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Principal
          </h3>
        )}
        {mainNavItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>

      {/* Separador */}
      <div className="border-t border-border my-4" />

      {/* Navegación de Utilidades */}
      <div className="space-y-1">
        {!compact && (
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Herramientas
          </h3>
        )}
        {utilityNavItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>
    </nav>
  );
}