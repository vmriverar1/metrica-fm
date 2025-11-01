/**
 * Servicio reutilizable para envío de emails usando Gmail
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EmailConfig, EmailTemplate, EmailField } from '@/types/email';

// Configuración de Gmail
const GMAIL_CONFIG = {
  user: 'jmorales@metrica-dip.com',
  pass: 'chsb ofcu qlrq lhwf'
};

/**
 * Clase para gestionar el envío de emails
 */
export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Inicializa el transporter de Nodemailer
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_CONFIG.user,
          pass: GMAIL_CONFIG.pass
        }
      });
    }
    return this.transporter;
  }

  /**
   * Genera el HTML del email basado en el template
   */
  private static generateEmailHTML(template: EmailTemplate): string {
    const { type, fields, metadata } = template;

    // Encabezado común
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #003F6F 0%, #005A9C 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .field-group {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .field-group:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .field-label {
            font-weight: 600;
            color: #003F6F;
            font-size: 14px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field-value {
            font-size: 16px;
            color: #333;
            word-wrap: break-word;
          }
          .field-value.email {
            color: #00A8E8;
          }
          .field-value.phone {
            color: #003F6F;
            font-weight: 500;
          }
          .field-value.url a {
            color: #00A8E8;
            text-decoration: none;
          }
          .field-value.url a:hover {
            text-decoration: underline;
          }
          .metadata {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            font-size: 12px;
            color: #666;
          }
          .metadata-item {
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .footer strong {
            color: #003F6F;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;

    // Encabezado según tipo
    const headers = {
      contact: { title: 'Nuevo Mensaje de Contacto', subtitle: 'Formulario del Sitio Web' },
      newsletter: { title: 'Nueva Suscripción', subtitle: 'Newsletter' },
      quote: { title: 'Solicitud de Cotización', subtitle: 'Formulario de Cotización' },
      support: { title: 'Solicitud de Soporte', subtitle: 'Centro de Ayuda' },
      custom: { title: 'Nuevo Mensaje', subtitle: 'Formulario Web' }
    };

    const header = headers[type] || headers.custom;

    html += `
      <div class="header">
        <h1>${header.title}</h1>
        <p>${header.subtitle}</p>
      </div>
    `;

    // Campos del formulario
    fields.forEach((field: EmailField) => {
      const cssClass = field.type || 'text';
      let valueHtml = '';

      if (field.type === 'url') {
        valueHtml = `<a href="${field.value}" target="_blank">${field.value}</a>`;
      } else if (field.type === 'email') {
        valueHtml = `<a href="mailto:${field.value}">${field.value}</a>`;
      } else if (field.type === 'phone') {
        valueHtml = `<a href="tel:${field.value}">${field.value}</a>`;
      } else {
        valueHtml = String(field.value);
      }

      html += `
        <div class="field-group">
          <div class="field-label">${field.label}</div>
          <div class="field-value ${cssClass}">${valueHtml}</div>
        </div>
      `;
    });

    // Metadata si existe
    if (metadata && Object.keys(metadata).length > 0) {
      html += `
        <div class="metadata">
          <strong>Información adicional:</strong>
      `;

      Object.entries(metadata).forEach(([key, value]) => {
        html += `<div class="metadata-item"><strong>${key}:</strong> ${value}</div>`;
      });

      html += '</div>';
    }

    // Footer
    const timestamp = new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      dateStyle: 'long',
      timeStyle: 'short'
    });

    html += `
          <div class="footer">
            <p><strong>Métrica FM</strong> - Dirección Integral de Proyectos</p>
            <p>Mensaje recibido el ${timestamp}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Genera el texto plano del email (fallback)
   */
  private static generateEmailText(template: EmailTemplate): string {
    const { type, fields, metadata } = template;

    let text = `=== ${type.toUpperCase()} ===\n\n`;

    fields.forEach((field: EmailField) => {
      text += `${field.label}:\n${field.value}\n\n`;
    });

    if (metadata && Object.keys(metadata).length > 0) {
      text += '\n--- Información adicional ---\n';
      Object.entries(metadata).forEach(([key, value]) => {
        text += `${key}: ${value}\n`;
      });
    }

    text += `\n--- Métrica FM ---\nFecha: ${new Date().toLocaleString('es-PE')}`;

    return text;
  }

  /**
   * Envía un email con la configuración y template especificados
   */
  static async sendEmail(config: EmailConfig, template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.getTransporter();

      // Generar HTML y texto
      const html = this.generateEmailHTML(template);
      const text = this.generateEmailText(template);

      // Configurar el email
      const mailOptions = {
        from: `"Métrica FM Web" <${GMAIL_CONFIG.user}>`,
        to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
        subject: config.subject,
        replyTo: config.replyTo,
        cc: config.cc ? (Array.isArray(config.cc) ? config.cc.join(', ') : config.cc) : undefined,
        bcc: config.bcc ? (Array.isArray(config.bcc) ? config.bcc.join(', ') : config.bcc) : undefined,
        html: html,
        text: text
      };

      // Enviar email
      const info = await transporter.sendMail(mailOptions);

      console.log('✅ [EMAIL] Enviado exitosamente:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error: any) {
      console.error('❌ [EMAIL] Error al enviar:', error);

      return {
        success: false,
        error: error.message || 'Error desconocido al enviar email'
      };
    }
  }

  /**
   * Verifica la conexión con Gmail
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('✅ [EMAIL] Conexión verificada con Gmail');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Error al verificar conexión:', error);
      return false;
    }
  }
}
