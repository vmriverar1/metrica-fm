/**
 * Servicio Careers Unificado
 * Extiende BaseFirestoreService con funcionalidades específicas de Careers
 * Reutiliza arquitectura base para máxima eficiencia
 */

import { Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { BaseFirestoreService, BaseEntity, BaseData, FilterCondition, CRUDResponse } from '@/lib/firestore/base-service';
import { COLLECTIONS } from '@/lib/firebase/config';

// Tipos específicos de Careers
export interface CareerDepartment extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  positions_count: number;
  total_salary_range_min: number;
  total_salary_range_max: number;
  featured: boolean;
  order: number;
}

export interface CareerDepartmentData extends BaseData {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  positions_count?: number;
  total_salary_range_min?: number;
  total_salary_range_max?: number;
  featured?: boolean;
  order?: number;
}

export interface CareerPosition extends BaseEntity {
  title: string;
  slug: string;
  department_id: string;
  location: {
    city: string;
    region: string;
    remote_available: boolean;
    office_address?: string;
  };
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  salary_range: {
    min: number;
    max: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };
  description: string;
  short_description: string;
  requirements: {
    education: string[];
    experience: string[];
    skills: string[];
    languages: string[];
    certifications?: string[];
  };
  responsibilities: string[];
  benefits: string[];
  featured: boolean;
  urgent: boolean;
  posted_at: Timestamp;
  expires_at?: Timestamp;
  application_count: number;
  status: 'active' | 'paused' | 'closed' | 'filled';
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  metrics: {
    views: number;
    applications: number;
    last_updated: Timestamp;
  };
}

export interface CareerPositionData extends BaseData {
  title: string;
  slug: string;
  department_id: string;
  location: {
    city: string;
    region: string;
    remote_available: boolean;
    office_address?: string;
  };
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  salary_range: {
    min: number;
    max: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };
  description: string;
  short_description: string;
  requirements: {
    education: string[];
    experience: string[];
    skills: string[];
    languages: string[];
    certifications?: string[];
  };
  responsibilities: string[];
  benefits: string[];
  featured?: boolean;
  urgent?: boolean;
  posted_at?: Timestamp;
  expires_at?: Timestamp;
  application_count?: number;
  status?: 'active' | 'paused' | 'closed' | 'filled';
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  metrics?: {
    views: number;
    applications: number;
    last_updated: Timestamp;
  };
}

export interface CareerApplication extends BaseEntity {
  position_id: string;
  applicant: {
    name: string;
    email: string;
    phone?: string;
    location: {
      city: string;
      region: string;
    };
  };
  resume_url: string;
  cover_letter?: string;
  experience_years: number;
  education_level: string;
  current_salary?: number;
  expected_salary?: number;
  availability_date: Timestamp;
  portfolio_url?: string;
  linkedin_url?: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'hired';
  applied_at: Timestamp;
  reviewed_at?: Timestamp;
  notes?: string;
}

export interface CareerApplicationData extends BaseData {
  position_id: string;
  applicant: {
    name: string;
    email: string;
    phone?: string;
    location: {
      city: string;
      region: string;
    };
  };
  resume_url: string;
  cover_letter?: string;
  experience_years: number;
  education_level: string;
  current_salary?: number;
  expected_salary?: number;
  availability_date: Timestamp;
  portfolio_url?: string;
  linkedin_url?: string;
  status?: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'hired';
  applied_at?: Timestamp;
  reviewed_at?: Timestamp;
  notes?: string;
}

export interface CareersStats {
  totalPositions: number;
  activePositions: number;
  totalApplications: number;
  departmentsCount: number;
  featuredPositions: number;
  positionsByDepartment: Record<string, number>;
  positionsByLocation: Record<string, number>;
  positionsByType: Record<string, number>;
  positionsByLevel: Record<string, number>;
  averageSalaryRange: {
    min: number;
    max: number;
    currency: string;
  };
}

/**
 * Servicio de Departamentos de Careers
 */
