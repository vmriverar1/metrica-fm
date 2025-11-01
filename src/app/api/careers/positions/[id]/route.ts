/**
 * API Career Position by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de posiciones
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import { validateCareerPosition } from '@/lib/migration/validation-rules';
import type { CareerPosition, CareerPositionData } from '@/lib/firestore/careers-service-unified';

// Reutilizar controlador configurado
const careerPositionsController = new BaseAPIController<CareerPosition, CareerPositionData>(
  careerPositionService,
  {
    validator: (data: any) => validateCareerPosition(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return careerPositionsController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return careerPositionsController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return careerPositionsController.handleDELETE(request, params.id);
}