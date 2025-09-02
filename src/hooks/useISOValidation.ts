'use client';

import { useMemo } from 'react';

interface ValidationRule {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  condition: (data: any) => boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationRule[];
  warnings: ValidationRule[];
  info: ValidationRule[];
  totalIssues: number;
}

export function useISOValidation(data: any): ValidationResult {
  const validationRules: ValidationRule[] = useMemo(() => [
    // Validaciones de fechas de certificado
    {
      field: 'hero.certificate_details.issue_date',
      message: 'La fecha de emisión debe ser anterior a la fecha de vencimiento',
      severity: 'error',
      condition: (data) => {
        const issueDate = data?.hero?.certificate_details?.issue_date;
        const expiryDate = data?.hero?.certificate_details?.expiry_date;
        if (!issueDate || !expiryDate) return true; // No validar si faltan datos
        return new Date(issueDate) < new Date(expiryDate);
      }
    },
    {
      field: 'hero.certificate_details.expiry_date',
      message: 'El certificado está próximo a vencer (menos de 6 meses)',
      severity: 'warning',
      condition: (data) => {
        const expiryDate = data?.hero?.certificate_details?.expiry_date;
        if (!expiryDate) return true;
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return new Date(expiryDate) > sixMonthsFromNow;
      }
    },
    {
      field: 'hero.certificate_details.expiry_date',
      message: '⚠️ CERTIFICADO VENCIDO - Actualizar inmediatamente',
      severity: 'error',
      condition: (data) => {
        const expiryDate = data?.hero?.certificate_details?.expiry_date;
        if (!expiryDate) return true;
        return new Date(expiryDate) > new Date();
      }
    },
    
    // Validaciones de URLs
    {
      field: 'hero.certificate_details.verification_url',
      message: 'La URL de verificación debe ser HTTPS para mayor seguridad',
      severity: 'warning',
      condition: (data) => {
        const url = data?.hero?.certificate_details?.verification_url;
        if (!url) return true;
        return url.startsWith('https://');
      }
    },
    {
      field: 'hero.certificate_details.pdf_url',
      message: 'Se recomienda usar URLs HTTPS para archivos PDF',
      severity: 'info',
      condition: (data) => {
        const url = data?.hero?.certificate_details?.pdf_url;
        if (!url || !url.startsWith('http')) return true; // Solo para URLs externas
        return url.startsWith('https://');
      }
    },

    // Validaciones de contenido mínimo
    {
      field: 'introduction.benefits',
      message: 'Se recomienda tener al menos 4 beneficios ISO para mejor impacto',
      severity: 'info',
      condition: (data) => {
        const benefits = data?.introduction?.benefits;
        return Array.isArray(benefits) && benefits.length >= 4;
      }
    },
    {
      field: 'quality_policy.commitments',
      message: 'Una política de calidad sólida debería tener al menos 5 compromisos',
      severity: 'warning',
      condition: (data) => {
        const commitments = data?.quality_policy?.commitments;
        return Array.isArray(commitments) && commitments.length >= 5;
      }
    },
    {
      field: 'quality_policy.objectives',
      message: 'Se requieren al menos 3 objetivos medibles para cumplir ISO 9001',
      severity: 'error',
      condition: (data) => {
        const objectives = data?.quality_policy?.objectives;
        return Array.isArray(objectives) && objectives.length >= 3;
      }
    },
    {
      field: 'client_benefits.benefits_list',
      message: 'Se recomienda al menos 5 beneficios para clientes con casos de estudio',
      severity: 'info',
      condition: (data) => {
        const benefits = data?.client_benefits?.benefits_list;
        return Array.isArray(benefits) && benefits.length >= 5;
      }
    },
    {
      field: 'testimonials.testimonials_list',
      message: 'Al menos 3 testimonios mejoran la credibilidad de la certificación',
      severity: 'warning',
      condition: (data) => {
        const testimonials = data?.testimonials?.testimonials_list;
        return Array.isArray(testimonials) && testimonials.length >= 3;
      }
    },

    // Validaciones de calidad de contenido
    {
      field: 'hero.action_buttons',
      message: 'Se recomienda 2-3 botones de acción para mejor UX',
      severity: 'info',
      condition: (data) => {
        const buttons = data?.hero?.action_buttons;
        return Array.isArray(buttons) && buttons.length >= 2 && buttons.length <= 3;
      }
    },
    {
      field: 'introduction.scope.items',
      message: 'El alcance debería incluir al menos 4 elementos específicos',
      severity: 'warning',
      condition: (data) => {
        const items = data?.introduction?.scope?.items;
        return Array.isArray(items) && items.length >= 4;
      }
    },

    // Validaciones de consistencia de números/porcentajes
    {
      field: 'hero.stats.average_satisfaction',
      message: 'La satisfacción promedio parece muy alta (>99%), verificar datos',
      severity: 'warning',
      condition: (data) => {
        const satisfaction = data?.hero?.stats?.average_satisfaction;
        if (!satisfaction) return true;
        const num = parseFloat(satisfaction.replace(/[^\d.]/g, ''));
        return isNaN(num) || num <= 99;
      }
    },
    
    // Validaciones de objetivos de calidad
    {
      field: 'quality_policy.objectives',
      message: 'Algunos objetivos no tienen estado "achieved" - revisar progreso',
      severity: 'info',
      condition: (data) => {
        const objectives = data?.quality_policy?.objectives;
        if (!Array.isArray(objectives) || objectives.length === 0) return true;
        const achieved = objectives.filter(obj => obj.status === 'achieved').length;
        return achieved >= objectives.length * 0.7; // Al menos 70% logrados
      }
    },

    // Validaciones de testimonios
    {
      field: 'testimonials.testimonials_list',
      message: 'Algunos testimonios tienen rating inferior a 4 estrellas',
      severity: 'warning',
      condition: (data) => {
        const testimonials = data?.testimonials?.testimonials_list;
        if (!Array.isArray(testimonials) || testimonials.length === 0) return true;
        return testimonials.every(t => !t.rating || t.rating >= 4);
      }
    },

    // Validaciones de SEO y marketing
    {
      field: 'page.title',
      message: 'El título SEO es muy largo (>60 caracteres)',
      severity: 'warning',
      condition: (data) => {
        const title = data?.page?.title;
        return !title || title.length <= 60;
      }
    },
    {
      field: 'page.description',
      message: 'La descripción SEO está fuera del rango óptimo (150-160 caracteres)',
      severity: 'info',
      condition: (data) => {
        const desc = data?.page?.description;
        if (!desc) return true;
        return desc.length >= 150 && desc.length <= 160;
      }
    },

    // Validación de certificación vigente
    {
      field: 'hero.certification_status.is_valid',
      message: 'La certificación está marcada como NO vigente',
      severity: 'error',
      condition: (data) => {
        return data?.hero?.certification_status?.is_valid === true;
      }
    }

  ], []);

  const validationResult = useMemo((): ValidationResult => {
    const errors: ValidationRule[] = [];
    const warnings: ValidationRule[] = [];
    const info: ValidationRule[] = [];

    validationRules.forEach(rule => {
      try {
        if (!rule.condition(data)) {
          switch (rule.severity) {
            case 'error':
              errors.push(rule);
              break;
            case 'warning':
              warnings.push(rule);
              break;
            case 'info':
              info.push(rule);
              break;
          }
        }
      } catch (error) {
        // En caso de error en validación, agregar como warning
        warnings.push({
          ...rule,
          message: `Error al validar ${rule.field}: ${error}`,
          severity: 'warning'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      totalIssues: errors.length + warnings.length + info.length
    };
  }, [data, validationRules]);

  return validationResult;
}

// Hook para validación de campo específico
export function useFieldValidation(data: any, fieldPath: string) {
  const fullValidation = useISOValidation(data);
  
  return useMemo(() => {
    const fieldIssues = [
      ...fullValidation.errors,
      ...fullValidation.warnings,
      ...fullValidation.info
    ].filter(issue => issue.field === fieldPath);

    return {
      hasIssues: fieldIssues.length > 0,
      issues: fieldIssues,
      severity: fieldIssues.length > 0 ? fieldIssues[0].severity : null
    };
  }, [fullValidation, fieldPath]);
}