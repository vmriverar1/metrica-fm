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

export interface JobApplication {
  id: string;
  jobId: string;
  candidateInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedin?: string;
    website?: string;
  };
  documents: {
    cv: File | string;
    coverLetter?: File | string;
    portfolio?: File | string;
  };
  responses: {
    questionId: string;
    answer: string;
  }[];
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  submittedAt: Date;
  source: string; // 'website', 'linkedin', 'referral', etc.
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
      metaTitle: 'Director de Proyectos Senior | Carreras Métrica DIP',
      metaDescription: 'Únete como Director de Proyectos Senior en Métrica DIP. Lidera proyectos de infraestructura de gran escala en Lima.',
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
      metaTitle: 'Ingeniero Civil Senior | Carreras Métrica DIP',
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
      metaTitle: 'Arquitecto Senior Comercial | Carreras Métrica DIP',
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