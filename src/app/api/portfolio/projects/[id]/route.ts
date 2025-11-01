/**
 * API Portfolio Project by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de proyectos
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import { validatePortfolioProject } from '@/lib/migration/validation-rules';
import type { PortfolioProject, PortfolioProjectData } from '@/lib/firestore/portfolio-service-unified';

// Reutilizar controlador configurado
const portfolioProjectsController = new BaseAPIController<PortfolioProject, PortfolioProjectData>(
  portfolioProjectService,
  {
    validator: (data: any) => validatePortfolioProject(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioProjectsController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioProjectsController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioProjectsController.handleDELETE(request, params.id);
}