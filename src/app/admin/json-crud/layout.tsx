/**
 * Layout para el sistema de administración JSON CRUD
 */

'use client';

import { useAuth, withAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { HelpButton } from '@/components/admin/HelpSystem';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Building2,
  PenTool,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  children?: SidebarItem[];
}

const navigation: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/json-crud',
    icon: LayoutDashboard
  },
  {
    name: 'Búsqueda Global',
    href: '/admin/json-crud/search',
    icon: Search
  },
  {
    name: 'Páginas Estáticas',
    href: '/admin/json-crud/pages',
    icon: FileText
  },
  {
    name: 'Portfolio',
    href: '/admin/json-crud/portfolio',
    icon: Building2,
    children: [
      {
        name: 'Proyectos',
        href: '/admin/json-crud/portfolio/projects',
        icon: Building2
      },
      {
        name: 'Categorías',
        href: '/admin/json-crud/portfolio/categories',
        icon: Building2
      }
    ]
  },
  {
    name: 'Carreras',
    href: '/admin/json-crud/careers',
    icon: Briefcase,
    children: [
      {
        name: 'Trabajos',
        href: '/admin/json-crud/careers/jobs',
        icon: Briefcase
      },
      {
        name: 'Departamentos',
        href: '/admin/json-crud/careers/departments',
        icon: Users
      }
    ]
  },
  {
    name: 'Newsletter',
    href: '/admin/json-crud/newsletter',
    icon: PenTool,
    children: [
      {
        name: 'Artículos',
        href: '/admin/json-crud/newsletter/articles',
        icon: FileText
      },
      {
        name: 'Autores',
        href: '/admin/json-crud/newsletter/authors',
        icon: User
      },
      {
        name: 'Categorías',
        href: '/admin/json-crud/newsletter/categories',
        icon: FileText
      }
    ]
  },
  {
    name: 'Configuración',
    href: '/admin/json-crud/settings',
    icon: Settings
  }
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, actions } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin/json-crud') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await actions.logout();
    window.location.href = '/admin/login';
  };

  const SidebarItem = ({ item, depth = 0 }: { item: SidebarItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    return (
      <div>
        <div
          className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer transition-colors ${
            active
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          style={{ paddingLeft: `${(depth * 16) + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          <Link
            href={item.href}
            className="flex items-center flex-1"
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.name}
          </Link>
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
            />
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.name}
                item={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full" style={{ backgroundColor: 'hsl(var(--foreground))' }}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-white font-bold text-lg">
                <span className="text-accent">Métrica</span> Admin
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: 'hsl(var(--foreground))' }}>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white font-bold text-lg">
                <span className="text-accent">Métrica</span> Admin
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
          
          {/* User info */}
          <div className="flex-shrink-0 flex p-4" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName || 'Usuario'} {user?.lastName || ''}
                </p>
                <p className="text-xs text-gray-300">{user?.role?.name || 'Sin rol'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Buscar..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notificaciones */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Botón de home */}
              <Link
                href="/"
                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Home className="h-6 w-6" />
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating help button */}
      <HelpButton />
    </div>
    </NotificationProvider>
  );
}

export default withAuth(AdminLayout);