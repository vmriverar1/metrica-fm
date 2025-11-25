export const blogSchema = {
    title: 'Editor de Configuración del Blog',
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
            description: 'Banner principal del blog/newsletter',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'content_sections',
            label: 'Secciones de Contenido',
            description: 'Configuración de artículos y contenido',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'filters',
            label: 'Filtros',
            description: 'Configuración de filtros de búsqueda',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'contact_cta',
            label: 'CTA de Contacto',
            description: 'Llamada a la acción final',
            collapsible: true,
            defaultExpanded: false
        }
    ],
    fields: [
        // Información de la página
        {
            key: 'page.title',
            label: 'Título de la Página',
            type: 'text' as const,
            required: false,
            group: 'page_info'
        },
        {
            key: 'page.description',
            label: 'Descripción de la Página',
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
            key: 'hero.background.type',
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
            key: 'hero.background.video_url',
            label: 'Video Principal',
            type: 'video' as const,
            placeholder: 'Seleccionar video de fondo',
            group: 'hero_section',
            description: 'Video principal para el hero. Puedes subir un archivo o usar una URL externa.',
            dependsOn: {
                field: 'hero.background.type',
                value: 'video'
            }
        },
        {
            key: 'hero.background.video_url_fallback',
            label: 'Video Alternativo (opcional)',
            type: 'text' as const,
            group: 'hero_section',
            description: 'URL alternativa del video en caso de que el principal no cargue',
            dependsOn: {
                field: 'hero.background.type',
                value: 'video'
            }
        },
        {
            key: 'hero.background.image_fallback',
            label: 'Imagen Fallback del Video',
            type: 'image' as const,
            placeholder: 'Seleccionar imagen fallback',
            group: 'hero_section',
            description: 'Imagen que se muestra mientras carga el video o si el video falla.',
            dependsOn: {
                field: 'hero.background.type',
                value: 'video'
            }
        },
        {
            key: 'hero.background.image',
            label: 'Imagen Principal',
            type: 'image' as const,
            placeholder: 'Seleccionar imagen de fondo',
            group: 'hero_section',
            description: 'Imagen principal para el fondo del hero.',
            dependsOn: {
                field: 'hero.background.type',
                value: 'image'
            }
        },
        {
            key: 'hero.background.overlay_opacity',
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
            key: 'hero.stats.labels.total_posts',
            label: 'Etiqueta Total Artículos',
            type: 'text' as const,
            placeholder: 'Artículos',
            group: 'hero_section'
        },
        {
            key: 'hero.stats.labels.total_authors',
            label: 'Etiqueta Total Autores',
            type: 'text' as const,
            placeholder: 'Expertos',
            group: 'hero_section'
        },
        {
            key: 'hero.stats.labels.total_categories',
            label: 'Etiqueta Total Categorías',
            type: 'text' as const,
            placeholder: 'Categorías',
            group: 'hero_section'
        },
        {
            key: 'hero.stats.labels.average_reading_time',
            label: 'Etiqueta Tiempo de Lectura',
            type: 'text' as const,
            placeholder: 'min Lectura',
            group: 'hero_section'
        },

        // Content Sections
        {
            key: 'content_sections.latest_content.title',
            label: 'Título de Contenido Reciente',
            type: 'text' as const,
            required: false,
            group: 'content_sections'
        },
        {
            key: 'content_sections.latest_content.posts_per_page',
            label: 'Artículos por Página',
            type: 'number' as const,
            placeholder: '12',
            min: 1,
            max: 50,
            group: 'content_sections'
        },

        // Filters
        {
            key: 'filters.search.placeholder',
            label: 'Placeholder de Búsqueda',
            type: 'text' as const,
            placeholder: 'Buscar artículos...',
            group: 'filters'
        },
        {
            key: 'filters.category_filter.label',
            label: 'Etiqueta Filtro de Categoría',
            type: 'text' as const,
            placeholder: 'Categoría',
            group: 'filters'
        },
        {
            key: 'filters.category_filter.all_option',
            label: 'Opción "Todas" de Categorías',
            type: 'text' as const,
            placeholder: 'Todas',
            group: 'filters'
        },
        {
            key: 'filters.author_filter.label',
            label: 'Etiqueta Filtro de Autor',
            type: 'text' as const,
            placeholder: 'Autor',
            group: 'filters'
        },
        {
            key: 'filters.author_filter.all_option',
            label: 'Opción "Todos" de Autores',
            type: 'text' as const,
            placeholder: 'Todos',
            group: 'filters'
        },

        // Contact CTA
        {
            key: 'contact_cta.title',
            label: 'Título CTA de Contacto',
            type: 'text' as const,
            required: false,
            group: 'contact_cta',
            defaultValue: '¿Tienes un proyecto en mente?'
        },
        {
            key: 'contact_cta.description',
            label: 'Descripción CTA de Contacto',
            type: 'textarea' as const,
            required: false,
            group: 'contact_cta',
            rows: 3,
            placeholder: 'Contacta con nuestros expertos para recibir una consulta personalizada sobre tu proyecto de construcción o infraestructura.',
            description: 'Descripción que aparece debajo del título del CTA'
        },
        {
            key: 'contact_cta.primary_button.text',
            label: 'Texto Botón Primario',
            type: 'text' as const,
            required: false,
            group: 'contact_cta',
            defaultValue: 'Consulta Gratuita'
        },
        {
            key: 'contact_cta.primary_button.href',
            label: 'Enlace Botón Primario',
            type: 'text' as const,
            required: false,
            group: 'contact_cta',
            defaultValue: '/contact'
        },
        {
            key: 'contact_cta.secondary_button.text',
            label: 'Texto Botón Secundario',
            type: 'text' as const,
            required: false,
            group: 'contact_cta',
            defaultValue: 'Ver Proyectos'
        },
        {
            key: 'contact_cta.secondary_button.href',
            label: 'Enlace Botón Secundario',
            type: 'text' as const,
            required: false,
            group: 'contact_cta',
            defaultValue: '/portfolio'
        }
    ]
};