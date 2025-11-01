// Sample data for ISO 9001 page
import { 
  ISOCertification, 
  QualityMetric, 
  QualityProcess, 
  AuditRecord, 
  QualityPolicy,
  CertificationTimeline,
  ISOStats,
  CustomerSatisfaction,
  ImprovementOpportunity
} from '@/types/iso';

export const currentCertification: ISOCertification = {
  id: 'iso_cert_2023',
  standard: 'ISO 9001:2015',
  issueDate: new Date('2023-06-15'),
  expiryDate: new Date('2026-06-14'),
  certifyingBody: 'SGS Peru',
  certificateNumber: 'PE18/70291',
  scope: [
    'Gestión de proyectos de infraestructura',
    'Supervisión y control de obras',
    'Consultoría en construcción'
  ],
  status: 'active',
  pdfUrl: '/documents/ISO-9001-Certificate-2023.pdf',
  verificationUrl: 'https://www.sgs.pe/verify-certificate/PE18-70291'
};

export const qualityMetrics: QualityMetric[] = [
  {
    id: 'customer_satisfaction',
    name: 'Satisfacción del Cliente',
    description: 'Nivel de satisfacción promedio de nuestros clientes',
    category: 'satisfaction',
    target: 95,
    current: 98,
    trend: 'up',
    period: '2024',
    unit: 'percentage',
    lastUpdated: new Date('2024-12-15')
  },
  {
    id: 'audit_compliance',
    name: 'Conformidad en Auditorías',
    description: 'Porcentaje de auditorías sin no conformidades',
    category: 'compliance',
    target: 95,
    current: 100,
    trend: 'stable',
    period: '2024',
    unit: 'percentage',
    lastUpdated: new Date('2024-12-15')
  },
  {
    id: 'project_delivery',
    name: 'Entrega a Tiempo',
    description: 'Proyectos entregados dentro del plazo establecido',
    category: 'efficiency',
    target: 90,
    current: 94,
    trend: 'up',
    period: '2024',
    unit: 'percentage',
    lastUpdated: new Date('2024-12-15')
  },
  {
    id: 'zero_incidents',
    name: 'Incidentes de Calidad',
    description: 'Número de incidentes críticos de calidad',
    category: 'quality',
    target: 0,
    current: 0,
    trend: 'stable',
    period: '2024',
    unit: 'count',
    lastUpdated: new Date('2024-12-15')
  },
  {
    id: 'process_efficiency',
    name: 'Eficiencia de Procesos',
    description: 'Tiempo promedio de ejecución de procesos clave',
    category: 'efficiency',
    target: 15,
    current: 12,
    trend: 'down', // down is good for time metrics
    period: '2024',
    unit: 'days',
    lastUpdated: new Date('2024-12-15')
  },
  {
    id: 'team_competence',
    name: 'Competencia del Equipo',
    description: 'Personal certificado y competente',
    category: 'quality',
    target: 85,
    current: 92,
    trend: 'up',
    period: '2024',
    unit: 'percentage',
    lastUpdated: new Date('2024-12-15')
  }
];

