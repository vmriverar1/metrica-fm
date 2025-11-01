/**
 * Ejemplos de uso del servicio de email para diferentes formularios
 */

import { SendEmailRequest } from '@/types/email';

/**
 * Ejemplo: Formulario de contacto general
 */
export const contactFormExample: SendEmailRequest = {
  config: {
    to: 'info@metricadip.com',
    subject: 'Nuevo mensaje de contacto desde el sitio web',
    replyTo: 'cliente@example.com' // Email del cliente que envía
  },
  template: {
    type: 'contact',
    fields: [
      {
        label: 'Nombre Completo',
        value: 'Juan Pérez',
        type: 'text'
      },
      {
        label: 'Email',
        value: 'juan.perez@example.com',
        type: 'email'
      },
      {
        label: 'Teléfono',
        value: '+51 999 999 999',
        type: 'phone'
      },
      {
        label: 'Empresa',
        value: 'Constructora ABC SAC',
        type: 'text'
      },
      {
        label: 'Mensaje',
        value: 'Me gustaría obtener más información sobre sus servicios de dirección de proyectos...',
        type: 'textarea'
      }
    ],
    metadata: {
      'IP del Cliente': '192.168.1.1',
      'Navegador': 'Chrome 120',
      'Página de Origen': 'https://metricadip.com/contact'
    }
  }
};

/**
 * Ejemplo: Formulario de cotización/servicios
 */
export const quoteFormExample: SendEmailRequest = {
  config: {
    to: 'ventas@metricadip.com',
    subject: 'Nueva solicitud de cotización - Servicios',
    replyTo: 'cliente@example.com',
    cc: 'info@metricadip.com'
  },
  template: {
    type: 'quote',
    fields: [
      {
        label: 'Nombre',
        value: 'María García',
        type: 'text'
      },
      {
        label: 'Email',
        value: 'maria.garcia@example.com',
        type: 'email'
      },
      {
        label: 'Teléfono',
        value: '+51 987 654 321',
        type: 'phone'
      },
      {
        label: 'Empresa',
        value: 'Inmobiliaria XYZ',
        type: 'text'
      },
      {
        label: 'Servicio Solicitado',
        value: 'Dirección Integral de Proyectos',
        type: 'text'
      },
      {
        label: 'Tipo de Proyecto',
        value: 'Centro Comercial',
        type: 'text'
      },
      {
        label: 'Presupuesto Estimado',
        value: 'S/ 5M - 20M',
        type: 'text'
      },
      {
        label: 'Timeline',
        value: '3 - 6 meses',
        type: 'text'
      },
      {
        label: 'Descripción del Proyecto',
        value: 'Proyecto de centro comercial de 15,000 m2 en Lima Norte. Requiere dirección integral incluyendo planificación, supervisión y control de calidad.',
        type: 'textarea'
      }
    ],
    metadata: {
      'Formulario': 'SmartContactForm - Servicios',
      'Urgencia': 'Media',
      'Fecha de Solicitud': new Date().toLocaleDateString('es-PE')
    }
  }
};

/**
 * Ejemplo: Newsletter suscripción
 */
export const newsletterExample: SendEmailRequest = {
  config: {
    to: 'marketing@metricadip.com',
    subject: 'Nueva suscripción al Newsletter',
    replyTo: 'suscriptor@example.com'
  },
  template: {
    type: 'newsletter',
    fields: [
      {
        label: 'Email',
        value: 'suscriptor@example.com',
        type: 'email'
      },
      {
        label: 'Nombre',
        value: 'Carlos Rodríguez',
        type: 'text'
      },
      {
        label: 'Fecha de Suscripción',
        value: new Date().toLocaleString('es-PE'),
        type: 'date'
      }
    ],
    metadata: {
      'Origen': 'Footer Newsletter',
      'Página': 'https://metricadip.com/'
    }
  }
};

/**
 * Ejemplo: Formulario de soporte
 */
