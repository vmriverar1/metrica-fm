/**
 * API Route: /api/migrate-portfolio
 * Migrar datos reales del portfolio desde JSON a Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    }

    return getFirestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// POST /api/migrate-portfolio - Migrar datos del JSON a Firestore
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting portfolio migration from JSON to Firestore...');

    // Inicializar Firestore
    const db = await initializeFirebaseAdmin();

    // Leer el archivo JSON con los datos reales
    const portfolioPath = join(process.cwd(), 'public', 'json', 'dynamic-content', 'portfolio', 'content.json');
    const portfolioContent = readFileSync(portfolioPath, 'utf8');
    const portfolioData = JSON.parse(portfolioContent);

    console.log(`📊 Found ${portfolioData.categories?.length || 0} categories in JSON`);

    // 1. LIMPIAR DATOS EXISTENTES
    console.log('🧹 Cleaning existing Firestore data...');

    // Eliminar proyectos existentes
    const existingProjects = await db.collection('portfolio_projects').get();
    const projectDeletePromises = existingProjects.docs.map(doc => doc.ref.delete());
    await Promise.all(projectDeletePromises);
    console.log(`🗑️ Deleted ${existingProjects.docs.length} existing projects`);

    // Eliminar categorías existentes
    const existingCategories = await db.collection('portfolio_categories').get();
    const categoryDeletePromises = existingCategories.docs.map(doc => doc.ref.delete());
    await Promise.all(categoryDeletePromises);
    console.log(`🗑️ Deleted ${existingCategories.docs.length} existing categories`);

    // 2. MIGRAR CATEGORÍAS
    console.log('📁 Migrating categories...');
    const categoryPromises = portfolioData.categories.map(async (category: any) => {
      // Contar proyectos reales en esta categoría
      const projectsInCategory = category.projects?.length || 0;

      const categoryDoc = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        featured_image: category.featured_image,
        projects_count: projectsInCategory,
        total_investment: category.total_investment,
        total_area: category.total_area,
        featured: category.featured || false,
        order: category.order || 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('portfolio_categories').doc(category.id).set(categoryDoc);
      console.log(`✅ Migrated category: ${category.name} (${projectsInCategory} projects)`);
    });

    await Promise.all(categoryPromises);

    // 3. MIGRAR PROYECTOS
    console.log('🏗️ Migrating projects...');
    let totalProjects = 0;

    const projectPromises = portfolioData.categories.flatMap((category: any) => {
      return (category.projects || []).map(async (project: any) => {
        const projectId = project.id || `${category.id}_${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

        const projectDoc = {
          id: projectId,
          title: project.name,
          slug: projectId,
          description: project.description,
          short_description: project.description?.substring(0, 150) + '...',
          category_id: category.id,
          category: category.name,
          location: project.location,
          year: parseInt(project.year) || new Date().getFullYear(),
          status: project.status === 'completado' ? 'completed' : 'in_progress',
          client: project.client,
          services: project.services || [],
          area: project.area,
          budget: project.budget,
          duration: project.duration,
          featured: project.featured || false,
          images: project.images || [],
          featured_image: project.images?.[0]?.url || category.featured_image,
          gallery: (project.images || []).map((img: any) => ({
            url: img.url,
            alt: img.alt || img.title || project.name,
            caption: img.title || '',
            type: 'project_image'
          })),
          tags: [
            category.name.toLowerCase(),
            project.location?.toLowerCase().replace(/[^a-z0-9]+/g, ''),
            project.status
          ].filter(Boolean),
          metadata: {
            source: 'json_migration',
            original_category: category.id,
            services: project.services,
            investment: project.budget,
            timeline: project.duration
          },
          created_at: new Date(),
          updated_at: new Date()
        };

        await db.collection('portfolio_projects').doc(projectId).set(projectDoc);
        totalProjects++;
        console.log(`✅ Migrated project: ${project.name} (${category.name})`);
      });
    });

    await Promise.all(projectPromises);

    // 4. VERIFICAR MIGRACIÓN
    console.log('✅ Migration completed! Verifying...');
    const finalProjects = await db.collection('portfolio_projects').get();
    const finalCategories = await db.collection('portfolio_categories').get();

    console.log(`📊 Final count: ${finalCategories.docs.length} categories, ${finalProjects.docs.length} projects`);

    return NextResponse.json({
      success: true,
      message: 'Portfolio migration completed successfully',
      data: {
        categories_migrated: finalCategories.docs.length,
        projects_migrated: finalProjects.docs.length,
        total_expected: totalProjects,
        source: 'JSON file migration',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'MIGRATION_ERROR',
        message: 'Failed to migrate portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/migrate-portfolio - Verificar estado actual
export async function GET() {
  try {
    const db = await initializeFirebaseAdmin();

    const [projectsSnapshot, categoriesSnapshot] = await Promise.all([
      db.collection('portfolio_projects').get(),
      db.collection('portfolio_categories').get()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        current_projects: projectsSnapshot.docs.length,
        current_categories: categoriesSnapshot.docs.length,
        projects: projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          category: doc.data().category
        })),
        categories: categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          projects_count: doc.data().projects_count
        }))
      }
    });

  } catch (error) {
    console.error('Error checking current state:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'CHECK_ERROR',
        message: 'Failed to check current state'
      },
      { status: 500 }
    );
  }
}