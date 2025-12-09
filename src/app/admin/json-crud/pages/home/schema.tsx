export const homeSchema = {
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
        name: 'hero_section',
        label: 'Hero Principal',
        description: 'Configuración completa del hero: títulos, fondo y CTA',
        collapsible: true,
        defaultExpanded: true
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
        name: 'services_section',
        label: 'Servicios',
        description: 'Configuración y gestión visual de servicios',
        collapsible: true,
        defaultExpanded: true
    },
    {
        name: 'portfolio_section',
        label: 'Portfolio',
        description: 'Configuración y gestión de proyectos destacados',
        collapsible: true,
        defaultExpanded: true
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
    },
    {
        name: 'clients_logos',
        label: 'Logos de Clientes',
        description: 'Slider de logos de clientes en el home',
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
        required: false,
        group: 'page_seo',
        description: 'Título para SEO y pestaña del navegador'
    },
    {
        key: 'page.description',
        label: 'Descripción SEO',
        type: 'textarea' as const,
        required: false,
        group: 'page_seo',
        description: 'Meta description para motores de búsqueda'
    },

    // ===== HERO SECTION GROUP =====
    {
        key: 'hero.title.main',
        label: 'Título Principal',
        type: 'text' as const,
        required: false,
        group: 'hero_section',
        description: 'Primera línea del título principal'
    },
    {
        key: 'hero.title.secondary',
        label: 'Título Secundario',
        type: 'text' as const,
        required: false,
        group: 'hero_section',
        description: 'Segunda línea del título principal'
    },
    {
        key: 'hero.subtitle',
        label: 'Subtítulo',
        type: 'text' as const,
        required: false,
        group: 'hero_section',
        description: 'Texto que acompaña al título principal'
    },
    {
        key: 'hero.cta.text',
        label: 'Texto del Botón CTA',
        type: 'text' as const,
        required: false,
        group: 'hero_section',
        description: 'Texto del botón de llamada a la acción'
    },
    {
        key: 'hero.cta.target',
        label: 'Enlace del Botón CTA',
        type: 'text' as const,
        required: false,
        group: 'hero_section',
        description: 'Destino del botón (ej: #services, /contacto)'
    },
    {
        key: 'hero.background.type',
        label: 'Tipo de Fondo',
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
        key: 'hero.background.image_fallback_internal',
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
        step: 0.1
    },

    // ===== HERO ANIMATIONS GROUP =====
    {
        key: 'hero.rotating_words',
        label: 'Palabras Rotatorias',
        type: 'custom' as const,
        component: 'rotating-words',
        required: false,
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
        required: false,
        group: 'hero_animations',
        description: 'Texto que aparece después de las palabras rotatorias'
    },

    // ===== STATISTICS SECTION GROUP =====
    {
        key: 'stats.statistics',
        label: 'Estadísticas Principales',
        type: 'custom' as const,
        component: 'statistics-grid',
        required: false,
        group: 'statistics_section',
        description: 'Editor visual para las 4 estadísticas principales del hero',
        customProps: {
        iconPicker: true,
        numberAnimation: true
        }
    },

    // ===== SERVICES SECTION GROUP =====
    {
        key: 'services.section.title',
        label: 'Título Sección Servicios',
        type: 'text' as const,
        required: false,
        group: 'services_section',
        description: 'Título principal de la sección de servicios'
    },
    {
        key: 'services.section.subtitle',
        label: 'Subtítulo Sección Servicios',
        type: 'textarea' as const,
        required: false,
        group: 'services_section',
        description: 'Descripción general de la sección de servicios'
    },
    {
        key: 'services',
        label: 'Editor Visual de Servicios',
        type: 'custom' as const,
        component: 'service-builder' as const,
        required: false,
        group: 'services_section',
        description: 'Editor dinámico para servicio principal (DIP) y servicios secundarios. Puede agregar, eliminar y duplicar servicios.',
        customProps: {
        imageUpload: true,
        iconLibrary: true
        }
    },

    // ===== PORTFOLIO SECTION GROUP =====
    {
        key: 'portfolio.section.title',
        label: 'Título Sección Portfolio',
        type: 'text' as const,
        required: false,
        group: 'portfolio_section',
        description: 'Título principal de la sección de portfolio'
    },
    {
        key: 'portfolio.section.subtitle',
        label: 'Subtítulo Sección Portfolio',
        type: 'textarea' as const,
        required: false,
        group: 'portfolio_section',
        description: 'Descripción general del portfolio'
    },
    {
        key: 'portfolio.section.cta.text',
        label: 'Texto CTA Portfolio',
        type: 'text' as const,
        group: 'portfolio_section',
        description: 'Texto del botón "Ver más"'
    },
    {
        key: 'portfolio.featured_projects',
        label: 'Proyectos Destacados',
        type: 'custom' as const,
        component: 'portfolio-manager',
        required: false,
        group: 'portfolio_section',
        description: 'Gestor visual para los proyectos destacados del portfolio',
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
        required: false,
        group: 'pillars_dip',
        description: 'Título de la sección "¿Qué es DIP?"'
    },
    {
        key: 'pillars.section.subtitle',
        label: 'Subtítulo Sección Pilares',
        type: 'textarea' as const,
        required: false,
        group: 'pillars_dip',
        description: 'Descripción de los pilares de DIP'
    },
    {
        key: 'pillars.pillars',
        label: 'Pillars DIP Editor',
        type: 'custom' as const,
        component: 'pillars-editor' as const,
        required: false,
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
        required: false,
        group: 'policies_company',
        description: 'Título de las políticas empresariales'
    },
    {
        key: 'policies.section.subtitle',
        label: 'Subtítulo Sección Políticas',
        type: 'textarea' as const,
        required: false,
        group: 'policies_company',
        description: 'Descripción de las políticas corporativas'
    },
    {
        key: 'policies.policies',
        label: 'Policies Manager',
        type: 'custom' as const,
        component: 'policies-manager',
        required: false,
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
        required: false,
        group: 'newsletter_setup',
        description: 'Título de la sección de suscripción'
    },
    {
        key: 'newsletter.section.subtitle',
        label: 'Subtítulo Newsletter',
        type: 'textarea' as const,
        required: false,
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
    },

    // ===== CLIENTS LOGOS GROUP =====
    {
        key: 'clients.section.title',
        label: 'Título Sección Clientes',
        type: 'text' as const,
        required: false,
        group: 'clients_logos',
        description: 'Título de la sección de logos de clientes'
    },
    {
        key: 'clients.section.subtitle',
        label: 'Subtítulo Sección Clientes',
        type: 'textarea' as const,
        required: false,
        group: 'clients_logos',
        description: 'Descripción de la sección de clientes'
    },
    {
        key: 'clients.logos',
        label: 'Logos de Clientes',
        type: 'array' as const,
        group: 'clients_logos',
        description: 'Gestiona los logos que aparecen en el slider del home',
        arrayFields: [
            {
                key: 'name',
                label: 'Nombre del Cliente',
                type: 'text' as const,
                required: true,
                placeholder: 'Ej: BCP, Alicorp, etc.'
            },
            {
                key: 'image',
                label: 'Logo',
                type: 'image' as const,
                required: true,
                placeholder: 'Seleccionar logo'
            },
            {
                key: 'alt',
                label: 'Texto Alternativo',
                type: 'text' as const,
                required: false,
                placeholder: 'Descripción del logo para accesibilidad'
            }
        ]
    }

    ]
};