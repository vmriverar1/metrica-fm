// Careers Types - Basado en la estrategia bolsa-trabajo-strategy.md
export type JobCategory = 
  | 'gestion-direccion'
  | 'ingenieria-tecnica' 
  | 'arquitectura-diseño'
  | 'operaciones-control'
  | 'administracion-soporte';

export const JobCategory = {
  GESTION: 'gestion-direccion' as const,
  INGENIERIA: 'ingenieria-tecnica' as const,
  ARQUITECTURA: 'arquitectura-diseño' as const,
  OPERACIONES: 'operaciones-control' as const,
  ADMINISTRACION: 'administracion-soporte' as const,
} as const;

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';

export const JobType = {
  FULL_TIME: 'full-time' as const,
  PART_TIME: 'part-time' as const,
  CONTRACT: 'contract' as const,
  INTERNSHIP: 'internship' as const,
} as const;
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'director';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';

export interface JobLocation {
  city: string;
  region: string;
  country: string;
  address?: string;
  remote: boolean;
  hybrid: boolean;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
  negotiable: boolean;
}

export interface JobRequirement {
  id: string;
  type: 'education' | 'experience' | 'skill' | 'certification' | 'language';
  title: string;
  description: string;
  required: boolean;
  weight: number; // Para scoring de compatibilidad
}

export interface JobBenefit {
  id: string;
  category: 'compensation' | 'health' | 'time-off' | 'development' | 'culture' | 'perks';
  title: string;
  description: string;
  icon?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  category: JobCategory;
  department: string;
  location: JobLocation;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  remote: boolean;
  experience: number; // años de experiencia requerida
  
  // Content
  description: string;
  responsibilities: string[];
  requirements: JobRequirement[];
  benefits: JobBenefit[];
  niceToHave?: string[];
  
  // Compensation
  salary?: SalaryRange;
  
  // Dates
  postedAt: Date;
  deadline: Date;
  createdAt: Date;
  updatedAt?: Date;
  
  // Meta
  tags: string[];
  featured: boolean;
  urgent: boolean;
  applicantCount?: number;
  viewCount?: number;
  
  // Relations
  hiringManager?: {
    name: string;
    email: string;
    role: string;
  };
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// === FASE 5: ADVANCED FEATURES - APPLICATIONS SYSTEM ===

export type ApplicationStatus = 
  | 'submitted'      // Enviada por el candidato
  | 'reviewing'      // En revisión inicial
  | 'shortlisted'    // Preseleccionado
  | 'interview'      // En proceso de entrevista
  | 'assessment'     // En evaluación técnica
  | 'final-review'   // Revisión final
  | 'approved'       // Aprobado
  | 'rejected'       // Rechazado
  | 'hired'          // Contratado
  | 'withdrawn';     // Retirado por candidato

export type ApplicationSource = 
  | 'website'        // Aplicación directa desde la web
  | 'linkedin'       // LinkedIn
  | 'referral'       // Referido interno
  | 'headhunter'     // Cazatalentos
  | 'job-board'      // Portal de empleos
  | 'direct';        // Contacto directo

export type ApplicationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CandidateInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;
  github?: string;
  location: {
    city: string;
    country: string;
  };
  availability: {
    startDate: Date;
    noticePeriod: number; // días
  };
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };
}

export interface ApplicationDocument {
  id: string;
  type: 'cv' | 'cover-letter' | 'portfolio' | 'certificates' | 'references';
  filename: string;
  url: string;
  size: number; // bytes
  uploadedAt: Date;
  verified: boolean;
}

export interface ApplicationQuestion {
  id: string;
  type: 'text' | 'multiple-choice' | 'boolean' | 'rating' | 'file';
  question: string;
  required: boolean;
  options?: string[]; // Para multiple-choice
  maxLength?: number; // Para text
}

export interface ApplicationResponse {
  questionId: string;
  answer: string | boolean | number;
  fileUrl?: string; // Para respuestas tipo file
}

export interface ApplicationScore {
  overall: number; // 0-100
  experience: number; // 0-100
  skills: number; // 0-100  
  education: number; // 0-100
  cultural: number; // 0-100
  requirements: number; // 0-100
  notes?: string;
  scoredBy?: string;
  scoredAt?: Date;
}