export const qualityProcesses: QualityProcess[] = [
  {
    id: 'strategic_planning',
    name: 'Planificación Estratégica',
    description: 'Definición de objetivos de calidad y estrategias de la organización',
    category: 'strategic',
    owner: 'Dirección General',
    inputs: ['Política de Calidad', 'Objetivos Organizacionales', 'Análisis del Contexto'],
    outputs: ['Plan Estratégico', 'Objetivos de Calidad', 'Recursos Asignados'],
    kpis: ['customer_satisfaction', 'market_share'],
    documentation: {
      procedure: 'PR-EST-001',
      forms: ['FR-EST-001', 'FR-EST-002']
    },
    lastReview: new Date('2024-06-15'),
    nextReview: new Date('2025-06-15')
  },
  {
    id: 'project_management',
    name: 'Gestión de Proyectos',
    description: 'Planificación, ejecución y control de proyectos de construcción',
    category: 'operational',
    owner: 'Gerencia de Proyectos',
    inputs: ['Requisitos del Cliente', 'Recursos', 'Cronograma'],
    outputs: ['Proyecto Completado', 'Documentación de Cierre', 'Lecciones Aprendidas'],
    kpis: ['project_delivery', 'budget_compliance'],
    documentation: {
      procedure: 'PR-PRO-001',
      workInstruction: 'IT-PRO-001',
      forms: ['FR-PRO-001', 'FR-PRO-002', 'FR-PRO-003']
    },
    lastReview: new Date('2024-03-15'),
    nextReview: new Date('2025-03-15')
  },
  {
    id: 'supplier_management',
    name: 'Gestión de Proveedores',
    description: 'Selección, evaluación y seguimiento de proveedores',
    category: 'support',
    owner: 'Departamento de Compras',
    inputs: ['Requisitos de Compra', 'Criterios de Selección'],
    outputs: ['Proveedores Calificados', 'Evaluación de Desempeño'],
    kpis: ['supplier_performance', 'delivery_compliance'],
    documentation: {
      procedure: 'PR-COM-001',
      forms: ['FR-COM-001', 'FR-COM-002']
    },
    lastReview: new Date('2024-09-15'),
    nextReview: new Date('2025-09-15')
  },
  {
    id: 'continuous_improvement',
    name: 'Mejora Continua',
    description: 'Identificación y implementación de oportunidades de mejora',
    category: 'improvement',
    owner: 'Responsable de Calidad',
    inputs: ['No Conformidades', 'Sugerencias', 'Datos de Desempeño'],
    outputs: ['Acciones Correctivas', 'Mejoras Implementadas'],
    kpis: ['improvement_projects', 'cost_savings'],
    documentation: {
      procedure: 'PR-MEJ-001',
      forms: ['FR-MEJ-001', 'FR-MEJ-002']
    },
    lastReview: new Date('2024-11-15'),
    nextReview: new Date('2025-11-15')
  }
];

export const auditRecords: AuditRecord[] = [
  {
    id: 'audit_2024_cert',
    type: 'recertification',
    date: new Date('2024-06-15'),
    auditor: 'SGS Peru - Carlos Mendoza',
    scope: ['Sistema de Gestión Completo', 'Todos los Procesos', 'Dirección Integral'],
    result: 'conformity',
    findings: [],
    duration: 3,
    nextFollowUp: new Date('2025-06-15')
  },
  {
    id: 'audit_2024_int_q2',
    type: 'internal',
    date: new Date('2024-09-20'),
    auditor: 'Ana Rodriguez - Auditor Interno',
    scope: ['Gestión de Proyectos', 'Control de Calidad', 'Documentación'],
    result: 'minor_findings',
    findings: [
      'Falta de registro de capacitación en nuevo software BIM',
      'Actualización pendiente de procedimiento PR-PRO-001'
    ],
    duration: 1,
    nextFollowUp: new Date('2025-09-20')
  },
  {
    id: 'audit_2024_ext',
    type: 'external',
    date: new Date('2024-11-10'),
    auditor: 'Cliente Torre Empresarial',
    scope: ['Control de Calidad en Obra', 'Procesos de Construcción'],
    result: 'conformity',
    findings: [],
    duration: 1
  },
  {
    id: 'audit_2024_surv_q1',
    type: 'surveillance',
    date: new Date('2024-03-15'),
    auditor: 'SGS Peru - Patricia Vásquez',
    scope: ['Procesos Estratégicos', 'Gestión de Recursos', 'Mejora Continua'],
    result: 'conformity',
    findings: [],
    duration: 2,
    nextFollowUp: new Date('2025-03-15')
  },
  {
    id: 'audit_2023_int_q4',
    type: 'internal',
    date: new Date('2023-12-08'),
    auditor: 'Roberto Silva - Auditor Interno',
    scope: ['Gestión de Proveedores', 'Control de Documentos'],
    result: 'minor_findings',
    findings: [
      'Evaluación de proveedores con retraso de 2 meses',
      'Documentos obsoletos en archivo físico'
    ],
    duration: 1,
    nextFollowUp: new Date('2024-12-08')
  },
  {
    id: 'audit_2023_ext_client',
    type: 'external',
    date: new Date('2023-08-22'),
    auditor: 'Auditor Cliente Mall del Sur',
    scope: ['Procesos de Construcción', 'Seguridad en Obra'],
    result: 'conformity',
    findings: [],
    duration: 1
  }
];

