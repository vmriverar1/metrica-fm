export const servicesSchema = {
    title: 'Editor de Página de Servicios',
    groups: [
        {
            name: 'seo_settings',
            label: 'Configuración SEO',
            description: 'SEO y meta datos avanzados',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'hero_section',
            label: 'Sección Hero',
            description: 'Banner principal de servicios',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'services_list',
            label: 'Lista de Servicios',
            description: 'Servicios especializados',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'contact_form',
            label: 'Formulario de Contacto',
            description: 'Configuración del formulario y sección "Why Choose Us"',
            collapsible: true,
            defaultExpanded: true
        },
    ],
    fields: [
        // SEO Settings
        {
            key: 'seo.meta_title',
            label: 'Título SEO',
            type: 'text' as const,
            group: 'seo_settings',
            placeholder: 'Servicios de Dirección Integral de Proyectos | Métrica FM'
        },
        {
            key: 'seo.meta_description',
            label: 'Descripción SEO',
            type: 'textarea' as const,
            group: 'seo_settings',
            rows: 3,
            placeholder: 'Transformamos ideas en impacto con nuestros servicios especializados...'
        },

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
            key: 'hero.buttons.primary.text',
            label: 'Texto Botón Primario',
            type: 'text' as const,
            group: 'hero_section'
        },
        {
            key: 'hero.buttons.primary.href',
            label: 'Enlace Botón Primario',
            type: 'text' as const,
            group: 'hero_section'
        },
        {
            key: 'hero.stats',
            label: 'Estadísticas del Hero',
            type: 'array' as const,
            group: 'hero_section',
            description: 'Estadísticas que aparecen debajo del botón en el hero',
            arrayFields: [
                {
                    key: 'text',
                    label: 'Texto de la Estadística',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'S/ 3B+ Gestionados',
                    width: 'full'
                },
                {
                    key: 'icon',
                    label: 'Ícono (opcional)',
                    type: 'text' as const,
                    placeholder: 'TrendingUp',
                    description: 'Nombre del ícono de Lucide React (opcional)'
                }
            ]
        },

        // Services List
        {
            key: 'services.section.title',
            label: 'Título de Servicios',
            type: 'text' as const,
            required: false,
            group: 'services_list',
            defaultValue: 'Nuestros Servicios'
        },
        {
            key: 'services.section.subtitle',
            label: 'Subtítulo de Servicios',
            type: 'text' as const,
            group: 'services_list',
            defaultValue: 'Ofrecemos servicios especializados para el sector construcción'
        },
        {
            key: 'services',
            label: 'Editor Visual de Servicios',
            type: 'custom' as const,
            component: 'service-builder' as const,
            required: false,
            group: 'services_list',
            description: 'Editor dinámico para servicio principal y servicios secundarios. Puede agregar, eliminar, duplicar y reordenar servicios.',
            customProps: {
                imageUpload: true,
                iconLibrary: true
            }
        },

        // Contact Form
        {
            key: 'contact_form.title',
            label: 'Título del Formulario',
            type: 'text' as const,
            required: false,
            group: 'contact_form'
        },
        {
            key: 'contact_form.subtitle',
            label: 'Subtítulo del Formulario',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.submit_button.text',
            label: 'Texto del Botón de Envío',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.submit_button.icon',
            label: 'Ícono del Botón de Envío',
            type: 'icon' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.name.label',
            label: 'Etiqueta Campo Nombre',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.name.placeholder',
            label: 'Placeholder Campo Nombre',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.email.label',
            label: 'Etiqueta Campo Email',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.email.placeholder',
            label: 'Placeholder Campo Email',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.phone.label',
            label: 'Etiqueta Campo Teléfono',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.phone.placeholder',
            label: 'Placeholder Campo Teléfono',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.company.label',
            label: 'Etiqueta Campo Empresa',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.company.placeholder',
            label: 'Placeholder Campo Empresa',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.message.label',
            label: 'Etiqueta Campo Mensaje',
            type: 'text' as const,
            group: 'contact_form'
        },
        {
            key: 'contact_form.form_fields.message.placeholder',
            label: 'Placeholder Campo Mensaje',
            type: 'textarea' as const,
            group: 'contact_form'
        },

        // ===== SECCIÓN "WHY CHOOSE US" =====
        {
            key: 'contact_form.why_choose_us.title',
            label: 'Título "Why Choose Us"',
            type: 'text' as const,
            group: 'contact_form',
            defaultValue: '¿Por qué Métrica FM?',
            description: 'Título de la sección de beneficios en el sidebar del formulario'
        },
        {
            key: 'contact_form.why_choose_us.benefits',
            label: 'Lista de Beneficios "Why Choose Us"',
            type: 'array' as const,
            group: 'contact_form',
            description: 'Beneficios y razones para elegir Métrica FM que aparecen en el sidebar del formulario de contacto',
            arrayFields: [
                {
                    key: 'id',
                    label: 'ID del Beneficio',
                    type: 'text' as const,
                    required: false,
                    placeholder: 'experiencia',
                    description: 'Identificador único para el beneficio'
                },
                {
                    key: 'text',
                    label: 'Texto del Beneficio',
                    type: 'text' as const,
                    required: false,
                    placeholder: '10+ años de experiencia',
                    description: 'Texto que aparece junto al ícono en el sidebar'
                },
                {
                    key: 'icon',
                    label: 'Ícono (Lucide React)',
                    type: 'text' as const,
                    defaultValue: 'CheckCircle2',
                    placeholder: 'CheckCircle2',
                    description: 'Nombre del ícono de Lucide React (por defecto: CheckCircle2)'
                }
            ]
        },

        // Settings
        {
            key: 'settings.form_action',
            label: 'Acción del Formulario',
            type: 'text' as const,
            placeholder: '/api/services/contact',
            group: 'settings'
        },
        {
            key: 'settings.form_method',
            label: 'Método del Formulario',
            type: 'text' as const,
            placeholder: 'POST',
            group: 'settings'
        },
        {
            key: 'settings.response_time',
            label: 'Tiempo de Respuesta',
            type: 'text' as const,
            placeholder: '24 horas',
            group: 'settings'
        }
    ]
};