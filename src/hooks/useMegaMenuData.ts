'use client';

import { useState, useEffect, useCallback } from 'react';

interface MegaMenuSubItem {
  section1: { title: string; description: string };
  links: Array<{ href: string; title: string; description: string }>;
  section3: { 
    title: string; 
    description: string;
    image?: string;
  };
}

interface MegaMenuItem {
  id: string;
  label: string;
  href?: string;
  subItems?: MegaMenuSubItem | null;
}

interface JsonMegaMenuItem {
  id: string;
  label: string;
  type: 'megamenu' | 'simple';
  href?: string;
  enabled: boolean;
  order: number;
  submenu?: {
    section1: { title: string; description: string };
    links: Array<{ 
      title: string; 
      description: string; 
      href: string;
      enabled: boolean;
    }>;
    section3: {
      title: string;
      description: string;
      image?: string;
    };
  };
}

interface MegaMenuData {
  settings: {
    enabled: boolean;
    animation_duration: number;
    hover_delay: number;
    mobile_breakpoint: string;
    max_items: number;
    last_updated: string;
    version: string;
  };
  items: JsonMegaMenuItem[];
  page_mappings: Record<string, any>;
  analytics: Record<string, any>;
}

export function useMegaMenuData() {
  const [menuData, setMenuData] = useState<MegaMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformJsonToMenuItems = useCallback((jsonData: MegaMenuData): MegaMenuItem[] => {
    if (!jsonData.items || !Array.isArray(jsonData.items)) {
      return [];
    }

    return jsonData.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        id: item.id,
        label: item.label,
        href: item.type === 'simple' ? item.href : undefined,
        subItems: item.type === 'megamenu' && item.submenu ? {
          section1: {
            title: item.submenu.section1.title,
            description: item.submenu.section1.description
          },
          links: item.submenu.links
            .filter(link => link.enabled)
            .map(link => ({
              href: link.href,
              title: link.title,
              description: link.description
            })),
          section3: {
            title: item.submenu.section3.title,
            description: item.submenu.section3.description,
            image: item.submenu.section3.image
          }
        } : null
      }));
  }, []);

  const loadMegaMenuData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/megamenu', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error loading menu data: ${response.status} - ${response.statusText}`);
      }

      const megaMenuConfig = await response.json();

      if (!megaMenuConfig) {
        throw new Error('Invalid menu data structure');
      }

      // Verificar que esté habilitado
      if (!megaMenuConfig.settings?.enabled) {
        setMenuData([]);
        return;
      }

      const transformedItems = transformJsonToMenuItems(megaMenuConfig);
      setMenuData(transformedItems);

    } catch (err) {
      console.error('Error loading mega menu data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Provide fallback menu data on error
      const fallbackData = [
        { id: 'inicio', label: 'Inicio', href: '/' },
        { id: 'servicios', label: 'Qué Hacemos', href: '/services' },
        { id: 'nosotros', label: 'Nosotros', href: '/about' },
        { id: 'portfolio', label: 'Proyectos', href: '/portfolio' },
        { id: 'iso', label: 'SIG', href: '/iso' },
        { id: 'blog', label: 'Newsletter', href: '/blog' },
        { id: 'contacto', label: 'Contáctanos', href: '/contact' }
      ];
      
      setError(`Failed to fetch: ${errorMessage}`);
      setMenuData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [transformJsonToMenuItems]);

  const trackItemClick = useCallback(async (itemId: string) => {
    try {
      await fetch('/api/admin/megamenu', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'track_click',
          item_id: itemId
        }),
        cache: 'no-store'
      });
    } catch (error) {
      // Silently fail for tracking - don't break user experience
      if (process.env.NODE_ENV === 'development') {
        console.error('Error tracking click:', error);
      }
    }
  }, []);

  const refreshData = useCallback(() => {
    loadMegaMenuData();
  }, [loadMegaMenuData]);

  useEffect(() => {
    loadMegaMenuData();
  }, [loadMegaMenuData]);

  return {
    menuData,
    isLoading,
    error,
    refreshData,
    trackItemClick
  };
}