export class CareerDepartmentService extends BaseFirestoreService<CareerDepartment, CareerDepartmentData> {
  constructor() {
    super(COLLECTIONS.CAREER_DEPARTMENTS);
  }

  /**
   * Obtener departamentos con contador de posiciones actualizado
   */
  async getDepartmentsWithPositionCount(): Promise<CareerDepartment[]> {
    try {
      const departments = await this.getAll(
        undefined,
        [{ field: 'order', direction: 'asc' }]
      );

      // Actualizar contadores en paralelo
      const departmentsWithCount = await Promise.all(
        departments.map(async (department) => {
          const positionCount = await this.getPositionCountForDepartment(department.id);
          return {
            ...department,
            positions_count: positionCount
          };
        })
      );

      return departmentsWithCount;
    } catch (error) {
      console.error('Error getting departments with position count:', error);
      throw new Error('Failed to fetch departments with position count');
    }
  }

  /**
   * Obtener departamentos destacados para home
   */
  async getFeaturedDepartments(): Promise<CareerDepartment[]> {
    try {
      return await this.getAll(
        [{ field: 'featured', operator: '==', value: true }],
        [{ field: 'order', direction: 'asc' }]
      );
    } catch (error) {
      console.error('Error getting featured departments:', error);
      throw new Error('Failed to fetch featured departments');
    }
  }

