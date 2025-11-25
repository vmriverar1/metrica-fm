export const clientesSchema = {
    title: 'Editor de Página de Clientes',
    groups: [
        {
            name: 'seo_settings',
            label: 'Configuración SEO',
            description: 'Meta tags y configuración para buscadores',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'page_info',
            label: 'Información de la Página',
            description: 'Configuración SEO y meta información',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'hero_section',
            label: 'Sección Hero y Logos',
            description: 'Configuración del banner principal con galería de logos de clientes',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'introduction_section',
            label: 'Introducción y Estadísticas',
            description: 'Sección de introducción con estadísticas',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'testimonials_section',
            label: 'Testimonios',
            description: 'Configuración de testimonios con videos de YouTube',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'client_benefits_section',
            label: 'Beneficios para Clientes',
            description: 'Beneficios y propuestas de valor',
            collapsible: true,
            defaultExpanded: false
        }
    ],
    fields: [
        // SEO Settings
        {
            key: 'seo.meta_title',
            label: 'Título SEO',
            type: 'text' as const,
            group: 'seo_settings',
            description: 'Título que aparece en los resultados de búsqueda',
            placeholder: 'Nuestros Clientes | Métrica FM'
        },
        {
            key: 'seo.meta_description',
            label: 'Descripción SEO',
            type: 'textarea' as const,
            group: 'seo_settings',
            description: 'Descripción que aparece en los resultados de búsqueda',
            rows: 3,
            placeholder: 'Organismos públicos y empresas líderes que confían en nuestra experiencia...'
        },
        {
            key: 'seo.keywords',
            label: 'Palabras Clave',
            type: 'textarea' as const,
            group: 'seo_settings',
            description: 'Palabras clave separadas por comas',
            placeholder: 'clientes construcción, empresas infraestructura, proyectos públicos, dirección proyectos'
        },
        // Información de la página
        {
            key: 'page.title',
            label: 'Título de la Página',
            type: 'text' as const,
            required: false,
            group: 'page_info',
            defaultValue: 'Nuestros Clientes | Métrica FM'
        },
        {
            key: 'page.description',
            label: 'Descripción de la Página',
            type: 'textarea' as const,
            required: false,
            group: 'page_info',
            defaultValue: 'Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo en dirección integral de proyectos de infraestructura.'
        },

        // Hero Section
        {
            key: 'hero.title',
            label: 'Título Hero',
            type: 'text' as const,
            required: false,
            group: 'hero_section',
            defaultValue: 'Nuestros Clientes'
        },
        {
            key: 'hero.subtitle',
            label: 'Subtítulo Hero',
            type: 'text' as const,
            required: false,
            group: 'hero_section',
            defaultValue: 'Empresas líderes que confían en nuestra experiencia'
        },

        // Títulos de la Sección Hero
        {
            key: 'clientes.section.title',
            label: 'Título de la Sección Hero',
            type: 'text' as const,
            required: false,
            group: 'hero_section',
            defaultValue: 'Nuestros Clientes'
        },
        {
            key: 'clientes.section.subtitle',
            label: 'Subtítulo de la Sección Hero',
            type: 'text' as const,
            required: false,
            group: 'hero_section',
            defaultValue: 'Empresas líderes que confían en nuestra experiencia'
        },

        // Galería de Logos de Clientes
        {
            key: 'clientes.logos',
            label: 'Galería de Logos de Clientes',
            type: 'image' as const,
            group: 'hero_section',
            description: 'Lista de logos de clientes que aparecen en el hero de la página (máximo 50 logos)',
            multiple: true,
            maxImages: 50,
            placeholder: 'Agregar logos de clientes...',
            required: false
        },

        // Introducción y Estadísticas
        {
            key: 'introduction.title',
            label: 'Título de Introducción',
            type: 'text' as const,
            required: false,
            group: 'introduction_section',
            defaultValue: 'Construyendo Confianza con Cada Proyecto'
        },
        {
            key: 'introduction.description',
            label: 'Descripción de Introducción',
            type: 'textarea' as const,
            required: false,
            group: 'introduction_section',
            rows: 4,
            defaultValue: 'En Métrica FM, nos enorgullece trabajar con una amplia gama de clientes del sector público y privado. Nuestra experiencia y compromiso con la excelencia nos han convertido en el socio preferido para proyectos de infraestructura de gran envergadura.'
        },
        // Estadísticas usando statistics-builder
        {
            key: 'introduction.stats',
            label: 'Estadísticas de Clientes',
            type: 'custom' as const,
            component: 'statistics-builder' as const,
            required: false,
            group: 'introduction_section',
            description: 'Editor dinámico de métricas con iconos y colores personalizables',
            config: {
                maxStats: 4,
                fieldsConfig: {
                    number: { required: false, placeholder: '50+' },
                    label: { required: false, maxLength: 50, placeholder: 'Total de Clientes' },
                    description: { required: false, maxLength: 100, placeholder: 'Clientes satisfechos en diversos sectores' },
                    icon: { type: 'icon-picker', required: false },
                    color: { type: 'color-picker', default: '#003F6F' }
                }
            }
        },

        // Testimonios
        {
            key: 'testimonials.title',
            label: 'Título de Testimonios',
            type: 'text' as const,
            required: false,
            group: 'testimonials_section',
            defaultValue: 'Testimonios de Nuestros Clientes'
        },
        {
            key: 'testimonials.subtitle',
            label: 'Subtítulo de Testimonios',
            type: 'text' as const,
            group: 'testimonials_section',
            defaultValue: 'Escucha de primera mano lo que nuestros clientes opinan sobre nuestro trabajo'
        },

        // Videos de YouTube
        {
            key: 'testimonials.youtube_videos',
            label: 'Videos de Testimonios (YouTube)',
            type: 'array' as const,
            group: 'testimonials_section',
            description: 'Lista de videos de testimonios de YouTube',
            arrayFields: [
                {
                    key: 'id',
                    label: 'ID',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'testimonio_cliente_1'
                },
                {
                    key: 'videoId',
                    label: 'ID del Video de YouTube',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'xBpz8Ret1Io',
                    description: 'ID del video de YouTube (lo que aparece después de v= en la URL)'
                },
                {
                    key: 'title',
                    label: 'Título del Video',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'Testimonio - Cliente XYZ'
                },
                {
                    key: 'description',
                    label: 'Descripción',
                    type: 'textarea' as const,
                    required: false,
                    rows: 2,
                    placeholder: 'Descripción del testimonio...'
                },
                {
                    key: 'author',
                    label: 'Autor',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'Nombre del cliente'
                },
                {
                    key: 'position',
                    label: 'Cargo',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'CEO, Gerente, etc.'
                },
                {
                    key: 'company',
                    label: 'Empresa',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'Nombre de la empresa'
                },
                {
                    key: 'sector',
                    label: 'Sector',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'Financiero, Logística, etc.'
                },
                {
                    key: 'order',
                    label: 'Orden',
                    type: 'number' as const,
                    required: false,
                    min: 1,
                    defaultValue: 1
                }
            ]
        },

        // Beneficios para Clientes
        {
            key: 'client_benefits.title',
            label: 'Título de Beneficios',
            type: 'text' as const,
            required: false,
            group: 'client_benefits_section',
            defaultValue: 'Por Qué Nos Eligen'
        },
        {
            key: 'client_benefits.subtitle',
            label: 'Subtítulo de Beneficios',
            type: 'text' as const,
            group: 'client_benefits_section',
            defaultValue: 'Beneficios clave que ofrecemos a nuestros clientes'
        },
        {
            key: 'client_benefits.benefits',
            label: 'Lista de Beneficios',
            type: 'array' as const,
            group: 'client_benefits_section',
            description: 'Beneficios que ofrecemos a nuestros clientes',
            arrayFields: [
                {
                    key: 'id',
                    label: 'ID',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'benefit_1'
                },
                {
                    key: 'icon',
                    label: 'Ícono',
                    type: 'icon' as const,
                    required: false,
                    placeholder: 'Star'
                },
                {
                    key: 'color',
                    label: 'Color del Ícono',
                    type: 'color' as const,
                    required: false,
                    defaultValue: '#00A8E8'
                },
                {
                    key: 'title',
                    label: 'Título',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'Excelencia en Servicio'
                },
                {
                    key: 'description',
                    label: 'Descripción',
                    type: 'textarea' as const,
                    required: false,
                    rows: 2,
                    placeholder: 'Descripción del beneficio'
                },
                {
                    key: 'metrics',
                    label: 'Métricas',
                    type: 'multitext' as const,
                    required: false,
                    description: 'Lista de métricas (una por línea)'
                }
            ]
        },

        // Métricas de Éxito (comentado en la página actual)
        {
            key: 'success_metrics.title',
            label: 'Título de Métricas',
            type: 'text' as const,
            required: false,
            group: 'success_metrics_section',
            defaultValue: 'Nuestro Impacto en Números'
        },
        {
            key: 'success_metrics.subtitle',
            label: 'Subtítulo de Métricas',
            type: 'text' as const,
            group: 'success_metrics_section',
            defaultValue: 'Resultados que demuestran nuestro compromiso con la excelencia'
        }
    ]
};