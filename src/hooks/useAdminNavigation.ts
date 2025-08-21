'use client';

import { useRouter } from 'next/navigation';
import { useGlobalLoading } from './useGlobalLoading';
import { useCallback } from 'react';

interface NavigationOptions {
  showLoading?: boolean;
  loadingMessage?: string;
  delay?: number;
}

export function useAdminNavigation() {
  const router = useRouter();
  const { showLoading, hideLoading, updateMessage } = useGlobalLoading();

  const navigateTo = useCallback(async (
    path: string, 
    options: NavigationOptions = {}
  ) => {
    const {
      showLoading: shouldShowLoading = true,
      loadingMessage = 'Cargando panel...',
      delay = 100
    } = options;

    try {
      if (shouldShowLoading) {
        showLoading(loadingMessage);
      }

      // Pequeño delay para mostrar el loading
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      router.push(path);

      // Auto-hide loading después de un tiempo
      setTimeout(() => {
        if (shouldShowLoading) {
          hideLoading();
        }
      }, 2000);

    } catch (error) {
      console.error('Navigation error:', error);
      if (shouldShowLoading) {
        updateMessage('Error de navegación');
        setTimeout(() => hideLoading(), 1500);
      }
    }
  }, [router, showLoading, hideLoading, updateMessage]);

  const navigateToSection = useCallback((section: string) => {
    const sectionMessages: Record<string, string> = {
      'dashboard': 'Cargando dashboard...',
      'pages': 'Cargando editor de páginas...',
      'portfolio': 'Cargando portafolio...',
      'careers': 'Cargando bolsa de trabajo...',
      'newsletter': 'Cargando newsletter...',
      'settings': 'Cargando configuración...',
      'json-crud': 'Cargando panel de contenido...',
      'production-monitor': 'Cargando monitor de producción...'
    };

    const message = sectionMessages[section] || 'Cargando...';
    navigateTo(`/admin/${section}`, { loadingMessage: message });
  }, [navigateTo]);

  const navigateToPage = useCallback((pageType: string, pageId?: string) => {
    const pageMessages: Record<string, string> = {
      'home': 'Cargando editor de página principal...',
      'contact': 'Cargando editor de contacto...',
      'services': 'Cargando editor de servicios...',
      'blog': 'Cargando editor de blog...',
      'compromiso': 'Cargando editor de compromiso...',
      'historia': 'Cargando editor de historia...',
      'cultura': 'Cargando editor de cultura...'
    };

    const message = pageMessages[pageType] || 'Cargando editor...';
    const path = pageId 
      ? `/admin/json-crud/pages/${pageType}/${pageId}`
      : `/admin/json-crud/pages/${pageType}`;
    
    navigateTo(path, { loadingMessage: message });
  }, [navigateTo]);

  const navigateToResource = useCallback((resource: string, action?: string, id?: string) => {
    const resourceMessages: Record<string, string> = {
      'articles': 'Cargando artículos...',
      'categories': 'Cargando categorías...',
      'authors': 'Cargando autores...',
      'projects': 'Cargando proyectos...',
      'jobs': 'Cargando empleos...',
      'departments': 'Cargando departamentos...'
    };

    const message = resourceMessages[resource] || 'Cargando...';
    
    let path = `/admin/json-crud/${resource}`;
    if (action) path += `/${action}`;
    if (id) path += `/${id}`;
    
    navigateTo(path, { loadingMessage: message });
  }, [navigateTo]);

  return {
    navigateTo,
    navigateToSection,
    navigateToPage,
    navigateToResource
  };
}