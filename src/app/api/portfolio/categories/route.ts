import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin-safe';

export async function GET(request: NextRequest) {
  try {
    const { db } = await getFirebaseAdmin();

    if (!db) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        source: 'fallback'
      });
    }

    const categoriesSnapshot = await db.collection('portfolio_categories').get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
      source: 'firestore'
    });

  } catch (error) {
    console.error('Error fetching portfolio categories:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0
    }, { status: 500 });
  }
}
