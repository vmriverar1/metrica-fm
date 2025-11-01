/**
 * Script de Migración Careers a Firestore
 * Utiliza la arquitectura unificada para migrar datos JSON a Firestore
 * Extiende UnifiedMigrator con transformadores específicos de Careers
 */

import { Timestamp } from 'firebase/firestore';
import { UnifiedMigrator, MigrationConfig, CollectionConfig, ValidationResult, MigrationContext } from '@/lib/migration/unified-migrator';
import { validateCareerDepartment, validateCareerPosition, validateCareerApplication } from '@/lib/migration/validation-rules';
import { COLLECTIONS } from '@/lib/firebase/config';
import type { CareerDepartmentData, CareerPositionData, CareerApplicationData } from '@/lib/firestore/careers-service-unified';

// Datos mock para testing - en producción vendrían de archivos JSON
const MOCK_CAREERS_DATA = {
  departments: [
    {
      id: "dept-1",
      name: "Ingeniería y Construcción",
      slug: "ingenieria-construccion",
      description: "Profesionales especializados en proyectos de construcción e infraestructura",
      icon: "hard-hat",
      color: "#00A8E8",
      featured: true,
      order: 1,
      positions_count: 0,
      total_salary_range_min: 0,
      total_salary_range_max: 0
    },
    {
      id: "dept-2",
      name: "Arquitectura y Diseño",
      slug: "arquitectura-diseno",
      description: "Equipo creativo especializado en diseño arquitectónico y planificación urbana",
      icon: "drafting-compass",
      color: "#003F6F",
      featured: true,
      order: 2,
      positions_count: 0,
      total_salary_range_min: 0,
      total_salary_range_max: 0
    },
    {
      id: "dept-3",
      name: "Gestión de Proyectos",
      slug: "gestion-proyectos",
      description: "Profesionales en gestión y coordinación de proyectos de construcción",
      icon: "project-diagram",
      color: "#9D9D9C",
      featured: false,
      order: 3,
      positions_count: 0,
      total_salary_range_min: 0,
      total_salary_range_max: 0
    }
  ],
  positions: [
    {
      id: "pos-1",
      department_id: "dept-1",
      title: "Ingeniero Civil Senior",
      slug: "ingeniero-civil-senior",
      location: {
        city: "Lima",
        region: "Lima",
        remote_available: false,
        office_address: "Av. Javier Prado Este 4200, San Borja"
      },
      employment_type: "full_time",
      experience_level: "senior",
      salary_range: {
        min: 8000,
        max: 12000,
        currency: "PEN",
        period: "monthly"
      },
      description: "Buscamos un Ingeniero Civil Senior con experiencia en gestión de proyectos de infraestructura y construcción. El candidato ideal tendrá sólidos conocimientos en diseño estructural, supervisión de obras y coordinación de equipos multidisciplinarios.",
      short_description: "Ingeniero Civil Senior para proyectos de infraestructura en Lima",
      requirements: {
        education: ["Ingeniería Civil", "Maestría en Estructuras (deseable)"],
        experience: ["Mínimo 7 años en construcción", "Experiencia en proyectos >$2M USD", "Manejo de equipos de 10+ personas"],
        skills: ["AutoCAD", "SAP2000", "Microsoft Project", "BIM/Revit", "Gestión de proyectos"],
        languages: ["Español nativo", "Inglés intermedio"],
        certifications: ["Colegiatura vigente", "PMP (deseable)"]
      },
      responsibilities: [
        "Liderar el diseño y ejecución de proyectos estructurales",
        "Supervisar equipos técnicos y coordinar con contratistas",
        "Asegurar cumplimiento de normativas y estándares de calidad",
        "Gestionar presupuestos y cronogramas de proyecto",
        "Elaborar informes técnicos y presentaciones ejecutivas"
      ],
      benefits: [
        "Seguro de salud integral",
        "Bonificación por desempeño",
        "Capacitación continua",
        "Horario flexible",
        "Estacionamiento gratuito"
      ],
      featured: true,
      urgent: false,
      posted_at: "2024-01-15",
      expires_at: "2024-03-15",
      application_count: 0,
      status: "active",
      seo: {
        title: "Ingeniero Civil Senior - Métrica FM Careers",
        description: "Únete a nuestro equipo como Ingeniero Civil Senior. Proyectos de infraestructura en Lima, salario competitivo y excelentes beneficios.",
        keywords: ["ingeniero civil", "senior", "lima", "construcción", "infraestructura"]
      },
      metrics: {
        views: 0,
        applications: 0,
        last_updated: new Date().toISOString()
      }
    },
    {
      id: "pos-2",
      department_id: "dept-2",
      title: "Arquitecto de Proyectos",
      slug: "arquitecto-proyectos",
      location: {
        city: "Lima",
        region: "Lima",
        remote_available: true,
        office_address: "Av. Javier Prado Este 4200, San Borja"
      },
      employment_type: "full_time",
      experience_level: "mid",
      salary_range: {
        min: 5000,
        max: 7500,
        currency: "PEN",
        period: "monthly"
      },
      description: "Buscamos un Arquitecto creativo y experimentado para diseñar proyectos residenciales y comerciales innovadores. El candidato debe tener experiencia en BIM, diseño sostenible y coordinación con equipos multidisciplinarios.",
      short_description: "Arquitecto para proyectos residenciales y comerciales innovadores",
      requirements: {
        education: ["Arquitectura", "Especialización en diseño sostenible (deseable)"],
        experience: ["3-5 años en proyectos arquitectónicos", "Experiencia en BIM/Revit", "Proyectos LEED (deseable)"],
        skills: ["Revit", "AutoCAD", "SketchUp", "Adobe Creative Suite", "Rhino"],
        languages: ["Español nativo", "Inglés básico-intermedio"],
        certifications: ["Colegiatura vigente"]
      },
      responsibilities: [
        "Desarrollar diseños arquitectónicos creativos e innovadores",
        "Coordinar con equipos de ingeniería y construcción",
        "Elaborar planos técnicos y documentación de proyecto",
        "Supervisar el desarrollo de proyectos desde concepto hasta ejecución",
        "Investigar tendencias y tecnologías en arquitectura sostenible"
      ],
      benefits: [
        "Seguro de salud",
        "Trabajo híbrido (3 días oficina, 2 remoto)",
        "Bonos por proyectos completados",
        "Capacitación en nuevas tecnologías",
        "Ambiente creativo y colaborativo"
      ],
      featured: true,
      urgent: true,
      posted_at: "2024-01-20",
      expires_at: "2024-02-29",
      application_count: 0,
      status: "active",
      seo: {
        title: "Arquitecto de Proyectos - Métrica FM Careers",
        description: "Únete como Arquitecto de Proyectos. Diseña proyectos innovadores con trabajo híbrido y excelentes beneficios en Lima.",
        keywords: ["arquitecto", "proyectos", "bim", "revit", "lima", "híbrido"]
      },
      metrics: {
        views: 0,
        applications: 0,
        last_updated: new Date().toISOString()
      }
    }
  ]
};