export const supportFormExample: SendEmailRequest = {
  config: {
    to: 'soporte@metricadip.com',
    subject: 'Nueva solicitud de soporte técnico',
    replyTo: 'cliente@example.com'
  },
  template: {
    type: 'support',
    fields: [
      {
        label: 'Nombre',
        value: 'Ana Martínez',
        type: 'text'
      },
      {
        label: 'Email',
        value: 'ana.martinez@example.com',
        type: 'email'
      },
      {
        label: 'Tipo de Problema',
        value: 'Error en plataforma',
        type: 'text'
      },
      {
        label: 'Descripción',
        value: 'No puedo acceder a los documentos del proyecto en la plataforma...',
        type: 'textarea'
      },
      {
        label: 'Prioridad',
        value: 'Alta',
        type: 'text'
      }
    ]
  }
};

/**
 * Ejemplo: Formulario personalizado
 */
export const customFormExample: SendEmailRequest = {
  config: {
    to: 'info@metricadip.com',
    subject: 'Formulario personalizado - Carreras',
    replyTo: 'aplicante@example.com'
  },
  template: {
    type: 'custom',
    fields: [
      {
        label: 'Nombre Completo',
        value: 'Luis Sánchez',
        type: 'text'
      },
      {
        label: 'Email',
        value: 'luis.sanchez@example.com',
        type: 'email'
      },
      {
        label: 'Teléfono',
        value: '+51 955 123 456',
        type: 'phone'
      },
      {
        label: 'Posición de Interés',
        value: 'Gerente de Proyectos',
        type: 'text'
      },
      {
        label: 'Años de Experiencia',
        value: 8,
        type: 'number'
      },
      {
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/luis-sanchez',
        type: 'url'
      },
      {
        label: 'CV Adjunto',
        value: 'https://metricadip.com/uploads/cv-luis-sanchez.pdf',
        type: 'url'
      },
      {
        label: 'Carta de Presentación',
        value: 'Soy un profesional con 8 años de experiencia en gestión de proyectos de construcción...',
        type: 'textarea'
      }
    ],
    metadata: {
      'Formulario': 'Aplicación de Empleo',
      'Fecha de Aplicación': new Date().toLocaleDateString('es-PE')
    }
  }
};

/**
 * Función helper para crear un email de contacto rápido
 */
export function createContactEmail(
  name: string,
  email: string,
  phone: string,
  company: string,
  message: string
): SendEmailRequest {
  return {
    config: {
      to: 'info@metricadip.com',
      subject: `Nuevo mensaje de ${name}`,
      replyTo: email
    },
    template: {
      type: 'contact',
      fields: [
        { label: 'Nombre', value: name, type: 'text' },
        { label: 'Email', value: email, type: 'email' },
        { label: 'Teléfono', value: phone, type: 'phone' },
        { label: 'Empresa', value: company, type: 'text' },
        { label: 'Mensaje', value: message, type: 'textarea' }
      ],
      metadata: {
        'Fecha': new Date().toLocaleString('es-PE')
      }
    }
  };
}

/**
 * Función helper para crear un email de cotización
 */
export function createQuoteEmail(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
}): SendEmailRequest {
  return {
    config: {
      to: 'ventas@metricadip.com',
      subject: `Cotización - ${data.service}`,
      replyTo: data.email
    },
    template: {
      type: 'quote',
      fields: [
        { label: 'Nombre', value: data.name, type: 'text' },
        { label: 'Email', value: data.email, type: 'email' },
        { label: 'Teléfono', value: data.phone, type: 'phone' },
        { label: 'Empresa', value: data.company, type: 'text' },
        { label: 'Servicio', value: data.service, type: 'text' },
        { label: 'Tipo de Proyecto', value: data.projectType, type: 'text' },
        { label: 'Presupuesto', value: data.budget, type: 'text' },
        { label: 'Timeline', value: data.timeline, type: 'text' },
        { label: 'Descripción', value: data.message, type: 'textarea' }
      ]
    }
  };
}