// Keep the old export for backwards compatibility
export const recentAudits = auditRecords;

export const certificationTimeline: CertificationTimeline[] = [
  {
    id: 'cert_2018',
    year: 2018,
    event: 'initial_certification',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_issued',
    validUntil: new Date('2021-06-14'),
    notes: 'Primera certificación ISO 9001:2015 para Métrica FM'
  },
  {
    id: 'surv_2019',
    year: 2019,
    event: 'surveillance_audit',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_maintained',
    notes: 'Auditoría de seguimiento sin no conformidades'
  },
  {
    id: 'surv_2020',
    year: 2020,
    event: 'surveillance_audit',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_maintained',
    notes: 'Adaptación exitosa a trabajo remoto durante pandemia'
  },
  {
    id: 'recert_2021',
    year: 2021,
    event: 'recertification',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_issued',
    validUntil: new Date('2024-06-14'),
    notes: 'Primera recertificación exitosa'
  },
  {
    id: 'surv_2022',
    year: 2022,
    event: 'surveillance_audit',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_maintained',
    notes: 'Implementación de mejoras en gestión digital'
  },
  {
    id: 'surv_2023',
    year: 2023,
    event: 'surveillance_audit',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_maintained',
    notes: 'Expansión del alcance a nuevos servicios'
  },
  {
    id: 'recert_2024',
    year: 2024,
    event: 'recertification',
    status: 'completed',
    certifyingBody: 'SGS Peru',
    outcome: 'certificate_issued',
    validUntil: new Date('2027-06-14'),
    notes: 'Segunda recertificación con ampliación de alcance'
  },
  {
    id: 'surv_2025',
    year: 2025,
    event: 'surveillance_audit',
    status: 'scheduled',
    certifyingBody: 'SGS Peru',
    notes: 'Auditoría de seguimiento programada para Q2 2025'
  }
];

export const qualityPolicy: QualityPolicy = {
  id: 'policy_2024',
  title: 'Política de Calidad Métrica FM',
  version: '3.0',
  approvalDate: new Date('2024-01-15'),
  approvedBy: 'Carlos Mendoza - Director General',
  nextReview: new Date('2025-01-15'),
  content: {
    commitment: 'Métrica FM se compromete a proporcionar servicios de dirección integral de proyectos de construcción e infraestructura que cumplan y superen las expectativas de nuestros clientes, aplicando las mejores prácticas de la industria y manteniendo los más altos estándares de calidad.',
    objectives: [
      'Mantener un nivel de satisfacción del cliente superior al 95%',
      'Cumplir con todos los requisitos legales y reglamentarios aplicables',
      'Entregar el 100% de proyectos dentro del plazo acordado',
      'Mantener cero incidentes críticos de calidad',
      'Mejorar continuamente la eficiencia de nuestros procesos',
      'Desarrollar las competencias de nuestro equipo de trabajo'
    ],
    principles: [
      'Enfoque al cliente como prioridad absoluta',
      'Liderazgo comprometido con la calidad',
      'Participación y compromiso de todo el personal',
      'Enfoque basado en procesos y gestión por resultados',
      'Mejora continua como filosofía organizacional',
      'Toma de decisiones basada en evidencia y datos',
      'Gestión de relaciones con partes interesadas',
      'Responsabilidad social y ambiental'
    ],
    responsibilities: [
      'La Dirección General es responsable de establecer y comunicar la política de calidad',
      'Todos los colaboradores son responsables de implementar y mantener el sistema de gestión de calidad',
      'Los jefes de área son responsables del cumplimiento de objetivos en sus procesos',
      'El Responsable de Calidad coordina el sistema y reporta su desempeño'
    ]
  },
  pdfUrl: '/documents/Politica-Calidad-2024.pdf'
};

