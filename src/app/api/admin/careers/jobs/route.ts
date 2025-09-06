/**
 * API Route: /api/admin/careers/jobs
 * CRUD para trabajos/ofertas laborales
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';
import crypto from 'crypto';

const CAREERS_FILE = 'dynamic-content/careers/content.json';

// Interface para query parameters
interface JobQuery {
  page?: number;
  limit?: number;
  sort?: 'title' | 'posted_date' | 'deadline' | 'applicant_count' | 'view_count' | 'level';
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
  department?: string;
  location?: string;
  level?: 'junior' | 'mid' | 'senior' | 'director';
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  status?: 'active' | 'paused' | 'closed' | 'draft';
  featured?: 'true' | 'false';
  urgent?: 'true' | 'false';
  remote?: 'true' | 'false';
  hybrid?: 'true' | 'false';
}

// GET /api/admin/careers/jobs - Listar trabajos con paginación avanzada
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query: JobQuery = {
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        sort: (searchParams.get('sort') as any) || 'posted_date',
        order: (searchParams.get('order') as any) || 'desc',
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        department: searchParams.get('department') || undefined,
        location: searchParams.get('location') || undefined,
        level: (searchParams.get('level') as any) || undefined,
        type: (searchParams.get('type') as any) || undefined,
        status: (searchParams.get('status') as any) || undefined,
        featured: searchParams.get('featured') || undefined,
        urgent: searchParams.get('urgent') || undefined,
        remote: searchParams.get('remote') || undefined,
        hybrid: searchParams.get('hybrid') || undefined
      };

      // Leer datos de careers
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      let jobs = careersData.job_postings || [];
      const departments = careersData.departments || [];

      // Filtrar por búsqueda
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        jobs = jobs.filter((job: any) =>
          job.title?.toLowerCase().includes(searchLower) ||
          job.short_description?.toLowerCase().includes(searchLower) ||
          job.full_description?.toLowerCase().includes(searchLower) ||
          job.department?.toLowerCase().includes(searchLower) ||
          job.location?.city?.toLowerCase().includes(searchLower) ||
          job.location?.region?.toLowerCase().includes(searchLower) ||
          job.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
          job.requirements?.essential?.some((req: string) => req.toLowerCase().includes(searchLower)) ||
          job.requirements?.preferred?.some((req: string) => req.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por categoría
      if (query.category) {
        jobs = jobs.filter((job: any) => job.category === query.category);
      }

      // Filtrar por departamento
      if (query.department) {
        jobs = jobs.filter((job: any) => job.department === query.department);
      }

      // Filtrar por ubicación
      if (query.location) {
        jobs = jobs.filter((job: any) => 
          job.location?.city?.toLowerCase().includes(query.location!.toLowerCase()) ||
          job.location?.region?.toLowerCase().includes(query.location!.toLowerCase())
        );
      }

      // Filtrar por nivel
      if (query.level) {
        jobs = jobs.filter((job: any) => job.level === query.level);
      }

      // Filtrar por tipo
      if (query.type) {
        jobs = jobs.filter((job: any) => job.type === query.type);
      }

      // Filtrar por estado
      if (query.status) {
        jobs = jobs.filter((job: any) => job.status === query.status);
      }

      // Filtrar por featured
      if (query.featured !== undefined) {
        const isFeatured = query.featured === 'true';
        jobs = jobs.filter((job: any) => !!job.featured === isFeatured);
      }

      // Filtrar por urgent
      if (query.urgent !== undefined) {
        const isUrgent = query.urgent === 'true';
        jobs = jobs.filter((job: any) => !!job.urgent === isUrgent);
      }

      // Filtrar por remote
      if (query.remote !== undefined) {
        const isRemote = query.remote === 'true';
        jobs = jobs.filter((job: any) => !!job.location?.remote === isRemote);
      }

      // Filtrar por hybrid
      if (query.hybrid !== undefined) {
        const isHybrid = query.hybrid === 'true';
        jobs = jobs.filter((job: any) => !!job.location?.hybrid === isHybrid);
      }

      // Ordenar
      jobs.sort((a: any, b: any) => {
        let aValue = a[query.sort!];
        let bValue = b[query.sort!];
        
        // Manejar fechas
        if (query.sort === 'posted_date' || query.sort === 'deadline') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }
        
        // Manejar números
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return query.order === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        // Manejar strings
        const comparison = String(aValue || '').localeCompare(String(bValue || ''));
        return query.order === 'desc' ? -comparison : comparison;
      });

      // Paginación
      const total = jobs.length;
      const totalPages = Math.ceil(total / query.limit!);
      const offset = (query.page! - 1) * query.limit!;
      const paginatedJobs = jobs.slice(offset, offset + query.limit!);

      // Enriquecer con información de departamento
      const enrichedJobs = paginatedJobs.map((job: any) => {
        const department = departments.find((dept: any) => dept.id === job.category);
        return {
          ...job,
          department_info: department ? {
            id: department.id,
            name: department.name,
            slug: department.slug,
            color: department.color,
            icon: department.icon,
            open_positions: department.open_positions
          } : null,
          // Calcular días restantes para deadline
          days_until_deadline: job.deadline ? 
            Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
          // Calcular días desde publicación
          days_since_posted: job.posted_date ? 
            Math.floor((new Date().getTime() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24)) : null
        };
      });

      // Estadísticas adicionales
      const stats = {
        total_jobs: total,
        by_status: {
          active: jobs.filter((j: any) => j.status === 'active').length,
          paused: jobs.filter((j: any) => j.status === 'paused').length,
          closed: jobs.filter((j: any) => j.status === 'closed').length,
          draft: jobs.filter((j: any) => j.status === 'draft').length
        },
        by_level: {
          junior: jobs.filter((j: any) => j.level === 'junior').length,
          mid: jobs.filter((j: any) => j.level === 'mid').length,
          senior: jobs.filter((j: any) => j.level === 'senior').length,
          director: jobs.filter((j: any) => j.level === 'director').length
        },
        by_type: {
          'full-time': jobs.filter((j: any) => j.type === 'full-time').length,
          'part-time': jobs.filter((j: any) => j.type === 'part-time').length,
          contract: jobs.filter((j: any) => j.type === 'contract').length,
          internship: jobs.filter((j: any) => j.type === 'internship').length
        },
        featured_count: jobs.filter((j: any) => j.featured).length,
        urgent_count: jobs.filter((j: any) => j.urgent).length,
        remote_count: jobs.filter((j: any) => j.location?.remote).length,
        hybrid_count: jobs.filter((j: any) => j.location?.hybrid).length
      };

      return NextResponse.json({
        success: true,
        data: {
          jobs: enrichedJobs,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
            hasNextPage: query.page! < totalPages,
            hasPrevPage: query.page! > 1
          },
          filters: {
            search: query.search,
            category: query.category,
            department: query.department,
            location: query.location,
            level: query.level,
            type: query.type,
            status: query.status,
            featured: query.featured,
            urgent: query.urgent,
            remote: query.remote,
            hybrid: query.hybrid,
            sort: query.sort,
            order: query.order
          },
          departments: departments.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            slug: dept.slug,
            open_positions: jobs.filter((j: any) => j.category === dept.id && j.status === 'active').length,
            total_positions: jobs.filter((j: any) => j.category === dept.id).length
          })),
          stats
        }
      });

    } catch (error) {
      await logger.error('careers-api', 'Failed to list jobs', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve jobs.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'read')()
);

// POST /api/admin/careers/jobs - Crear nuevo trabajo
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        title,
        slug,
        category,
        department,
        location,
        type = 'full-time',
        level = 'mid',
        status = 'draft',
        experience_years,
        featured = false,
        urgent = false,
        posted_date,
        deadline,
        short_description,
        full_description,
        key_responsibilities = [],
        requirements = { essential: [], preferred: [] },
        salary,
        application_process,
        questions = [],
        tags = [],
        hiring_manager,
        seo = {},
        metadata = {}
      } = body;

      // Validar campos requeridos
      if (!title || !category || !department || !location || !short_description) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Title, category, department, location and short_description are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const jobs = careersData.job_postings || [];
      const departments = careersData.departments || [];

      // Verificar que el departamento existe
      const departmentExists = departments.find((dept: any) => dept.id === category);
      if (!departmentExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_DEPARTMENT',
            message: 'The specified department does not exist.'
          },
          { status: 400 }
        );
      }

      // Generar slug si no se proporciona
      const jobSlug = slug || title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el slug no existe
      if (jobs.some((job: any) => job.slug === jobSlug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A job with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Crear nuevo trabajo
      const newJob = {
        id: `job-${crypto.randomBytes(6).toString('hex')}`,
        title,
        slug: jobSlug,
        category,
        department,
        location: {
          city: location.city || '',
          region: location.region || '',
          country: location.country || 'Perú',
          remote: !!location.remote,
          hybrid: !!location.hybrid,
          address: location.address || ''
        },
        type,
        level,
        status,
        experience_years: experience_years || 0,
        featured: !!featured,
        urgent: !!urgent,
        posted_date: posted_date || new Date().toISOString().split('T')[0],
        deadline: deadline || null,
        short_description,
        full_description: full_description || '',
        key_responsibilities: Array.isArray(key_responsibilities) ? key_responsibilities : [],
        requirements: {
          essential: Array.isArray(requirements.essential) ? requirements.essential : [],
          preferred: Array.isArray(requirements.preferred) ? requirements.preferred : []
        },
        salary: salary || null,
        application_process: application_process || null,
        questions: Array.isArray(questions) ? questions : [],
        tags: Array.isArray(tags) ? tags : [],
        applicant_count: 0,
        view_count: 0,
        hiring_manager: hiring_manager || null,
        seo: {
          meta_title: seo.meta_title || `${title} | Carreras Métrica FM`,
          meta_description: seo.meta_description || short_description,
          keywords: Array.isArray(seo.keywords) ? seo.keywords : []
        },
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          created_by: context.user.id,
          updated_at: new Date().toISOString(),
          updated_by: context.user.id
        }
      };

      // Agregar a la lista
      jobs.push(newJob);

      // Actualizar contador de posiciones abiertas en el departamento
      const departmentIndex = departments.findIndex((dept: any) => dept.id === category);
      if (departmentIndex !== -1 && status === 'active') {
        departments[departmentIndex].open_positions = (departments[departmentIndex].open_positions || 0) + 1;
      }

      // Actualizar archivo
      const updatedData = {
        ...careersData,
        job_postings: jobs,
        departments,
        page_info: {
          ...careersData.page_info,
          hero: {
            ...careersData.page_info.hero,
            stats: {
              ...careersData.page_info.hero.stats,
              total_positions: jobs.filter((j: any) => j.status === 'active').length
            }
          }
        },
        metadata: {
          ...careersData.metadata,
          total_open_positions: jobs.filter((j: any) => j.status === 'active').length,
          last_updated: new Date().toISOString()
        }
      };

      await jsonCrudSystem.writeJSON(CAREERS_FILE, updatedData, {
        validate: true,
        backup: true
      });

      // Log de auditoría
      await logger.audit({
        action: 'create',
        resource: 'career-job',
        resourceId: newJob.id,
        message: `Career job '${title}' created`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { title, slug: jobSlug, category, department, level, type }
      });

      return NextResponse.json({
        success: true,
        message: 'Job created successfully.',
        data: { job: newJob }
      }, { status: 201 });

    } catch (error) {
      await logger.error('careers-api', 'Failed to create job', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create job.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'write')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}