export interface ApplicationInterview {
  id: string;
  type: 'phone' | 'video' | 'in-person' | 'technical';
  scheduledAt: Date;
  duration: number; // minutes
  interviewer: {
    name: string;
    email: string;
    role: string;
  };
  location?: string; // Para in-person
  meetingLink?: string; // Para video
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: {
    rating: number; // 1-5
    comments: string;
    recommendation: 'hire' | 'reject' | 'maybe';
  };
}

export interface ApplicationActivity {
  id: string;
  type: 'status-change' | 'interview-scheduled' | 'document-uploaded' | 'note-added' | 'score-updated';
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: any;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string; // Para referencia rápida
  candidateInfo: CandidateInfo;
  documents: ApplicationDocument[];
  responses: ApplicationResponse[];
  
  // Status y tracking
  status: ApplicationStatus;
  priority: ApplicationPriority;
  source: ApplicationSource;
  submittedAt: Date;
  updatedAt?: Date;
  
  // Evaluación
  score?: ApplicationScore;
  interviews: ApplicationInterview[];
  
  // Metadatos
  tags: string[];
  flagged: boolean;
  flagReason?: string;
  
  // Timeline de actividades
  activities: ApplicationActivity[];
  
  // Asignación
  assignedTo?: {
    recruiterId: string;
    recruiterName: string;
    assignedAt: Date;
  };
  
  // Feedback y notas internas
  internalNotes: {
    id: string;
    note: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    private: boolean; // Solo visible para el autor y superiores
  }[];
  
  // Analytics
  viewCount: number;
  lastViewedAt?: Date;
  timeInStage: number; // días en el estado actual
}

export interface CareerFilters {
  category?: JobCategory;
  location?: string;
  type?: JobType;
  level?: JobLevel;
  department?: string;
  salaryRange?: [number, number];
  remote?: boolean;
  tags?: string[];
  skills?: string[];
  searchQuery?: string;
  featured?: boolean;
  urgent?: boolean;
}

export interface CareersStats {
  totalPositions: number;
  totalCategories: number;
  totalApplications: number;
  averageSalary: number;
  topLocations: { location: string; count: number }[];
  popularBenefits: { benefit: string; count: number }[];
}

// === PHASE 5: ADVANCED RECRUITMENT ANALYTICS ===

export interface RecruitmentStats {
  applications: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number; // percentage
    byStatus: Record<ApplicationStatus, number>;
    bySource: Record<ApplicationSource, number>;
    byPriority: Record<ApplicationPriority, number>;
  };
  
  performance: {
    averageTimeToHire: number; // días
    averageTimeInStage: Record<ApplicationStatus, number>; // días por etapa
    conversionRates: {
      submittedToReviewing: number;
      reviewingToShortlisted: number;
      shortlistedToInterview: number;
      interviewToHired: number;
      overallConversion: number;
    };
    
    topRecruiters: {
      recruiterId: string;
      recruiterName: string;
      applicationsReviewed: number;
      hires: number;
      averageScore: number;
    }[];
  };
  
  candidates: {
    topSources: { source: ApplicationSource; count: number; conversionRate: number }[];
    topLocations: { location: string; count: number }[];
    skillsInDemand: { skill: string; count: number }[];
    experienceLevels: Record<JobLevel, number>;
    salaryRanges: {
      range: string;
      count: number;
      avgSalaryExpected: number;
    }[];
  };
  
  trends: {
    applicationsOverTime: {
      period: string; // 'YYYY-MM' or 'YYYY-MM-DD'
      applications: number;
      hires: number;
    }[];
    
    popularPositions: {
      jobId: string;
      jobTitle: string;
      applications: number;
      views: number;
      conversionRate: number;
    }[];
  };
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  priority?: ApplicationPriority[];
  source?: ApplicationSource[];
  jobId?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  score?: {
    min: number;
    max: number;
  };
  tags?: string[];
  flagged?: boolean;
  searchQuery?: string; // búsqueda en nombre, email, skills
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    newApplication: boolean;
    statusChange: boolean;
    interviewReminder: boolean;
    deadlineAlert: boolean;
    systemUpdate: boolean;
  };
}

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  role: 'recruiter' | 'hiring-manager' | 'admin';
  department: string;
  permissions: {
    canViewAllApplications: boolean;
    canUpdateApplicationStatus: boolean;
    canScheduleInterviews: boolean;
    canAccessAnalytics: boolean;
    canManageJobs: boolean;
    canExportData: boolean;
  };
  notificationPreferences: NotificationPreferences;
  avatar?: string;
  timezone: string;
  lastActive: Date;
  createdAt: Date;
}