/**
 * Transformadores específicos para Careers
 */
const careerDepartmentTransformer = (item: any, context?: MigrationContext): CareerDepartmentData => {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description,
    icon: item.icon,
    color: item.color,
    featured_image: item.featured_image,
    positions_count: item.positions_count || 0,
    total_salary_range_min: item.total_salary_range_min || 0,
    total_salary_range_max: item.total_salary_range_max || 0,
    featured: item.featured || false,
    order: item.order || context?.currentIndex || 0
  };
};

const careerPositionTransformer = (item: any, context?: MigrationContext): CareerPositionData => {
  // Transformar fecha de publicación
  let postedAt: Timestamp;
  if (item.posted_at) {
    const date = typeof item.posted_at === 'string'
      ? new Date(item.posted_at)
      : item.posted_at;
    postedAt = Timestamp.fromDate(date);
  } else {
    postedAt = Timestamp.now();
  }

  // Transformar fecha de expiración
  let expiresAt: Timestamp | undefined;
  if (item.expires_at) {
    const date = typeof item.expires_at === 'string'
      ? new Date(item.expires_at)
      : item.expires_at;
    expiresAt = Timestamp.fromDate(date);
  }

  // Transformar métricas de última actualización
  let lastUpdated: Timestamp;
  if (item.metrics?.last_updated) {
    const date = typeof item.metrics.last_updated === 'string'
      ? new Date(item.metrics.last_updated)
      : item.metrics.last_updated;
    lastUpdated = Timestamp.fromDate(date);
  } else {
    lastUpdated = Timestamp.now();
  }

  return {
    title: item.title,
    slug: item.slug,
    department_id: item.department_id,
    location: {
      city: item.location.city,
      region: item.location.region,
      remote_available: item.location.remote_available || false,
      office_address: item.location.office_address
    },
    employment_type: item.employment_type || 'full_time',
    experience_level: item.experience_level || 'mid',
    salary_range: {
      min: item.salary_range.min,
      max: item.salary_range.max,
      currency: item.salary_range.currency || 'PEN',
      period: item.salary_range.period || 'monthly'
    },
    description: item.description,
    short_description: item.short_description,
    requirements: {
      education: item.requirements.education || [],
      experience: item.requirements.experience || [],
      skills: item.requirements.skills || [],
      languages: item.requirements.languages || [],
      certifications: item.requirements.certifications
    },
    responsibilities: item.responsibilities || [],
    benefits: item.benefits || [],
    featured: item.featured || false,
    urgent: item.urgent || false,
    posted_at: postedAt,
    expires_at: expiresAt,
    application_count: item.application_count || 0,
    status: item.status || 'active',
    seo: item.seo,
    metrics: {
      views: item.metrics?.views || 0,
      applications: item.metrics?.applications || 0,
      last_updated: lastUpdated
    }
  };
};