export const isoStats: ISOStats = {
  certificationYears: 7,
  totalProcesses: 45,
  totalAudits: 12,
  averageSatisfaction: 98,
  conformityRate: 100,
  improvementProjects: 23,
  certifiedProjects: 247,
  teamMembers: 42
};

export const customerSatisfaction: CustomerSatisfaction = {
  id: 'satisfaction_2024',
  period: '2024',
  totalResponses: 89,
  overallSatisfaction: 4.8,
  categories: {
    quality: 4.9,
    delivery: 4.7,
    communication: 4.8,
    support: 4.6,
    value: 4.7
  },
  nps: 87,
  comments: {
    positive: [
      'Excelente gestión de proyecto, siempre atentos a los detalles',
      'Cumplieron con todos los plazos establecidos',
      'Personal altamente capacitado y profesional',
      'Gran calidad en la entrega final'
    ],
    negative: [
      'Algunos retrasos menores en comunicación inicial',
      'Podría mejorar la frecuencia de reportes'
    ],
    suggestions: [
      'Implementar reportes semanales automatizados',
      'Crear portal del cliente para seguimiento en tiempo real',
      'Ampliar equipo para proyectos simultáneos'
    ]
  },
  trends: [
    { period: '2020', score: 4.2 },
    { period: '2021', score: 4.4 },
    { period: '2022', score: 4.6 },
    { period: '2023', score: 4.7 },
    { period: '2024', score: 4.8 }
  ]
};

export const improvementOpportunities: ImprovementOpportunity[] = [
  {
    id: 'imp_001',
    title: 'Automatización de Reportes de Progreso',
    description: 'Implementar sistema automático de reportes de avance de obra para clientes',
    source: 'customer_feedback',
    category: 'process',
    priority: 'high',
    proposedBy: 'Ana Rodriguez',
    dateProposed: new Date('2024-11-01'),
    status: 'approved',
    expectedBenefits: [
      'Reducción de 50% en tiempo de elaboración de reportes',
      'Mejora en satisfacción del cliente',
      'Mayor transparencia en comunicación'
    ],
    resources: {
      budget: 25000,
      timeframe: '3 meses',
      personnel: ['Desarrollador', 'Project Manager', 'UX Designer']
    },
    roi: 150
  },
  {
    id: 'imp_002',
    title: 'Certificación BIM para todo el equipo',
    description: 'Capacitar y certificar al 100% del equipo técnico en metodología BIM',
    source: 'management_review',
    category: 'system',
    priority: 'medium',
    proposedBy: 'Roberto Silva',
    dateProposed: new Date('2024-10-15'),
    status: 'in_progress',
    expectedBenefits: [
      'Mejora en eficiencia de diseño',
      'Reducción de errores en documentación',
      'Mayor competitividad en mercado'
    ],
    resources: {
      budget: 35000,
      timeframe: '6 meses',
      personnel: ['Todo el equipo técnico']
    },
    roi: 200
  },
  {
    id: 'imp_003',
    title: 'Sistema de Gestión Documental Digital',
    description: 'Migración completa a sistema digital para gestión de documentos de proyecto',
    source: 'audit',
    category: 'process',
    priority: 'medium',
    proposedBy: 'María Fernández',
    dateProposed: new Date('2024-09-20'),
    status: 'proposed',
    expectedBenefits: [
      'Reducción de papel en 80%',
      'Acceso más rápido a documentación',
      'Mejor control de versiones'
    ],
    resources: {
      budget: 45000,
      timeframe: '4 meses',
      personnel: ['IT Specialist', 'Document Controller', 'Project Managers']
    }
  }
];