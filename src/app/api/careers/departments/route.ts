/**
 * API Careers Departments - Usando BaseAPIController Unificado
 * Endpoints REST para gestión de departamentos de careers
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { careerDepartmentService } from '@/lib/firestore/careers-service-unified';
import { validateCareerDepartment } from '@/lib/migration/validation-rules';
import type { CareerDepartment, CareerDepartmentData } from '@/lib/firestore/careers-service-unified';

// Configurar controlador usando factory unificado
const careerDepartmentsController = createController<CareerDepartment, CareerDepartmentData>(
  'careers',
  careerDepartmentService,
  {
    validator: (data: any) => validateCareerDepartment(data),
    searchFields: ['name', 'description', 'slug'],
    allowedFilters: ['featured', 'order']
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return careerDepartmentsController.handleGET(request);
}

export async function POST(request: NextRequest) {
  return careerDepartmentsController.handlePOST(request);
}