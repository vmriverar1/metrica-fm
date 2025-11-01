export const contactSchema = {
    title: 'Editor de Página de Contacto',
    groups: [
        {
            name: 'seo',
            label: 'SEO y Meta Tags',
            description: 'Configuración para motores de búsqueda',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'hero',
            label: 'Sección Hero',
            description: 'Título, subtítulo e imagen de fondo del banner principal',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'intro',
            label: 'Sección Introducción',
            description: 'Contenido introductorio de la página',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'contact_info',
            label: 'Información de Contacto',
            description: 'Datos de contacto principales (teléfono, email, dirección, horarios)',
            collapsible: true,
            defaultExpanded: true
        },
        {
            name: 'process',
            label: 'Proceso de Contacto',
            description: 'Pasos del proceso de contacto',
            collapsible: true,
            defaultExpanded: false
        },
        {
            name: 'map',
            label: 'Configuración del Mapa',
            description: 'Configuración para mostrar el mapa',
            collapsible: true,
            defaultExpanded: false
        }
    ],
    fields: [
        // SEO
        {
            key: 'seo.meta_title',
            label: 'Meta Título',
            type: 'text' as const,
            required: true,
            group: 'seo',
            placeholder: 'Contáctanos | Métrica FM',
            description: 'Título que aparece en la pestaña del navegador y resultados de búsqueda'
        },
        {
            key: 'seo.meta_description',
            label: 'Meta Descripción',
            type: 'textarea' as const,
            required: true,
            group: 'seo',
            rows: 3,
            placeholder: 'Ponte en contacto con nuestro equipo de expertos...',
            description: 'Descripción que aparece en Google y redes sociales'
        },
        {
            key: 'seo.keywords',
            label: 'Palabras Clave (separadas por comas)',
            type: 'textarea' as const,
            required: false,
            group: 'seo',
            rows: 2,
            placeholder: 'contacto métrica dip, dirección integral proyectos perú, consultoría construcción lima',
            description: 'Keywords para SEO, separadas por comas'
        },

        // Sección Hero
        {
            key: 'hero.title',
            label: 'Título Hero',
            type: 'text' as const,
            required: true,
            group: 'hero'
        },
        {
            key: 'hero.subtitle',
            label: 'Subtítulo Hero',
            type: 'textarea' as const,
            required: true,
            group: 'hero'
        },
        {
            key: 'hero.background_type',
            label: 'Tipo de Fondo Hero',
            type: 'select' as const,
            group: 'hero',
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
            group: 'hero',
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
            group: 'hero',
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
            group: 'hero',
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
            group: 'hero',
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
            group: 'hero',
            description: 'Intensidad de la capa oscura sobre el fondo',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.5
        },

        // Introducción
        {
            key: 'sections.intro.title',
            label: 'Título de Introducción',
            type: 'text' as const,
            required: true,
            group: 'intro'
        },
        {
            key: 'sections.intro.description',
            label: 'Descripción de Introducción',
            type: 'textarea' as const,
            required: true,
            group: 'intro'
        },

        // Información de Contacto
        {
            key: 'sections.contact_info.title',
            label: 'Título Sección Contacto',
            type: 'text' as const,
            required: true,
            group: 'contact_info',
            defaultValue: 'Información de Contacto'
        },
        // Item 1 - Oficina Principal
        {
            key: 'sections.contact_info.items.0.title',
            label: 'Item 1 - Título',
            type: 'text' as const,
            required: false,
            group: 'contact_info',
            placeholder: 'Oficina Principal',
            description: 'Título del primer item de contacto'
        },
        {
            key: 'sections.contact_info.items.0.icon',
            label: 'Item 1 - Icono',
            type: 'select' as const,
            required: false,
            group: 'contact_info',
            options: [
                { value: 'MapPin', label: 'Ubicación (MapPin)' },
                { value: 'Phone', label: 'Teléfono (Phone)' },
                { value: 'Mail', label: 'Email (Mail)' },
                { value: 'Clock', label: 'Horario (Clock)' },
                { value: 'Globe', label: 'Web (Globe)' }
            ],
            defaultValue: 'MapPin'
        },
        {
            key: 'sections.contact_info.items.0.content',
            label: 'Item 1 - Contenido',
            type: 'textarea' as const,
            required: false,
            group: 'contact_info',
            rows: 2,
            placeholder: 'Andrés Reyes 388, San Isidro',
            description: 'Contenido del primer item (puedes usar \\n para saltos de línea)'
        },

        // Item 2 - Teléfonos
        {
            key: 'sections.contact_info.items.1.title',
            label: 'Item 2 - Título',
            type: 'text' as const,
            required: false,
            group: 'contact_info',
            placeholder: 'Teléfonos',
            description: 'Título del segundo item de contacto'
        },
        {
            key: 'sections.contact_info.items.1.icon',
            label: 'Item 2 - Icono',
            type: 'select' as const,
            required: false,
            group: 'contact_info',
            options: [
                { value: 'MapPin', label: 'Ubicación (MapPin)' },
                { value: 'Phone', label: 'Teléfono (Phone)' },
                { value: 'Mail', label: 'Email (Mail)' },
                { value: 'Clock', label: 'Horario (Clock)' },
                { value: 'Globe', label: 'Web (Globe)' }
            ],
            defaultValue: 'Phone'
        },
        {
            key: 'sections.contact_info.items.1.content',
            label: 'Item 2 - Contenido',
            type: 'textarea' as const,
            required: false,
            group: 'contact_info',
            rows: 2,
            placeholder: '+51 989 742 678',
            description: 'Contenido del segundo item (puedes usar \\n para saltos de línea)'
        },

        // Item 3 - Email
        {
            key: 'sections.contact_info.items.2.title',
            label: 'Item 3 - Título',
            type: 'text' as const,
            required: false,
            group: 'contact_info',
            placeholder: 'Email',
            description: 'Título del tercer item de contacto'
        },
        {
            key: 'sections.contact_info.items.2.icon',
            label: 'Item 3 - Icono',
            type: 'select' as const,
            required: false,
            group: 'contact_info',
            options: [
                { value: 'MapPin', label: 'Ubicación (MapPin)' },
                { value: 'Phone', label: 'Teléfono (Phone)' },
                { value: 'Mail', label: 'Email (Mail)' },
                { value: 'Clock', label: 'Horario (Clock)' },
                { value: 'Globe', label: 'Web (Globe)' }
            ],
            defaultValue: 'Mail'
        },
        {
            key: 'sections.contact_info.items.2.content',
            label: 'Item 3 - Contenido',
            type: 'textarea' as const,
            required: false,
            group: 'contact_info',
            rows: 2,
            placeholder: 'info@metricadip.com\\njmorales@metrica-dip.com',
            description: 'Contenido del tercer item (puedes usar \\n para saltos de línea)'
        },

        // Item 4 - Horarios
        {
            key: 'sections.contact_info.items.3.title',
            label: 'Item 4 - Título',
            type: 'text' as const,
            required: false,
            group: 'contact_info',
            placeholder: 'Horarios de Atención',
            description: 'Título del cuarto item de contacto'
        },
        {
            key: 'sections.contact_info.items.3.icon',
            label: 'Item 4 - Icono',
            type: 'select' as const,
            required: false,
            group: 'contact_info',
            options: [
                { value: 'MapPin', label: 'Ubicación (MapPin)' },
                { value: 'Phone', label: 'Teléfono (Phone)' },
                { value: 'Mail', label: 'Email (Mail)' },
                { value: 'Clock', label: 'Horario (Clock)' },
                { value: 'Globe', label: 'Web (Globe)' }
            ],
            defaultValue: 'Clock'
        },
        {
            key: 'sections.contact_info.items.3.content',
            label: 'Item 4 - Contenido',
            type: 'textarea' as const,
            required: false,
            group: 'contact_info',
            rows: 2,
            placeholder: 'Lunes a Viernes: 8:00 AM - 6:00 PM\\nSábados: 9:00 AM - 1:00 PM',
            description: 'Contenido del cuarto item (puedes usar \\n para saltos de línea)'
        },


        // Proceso de Contacto
        {
            key: 'sections.process.title',
            label: 'Título del Proceso',
            type: 'text' as const,
            required: true,
            group: 'process',
            defaultValue: 'Proceso de Contacto'
        },

        // Paso 1
        {
            key: 'sections.process.steps.0.number',
            label: 'Paso 1 - Número',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: '1',
            description: 'Número del primer paso'
        },
        {
            key: 'sections.process.steps.0.title',
            label: 'Paso 1 - Título',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: 'Consulta Inicial',
            description: 'Título del primer paso'
        },
        {
            key: 'sections.process.steps.0.description',
            label: 'Paso 1 - Descripción',
            type: 'textarea' as const,
            required: false,
            group: 'process',
            rows: 2,
            placeholder: 'Conversamos sobre tu proyecto y necesidades específicas',
            description: 'Descripción del primer paso'
        },

        // Paso 2
        {
            key: 'sections.process.steps.1.number',
            label: 'Paso 2 - Número',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: '2',
            description: 'Número del segundo paso'
        },
        {
            key: 'sections.process.steps.1.title',
            label: 'Paso 2 - Título',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: 'Propuesta Técnica - Económica',
            description: 'Título del segundo paso'
        },
        {
            key: 'sections.process.steps.1.description',
            label: 'Paso 2 - Descripción',
            type: 'textarea' as const,
            required: false,
            group: 'process',
            rows: 2,
            placeholder: 'Desarrollamos una propuesta detallada y personalizada',
            description: 'Descripción del segundo paso'
        },

        // Paso 3
        {
            key: 'sections.process.steps.2.number',
            label: 'Paso 3 - Número',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: '3',
            description: 'Número del tercer paso'
        },
        {
            key: 'sections.process.steps.2.title',
            label: 'Paso 3 - Título',
            type: 'text' as const,
            required: false,
            group: 'process',
            placeholder: 'Inicio del Proyecto',
            description: 'Título del tercer paso'
        },
        {
            key: 'sections.process.steps.2.description',
            label: 'Paso 3 - Descripción',
            type: 'textarea' as const,
            required: false,
            group: 'process',
            rows: 2,
            placeholder: 'Comenzamos a trabajar juntos en la ejecución de tu visión',
            description: 'Descripción del tercer paso'
        },

        // Mapa
        {
            key: 'sections.map.subtitle',
            label: 'Subtítulo del Mapa',
            type: 'text' as const,
            required: false,
            group: 'map',
            defaultValue: 'Santiago de Surco, Lima'
        },
        {
            key: 'sections.map.show_placeholder',
            label: 'Mostrar Mapa',
            type: 'boolean' as const,
            required: false,
            group: 'map',
            defaultValue: true
        },
        {
            key: 'sections.map.address',
            label: 'Dirección',
            type: 'text' as const,
            required: false,
            group: 'map',
            placeholder: 'Andrés Reyes 388, San Isidro, Lima',
            description: 'Dirección que aparece en el overlay del mapa'
        },
        {
            key: 'sections.map.embed_url',
            label: 'URL del Mapa (Google Maps Embed)',
            type: 'textarea' as const,
            required: false,
            group: 'map',
            rows: 3,
            placeholder: 'https://www.google.com/maps/embed?pb=...',
            description: 'URL completa del iframe de Google Maps. Ve a Google Maps, busca tu dirección, dale click en Compartir > Incorporar un mapa y copia la URL del src.'
        },

        // Configuraciones
        {
            key: 'settings.form_method',
            label: 'Método del Formulario',
            type: 'select' as const,
            required: true,
            group: 'settings',
            options: [
                { value: 'POST', label: 'POST' },
                { value: 'GET', label: 'GET' }
            ],
            defaultValue: 'POST'
        },
        {
            key: 'settings.form_action',
            label: 'Acción del Formulario',
            type: 'text' as const,
            required: true,
            group: 'settings',
            defaultValue: '/api/contact'
        },
        {
            key: 'settings.response_time',
            label: 'Tiempo de Respuesta',
            type: 'text' as const,
            required: false,
            group: 'settings',
            defaultValue: '24 horas'
        },
        {
            key: 'settings.urgent_response_time',
            label: 'Tiempo de Respuesta Urgente',
            type: 'text' as const,
            required: false,
            group: 'settings',
            defaultValue: '48 horas'
        },
        {
            key: 'settings.show_map_placeholder',
            label: 'Mostrar Placeholder del Mapa',
            type: 'boolean' as const,
            required: false,
            group: 'settings',
            defaultValue: true
        }
    ]
};