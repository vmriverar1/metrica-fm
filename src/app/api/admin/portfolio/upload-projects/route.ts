import { NextRequest, NextResponse } from 'next/server';
import FirestoreCore from '@/lib/firestore/firestore-core';
import fs from 'fs';
import path from 'path';

const COLLECTION_NAME = 'portfolio_projects';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [UploadProjects] Iniciando carga masiva de proyectos...');

    // Leer todos los archivos JSON de la carpeta viviendas
    const viviendasFolderPath = path.join(process.cwd(), 'viviendas');

    if (!fs.existsSync(viviendasFolderPath)) {
      return NextResponse.json({
        success: false,
        message: 'Carpeta viviendas no encontrada'
      }, { status: 404 });
    }

    const jsonFiles = fs.readdirSync(viviendasFolderPath)
      .filter(file => file.endsWith('.json'));

    console.log(`📁 [UploadProjects] Encontrados ${jsonFiles.length} archivos JSON`);

    const results = {
      success: [],
      errors: [],
      total: jsonFiles.length
    };

    // Procesar cada archivo JSON
    for (const fileName of jsonFiles) {
      try {
        const filePath = path.join(viviendasFolderPath, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const projectData = JSON.parse(fileContent);

        console.log(`📄 [UploadProjects] Procesando: ${fileName} - ID: ${projectData.id}`);

        // Limpiar datos antes de subir
        const cleanData = { ...projectData };

        // Remover campos que no deberían estar en Firestore o que se manejan automáticamente
        delete cleanData.createdAt;
        delete cleanData.updatedAt;
        delete cleanData.category_info;

        // Convertir timestamps de formato firestore a objetos Date si es necesario
        if (cleanData.created_at && cleanData.created_at.seconds) {
          cleanData.created_at = new Date(cleanData.created_at.seconds * 1000);
        }
        if (cleanData.updated_at && cleanData.updated_at.seconds) {
          cleanData.updated_at = new Date(cleanData.updated_at.seconds * 1000);
        }

        // Subir a Firestore usando el ID del proyecto
        const result = await FirestoreCore.createDocumentWithId(
          COLLECTION_NAME,
          projectData.id,
          cleanData,
          true // merge = true para evitar sobrescribir si ya existe
        );

        if (result.success) {
          console.log(`✅ [UploadProjects] Proyecto subido: ${projectData.id}`);
          results.success.push({
            id: projectData.id,
            title: projectData.title,
            fileName
          });
        } else {
          console.error(`❌ [UploadProjects] Error subiendo ${projectData.id}:`, result.error);
          results.errors.push({
            id: projectData.id,
            fileName,
            error: result.error
          });
        }

      } catch (fileError) {
        console.error(`❌ [UploadProjects] Error procesando archivo ${fileName}:`, fileError);
        results.errors.push({
          fileName,
          error: fileError instanceof Error ? fileError.message : 'Error desconocido'
        });
      }
    }

    console.log(`🎉 [UploadProjects] Carga completada: ${results.success.length} éxitos, ${results.errors.length} errores`);

    return NextResponse.json({
      success: true,
      message: `Carga masiva completada: ${results.success.length}/${results.total} proyectos subidos`,
      data: results
    });

  } catch (error) {
    console.error('❌ [UploadProjects] Error general:', error);
    return NextResponse.json({
      success: false,
      message: 'Error en la carga masiva',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}