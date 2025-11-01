/**
 * API Career Application by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de aplicaciones
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { careerApplicationService } from '@/lib/firestore/careers-service-unified';
import { validateCareerApplication } from '@/lib/migration/validation-rules';
import type { CareerApplication, CareerApplicationData } from '@/lib/firestore/careers-service-unified';

// Reutilizar controlador configurado
const careerApplicationsController = new BaseAPIController<CareerApplication, CareerApplicationData>(
  careerApplicationService,
  {
    validator: (data: any) => validateCareerApplication(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return careerApplicationsController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return careerApplicationsController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return careerApplicationsController.handleDELETE(request, params.id);
}