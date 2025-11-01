import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG API] Investigating portfolio categories data structure');

    // Get all categories from portfolio_categories collection
    const result = await FirestoreCore.getDocuments('portfolio_categories');

    console.log('📦 [DEBUG API] Raw Firestore response:', {
      success: result.success,
      message: result.message,
      error: result.error,
      dataType: typeof result.data,
      isArray: Array.isArray(result.data),
      dataLength: result.data?.length || 'undefined'
    });

    if (result.success && result.data) {
      console.log('📋 [DEBUG API] Categories data analysis:');
      console.log('  - Total categories found:', result.data.length);

      result.data.forEach((category, index) => {
        console.log(`  - Category ${index + 1}:`, {
          id: category.id,
          keys: Object.keys(category),
          structure: category
        });
      });

      // Return detailed analysis
      return NextResponse.json({
        success: true,
        debug: 'Portfolio Categories Data Structure Analysis',
        firestore_response: {
          success: result.success,
          message: result.message,
          data_type: typeof result.data,
          is_array: Array.isArray(result.data),
          categories_count: result.data.length
        },
        categories_sample: result.data.map(cat => ({
          id: cat.id,
          keys: Object.keys(cat),
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          icon: cat.icon,
          full_object: cat
        })),
        raw_data: result.data
      });
    } else {
      console.warn('⚠️ [DEBUG API] No categories found or error occurred');
      return NextResponse.json({
        success: false,
        debug: 'Portfolio Categories Data Structure Analysis',
        firestore_response: {
          success: result.success,
          message: result.message,
          error: result.error
        },
        issue: 'No categories data available'
      });
    }
  } catch (error) {
    console.error('❌ [DEBUG API] Error investigating categories:', error);
    return NextResponse.json({
      success: false,
      debug: 'Portfolio Categories Data Structure Analysis',
      error: error instanceof Error ? error.message : 'Unknown error',
      issue: 'API execution failed'
    });
  }
}