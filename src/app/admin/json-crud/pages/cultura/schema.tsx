export const culturaSchema = {
    title: 'Editor de Cultura Organizacional',
    groups: [
    {
        name: 'page_info',
        label: 'Información de la Página',
        description: 'Meta información SEO y configuración del hero',
        collapsible: true,
        defaultExpanded: true
    },
    // Comentado temporalmente - Hero básico (ahora los campos están en page_info)
    // {
    //     name: 'hero_basic',
    //     label: 'Contenido del Hero',
    //     description: 'Títulos, subtítulo e imagen de fondo',
    //     collapsible: true,
    //     defaultExpanded: true
    // },
    // Comentado temporalmente - Hero con galería del equipo
    // {
    //     name: 'hero_gallery',
    //     label: 'Galería del Hero (9 imágenes)',
    //     description: 'Grid 3x3 de imágenes del equipo para el hero',
    //     collapsible: true,
    //     defaultExpanded: true
    // },
    {
        name: 'values_section',
        label: 'Sección de Valores',
        description: 'Configuración de la sección de valores empresariales',
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
    ],
    fields: [
    // Page Info Group
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
        label: 'Descripción SEO',
        type: 'textarea' as const,
        required: true,
        rows: 3,
        maxLength: 160,
        group: 'page_info',
        description: 'Descripción meta para SEO'
    },
    {
        key: 'page.hero_image',
        label: 'Imagen Principal del Hero',
        type: 'image' as const,
        placeholder: 'Seleccionar imagen de fondo',
        group: 'page_info',
        description: 'Imagen de fondo para el hero de la página'
    },

    // Hero Section Group - Comentado temporalmente, usando page.title y page.subtitle
    // {
    //     key: 'hero.title',
    //     label: 'Título Principal',
    //     type: 'text' as const,
    //     required: true,
    //     maxLength: 40,
    //     group: 'hero_basic',
    //     placeholder: 'Ej: Cultura y Personas',
    //     description: 'Título principal que aparece en grande en el hero'
    // },
    // {
    //     key: 'hero.subtitle',
    //     label: 'Subtítulo Descriptivo',
    //     type: 'textarea' as const,
    //     required: true,
    //     rows: 3,
    //     maxLength: 200,
    //     group: 'hero_basic',
    //     placeholder: 'Un equipo multidisciplinario comprometido con la excelencia...',
    //     description: 'Texto descriptivo que aparece bajo el título principal'
    // },
    // Comentado temporalmente - Campos avanzados del hero
    // {
    //     key: 'hero.background_type',
    //     label: 'Tipo de Fondo Hero',
    //     type: 'select' as const,
    //     group: 'hero_basic',
    //     description: 'Selecciona si quieres usar un video o una imagen como fondo del hero',
    //     options: [
    //         { value: 'image', label: 'Imagen de Fondo' },
    //         { value: 'video', label: 'Video de Fondo' }
    //     ],
    //     required: true,
    //     defaultValue: 'image'
    // },
    // {
    //     key: 'hero.video_url',
    //     label: 'Video Principal',
    //     type: 'custom' as const,
    //     component: 'video-field' as const,
    //     placeholder: 'Seleccionar video de fondo',
    //     group: 'hero_basic',
    //     description: 'Video principal para el hero. Puedes subir un archivo o usar una URL externa.',
    //     dependsOn: {
    //         field: 'hero.background_type',
    //         value: 'video'
    //     }
    // },
    // {
    //     key: 'hero.video_url_fallback',
    //     label: 'Video Alternativo (opcional)',
    //     type: 'text' as const,
    //     group: 'hero_basic',
    //     description: 'URL alternativa del video en caso de que el principal no cargue',
    //     dependsOn: {
    //         field: 'hero.background_type',
    //         value: 'video'
    //     }
    // },
    // {
    //     key: 'hero.background_image_fallback',
    //     label: 'Imagen Fallback del Video',
    //     type: 'image' as const,
    //     placeholder: 'Seleccionar imagen fallback',
    //     group: 'hero_basic',
    //     description: 'Imagen que se muestra mientras carga el video o si el video falla.',
    //     dependsOn: {
    //         field: 'hero.background_type',
    //         value: 'video'
    //     }
    // },
    // {
    //     key: 'hero.background_image',
    //     label: 'Imagen Principal',
    //     type: 'image' as const,
    //     placeholder: 'Seleccionar imagen de fondo',
    //     group: 'hero_basic',
    //     description: 'Imagen principal para el fondo del hero.',
    //     dependsOn: {
    //         field: 'hero.background_type',
    //         value: 'image'
    //     }
    // },
    // {
    //     key: 'hero.overlay_opacity',
    //     label: 'Opacidad del Overlay (0-1)',
    //     type: 'number' as const,
    //     group: 'hero_basic',
    //     description: 'Intensidad de la capa oscura sobre el fondo',
    //     min: 0,
    //     max: 1,
    //     step: 0.1,
    //     defaultValue: 0.5
    // },

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

    // Comentado temporalmente - Hero Gallery Section
    // {
    //     key: 'hero.team_gallery.columns',
    //     label: 'Galería de Imágenes del Equipo',
    //     type: 'custom' as const,
    //     component: 'hero-team-gallery-editor' as const,
    //     required: false,
    //     group: 'hero_gallery',
    //     description: 'Grid 3x3 de imágenes del equipo para el hero'
    // },

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