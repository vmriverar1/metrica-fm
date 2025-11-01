/**
 * Tipos para el servicio de email
 */

export interface EmailConfig {
  to: string | string[];
  subject: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailField {
  label: string;
  value: string | number | boolean;
  type?: 'text' | 'email' | 'phone' | 'url' | 'date' | 'number' | 'textarea';
}

export interface EmailTemplate {
  type: 'contact' | 'newsletter' | 'quote' | 'support' | 'custom';
  fields: EmailField[];
  metadata?: Record<string, any>;
}

export interface SendEmailRequest {
  config: EmailConfig;
  template: EmailTemplate;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
