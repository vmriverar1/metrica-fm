/**
 * API Portfolio Category by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de categorías
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { portfolioCategoryService } from '@/lib/firestore/portfolio-service-unified';
import { validatePortfolioCategory } from '@/lib/migration/validation-rules';
import type { PortfolioCategory, PortfolioCategoryData } from '@/lib/firestore/portfolio-service-unified';

// Reutilizar controlador configurado
const portfolioCategoriesController = new BaseAPIController<PortfolioCategory, PortfolioCategoryData>(
  portfolioCategoryService,
  {
    validator: (data: any) => validatePortfolioCategory(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioCategoriesController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioCategoriesController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return portfolioCategoriesController.handleDELETE(request, params.id);
}