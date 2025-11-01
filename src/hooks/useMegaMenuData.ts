'use client';

import { useState, useEffect, useCallback } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { COLLECTIONS } from '@/lib/firebase/config';
import { MEGAMENU_FALLBACK } from '@/lib/firestore/fallbacks';

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
      console.log('🔍 [MegaMenu] Cargando datos desde Firestore...');
      setIsLoading(true);
      setError(null);

      // Obtener documento del mega menú desde Firestore
      const result = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      let megaMenuConfig: MegaMenuData;

      if (!result.success || !result.data) {
        console.warn('⚠️ [FALLBACK] MegaMenu: Sin datos en Firestore, usando fallback descriptivo');
        // Usar fallback en lugar de lanzar error
        megaMenuConfig = MEGAMENU_FALLBACK as MegaMenuData;
      } else {
        const firestoreData = result.data as any;
        console.log('📊 [MegaMenu] Datos obtenidos desde Firestore:', firestoreData);

        // Crear estructura compatible con el formato esperado
        megaMenuConfig = {
          settings: firestoreData.settings || {
            enabled: true,
            animation_duration: 300,
            hover_delay: 100,
            mobile_breakpoint: 'md',
            max_items: 10,
            last_updated: new Date().toISOString(),
            version: '1.0.0'
          },
          items: firestoreData.items || [],
          page_mappings: firestoreData.page_mappings || {},
          analytics: firestoreData.analytics || {}
        };
      }

      // Verificar que esté habilitado
      if (!megaMenuConfig.settings?.enabled) {
        console.log('🚫 [MegaMenu] Mega menú deshabilitado en configuración');
        setMenuData([]);
        return;
      }

      const transformedItems = transformJsonToMenuItems(megaMenuConfig);
      console.log('✅ [MegaMenu] Datos transformados exitosamente:', transformedItems.length, 'items');
      setMenuData(transformedItems);

    } catch (err) {
      console.error('❌ [FIRESTORE] MegaMenu error:', err);
      console.warn('⚠️ [FALLBACK] MegaMenu: Error detectado, usando fallback descriptivo');
      // Usar fallback en caso de error
      const transformedItems = transformJsonToMenuItems(MEGAMENU_FALLBACK as MegaMenuData);
      setMenuData(transformedItems);
      setError(null); // No mostrar error, solo usar fallback
    } finally {
      setIsLoading(false);
    }
  }, [transformJsonToMenuItems]);

  const trackItemClick = useCallback(async (itemId: string) => {
    try {
      console.log('📊 [MegaMenu] Registrando click en:', itemId);

      // Obtener documento actual
      const result = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'main');

      if (!result.success || !result.data) {
        console.warn('⚠️ [MegaMenu] No se pudo obtener documento para tracking');
        return;
      }

      const currentData = result.data as any;
      const currentAnalytics = currentData.analytics || {};
      const currentItems = currentData.items || [];

      // Actualizar contador del item específico
      const updatedItems = currentItems.map((item: any) =>
        item.id === itemId
          ? { ...item, click_count: (item.click_count || 0) + 1 }
          : item
      );

      // Actualizar analytics globales
      const updatedAnalytics = {
        ...currentAnalytics,
        total_clicks: (currentAnalytics.total_clicks || 0) + 1,
        last_interaction: new Date().toISOString(),
        most_clicked_item: itemId, // Simplificado por ahora
        popular_links: currentAnalytics.popular_links || []
      };

      // Actualizar documento en Firestore
      await FirestoreCore.updateDocument(COLLECTIONS.MEGAMENU, 'main', {
        items: updatedItems,
        analytics: updatedAnalytics
      });

      console.log('✅ [MegaMenu] Click registrado exitosamente');
    } catch (error) {
      console.error('❌ [MegaMenu] Error registrando click:', error);
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