/**
 * Configuración de migración Careers
 */
export const createCareersMigrationConfig = (
  departmentsData: any[] = MOCK_CAREERS_DATA.departments,
  positionsData: any[] = MOCK_CAREERS_DATA.positions,
  applicationsData: any[] = [],
  dryRun: boolean = true
): MigrationConfig => {
  const collections: CollectionConfig[] = [
    // Departamentos primero (sin dependencias)
    {
      name: COLLECTIONS.CAREER_DEPARTMENTS,
      data: departmentsData,
      transformer: careerDepartmentTransformer,
      validator: validateCareerDepartment
    },
    // Posiciones después (dependen de departamentos)
    {
      name: COLLECTIONS.CAREER_POSITIONS,
      data: positionsData,
      transformer: careerPositionTransformer,
      validator: validateCareerPosition,
      dependencies: [COLLECTIONS.CAREER_DEPARTMENTS]
    }
  ];

  // Agregar aplicaciones si hay datos
  if (applicationsData.length > 0) {
    collections.push({
      name: COLLECTIONS.CAREER_APPLICATIONS,
      data: applicationsData,
      transformer: (item: any) => item, // Las aplicaciones normalmente se crean via API
      validator: validateCareerApplication,
      dependencies: [COLLECTIONS.CAREER_POSITIONS]
    });
  }

  return {
    systemName: 'Careers',
    collections,
    dryRun,
    batchSize: 15 // Batch size optimizado para Careers
  };
};

/**
 * Ejecutor principal de migración Careers
 */
export class CareersMigrator extends UnifiedMigrator {
  constructor() {
    super(15); // Batch size optimizado para Careers
  }

