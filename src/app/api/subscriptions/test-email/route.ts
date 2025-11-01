import { NextRequest, NextResponse } from 'next/server';
import { SubscribersService } from '@/lib/firestore/subscribers-service';
import { EmailService } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    // Obtener configuración de emails
    const config = await SubscribersService.getEmailConfig();

    if (!config || config.recipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No hay destinatarios configurados'
      }, { status: 400 });
    }

    // Configuración del email de prueba
    const emailConfig = {
      to: config.recipients,
      subject: 'Prueba de Email - Sistema de Suscripciones',
      replyTo: 'noreply@metrica-dip.com'
    };

    // Template del email de prueba
    const emailTemplate = {
      type: 'custom',
      title: '✅ Email de Prueba',
      message: 'Este es un email de prueba del sistema de suscripciones de Métrica FM.',
      fields: [
        {
          label: 'Estado',
          value: 'Sistema funcionando correctamente'
        },
        {
          label: 'Fecha y Hora',
          value: new Date().toLocaleString('es-ES', {
            dateStyle: 'full',
            timeStyle: 'medium'
          })
        },
        {
          label: 'Destinatarios',
          value: config.recipients.join(', ')
        }
      ],
      metadata: {
        type: 'test',
        timestamp: new Date().toISOString(),
        recipients_count: config.recipients.length
      }
    };

    // Enviar email
    const result = await EmailService.sendEmail(emailConfig, emailTemplate);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Error al enviar el email'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      recipients: config.recipients,
      messageId: result.messageId
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}
