/**
 * API Career Applications - Usando BaseAPIController
 * Endpoints REST para gestión de aplicaciones de trabajo
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { careerApplicationService } from '@/lib/firestore/careers-service-unified';
import { validateCareerApplication } from '@/lib/migration/validation-rules';
import { APIResponse } from '@/lib/api/unified-response';
import type { CareerApplication, CareerApplicationData } from '@/lib/firestore/careers-service-unified';

// Configurar controlador usando factory unificado
const careerApplicationsController = createController<CareerApplication, CareerApplicationData>(
  'careers',
  careerApplicationService,
  {
    validator: (data: any) => validateCareerApplication(data),
    searchFields: ['applicant.name', 'applicant.email', 'position_id'],
    allowedFilters: ['position_id', 'status', 'applicant.location.city'],
    defaultLimit: 20,
    maxLimit: 100
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return careerApplicationsController.handleGET(request);
}

export async function POST(request: NextRequest) {
  // Usar método especializado que incrementa contadores con respuestas unificadas
  try {
    const body = await request.json();
    const result = await careerApplicationService.createApplication(body);

    if (result.success) {
      return APIResponse.success(
        { id: result.data },
        result.message,
        { application: true, position_id: body.position_id },
        201
      );
    } else {
      return APIResponse.badRequest(result.message, result.error);
    }
  } catch (error) {
    console.error('Career application creation error:', error);
    return APIResponse.error(
      'APPLICATION_FAILED',
      error instanceof Error ? error.message : 'Unknown application error',
      500
    );
  }
}