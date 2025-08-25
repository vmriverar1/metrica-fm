/**
 * API Route: /api/admin/careers/jobs/[id]
 * CRUD para trabajo específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';

interface RouteParams {
  params: {
    id: string;
  };
}

const CAREERS_FILE = 'dynamic-content/careers/content.json';

// GET /api/admin/careers/jobs/[id] - Obtener trabajo específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos de careers
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const jobs = careersData.job_postings || [];
      const departments = careersData.departments || [];

      // Buscar trabajo
      const job = jobs.find((j: any) => j.id === id);
      if (!job) {
        return NextResponse.json(
          {
            success: false,
            error: 'JOB_NOT_FOUND',
            message: 'Job not found.'
          },
          { status: 404 }
        );
      }

      // Enriquecer con información de departamento
      const department = departments.find((dept: any) => dept.id === job.category);
      const enrichedJob = {
        ...job,
        department_info: department ? {
          id: department.id,
          name: department.name,
          slug: department.slug,
          color: department.color,
          icon: department.icon,
          open_positions: department.open_positions,
          description: department.description,
          required_skills: department.required_skills,
          career_path: department.career_path
        } : null,
        // Calcular días restantes para deadline
        days_until_deadline: job.deadline ? 
          Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
        // Calcular días desde publicación
        days_since_posted: job.posted_date ? 
          Math.floor((new Date().getTime() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24)) : null
      };

      // Trabajos relacionados (mismo departamento, excluyendo el actual)
      const relatedJobs = jobs
        .filter((j: any) => j.category === job.category && j.id !== id && j.status === 'active')
        .slice(0, 5)
        .map((j: any) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          level: j.level,
          type: j.type,
          location: j.location,
          featured: j.featured,
          urgent: j.urgent,
          posted_date: j.posted_date,
          deadline: j.deadline,
          applicant_count: j.applicant_count
        }));

      // Estadísticas del departamento
      const departmentStats = department ? {
        total_jobs: jobs.filter((j: any) => j.category === job.category).length,
        active_jobs: jobs.filter((j: any) => j.category === job.category && j.status === 'active').length,
        average_applications: Math.round(
          jobs
            .filter((j: any) => j.category === job.category)
            .reduce((sum: number, j: any) => sum + (j.applicant_count || 0), 0) /
          jobs.filter((j: any) => j.category === job.category).length || 1
        )
      } : null;

      return NextResponse.json({
        success: true,
        data: {
          job: enrichedJob,
          related_jobs: relatedJobs,
          department: department || null,
          department_stats: departmentStats
        }
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to get job: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve job.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'read')()
);

// PUT /api/admin/careers/jobs/[id] - Actualizar trabajo
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
      const body = await request.json();
      const {
        title,
        slug,
        category,
        department,
        location,
        type,
        level,
        status,
        experience_years,
        featured,
        urgent,
        posted_date,
        deadline,
        short_description,
        full_description,
        key_responsibilities,
        requirements,
        salary,
        application_process,
        questions,
        tags,
        hiring_manager,
        seo,
        metadata
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

      // Buscar trabajo
      const jobIndex = jobs.findIndex((j: any) => j.id === id);
      if (jobIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'JOB_NOT_FOUND',
            message: 'Job not found.'
          },
          { status: 404 }
        );
      }

      const currentJob = jobs[jobIndex];

      // Verificar que el nuevo departamento existe
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

      // Verificar que el slug no existe en otro trabajo
      if (slug && slug !== currentJob.slug) {
        const existingJob = jobs.find((j: any) => j.slug === slug && j.id !== id);
        if (existingJob) {
          return NextResponse.json(
            {
              success: false,
              error: 'SLUG_EXISTS',
              message: 'A job with this slug already exists.'
            },
            { status: 409 }
          );
        }
      }

      // Actualizar trabajo
      const updatedJob = {
        ...currentJob,
        title,
        slug: slug || currentJob.slug,
        category,
        department,
        location: {
          city: location?.city !== undefined ? location.city : currentJob.location?.city || '',
          region: location?.region !== undefined ? location.region : currentJob.location?.region || '',
          country: location?.country !== undefined ? location.country : currentJob.location?.country || 'Perú',
          remote: location?.remote !== undefined ? !!location.remote : !!currentJob.location?.remote,
          hybrid: location?.hybrid !== undefined ? !!location.hybrid : !!currentJob.location?.hybrid,
          address: location?.address !== undefined ? location.address : currentJob.location?.address || ''
        },
        type: type !== undefined ? type : currentJob.type,
        level: level !== undefined ? level : currentJob.level,
        status: status !== undefined ? status : currentJob.status,
        experience_years: experience_years !== undefined ? Number(experience_years) : currentJob.experience_years,
        featured: featured !== undefined ? !!featured : currentJob.featured,
        urgent: urgent !== undefined ? !!urgent : currentJob.urgent,
        posted_date: posted_date !== undefined ? posted_date : currentJob.posted_date,
        deadline: deadline !== undefined ? deadline : currentJob.deadline,
        short_description,
        full_description: full_description !== undefined ? full_description : currentJob.full_description,
        key_responsibilities: key_responsibilities !== undefined ? 
          (Array.isArray(key_responsibilities) ? key_responsibilities : []) : currentJob.key_responsibilities,
        requirements: requirements !== undefined ? {
          essential: Array.isArray(requirements.essential) ? requirements.essential : [],
          preferred: Array.isArray(requirements.preferred) ? requirements.preferred : []
        } : currentJob.requirements,
        salary: salary !== undefined ? salary : currentJob.salary,
        application_process: application_process !== undefined ? application_process : currentJob.application_process,
        questions: questions !== undefined ? 
          (Array.isArray(questions) ? questions : []) : currentJob.questions,
        tags: tags !== undefined ? 
          (Array.isArray(tags) ? tags : []) : currentJob.tags,
        hiring_manager: hiring_manager !== undefined ? hiring_manager : currentJob.hiring_manager,
        seo: seo !== undefined ? {
          meta_title: seo.meta_title || `${title} | Carreras Métrica DIP`,
          meta_description: seo.meta_description || short_description,
          keywords: Array.isArray(seo.keywords) ? seo.keywords : []
        } : currentJob.seo,
        metadata: {
          ...currentJob.metadata,
          ...(metadata || {}),
          updated_at: new Date().toISOString(),
          updated_by: context.user.id
        }
      };

      jobs[jobIndex] = updatedJob;

      // Actualizar contadores de departamentos si cambió la categoría o el estado
      const oldCategoryId = currentJob.category;
      const newCategoryId = category;
      const oldStatus = currentJob.status;
      const newStatus = status || currentJob.status;

      if (oldCategoryId !== newCategoryId || oldStatus !== newStatus) {
        // Decrementar contador de departamento anterior si era activo
        if (oldStatus === 'active') {
          const oldDeptIndex = departments.findIndex((dept: any) => dept.id === oldCategoryId);
          if (oldDeptIndex !== -1) {
            departments[oldDeptIndex].open_positions = Math.max(0, (departments[oldDeptIndex].open_positions || 1) - 1);
          }
        }

        // Incrementar contador de nuevo departamento si es activo
        if (newStatus === 'active') {
          const newDeptIndex = departments.findIndex((dept: any) => dept.id === newCategoryId);
          if (newDeptIndex !== -1) {
            departments[newDeptIndex].open_positions = (departments[newDeptIndex].open_positions || 0) + 1;
          }
        }
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
        action: 'update',
        resource: 'career-job',
        resourceId: id,
        message: `Career job '${title}' updated`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title, 
          slug: updatedJob.slug, 
          category,
          department,
          level,
          type,
          status,
          category_changed: oldCategoryId !== newCategoryId,
          status_changed: oldStatus !== newStatus
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Job updated successfully.',
        data: { job: updatedJob }
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to update job: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update job.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'write')()
);

// DELETE /api/admin/careers/jobs/[id] - Eliminar trabajo
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos actuales
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const jobs = careersData.job_postings || [];
      const departments = careersData.departments || [];

      // Buscar trabajo
      const jobIndex = jobs.findIndex((j: any) => j.id === id);
      if (jobIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'JOB_NOT_FOUND',
            message: 'Job not found.'
          },
          { status: 404 }
        );
      }

      const job = jobs[jobIndex];

      // Eliminar trabajo
      jobs.splice(jobIndex, 1);

      // Actualizar contador del departamento si era activo
      if (job.status === 'active') {
        const departmentIndex = departments.findIndex((dept: any) => dept.id === job.category);
        if (departmentIndex !== -1) {
          departments[departmentIndex].open_positions = Math.max(0, (departments[departmentIndex].open_positions || 1) - 1);
        }
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
        action: 'delete',
        resource: 'career-job',
        resourceId: id,
        message: `Career job '${job.title}' deleted`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title: job.title, 
          slug: job.slug, 
          category: job.category,
          department: job.department,
          level: job.level,
          type: job.type
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Job deleted successfully.'
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to delete job: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete job.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'delete')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}