/**
 * API Career Department by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de departamentos
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { careerDepartmentService } from '@/lib/firestore/careers-service-unified';
import { validateCareerDepartment } from '@/lib/migration/validation-rules';
import type { CareerDepartment, CareerDepartmentData } from '@/lib/firestore/careers-service-unified';

// Reutilizar controlador configurado
const careerDepartmentsController = new BaseAPIController<CareerDepartment, CareerDepartmentData>(
  careerDepartmentService,
  {
    validator: (data: any) => validateCareerDepartment(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return careerDepartmentsController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return careerDepartmentsController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return careerDepartmentsController.handleDELETE(request, params.id);
}