// Sistema de notificaciones
export interface NotificationEvent {
  id: string;
  type: 'application-submitted' | 'status-changed' | 'interview-scheduled' | 'deadline-approaching' | 'new-message';
  title: string;
  message: string;
  recipientId: string;
  applicationId?: string;
  jobId?: string;
  
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('email' | 'push' | 'sms')[];
  
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  
  metadata?: {
    templateId?: string;
    variables?: Record<string, any>;
  };
}

// Templates para emails y notificaciones
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationEvent['type'];
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Variables disponibles como {{candidateName}}
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Funciones helper
export function getJobCategoryLabel(category: JobCategory): string {
  const labels: Record<JobCategory, string> = {
    'gestion-direccion': 'Gestión y Dirección',
    'ingenieria-tecnica': 'Ingeniería y Técnica',
    'arquitectura-diseño': 'Arquitectura y Diseño',
    'operaciones-control': 'Operaciones y Control',
    'administracion-soporte': 'Administración y Soporte'
  };
  return labels[category];
}

export function getJobCategoryDescription(category: JobCategory): string {
  const descriptions: Record<JobCategory, string> = {
    'gestion-direccion': 'Liderar equipos y dirigir proyectos de construcción e infraestructura de gran escala.',
    'ingenieria-tecnica': 'Diseñar soluciones técnicas innovadoras y supervisar la implementación de proyectos.',
    'arquitectura-diseño': 'Crear espacios funcionales y estéticamente destacados que transformen el paisaje urbano.',
    'operaciones-control': 'Garantizar la calidad, seguridad y eficiencia en todas las fases del proyecto.',
    'administracion-soporte': 'Brindar soporte estratégico y administrativo para el éxito de los proyectos.'
  };
  return descriptions[category];
}

export function getJobLevelLabel(level: JobLevel): string {
  const labels: Record<JobLevel, string> = {
    'entry': 'Nivel de Entrada',
    'junior': 'Junior',
    'mid': 'Intermedio',
    'senior': 'Senior',
    'lead': 'Líder de Equipo',
    'director': 'Director'
  };
  return labels[level];
}

export function getJobTypeLabel(type: JobType): string {
  const labels: Record<JobType, string> = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Por Contrato',
    'internship': 'Prácticas'
  };
  return labels[type];
}

// Datos de ejemplo basados en bolsa-trabajo-strategy.md
export const sampleBenefits: JobBenefit[] = [
  {
    id: '1',
    category: 'compensation',
    title: 'Salario Competitivo',
    description: 'Compensación por encima del promedio del mercado',
    icon: 'DollarSign'
  },
  {
    id: '2',
    category: 'health',
    title: 'Seguro de Salud Premium',
    description: 'Cobertura completa para ti y tu familia',
    icon: 'Heart'
  },
  {
    id: '3',
    category: 'development',
    title: 'Desarrollo Profesional',
    description: 'Capacitaciones, certificaciones y plan de carrera',
    icon: 'GraduationCap'
  },
  {
    id: '4',
    category: 'time-off',
    title: 'Flexibilidad Horaria',
    description: 'Horarios flexibles y trabajo remoto híbrido',
    icon: 'Clock'
  },
  {
    id: '5',
    category: 'culture',
    title: 'Ambiente Colaborativo',
    description: 'Cultura de innovación y trabajo en equipo',
    icon: 'Users'
  },
  {
    id: '6',
    category: 'perks',
    title: 'Equipos de Última Generación',
    description: 'Herramientas BIM, software especializado y hardware top',
    icon: 'Laptop'
  }
];

