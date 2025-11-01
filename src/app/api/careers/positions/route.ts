/**
 * API Career Positions - Usando BaseAPIController
 * Endpoints REST para gestión de posiciones de trabajo
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import { validateCareerPosition } from '@/lib/migration/validation-rules';
import type { CareerPosition, CareerPositionData } from '@/lib/firestore/careers-service-unified';

// Configurar controlador usando factory unificado
const careerPositionsController = createController<CareerPosition, CareerPositionData>(
  'careers',
  careerPositionService,
  {
    validator: (data: any) => validateCareerPosition(data),
    searchFields: ['title', 'description', 'short_description', 'requirements.skills', 'location.city'],
    allowedFilters: ['department_id', 'featured', 'urgent', 'status', 'employment_type', 'experience_level', 'location.city'],
    defaultLimit: 15,
    maxLimit: 50
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return careerPositionsController.handleGET(request);
}

export async function POST(request: NextRequest) {
  return careerPositionsController.handlePOST(request);
}