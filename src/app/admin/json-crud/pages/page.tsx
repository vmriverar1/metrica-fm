'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Edit, Eye, Plus, Trash2, Download, Upload, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import DynamicForm from '@/components/admin/DynamicForm';
// import HomeConfigWizard from '@/components/admin/HomeConfigWizard';
// import { useSetupWizard } from '@/hooks/useSetupWizard';

interface PageData {
  id: string;
  name: string;
  title: string;
  description: string;
  path: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  size: string;
  type: 'static' | 'dynamic';
  metadata?: {
    author?: string;
    tags?: string[];
    category?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

const PagesManagement = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  // Setup Wizard
  const setupWizard = {
    showWizard: false,
    isFirstTime: true,
    hideWizard: () => {},
    completeSetup: () => {},
    getSetupProgress: (_data: any) => 0,
    getRecommendations: (_data: any) => [],
    shouldShowWizard: () => false
  };
  const [showWizardOverride, setShowWizardOverride] = useState(false);
  const router = useRouter();

  // Simulación de datos de páginas estáticas
  useEffect(() => {
    const mockPages: PageData[] = [
      {
        id: 'home',
        name: 'home.json',
        title: 'Página Principal',
        description: 'Contenido de la página principal del sitio',
        path: '/public/json/pages/home.json',
        status: 'active',
        lastModified: '2025-08-20T10:00:00Z',
        size: '15.2 KB',
        type: 'static',
        metadata: {
          author: 'Admin',
          tags: ['homepage', 'landing'],
          category: 'main',
          seoTitle: 'Métrica DIP - Dirección Integral de Proyectos',
          seoDescription: 'Empresa líder en dirección integral de proyectos en Perú'
        }
      },
      {
        id: 'historia',
        name: 'historia.json',
        title: 'Historia de la Empresa',
        description: 'Información sobre la historia y evolución de Métrica DIP',
        path: '/public/json/pages/historia.json',
        status: 'active',
        lastModified: '2025-08-20T09:30:00Z',
        size: '8.7 KB',
        type: 'static',
        metadata: {
          author: 'Content Team',
          tags: ['about', 'history'],
          category: 'about',
          seoTitle: 'Historia - Métrica DIP',
          seoDescription: 'Conoce la historia y evolución de Métrica DIP'
        }
      },
      {
        id: 'portfolio',
        name: 'portfolio.json',
        title: 'Portafolio',
        description: 'Configuración y contenido del portafolio de proyectos',
        path: '/public/json/pages/portfolio.json',
        status: 'active',
        lastModified: '2025-08-21T14:30:00Z',
        size: '32.8 KB',
        type: 'dynamic',
        metadata: {
          author: 'Portfolio Team',
          tags: ['portfolio', 'projects'],
          category: 'showcase',
          seoTitle: 'Portafolio - Métrica DIP',
          seoDescription: 'Descubre nuestros proyectos exitosos'
        }
      },
      {
        id: 'careers',
        name: 'careers.json',
        title: 'Bolsa de Trabajo',
        description: 'Configuración de la sección de empleos y oportunidades',
        path: '/public/json/pages/careers.json',
        status: 'active',
        lastModified: '2025-08-21T14:15:00Z',
        size: '26.7 KB',
        type: 'dynamic',
        metadata: {
          author: 'HR Team',
          tags: ['careers', 'jobs'],
          category: 'recruitment',
          seoTitle: 'Carreras - Métrica DIP',
          seoDescription: 'Únete a nuestro equipo de profesionales'
        }
      },
      {
        id: 'contact',
        name: 'contact.json',
        title: 'Página de Contacto',
        description: 'Información de contacto, formularios y FAQ',
        path: '/public/json/pages/contact.json',
        status: 'active',
        lastModified: '2025-08-21T10:00:00Z',
        size: '9.4 KB',
        type: 'static',
        metadata: {
          author: 'Admin',
          tags: ['contact', 'forms', 'faq'],
          category: 'contact',
          seoTitle: 'Contáctanos - Métrica DIP',
          seoDescription: 'Ponte en contacto con nuestro equipo de expertos'
        }
      },
      {
        id: 'blog',
        name: 'blog.json',
        title: 'Configuración del Blog',
        description: 'Configuración, categorías y contenido del blog',
        path: '/public/json/pages/blog.json',
        status: 'active',
        lastModified: '2025-08-21T11:30:00Z',
        size: '18.7 KB',
        type: 'dynamic',
        metadata: {
          author: 'Admin',
          tags: ['blog', 'content', 'categories'],
          category: 'content',
          seoTitle: 'Blog - Métrica DIP',
          seoDescription: 'Insights y experiencias en infraestructura'
        }
      },
      {
        id: 'services',
        name: 'services.json',
        title: 'Página de Servicios',
        description: 'Catálogo completo de servicios y configuración',
        path: '/public/json/pages/services.json',
        status: 'active',
        lastModified: '2025-08-21T11:45:00Z',
        size: '24.2 KB',
        type: 'static',
        metadata: {
          author: 'Admin',
          tags: ['services', 'catalog', 'testimonials'],
          category: 'services',
          seoTitle: 'Servicios - Métrica DIP',
          seoDescription: 'Soluciones integrales en infraestructura'
        }
      },
      {
        id: 'compromiso',
        name: 'compromiso.json',
        title: 'Responsabilidad Social',
        description: 'Compromisos, valores y responsabilidad social corporativa',
        path: '/public/json/pages/compromiso.json',
        status: 'active',
        lastModified: '2025-08-21T12:00:00Z',
        size: '16.3 KB',
        type: 'static',
        metadata: {
          author: 'Admin',
          tags: ['compromiso', 'responsabilidad', 'sostenibilidad'],
          category: 'corporate',
          seoTitle: 'Nuestro Compromiso - Métrica DIP',
          seoDescription: 'Responsabilidad social y desarrollo sostenible'
        }
      },
      {
        id: 'cultura',
        name: 'cultura.json',
        title: 'Cultura Organizacional',
        description: 'Cultura, valores y ambiente de trabajo en Métrica DIP',
        path: '/public/json/pages/cultura.json',
        status: 'active',
        lastModified: '2025-08-21T14:00:00Z',
        size: '28.5 KB',
        type: 'static',
        metadata: {
          author: 'HR Team',
          tags: ['cultura', 'valores', 'equipo', 'beneficios'],
          category: 'corporate',
          seoTitle: 'Cultura Organizacional - Métrica DIP',
          seoDescription: 'Descubre la cultura, valores y ambiente de trabajo en Métrica DIP'
        }
      },
      {
        id: 'iso',
        name: 'iso.json',
        title: 'Certificación ISO',
        description: 'Información sobre certificaciones y estándares de calidad',
        path: '/public/json/pages/iso.json',
        status: 'draft',
        lastModified: '2025-08-19T16:20:00Z',
        size: '6.8 KB',
        type: 'static',
        metadata: {
          author: 'Quality Team',
          tags: ['iso', 'quality'],
          category: 'certification',
          seoTitle: 'Certificación ISO - Métrica DIP',
          seoDescription: 'Estándares de calidad y certificaciones ISO'
        }
      }
    ];

    setTimeout(() => {
      setPages(mockPages);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'static' ? 
      <FileText className="h-4 w-4 text-blue-500" /> : 
      <FileText className="h-4 w-4 text-green-500" />;
  };

  const handleEditPage = async (page: PageData) => {
    console.log('🔄 [EDIT PAGE] Iniciando carga de datos para:', page.name);
    
    // ✅ Todas las páginas usan ahora el editor estándar unificado
    // Las redirecciones especiales se han eliminado para consistencia
    
    
    try {
      // Cargar datos reales del archivo JSON
      const realData = await loadPageData(page.name);
      
      console.log('✅ [EDIT PAGE] Datos cargados exitosamente:', {
        fileName: page.name,
        hasData: !!realData,
        dataKeys: realData ? Object.keys(realData) : [],
        sampleData: realData ? {
          pageTitle: realData.page?.title,
          hasTimeline: !!realData.timeline_events,
          hasMetrics: !!realData.achievement_summary
        } : null
      });

      const pageWithRealData = { ...page, ...realData };
      
      // Debug: Verificar que los datos se están mapeando correctamente
      console.log('🔍 [EDIT PAGE] Verificando mapeo de datos para formulario:', {
        fileName: page.name,
        pageWithRealData: pageWithRealData,
        testMappings: {
          'page.title': pageWithRealData.page?.title,
          'page.subtitle': pageWithRealData.page?.subtitle,
          'achievement_summary.title': pageWithRealData.achievement_summary?.title,
        },
        schemaFields: getFormSchema(page.name)?.fields?.length || 0
      });
      
      setSelectedPage(pageWithRealData);
      setIsEditing(true);
      setActiveTab('edit');
      
    } catch (error) {
      console.error('❌ [EDIT PAGE] Error al cargar datos:', {
        fileName: page.name,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Mostrar el formulario vacío si hay error
      setSelectedPage(page);
      setIsEditing(true);
      setActiveTab('edit');
      
      alert(`Error al cargar los datos del archivo ${page.name}. Se mostrará el formulario vacío.`);
    }
  };

  const loadPageData = async (fileName: string): Promise<any> => {
    const slug = fileName.replace('.json', '');
    const apiUrl = `/api/admin/pages/${slug}`;
    
    console.log('📡 [LOAD PAGE DATA] Iniciando llamada a API:', {
      fileName,
      slug,
      apiUrl,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(apiUrl);
      
      console.log('📡 [LOAD PAGE DATA] Respuesta de API recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log('📄 [LOAD PAGE DATA] JSON parseado:', {
          success: result.success,
          hasData: !!result.data,
          dataStructure: result.data ? {
            hasContent: !!result.data.content,
            contentKeys: result.data.content ? Object.keys(result.data.content) : [],
            contentPreview: result.data.content ? {
              page: result.data.content.page ? Object.keys(result.data.content.page) : null,
              timelineEventsCount: result.data.content.timeline_events?.length || 0,
              hasAchievements: !!result.data.content.achievement_summary
            } : null
          } : null
        });

        if (result.success && result.data) {
          console.log('✅ [LOAD PAGE DATA] Datos extraídos correctamente');
          return result.data.content;
        } else {
          console.warn('⚠️ [LOAD PAGE DATA] API respondió OK pero sin datos válidos:', result);
          return {};
        }
      } else {
        const errorText = await response.text();
        console.error('❌ [LOAD PAGE DATA] Error HTTP:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        return {};
      }
    } catch (error) {
      console.error('💥 [LOAD PAGE DATA] Error en fetch:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl
      });
      return {};
    }
  };

  const handleViewPage = (page: PageData) => {
    setSelectedPage(page);
    setIsEditing(false);
    setActiveTab('view');
  };

  const handleSavePage = async (data: any) => {
    if (selectedPage) {
      try {
        const slug = selectedPage.name.replace('.json', '');
        const response = await fetch(`/api/admin/pages/${slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: data
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Actualizar la lista local con la nueva fecha de modificación
            setPages(prev => prev.map(p => 
              p.id === selectedPage.id 
                ? { ...p, lastModified: new Date().toISOString() }
                : p
            ));
            
            alert('Página guardada exitosamente');
            
            // Si es la página home y completó el setup, marcar como completado
            if (selectedPage.name === 'home') {
              const progress = setupWizard.getSetupProgress(data);
              if (progress >= 80) {
                setupWizard.completeSetup(['basic_info', 'hero_section', 'rotating_words']);
              }
            }
            
            setActiveTab('list');
            setSelectedPage(null);
          } else {
            alert(`Error: ${result.message}`);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error saving page:', error);
        alert('Error al guardar la página');
      }
    }
  };

  // Wizard handlers
  const handleWizardComplete = async (wizardData: any) => {
    try {
      // Guardar datos del wizard
      await handleSavePage(wizardData);
      
      // Marcar setup como completado
      setupWizard.completeSetup([
        'basic_info',
        'hero_section', 
        'rotating_words',
        'statistics',
        'main_service'
      ]);
      
      setupWizard.hideWizard();
      setShowWizardOverride(false);
      
      alert('¡Configuración inicial completada exitosamente!');
    } catch (error) {
      console.error('Error completing wizard:', error);
      alert('Error al completar la configuración');
    }
  };

  const handleWizardCancel = () => {
    setupWizard.hideWizard();
    setShowWizardOverride(false);
  };

  const shouldShowWizardForPage = (page: PageData) => {
    return page.name === 'home' && 
           (setupWizard.showWizard || showWizardOverride || setupWizard.shouldShowWizard(page));
  };

  // Helper functions for preview
  const getPreviewUrl = (page: PageData): string => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://metrica-dip.com' 
      : 'http://localhost:9002';
    
    // Map page names to actual URLs
    const pageUrls: Record<string, string> = {
      'home.json': '/',
      'historia.json': '/historia',
      'portfolio.json': '/portfolio',
      'careers.json': '/careers',
      'contact.json': '/contacto',
      'blog.json': '/blog',
      'services.json': '/servicios',
      'compromiso.json': '/compromiso',
      'cultura.json': '/cultura',
      'iso.json': '/iso'
    };
    
    const pagePath = pageUrls[page.name] || '/';
    return `${baseUrl}${pagePath}`;
  };

  const getPagePath = (page: PageData): string => {
    const pageUrls: Record<string, string> = {
      'home.json': '/',
      'historia.json': '/historia',
      'portfolio.json': '/portfolio',
      'careers.json': '/careers',
      'contact.json': '/contacto',
      'blog.json': '/blog',
      'services.json': '/servicios',
      'compromiso.json': '/compromiso',
      'cultura.json': '/cultura',
      'iso.json': '/iso'
    };
    
    return pageUrls[page.name] || '/';
  };


  const columns = [
    {
      key: 'name',
      label: 'Archivo',
      render: (value: string, row: PageData) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.type)}
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Título',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value === 'active' ? 'Activa' : value === 'draft' ? 'Borrador' : 'Archivada'}
        </Badge>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: string) => (
        <Badge variant={value === 'static' ? 'secondary' : 'default'}>
          {value === 'static' ? 'Estática' : 'Dinámica'}
        </Badge>
      )
    },
    {
      key: 'lastModified',
      label: 'Modificado',
      render: (value: string) => new Date(value).toLocaleDateString('es-ES')
    },
    {
      key: 'size',
      label: 'Tamaño',
      render: (value: string) => <span className="text-sm text-gray-500">{value}</span>
    }
  ];

  const actions = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: handleViewPage,
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditPage,
      color: 'text-green-600 hover:text-green-800'
    }
  ];

  // Esquemas de formulario por tipo de página
  const getFormSchema = (pageName: string) => {
    console.log('🔍 [GET FORM SCHEMA] Buscando schema para:', pageName);
    switch (pageName) {
      case 'historia.json':
      case 'about-historia.json':
        return {
          title: '',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y hero de la página',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'timeline_manager',
              label: 'Editor de Timeline',
              description: 'Gestión visual de eventos históricos con imágenes y métricas',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'achievement_stats',
              label: 'Estadísticas de Logros',
              description: 'Editor dinámico de métricas principales',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'call_to_action',
              label: 'Call to Action Final',
              description: 'Sección de llamada a la acción al final de la página',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // Page Info Group - usando componentes avanzados
            {
              key: 'page.title',
              label: 'Título Principal',
              type: 'text' as const,
              required: true,
              maxLength: 60,
              group: 'page_info',
              description: 'Título principal que aparece en el hero'
            },
            {
              key: 'page.subtitle',
              label: 'Subtítulo',
              type: 'text' as const,
              required: true,
              maxLength: 120,
              group: 'page_info',
              description: 'Subtítulo descriptivo del hero'
            },
            {
              key: 'page.description',
              label: 'Descripción Principal',
              type: 'textarea' as const,
              required: true,
              rows: 3,
              maxLength: 300,
              group: 'page_info',
              description: 'Descripción que aparece bajo el hero'
            },
            {
              key: 'page.hero_image',
              label: 'Imagen Hero Principal',
              type: 'custom' as const,
              component: 'image-field' as const,
              required: false,
              group: 'page_info',
              description: 'Imagen principal del hero (externa o subida)'
            },
            {
              key: 'page.hero_image_fallback',
              label: 'Imagen Hero Fallback',
              type: 'text' as const,
              placeholder: '/img/historia-hero.jpg',
              group: 'page_info',
              description: 'Imagen alternativa si falla la principal'
            },
            {
              key: 'page.hero_video',
              label: 'Video Hero',
              type: 'custom' as const,
              component: 'video-field' as const,
              required: false,
              group: 'page_info',
              description: 'Video de fondo para el hero (opcional)'
            },
            {
              key: 'page.hero_video_fallback',
              label: 'Video Hero Fallback',
              type: 'text' as const,
              placeholder: '/video/historia-hero.mp4',
              group: 'page_info',
              description: 'Video alternativo local'
            },

            // Timeline Manager - usando componente especializado
            {
              key: 'timeline_events',
              label: 'Eventos del Timeline',
              type: 'custom' as const,
              component: 'timeline-builder' as const,
              required: false,
              group: 'timeline_manager',
              description: 'Editor visual para crear y gestionar eventos históricos con imágenes, métricas y galerías',
              config: {
                maxEvents: 10,
                showMetrics: true,
                showGallery: true,
                showAchievements: true,
                fieldsConfig: {
                  year: { required: true, min: 1990, max: 2030 },
                  title: { required: true, maxLength: 100 },
                  subtitle: { required: true, maxLength: 150 },
                  description: { required: true, maxLength: 500 },
                  image: { type: 'image-field', required: false },
                  achievements: { type: 'list', maxItems: 10 },
                  gallery: { type: 'image-gallery', maxImages: 6 },
                  impact: { maxLength: 300 },
                  metrics: {
                    team_size: { type: 'number', min: 0 },
                    projects: { type: 'number', min: 0 },
                    investment: { type: 'text', placeholder: '$1.2M' }
                  }
                }
              }
            },

            // Achievement Stats - usando componente de estadísticas
            {
              key: 'achievement_summary.title',
              label: 'Título de Logros',
              type: 'text' as const,
              required: true,
              maxLength: 50,
              group: 'achievement_stats',
              description: 'Título de la sección de logros'
            },
            {
              key: 'achievement_summary.metrics',
              label: 'Métricas Principales',
              type: 'custom' as const,
              component: 'statistics-builder' as const,
              required: false,
              group: 'achievement_stats',
              description: 'Editor dinámico de métricas y estadísticas principales',
              config: {
                maxStats: 6,
                fieldsConfig: {
                  number: { required: true, placeholder: '200+' },
                  label: { required: true, maxLength: 50, placeholder: 'Proyectos Completados' },
                  description: { required: true, maxLength: 100, placeholder: 'Desde complejos hospitalarios hasta centros comerciales' },
                  icon: { type: 'icon-picker', required: false },
                  color: { type: 'color-picker', default: '#003F6F' }
                }
              }
            },

            // Call to Action - sección final de la página
            {
              key: 'call_to_action.title',
              label: 'Título del Call to Action',
              type: 'text' as const,
              required: true,
              maxLength: 80,
              group: 'call_to_action',
              description: 'Título principal de la llamada a la acción'
            },
            {
              key: 'call_to_action.description',
              label: 'Descripción',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 200,
              group: 'call_to_action',
              description: 'Texto descriptivo que acompaña al call to action'
            },
            {
              key: 'call_to_action.primary_button.text',
              label: 'Texto Botón Principal',
              type: 'text' as const,
              required: true,
              maxLength: 30,
              group: 'call_to_action',
              description: 'Texto del botón principal'
            },
            {
              key: 'call_to_action.primary_button.href',
              label: 'Enlace Botón Principal',
              type: 'text' as const,
              required: true,
              maxLength: 100,
              group: 'call_to_action',
              description: 'URL o ruta del botón principal'
            },
            {
              key: 'call_to_action.secondary_button.text',
              label: 'Texto Botón Secundario',
              type: 'text' as const,
              required: true,
              maxLength: 30,
              group: 'call_to_action',
              description: 'Texto del botón secundario'
            },
            {
              key: 'call_to_action.secondary_button.href',
              label: 'Enlace Botón Secundario',
              type: 'text' as const,
              required: true,
              maxLength: 100,
              group: 'call_to_action',
              description: 'URL o ruta del botón secundario'
            }
          ]
        };

      case 'cultura.json':
        return {
          title: 'Editor de Cultura Organizacional',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Meta información SEO',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_basic',
              label: 'Contenido del Hero',
              description: 'Títulos, subtítulo e imagen de fondo',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_gallery',
              label: 'Galería del Hero (9 imágenes)',
              description: 'Grid 3x3 de imágenes del equipo para el hero',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'values_section',
              label: 'Sección de Valores',
              description: 'Configuración de la sección de valores empresariales',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'culture_stats',
              label: 'Estadísticas de Cultura',
              description: 'Métricas organizadas por categorías',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'team_section',
              label: 'Configuración del Equipo',
              description: 'Títulos y subtítulos de las secciones del equipo',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'team_members',
              label: 'Miembros del Equipo (Editor)',
              description: 'Editor completo de miembros individuales con roles y perfiles',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'team_moments',
              label: 'Momentos Destacados (Editor)',
              description: 'Editor de galería de momentos especiales y celebraciones',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'technologies',
              label: 'Centro de Innovación',
              description: 'Tecnologías implementadas en la empresa',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // Page Info Group
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              maxLength: 60,
              group: 'page_info',
              description: 'Título que aparece en el navegador y motores de búsqueda'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              rows: 3,
              maxLength: 160,
              group: 'page_info',
              description: 'Descripción meta para SEO'
            },

            // Hero Section Group
            {
              key: 'hero.title',
              label: 'Título Principal',
              type: 'text' as const,
              required: true,
              maxLength: 40,
              group: 'hero_basic',
              placeholder: 'Ej: Cultura y Personas',
              description: 'Título principal que aparece en grande en el hero'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo Descriptivo',
              type: 'textarea' as const,
              required: true,
              rows: 3,
              maxLength: 200,
              group: 'hero_basic',
              placeholder: 'Un equipo multidisciplinario comprometido con la excelencia...',
              description: 'Texto descriptivo que aparece bajo el título principal'
            },
            {
              key: 'hero.background_image',
              label: 'Imagen de Fondo',
              type: 'custom' as const,
              component: 'image-field' as const,
              required: false,
              group: 'hero_basic',
              description: 'Imagen de fondo principal del hero'
            },
            {
              key: 'hero.background_image_fallback',
              label: 'Imagen de Fondo Fallback',
              type: 'text' as const,
              group: 'hero_basic',
              description: 'Imagen de respaldo local'
            },

            // Values Section
            {
              key: 'values.section.title',
              label: 'Título de Valores',
              type: 'text' as const,
              required: true,
              maxLength: 30,
              group: 'values_section',
              placeholder: 'Ej: Nuestros Valores',
              description: 'Título principal de la sección de valores empresariales'
            },
            {
              key: 'values.section.subtitle',
              label: 'Descripción de Valores',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 150,
              group: 'values_section',
              placeholder: 'Los principios que guían nuestro trabajo y definen nuestra identidad...',
              description: 'Descripción que explica la importancia de los valores empresariales'
            },

            // Culture Stats Section
            {
              key: 'culture_stats.section.title',
              label: 'Título de Estadísticas',
              type: 'text' as const,
              required: true,
              maxLength: 35,
              group: 'culture_stats',
              placeholder: 'Ej: Cultura en Números',
              description: 'Título de la sección que muestra métricas de cultura organizacional'
            },
            {
              key: 'culture_stats.section.subtitle',
              label: 'Descripción de Estadísticas',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 140,
              group: 'culture_stats',
              placeholder: 'Datos que reflejan nuestro compromiso con la excelencia...',
              description: 'Texto que explica qué representan las métricas mostradas'
            },

            // Team Section
            {
              key: 'team.section.title',
              label: 'Título del Equipo',
              type: 'text' as const,
              required: true,
              maxLength: 30,
              group: 'team_section',
              placeholder: 'Ej: Nuestro Equipo',
              description: 'Título principal de la sección que presenta al equipo'
            },
            {
              key: 'team.section.subtitle',
              label: 'Descripción del Equipo',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 140,
              group: 'team_section',
              placeholder: 'Profesionales altamente calificados comprometidos con la excelencia',
              description: 'Descripción que destaca las cualidades del equipo de trabajo'
            },
            {
              key: 'team.moments.title',
              label: 'Título de Momentos Destacados',
              type: 'text' as const,
              required: true,
              maxLength: 35,
              group: 'team_section',
              placeholder: 'Ej: Momentos Destacados',
              description: 'Título de la galería de momentos especiales del equipo'
            },
            {
              key: 'team.moments.subtitle',
              label: 'Descripción de Momentos',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 150,
              group: 'team_section',
              placeholder: 'Celebraciones, logros y experiencias que fortalecen nuestro equipo',
              description: 'Descripción de qué tipo de momentos se muestran en la galería'
            },

            // Hero Gallery Section
            {
              key: 'hero.team_gallery.columns',
              label: 'Galería de Imágenes del Equipo',
              type: 'custom' as const,
              component: 'hero-team-gallery-editor' as const,
              required: false,
              group: 'hero_gallery',
              description: 'Grid 3x3 de imágenes del equipo para el hero'
            },

            // Team Members Editor
            {
              key: 'team.members',
              label: 'Editor de Miembros del Equipo',
              type: 'custom' as const,
              component: 'team-members-editor' as const,
              required: false,
              group: 'team_members',
              description: 'Editor completo para gestionar perfiles individuales del equipo'
            },

            // Team Moments Editor
            {
              key: 'team.moments.gallery',
              label: 'Editor de Momentos Destacados',
              type: 'custom' as const,
              component: 'team-moments-editor' as const,
              required: false,
              group: 'team_moments',
              description: 'Editor de galería para momentos especiales y celebraciones'
            },

            // Technologies Section
            {
              key: 'technologies.section.title',
              label: 'Título de Innovación',
              type: 'text' as const,
              required: true,
              maxLength: 50,
              group: 'technologies',
              placeholder: 'Ej: Centro de Innovación Tecnológica',
              description: 'Título principal del centro de innovación y tecnologías'
            },
            {
              key: 'technologies.section.subtitle',
              label: 'Descripción de Innovación',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              maxLength: 180,
              group: 'technologies',
              placeholder: 'Implementamos las tecnologías más avanzadas para revolucionar la gestión...',
              description: 'Descripción del enfoque tecnológico y de innovación de la empresa'
            },
            // Advanced Editors
            {
              key: 'values.values_list',
              label: 'Editor de Valores Empresariales',
              type: 'custom' as const,
              component: 'values-editor' as const,
              group: 'values_section',
              description: 'Editor avanzado para gestionar los 6 valores empresariales con iconos, colores e imágenes'
            },
            {
              key: 'culture_stats',
              label: 'Editor de Estadísticas de Cultura',
              type: 'custom' as const,
              component: 'culture-stats-editor' as const,
              group: 'culture_stats',
              description: 'Editor avanzado para estadísticas organizadas por categorías (historia, equipo, alcance, logros)'
            },
            {
              key: 'technologies',
              label: 'Editor de Centro de Innovación',
              type: 'custom' as const,
              component: 'technologies-editor' as const,
              group: 'technologies',
              description: 'Editor avanzado para tecnologías con características, imágenes y casos de estudio'
            }
          ]
        };

      case 'iso.json':
        return {
          title: 'Editor Completo - Certificación ISO 9001:2015',
          groups: [
            {
              name: 'page_info',
              label: '📄 Información de la Página',
              description: 'Configuración SEO y meta información para el posicionamiento web',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_certificate',
              label: '🏆 Hero & Certificado',
              description: 'Banner principal, estadísticas y detalles oficiales del certificado ISO 9001:2015',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'introduction_benefits',
              label: '💡 Introducción & Beneficios ISO',
              description: 'Explicación de ISO 9001, beneficios clave, alcance de certificación e importancia',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'quality_policy_commitments',
              label: '📋 Política de Calidad & Compromisos',
              description: 'Documento oficial de calidad, compromisos empresariales y objetivos estratégicos',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'client_benefits_testimonials',
              label: '👥 Beneficios para Clientes & Testimonios',
              description: 'Ventajas tangibles para clientes y testimonios reales sobre calidad certificada',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'process_standards',
              label: '⚙️ Procesos & Estándares',
              description: 'Metodología ISO 9001 por fases, certificaciones adicionales y cumplimiento normativo',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'metrics_audit',
              label: '📊 KPIs & Auditorías',
              description: 'Indicadores de calidad medibles, cronograma de auditorías y resultados históricos',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
                      // Page Info Group
                      {
                        key: 'page.title',
                        label: 'Título SEO',
                        type: 'text' as const,
                        required: true,
                        group: 'page_info',
                        description: 'Título optimizado para motores de búsqueda (máximo 60 caracteres recomendados)',
                        placeholder: 'ISO 9001:2015 Certificación | Métrica DIP - Calidad Garantizada'
                      },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info',
              description: 'Meta descripción para buscadores (150-160 caracteres óptimo)',
              placeholder: 'Métrica DIP cuenta con certificación ISO 9001:2015. Garantizamos excelencia en gestión de proyectos...'
            },

            // Hero Section Group
            {
              key: 'hero.title',
              label: 'Título Principal Hero',
              type: 'text' as const,
              required: true,
              group: 'hero_certificate',
              description: 'Título principal visible en la cabecera de la página',
              placeholder: 'ISO 9001'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo Hero',
              type: 'text' as const,
              required: true,
              group: 'hero_certificate',
              description: 'Subtítulo complementario del hero',
              placeholder: 'Certificación 2015'
            },
            {
              key: 'hero.description',
              label: 'Descripción Hero',
              type: 'textarea' as const,
              required: true,
              group: 'hero_certificate',
              description: 'Descripción principal que explica el valor de la certificación',
              placeholder: 'Excelencia certificada en gestión de proyectos de construcción e infraestructura'
            },
            {
              key: 'hero.background_gradient',
              label: 'Gradiente de Fondo CSS',
              type: 'text' as const,
              group: 'hero_certificate',
              description: 'Clases de Tailwind CSS para el gradiente de fondo del hero',
              placeholder: 'from-[#003F6F] via-[#002A4D] to-[#001A33]'
            },
            {
              key: 'hero.certification_status.is_valid',
              label: 'Certificación Vigente',
              type: 'checkbox' as const,
              group: 'hero_certificate',
              description: 'Indica si la certificación está actualmente vigente'
            },
            {
              key: 'hero.certification_status.status_text',
              label: 'Texto del Estado',
              type: 'text' as const,
              group: 'hero_certificate',
              description: 'Texto descriptivo del estado de la certificación',
              placeholder: 'Certificación Vigente'
            },
            {
              key: 'hero.certification_status.since_year',
              label: 'Certificado Desde (Año)',
              type: 'text' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.stats.certification_years',
              label: 'Años de Certificación',
              type: 'text' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.stats.certified_projects',
              label: 'Proyectos Certificados',
              type: 'text' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.stats.average_satisfaction',
              label: 'Satisfacción Promedio',
              type: 'text' as const,
              group: 'hero_certificate'
            },

            // Certificate Details
            {
              key: 'hero.certificate_details.certifying_body',
              label: 'Entidad Certificadora',
              type: 'text' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.certificate_details.certificate_number',
              label: 'Número de Certificado',
              type: 'text' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.certificate_details.issue_date',
              label: 'Fecha de Emisión',
              type: 'date' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.certificate_details.expiry_date',
              label: 'Fecha de Vencimiento',
              type: 'date' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.certificate_details.verification_url',
              label: 'URL de Verificación',
              type: 'url' as const,
              group: 'hero_certificate'
            },
            {
              key: 'hero.certificate_details.pdf_url',
              label: 'URL del Certificado PDF',
              type: 'custom' as const,
              component: 'pdf-field' as const,
              description: 'Sube un archivo PDF o proporciona una URL externa al certificado ISO 9001',
              group: 'hero_certificate'
            },
            {
              key: 'hero.action_buttons',
              label: 'Botones de Acción Hero',
              type: 'custom' as const,
              component: 'action-buttons-editor' as const,
              description: 'Configurar botones de llamada a la acción en la sección hero',
              group: 'hero_certificate',
              customProps: { maxButtons: 3 }
            },

            // Introduction Section
            {
              key: 'introduction.section.title',
              label: 'Título Introducción',
              type: 'text' as const,
              required: true,
              group: 'introduction_benefits'
            },
            {
              key: 'introduction.section.subtitle',
              label: 'Subtítulo Introducción',
              type: 'text' as const,
              required: true,
              group: 'introduction_benefits'
            },
            {
              key: 'introduction.section.description',
              label: 'Descripción ISO 9001',
              type: 'textarea' as const,
              required: true,
              group: 'introduction_benefits'
            },
            {
              key: 'introduction.scope.title',
              label: 'Título Alcance',
              type: 'text' as const,
              group: 'introduction_benefits'
            },
            {
              key: 'introduction.scope.items',
              label: 'Elementos del Alcance',
              type: 'custom' as const,
              component: 'scope-items-editor' as const,
              description: 'Define los elementos que cubre la certificación ISO 9001',
              group: 'introduction_benefits',
              customProps: { 
                maxItems: 8,
                title: 'Alcance de Certificación',
                description: 'Define los elementos que cubre la certificación ISO 9001',
                placeholder: 'ej. Dirección integral de proyectos de construcción'
              }
            },
            {
              key: 'introduction.importance.title',
              label: 'Título Importancia',
              type: 'text' as const,
              group: 'introduction_benefits'
            },
            {
              key: 'introduction.benefits',
              label: 'Beneficios ISO 9001',
              type: 'custom' as const,
              component: 'benefits-editor' as const,
              description: 'Gestiona los beneficios clave de la certificación ISO 9001',
              group: 'introduction_benefits',
              customProps: { maxBenefits: 6 }
            },

            // Quality Policy
            {
              key: 'quality_policy.document.title',
              label: 'Título Documento Calidad',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.document.version',
              label: 'Versión Documento',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.document.last_update',
              label: 'Última Actualización',
              type: 'date' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.document.approved_by',
              label: 'Aprobado por',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.document.effective_date',
              label: 'Fecha Efectiva',
              type: 'date' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.document.next_review',
              label: 'Próxima Revisión',
              type: 'date' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.commitments',
              label: 'Compromisos de Calidad',
              type: 'custom' as const,
              component: 'commitments-editor' as const,
              description: 'Define los compromisos empresariales clave en la política de calidad ISO 9001',
              group: 'quality_policy_commitments',
              customProps: { maxCommitments: 8 }
            },
            {
              key: 'quality_policy.objectives',
              label: 'Objetivos de Calidad',
              type: 'custom' as const,
              component: 'quality-objectives-editor' as const,
              description: 'Define y gestiona los objetivos medibles de la política de calidad ISO 9001',
              group: 'quality_policy_commitments',
              customProps: { maxObjectives: 8 }
            },

            // Quality Objectives (DEPRECATED - reemplazado por editor arriba)
            {
              key: 'quality_policy.objectives.0.title',
              label: 'Objetivo 1 - Título',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.0.target',
              label: 'Objetivo 1 - Meta',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.0.current',
              label: 'Objetivo 1 - Actual',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.0.description',
              label: 'Objetivo 1 - Descripción',
              type: 'textarea' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.1.title',
              label: 'Objetivo 2 - Título',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.1.target',
              label: 'Objetivo 2 - Meta',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.1.current',
              label: 'Objetivo 2 - Actual',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.1.description',
              label: 'Objetivo 2 - Descripción',
              type: 'textarea' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.2.title',
              label: 'Objetivo 3 - Título',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.2.target',
              label: 'Objetivo 3 - Meta',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.2.current',
              label: 'Objetivo 3 - Actual',
              type: 'text' as const,
              group: 'quality_policy_commitments'
            },
            {
              key: 'quality_policy.objectives.2.description',
              label: 'Objetivo 3 - Descripción',
              type: 'textarea' as const,
              group: 'quality_policy_commitments'
            },

            // Client Benefits Section - MEJORADO con componentes especializados
            {
              key: 'client_benefits.section.title',
              label: 'Título Sección Beneficios',
              type: 'text' as const,
              required: true,
              group: 'client_benefits_testimonials',
              description: 'Título principal de la sección de beneficios para clientes'
            },
            {
              key: 'client_benefits.section.subtitle',
              label: 'Subtítulo Beneficios',
              type: 'textarea' as const,
              required: true,
              rows: 2,
              group: 'client_benefits_testimonials',
              description: 'Descripción de los beneficios tangibles de la certificación ISO 9001'
            },
            {
              key: 'client_benefits.benefits_list',
              label: 'Lista de Beneficios ISO 9001',
              type: 'custom' as const,
              component: 'client-benefits-editor' as const,
              required: false,
              group: 'client_benefits_testimonials',
              customProps: { maxBenefits: 8 },
              description: 'Editor avanzado para beneficios con íconos, colores, impacto medible, detalles y casos de estudio',
              config: {
                maxItems: 10,
                showIcons: true,
                showColors: true,
                showDetails: true,
                showCaseStudy: true,
                showImpact: true,
                iconSet: 'business', // Shield, Clock, DollarSign, TrendingUp, Users, etc.
                colorOptions: ['blue', 'green', 'orange', 'purple', 'red', 'indigo'],
                requiredFields: ['id', 'title', 'description', 'impact', 'color', 'icon', 'details', 'case_study'],
                itemStructure: {
                  id: 'text',
                  title: 'text',
                  description: 'textarea',
                  impact: 'text',
                  color: 'select',
                  icon: 'icon-select',
                  details: 'array',
                  case_study: {
                    project: 'text',
                    result: 'textarea'
                  }
                }
              }
            },

            // Testimonials Section - MEJORADO con componente especializado
            {
              key: 'testimonials.section.title',
              label: 'Título Sección Testimonios',
              type: 'text' as const,
              required: true,
              group: 'client_benefits_testimonials',
              description: 'Título principal de testimonios ISO 9001'
            },
            {
              key: 'testimonials.section.subtitle',
              label: 'Subtítulo Testimonios',
              type: 'text' as const,
              required: true,
              group: 'client_benefits_testimonials',
              description: 'Descripción sobre testimonios de calidad certificada'
            },
            {
              key: 'testimonials.testimonials_list',
              label: 'Lista de Testimonios ISO',
              type: 'custom' as const,
              component: 'testimonials-editor' as const,
              required: false,
              group: 'client_benefits_testimonials',
              customProps: { maxTestimonials: 5 },
              description: 'Editor especializado de testimonios con ratings, avatares, proyectos y empresas',
              config: {
                maxItems: 8,
                showRating: true,
                showAvatar: true,
                showProject: true,
                showCompany: true,
                showDate: true,
                requiredFields: ['id', 'quote', 'author', 'position', 'company', 'project', 'rating'],
                itemStructure: {
                  id: 'auto-generated',
                  quote: 'textarea',
                  author: 'text',
                  position: 'text',
                  company: 'text',
                  project: 'text',
                  rating: 'rating',
                  date: 'text',
                  avatar: 'image-field'
                },
                defaultRating: 5,
                maxQuoteLength: 500
              }
            },

            // Process Overview
            {
              key: 'process_overview.section.title',
              label: 'Título Proceso',
              type: 'text' as const,
              group: 'process_overview'
            },
            {
              key: 'process_overview.section.subtitle',
              label: 'Subtítulo Proceso',
              type: 'text' as const,
              group: 'process_overview'
            },

            // Process Phase 1
            {
              key: 'process_overview.phases.0.title',
              label: 'Fase 1 - Título',
              type: 'text' as const,
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.0.description',
              label: 'Fase 1 - Descripción',
              type: 'textarea' as const,
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.0.duration',
              label: 'Fase 1 - Duración',
              type: 'text' as const,
              group: 'process_overview'
            },

            // Process Phase 2
            {
              key: 'process_overview.phases.1.title',
              label: 'Fase 2 - Título',
              type: 'text' as const,
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.1.description',
              label: 'Fase 2 - Descripción',
              type: 'textarea' as const,
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.1.duration',
              label: 'Fase 2 - Duración',
              type: 'text' as const,
              group: 'process_overview'
            },

            // Certifications & Standards
            {
              key: 'certifications_standards.section.title',
              label: 'Título Certificaciones',
              type: 'text' as const,
              group: 'certifications'
            },
            {
              key: 'certifications_standards.section.subtitle',
              label: 'Subtítulo Certificaciones',
              type: 'text' as const,
              group: 'certifications'
            },

            // Main Certification - ISO 9001
            {
              key: 'certifications_standards.certifications.0.name',
              label: 'Certificación 1 - Nombre',
              type: 'text' as const,
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.description',
              label: 'Certificación 1 - Descripción',
              type: 'textarea' as const,
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.year_obtained',
              label: 'Certificación 1 - Año Obtenida',
              type: 'text' as const,
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.validity',
              label: 'Certificación 1 - Vigencia',
              type: 'text' as const,
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.certifying_body',
              label: 'Certificación 1 - Entidad',
              type: 'text' as const,
              group: 'certifications'
            },

            // Quality Metrics - Main KPIs
            {
              key: 'quality_metrics.section.title',
              label: 'Título Métricas',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.section.subtitle',
              label: 'Subtítulo Métricas',
              type: 'text' as const,
              group: 'quality_metrics'
            },

            // KPI 1 - Customer Satisfaction
            {
              key: 'quality_metrics.kpis.0.category',
              label: 'KPI 1 - Categoría',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.current_value',
              label: 'KPI 1 - Valor Actual',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.target',
              label: 'KPI 1 - Objetivo',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.trend',
              label: 'KPI 1 - Tendencia',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.description',
              label: 'KPI 1 - Descripción',
              type: 'text' as const,
              group: 'quality_metrics'
            },

            // KPI 2 - Schedule Compliance
            {
              key: 'quality_metrics.kpis.1.category',
              label: 'KPI 2 - Categoría',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.current_value',
              label: 'KPI 2 - Valor Actual',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.target',
              label: 'KPI 2 - Objetivo',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.trend',
              label: 'KPI 2 - Tendencia',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.description',
              label: 'KPI 2 - Descripción',
              type: 'text' as const,
              group: 'quality_metrics'
            },

            // KPI 3 - Budget Control
            {
              key: 'quality_metrics.kpis.2.category',
              label: 'KPI 3 - Categoría',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.current_value',
              label: 'KPI 3 - Valor Actual',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.target',
              label: 'KPI 3 - Objetivo',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.trend',
              label: 'KPI 3 - Tendencia',
              type: 'text' as const,
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.description',
              label: 'KPI 3 - Descripción',
              type: 'text' as const,
              group: 'quality_metrics'
            },

            // Audit Information
            {
              key: 'audit_information.section.title',
              label: 'Título Auditorías',
              type: 'text' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.section.subtitle',
              label: 'Subtítulo Auditorías',
              type: 'text' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.date',
              label: 'Última Auditoría - Fecha',
              type: 'date' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.result',
              label: 'Última Auditoría - Resultado',
              type: 'text' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.auditor',
              label: 'Última Auditoría - Auditor',
              type: 'text' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.recommendations',
              label: 'Última Auditoría - Recomendaciones',
              type: 'number' as const,
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.non_conformities',
              label: 'Última Auditoría - No Conformidades',
              type: 'number' as const,
              group: 'audit_info'
            }
          ]
        };
      
      case 'home.json':
        return {
          title: '',
          groups: [
            // Básicos (siempre expandidos)
            {
              name: 'page_seo',
              label: 'SEO y Metadatos',
              description: 'Configuración SEO básica del sitio',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_basic',
              label: 'Hero Principal',
              description: 'Títulos, subtítulo y CTA principal',
              collapsible: true,
              defaultExpanded: true
            },
            
            // Avanzados (colapsados por defecto)
            {
              name: 'hero_background',
              label: 'Fondo y Video Hero',
              description: 'Videos, imágenes y overlay del hero',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'hero_animations',
              label: 'Animaciones y Palabras Rotatorias',
              description: 'Palabras rotatorias y texto de transición',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'statistics_section',
              label: 'Estadísticas (4 items)',
              description: 'Números, iconos y métricas principales',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'services_config',
              label: 'Configuración de Servicios',
              description: 'Títulos y configuración general de servicios',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'services_items',
              label: 'Editor Visual de Servicios',
              description: 'Editor dinámico - puede agregar/eliminar servicios según necesidad',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'portfolio_config',
              label: 'Configuración de Portfolio',
              description: 'Títulos y configuración general del portfolio',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'portfolio_projects',
              label: 'Proyectos Destacados (4 items)',
              description: 'Lista de proyectos destacados del portfolio',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'pillars_dip',
              label: 'Pilares DIP (6 items)',
              description: 'Los 6 pilares de Dirección Integral de Proyectos',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'policies_company',
              label: 'Políticas Empresariales (8 items)',
              description: 'Las 8 políticas corporativas de la empresa',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'newsletter_setup',
              label: 'Newsletter y Suscripción',
              description: 'Configuración del formulario de newsletter',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // ===== PAGE SEO GROUP =====
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_seo',
              description: 'Título para SEO y pestaña del navegador'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_seo',
              description: 'Meta description para motores de búsqueda'
            },

            // ===== HERO BASIC GROUP =====
            {
              key: 'hero.title.main',
              label: 'Título Principal',
              type: 'text' as const,
              required: true,
              group: 'hero_basic',
              description: 'Primera línea del título principal'
            },
            {
              key: 'hero.title.secondary',
              label: 'Título Secundario',
              type: 'text' as const,
              required: true,
              group: 'hero_basic',
              description: 'Segunda línea del título principal'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo',
              type: 'text' as const,
              required: true,
              group: 'hero_basic',
              description: 'Texto que acompaña al título principal'
            },
            {
              key: 'hero.cta.text',
              label: 'Texto del Botón CTA',
              type: 'text' as const,
              required: true,
              group: 'hero_basic',
              description: 'Texto del botón de llamada a la acción'
            },
            {
              key: 'hero.cta.target',
              label: 'Enlace del Botón CTA',
              type: 'text' as const,
              required: true,
              group: 'hero_basic',
              description: 'Destino del botón (ej: #services, /contacto)'
            },

            // ===== HERO BACKGROUND GROUP =====
            {
              key: 'hero.background.video_url',
              label: 'Video de Fondo',
              type: 'video' as const,
              placeholder: 'Seleccionar video de fondo',
              group: 'hero_background',
              description: 'Video de fondo para el hero. Puedes subir un archivo o usar una URL externa (YouTube, Vimeo, etc.).'
            },
            {
              key: 'hero.background.video_url_fallback',
              label: 'URL Video Fallback',
              type: 'text' as const,
              group: 'hero_background',
              description: 'Ruta local del video como respaldo'
            },
            {
              key: 'hero.background.image_fallback',
              label: 'Imagen Fallback',
              type: 'image' as const,
              placeholder: 'Seleccionar imagen fallback',
              group: 'hero_background',
              description: 'Imagen que se muestra si el video no carga. Puedes subir un archivo o usar una URL externa.'
            },
            {
              key: 'hero.background.image_fallback_internal',
              label: 'Imagen Fallback Interna',
              type: 'text' as const,
              group: 'hero_background',
              description: 'Ruta local de imagen como último respaldo'
            },
            {
              key: 'hero.background.overlay_opacity',
              label: 'Opacidad del Overlay (0-1)',
              type: 'number' as const,
              group: 'hero_background',
              description: 'Intensidad de la capa oscura sobre el fondo',
              min: 0,
              max: 1,
              step: 0.1
            },

            // ===== HERO ANIMATIONS GROUP =====
            {
              key: 'hero.rotating_words',
              label: 'Palabras Rotatorias',
              type: 'custom' as const,
              component: 'rotating-words',
              required: true,
              group: 'hero_animations',
              description: 'Editor especializado para las palabras que rotan en la animación del hero',
              customProps: {
                maxWords: 8,
                placeholder: 'Agregue palabra...',
                preview: true
              }
            },
            {
              key: 'hero.transition_text',
              label: 'Texto de Transición',
              type: 'textarea' as const,
              required: true,
              group: 'hero_animations',
              description: 'Texto que aparece después de las palabras rotatorias'
            },

            // ===== STATISTICS SECTION GROUP =====
            {
              key: 'stats.statistics',
              label: 'Estadísticas Principales',
              type: 'custom' as const,
              component: 'statistics-grid',
              required: true,
              group: 'statistics_section',
              description: 'Editor visual para las 4 estadísticas principales del hero',
              customProps: {
                iconPicker: true,
                numberAnimation: true
              }
            },

            // ===== SERVICES CONFIG GROUP =====
            {
              key: 'services.section.title',
              label: 'Título Sección Servicios',
              type: 'text' as const,
              required: true,
              group: 'services_config',
              description: 'Título principal de la sección de servicios'
            },
            {
              key: 'services.section.subtitle',
              label: 'Subtítulo Sección Servicios',
              type: 'textarea' as const,
              required: true,
              group: 'services_config',
              description: 'Descripción general de la sección de servicios'
            },

            // ===== SERVICES ITEMS GROUP =====
            {
              key: 'services',
              label: 'Editor Visual de Servicios',
              type: 'custom' as const,
              component: 'service-builder' as const,
              required: true,
              group: 'services_items',
              description: 'Editor dinámico para servicio principal (DIP) y servicios secundarios. Puede agregar, eliminar y duplicar servicios.',
              customProps: {
                imageUpload: true,
                iconLibrary: true
              }
            },

            // ===== PORTFOLIO CONFIG GROUP =====
            {
              key: 'portfolio.section.title',
              label: 'Título Sección Portfolio',
              type: 'text' as const,
              required: true,
              group: 'portfolio_config',
              description: 'Título principal de la sección de portfolio'
            },
            {
              key: 'portfolio.section.subtitle',
              label: 'Subtítulo Sección Portfolio',
              type: 'textarea' as const,
              required: true,
              group: 'portfolio_config',
              description: 'Descripción general del portfolio'
            },
            {
              key: 'portfolio.section.cta.text',
              label: 'Texto CTA Portfolio',
              type: 'text' as const,
              group: 'portfolio_config',
              description: 'Texto del botón "Ver más"'
            },
            {
              key: 'portfolio.section.cta.url',
              label: 'URL CTA Portfolio',
              type: 'text' as const,
              group: 'portfolio_config',
              description: 'Enlace hacia la página completa del portfolio'
            },

            // ===== PORTFOLIO PROJECTS GROUP =====
            {
              key: 'portfolio.featured_projects',
              label: 'Portfolio Project Manager',
              type: 'custom' as const,
              component: 'portfolio-manager',
              required: true,
              group: 'portfolio_projects',
              description: 'Gestor visual para los 4 proyectos destacados del portfolio',
              customProps: {
                categories: ['Sanitaria', 'Educativa', 'Vial', 'Saneamiento', 'Industrial', 'Comercial'],
                imageUpload: true
              }
            },

            // ===== PILLARS DIP GROUP =====
            {
              key: 'pillars.section.title',
              label: 'Título Sección Pilares',
              type: 'text' as const,
              required: true,
              group: 'pillars_dip',
              description: 'Título de la sección "¿Qué es DIP?"'
            },
            {
              key: 'pillars.section.subtitle',
              label: 'Subtítulo Sección Pilares',
              type: 'textarea' as const,
              required: true,
              group: 'pillars_dip',
              description: 'Descripción de los pilares de DIP'
            },
            {
              key: 'pillars.pillars',
              label: 'Pillars DIP Editor',
              type: 'custom' as const,
              component: 'pillars-editor' as const,
              required: true,
              group: 'pillars_dip',
              description: 'Editor completo para los 6 pilares fundamentales de DIP',
              customProps: {
                maxPillars: 8,
                iconLibrary: true,
                imageUpload: true
              }
            },

            // ===== POLICIES COMPANY GROUP =====
            {
              key: 'policies.section.title',
              label: 'Título Sección Políticas',
              type: 'text' as const,
              required: true,
              group: 'policies_company',
              description: 'Título de las políticas empresariales'
            },
            {
              key: 'policies.section.subtitle',
              label: 'Subtítulo Sección Políticas',
              type: 'textarea' as const,
              required: true,
              group: 'policies_company',
              description: 'Descripción de las políticas corporativas'
            },
            {
              key: 'policies.policies',
              label: 'Policies Manager',
              type: 'custom' as const,
              component: 'policies-manager',
              required: true,
              group: 'policies_company',
              description: 'Gestor completo para las 8 políticas empresariales con templates',
              customProps: {
                maxPolicies: 12,
                templates: {
                  'calidad': {
                    title: 'Política de Calidad',
                    description: 'Compromiso con la excelencia en cada proyecto.',
                    icon: 'Award'
                  },
                  'seguridad': {
                    title: 'Política de Seguridad y Salud',
                    description: 'Priorizamos la seguridad de nuestros trabajadores.',
                    icon: 'Shield'
                  }
                }
              }
            },

            // ===== NEWSLETTER SETUP GROUP =====
            {
              key: 'newsletter.section.title',
              label: 'Título Newsletter',
              type: 'text' as const,
              required: true,
              group: 'newsletter_setup',
              description: 'Título de la sección de suscripción'
            },
            {
              key: 'newsletter.section.subtitle',
              label: 'Subtítulo Newsletter',
              type: 'textarea' as const,
              required: true,
              group: 'newsletter_setup',
              description: 'Descripción del beneficio de suscribirse'
            },
            {
              key: 'newsletter.form.placeholder_text',
              label: 'Placeholder del Input',
              type: 'text' as const,
              group: 'newsletter_setup',
              description: 'Texto placeholder del campo email'
            },
            {
              key: 'newsletter.form.cta_text',
              label: 'Texto Botón Suscripción',
              type: 'text' as const,
              group: 'newsletter_setup',
              description: 'Texto del botón de suscripción'
            },
            {
              key: 'newsletter.form.loading_text',
              label: 'Texto de Carga',
              type: 'text' as const,
              group: 'newsletter_setup',
              description: 'Texto mostrado durante el proceso'
            },
            {
              key: 'newsletter.form.success_message',
              label: 'Mensaje de Éxito',
              type: 'text' as const,
              group: 'newsletter_setup',
              description: 'Título del mensaje de confirmación'
            },
            {
              key: 'newsletter.form.success_description',
              label: 'Descripción de Éxito',
              type: 'text' as const,
              group: 'newsletter_setup',
              description: 'Descripción del mensaje de confirmación'
            }

          ]
        };

      case 'contact.json':
        return {
          title: 'Editor de Página de Contacto',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'contact_info',
              label: 'Información de Contacto',
              description: 'Datos de contacto principales',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'contact_info_note',
              label: 'Información de Contacto',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de contacto. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'contact_info'
            }
          ]
        };

      case 'blog.json':
        return {
          title: 'Editor de Configuración del Blog',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'blog_config',
              label: 'Configuración del Blog',
              description: 'Configuración general del blog',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'blog_config_note',
              label: 'Configuración del Blog',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de blog. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'blog_config'
            }
          ]
        };

      case 'services.json':
        return {
          title: 'Editor de Página de Servicios',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'services_info',
              label: 'Información de Servicios',
              description: 'Configuración de servicios',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'services_info_note',
              label: 'Información de Servicios',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de servicios. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'services_info'
            }
          ]
        };

      case 'compromiso.json':
        return {
          title: 'Editor de Página de Compromiso',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'commitment_info',
              label: 'Información de Compromiso',
              description: 'Contenido de compromiso social y sostenibilidad',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'commitment_info_note',
              label: 'Información de Compromiso',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de compromiso. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'commitment_info'
            }
          ]
        };

      case 'portfolio.json':
        return {
          title: 'Editor de Portafolio',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'portfolio_info',
              label: 'Información del Portafolio',
              description: 'Configuración de proyectos y portafolio',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'portfolio_info_note',
              label: 'Información del Portafolio',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de portafolio. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'portfolio_info'
            }
          ]
        };

      case 'careers.json':
        return {
          title: 'Editor de Bolsa de Trabajo',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración SEO y meta información',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'careers_info',
              label: 'Información de Carreras',
              description: 'Configuración de empleos y oportunidades',
              collapsible: true,
              defaultExpanded: true
            }
          ],
          fields: [
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea' as const,
              required: true,
              group: 'page_info'
            },
            {
              key: 'careers_info_note',
              label: 'Información de Carreras',
              type: 'textarea' as const,
              disabled: true,
              defaultValue: 'Esta página contiene estructura compleja de carreras. Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'careers_info'
            }
          ]
        };
      
      default:
        return {
          title: 'Editar Página',
          fields: [
            {
              key: 'title',
              label: 'Título',
              type: 'text' as const,
              required: true,
              placeholder: 'Título de la página'
            },
            {
              key: 'description',
              label: 'Descripción',
              type: 'textarea' as const,
              required: true,
              placeholder: 'Descripción de la página'
            },
            {
              key: 'status',
              label: 'Estado',
              type: 'select' as const,
              required: true,
              options: [
                { value: 'active', label: 'Activa' },
                { value: 'draft', label: 'Borrador' },
                { value: 'archived', label: 'Archivada' }
              ]
            }
          ]
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F6F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Gestión de Páginas</h1>
          <p className="text-gray-600 mt-1">
            Administra el contenido de las páginas estáticas del sitio web
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Páginas</TabsTrigger>
          <TabsTrigger value="view">Vista Previa</TabsTrigger>
          <TabsTrigger value="edit">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar páginas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Páginas ({filteredPages.length})
              </CardTitle>
              <CardDescription>
                Lista de todas las páginas estáticas configuradas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredPages}
                columns={columns}
                actions={actions}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view">
          {selectedPage ? (
            <div className="space-y-4">
              {/* Header with page info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vista Previa: {selectedPage.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedPage.status)}>
                        {selectedPage.status === 'active' ? 'Activa' : 
                         selectedPage.status === 'draft' ? 'Borrador' : 'Archivada'}
                      </Badge>
                      <Badge variant={selectedPage.type === 'static' ? 'secondary' : 'default'}>
                        {selectedPage.type === 'static' ? 'Estática' : 'Dinámica'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {selectedPage.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Preview Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Resolución:</label>
                        <select 
                          className="px-2 py-1 border rounded text-sm"
                          onChange={(e) => {
                            const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                            if (iframe) {
                              const [width, height] = e.target.value.split('x');
                              iframe.style.width = width + 'px';
                              iframe.style.height = height + 'px';
                            }
                          }}
                        >
                          <option value="1200x800">Desktop (1200x800)</option>
                          <option value="768x1024">Tablet (768x1024)</option>
                          <option value="375x667">Mobile (375x667)</option>
                          <option value="100%x600">Responsive</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Zoom:</label>
                        <select 
                          className="px-2 py-1 border rounded text-sm"
                          onChange={(e) => {
                            const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                            if (iframe) {
                              iframe.style.transform = `scale(${e.target.value})`;
                              iframe.style.transformOrigin = 'top left';
                            }
                          }}
                        >
                          <option value="1">100%</option>
                          <option value="0.75">75%</option>
                          <option value="0.5">50%</option>
                          <option value="0.25">25%</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                          if (iframe) {
                            iframe.src = iframe.src; // Reload iframe
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recargar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = getPreviewUrl(selectedPage);
                          window.open(url, '_blank');
                        }}
                      >
                        Abrir en Nueva Pestaña
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Iframe */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gray-100 p-4">
                    <div className="bg-white rounded shadow-lg mx-auto" style={{ width: 'fit-content' }}>
                      <iframe
                        id="preview-iframe"
                        src={getPreviewUrl(selectedPage)}
                        className="border-0 block"
                        style={{ 
                          width: '1200px', 
                          height: '800px',
                          transition: 'all 0.3s ease'
                        }}
                        onLoad={() => {
                          const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                          if (iframe) {
                            try {
                              // Try to scroll to specific sections based on page type
                              if (selectedPage.id === 'home') {
                                // For home page, show hero section
                                iframe.contentWindow?.scrollTo(0, 0);
                              } else if (selectedPage.id === 'portfolio') {
                                // For portfolio, scroll to portfolio section
                                const portfolioSection = iframe.contentDocument?.getElementById('portfolio');
                                portfolioSection?.scrollIntoView({ behavior: 'smooth' });
                              }
                            } catch (error) {
                              // Cross-origin restrictions, ignore
                              console.log('Cannot control iframe content due to cross-origin restrictions');
                            }
                          }
                        }}
                        onError={() => {
                          console.error('Failed to load preview for', selectedPage.name);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Info Footer */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600 font-medium">Archivo:</label>
                      <p className="font-mono">{selectedPage.name}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Tamaño:</label>
                      <p>{selectedPage.size}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Modificado:</label>
                      <p>{new Date(selectedPage.lastModified).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">URL:</label>
                      <p className="text-blue-600 hover:underline cursor-pointer" 
                         onClick={() => window.open(getPreviewUrl(selectedPage), '_blank')}>
                        {getPagePath(selectedPage)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vista Previa de Página</h3>
                <p className="text-gray-500 mb-4">Selecciona una página de la lista para ver cómo se ve en el sitio web</p>
                <p className="text-sm text-gray-400">La vista previa mostrará la página real con controles de zoom y resolución</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {selectedPage && isEditing ? (
            <>
              {/* Setup Wizard for Home Page */}
              {shouldShowWizardForPage(selectedPage) ? (
                <div className="space-y-6">
                  {/* Setup Status Card */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-6 w-6 text-orange-600" />
                          <div>
                            <CardTitle className="text-orange-800">
                              {setupWizard.isFirstTime ? 'Bienvenido a Métrica DIP' : 'Configuración Recomendada'}
                            </CardTitle>
                            <CardDescription className="text-orange-700">
                              {setupWizard.isFirstTime 
                                ? 'Te ayudamos a configurar tu página principal paso a paso'
                                : 'Algunos campos importantes están vacíos. ¿Te gustaría usar el wizard?'
                              }
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-orange-800 border-orange-300">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {setupWizard.getSetupProgress(selectedPage)}% Completo
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm text-orange-700">
                            El wizard te guiará por {setupWizard.isFirstTime ? 'la configuración inicial' : 'los campos faltantes'}
                          </p>
                          {setupWizard.getRecommendations(selectedPage).length > 0 && (
                            <div className="text-xs text-orange-600">
                              <strong>Recomendaciones:</strong> {setupWizard.getRecommendations(selectedPage).slice(0, 2).join(', ')}
                              {setupWizard.getRecommendations(selectedPage).length > 2 && ' y más...'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setupWizard.hideWizard();
                              setShowWizardOverride(false);
                            }}
                            size="sm"
                          >
                            Editar Manual
                          </Button>
                          <Button
                            onClick={() => setShowWizardOverride(true)}
                            className="bg-orange-600 hover:bg-orange-700"
                            size="sm"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Usar Wizard
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wizard Component - Temporarily disabled */}
                  {/* <HomeConfigWizard
                    initialData={selectedPage}
                    onComplete={handleWizardComplete}
                    onCancel={handleWizardCancel}
                  /> */}
                  <div className="text-center py-8 text-gray-500">
                    Wizard temporalmente deshabilitado
                  </div>
                </div>
              ) : (
                /* Normal Edit Form */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Editar Página: {selectedPage.name}</CardTitle>
                      {selectedPage.name === 'home' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowWizardOverride(true)}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Usar Wizard
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
{selectedPage.name === 'home' ? (
                      // Versión optimizada para home.json con todas las características avanzadas
                      <DynamicForm
                        fields={getFormSchema(selectedPage.name).fields}
                        groups={getFormSchema(selectedPage.name).groups || []}
                        title={`${getFormSchema(selectedPage.name).title} - Optimizado ⚡`}
                        subtitle="Editor avanzado con lazy loading, cache inteligente y progressive enhancement"
                        initialValues={selectedPage}
                        onSubmit={handleSavePage}
                        onCancel={() => setActiveTab('list')}
                        showPreviewButton={true}
                        previewComponent="HomePage"
                        enableSmartValidation={true}
                        showValidationPanel={true}
                        showBackupManager={true}
                        backupResource={`page_${selectedPage.name}`}
                        showPerformanceMonitor={true}
                      />
                    ) : (
                      <>
                        {/* Debug específico para historia.json */}
                        {selectedPage.name === 'historia.json' && (() => {
                          const schema = getFormSchema(selectedPage.name);
                          console.log('🔧 [DEBUG HISTORIA] Pre-render check:', {
                            pageName: selectedPage.name,
                            hasSchema: !!schema,
                            schemaTitle: schema?.title,
                            groupsCount: schema?.groups?.length || 0,
                            fieldsCount: schema?.fields?.length || 0,
                            groups: schema?.groups,
                            initialValues: selectedPage
                          });
                          return null;
                        })()}
                        
                        {/* Formulario optimizado para ISO con validaciones específicas */}
                        {selectedPage.name === 'iso.json' ? (
                          <DynamicForm
                            fields={getFormSchema(selectedPage.name).fields}
                            groups={getFormSchema(selectedPage.name).groups || []}
                            title={`${getFormSchema(selectedPage.name).title} - Con Validaciones ISO ✅`}
                            subtitle="Editor especializado con auto-save, validación de certificados y cumplimiento ISO 9001:2015"
                            initialValues={selectedPage}
                            onSubmit={handleSavePage}
                            onCancel={() => setActiveTab('list')}
                            enableISOValidation={true}
                            enableAutoSave={true}
                            autoSaveInterval={30000}
                            resource={`page_${selectedPage.name}`}
                            enableKeyboardShortcuts={true}
                            showContextualHelp={true}
                          />
                        ) : (
                          <DynamicForm
                            fields={getFormSchema(selectedPage.name).fields}
                            groups={getFormSchema(selectedPage.name).groups || []}
                            title={getFormSchema(selectedPage.name).title}
                            initialValues={selectedPage}
                            onSubmit={handleSavePage}
                            onCancel={() => setActiveTab('list')}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una página para editar</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default PagesManagement;