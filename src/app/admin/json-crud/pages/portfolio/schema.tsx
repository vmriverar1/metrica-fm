export const portfolioSchema = {
    title: 'Editor de Portafolio',
    groups: [
        {
            name: 'page_info',
            label: 'Información de la Página',
            description: 'Configuración SEO y meta información',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'hero_section',
            label: 'Sección Hero',
            description: 'Banner principal del portafolio',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'introduction',
            label: 'Introducción',
            description: 'Presentación general del portafolio',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'featured_projects',
            label: 'Proyectos Destacados',
            description: 'Sección de proyectos principales',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'categories_overview',
            label: 'Vista General de Categorías',
            description: 'Sectores de especialización',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'investment_analysis',
            label: 'Análisis de Inversión',
            description: 'Métricas financieras del portafolio',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'project_methodology',
            label: 'Metodología de Proyectos',
            description: 'Proceso de trabajo y fases',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'success_metrics',
            label: 'Métricas de Éxito',
            description: 'KPIs y resultados del portafolio',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'geographic_presence',
            label: 'Presencia Geográfica',
            description: 'Distribución de proyectos por ubicación',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'innovation_highlights',
            label: 'Innovación',
            description: 'Tecnologías y metodologías aplicadas',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'portfolio_views',
            label: 'Vistas del Portafolio',
            description: 'Diferentes formas de explorar proyectos',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'interactive_features',
            label: 'Funcionalidades Interactivas',
            description: 'Herramientas de exploración',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'call_to_action',
            label: 'Llamada a la Acción',
            description: 'CTA final y contacto',
            collapsible: true,
            defaultExpanded: false
        }
    ],
    fields: [
        // Información de la página
        {
            key: 'page.title',
            label: 'Título SEO',
            type: 'text' as const,
            required: false,
            group: 'page_info'
        },
        {
            key: 'page.description',
            label: 'Descripción SEO',
            type: 'textarea' as const,
            required: false,
            group: 'page_info'
        },

        // Hero Section
        {
            key: 'hero.title',
            label: 'Título Principal',
            type: 'text' as const,
            required: false,
            group: 'hero_section'
        },
        {
            key: 'hero.subtitle',
            label: 'Subtítulo',
            type: 'text' as const,
            required: false,
            group: 'hero_section'
        },
        {
            key: 'hero.description',
            label: 'Descripción',
            type: 'textarea' as const,
            group: 'hero_section'
        },
        {
            key: 'hero.background_type',
            label: 'Tipo de Fondo Hero',
            type: 'select' as const,
            group: 'hero_section',
            description: 'Selecciona si quieres usar un video o una imagen como fondo del hero',
            options: [
                { value: 'image', label: 'Imagen de Fondo' },
                { value: 'video', label: 'Video de Fondo' }
            ],
            required: false,
            defaultValue: 'image'
        },
        {
            key: 'hero.video_url',
            label: 'Video Principal',
            type: 'video' as const,
            placeholder: 'Seleccionar video de fondo',
            group: 'hero_section',
            description: 'Video principal para el hero. Puedes subir un archivo o usar una URL externa.',
            dependsOn: {
                field: 'hero.background_type',
                value: 'video'
            }
        },
        {
            key: 'hero.video_url_fallback',
            label: 'Video Alternativo (opcional)',
            type: 'text' as const,
            group: 'hero_section',
            description: 'URL alternativa del video en caso de que el principal no cargue',
            dependsOn: {
                field: 'hero.background_type',
                value: 'video'
            }
        },
        {
            key: 'hero.image_fallback',
            label: 'Imagen Fallback del Video',
            type: 'image' as const,
            placeholder: 'Seleccionar imagen fallback',
            group: 'hero_section',
            description: 'Imagen que se muestra mientras carga el video o si el video falla.',
            dependsOn: {
                field: 'hero.background_type',
                value: 'video'
            }
        },
        {
            key: 'hero.background_image',
            label: 'Imagen Principal',
            type: 'image' as const,
            placeholder: 'Seleccionar imagen de fondo',
            group: 'hero_section',
            description: 'Imagen principal para el fondo del hero.',
            dependsOn: {
                field: 'hero.background_type',
                value: 'image'
            }
        },
        {
            key: 'hero.overlay_opacity',
            label: 'Opacidad del Overlay (0-1)',
            type: 'number' as const,
            group: 'hero_section',
            description: 'Intensidad de la capa oscura sobre el fondo',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.5
        },
        {
            key: 'hero.total_investment',
            label: 'Inversión Total',
            type: 'text' as const,
            placeholder: '$340M USD',
            group: 'hero_section'
        },
        {
            key: 'hero.total_area',
            label: 'Área Total',
            type: 'text' as const,
            placeholder: '151,480 m²',
            group: 'hero_section'
        },

        // Introduction
        {
            key: 'introduction.title',
            label: 'Título de Introducción',
            type: 'text' as const,
            required: false,
            group: 'introduction'
        },
        {
            key: 'introduction.description',
            label: 'Descripción de Introducción',
            type: 'textarea' as const,
            group: 'introduction'
        },

        // Featured Projects
        {
            key: 'featured_projects.title',
            label: 'Título de Proyectos Destacados',
            type: 'text' as const,
            required: false,
            group: 'featured_projects'
        },
        {
            key: 'featured_projects.subtitle',
            label: 'Subtítulo de Proyectos Destacados',
            type: 'text' as const,
            group: 'featured_projects'
        },
        {
            key: 'featured_projects.description',
            label: 'Descripción de Proyectos Destacados',
            type: 'textarea' as const,
            group: 'featured_projects'
        },

        // Categories Overview
        {
            key: 'categories_overview.title',
            label: 'Título de Categorías',
            type: 'text' as const,
            required: false,
            group: 'categories_overview'
        },
        {
            key: 'categories_overview.subtitle',
            label: 'Subtítulo de Categorías',
            type: 'text' as const,
            group: 'categories_overview'
        },
        {
            key: 'categories_overview.description',
            label: 'Descripción de Categorías',
            type: 'textarea' as const,
            group: 'categories_overview'
        },
        {
            key: 'categories_overview.dynamic_content_source',
            label: 'Fuente de Contenido Dinámico',
            type: 'text' as const,
            placeholder: '/json/dynamic-content/portfolio/content.json',
            group: 'categories_overview'
        },

        // Investment Analysis
        {
            key: 'investment_analysis.title',
            label: 'Título de Análisis de Inversión',
            type: 'text' as const,
            required: false,
            group: 'investment_analysis'
        },
        {
            key: 'investment_analysis.subtitle',
            label: 'Subtítulo de Análisis de Inversión',
            type: 'text' as const,
            group: 'investment_analysis'
        },
        {
            key: 'investment_analysis.description',
            label: 'Descripción de Análisis de Inversión',
            type: 'textarea' as const,
            group: 'investment_analysis'
        },

        // Project Methodology
        {
            key: 'project_methodology.title',
            label: 'Título de Metodología',
            type: 'text' as const,
            required: false,
            group: 'project_methodology'
        },
        {
            key: 'project_methodology.subtitle',
            label: 'Subtítulo de Metodología',
            type: 'text' as const,
            group: 'project_methodology'
        },
        {
            key: 'project_methodology.description',
            label: 'Descripción de Metodología',
            type: 'textarea' as const,
            group: 'project_methodology'
        },

        // Success Metrics
        {
            key: 'success_metrics.title',
            label: 'Título de Métricas de Éxito',
            type: 'text' as const,
            required: false,
            group: 'success_metrics'
        },
        {
            key: 'success_metrics.subtitle',
            label: 'Subtítulo de Métricas de Éxito',
            type: 'text' as const,
            group: 'success_metrics'
        },
        {
            key: 'success_metrics.description',
            label: 'Descripción de Métricas de Éxito',
            type: 'textarea' as const,
            group: 'success_metrics'
        },

        // Geographic Presence
        {
            key: 'geographic_presence.title',
            label: 'Título de Presencia Geográfica',
            type: 'text' as const,
            required: false,
            group: 'geographic_presence'
        },
        {
            key: 'geographic_presence.subtitle',
            label: 'Subtítulo de Presencia Geográfica',
            type: 'text' as const,
            group: 'geographic_presence'
        },
        {
            key: 'geographic_presence.description',
            label: 'Descripción de Presencia Geográfica',
            type: 'textarea' as const,
            group: 'geographic_presence'
        },

        // Innovation Highlights
        {
            key: 'innovation_highlights.title',
            label: 'Título de Innovación',
            type: 'text' as const,
            required: false,
            group: 'innovation_highlights'
        },
        {
            key: 'innovation_highlights.subtitle',
            label: 'Subtítulo de Innovación',
            type: 'text' as const,
            group: 'innovation_highlights'
        },
        {
            key: 'innovation_highlights.description',
            label: 'Descripción de Innovación',
            type: 'textarea' as const,
            group: 'innovation_highlights'
        },

        // Portfolio Views
        {
            key: 'portfolio_views.title',
            label: 'Título de Vistas del Portafolio',
            type: 'text' as const,
            required: false,
            group: 'portfolio_views'
        },
        {
            key: 'portfolio_views.subtitle',
            label: 'Subtítulo de Vistas del Portafolio',
            type: 'text' as const,
            group: 'portfolio_views'
        },
        {
            key: 'portfolio_views.description',
            label: 'Descripción de Vistas del Portafolio',
            type: 'textarea' as const,
            group: 'portfolio_views'
        },

        // Interactive Features
        {
            key: 'interactive_features.title',
            label: 'Título de Funcionalidades Interactivas',
            type: 'text' as const,
            required: false,
            group: 'interactive_features'
        },
        {
            key: 'interactive_features.subtitle',
            label: 'Subtítulo de Funcionalidades Interactivas',
            type: 'text' as const,
            group: 'interactive_features'
        },

        // Call to Action
        {
            key: 'call_to_action.title',
            label: 'Título CTA',
            type: 'text' as const,
            required: false,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.subtitle',
            label: 'Subtítulo CTA',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.description',
            label: 'Descripción CTA',
            type: 'textarea' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.primary_button.text',
            label: 'Texto Botón Primario',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.primary_button.href',
            label: 'Enlace Botón Primario',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.primary_button.icon',
            label: 'Ícono Botón Primario',
            type: 'icon' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.secondary_button.text',
            label: 'Texto Botón Secundario',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.secondary_button.href',
            label: 'Enlace Botón Secundario',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.secondary_button.icon',
            label: 'Ícono Botón Secundario',
            type: 'icon' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.contact_info.email',
            label: 'Email de Contacto',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.contact_info.phone',
            label: 'Teléfono de Contacto',
            type: 'text' as const,
            group: 'call_to_action'
        },
        {
            key: 'call_to_action.contact_info.office',
            label: 'Dirección de Oficina',
            type: 'text' as const,
            group: 'call_to_action'
        }
    ]
};