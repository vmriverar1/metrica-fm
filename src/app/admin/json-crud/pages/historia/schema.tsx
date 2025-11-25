export const historiaSchema = {
  title: '',
  groups: [
    {
      name: 'page_info',
      label: 'Información de la Página',
      description: 'Configuración SEO y hero de la página',
      collapsible: true,
      defaultExpanded: true
    },
    {
      name: 'timeline_manager',
      label: 'Editor de Timeline',
      description: 'Gestión visual de eventos históricos con imágenes y métricas',
      collapsible: true,
      defaultExpanded: true
    },
    {
      name: 'achievement_stats',
      label: 'Estadísticas de Logros',
      description: 'Editor dinámico de métricas principales',
      collapsible: true,
      defaultExpanded: true
    },
    {
      name: 'call_to_action',
      label: 'Call to Action Final',
      description: 'Sección de llamada a la acción al final de la página',
      collapsible: true,
      defaultExpanded: false
    }
  ],
  fields: [
    // Page Info Group - usando componentes avanzados
    {
      key: 'page.title',
      label: 'Título Principal',
      type: 'text' as const,
      required: false,
      maxLength: 60,
      group: 'page_info',
      description: 'Título principal que aparece en el hero'
    },
    {
      key: 'page.subtitle',
      label: 'Subtítulo',
      type: 'text' as const,
      required: false,
      maxLength: 120,
      group: 'page_info',
      description: 'Subtítulo descriptivo del hero'
    },
    {
      key: 'page.description',
      label: 'Descripción Principal',
      type: 'textarea' as const,
      required: false,
      rows: 3,
      maxLength: 300,
      group: 'page_info',
      description: 'Descripción que aparece bajo el hero'
    },
    {
      key: 'page.hero_background_type',
      label: 'Tipo de Fondo Hero',
      type: 'select' as const,
      group: 'page_info',
      description: 'Selecciona si quieres usar un video o una imagen como fondo del hero',
      options: [
        { value: 'image', label: 'Imagen de Fondo' },
        { value: 'video', label: 'Video de Fondo' }
      ],
      required: false,
      defaultValue: 'image'
    },
    {
      key: 'page.hero_video',
      label: 'Video Principal',
      type: 'custom' as const,
      component: 'video-field' as const,
      placeholder: 'Seleccionar video de fondo',
      group: 'page_info',
      description: 'Video principal para el hero. Puedes subir un archivo o usar una URL externa.',
      dependsOn: {
        field: 'page.hero_background_type',
        value: 'video'
      }
    },
    {
      key: 'page.hero_video_fallback',
      label: 'Video Alternativo (opcional)',
      type: 'text' as const,
      group: 'page_info',
      description: 'URL alternativa del video en caso de que el principal no cargue',
      dependsOn: {
        field: 'page.hero_background_type',
        value: 'video'
      }
    },
    {
      key: 'page.hero_image_fallback',
      label: 'Imagen Fallback del Video',
      type: 'image' as const,
      placeholder: 'Seleccionar imagen fallback',
      group: 'page_info',
      description: 'Imagen que se muestra mientras carga el video o si el video falla.',
      dependsOn: {
        field: 'page.hero_background_type',
        value: 'video'
      }
    },
    {
      key: 'page.hero_image',
      label: 'Imagen Principal',
      type: 'image' as const,
      placeholder: 'Seleccionar imagen de fondo',
      group: 'page_info',
      description: 'Imagen principal para el fondo del hero.',
      dependsOn: {
        field: 'page.hero_background_type',
        value: 'image'
      }
    },
    {
      key: 'page.hero_overlay_opacity',
      label: 'Opacidad del Overlay (0-1)',
      type: 'number' as const,
      group: 'page_info',
      description: 'Intensidad de la capa oscura sobre el fondo',
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0.5
    },

    // Timeline Manager - usando componente especializado
    {
      key: 'timeline_events',
      label: 'Eventos del Timeline',
      type: 'custom' as const,
      component: 'timeline-builder' as const,
      required: false,
      group: 'timeline_manager',
      description: 'Editor visual para crear y gestionar eventos históricos con imágenes, métricas y galerías',
      config: {
        maxEvents: 10,
        showMetrics: true,
        showGallery: true,
        showAchievements: true,
        fieldsConfig: {
          year: { required: false, type: 'text', placeholder: 'Ej: 2015 o 2015 - 2020' },
          title: { required: false, maxLength: 100 },
          subtitle: { required: false, maxLength: 150 },
          description: { required: false, maxLength: 500 },
          image: { type: 'image-field', required: false },
          achievements: { type: 'list', maxItems: 10 },
          gallery: { type: 'image-gallery', maxImages: 6 },
          impact: { maxLength: 300 },
          metrics: {
            team_size: { type: 'number', min: 0 },
            projects: { type: 'number', min: 0 },
            investment: { type: 'text', placeholder: '$1.2M' }
          }
        }
      }
    },
    {
      key: 'final_image',
      label: 'Imagen Final del Timeline (Opcional)',
      type: 'image' as const,
      placeholder: 'Seleccionar imagen final',
      group: 'timeline_manager',
      required: false,
      description: 'Imagen que se mostrará al final del timeline horizontal. Si no se selecciona, no se mostrará ninguna imagen final.'
    },

    // Achievement Stats - usando componente de estadísticas
    {
      key: 'achievement_summary.title',
      label: 'Título de Logros',
      type: 'text' as const,
      required: false,
      maxLength: 50,
      group: 'achievement_stats',
      description: 'Título de la sección de logros'
    },
    {
      key: 'achievement_summary.metrics',
      label: 'Métricas Principales',
      type: 'custom' as const,
      component: 'statistics-builder' as const,
      required: false,
      group: 'achievement_stats',
      description: 'Editor dinámico de métricas y estadísticas principales',
      config: {
        maxStats: 6,
        fieldsConfig: {
          number: { required: false, placeholder: '200+' },
          label: { required: false, maxLength: 50, placeholder: 'Proyectos Completados' },
          description: { required: false, maxLength: 100, placeholder: 'Desde complejos hospitalarios hasta centros comerciales' },
          icon: { type: 'icon-picker', required: false },
          color: { type: 'color-picker', default: '#003F6F' }
        }
      }
    },

    // Call to Action - sección final de la página
    {
      key: 'call_to_action.title',
      label: 'Título del Call to Action',
      type: 'text' as const,
      required: false,
      maxLength: 80,
      group: 'call_to_action',
      description: 'Título principal de la llamada a la acción'
    },
    {
      key: 'call_to_action.description',
      label: 'Descripción',
      type: 'textarea' as const,
      required: false,
      rows: 2,
      maxLength: 200,
      group: 'call_to_action',
      description: 'Texto descriptivo que acompaña al call to action'
    },
    {
      key: 'call_to_action.primary_button.text',
      label: 'Texto Botón Principal',
      type: 'text' as const,
      required: false,
      maxLength: 30,
      group: 'call_to_action',
      description: 'Texto del botón principal'
    },
    {
      key: 'call_to_action.primary_button.href',
      label: 'Enlace Botón Principal',
      type: 'text' as const,
      required: false,
      maxLength: 100,
      group: 'call_to_action',
      description: 'URL o ruta del botón principal'
    },
    {
      key: 'call_to_action.secondary_button.text',
      label: 'Texto Botón Secundario',
      type: 'text' as const,
      required: false,
      maxLength: 30,
      group: 'call_to_action',
      description: 'Texto del botón secundario'
    },
    {
      key: 'call_to_action.secondary_button.href',
      label: 'Enlace Botón Secundario',
      type: 'text' as const,
      required: false,
      maxLength: 100,
      group: 'call_to_action',
      description: 'URL o ruta del botón secundario'
    }
  ]
};