  /**
   * Reordenar departamentos
   */
  async reorderDepartments(orderMap: { id: string; order: number }[]): Promise<CRUDResponse<void>> {
    try {
      const updates = orderMap.map(item => ({
        id: item.id,
        data: { order: item.order }
      }));

      return await this.batchUpdate(updates);
    } catch (error) {
      console.error('Error reordering departments:', error);
      return {
        success: false,
        error: 'Failed to reorder departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualizar métricas de un departamento
   */
  async updateDepartmentMetrics(departmentId: string): Promise<CRUDResponse<void>> {
    try {
      const positions = await careerPositionService.getPositionsByDepartment(departmentId);

      const totalPositions = positions.length;
      const activePositions = positions.filter(pos => pos.status === 'active');

      const salaryRanges = activePositions
        .map(pos => pos.salary_range)
        .filter(range => range && range.min && range.max);

      const totalSalaryMin = salaryRanges.reduce((sum, range) => sum + range.min, 0);
      const totalSalaryMax = salaryRanges.reduce((sum, range) => sum + range.max, 0);

      return await this.update(departmentId, {
        positions_count: totalPositions,
        total_salary_range_min: salaryRanges.length > 0 ? Math.floor(totalSalaryMin / salaryRanges.length) : 0,
        total_salary_range_max: salaryRanges.length > 0 ? Math.floor(totalSalaryMax / salaryRanges.length) : 0
      });
    } catch (error) {
      console.error('Error updating department metrics:', error);
      return {
        success: false,
        error: 'Failed to update department metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtener departamento por slug
   */
  async getDepartmentBySlug(slug: string): Promise<CareerDepartment | null> {
    try {
      const departments = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      return departments.length > 0 ? departments[0] : null;
    } catch (error) {
      console.error('Error getting department by slug:', error);
      return null;
    }
  }

  // Método privado para contar posiciones
  private async getPositionCountForDepartment(departmentId: string): Promise<number> {
    try {
      const positionsCount = await careerPositionService.count([
        { field: 'department_id', operator: '==', value: departmentId }
      ]);
      return positionsCount;
    } catch (error) {
      console.error('Error counting positions for department:', error);
      return 0;
    }
  }
}

/**
 * Servicio de Posiciones de Careers
 */
export class CareerPositionService extends BaseFirestoreService<CareerPosition, CareerPositionData> {
  constructor() {
    super(COLLECTIONS.CAREER_POSITIONS);
  }

  /**
   * Obtener posiciones por departamento
   */
  async getPositionsByDepartment(departmentId: string): Promise<CareerPosition[]> {
    try {
      return await this.getAll(
        [{ field: 'department_id', operator: '==', value: departmentId }],
        [{ field: 'posted_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting positions by department:', error);
      throw new Error('Failed to fetch positions by department');
    }
  }

  /**
   * Obtener posiciones activas
   */
  async getActivePositions(limitCount?: number): Promise<CareerPosition[]> {
    try {
      return await this.getAll(
        [{ field: 'status', operator: '==', value: 'active' }],
        [{ field: 'posted_at', direction: 'desc' }],
        limitCount ? { limit: limitCount } : undefined
      );
    } catch (error) {
      console.error('Error getting active positions:', error);
      throw new Error('Failed to fetch active positions');
    }
  }

  /**
   * Obtener posiciones destacadas
   */
  async getFeaturedPositions(limitCount: number = 6): Promise<CareerPosition[]> {
    try {
      return await this.getAll(
        [
          { field: 'featured', operator: '==', value: true },
          { field: 'status', operator: '==', value: 'active' }
        ],
        [{ field: 'posted_at', direction: 'desc' }],
        { limit: limitCount }
      );
    } catch (error) {
      console.error('Error getting featured positions:', error);
      throw new Error('Failed to fetch featured positions');
    }
  }

  /**
   * Obtener posiciones urgentes
   */
  async getUrgentPositions(): Promise<CareerPosition[]> {
    try {
      return await this.getAll(
        [
          { field: 'urgent', operator: '==', value: true },
          { field: 'status', operator: '==', value: 'active' }
        ],
        [{ field: 'posted_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting urgent positions:', error);
      throw new Error('Failed to fetch urgent positions');
    }
  }

  /**
   * Obtener posición por slug
   */
  async getPositionBySlug(slug: string): Promise<CareerPosition | null> {
    try {
      const positions = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      if (positions.length > 0) {
        // Incrementar contador de vistas
        await this.incrementField(positions[0].id, 'metrics.views');
        return positions[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting position by slug:', error);
      return null;
    }
  }

  /**
   * Buscar posiciones por término
   */
  async searchPositions(searchTerm: string): Promise<CareerPosition[]> {
    try {
      return await this.search(searchTerm, [
        'title',
        'description',
        'short_description',
        'requirements.skills',
        'location.city'
      ]);
    } catch (error) {
      console.error('Error searching positions:', error);
      throw new Error('Failed to search positions');
    }
  }

  /**
   * Obtener posiciones por ubicación
   */
  async getPositionsByLocation(city: string): Promise<CareerPosition[]> {
    try {
      return await this.getAll([
        { field: 'location.city', operator: '==', value: city },
        { field: 'status', operator: '==', value: 'active' }
      ]);
    } catch (error) {
      console.error('Error getting positions by location:', error);
      throw new Error('Failed to fetch positions by location');
    }
  }

  /**
   * Obtener posiciones por tipo de empleo
   */
  async getPositionsByEmploymentType(type: string): Promise<CareerPosition[]> {
    try {
      return await this.getAll([
        { field: 'employment_type', operator: '==', value: type },
        { field: 'status', operator: '==', value: 'active' }
      ]);
    } catch (error) {
      console.error('Error getting positions by employment type:', error);
      throw new Error('Failed to fetch positions by employment type');
    }
  }

  /**
   * Obtener posiciones por nivel de experiencia
   */
  async getPositionsByExperienceLevel(level: string): Promise<CareerPosition[]> {
    try {
      return await this.getAll([
        { field: 'experience_level', operator: '==', value: level },
        { field: 'status', operator: '==', value: 'active' }
      ]);
    } catch (error) {
      console.error('Error getting positions by experience level:', error);
      throw new Error('Failed to fetch positions by experience level');
    }
  }

  /**
   * Obtener estadísticas de careers
   */
  async getCareersStats(): Promise<CareersStats> {
    try {
      const [positions, departments, applications] = await Promise.all([
        this.getAll(),
        careerDepartmentService.getAll(),
        careerApplicationService.getAll()
      ]);

      const activePositions = positions.filter(pos => pos.status === 'active');
      const featuredPositions = positions.filter(pos => pos.featured).length;

      // Posiciones por departamento
      const positionsByDepartment = positions.reduce((acc, position) => {
        acc[position.department_id] = (acc[position.department_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Posiciones por ubicación
      const positionsByLocation = activePositions.reduce((acc, position) => {
        acc[position.location.city] = (acc[position.location.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Posiciones por tipo
      const positionsByType = activePositions.reduce((acc, position) => {
        acc[position.employment_type] = (acc[position.employment_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Posiciones por nivel
      const positionsByLevel = activePositions.reduce((acc, position) => {
        acc[position.experience_level] = (acc[position.experience_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Promedio de rangos salariales
      const salaryRanges = activePositions
        .map(pos => pos.salary_range)
        .filter(range => range && range.min && range.max);

      const avgSalaryMin = salaryRanges.length > 0
        ? Math.floor(salaryRanges.reduce((sum, range) => sum + range.min, 0) / salaryRanges.length)
        : 0;

      const avgSalaryMax = salaryRanges.length > 0
        ? Math.floor(salaryRanges.reduce((sum, range) => sum + range.max, 0) / salaryRanges.length)
        : 0;

      return {
        totalPositions: positions.length,
        activePositions: activePositions.length,
        totalApplications: applications.length,
        departmentsCount: departments.length,
        featuredPositions,
        positionsByDepartment,
        positionsByLocation,
        positionsByType,
        positionsByLevel,
        averageSalaryRange: {
          min: avgSalaryMin,
          max: avgSalaryMax,
          currency: 'PEN'
        }
      };
    } catch (error) {
      console.error('Error getting careers stats:', error);
      throw new Error('Failed to fetch careers statistics');
    }
  }

  /**
   * Incrementar vistas de posición
   */
  async incrementViews(positionId: string): Promise<CRUDResponse<void>> {
    try {
      await this.incrementField(positionId, 'metrics.views');
      await this.update(positionId, {
        'metrics.last_updated': Timestamp.now()
      });

      return {
        success: true,
        message: 'Position views incremented successfully'
      };
    } catch (error) {
      console.error('Error incrementing position views:', error);
      return {
        success: false,
        error: 'Failed to increment position views',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Servicio de Aplicaciones de Careers
 */
export class CareerApplicationService extends BaseFirestoreService<CareerApplication, CareerApplicationData> {
  constructor() {
    super(COLLECTIONS.CAREER_APPLICATIONS);
  }

  /**
   * Obtener aplicaciones por posición
   */
  async getApplicationsByPosition(positionId: string): Promise<CareerApplication[]> {
    try {
      return await this.getAll(
        [{ field: 'position_id', operator: '==', value: positionId }],
        [{ field: 'applied_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting applications by position:', error);
      throw new Error('Failed to fetch applications by position');
    }
  }

  /**
   * Obtener aplicaciones por estado
   */
  async getApplicationsByStatus(status: string): Promise<CareerApplication[]> {
    try {
      return await this.getAll(
        [{ field: 'status', operator: '==', value: status }],
        [{ field: 'applied_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting applications by status:', error);
      throw new Error('Failed to fetch applications by status');
    }
  }

  /**
   * Crear nueva aplicación e incrementar contador en posición
   */
  async createApplication(data: CareerApplicationData): Promise<CRUDResponse<string>> {
    try {
      // Crear aplicación
      const result = await this.create({
        ...data,
        applied_at: Timestamp.now(),
        status: 'pending'
      });

      if (result.success && result.data) {
        // Incrementar contador de aplicaciones en la posición
        await careerPositionService.incrementField(data.position_id, 'application_count');
        await careerPositionService.incrementField(data.position_id, 'metrics.applications');
      }

      return result;
    } catch (error) {
      console.error('Error creating application:', error);
      return {
        success: false,
        error: 'Failed to create application',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Instancias de servicios exportadas
export const careerDepartmentService = new CareerDepartmentService();
export const careerPositionService = new CareerPositionService();
export const careerApplicationService = new CareerApplicationService();