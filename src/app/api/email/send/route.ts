import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/email-service';
import { SendEmailRequest, SendEmailResponse } from '@/types/email';

export async function POST(req: NextRequest): Promise<NextResponse<SendEmailResponse>> {
  try {
    const body: SendEmailRequest = await req.json();

    // Validar que existan los datos requeridos
    if (!body.config || !body.template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan datos requeridos: config y template son obligatorios'
        },
        { status: 400 }
      );
    }

    // Validar config
    if (!body.config.to || !body.config.subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Config incompleto: to y subject son obligatorios'
        },
        { status: 400 }
      );
    }

    // Validar template
    if (!body.template.type || !Array.isArray(body.template.fields)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template incompleto: type y fields son obligatorios'
        },
        { status: 400 }
      );
    }

    console.log('📧 [API] Enviando email...');
    console.log('   - Para:', body.config.to);
    console.log('   - Asunto:', body.config.subject);
    console.log('   - Tipo:', body.template.type);
    console.log('   - Campos:', body.template.fields.length);

    // Enviar email
    const result = await EmailService.sendEmail(body.config, body.template);

    if (result.success) {
      console.log('✅ [API] Email enviado exitosamente');
      return NextResponse.json({
        success: true,
        messageId: result.messageId
      });
    } else {
      console.error('❌ [API] Error al enviar email:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al enviar email'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ [API] Error procesando solicitud:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
