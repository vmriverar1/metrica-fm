import { NextRequest, NextResponse } from 'next/server';
import { SubscribersService } from '@/lib/firestore/subscribers-service';
import { EmailService } from '@/lib/email/email-service';
import { DataSanitizer } from '@/lib/utils/data-sanitizer';
import { Timestamp } from 'firebase/firestore';
import RECAPTCHA_CONFIG from '@/lib/recaptcha-config';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateCompany,
  validateMessage,
  validateURL
} from '@/lib/validation';

/**
 * Verifica el token de reCAPTCHA con la API de Google
 */
async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const response = await fetch(RECAPTCHA_CONFIG.VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_CONFIG.SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Token de reCAPTCHA inválido'
      };
    }

    // Verificar el score (0.0 = bot, 1.0 = humano)
    if (data.score < RECAPTCHA_CONFIG.MIN_SCORE) {
      return {
        success: false,
        score: data.score,
        error: `Score de reCAPTCHA muy bajo: ${data.score}`
      };
    }

    return {
      success: true,
      score: data.score
    };
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return {
      success: false,
      error: 'Error al verificar reCAPTCHA'
    };
  }
}

/**
 * Valida los campos del formulario usando validadores anti-spam de Fase 1
 */
function validateFormFields(formData: any, formType: string): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validar según tipo de formulario
  switch (formType) {
    case 'contact':
      // ContactForm: nombre, apellido, email, telefono, empresa, mensaje
      if (formData.nombre) {
        const result = validateName(formData.nombre);
        if (!result.valid && result.error) errors.nombre = result.error;
      }
      if (formData.apellido) {
        const result = validateName(formData.apellido);
        if (!result.valid && result.error) errors.apellido = result.error;
      }
      if (formData.email) {
        const result = validateEmail(formData.email);
        if (!result.valid && result.error) errors.email = result.error;
      }
      if (formData.telefono) {
        const result = validatePhone(formData.telefono);
        if (!result.valid && result.error) errors.telefono = result.error;
      }
      if (formData.empresa) {
        const result = validateCompany(formData.empresa);
        if (!result.valid && result.error) errors.empresa = result.error;
      }
      if (formData.mensaje) {
        const result = validateMessage(formData.mensaje, 10, 1000);
        if (!result.valid && result.error) errors.mensaje = result.error;
      }
      break;

    case 'smart-contact':
      // SmartContactForm: name, email, phone, company, message
      if (formData.name) {
        const result = validateName(formData.name);
        if (!result.valid && result.error) errors.name = result.error;
      }
      if (formData.email) {
        const result = validateEmail(formData.email);
        if (!result.valid && result.error) errors.email = result.error;
      }
      if (formData.phone) {
        const result = validatePhone(formData.phone);
        if (!result.valid && result.error) errors.phone = result.error;
      }
      if (formData.company) {
        const result = validateCompany(formData.company);
        if (!result.valid && result.error) errors.company = result.error;
      }
      if (formData.message) {
        const result = validateMessage(formData.message, 10, 1000);
        if (!result.valid && result.error) errors.message = result.error;
      }
      break;

    case 'denuncia':
      // DenunciaForm: nombre, email, telefono (si no es anónimo), descripcion
      if (!formData.anonimo) {
        if (formData.nombre) {
          const result = validateName(formData.nombre);
          if (!result.valid && result.error) errors.nombre = result.error;
        }
        if (formData.email) {
          const result = validateEmail(formData.email);
          if (!result.valid && result.error) errors.email = result.error;
        }
        if (formData.telefono) {
          const result = validatePhone(formData.telefono);
          if (!result.valid && result.error) errors.telefono = result.error;
        }
      }
      if (formData.descripcion) {
        const result = validateMessage(formData.descripcion, 20, 2000);
        if (!result.valid && result.error) errors.descripcion = result.error;
      }
      break;

    case 'application':
      // ApplicationForm: firstName, lastName, email, phone, location, linkedin, portfolio, motivationLetter
      if (formData.firstName) {
        const result = validateName(formData.firstName);
        if (!result.valid && result.error) errors.firstName = result.error;
      }
      if (formData.lastName) {
        const result = validateName(formData.lastName);
        if (!result.valid && result.error) errors.lastName = result.error;
      }
      if (formData.email) {
        const result = validateEmail(formData.email);
        if (!result.valid && result.error) errors.email = result.error;
      }
      if (formData.phone) {
        const result = validatePhone(formData.phone);
        if (!result.valid && result.error) errors.phone = result.error;
      }
      if (formData.location) {
        const result = validateCompany(formData.location);
        if (!result.valid && result.error) errors.location = result.error;
      }
      if (formData.linkedin) {
        const result = validateURL(formData.linkedin, 'linkedin');
        if (!result.valid && result.error) errors.linkedin = result.error;
      }
      if (formData.portfolio) {
        const result = validateURL(formData.portfolio, 'generic');
        if (!result.valid && result.error) errors.portfolio = result.error;
      }
      if (formData.motivationLetter) {
        const result = validateMessage(formData.motivationLetter, 50, 1000);
        if (!result.valid && result.error) errors.motivationLetter = result.error;
      }
      break;

    default:
      // Para otros tipos de formulario, validar campos comunes
      if (formData.email) {
        const result = validateEmail(formData.email);
        if (!result.valid && result.error) errors.email = result.error;
      }
      if (formData.name || formData.nombre) {
        const nameField = formData.name || formData.nombre;
        const result = validateName(nameField);
        if (!result.valid && result.error) {
          errors[formData.name ? 'name' : 'nombre'] = result.error;
        }
      }
      break;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, formType, requiredFields = [], recaptchaToken } = body;

    // Validar que vengan los datos
    if (!formData || !formType) {
      return NextResponse.json({
        success: false,
        error: 'Datos incompletos'
      }, { status: 400 });
    }

    // Verificar reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json({
        success: false,
        error: 'Token de reCAPTCHA no proporcionado'
      }, { status: 400 });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResult.success) {
      console.warn('Verificación de reCAPTCHA fallida:', recaptchaResult.error);
      return NextResponse.json({
        success: false,
        error: 'Verificación de seguridad fallida. Por favor intenta de nuevo.',
        details: recaptchaResult.error
      }, { status: 403 });
    }

    console.log('reCAPTCHA verificado exitosamente. Score:', recaptchaResult.score);

    // FASE 4: Validación anti-spam de campos usando validadores de Fase 1
    const validationResult = validateFormFields(formData, formType);

    if (!validationResult.valid) {
      // Logging de intento con datos inválidos
      console.warn('⚠️ Intento de envío con datos inválidos detectado:', {
        formType,
        errors: validationResult.errors,
        timestamp: new Date().toISOString(),
        recaptchaScore: recaptchaResult.score,
        // No logear datos sensibles completos, solo los campos con error
        invalidFields: Object.keys(validationResult.errors)
      });

      return NextResponse.json({
        success: false,
        error: 'Los datos del formulario contienen información inválida o sospechosa',
        errors: validationResult.errors
      }, { status: 400 });
    }

    console.log('✅ Validación anti-spam exitosa');

    // Sanitizar y validar datos
    const sanitizationResult = DataSanitizer.prepareForStorage(formData, requiredFields);

    if (!sanitizationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos inválidos',
        errors: sanitizationResult.errors
      }, { status: 400 });
    }

    const sanitizedData = sanitizationResult.data;

    // Extraer email del formulario (puede tener diferentes nombres de campo)
    const email = sanitizedData.email ||
                  sanitizedData.correo ||
                  sanitizedData.mail ||
                  sanitizedData.user_email;

    if (!email || !DataSanitizer.isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido o no proporcionado'
      }, { status: 400 });
    }

    // Extraer nombre (puede tener diferentes formatos)
    const name = sanitizedData.name ||
                 sanitizedData.nombre ||
                 `${sanitizedData.firstName || ''} ${sanitizedData.lastName || ''}`.trim() ||
                 sanitizedData.company ||
                 'Contacto';

    // 1. Guardar en la colección de suscriptores
    try {
      // Verificar si ya existe el suscriptor
      const existingSubscriber = await SubscribersService.getByEmail(email);

      if (!existingSubscriber) {
        // Crear nuevo suscriptor
        await SubscribersService.add({
          email: email,
          name: name,
          status: 'active',
          source: formType,
          tags: [formType],
          metadata: {
            ...sanitizedData,
            form_type: formType,
            submitted_at: new Date().toISOString()
          }
        });
      } else {
        // Actualizar metadata del suscriptor existente
        const currentTags = existingSubscriber.tags || [];
        const newTags = Array.from(new Set([...currentTags, formType]));

        await SubscribersService.update(existingSubscriber.id, {
          tags: newTags,
          metadata: {
            ...(existingSubscriber.metadata || {}),
            [`${formType}_${Date.now()}`]: {
              ...sanitizedData,
              form_type: formType,
              submitted_at: new Date().toISOString()
            }
          }
        });
      }
    } catch (error) {
      console.error('Error guardando suscriptor:', error);
      // Continuar aunque falle el guardado en DB
    }

    // 2. Preparar y enviar email
    try {
      // Obtener configuración de destinatarios
      const config = await SubscribersService.getEmailConfig();

      if (!config || config.recipients.length === 0) {
        console.warn('No hay destinatarios configurados para enviar el email');
        // Continuar aunque no haya destinatarios
        return NextResponse.json({
          success: true,
          message: 'Formulario recibido correctamente',
          warning: 'Email no enviado: no hay destinatarios configurados'
        });
      }

      // Configuración del email
      const emailConfig = {
        to: config.recipients,
        subject: `Nuevo ${getFormTypeLabel(formType)} - ${name}`,
        replyTo: email
      };

      // Convertir campos del formulario a formato de email
      const fields = Object.entries(sanitizedData).map(([key, value]) => ({
        label: formatFieldLabel(key),
        value: String(value)
      }));

      // Template del email
      const emailTemplate = {
        type: 'contact' as const,
        title: `Nuevo ${getFormTypeLabel(formType)}`,
        message: `Has recibido un nuevo mensaje desde el formulario de ${getFormTypeLabel(formType).toLowerCase()}.`,
        fields: fields,
        metadata: {
          form_type: formType,
          timestamp: new Date().toISOString(),
          source: 'website'
        }
      };

      // Enviar email
      const result = await EmailService.sendEmail(emailConfig, emailTemplate);

      if (!result.success) {
        console.error('Error enviando email:', result.error);
        return NextResponse.json({
          success: true,
          message: 'Formulario recibido correctamente',
          warning: 'Email no pudo ser enviado'
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Formulario enviado correctamente',
        data: {
          email_sent: true,
          saved_to_database: true
        }
      });

    } catch (emailError) {
      console.error('Error en proceso de email:', emailError);
      return NextResponse.json({
        success: true,
        message: 'Formulario recibido correctamente',
        warning: 'Email no pudo ser enviado'
      });
    }

  } catch (error: any) {
    console.error('Error processing form:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Funciones auxiliares
function getFormTypeLabel(formType: string): string {
  const labels: Record<string, string> = {
    'contact': 'Contacto',
    'newsletter': 'Suscripción al Newsletter',
    'quote': 'Solicitud de Cotización',
    'application': 'Aplicación Laboral',
    'denuncia': 'Denuncia Ética',
    'support': 'Soporte',
    'smart-contact': 'Contacto Inteligente'
  };

  return labels[formType] || 'Formulario';
}

function formatFieldLabel(key: string): string {
  // Convertir snake_case y camelCase a título legible
  const formatted = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Traducciones específicas
  const translations: Record<string, string> = {
    'Name': 'Nombre',
    'Email': 'Correo Electrónico',
    'Phone': 'Teléfono',
    'Company': 'Empresa',
    'Message': 'Mensaje',
    'Service': 'Servicio',
    'Budget': 'Presupuesto',
    'Timeline': 'Plazo',
    'Project Type': 'Tipo de Proyecto',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    'Location': 'Ubicación',
    'Linkedin': 'LinkedIn',
    'Portfolio': 'Portafolio',
    'Experience': 'Experiencia',
    'Education': 'Educación',
    'Motivation Letter': 'Carta de Motivación',
    'Availability': 'Disponibilidad',
    'Salary Expectation': 'Expectativa Salarial'
  };

  return translations[formatted] || formatted;
}