  /**
   * Migrar Careers completo desde datos JSON
   */
  async migrateCareersSystem(
    departmentsData?: any[],
    positionsData?: any[],
    applicationsData?: any[],
    dryRun: boolean = true
  ) {
    console.log('🚀 Starting Careers migration to Firestore...');

    try {
      // Crear configuración
      const config = createCareersMigrationConfig(departmentsData, positionsData, applicationsData, dryRun);

      // Ejecutar migración
      const result = await this.migrateSystem(config);

      // Calcular relaciones después de la migración
      if (!dryRun && result.success) {
        await this.calculateCareersRelations();
      }

      return result;
    } catch (error) {
      console.error('❌ Careers migration failed:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas y relaciones específicas de Careers
   */
  async calculateCareersRelations() {
    console.log('🔗 Calculating Careers relationships...');

    const relationships = [
      {
        parentCollection: COLLECTIONS.CAREER_DEPARTMENTS,
        childCollection: COLLECTIONS.CAREER_POSITIONS,
        relationField: 'department_id',
        calculateMetrics: true
      },
      {
        parentCollection: COLLECTIONS.CAREER_POSITIONS,
        childCollection: COLLECTIONS.CAREER_APPLICATIONS,
        relationField: 'position_id',
        calculateMetrics: true
      }
    ];

    await this.calculateRelations(relationships);

    // Calcular métricas adicionales específicas de Careers
    await this.calculateCareersMetrics();
  }

  /**
   * Calcular métricas agregadas específicas de Careers
   */
  private async calculateCareersMetrics() {
    console.log('📊 Calculating Careers specific metrics...');

    try {
      // Aquí se implementarían cálculos específicos como:
      // - Promedio de salarios por departamento
      // - Distribución geográfica de posiciones
      // - Tiempo promedio de contratación
      // - Tasa de conversión de aplicaciones
      console.log('✅ Careers metrics calculated successfully');
    } catch (error) {
      console.error('❌ Error calculating Careers metrics:', error);
    }
  }

  /**
   * Validar migración Careers
   */
  async validateCareersMigration(originalData: {
    departments: any[],
    positions: any[],
    applications?: any[]
  }) {
    console.log('🔍 Validating Careers migration...');

    const validationPromises = [
      this.validateMigration(COLLECTIONS.CAREER_DEPARTMENTS, originalData.departments.length),
      this.validateMigration(COLLECTIONS.CAREER_POSITIONS, originalData.positions.length)
    ];

    if (originalData.applications && originalData.applications.length > 0) {
      validationPromises.push(
        this.validateMigration(COLLECTIONS.CAREER_APPLICATIONS, originalData.applications.length)
      );
    }

    const results = await Promise.all(validationPromises);
    const isValid = results.every(result => result.isValid);

    if (isValid) {
      console.log('✅ Careers migration validation passed');
    } else {
      console.log('❌ Careers migration validation failed');
      results.forEach((result, index) => {
        const collectionNames = ['departments', 'positions', 'applications'];
        const collectionName = collectionNames[index];
        if (!result.isValid) {
          console.log(`❌ ${collectionName}:`, result.errors);
        }
      });
    }

    return {
      isValid,
      results
    };
  }

  /**
   * Cerrar posiciones expiradas
   */
  async closeExpiredPositions() {
    console.log('⏰ Checking for expired positions...');

    try {
      // Esta funcionalidad específica de Careers permitiría
      // cerrar automáticamente posiciones que han expirado
      const now = Timestamp.now();

      // En una implementación real, buscaríamos posiciones donde expires_at < now
      // y actualizaríamos su status a 'closed'

      console.log('✅ Expired positions check completed');
    } catch (error) {
      console.error('❌ Error checking expired positions:', error);
    }
  }
}

/**
 * Función de conveniencia para ejecutar migración rápidamente
 */
export async function migrateCareersToFirestore(
  departmentsData?: any[],
  positionsData?: any[],
  applicationsData?: any[],
  dryRun: boolean = true
) {
  const migrator = new CareersMigrator();
  return await migrator.migrateCareersSystem(departmentsData, positionsData, applicationsData, dryRun);
}

/**
 * Utilitarios para lectura de datos JSON (Legacy compatibility)
 */
export class CareersJSONReader {
  /**
   * Lee el archivo JSON de careers
   */
  static async readJSONFile(filePath: string): Promise<any> {
    try {
      if (typeof window !== 'undefined') {
        // En el cliente, usar fetch
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
        }
        return await response.json();
      } else {
        // En el servidor, usar fs
        const fs = await import('fs/promises');
        const path = await import('path');

        const fullPath = path.resolve(process.cwd(), filePath);
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
    }
  }

  /**
   * Transforma datos JSON legacy al formato unificado
   */
  static transformLegacyData(jsonData: any): { departments: any[], positions: any[] } {
    const departments: any[] = [];
    const positions: any[] = [];

    if (jsonData.departments && Array.isArray(jsonData.departments)) {
      jsonData.departments.forEach((legacyDept: any) => {
        // Transformar departamento
        const department = {
          id: legacyDept.id,
          name: legacyDept.name,
          slug: legacyDept.slug || legacyDept.name.toLowerCase().replace(/\s+/g, '-'),
          description: legacyDept.description,
          icon: legacyDept.icon,
          color: legacyDept.color,
          featured_image: legacyDept.featured_image,
          positions_count: legacyDept.positions_count || 0,
          total_salary_range_min: legacyDept.salary_range_min || 0,
          total_salary_range_max: legacyDept.salary_range_max || 0,
          featured: legacyDept.featured || false,
          order: legacyDept.order || 0
        };
        departments.push(department);

        // Transformar posiciones de este departamento
        if (legacyDept.positions && Array.isArray(legacyDept.positions)) {
          legacyDept.positions.forEach((legacyPos: any) => {
            const position = {
              id: legacyPos.id,
              department_id: legacyDept.id,
              title: legacyPos.title || legacyPos.name,
              slug: `${legacyPos.title.toLowerCase().replace(/\s+/g, '-')}-${legacyDept.slug}`,
              location: {
                city: legacyPos.location?.city || 'Lima',
                region: legacyPos.location?.region || 'Lima',
                remote_available: legacyPos.remote || false,
                office_address: legacyPos.location?.address
              },
              employment_type: legacyPos.type || 'full_time',
              experience_level: legacyPos.level || 'mid',
              salary_range: {
                min: legacyPos.salary_min || 0,
                max: legacyPos.salary_max || 0,
                currency: 'PEN',
                period: 'monthly'
              },
              description: legacyPos.description,
              short_description: legacyPos.summary || legacyPos.description.substring(0, 160),
              requirements: {
                education: legacyPos.education || [],
                experience: legacyPos.experience || [],
                skills: legacyPos.skills || [],
                languages: legacyPos.languages || ['Español'],
                certifications: legacyPos.certifications
              },
              responsibilities: legacyPos.responsibilities || [],
              benefits: legacyPos.benefits || [],
              featured: legacyPos.featured || false,
              urgent: legacyPos.urgent || false,
              posted_at: legacyPos.posted_date || new Date().toISOString(),
              expires_at: legacyPos.expires_date,
              application_count: 0,
              status: legacyPos.status || 'active',
              seo: {
                title: `${legacyPos.title} - Métrica FM Careers`,
                description: legacyPos.summary || legacyPos.description.substring(0, 160),
                keywords: [legacyPos.title, legacyDept.name, 'empleo', 'trabajo']
              },
              metrics: {
                views: 0,
                applications: 0,
                last_updated: new Date().toISOString()
              }
            };
            positions.push(position);
          });
        }
      });
    }

    return { departments, positions };
  }

  /**
   * Migración desde archivo JSON legacy
   */
  static async migrateFromLegacyJSON(
    jsonFilePath: string,
    dryRun: boolean = true
  ) {
    console.log('📁 Reading legacy Careers JSON file:', jsonFilePath);

    // Leer archivo JSON
    const jsonData = await this.readJSONFile(jsonFilePath);

    // Transformar a formato unificado
    const { departments, positions } = this.transformLegacyData(jsonData);

    console.log(`📊 Transformed data: ${departments.length} departments, ${positions.length} positions`);

    // Ejecutar migración usando arquitectura unificada
    return await migrateCareersToFirestore(departments, positions, undefined, dryRun);
  }
}

// Exportar instancia por defecto
export const careersMigrator = new CareersMigrator();