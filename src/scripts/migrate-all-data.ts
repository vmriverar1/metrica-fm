/**
 * Script completo de migración de datos a Firestore
 * Ejecuta la migración de Newsletter, Portfolio y Careers usando credenciales de servicio
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps, FirebaseApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
function initializeFirebaseAdmin(): Firestore {
  try {
    // Leer las credenciales de servicio
    const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    // Inicializar la app si no existe
    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('🔥 Firebase Admin initialized successfully');
    } else {
      app = getApps()[0];
      console.log('🔥 Using existing Firebase Admin app');
    }

    return getFirestore(app);
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Función para leer datos JSON
function readJSONData(filePath: string): any {
  try {
    const fullPath = join(process.cwd(), filePath);
    const data = readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error);
    return null;
  }
}

// Migración de Newsletter
async function migrateNewsletterData(db: Firestore): Promise<void> {
  console.log('\n📰 Starting Newsletter migration...');

  const batch = db.batch();
  let count = 0;

  // Migrar categorías de newsletter
  const categoriesData = {
    categories: [
      {
        id: 'industria-tendencias',
        name: 'Industria y Tendencias',
        description: 'Análisis del sector construcción e infraestructura en el Perú',
        color: '#3B82F6',
        slug: 'industria-tendencias',
        featured: true,
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'casos-estudio',
        name: 'Casos de Estudio',
        description: 'Proyectos exitosos y lecciones aprendidas',
        color: '#10B981',
        slug: 'casos-estudio',
        featured: true,
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'guias-tecnicas',
        name: 'Guías Técnicas',
        description: 'Conocimiento especializado y mejores prácticas',
        color: '#8B5CF6',
        slug: 'guias-tecnicas',
        featured: false,
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'liderazgo-vision',
        name: 'Liderazgo y Visión',
        description: 'Perspectivas del liderazgo en la industria',
        color: '#F59E0B',
        slug: 'liderazgo-vision',
        featured: false,
        order: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
  };

  // Agregar categorías al batch
  for (const category of categoriesData.categories) {
    const docRef = db.collection('blog_categories').doc(category.id);
    batch.set(docRef, category);
    count++;
  }

  // Migrar artículos de ejemplo
  const articlesData = {
    articles: [
      {
        id: 'futuro-construccion-peru-2024',
        title: 'El Futuro de la Construcción en el Perú 2024',
        excerpt: 'Análisis de las tendencias tecnológicas que están transformando la industria de la construcción en el Perú.',
        content: {
          body: 'La industria de la construcción en el Perú está experimentando una transformación digital sin precedentes. Las nuevas tecnologías como BIM, drones, y sistemas de gestión inteligente están revolucionando la forma en que diseñamos y construimos proyectos de infraestructura.',
          introduction: 'El sector construcción peruano se encuentra en un punto de inflexión tecnológico.',
          conclusion: 'La adopción de estas tecnologías será clave para mantener la competitividad en el mercado global.'
        },
        author: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metricadip.com',
          bio: 'Ingeniero Civil especializado en gestión de proyectos de infraestructura',
          avatar: '/images/authors/carlos-mendoza.jpg'
        },
        category: 'industria-tendencias',
        tags: ['construcción', 'tecnología', 'perú', 'tendencias', 'BIM'],
        featured_image: '/images/blog/futuro-construccion-peru-2024.jpg',
        status: 'published',
        featured: true,
        reading_time: 8,
        views: 1250,
        published_at: new Date('2024-01-15'),
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-15'),
        slug: 'futuro-construccion-peru-2024',
        seo: {
          title: 'El Futuro de la Construcción en el Perú 2024 | Métrica Blog',
          description: 'Descubre las tendencias tecnológicas que están transformando la construcción en el Perú. BIM, drones y sistemas inteligentes.',
          keywords: ['construcción perú', 'tecnología construcción', 'BIM', 'tendencias 2024']
        }
      },
      {
        id: 'proyecto-hospital-nacional-caso-estudio',
        title: 'Caso de Estudio: Hospital Nacional - Gestión de Complejidad',
        excerpt: 'Análisis detallado de la gestión de un proyecto hospitalario de alta complejidad técnica y administrativa.',
        content: {
          body: 'La construcción del Hospital Nacional representó un desafío único en términos de coordinación multidisciplinaria, cumplimiento normativo y gestión de stakeholders. Este caso de estudio examina las estrategias implementadas para garantizar el éxito del proyecto.',
          introduction: 'Los proyectos hospitalarios requieren un nivel de especialización y coordinación excepcional.',
          conclusion: 'La metodología aplicada puede replicarse en otros proyectos de infraestructura crítica.'
        },
        author: {
          name: 'Ana Patricia Flores',
          email: 'ana.flores@metricadip.com',
          bio: 'Arquitecta especializada en proyectos de salud e infraestructura pública',
          avatar: '/images/authors/ana-flores.jpg'
        },
        category: 'casos-estudio',
        tags: ['hospital', 'infraestructura', 'gestión', 'caso estudio', 'salud'],
        featured_image: '/images/blog/hospital-nacional-caso-estudio.jpg',
        status: 'published',
        featured: true,
        reading_time: 12,
        views: 890,
        published_at: new Date('2024-02-01'),
        created_at: new Date('2024-01-25'),
        updated_at: new Date('2024-02-01'),
        slug: 'proyecto-hospital-nacional-caso-estudio',
        seo: {
          title: 'Caso de Estudio: Hospital Nacional - Gestión de Complejidad | Métrica',
          description: 'Análisis detallado de la gestión de un proyecto hospitalario complejo. Estrategias y metodologías aplicadas.',
          keywords: ['caso estudio hospital', 'gestión proyectos', 'infraestructura salud', 'métrica dip']
        }
      },
      {
        id: 'guia-bim-implementacion-proyectos',
        title: 'Guía Completa: Implementación de BIM en Proyectos de Construcción',
        excerpt: 'Manual práctico para la implementación exitosa de metodologías BIM en proyectos de construcción e infraestructura.',
        content: {
          body: 'Building Information Modeling (BIM) ha revolucionado la industria de la construcción. Esta guía proporciona un roadmap completo para implementar BIM en organizaciones de construcción, desde la planificación inicial hasta la ejecución y mantenimiento.',
          introduction: 'BIM es más que una tecnología: es una metodología que transforma procesos.',
          conclusion: 'La implementación gradual y estructurada de BIM genera ROI medible en 12-18 meses.'
        },
        author: {
          name: 'Roberto Silva',
          email: 'roberto.silva@metricadip.com',
          bio: 'BIM Manager con 15 años de experiencia en proyectos de gran escala',
          avatar: '/images/authors/roberto-silva.jpg'
        },
        category: 'guias-tecnicas',
        tags: ['BIM', 'metodología', 'implementación', 'tecnología', 'guía'],
        featured_image: '/images/blog/guia-bim-implementacion.jpg',
        status: 'published',
        featured: false,
        reading_time: 15,
        views: 2100,
        published_at: new Date('2024-02-10'),
        created_at: new Date('2024-02-05'),
        updated_at: new Date('2024-02-10'),
        slug: 'guia-bim-implementacion-proyectos',
        seo: {
          title: 'Guía Completa: Implementación de BIM en Proyectos | Métrica Blog',
          description: 'Manual práctico para implementar BIM exitosamente. Roadmap completo desde planificación hasta ejecución.',
          keywords: ['BIM implementación', 'metodología BIM', 'construcción digital', 'guía técnica']
        }
      }
    ]
  };

  // Agregar artículos al batch
  for (const article of articlesData.articles) {
    const docRef = db.collection('blog_articles').doc(article.id);
    batch.set(docRef, article);
    count++;
  }

  // Ejecutar el batch
  await batch.commit();
  console.log(`✅ Newsletter migrated: ${count} documents`);
}

// Migración de Portfolio
async function migratePortfolioData(db: Firestore): Promise<void> {
  console.log('\n🏗️ Starting Portfolio migration...');

  const batch = db.batch();
  let count = 0;

  // Categorías de portfolio
  const categoriesData = [
    {
      id: 'residential',
      name: 'Residencial',
      description: 'Proyectos habitacionales y complejos residenciales',
      slug: 'residencial',
      featured: true,
      order: 1,
      metrics: {
        total_projects: 12,
        total_investment: 45000000,
        total_area: 85000
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'commercial',
      name: 'Comercial',
      description: 'Centros comerciales, oficinas y espacios comerciales',
      slug: 'comercial',
      featured: true,
      order: 2,
      metrics: {
        total_projects: 8,
        total_investment: 62000000,
        total_area: 45000
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Plantas industriales, almacenes y logística',
      slug: 'industrial',
      featured: true,
      order: 3,
      metrics: {
        total_projects: 15,
        total_investment: 78000000,
        total_area: 120000
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'infrastructure',
      name: 'Infraestructura',
      description: 'Proyectos de infraestructura pública y vial',
      slug: 'infraestructura',
      featured: true,
      order: 4,
      metrics: {
        total_projects: 6,
        total_investment: 125000000,
        total_area: 200000
      },
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Agregar categorías al batch
  for (const category of categoriesData) {
    const docRef = db.collection('portfolio_categories').doc(category.id);
    batch.set(docRef, category);
    count++;
  }

  // Proyectos de ejemplo
  const projectsData = [
    {
      id: 'residencial-torres-del-sol',
      title: 'Torres del Sol - Complejo Residencial',
      description: 'Complejo residencial de lujo con 280 departamentos distribuidos en 4 torres de 18 pisos cada una.',
      short_description: 'Complejo residencial premium con amenidades de clase mundial en San Isidro.',
      category_id: 'residential',
      status: 'completed',
      featured: true,
      location: {
        city: 'Lima',
        district: 'San Isidro',
        address: 'Av. Javier Prado Este 1234',
        coordinates: {
          lat: -12.1,
          lng: -77.03
        }
      },
      timeline: {
        start_date: new Date('2022-01-15'),
        end_date: new Date('2023-11-30'),
        duration_months: 23
      },
      metrics: {
        total_area: 15000,
        built_area: 12500,
        investment_amount: 18500000,
        units: 280
      },
      details: {
        client: 'Inmobiliaria Premium SAC',
        architect: 'Estudio Arquitectónico Moderno',
        contractor: 'Métrica FM',
        investment: 18500000,
        currency: 'USD'
      },
      gallery: {
        main_image: '/images/portfolio/torres-del-sol-main.jpg',
        images: [
          '/images/portfolio/torres-del-sol-exterior.jpg',
          '/images/portfolio/torres-del-sol-lobby.jpg',
          '/images/portfolio/torres-del-sol-amenities.jpg',
          '/images/portfolio/torres-del-sol-unit.jpg'
        ],
        videos: ['/videos/portfolio/torres-del-sol-tour.mp4']
      },
      slug: 'residencial-torres-del-sol',
      created_at: new Date('2023-12-01'),
      updated_at: new Date('2023-12-01')
    },
    {
      id: 'comercial-centro-empresarial-metropolitan',
      title: 'Centro Empresarial Metropolitan',
      description: 'Moderno centro empresarial con oficinas premium, espacios de coworking y amenidades corporativas.',
      short_description: 'Centro empresarial de última generación en el distrito financiero de Lima.',
      category_id: 'commercial',
      status: 'completed',
      featured: true,
      location: {
        city: 'Lima',
        district: 'San Isidro',
        address: 'Av. El Derby 254',
        coordinates: {
          lat: -12.095,
          lng: -77.025
        }
      },
      timeline: {
        start_date: new Date('2021-08-01'),
        end_date: new Date('2023-06-15'),
        duration_months: 22
      },
      metrics: {
        total_area: 8500,
        built_area: 7200,
        investment_amount: 12800000,
        office_units: 45
      },
      details: {
        client: 'Grupo Empresarial Del Pacifico',
        architect: 'Torres & Asociados',
        contractor: 'Métrica FM',
        investment: 12800000,
        currency: 'USD'
      },
      gallery: {
        main_image: '/images/portfolio/metropolitan-main.jpg',
        images: [
          '/images/portfolio/metropolitan-facade.jpg',
          '/images/portfolio/metropolitan-lobby.jpg',
          '/images/portfolio/metropolitan-coworking.jpg',
          '/images/portfolio/metropolitan-office.jpg'
        ],
        videos: ['/videos/portfolio/metropolitan-walkthrough.mp4']
      },
      slug: 'comercial-centro-empresarial-metropolitan',
      created_at: new Date('2023-06-20'),
      updated_at: new Date('2023-06-20')
    },
    {
      id: 'industrial-planta-logistica-callao',
      title: 'Planta Logística Callao',
      description: 'Centro de distribución y almacenaje de última generación con sistemas automatizados.',
      short_description: 'Moderna planta logística con tecnología de punta para operaciones de gran escala.',
      category_id: 'industrial',
      status: 'in_progress',
      featured: false,
      location: {
        city: 'Callao',
        district: 'Callao',
        address: 'Av. Industrial 1800',
        coordinates: {
          lat: -12.05,
          lng: -77.15
        }
      },
      timeline: {
        start_date: new Date('2023-09-01'),
        end_date: new Date('2024-08-30'),
        duration_months: 12
      },
      metrics: {
        total_area: 25000,
        built_area: 18000,
        investment_amount: 8500000,
        warehouse_capacity: 50000
      },
      details: {
        client: 'Corporación Logística del Perú',
        architect: 'Industrial Design Studio',
        contractor: 'Métrica FM',
        investment: 8500000,
        currency: 'USD'
      },
      gallery: {
        main_image: '/images/portfolio/callao-logistics-main.jpg',
        images: [
          '/images/portfolio/callao-logistics-construction.jpg',
          '/images/portfolio/callao-logistics-plans.jpg'
        ],
        videos: []
      },
      slug: 'industrial-planta-logistica-callao',
      created_at: new Date('2023-09-15'),
      updated_at: new Date('2024-01-10')
    }
  ];

  // Agregar proyectos al batch
  for (const project of projectsData) {
    const docRef = db.collection('portfolio_projects').doc(project.id);
    batch.set(docRef, project);
    count++;
  }

  // Ejecutar el batch
  await batch.commit();
  console.log(`✅ Portfolio migrated: ${count} documents`);
}

// Migración de Careers
async function migrateCareersData(db: Firestore): Promise<void> {
  console.log('\n💼 Starting Careers migration...');

  const batch = db.batch();
  let count = 0;

  // Departamentos de careers
  const departmentsData = [
    {
      id: 'gestion-direccion',
      name: 'Gestión y Dirección',
      description: 'Liderazgo de proyectos y gestión estratégica',
      slug: 'gestion-direccion',
      featured: true,
      order: 1,
      career_path: [
        'Junior Project Manager',
        'Project Manager',
        'Senior Project Manager',
        'Director de Proyectos'
      ],
      key_skills: [
        'Gestión de proyectos',
        'Liderazgo de equipos',
        'Planificación estratégica',
        'Gestión de riesgos'
      ],
      active_positions: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'ingenieria-tecnica',
      name: 'Ingeniería Técnica',
      description: 'Desarrollo técnico y supervisión de obra',
      slug: 'ingenieria-tecnica',
      featured: true,
      order: 2,
      career_path: [
        'Ingeniero Junior',
        'Ingeniero de Campo',
        'Ingeniero Senior',
        'Jefe de Ingeniería'
      ],
      key_skills: [
        'Supervisión técnica',
        'Control de calidad',
        'Análisis estructural',
        'Normativa técnica'
      ],
      active_positions: 5,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'arquitectura-diseño',
      name: 'Arquitectura y Diseño',
      description: 'Diseño arquitectónico y desarrollo de proyectos',
      slug: 'arquitectura-diseño',
      featured: true,
      order: 3,
      career_path: [
        'Arquitecto Junior',
        'Arquitecto Proyectista',
        'Arquitecto Senior',
        'Director de Diseño'
      ],
      key_skills: [
        'Diseño arquitectónico',
        'Software CAD/BIM',
        'Gestión de espacios',
        'Normativa urbana'
      ],
      active_positions: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'operaciones-control',
      name: 'Operaciones y Control',
      description: 'Control de obra y gestión operativa',
      slug: 'operaciones-control',
      featured: false,
      order: 4,
      career_path: [
        'Asistente de Obra',
        'Supervisor de Obra',
        'Jefe de Obra',
        'Gerente de Operaciones'
      ],
      key_skills: [
        'Control de avance',
        'Gestión de recursos',
        'Seguridad industrial',
        'Coordinación logística'
      ],
      active_positions: 4,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'administracion-finanzas',
      name: 'Administración y Finanzas',
      description: 'Gestión administrativa y financiera',
      slug: 'administracion-finanzas',
      featured: false,
      order: 5,
      career_path: [
        'Asistente Administrativo',
        'Analista Financiero',
        'Jefe de Administración',
        'Gerente Financiero'
      ],
      key_skills: [
        'Análisis financiero',
        'Control presupuestal',
        'Gestión administrativa',
        'Reporting ejecutivo'
      ],
      active_positions: 2,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Agregar departamentos al batch
  for (const department of departmentsData) {
    const docRef = db.collection('careers_departments').doc(department.id);
    batch.set(docRef, department);
    count++;
  }

  // Posiciones de trabajo de ejemplo
  const positionsData = [
    {
      id: 'project-manager-senior-lima',
      title: 'Project Manager Senior - Proyectos de Construcción',
      short_description: 'Liderar proyectos de construcción de gran escala con equipos multidisciplinarios.',
      description: 'Buscamos un Project Manager Senior para liderar proyectos de construcción e infraestructura de alta complejidad. El candidato será responsable de la gestión integral del proyecto desde la planificación hasta la entrega.',
      department_id: 'gestion-direccion',
      employment_type: 'full-time',
      experience_level: 'senior',
      location: {
        city: 'Lima',
        district: 'San Isidro',
        remote: false,
        hybrid: true
      },
      salary: {
        min: 8000,
        max: 12000,
        currency: 'PEN',
        period: 'monthly'
      },
      requirements: {
        essential: [
          'Ingeniería Civil o Arquitectura',
          '8+ años en gestión de proyectos',
          'Experiencia en proyectos >$5M USD',
          'Certificación PMP deseable',
          'Dominio de inglés avanzado'
        ],
        desirable: [
          'MBA o especialización en gestión',
          'Experiencia internacional',
          'Conocimiento en metodologías ágiles'
        ]
      },
      responsibilities: [
        'Liderar equipos multidisciplinarios de 15-30 personas',
        'Gestionar presupuestos de $5M-$20M USD',
        'Coordinar con stakeholders y clientes',
        'Asegurar cumplimiento de cronogramas y calidad',
        'Implementar mejores prácticas de gestión'
      ],
      benefits: [
        'Seguro de salud premium',
        'Bonos por performance',
        'Capacitación internacional',
        'Horario flexible',
        'Días libres adicionales'
      ],
      status: 'active',
      featured: true,
      urgent: false,
      posted_date: new Date('2024-01-15'),
      application_deadline: new Date('2024-02-15'),
      slug: 'project-manager-senior-lima',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 'ingeniero-civil-estructural',
      title: 'Ingeniero Civil Estructural',
      short_description: 'Diseño y análisis estructural para proyectos de construcción e infraestructura.',
      description: 'Oportunidad para ingeniero civil especializado en estructuras para participar en proyectos desafiantes de construcción. Responsable del diseño, análisis y supervisión de sistemas estructurales.',
      department_id: 'ingenieria-tecnica',
      employment_type: 'full-time',
      experience_level: 'mid-level',
      location: {
        city: 'Lima',
        district: 'Miraflores',
        remote: false,
        hybrid: false
      },
      salary: {
        min: 5500,
        max: 7500,
        currency: 'PEN',
        period: 'monthly'
      },
      requirements: {
        essential: [
          'Ingeniería Civil colegiado',
          '4-7 años de experiencia',
          'Especialización en estructuras',
          'Software: SAP2000, ETABS, AutoCAD',
          'Conocimiento normativa peruana'
        ],
        desirable: [
          'Experiencia en edificaciones altas',
          'Conocimiento BIM (Revit)',
          'Certificaciones especializadas'
        ]
      },
      responsibilities: [
        'Diseño y cálculo de elementos estructurales',
        'Supervisión técnica en obra',
        'Revisión de planos y especificaciones',
        'Coordinación con equipo de diseño',
        'Verificación de cumplimiento normativo'
      ],
      benefits: [
        'Seguro de salud',
        'Capacitación técnica continua',
        'Bonos por objetivos',
        'Transporte al proyecto'
      ],
      status: 'active',
      featured: false,
      urgent: true,
      posted_date: new Date('2024-01-20'),
      application_deadline: new Date('2024-02-20'),
      slug: 'ingeniero-civil-estructural',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20')
    },
    {
      id: 'arquitecto-senior-diseño',
      title: 'Arquitecto Senior - Diseño y Desarrollo',
      short_description: 'Liderar el diseño arquitectónico de proyectos residenciales y comerciales.',
      description: 'Buscamos arquitecto senior para liderar el desarrollo de proyectos arquitectónicos innovadores. Responsable del concepto, diseño y coordinación técnica de proyectos de mediana y gran escala.',
      department_id: 'arquitectura-diseño',
      employment_type: 'full-time',
      experience_level: 'senior',
      location: {
        city: 'Lima',
        district: 'San Isidro',
        remote: true,
        hybrid: true
      },
      salary: {
        min: 7000,
        max: 10000,
        currency: 'PEN',
        period: 'monthly'
      },
      requirements: {
        essential: [
          'Arquitectura colegiado',
          '6+ años de experiencia',
          'Portfolio de proyectos realizados',
          'AutoCAD, Revit, SketchUp avanzado',
          'Experiencia en equipos de diseño'
        ],
        desirable: [
          'Especialización en sostenibilidad',
          'Experiencia internacional',
          'Render y visualización 3D',
          'Certificación LEED'
        ]
      },
      responsibilities: [
        'Conceptualización y diseño arquitectónico',
        'Coordinación con especialidades técnicas',
        'Desarrollo de documentación técnica',
        'Supervisión de equipo de diseño',
        'Presentación a clientes e inversionistas'
      ],
      benefits: [
        'Trabajo remoto parcial',
        'Seguro de salud premium',
        'Capacitación en software',
        'Participación en conferencias',
        'Bonos por innovación'
      ],
      status: 'active',
      featured: true,
      urgent: false,
      posted_date: new Date('2024-01-18'),
      application_deadline: new Date('2024-02-28'),
      slug: 'arquitecto-senior-diseño',
      created_at: new Date('2024-01-18'),
      updated_at: new Date('2024-01-18')
    }
  ];

  // Agregar posiciones al batch
  for (const position of positionsData) {
    const docRef = db.collection('careers_positions').doc(position.id);
    batch.set(docRef, position);
    count++;
  }

  // Ejecutar el batch
  await batch.commit();
  console.log(`✅ Careers migrated: ${count} documents`);
}

// Función principal
async function main() {
  try {
    console.log('🚀 Starting complete data migration to Firestore...\n');

    // Inicializar Firebase Admin
    const db = initializeFirebaseAdmin();

    // Ejecutar migraciones
    await migrateNewsletterData(db);
    await migratePortfolioData(db);
    await migrateCareersData(db);

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Newsletter: Categories, Articles');
    console.log('- Portfolio: Categories, Projects');
    console.log('- Careers: Departments, Positions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

export { main as migrateAllData };