/**
 * API Route: /api/admin/careers/departments
 * CRUD para departamentos de careers
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CAREERS_FILE_PATH = path.join(process.cwd(), 'public/json/dynamic-content/careers/content.json');

// GET /api/admin/careers/departments - Listar departamentos
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeStats = searchParams.get('include_stats') === 'true';
      const search = searchParams.get('search');
      const featured = searchParams.get('featured');

      // Leer datos de careers
      const fileContent = await fs.readFile(CAREERS_FILE_PATH, 'utf-8');
      const careersData = JSON.parse(fileContent);
      let departments = careersData.departments || [];
      const jobs = careersData.job_postings || [];

      // Filtrar por búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        departments = departments.filter((dept: any) =>
          dept.name?.toLowerCase().includes(searchLower) ||
          dept.description?.toLowerCase().includes(searchLower) ||
          dept.detailed_description?.toLowerCase().includes(searchLower) ||
          dept.required_skills?.some((skill: string) => skill.toLowerCase().includes(searchLower)) ||
          dept.positions?.some((pos: string) => pos.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por featured
      if (featured !== null && featured !== undefined) {
        const isFeatured = featured === 'true';
        departments = departments.filter((dept: any) => !!dept.featured === isFeatured);
      }

      // Enriquecer con estadísticas si se solicita
      const enrichedDepartments = departments.map((dept: any) => {
        const departmentJobs = jobs.filter((job: any) => job.category === dept.id);
        const activeJobs = departmentJobs.filter((job: any) => job.status === 'active');
        
        const baseData = {
          ...dept,
          // Actualizar conteo real de posiciones abiertas
          open_positions: activeJobs.length,
          total_jobs: departmentJobs.length
        };

        if (includeStats) {
          const totalApplications = departmentJobs.reduce((sum: number, job: any) => sum + (job.applicant_count || 0), 0);
          const totalViews = departmentJobs.reduce((sum: number, job: any) => sum + (job.view_count || 0), 0);
          
          return {
            ...baseData,
            stats: {
              total_applications: totalApplications,
              total_views: totalViews,
              average_applications_per_job: departmentJobs.length > 0 ? Math.round(totalApplications / departmentJobs.length) : 0,
              average_views_per_job: departmentJobs.length > 0 ? Math.round(totalViews / departmentJobs.length) : 0,
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
              }
            },
            recent_jobs: activeJobs
              .sort((a: any, b: any) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
              .slice(0, 3)
              .map((job: any) => ({
                id: job.id,
                title: job.title,
                slug: job.slug,
                level: job.level,
                type: job.type,
                posted_date: job.posted_date,
                applicant_count: job.applicant_count,
                featured: job.featured,
                urgent: job.urgent
              }))
          };
        }

        return baseData;
      });

      return NextResponse.json({
        success: true,
        data: {
          departments: enrichedDepartments,
          summary: {
            total_departments: departments.length,
            total_open_positions: departments.reduce((sum: number, dept: any) => sum + (dept.open_positions || 0), 0),
            featured_departments: departments.filter((dept: any) => dept.featured).length,
            total_employees: departments.reduce((sum: number, dept: any) => sum + (dept.total_employees || 0), 0)
          }
        }
      });

    } catch (error) {
      console.error('careers-api', 'Failed to list departments', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve departments.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('careers', 'read')()
);

// POST /api/admin/careers/departments - Crear departamento
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        name,
        slug,
        description,
        detailed_description,
        icon = 'Briefcase',
        color = '#6B7280',
        open_positions = 0,
        total_employees = 0,
        featured = false,
        required_skills = [],
        career_path,
        typical_projects = [],
        positions = []
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
      const fileContent = await fs.readFile(CAREERS_FILE_PATH, 'utf-8');
      const careersData = JSON.parse(fileContent);
      const departments = careersData.departments || [];

      // Generar slug si no se proporciona
      const departmentSlug = slug || name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el slug no existe
      if (departments.some((dept: any) => dept.slug === departmentSlug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A department with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Crear nuevo departamento
      const newDepartment = {
        id: `dept-${crypto.randomBytes(6).toString('hex')}`,
        name,
        slug: departmentSlug,
        description,
        detailed_description: detailed_description || description,
        icon,
        color,
        open_positions: Number(open_positions),
        total_employees: Number(total_employees),
        featured: !!featured,
        required_skills: Array.isArray(required_skills) ? required_skills : [],
        career_path: career_path || null,
        typical_projects: Array.isArray(typical_projects) ? typical_projects : [],
        positions: Array.isArray(positions) ? positions : [],
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      departments.push(newDepartment);

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

      await fs.writeFile(CAREERS_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');

      // Log de auditoría (simplified)
      console.log(`Career department '${name}' created by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Department created successfully.',
        data: { department: newDepartment }
      }, { status: 201 });

    } catch (error) {
      console.error('careers-api', 'Failed to create department', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create department.'
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