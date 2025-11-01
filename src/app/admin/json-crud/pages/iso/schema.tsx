export const isoSchema = {
    title: '',
    groups: [
    {
        name: 'page_info',
        label: '📄 Información de la Página',
        description: 'Configuración SEO y meta información para el posicionamiento web',
        collapsible: true,
        defaultExpanded: true
    },
    {
        name: 'hero_certificate',
        label: '🏆 Hero & Certificado',
        description: 'Banner principal, estadísticas y detalles oficiales del certificado ISO 9001:2015',
        collapsible: true,
        defaultExpanded: true
    },
    {
        name: 'introduction_benefits',
        label: '💡 Introducción & Beneficios ISO',
        description: 'Explicación de ISO 9001, beneficios clave, alcance de certificación e importancia',
        collapsible: true,
        defaultExpanded: false
    },
    {
        name: 'quality_policy_commitments',
        label: '📋 Política de Calidad & Compromisos',
        description: 'Documento oficial de calidad, compromisos empresariales y objetivos estratégicos',
        collapsible: true,
        defaultExpanded: false
    }
    ],
    fields: [
                // Page Info Group
                {
                key: 'page.title',
                label: 'Título SEO',
                type: 'text' as const,
                required: true,
                group: 'page_info',
                description: 'Título optimizado para motores de búsqueda (máximo 60 caracteres recomendados)',
                placeholder: 'ISO 9001:2015 Certificación | Métrica FM - Calidad Garantizada'
                },
    {
        key: 'page.description',
        label: 'Descripción SEO',
        type: 'textarea' as const,
        required: true,
        group: 'page_info',
        description: 'Meta descripción para buscadores (150-160 caracteres óptimo)',
        placeholder: 'Métrica FM cuenta con certificación ISO 9001:2015. Garantizamos excelencia en gestión de proyectos...'
    },

    // Hero Section Group
    {
        key: 'hero.background_gradient',
        label: 'Gradiente de Fondo',
        type: 'custom' as const,
        component: 'gradient-selector' as const,
        group: 'hero_certificate',
        description: 'Selecciona los colores para el gradiente de fondo del hero',
        customProps: {
            defaultColors: {
                from: '#003F6F',
                to: '#001A33'
            }
        }
    },
    {
        key: 'hero.title',
        label: 'Título Principal Hero',
        type: 'text' as const,
        required: true,
        group: 'hero_certificate',
        description: 'Título principal visible en la cabecera de la página',
        placeholder: 'ISO 9001'
    },
    {
        key: 'hero.subtitle',
        label: 'Subtítulo Hero',
        type: 'text' as const,
        required: true,
        group: 'hero_certificate',
        description: 'Subtítulo complementario del hero',
        placeholder: 'Certificación 2015'
    },
    {
        key: 'hero.description',
        label: 'Descripción Hero',
        type: 'textarea' as const,
        required: true,
        group: 'hero_certificate',
        description: 'Descripción principal que explica el valor de la certificación',
        placeholder: 'Excelencia certificada en gestión de proyectos de construcción e infraestructura'
    },
    {
        key: 'hero.certification_status.is_valid',
        label: 'Certificación Vigente',
        type: 'checkbox' as const,
        group: 'hero_certificate',
        description: 'Indica si la certificación está actualmente vigente'
    },
    {
        key: 'hero.certification_status.status_text',
        label: 'Texto del Estado',
        type: 'text' as const,
        group: 'hero_certificate',
        description: 'Texto descriptivo del estado de la certificación',
        placeholder: 'Certificación Vigente'
    },
    {
        key: 'hero.certification_status.since_year',
        label: 'Certificado Desde (Año)',
        type: 'text' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.stats.certification_years',
        label: 'Años de Certificación',
        type: 'text' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.stats.certified_projects',
        label: 'Proyectos Certificados',
        type: 'text' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.stats.average_satisfaction',
        label: 'Satisfacción Promedio',
        type: 'text' as const,
        group: 'hero_certificate'
    },

    // Certificate Details
    {
        key: 'hero.certificate_details.certifying_body',
        label: 'Entidad Certificadora',
        type: 'text' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.certificate_details.certificate_number',
        label: 'Número de Certificado',
        type: 'text' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.certificate_details.issue_date',
        label: 'Fecha de Emisión',
        type: 'date' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.certificate_details.expiry_date',
        label: 'Fecha de Vencimiento',
        type: 'date' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.certificate_details.verification_url',
        label: 'URL de Verificación',
        type: 'url' as const,
        group: 'hero_certificate'
    },
    {
        key: 'hero.certificate_details.pdf_url',
        label: 'URL del Certificado PDF',
        type: 'custom' as const,
        component: 'pdf-field' as const,
        description: 'Sube un archivo PDF o proporciona una URL externa al certificado ISO 9001',
        group: 'hero_certificate'
    },
    {
        key: 'hero.action_buttons',
        label: 'Botones de Acción Hero',
        type: 'custom' as const,
        component: 'action-buttons-editor' as const,
        description: 'Configurar botones de llamada a la acción en la sección hero',
        group: 'hero_certificate',
        customProps: { maxButtons: 3 }
    },

    // Introduction Section
    {
        key: 'introduction.section.title',
        label: 'Título Introducción',
        type: 'text' as const,
        required: true,
        group: 'introduction_benefits'
    },
    {
        key: 'introduction.section.subtitle',
        label: 'Subtítulo Introducción',
        type: 'text' as const,
        required: true,
        group: 'introduction_benefits'
    },
    {
        key: 'introduction.section.description',
        label: 'Descripción ISO 9001',
        type: 'textarea' as const,
        required: true,
        group: 'introduction_benefits'
    },
    {
        key: 'introduction.importance.title',
        label: 'Título Importancia',
        type: 'text' as const,
        required: true,
        group: 'introduction_benefits',
        placeholder: '¿Por qué es importante?',
        description: 'Título de la sección que explica la importancia de ISO 9001'
    },
    {
        key: 'introduction.importance.reasons',
        label: 'Razones de Importancia',
        type: 'custom' as const,
        component: 'importance-reasons-editor' as const,
        required: false,
        group: 'introduction_benefits',
        description: 'Editor para gestionar las razones por las cuales ISO 9001 es importante',
        customProps: {
            maxReasons: 6,
            title: 'Razones de Importancia ISO 9001',
            description: 'Define las razones clave por las que la certificación ISO 9001 es importante para la empresa'
        }
    },

    // Quality Policy
    {
        key: 'quality_policy.document.title',
        label: 'Título Documento Calidad',
        type: 'text' as const,
        group: 'quality_policy_commitments'
    },
    {
        key: 'quality_policy.document.version',
        label: 'Versión Documento',
        type: 'text' as const,
        group: 'quality_policy_commitments'
    },
    {
        key: 'quality_policy.document.last_update',
        label: 'Última Actualización',
        type: 'date' as const,
        group: 'quality_policy_commitments'
    },
    {
        key: 'quality_policy.document.approved_by',
        label: 'Aprobado por',
        type: 'text' as const,
        group: 'quality_policy_commitments'
    },
    {
        key: 'quality_policy.document.effective_date',
        label: 'Fecha Efectiva',
        type: 'date' as const,
        group: 'quality_policy_commitments'
    },
    {
        key: 'quality_policy.document.next_review',
        label: 'Próxima Revisión',
        type: 'date' as const,
        group: 'quality_policy_commitments'
    },

    // Declaración de Política de Calidad
    {
        key: 'quality_policy.statement.title',
        label: 'Título de la Declaración',
        type: 'text' as const,
        group: 'quality_policy_commitments',
        placeholder: 'Declaración de Política de Calidad',
        description: 'Título principal de la declaración de política'
    },
    {
        key: 'quality_policy.statement.content',
        label: 'Contenido de la Declaración',
        type: 'textarea' as const,
        required: true,
        group: 'quality_policy_commitments',
        rows: 6,
        placeholder: 'En Métrica FM nos comprometemos a ser líderes en la dirección integral de proyectos...',
        description: 'Texto completo de la declaración de política de calidad'
    },
    {
        key: 'quality_policy.statement.signed_by.position',
        label: 'Cargo del Firmante',
        type: 'text' as const,
        group: 'quality_policy_commitments',
        placeholder: 'Dirección General',
        description: 'Cargo de la persona que firma la política'
    },
    {
        key: 'quality_policy.statement.signed_by.company',
        label: 'Empresa del Firmante',
        type: 'text' as const,
        group: 'quality_policy_commitments',
        placeholder: 'Métrica FM S.A.C.',
        description: 'Nombre de la empresa'
    },

    ]
};