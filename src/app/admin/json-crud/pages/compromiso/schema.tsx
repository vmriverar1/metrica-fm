export const compromisoSchema = {
    title: 'Editor de Página de Compromiso',
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
            description: 'Banner principal de compromiso',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'main_content',
            label: 'Contenido Principal',
            description: 'Introducción y secciones principales',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'sustainability_goals',
            label: 'Objetivos de Desarrollo Sostenible',
            description: 'ODS alineados con la agenda 2030',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'impact_metrics',
            label: 'Métricas de Impacto',
            description: 'Resultados cuantitativos del compromiso',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'future_commitments',
            label: 'Compromisos Futuros',
            description: 'Hoja de ruta hacia la sostenibilidad',
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

        // Hero Section
        {
            key: 'hero.title',
            label: 'Título Principal',
            type: 'text' as const,
            required: true,
            group: 'hero_section'
        },
        {
            key: 'hero.subtitle',
            label: 'Subtítulo',
            type: 'textarea' as const,
            required: true,
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
            required: true,
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
            key: 'hero.background_image_fallback',
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

        // Main Content
        {
            key: 'main_content.introduction.title',
            label: 'Título de Introducción',
            type: 'text' as const,
            required: true,
            group: 'main_content'
        },
        {
            key: 'main_content.introduction.description',
            label: 'Descripción de Introducción',
            type: 'textarea' as const,
            required: true,
            group: 'main_content'
        },

        // Sustainability Goals
        {
            key: 'sustainability_goals.title',
            label: 'Título de ODS',
            type: 'text' as const,
            required: true,
            group: 'sustainability_goals'
        },
        {
            key: 'sustainability_goals.subtitle',
            label: 'Subtítulo de ODS',
            type: 'text' as const,
            group: 'sustainability_goals'
        },
        {
            key: 'sustainability_goals.description',
            label: 'Descripción de ODS',
            type: 'textarea' as const,
            group: 'sustainability_goals'
        },

        // Impact Metrics
        {
            key: 'impact_metrics.title',
            label: 'Título de Métricas de Impacto',
            type: 'text' as const,
            required: true,
            group: 'impact_metrics'
        },
        {
            key: 'impact_metrics.subtitle',
            label: 'Subtítulo de Métricas de Impacto',
            type: 'text' as const,
            group: 'impact_metrics'
        },

        // Future Commitments
        {
            key: 'future_commitments.title',
            label: 'Título de Compromisos Futuros',
            type: 'text' as const,
            required: true,
            group: 'future_commitments'
        },
        {
            key: 'future_commitments.subtitle',
            label: 'Subtítulo de Compromisos Futuros',
            type: 'text' as const,
            group: 'future_commitments'
        },
        {
            key: 'future_commitments.description',
            label: 'Descripción de Compromisos Futuros',
            type: 'textarea' as const,
            group: 'future_commitments'
        }
    ]
};