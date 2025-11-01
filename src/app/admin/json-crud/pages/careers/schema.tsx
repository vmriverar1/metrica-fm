export const careersSchema = {
    title: 'Editor de Bolsa de Trabajo',
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
            description: 'Banner principal de la página de carreras',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'company_benefits',
            label: 'Beneficios de la Empresa',
            description: 'Beneficios y ventajas que ofrece la empresa',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'application_process',
            label: 'Proceso de Aplicación',
            description: 'Información sobre el proceso de postulación',
            collapsible: true,
            defaultExpanded: false
        },
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
        {
            key: 'page.keywords',
            label: 'Palabras clave (separadas por comas)',
            type: 'textarea' as const,
            placeholder: 'trabajos construcción, empleos arquitectura, carreras ingeniería civil',
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
            key: 'hero.badge.text',
            label: 'Texto del Badge',
            type: 'text' as const,
            group: 'hero_section'
        },
        {
            key: 'hero.badge.icon',
            label: 'Ícono del Badge',
            type: 'icon' as const,
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
            required: true,
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
            label: 'Opacidad del Overlay',
            type: 'number' as const,
            min: 0,
            max: 1,
            step: 0.1,
            group: 'hero_section'
        },
        {
            key: 'hero.description',
            label: 'Descripción Hero',
            type: 'textarea' as const,
            required: false,
            group: 'hero_section',
            rows: 3,
            placeholder: 'Descripción que aparece en la sección hero'
        },
        {
            key: 'hero.primary_button.text',
            label: 'Texto del Botón Primario',
            type: 'text' as const,
            group: 'hero_section',
            placeholder: 'Ver Oportunidades'
        },
        {
            key: 'hero.primary_button.href',
            label: 'Enlace del Botón Primario',
            type: 'text' as const,
            group: 'hero_section',
            placeholder: '#job-opportunities'
        },
        {
            key: 'hero.secondary_button.text',
            label: 'Texto del Botón Secundario',
            type: 'text' as const,
            group: 'hero_section',
            placeholder: 'Enviar CV'
        },
        {
            key: 'hero.secondary_button.href',
            label: 'Enlace del Botón Secundario',
            type: 'text' as const,
            group: 'hero_section',
            placeholder: '/careers/apply'
        },

        // Company Benefits
        {
            key: 'company_benefits.title',
            label: 'Título de Beneficios',
            type: 'text' as const,
            required: true,
            group: 'company_benefits',
            defaultValue: 'Beneficios Únicos que Ofrecemos'
        },
        {
            key: 'company_benefits.description',
            label: 'Descripción de Beneficios',
            type: 'textarea' as const,
            required: true,
            group: 'company_benefits',
            rows: 3,
            placeholder: 'Descripción de los beneficios que ofrece la empresa...'
        },

        // Beneficios - Lista dinámica
        {
            key: 'company_benefits.benefits',
            label: 'Lista de Beneficios',
            type: 'array' as const,
            required: false,
            group: 'company_benefits',
            description: 'Lista de beneficios que ofrece la empresa',
            arrayFields: [
                {
                    key: 'id',
                    label: 'ID del Beneficio',
                    type: 'text' as const,
                    required: true,
                    placeholder: 'health-insurance'
                },
                {
                    key: 'title',
                    label: 'Título',
                    type: 'text' as const,
                    required: true,
                    placeholder: 'Seguro de Salud Completo'
                },
                {
                    key: 'description',
                    label: 'Descripción',
                    type: 'textarea' as const,
                    required: true,
                    rows: 3,
                    placeholder: 'Descripción detallada del beneficio...'
                },
                {
                    key: 'icon',
                    label: 'Icono',
                    type: 'icon' as const,
                    required: true,
                    defaultValue: 'Heart'
                },
                {
                    key: 'highlight',
                    label: 'Destacar Beneficio',
                    type: 'boolean' as const,
                    required: false,
                    defaultValue: false
                },
                {
                    key: 'details',
                    label: 'Detalles Adicionales',
                    type: 'multitext' as const,
                    required: false,
                    placeholder: 'Escribe cada detalle en una línea nueva...',
                    rows: 4
                }
            ]
        },

        // CTA Section de Benefits
        {
            key: 'company_benefits.cta.title',
            label: 'CTA - Título',
            type: 'text' as const,
            required: false,
            group: 'company_benefits',
            placeholder: '¿Listo para Formar Parte del Equipo?',
            description: 'Título de la sección de llamada a la acción'
        },
        {
            key: 'company_benefits.cta.description',
            label: 'CTA - Descripción',
            type: 'textarea' as const,
            required: false,
            group: 'company_benefits',
            rows: 3,
            placeholder: 'Explora nuestras oportunidades laborales y encuentra la posición perfecta para tu perfil profesional.'
        },
        {
            key: 'company_benefits.cta.button.text',
            label: 'CTA - Texto del Botón',
            type: 'text' as const,
            required: false,
            group: 'company_benefits',
            placeholder: 'Envía tu CV',
            defaultValue: 'Envía tu CV'
        },
        {
            key: 'company_benefits.cta.button.href',
            label: 'CTA - Enlace del Botón',
            type: 'text' as const,
            required: false,
            group: 'company_benefits',
            placeholder: '/careers/apply',
            defaultValue: '/careers/apply'
        },
        {
            key: 'company_benefits.cta.button.type',
            label: 'CTA - Tipo de Botón',
            type: 'select' as const,
            required: false,
            group: 'company_benefits',
            options: [
                { value: 'primary', label: 'Primario' },
                { value: 'secondary', label: 'Secundario' },
                { value: 'outline', label: 'Contorno' }
            ],
            defaultValue: 'primary'
        },

        // Application Process
        {
            key: 'application_process.title',
            label: 'Título del Proceso',
            type: 'text' as const,
            required: true,
            group: 'application_process'
        },
        {
            key: 'application_process.subtitle',
            label: 'Subtítulo del Proceso',
            type: 'text' as const,
            group: 'application_process'
        },
        {
            key: 'application_process.note',
            label: 'Nota del Proceso',
            type: 'textarea' as const,
            group: 'application_process'
        },
        {
            key: 'application_process.average_time',
            label: 'Tiempo Promedio',
            type: 'text' as const,
            group: 'application_process'
        },

    ]
};