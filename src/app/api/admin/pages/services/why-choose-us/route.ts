import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(req: NextRequest) {
  try {
    // Intentar cargar datos desde Firestore
    const result = await FirestoreCore.getDocumentById('pages', 'services');

    if (result.success && result.data?.contact_form?.why_choose_us) {
      return NextResponse.json({
        success: true,
        data: result.data.contact_form.why_choose_us
      });
    }

    // Datos por defecto si no existen en Firestore
    const defaultData = {
      title: '¿Por qué Métrica FM?',
      benefits: [
        {
          id: 'experiencia',
          text: '10+ años de experiencia',
          icon: 'CheckCircle2'
        },
        {
          id: 'certificacion',
          text: 'ISO 9001 Certificado',
          icon: 'CheckCircle2'
        },
        {
          id: 'proyectos',
          text: '300+ proyectos exitosos',
          icon: 'CheckCircle2'
        },
        {
          id: 'satisfaccion',
          text: '99% satisfacción del cliente',
          icon: 'CheckCircle2'
        },
        {
          id: 'respuesta',
          text: 'Respuesta en 48 horas',
          icon: 'CheckCircle2'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: defaultData
    });
  } catch (error) {
    console.error('Error fetching why-choose-us data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch why-choose-us data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const whyChooseUsData = await req.json();

    // Obtener datos actuales de services
    const currentResult = await FirestoreCore.getDocumentById('pages', 'services');
    const currentData = currentResult.success ? currentResult.data : {};

    // Actualizar solo la sección why_choose_us
    const updatedData = {
      ...currentData,
      contact_form: {
        ...currentData.contact_form,
        why_choose_us: whyChooseUsData
      },
      updatedAt: new Date()
    };

    // Guardar en Firestore
    const result = await FirestoreCore.createDocumentWithId(
      'pages',
      'services',
      updatedData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Why Choose Us data saved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save why-choose-us data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving why-choose-us data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save why-choose-us data' },
      { status: 500 }
    );
  }
}