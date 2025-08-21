/**
 * API Route: /api/admin/careers/departments/[id]
 * CRUD para departamento específico
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

// GET /api/admin/careers/departments/[id] - Obtener departamento específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos de careers
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const departments = careersData.departments || [];
      const jobs = careersData.job_postings || [];

      // Buscar departamento
      const department = departments.find((dept: any) => dept.id === id);
      if (!department) {
        return NextResponse.json(
          {
            success: false,
            error: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found.'
          },
          { status: 404 }
        );
      }

      // Obtener trabajos del departamento
      const departmentJobs = jobs.filter((job: any) => job.category === department.id);
      const activeJobs = departmentJobs.filter((job: any) => job.status === 'active');

      // Calcular estadísticas
      const totalApplications = departmentJobs.reduce((sum: number, job: any) => sum + (job.applicant_count || 0), 0);
      const totalViews = departmentJobs.reduce((sum: number, job: any) => sum + (job.view_count || 0), 0);

      const enrichedDepartment = {
        ...department,
        // Actualizar conteo real de posiciones abiertas
        open_positions: activeJobs.length,
        total_jobs: departmentJobs.length,
        stats: {
          total_applications: totalApplications,
          total_views: totalViews,
          average_applications_per_job: departmentJobs.length > 0 ? Math.round(totalApplications / departmentJobs.length) : 0,
          average_views_per_job: departmentJobs.length > 0 ? Math.round(totalViews / departmentJobs.length) : 0,
          conversion_rate: totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0,
          jobs_by_level: {
            junior: departmentJobs.filter((job: any) => job.level === 'junior').length,
            mid: departmentJobs.filter((job: any) => job.level === 'mid').length,
            senior: departmentJobs.filter((job: any) => job.level === 'senior').length,
            director: departmentJobs.filter((job: any) => job.level === 'director').length
          },
          jobs_by_status: {
            active: departmentJobs.filter((job: any) => job.status === 'active').length,
            paused: departmentJobs.filter((job: any) => job.status === 'paused').length,
            closed: departmentJobs.filter((job: any) => job.status === 'closed').length,
            draft: departmentJobs.filter((job: any) => job.status === 'draft').length
          },
          jobs_by_type: {
            'full-time': departmentJobs.filter((job: any) => job.type === 'full-time').length,
            'part-time': departmentJobs.filter((job: any) => job.type === 'part-time').length,
            contract: departmentJobs.filter((job: any) => job.type === 'contract').length,
            internship: departmentJobs.filter((job: any) => job.type === 'internship').length
          }
        },
        jobs: departmentJobs
          .sort((a: any, b: any) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            slug: job.slug,
            level: job.level,
            type: job.type,
            status: job.status,
            location: job.location,
            posted_date: job.posted_date,
            deadline: job.deadline,
            applicant_count: job.applicant_count,
            view_count: job.view_count,
            featured: job.featured,
            urgent: job.urgent,
            short_description: job.short_description,
            tags: job.tags
          }))
      };

      return NextResponse.json({
        success: true,
        data: {
          department: enrichedDepartment
        }
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to get department: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve department.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'read')()
);

// PUT /api/admin/careers/departments/[id] - Actualizar departamento
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
      const body = await request.json();
      const {
        name,
        slug,
        description,
        detailed_description,
        icon,
        color,
        open_positions,
        total_employees,
        growth_rate,
        featured,
        required_skills,
        career_path,
        typical_projects,
        positions
      } = body;

      // Validar campos requeridos
      if (!name || !description) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Name and description are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const departments = careersData.departments || [];

      // Buscar departamento
      const departmentIndex = departments.findIndex((dept: any) => dept.id === id);
      if (departmentIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found.'
          },
          { status: 404 }
        );
      }

      const currentDepartment = departments[departmentIndex];

      // Verificar que el slug no existe en otro departamento
      if (slug && slug !== currentDepartment.slug) {
        const existingDepartment = departments.find((dept: any) => dept.slug === slug && dept.id !== id);
        if (existingDepartment) {
          return NextResponse.json(
            {
              success: false,
              error: 'SLUG_EXISTS',
              message: 'A department with this slug already exists.'
            },
            { status: 409 }
          );
        }
      }

      // Actualizar departamento
      const updatedDepartment = {
        ...currentDepartment,
        name,
        slug: slug || currentDepartment.slug,
        description,
        detailed_description: detailed_description !== undefined ? detailed_description : currentDepartment.detailed_description,
        icon: icon !== undefined ? icon : currentDepartment.icon,
        color: color !== undefined ? color : currentDepartment.color,
        open_positions: open_positions !== undefined ? Number(open_positions) : currentDepartment.open_positions,
        total_employees: total_employees !== undefined ? Number(total_employees) : currentDepartment.total_employees,
        growth_rate: growth_rate !== undefined ? growth_rate : currentDepartment.growth_rate,
        featured: featured !== undefined ? !!featured : currentDepartment.featured,
        required_skills: required_skills !== undefined ? 
          (Array.isArray(required_skills) ? required_skills : []) : currentDepartment.required_skills,
        career_path: career_path !== undefined ? career_path : currentDepartment.career_path,
        typical_projects: typical_projects !== undefined ? 
          (Array.isArray(typical_projects) ? typical_projects : []) : currentDepartment.typical_projects,
        positions: positions !== undefined ? 
          (Array.isArray(positions) ? positions : []) : currentDepartment.positions,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      departments[departmentIndex] = updatedDepartment;

      // Actualizar archivo
      const updatedData = {
        ...careersData,
        departments,
        metadata: {
          ...careersData.metadata,
          total_departments: departments.length,
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
        resource: 'career-department',
        resourceId: id,
        message: `Career department '${name}' updated`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          name, 
          slug: updatedDepartment.slug, 
          featured
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Department updated successfully.',
        data: { department: updatedDepartment }
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to update department: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update department.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'write')()
);

// DELETE /api/admin/careers/departments/[id] - Eliminar departamento
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos actuales
      const careersData = await jsonCrudSystem.readJSON(CAREERS_FILE, true);
      const departments = careersData.departments || [];
      const jobs = careersData.job_postings || [];

      // Buscar departamento
      const departmentIndex = departments.findIndex((dept: any) => dept.id === id);
      if (departmentIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found.'
          },
          { status: 404 }
        );
      }

      const department = departments[departmentIndex];

      // Verificar si hay trabajos asociados
      const departmentJobs = jobs.filter((job: any) => job.category === id);
      if (departmentJobs.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'DEPARTMENT_HAS_JOBS',
            message: `Cannot delete department. It has ${departmentJobs.length} associated job(s). Delete or reassign the jobs first.`,
            data: {
              associated_jobs: departmentJobs.map((job: any) => ({
                id: job.id,
                title: job.title,
                status: job.status
              }))
            }
          },
          { status: 409 }
        );
      }

      // Eliminar departamento
      departments.splice(departmentIndex, 1);

      // Actualizar archivo
      const updatedData = {
        ...careersData,
        departments,
        metadata: {
          ...careersData.metadata,
          total_departments: departments.length,
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
        resource: 'career-department',
        resourceId: id,
        message: `Career department '${department.name}' deleted`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          name: department.name, 
          slug: department.slug
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Department deleted successfully.'
      });

    } catch (error) {
      await logger.error('careers-api', `Failed to delete department: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete department.'
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