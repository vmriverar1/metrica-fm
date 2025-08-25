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
  // const setupWizard = useSetupWizard('home');
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
          introText: realData.introduction?.text?.substring(0, 100) + '...',
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
          'introduction.text': pageWithRealData.introduction?.text,
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
              introduction: result.data.content.introduction ? Object.keys(result.data.content.introduction) : null,
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
          title: 'Editar Historia de la Empresa',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Configuración básica de la página',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'introduction',
              label: 'Sección de Introducción',
              description: 'Contenido introductorio de la historia',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'timeline',
              label: 'Eventos del Timeline',
              description: 'Información básica del timeline (para editar eventos específicos usar herramientas avanzadas)',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'metrics',
              label: 'Métricas y Logros',
              description: 'Resumen de achievements y métricas de la empresa',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // Page Info Group
            {
              key: 'page.title',
              label: 'Título de la Página',
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.subtitle',
              label: 'Subtítulo',
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción Principal',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.hero_image',
              label: 'Imagen Hero (URL)',
              type: 'url',
              group: 'page_info'
            },
            {
              key: 'page.hero_image_fallback',
              label: 'Imagen Hero Fallback',
              type: 'text',
              group: 'page_info'
            },
            {
              key: 'page.hero_video',
              label: 'Video Hero (URL)',
              type: 'url',
              group: 'page_info'
            },
            {
              key: 'page.hero_video_fallback',
              label: 'Video Hero Fallback',
              type: 'text',
              group: 'page_info'
            },
            {
              key: 'page.url',
              label: 'URL de la Página',
              type: 'text',
              group: 'page_info'
            },

            // Introduction Group
            {
              key: 'introduction.text',
              label: 'Texto de Introducción',
              type: 'textarea',
              required: true,
              group: 'introduction'
            },
            {
              key: 'introduction.highlight',
              label: 'Texto Destacado',
              type: 'textarea',
              required: true,
              group: 'introduction'
            },
            {
              key: 'introduction.mission_statement',
              label: 'Declaración de Misión',
              type: 'textarea',
              required: true,
              group: 'introduction'
            },

            // Timeline Group (basic info only)
            {
              key: 'timeline_info',
              label: 'Información del Timeline',
              type: 'textarea',
              disabled: true,
              defaultValue: 'El timeline contiene eventos complejos. Para editarlos, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'timeline',
              description: 'Actualmente hay eventos del timeline que requieren edición manual'
            },

            // Metrics Group - Achievement Summary
            {
              key: 'achievement_summary.title',
              label: 'Título de Logros',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.0.number',
              label: 'Métrica 1 - Número',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.0.label',
              label: 'Métrica 1 - Etiqueta',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.0.description',
              label: 'Métrica 1 - Descripción',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.1.number',
              label: 'Métrica 2 - Número',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.1.label',
              label: 'Métrica 2 - Etiqueta',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.1.description',
              label: 'Métrica 2 - Descripción',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.2.number',
              label: 'Métrica 3 - Número',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.2.label',
              label: 'Métrica 3 - Etiqueta',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.2.description',
              label: 'Métrica 3 - Descripción',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.3.number',
              label: 'Métrica 4 - Número',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.3.label',
              label: 'Métrica 4 - Etiqueta',
              type: 'text',
              group: 'metrics'
            },
            {
              key: 'achievement_summary.metrics.3.description',
              label: 'Métrica 4 - Descripción',
              type: 'text',
              group: 'metrics'
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
              description: 'Meta información y configuración SEO',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_section',
              label: 'Sección Hero',
              description: 'Banner principal y galería del equipo',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'values_section',
              label: 'Valores Empresariales',
              description: 'Información básica de valores (estructura compleja requiere editor especializado)',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'culture_stats',
              label: 'Estadísticas de Cultura',
              description: 'Métricas y datos sobre la cultura organizacional',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'team_section',
              label: 'Información del Equipo',
              description: 'Configuración básica del equipo (estructura compleja requiere editor especializado)',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'technologies',
              label: 'Tecnologías',
              description: 'Información básica de tecnologías (estructura compleja requiere editor especializado)',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // Page Info Group
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },

            // Hero Section Group
            {
              key: 'hero.title',
              label: 'Título Principal',
              type: 'text',
              required: true,
              group: 'hero_section'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo',
              type: 'textarea',
              required: true,
              group: 'hero_section'
            },
            {
              key: 'hero.background_image',
              label: 'Imagen de Fondo (URL)',
              type: 'url',
              group: 'hero_section'
            },
            {
              key: 'hero.background_image_fallback',
              label: 'Imagen de Fondo Fallback',
              type: 'text',
              group: 'hero_section'
            },

            // Values Section - Basic Info Only
            {
              key: 'values_info',
              label: 'Información de Valores',
              type: 'textarea',
              disabled: true,
              defaultValue: 'Los valores contienen estructura compleja (título, descripción, iconos, ejemplos). Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'values_section',
              description: 'Para editar valores específicos, requiere herramientas avanzadas'
            },

            // Culture Stats Group
            {
              key: 'culture_stats.title',
              label: 'Título de Estadísticas',
              type: 'text',
              group: 'culture_stats'
            },
            {
              key: 'culture_stats.subtitle',
              label: 'Subtítulo de Estadísticas',
              type: 'text',
              group: 'culture_stats'
            },

            // Team Section - Basic Info Only
            {
              key: 'team_info',
              label: 'Información del Equipo',
              type: 'textarea',
              disabled: true,
              defaultValue: 'El equipo contiene estructura compleja (departamentos, miembros, perfiles). Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'team_section',
              description: 'Para editar miembros específicos del equipo, requiere herramientas avanzadas'
            },

            // Technologies Section - Basic Info Only
            {
              key: 'technologies_info',
              label: 'Información de Tecnologías',
              type: 'textarea',
              disabled: true,
              defaultValue: 'Las tecnologías contienen estructura compleja (categorías, herramientas, descripciones). Para editar completamente, use el editor JSON avanzado o contacte al desarrollador.',
              group: 'technologies',
              description: 'Para editar tecnologías específicas, requiere herramientas avanzadas'
            }
          ]
        };

      case 'iso.json':
        return {
          title: 'Editar Certificación ISO 9001',
          groups: [
            {
              name: 'page_info',
              label: 'Información de la Página',
              description: 'Meta información SEO',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'hero_section',
              label: 'Sección Hero',
              description: 'Banner principal y certificación',
              collapsible: true,
              defaultExpanded: true
            },
            {
              name: 'introduction_section',
              label: 'Introducción ISO 9001',
              description: 'Información básica y beneficios',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'quality_policy',
              label: 'Política de Calidad',
              description: 'Documento y compromisos de calidad',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'client_benefits',
              label: 'Beneficios para Clientes',
              description: 'Ventajas tangibles de la certificación',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'testimonials',
              label: 'Testimonios',
              description: 'Testimonios de clientes',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'process_overview',
              label: 'Proceso Certificado',
              description: 'Metodología ISO 9001 por fases',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'certifications',
              label: 'Certificaciones',
              description: 'Lista de certificaciones y estándares',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'quality_metrics',
              label: 'Métricas de Calidad',
              description: 'KPIs y resultados medibles',
              collapsible: true,
              defaultExpanded: false
            },
            {
              name: 'audit_info',
              label: 'Información de Auditorías',
              description: 'Cronograma y resultados de auditorías',
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // Page Info Group
            {
              key: 'page.title',
              label: 'Título SEO',
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },

            // Hero Section Group
            {
              key: 'hero.title',
              label: 'Título Principal',
              type: 'text',
              required: true,
              group: 'hero_section'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo',
              type: 'text',
              required: true,
              group: 'hero_section'
            },
            {
              key: 'hero.description',
              label: 'Descripción Hero',
              type: 'textarea',
              required: true,
              group: 'hero_section'
            },
            {
              key: 'hero.background_gradient',
              label: 'Gradiente de Fondo CSS',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.certification_status.is_valid',
              label: 'Certificación Vigente',
              type: 'checkbox',
              group: 'hero_section'
            },
            {
              key: 'hero.certification_status.status_text',
              label: 'Texto del Estado',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.certification_status.since_year',
              label: 'Certificado Desde (Año)',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.stats.certification_years',
              label: 'Años de Certificación',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.stats.certified_projects',
              label: 'Proyectos Certificados',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.stats.average_satisfaction',
              label: 'Satisfacción Promedio',
              type: 'text',
              group: 'hero_section'
            },

            // Certificate Details
            {
              key: 'hero.certificate_details.certifying_body',
              label: 'Entidad Certificadora',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.certificate_details.certificate_number',
              label: 'Número de Certificado',
              type: 'text',
              group: 'hero_section'
            },
            {
              key: 'hero.certificate_details.issue_date',
              label: 'Fecha de Emisión',
              type: 'date',
              group: 'hero_section'
            },
            {
              key: 'hero.certificate_details.expiry_date',
              label: 'Fecha de Vencimiento',
              type: 'date',
              group: 'hero_section'
            },
            {
              key: 'hero.certificate_details.verification_url',
              label: 'URL de Verificación',
              type: 'url',
              group: 'hero_section'
            },
            {
              key: 'hero.certificate_details.pdf_url',
              label: 'URL del Certificado PDF',
              type: 'text',
              group: 'hero_section'
            },

            // Introduction Section
            {
              key: 'introduction.section.title',
              label: 'Título Introducción',
              type: 'text',
              required: true,
              group: 'introduction_section'
            },
            {
              key: 'introduction.section.subtitle',
              label: 'Subtítulo Introducción',
              type: 'text',
              required: true,
              group: 'introduction_section'
            },
            {
              key: 'introduction.section.description',
              label: 'Descripción ISO 9001',
              type: 'textarea',
              required: true,
              group: 'introduction_section'
            },
            {
              key: 'introduction.scope.title',
              label: 'Título Alcance',
              type: 'text',
              group: 'introduction_section'
            },
            {
              key: 'introduction.importance.title',
              label: 'Título Importancia',
              type: 'text',
              group: 'introduction_section'
            },

            // Quality Policy
            {
              key: 'quality_policy.document.title',
              label: 'Título Documento Calidad',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.document.version',
              label: 'Versión Documento',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.document.last_update',
              label: 'Última Actualización',
              type: 'date',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.document.approved_by',
              label: 'Aprobado por',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.document.effective_date',
              label: 'Fecha Efectiva',
              type: 'date',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.document.next_review',
              label: 'Próxima Revisión',
              type: 'date',
              group: 'quality_policy'
            },

            // Quality Objectives (5 objectives from the JSON)
            {
              key: 'quality_policy.objectives.0.title',
              label: 'Objetivo 1 - Título',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.0.target',
              label: 'Objetivo 1 - Meta',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.0.current',
              label: 'Objetivo 1 - Actual',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.0.description',
              label: 'Objetivo 1 - Descripción',
              type: 'textarea',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.1.title',
              label: 'Objetivo 2 - Título',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.1.target',
              label: 'Objetivo 2 - Meta',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.1.current',
              label: 'Objetivo 2 - Actual',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.1.description',
              label: 'Objetivo 2 - Descripción',
              type: 'textarea',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.2.title',
              label: 'Objetivo 3 - Título',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.2.target',
              label: 'Objetivo 3 - Meta',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.2.current',
              label: 'Objetivo 3 - Actual',
              type: 'text',
              group: 'quality_policy'
            },
            {
              key: 'quality_policy.objectives.2.description',
              label: 'Objetivo 3 - Descripción',
              type: 'textarea',
              group: 'quality_policy'
            },

            // Client Benefits Section
            {
              key: 'client_benefits.section.title',
              label: 'Título Beneficios Cliente',
              type: 'text',
              group: 'client_benefits'
            },
            {
              key: 'client_benefits.section.subtitle',
              label: 'Subtítulo Beneficios Cliente',
              type: 'textarea',
              group: 'client_benefits'
            },

            // Testimonials Section
            {
              key: 'testimonials.section.title',
              label: 'Título Testimonios',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.section.subtitle',
              label: 'Subtítulo Testimonios',
              type: 'text',
              group: 'testimonials'
            },
            
            // Testimonial 1
            {
              key: 'testimonials.testimonials_list.0.quote',
              label: 'Testimonio 1 - Cita',
              type: 'textarea',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.0.author',
              label: 'Testimonio 1 - Autor',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.0.position',
              label: 'Testimonio 1 - Cargo',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.0.company',
              label: 'Testimonio 1 - Empresa',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.0.project',
              label: 'Testimonio 1 - Proyecto',
              type: 'text',
              group: 'testimonials'
            },
            
            // Testimonial 2
            {
              key: 'testimonials.testimonials_list.1.quote',
              label: 'Testimonio 2 - Cita',
              type: 'textarea',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.1.author',
              label: 'Testimonio 2 - Autor',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.1.position',
              label: 'Testimonio 2 - Cargo',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.1.company',
              label: 'Testimonio 2 - Empresa',
              type: 'text',
              group: 'testimonials'
            },
            {
              key: 'testimonials.testimonials_list.1.project',
              label: 'Testimonio 2 - Proyecto',
              type: 'text',
              group: 'testimonials'
            },

            // Process Overview
            {
              key: 'process_overview.section.title',
              label: 'Título Proceso',
              type: 'text',
              group: 'process_overview'
            },
            {
              key: 'process_overview.section.subtitle',
              label: 'Subtítulo Proceso',
              type: 'text',
              group: 'process_overview'
            },

            // Process Phase 1
            {
              key: 'process_overview.phases.0.title',
              label: 'Fase 1 - Título',
              type: 'text',
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.0.description',
              label: 'Fase 1 - Descripción',
              type: 'textarea',
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.0.duration',
              label: 'Fase 1 - Duración',
              type: 'text',
              group: 'process_overview'
            },

            // Process Phase 2
            {
              key: 'process_overview.phases.1.title',
              label: 'Fase 2 - Título',
              type: 'text',
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.1.description',
              label: 'Fase 2 - Descripción',
              type: 'textarea',
              group: 'process_overview'
            },
            {
              key: 'process_overview.phases.1.duration',
              label: 'Fase 2 - Duración',
              type: 'text',
              group: 'process_overview'
            },

            // Certifications & Standards
            {
              key: 'certifications_standards.section.title',
              label: 'Título Certificaciones',
              type: 'text',
              group: 'certifications'
            },
            {
              key: 'certifications_standards.section.subtitle',
              label: 'Subtítulo Certificaciones',
              type: 'text',
              group: 'certifications'
            },

            // Main Certification - ISO 9001
            {
              key: 'certifications_standards.certifications.0.name',
              label: 'Certificación 1 - Nombre',
              type: 'text',
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.description',
              label: 'Certificación 1 - Descripción',
              type: 'textarea',
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.year_obtained',
              label: 'Certificación 1 - Año Obtenida',
              type: 'text',
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.validity',
              label: 'Certificación 1 - Vigencia',
              type: 'text',
              group: 'certifications'
            },
            {
              key: 'certifications_standards.certifications.0.certifying_body',
              label: 'Certificación 1 - Entidad',
              type: 'text',
              group: 'certifications'
            },

            // Quality Metrics - Main KPIs
            {
              key: 'quality_metrics.section.title',
              label: 'Título Métricas',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.section.subtitle',
              label: 'Subtítulo Métricas',
              type: 'text',
              group: 'quality_metrics'
            },

            // KPI 1 - Customer Satisfaction
            {
              key: 'quality_metrics.kpis.0.category',
              label: 'KPI 1 - Categoría',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.current_value',
              label: 'KPI 1 - Valor Actual',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.target',
              label: 'KPI 1 - Objetivo',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.trend',
              label: 'KPI 1 - Tendencia',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.0.description',
              label: 'KPI 1 - Descripción',
              type: 'text',
              group: 'quality_metrics'
            },

            // KPI 2 - Schedule Compliance
            {
              key: 'quality_metrics.kpis.1.category',
              label: 'KPI 2 - Categoría',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.current_value',
              label: 'KPI 2 - Valor Actual',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.target',
              label: 'KPI 2 - Objetivo',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.trend',
              label: 'KPI 2 - Tendencia',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.1.description',
              label: 'KPI 2 - Descripción',
              type: 'text',
              group: 'quality_metrics'
            },

            // KPI 3 - Budget Control
            {
              key: 'quality_metrics.kpis.2.category',
              label: 'KPI 3 - Categoría',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.current_value',
              label: 'KPI 3 - Valor Actual',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.target',
              label: 'KPI 3 - Objetivo',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.trend',
              label: 'KPI 3 - Tendencia',
              type: 'text',
              group: 'quality_metrics'
            },
            {
              key: 'quality_metrics.kpis.2.description',
              label: 'KPI 3 - Descripción',
              type: 'text',
              group: 'quality_metrics'
            },

            // Audit Information
            {
              key: 'audit_information.section.title',
              label: 'Título Auditorías',
              type: 'text',
              group: 'audit_info'
            },
            {
              key: 'audit_information.section.subtitle',
              label: 'Subtítulo Auditorías',
              type: 'text',
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.date',
              label: 'Última Auditoría - Fecha',
              type: 'date',
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.result',
              label: 'Última Auditoría - Resultado',
              type: 'text',
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.auditor',
              label: 'Última Auditoría - Auditor',
              type: 'text',
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.recommendations',
              label: 'Última Auditoría - Recomendaciones',
              type: 'number',
              group: 'audit_info'
            },
            {
              key: 'audit_information.audit_results.last_external_audit.non_conformities',
              label: 'Última Auditoría - No Conformidades',
              type: 'number',
              group: 'audit_info'
            }
          ]
        };
      
      case 'home.json':
        return {
          title: 'Editar Página Principal - Optimizado',
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
              label: 'Servicios Individuales (5 items)',
              description: 'Servicio principal + 4 servicios secundarios',
              collapsible: true,
              defaultExpanded: false
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
              type: 'text',
              required: true,
              group: 'page_seo',
              description: 'Título para SEO y pestaña del navegador'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_seo',
              description: 'Meta description para motores de búsqueda'
            },

            // ===== HERO BASIC GROUP =====
            {
              key: 'hero.title.main',
              label: 'Título Principal',
              type: 'text',
              required: true,
              group: 'hero_basic',
              description: 'Primera línea del título principal'
            },
            {
              key: 'hero.title.secondary',
              label: 'Título Secundario',
              type: 'text',
              required: true,
              group: 'hero_basic',
              description: 'Segunda línea del título principal'
            },
            {
              key: 'hero.subtitle',
              label: 'Subtítulo',
              type: 'text',
              required: true,
              group: 'hero_basic',
              description: 'Texto que acompaña al título principal'
            },
            {
              key: 'hero.cta.text',
              label: 'Texto del Botón CTA',
              type: 'text',
              required: true,
              group: 'hero_basic',
              description: 'Texto del botón de llamada a la acción'
            },
            {
              key: 'hero.cta.target',
              label: 'Enlace del Botón CTA',
              type: 'text',
              required: true,
              group: 'hero_basic',
              description: 'Destino del botón (ej: #services, /contacto)'
            },

            // ===== HERO BACKGROUND GROUP =====
            {
              key: 'hero.background.video_url',
              label: 'URL Video Principal',
              type: 'url',
              group: 'hero_background',
              description: 'URL del video de fondo (externa)'
            },
            {
              key: 'hero.background.video_url_fallback',
              label: 'URL Video Fallback',
              type: 'text',
              group: 'hero_background',
              description: 'Ruta local del video como respaldo'
            },
            {
              key: 'hero.background.image_fallback',
              label: 'Imagen Fallback Externa',
              type: 'url',
              group: 'hero_background',
              description: 'URL de imagen si el video no carga'
            },
            {
              key: 'hero.background.image_fallback_internal',
              label: 'Imagen Fallback Interna',
              type: 'text',
              group: 'hero_background',
              description: 'Ruta local de imagen como último respaldo'
            },
            {
              key: 'hero.background.overlay_opacity',
              label: 'Opacidad del Overlay (0-1)',
              type: 'number',
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
              type: 'custom',
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
              type: 'textarea',
              required: true,
              group: 'hero_animations',
              description: 'Texto que aparece después de las palabras rotatorias'
            },

            // ===== STATISTICS SECTION GROUP =====
            {
              key: 'stats.statistics',
              label: 'Estadísticas Principales',
              type: 'custom',
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
              type: 'text',
              required: true,
              group: 'services_config',
              description: 'Título principal de la sección de servicios'
            },
            {
              key: 'services.section.subtitle',
              label: 'Subtítulo Sección Servicios',
              type: 'textarea',
              required: true,
              group: 'services_config',
              description: 'Descripción general de la sección de servicios'
            },

            // ===== SERVICES ITEMS GROUP =====
            {
              key: 'services.main_service.title',
              label: 'Servicio Principal - Título',
              type: 'text',
              required: true,
              group: 'services_items',
              description: 'Título del servicio destacado (DIP)'
            },
            {
              key: 'services.main_service.description',
              label: 'Servicio Principal - Descripción',
              type: 'textarea',
              required: true,
              group: 'services_items',
              description: 'Descripción del servicio principal'
            },
            {
              key: 'services.main_service.cta.text',
              label: 'Servicio Principal - Texto CTA',
              type: 'text',
              group: 'services_items',
              description: 'Texto del botón del servicio principal'
            },
            {
              key: 'services.main_service.cta.url',
              label: 'Servicio Principal - URL CTA',
              type: 'text',
              group: 'services_items',
              description: 'Enlace del botón del servicio principal'
            },
            {
              key: 'services',
              label: 'Editor Visual de Servicios',
              type: 'custom',
              component: 'service-builder',
              required: true,
              group: 'services_items',
              description: 'Editor completo para servicio principal (DIP) y 4 servicios secundarios',
              customProps: {
                imageUpload: true,
                iconLibrary: true
              }
            },

            // ===== PORTFOLIO CONFIG GROUP =====
            {
              key: 'portfolio.section.title',
              label: 'Título Sección Portfolio',
              type: 'text',
              required: true,
              group: 'portfolio_config',
              description: 'Título principal de la sección de portfolio'
            },
            {
              key: 'portfolio.section.subtitle',
              label: 'Subtítulo Sección Portfolio',
              type: 'textarea',
              required: true,
              group: 'portfolio_config',
              description: 'Descripción general del portfolio'
            },
            {
              key: 'portfolio.section.cta.text',
              label: 'Texto CTA Portfolio',
              type: 'text',
              group: 'portfolio_config',
              description: 'Texto del botón "Ver más"'
            },
            {
              key: 'portfolio.section.cta.url',
              label: 'URL CTA Portfolio',
              type: 'text',
              group: 'portfolio_config',
              description: 'Enlace hacia la página completa del portfolio'
            },

            // ===== PORTFOLIO PROJECTS GROUP =====
            {
              key: 'portfolio.featured_projects',
              label: 'Portfolio Project Manager',
              type: 'custom',
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
              type: 'text',
              required: true,
              group: 'pillars_dip',
              description: 'Título de la sección "¿Qué es DIP?"'
            },
            {
              key: 'pillars.section.subtitle',
              label: 'Subtítulo Sección Pilares',
              type: 'textarea',
              required: true,
              group: 'pillars_dip',
              description: 'Descripción de los pilares de DIP'
            },
            {
              key: 'pillars.pillars',
              label: 'Pillars DIP Editor',
              type: 'custom',
              component: 'pillars-editor',
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
              type: 'text',
              required: true,
              group: 'policies_company',
              description: 'Título de las políticas empresariales'
            },
            {
              key: 'policies.section.subtitle',
              label: 'Subtítulo Sección Políticas',
              type: 'textarea',
              required: true,
              group: 'policies_company',
              description: 'Descripción de las políticas corporativas'
            },
            {
              key: 'policies.policies',
              label: 'Policies Manager',
              type: 'custom',
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
              type: 'text',
              required: true,
              group: 'newsletter_setup',
              description: 'Título de la sección de suscripción'
            },
            {
              key: 'newsletter.section.subtitle',
              label: 'Subtítulo Newsletter',
              type: 'textarea',
              required: true,
              group: 'newsletter_setup',
              description: 'Descripción del beneficio de suscribirse'
            },
            {
              key: 'newsletter.form.placeholder_text',
              label: 'Placeholder del Input',
              type: 'text',
              group: 'newsletter_setup',
              description: 'Texto placeholder del campo email'
            },
            {
              key: 'newsletter.form.cta_text',
              label: 'Texto Botón Suscripción',
              type: 'text',
              group: 'newsletter_setup',
              description: 'Texto del botón de suscripción'
            },
            {
              key: 'newsletter.form.loading_text',
              label: 'Texto de Carga',
              type: 'text',
              group: 'newsletter_setup',
              description: 'Texto mostrado durante el proceso'
            },
            {
              key: 'newsletter.form.success_message',
              label: 'Mensaje de Éxito',
              type: 'text',
              group: 'newsletter_setup',
              description: 'Título del mensaje de confirmación'
            },
            {
              key: 'newsletter.form.success_description',
              label: 'Descripción de Éxito',
              type: 'text',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'contact_info_note',
              label: 'Información de Contacto',
              type: 'textarea',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'blog_config_note',
              label: 'Configuración del Blog',
              type: 'textarea',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'services_info_note',
              label: 'Información de Servicios',
              type: 'textarea',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'commitment_info_note',
              label: 'Información de Compromiso',
              type: 'textarea',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'portfolio_info_note',
              label: 'Información del Portafolio',
              type: 'textarea',
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
              type: 'text',
              required: true,
              group: 'page_info'
            },
            {
              key: 'page.description',
              label: 'Descripción SEO',
              type: 'textarea',
              required: true,
              group: 'page_info'
            },
            {
              key: 'careers_info_note',
              label: 'Información de Carreras',
              type: 'textarea',
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
              type: 'text',
              required: true,
              placeholder: 'Título de la página'
            },
            {
              key: 'description',
              label: 'Descripción',
              type: 'textarea',
              required: true,
              placeholder: 'Descripción de la página'
            },
            {
              key: 'status',
              label: 'Estado',
              type: 'select',
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
                        
                        <DynamicForm
                          fields={getFormSchema(selectedPage.name).fields}
                          groups={getFormSchema(selectedPage.name).groups || []}
                          title={getFormSchema(selectedPage.name).title}
                          initialValues={selectedPage}
                          onSubmit={handleSavePage}
                          onCancel={() => setActiveTab('list')}
                        />
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