export const sampleJobPostings: JobPosting[] = [
  {
    id: '1',
    title: 'Director de Proyectos Senior',
    slug: 'director-proyectos-senior',
    category: 'gestion-direccion',
    department: 'Dirección General',
    location: {
      city: 'Lima',
      region: 'Lima',
      country: 'Perú',
      remote: false,
      hybrid: true
    },
    type: 'full-time',
    level: 'director',
    status: 'active',
    remote: false,
    experience: 10,
    
    description: 'Buscamos un Director de Proyectos Senior para liderar proyectos de infraestructura de gran escala. Experiencia mínima de 10 años en gestión de proyectos de construcción.',
    
    responsibilities: [
      'Dirigir equipos multidisciplinarios de 20+ profesionales',
      'Gestionar presupuestos de $10M+ USD',
      'Asegurar cumplimiento de cronogramas y calidad',
      'Coordinar con stakeholders y autoridades',
      'Implementar metodologías PMI y Lean Construction'
    ],
    
    requirements: [
      {
        id: '1-1',
        type: 'education',
        title: 'Arquitectura o Ingeniería Civil',
        description: 'Título universitario en Arquitectura, Ingeniería Civil o afín',
        required: true,
        weight: 10
      },
      {
        id: '1-2',
        type: 'experience',
        title: '10+ años en gestión de proyectos',
        description: 'Experiencia liderando proyectos de construcción +$5M USD',
        required: true,
        weight: 15
      },
      {
        id: '1-3',
        type: 'certification',
        title: 'Certificación PMP',
        description: 'Project Management Professional (deseable)',
        required: false,
        weight: 8
      },
      {
        id: '1-4',
        type: 'skill',
        title: 'BIM Management',
        description: 'Experiencia con herramientas BIM (Revit, Navisworks)',
        required: true,
        weight: 12
      }
    ],
    
    benefits: sampleBenefits,
    niceToHave: [
      'Certificación PMP o similar',
      'MBA o especialización en gestión',
      'Experiencia internacional',
      'Conocimiento de Lean Construction',
      'Manejo avanzado de inglés'
    ],
    
    salary: {
      min: 12000,
      max: 18000,
      currency: 'PEN',
      period: 'monthly',
      negotiable: true
    },
    
    postedAt: new Date('2024-12-15'),
    deadline: new Date('2025-01-15'),
    createdAt: new Date('2024-12-15'),
    
    tags: ['gestión', 'liderazgo', 'PMP', 'BIM', 'infraestructura'],
    featured: true,
    urgent: false,
    applicantCount: 23,
    viewCount: 1542,
    
    hiringManager: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@metrica-dip.com',
      role: 'Director General'
    },
    
    seo: {
      metaTitle: 'Director de Proyectos Senior | Carreras Métrica FM',
      metaDescription: 'Únete como Director de Proyectos Senior en Métrica FM. Lidera proyectos de infraestructura de gran escala en Lima.',
      keywords: ['director proyectos', 'gestión construcción', 'PMP', 'BIM', 'infraestructura Lima']
    }
  },
  
  {
    id: '2',
    title: 'Ingeniero Civil Senior',
    slug: 'ingeniero-civil-senior',
    category: 'ingenieria-tecnica',
    department: 'Ingeniería y Técnica',
    location: {
      city: 'Lima',
      region: 'Lima',
      country: 'Perú',
      remote: false,
      hybrid: true
    },
    type: 'full-time',
    level: 'senior',
    status: 'active',
    remote: false,
    experience: 5,
    
    description: 'Buscamos Ingeniero Civil Senior especializado en estructuras para proyectos comerciales y residenciales de mediana y gran escala.',
    
    responsibilities: [
      'Diseño estructural con software especializado',
      'Supervisión de obras y control de calidad',
      'Coordinación con equipos multidisciplinarios',
      'Elaboración de planos y especificaciones técnicas',
      'Supervisión de ensayos de laboratorio'
    ],
    
    requirements: [
      {
        id: '2-1',
        type: 'education',
        title: 'Ingeniería Civil',
        description: 'Título universitario en Ingeniería Civil',
        required: true,
        weight: 10
      },
      {
        id: '2-2',
        type: 'experience',
        title: '5+ años en estructuras',
        description: 'Experiencia en diseño y supervisión estructural',
        required: true,
        weight: 12
      },
      {
        id: '2-3',
        type: 'skill',
        title: 'Software especializado',
        description: 'ETABS, SAP2000, AutoCAD, Revit',
        required: true,
        weight: 10
      }
    ],
    
    benefits: sampleBenefits,
    
    salary: {
      min: 6000,
      max: 9000,
      currency: 'PEN',
      period: 'monthly',
      negotiable: true
    },
    
    postedAt: new Date('2024-12-10'),
    deadline: new Date('2025-01-10'),
    createdAt: new Date('2024-12-10'),
    
    tags: ['ingeniería', 'estructuras', 'ETABS', 'supervisión', 'civil'],
    featured: true,
    urgent: false,
    applicantCount: 31,
    viewCount: 987,
    
    seo: {
      metaTitle: 'Ingeniero Civil Senior | Carreras Métrica FM',
      metaDescription: 'Oportunidad para Ingeniero Civil Senior especializado en estructuras. Únete a proyectos innovadores en Lima.',
      keywords: ['ingeniero civil', 'estructuras', 'ETABS', 'supervisión obras', 'Lima']
    }
  },
  
  {
    id: '3',
    title: 'Arquitecto Senior Comercial',
    slug: 'arquitecto-senior-comercial',
    category: 'arquitectura-diseño',
    department: 'Arquitectura y Diseño',
    location: {
      city: 'Lima',
      region: 'Lima',
      country: 'Perú',
      remote: false,
      hybrid: true
    },
    type: 'full-time',
    level: 'senior',
    status: 'active',
    remote: false,
    experience: 7,
    
    description: 'Buscamos Arquitecto Senior especializado en proyectos comerciales para liderar el diseño de centros comerciales, oficinas y proyectos mixtos.',
    
    responsibilities: [
      'Liderazgo en diseño arquitectónico comercial',
      'Coordinación con consultores especializados',
      'Presentaciones a clientes e inversionistas',
      'Supervisión de desarrollo de proyecto',
      'Cumplimiento de normativas municipales'
    ],
    
    requirements: [
      {
        id: '3-1',
        type: 'education',
        title: 'Arquitectura',
        description: 'Título universitario en Arquitectura',
        required: true,
        weight: 10
      },
      {
        id: '3-2',
        type: 'experience',
        title: '7+ años en arquitectura comercial',
        description: 'Experiencia en centros comerciales, oficinas o mixtos',
        required: true,
        weight: 15
      },
      {
        id: '3-3',
        type: 'skill',
        title: 'BIM y Renderizado',
        description: 'Revit, SketchUp, Lumion, V-Ray',
        required: true,
        weight: 12
      }
    ],
    
    benefits: sampleBenefits,
    
    salary: {
      min: 7000,
      max: 11000,
      currency: 'PEN',
      period: 'monthly',
      negotiable: true
    },
    
    postedAt: new Date('2024-12-08'),
    deadline: new Date('2025-01-08'),
    createdAt: new Date('2024-12-08'),
    
    tags: ['arquitectura', 'comercial', 'BIM', 'retail', 'oficinas'],
    featured: false,
    urgent: true,
    applicantCount: 18,
    viewCount: 756,
    
    seo: {
      metaTitle: 'Arquitecto Senior Comercial | Carreras Métrica FM',
      metaDescription: 'Oportunidad para Arquitecto Senior en proyectos comerciales. Diseña los centros comerciales del futuro.',
      keywords: ['arquitecto senior', 'proyectos comerciales', 'centros comerciales', 'BIM', 'retail']
    }
  }
];

