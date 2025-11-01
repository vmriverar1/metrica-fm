import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [TEMP API] Reading clientes logos from Firestore...');

    const result = await FirestoreCore.getDocumentById('pages', 'clientes');

    if (result.success && result.data) {
      const logos = result.data.clientes?.logos || [];

      console.log(`📋 [TEMP API] Found ${logos.length} logos`);
      console.log('📋 [TEMP API] Logos:', JSON.stringify(logos, null, 2));

      return NextResponse.json({
        success: true,
        data: {
          logos: logos,
          count: logos.length
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No clientes data found'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ [TEMP API] Error reading logos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read logos' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('💾 [TEMP API] Updating clientes logos in Firestore...');

    const { logos } = await req.json();

    if (!Array.isArray(logos)) {
      return NextResponse.json(
        { success: false, error: 'logos must be an array' },
        { status: 400 }
      );
    }

    // Get current document
    const currentResult = await FirestoreCore.getDocumentById('pages', 'clientes');
    const currentData = currentResult.success ? currentResult.data : {};

    // Update only the logos field
    const updatedData = {
      ...currentData,
      clientes: {
        ...currentData.clientes,
        logos: logos
      },
      updatedAt: new Date()
    };

    const result = await FirestoreCore.createDocumentWithId(
      'pages',
      'clientes',
      updatedData
    );

    if (result.success) {
      console.log(`✅ [TEMP API] Successfully updated ${logos.length} logos`);
      return NextResponse.json({
        success: true,
        message: `Updated ${logos.length} logos successfully`,
        data: { count: logos.length }
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to update logos' },
      { status: 500 }
    );

  } catch (error) {
    console.error('❌ [TEMP API] Error updating logos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update logos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('➕ [TEMP API] Adding new logos to Firestore...');

    const { newLogos } = await req.json();

    if (!Array.isArray(newLogos)) {
      return NextResponse.json(
        { success: false, error: 'newLogos must be an array' },
        { status: 400 }
      );
    }

    // Get current logos
    const currentResult = await FirestoreCore.getDocumentById('pages', 'clientes');
    const currentData = currentResult.success ? currentResult.data : {};
    const existingLogos = currentData.clientes?.logos || [];

    // Merge logos (avoid duplicates by url)
    const existingUrls = new Set(existingLogos.map((l: any) => l.url));
    const uniqueNewLogos = newLogos.filter((logo: any) => !existingUrls.has(logo.url));

    const updatedLogos = [...existingLogos, ...uniqueNewLogos];

    // Update document
    const updatedData = {
      ...currentData,
      clientes: {
        ...currentData.clientes,
        logos: updatedLogos
      },
      updatedAt: new Date()
    };

    const result = await FirestoreCore.createDocumentWithId(
      'pages',
      'clientes',
      updatedData
    );

    if (result.success) {
      console.log(`✅ [TEMP API] Added ${uniqueNewLogos.length} new logos (${newLogos.length - uniqueNewLogos.length} duplicates skipped)`);
      return NextResponse.json({
        success: true,
        message: `Added ${uniqueNewLogos.length} new logos`,
        data: {
          added: uniqueNewLogos.length,
          skipped: newLogos.length - uniqueNewLogos.length,
          total: updatedLogos.length
        }
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to add logos' },
      { status: 500 }
    );

  } catch (error) {
    console.error('❌ [TEMP API] Error adding logos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add logos' },
      { status: 500 }
    );
  }
}