// Funciones helper para datos
export function getJobPosting(id: string): JobPosting | null {
  return sampleJobPostings.find(job => job.id === id) || null;
}

export function getJobsByCategory(category: JobCategory): JobPosting[] {
  return sampleJobPostings.filter(job => job.category === category && job.status === 'active');
}

export function getFeaturedJobs(): JobPosting[] {
  return sampleJobPostings.filter(job => job.featured && job.status === 'active');
}

export function getUrgentJobs(): JobPosting[] {
  return sampleJobPostings.filter(job => job.urgent && job.status === 'active');
}

export function getCareersStats(): CareersStats {
  const activeJobs = sampleJobPostings.filter(job => job.status === 'active');
  const totalApplications = activeJobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
  
  const salaries = activeJobs
    .filter(job => job.salary)
    .map(job => (job.salary!.min + job.salary!.max) / 2);
  const averageSalary = salaries.length > 0 
    ? Math.round(salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length)
    : 0;

  const locationCounts = activeJobs.reduce((acc, job) => {
    const key = `${job.location.city}, ${job.location.region}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const benefitCounts = sampleBenefits.reduce((acc, benefit) => {
    acc[benefit.title] = activeJobs.length; // Todos los trabajos tienen todos los beneficios
    return acc;
  }, {} as Record<string, number>);

  const popularBenefits = Object.entries(benefitCounts)
    .map(([benefit, count]) => ({ benefit, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalPositions: activeJobs.length,
    totalCategories: 5,
    totalApplications,
    averageSalary,
    topLocations,
    popularBenefits
  };
}

// === FASE 5: SAMPLE DATA FOR APPLICATIONS SYSTEM ===

export const sampleApplications: JobApplication[] = [
  {
    id: 'app-001',
    jobId: '1',
    jobTitle: 'Director de Proyectos Senior',
    candidateInfo: {
      firstName: 'María',
      lastName: 'García Pérez',
      email: 'maria.garcia@email.com',
      phone: '+51 987 654 321',
      linkedin: 'linkedin.com/in/maria-garcia-projects',
      location: {
        city: 'Lima',
        country: 'Perú'
      },
      availability: {
        startDate: new Date('2025-02-01'),
        noticePeriod: 30
      },
      salaryExpectation: {
        min: 15000,
        max: 20000,
        currency: 'PEN',
        period: 'monthly'
      }
    },
    documents: [
      {
        id: 'doc-001',
        type: 'cv',
        filename: 'CV_Maria_Garcia.pdf',
        url: '/uploads/applications/app-001/cv.pdf',
        size: 1024000,
        uploadedAt: new Date('2024-12-16T10:00:00'),
        verified: true
      },
      {
        id: 'doc-002',
        type: 'cover-letter',
        filename: 'Carta_Presentacion.pdf',
        url: '/uploads/applications/app-001/cover.pdf',
        size: 512000,
        uploadedAt: new Date('2024-12-16T10:05:00'),
        verified: true
      }
    ],
    responses: [
      {
        questionId: 'q1',
        answer: 'Tengo 12 años de experiencia dirigiendo proyectos de infraestructura de gran escala, incluyendo 3 centros comerciales y 2 complejos residenciales de lujo.'
      },
      {
        questionId: 'q2',
        answer: true // ¿Tienes certificación PMP?
      }
    ],
    status: 'shortlisted',
    priority: 'high',
    source: 'website',
    submittedAt: new Date('2024-12-16T10:00:00'),
    updatedAt: new Date('2024-12-18T14:30:00'),
    score: {
      overall: 88,
      experience: 95,
      skills: 85,
      education: 90,
      cultural: 80,
      requirements: 92,
      notes: 'Candidata excepcional con experiencia sólida en proyectos similares. Certificación PMP activa.',
      scoredBy: 'Carlos Mendoza',
      scoredAt: new Date('2024-12-17T09:15:00')
    },
    interviews: [
      {
        id: 'int-001',
        type: 'video',
        scheduledAt: new Date('2024-12-20T10:00:00'),
        duration: 60,
        interviewer: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metrica-dip.com',
          role: 'Director General'
        },
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        status: 'scheduled',
        notes: 'Primera entrevista - revisar experiencia en liderazgo'
      }
    ],
    tags: ['pmp-certified', 'senior-level', 'lima-based'],
    flagged: false,
    activities: [
      {
        id: 'act-001',
        type: 'status-change',
        description: 'Aplicación enviada',
        performedBy: 'Sistema',
        performedAt: new Date('2024-12-16T10:00:00')
      },
      {
        id: 'act-002',
        type: 'status-change',
        description: 'Marcada como preseleccionada',
        performedBy: 'Carlos Mendoza',
        performedAt: new Date('2024-12-18T14:30:00')
      }
    ],
    assignedTo: {
      recruiterId: 'rec-001',
      recruiterName: 'Carlos Mendoza',
      assignedAt: new Date('2024-12-17T08:00:00')
    },
    internalNotes: [
      {
        id: 'note-001',
        note: 'Candidata muy prometedora. Experiencia directamente relevante.',
        authorId: 'rec-001',
        authorName: 'Carlos Mendoza',
        createdAt: new Date('2024-12-17T09:20:00'),
        private: false
      }
    ],
    viewCount: 5,
    lastViewedAt: new Date('2024-12-18T16:45:00'),
    timeInStage: 2
  },
  
  {
    id: 'app-002',
    jobId: '2',
    jobTitle: 'Ingeniero Civil Senior',
    candidateInfo: {
      firstName: 'José',
      lastName: 'Rodríguez Silva',
      email: 'jose.rodriguez@email.com',
      phone: '+51 987 123 456',
      linkedin: 'linkedin.com/in/jose-rodriguez-civil',
      github: 'github.com/jrodriguez-civil',
      location: {
        city: 'Lima',
        country: 'Perú'
      },
      availability: {
        startDate: new Date('2025-01-15'),
        noticePeriod: 15
      },
      salaryExpectation: {
        min: 7000,
        max: 9000,
        currency: 'PEN',
        period: 'monthly'
      }
    },
    documents: [
      {
        id: 'doc-003',
        type: 'cv',
        filename: 'CV_Jose_Rodriguez.pdf',
        url: '/uploads/applications/app-002/cv.pdf',
        size: 890000,
        uploadedAt: new Date('2024-12-15T14:00:00'),
        verified: true
      }
    ],
    responses: [
      {
        questionId: 'q1',
        answer: 'Especialista en diseño estructural con ETABS y SAP2000. 7 años de experiencia en supervisión de obras.'
      }
    ],
    status: 'reviewing',
    priority: 'normal',
    source: 'linkedin',
    submittedAt: new Date('2024-12-15T14:00:00'),
    updatedAt: new Date('2024-12-16T11:00:00'),
    score: {
      overall: 75,
      experience: 80,
      skills: 85,
      education: 75,
      cultural: 70,
      requirements: 78,
      notes: 'Buena experiencia técnica, evaluando fit cultural.',
      scoredBy: 'Ana Torres',
      scoredAt: new Date('2024-12-16T11:00:00')
    },
    interviews: [],
    tags: ['etabs', 'structures', 'linkedin'],
    flagged: false,
    activities: [
      {
        id: 'act-003',
        type: 'status-change',
        description: 'Aplicación enviada',
        performedBy: 'Sistema',
        performedAt: new Date('2024-12-15T14:00:00')
      },
      {
        id: 'act-004',
        type: 'score-updated',
        description: 'Puntuación inicial asignada',
        performedBy: 'Ana Torres',
        performedAt: new Date('2024-12-16T11:00:00')
      }
    ],
    assignedTo: {
      recruiterId: 'rec-002',
      recruiterName: 'Ana Torres',
      assignedAt: new Date('2024-12-16T08:30:00')
    },
    internalNotes: [
      {
        id: 'note-002',
        note: 'Revisar referencias laborales antes de avanzar.',
        authorId: 'rec-002',
        authorName: 'Ana Torres',
        createdAt: new Date('2024-12-16T11:30:00'),
        private: true
      }
    ],
    viewCount: 3,
    lastViewedAt: new Date('2024-12-16T15:20:00'),
    timeInStage: 3
  },
  
  {
    id: 'app-003',
    jobId: '3',
    jobTitle: 'Arquitecto Senior Comercial',
    candidateInfo: {
      firstName: 'Carmen',
      lastName: 'López Vega',
      email: 'carmen.lopez@email.com',
      phone: '+51 987 789 123',
      linkedin: 'linkedin.com/in/carmen-lopez-architect',
      portfolio: 'https://carmenlopez.portfolio.com',
      location: {
        city: 'Arequipa',
        country: 'Perú'
      },
      availability: {
        startDate: new Date('2025-03-01'),
        noticePeriod: 60
      },
      salaryExpectation: {
        min: 8000,
        max: 12000,
        currency: 'PEN',
        period: 'monthly'
      }
    },
    documents: [
      {
        id: 'doc-004',
        type: 'cv',
        filename: 'CV_Carmen_Lopez.pdf',
        url: '/uploads/applications/app-003/cv.pdf',
        size: 1200000,
        uploadedAt: new Date('2024-12-14T16:30:00'),
        verified: true
      },
      {
        id: 'doc-005',
        type: 'portfolio',
        filename: 'Portfolio_Proyectos.pdf',
        url: '/uploads/applications/app-003/portfolio.pdf',
        size: 5120000,
        uploadedAt: new Date('2024-12-14T16:35:00'),
        verified: true
      }
    ],
    responses: [
      {
        questionId: 'q1',
        answer: '8 años diseñando centros comerciales y oficinas. Portfolio con 15 proyectos entregados.'
      },
      {
        questionId: 'q2',
        answer: true // ¿Manejas BIM?
      }
    ],
    status: 'interview',
    priority: 'urgent',
    source: 'referral',
    submittedAt: new Date('2024-12-14T16:30:00'),
    updatedAt: new Date('2024-12-19T10:15:00'),
    score: {
      overall: 82,
      experience: 85,
      skills: 90,
      education: 80,
      cultural: 78,
      requirements: 85,
      notes: 'Excelente portfolio. Experiencia específica en retail.',
      scoredBy: 'Luis Hernández',
      scoredAt: new Date('2024-12-18T14:45:00')
    },
    interviews: [
      {
        id: 'int-002',
        type: 'in-person',
        scheduledAt: new Date('2024-12-21T14:00:00'),
        duration: 90,
        interviewer: {
          name: 'Luis Hernández',
          email: 'luis.hernandez@metrica-dip.com',
          role: 'Director de Arquitectura'
        },
        location: 'Oficina Lima - Sala de Juntas 2',
        status: 'scheduled',
        notes: 'Entrevista técnica + presentación de portfolio'
      }
    ],
    tags: ['portfolio-strong', 'retail-experience', 'arequipa'],
    flagged: false,
    activities: [
      {
        id: 'act-005',
        type: 'status-change',
        description: 'Aplicación enviada',
        performedBy: 'Sistema',
        performedAt: new Date('2024-12-14T16:30:00')
      },
      {
        id: 'act-006',
        type: 'interview-scheduled',
        description: 'Entrevista presencial programada',
        performedBy: 'Luis Hernández',
        performedAt: new Date('2024-12-19T10:15:00')
      }
    ],
    assignedTo: {
      recruiterId: 'rec-003',
      recruiterName: 'Luis Hernández',
      assignedAt: new Date('2024-12-15T09:00:00')
    },
    internalNotes: [
      {
        id: 'note-003',
        note: 'Candidata referida por cliente. Portfolio impresionante.',
        authorId: 'rec-003',
        authorName: 'Luis Hernández',
        createdAt: new Date('2024-12-18T15:00:00'),
        private: false
      }
    ],
    viewCount: 8,
    lastViewedAt: new Date('2024-12-19T11:30:00'),
    timeInStage: 1
  }
];

export const sampleRecruiters: RecruiterProfile[] = [
  {
    id: 'rec-001',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@metrica-dip.com',
    role: 'hiring-manager',
    department: 'Dirección General',
    permissions: {
      canViewAllApplications: true,
      canUpdateApplicationStatus: true,
      canScheduleInterviews: true,
      canAccessAnalytics: true,
      canManageJobs: true,
      canExportData: true
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      types: {
        newApplication: true,
        statusChange: true,
        interviewReminder: true,
        deadlineAlert: true,
        systemUpdate: false
      }
    },
    timezone: 'America/Lima',
    lastActive: new Date('2024-12-19T14:30:00'),
    createdAt: new Date('2024-01-15T08:00:00')
  },
  {
    id: 'rec-002',
    name: 'Ana Torres',
    email: 'ana.torres@metrica-dip.com',
    role: 'recruiter',
    department: 'Recursos Humanos',
    permissions: {
      canViewAllApplications: true,
      canUpdateApplicationStatus: true,
      canScheduleInterviews: true,
      canAccessAnalytics: false,
      canManageJobs: false,
      canExportData: false
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: true,
      types: {
        newApplication: true,
        statusChange: true,
        interviewReminder: true,
        deadlineAlert: true,
        systemUpdate: true
      }
    },
    timezone: 'America/Lima',
    lastActive: new Date('2024-12-19T16:45:00'),
    createdAt: new Date('2024-02-01T08:00:00')
  }
];

// Helper functions for sample data
export function getSampleApplications(): JobApplication[] {
  return sampleApplications;
}

export function getSampleApplicationsByJob(jobId: string): JobApplication[] {
  return sampleApplications.filter(app => app.jobId === jobId);
}

export function getSampleApplicationsByStatus(status: ApplicationStatus): JobApplication[] {
  return sampleApplications.filter(app => app.status === status);
}