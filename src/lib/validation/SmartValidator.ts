import { z } from 'zod';

export interface ValidationRule {
  field: string;
  type: 'format' | 'length' | 'content' | 'seo' | 'accessibility' | 'performance';
  severity: 'error' | 'warning' | 'info' | 'success';
  message: string;
  suggestion?: string;
  autoFix?: any;
}

export interface ValidationResult {
  isValid: boolean;
  rules: ValidationRule[];
  score: number;
  suggestions: string[];
  autoFixes: Record<string, any>;
}

export class SmartValidator {
  private homeJsonRules: Record<string, any> = {
    // SEO Rules
    'page.title': {
      minLength: 10,
      maxLength: 60,
      required: true,
      suggestions: [
        'Include your main keyword at the beginning',
        'Keep it under 60 characters for better SEO',
        'Make it descriptive and compelling'
      ],
      autoFix: 'Métrica FM - Dirección Integral de Proyectos en Perú'
    },
    'page.description': {
      minLength: 50,
      maxLength: 160,
      required: true,
      suggestions: [
        'Include primary and secondary keywords',
        'Write a compelling call to action',
        'Keep it between 50-160 characters'
      ],
      autoFix: 'Líderes en Dirección Integral de Proyectos en Perú. Especialistas en infraestructura, saneamiento y proyectos de gran escala. Contáctanos hoy.'
    },
    
    // Hero Section Rules
    'hero.title.main': {
      minLength: 3,
      maxLength: 25,
      required: true,
      suggestions: [
        'Use your brand name or main value proposition',
        'Keep it short and memorable',
        'Avoid technical jargon'
      ]
    },
    'hero.title.secondary': {
      minLength: 2,
      maxLength: 25,
      required: true,
      suggestions: [
        'Use your acronym or complementary text',
        'Should work with the main title',
        'Consider using your main service abbreviation'
      ]
    },
    'hero.subtitle': {
      minLength: 10,
      maxLength: 150,
      required: true,
      suggestions: [
        'Explain what you do in simple terms',
        'Focus on benefits, not features',
        'Include a value proposition'
      ]
    },
    
    // Rotating Words Rules
    'hero.rotating_words': {
      minItems: 3,
      maxItems: 8,
      itemMaxLength: 15,
      suggestions: [
        'Use action words that describe your company values',
        'Keep words short (under 15 characters)',
        'Focus on what makes you different',
        'Consider: Innovación, Calidad, Excelencia, Eficiencia'
      ]
    },
    
    // Statistics Rules
    'stats.statistics': {
      minItems: 2,
      maxItems: 6,
      suggestions: [
        'Use impressive, round numbers',
        'Include units (años, proyectos, clientes)',
        'Focus on achievements that build trust',
        'Update regularly to keep current'
      ]
    },
    
    // Services Rules
    'services.main_service.name': {
      minLength: 5,
      maxLength: 50,
      required: true,
      suggestions: [
        'Use your main service official name',
        'Be specific about what you offer',
        'Consider "Dirección Integral de Proyectos (DIP)"'
      ]
    },
    'services.main_service.description': {
      minLength: 20,
      maxLength: 200,
      required: true,
      suggestions: [
        'Explain the value of your main service',
        'Focus on client benefits',
        'Use clear, non-technical language'
      ]
    },
    
    // Portfolio Rules
    'portfolio.featured_projects': {
      minItems: 2,
      maxItems: 6,
      suggestions: [
        'Showcase diverse project types',
        'Use high-quality project images',
        'Include project scale/impact',
        'Mix different sectors (health, education, infrastructure)'
      ]
    },
    
    // Pillars Rules
    'pillars.pillars': {
      minItems: 4,
      maxItems: 8,
      suggestions: [
        'Cover all aspects of your methodology',
        'Use clear, actionable titles',
        'Focus on what differentiates you',
        'Ensure each pillar adds unique value'
      ]
    },
    
    // Policies Rules
    'policies.policies': {
      minItems: 4,
      maxItems: 12,
      suggestions: [
        'Include key company commitments',
        'Cover quality, safety, environment, ethics',
        'Use official policy names',
        'Ensure policies are current and approved'
      ]
    }
  };

  validateField(field: string, value: any, context: any = {}): ValidationRule[] {
    const rules: ValidationRule[] = [];
    const fieldRule = this.homeJsonRules[field];
    
    if (!fieldRule) return rules;

    // Required validation
    if (fieldRule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      rules.push({
        field,
        type: 'content',
        severity: 'error',
        message: 'Este campo es requerido',
        suggestion: fieldRule.suggestions?.[0] || 'Complete este campo para continuar'
      });
      return rules;
    }

    // String validations
    if (typeof value === 'string' && value.trim()) {
      this.validateString(field, value, fieldRule, rules);
    }

    // Array validations
    if (Array.isArray(value)) {
      this.validateArray(field, value, fieldRule, rules);
    }

    return rules;
  }

  private validateString(field: string, value: string, rule: any, rules: ValidationRule[]) {
    const trimmed = value.trim();
    
    // Length validations
    if (rule.minLength && trimmed.length < rule.minLength) {
      rules.push({
        field,
        type: 'length',
        severity: 'warning',
        message: `Muy corto. Mínimo ${rule.minLength} caracteres (actual: ${trimmed.length})`,
        suggestion: rule.suggestions?.[0] || 'Agregue más contenido descriptivo'
      });
    }

    if (rule.maxLength && trimmed.length > rule.maxLength) {
      rules.push({
        field,
        type: 'length',
        severity: 'error',
        message: `Muy largo. Máximo ${rule.maxLength} caracteres (actual: ${trimmed.length})`,
        suggestion: 'Reduzca el contenido para cumplir el límite'
      });
    }

    // SEO-specific validations
    if (field === 'page.title') {
      this.validateSEOTitle(field, trimmed, rules);
    }

    if (field === 'page.description') {
      this.validateSEODescription(field, trimmed, rules);
    }

    // Content quality validations
    this.validateContentQuality(field, trimmed, rule, rules);
  }

  private validateArray(field: string, value: any[], rule: any, rules: ValidationRule[]) {
    // Length validations
    if (rule.minItems && value.length < rule.minItems) {
      rules.push({
        field,
        type: 'content',
        severity: 'warning',
        message: `Se recomiendan al menos ${rule.minItems} elementos (actual: ${value.length})`,
        suggestion: rule.suggestions?.[0] || 'Agregue más elementos para mejorar la experiencia'
      });
    }

    if (rule.maxItems && value.length > rule.maxItems) {
      rules.push({
        field,
        type: 'content',
        severity: 'warning',
        message: `Muchos elementos. Máximo recomendado: ${rule.maxItems} (actual: ${value.length})`,
        suggestion: 'Considere reducir la cantidad para mejor UX'
      });
    }

    // Array item validations
    if (rule.itemMaxLength && field === 'hero.rotating_words') {
      value.forEach((word, index) => {
        if (typeof word === 'string' && word.length > rule.itemMaxLength) {
          rules.push({
            field: `${field}[${index}]`,
            type: 'length',
            severity: 'warning',
            message: `Palabra muy larga: "${word}" (${word.length}/${rule.itemMaxLength})`,
            suggestion: 'Use palabras más cortas para mejor animación'
          });
        }
      });
    }
  }

  private validateSEOTitle(field: string, value: string, rules: ValidationRule[]) {
    // Brand name check
    if (!value.toLowerCase().includes('métrica') && !value.toLowerCase().includes('dip')) {
      rules.push({
        field,
        type: 'seo',
        severity: 'info',
        message: 'Considere incluir su marca "Métrica FM"',
        suggestion: 'Incluya su marca para mejor reconocimiento',
        autoFix: `Métrica FM - ${value}`
      });
    }

    // Keyword density
    if (value.toLowerCase().includes('proyecto') || value.toLowerCase().includes('ingeniería')) {
      rules.push({
        field,
        type: 'seo',
        severity: 'success',
        message: 'Contiene palabras clave relevantes',
        suggestion: 'Excelente uso de keywords del sector'
      });
    }
  }

  private validateSEODescription(field: string, value: string, rules: ValidationRule[]) {
    // Call to action check
    const ctas = ['contáctanos', 'contacto', 'solicita', 'llama', 'escríbenos'];
    const hasCTA = ctas.some(cta => value.toLowerCase().includes(cta));
    
    if (!hasCTA) {
      rules.push({
        field,
        type: 'seo',
        severity: 'info',
        message: 'Considere agregar una llamada a la acción',
        suggestion: 'Términos sugeridos: "Contáctanos", "Solicita cotización"'
      });
    }

    // Location check
    if (value.toLowerCase().includes('perú') || value.toLowerCase().includes('lima')) {
      rules.push({
        field,
        type: 'seo',
        severity: 'success',
        message: 'Incluye ubicación geográfica',
        suggestion: 'Excelente para SEO local'
      });
    }
  }

  private validateContentQuality(field: string, value: string, rule: any, rules: ValidationRule[]) {
    // Repetition check
    const words = value.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      if (word.length > 3) { // Only count meaningful words
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const repeatedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 2)
      .map(([word]) => word);

    if (repeatedWords.length > 0) {
      rules.push({
        field,
        type: 'content',
        severity: 'info',
        message: `Palabras repetidas: ${repeatedWords.join(', ')}`,
        suggestion: 'Considere usar sinónimos para mejorar el contenido'
      });
    }

    // All caps check
    if (value === value.toUpperCase() && value.length > 10) {
      rules.push({
        field,
        type: 'accessibility',
        severity: 'warning',
        message: 'Texto en mayúsculas puede ser difícil de leer',
        suggestion: 'Use capitalización normal para mejor legibilidad'
      });
    }
  }

  validateComplete(data: any): ValidationResult {
    const allRules: ValidationRule[] = [];
    
    // Validate all configured fields
    Object.keys(this.homeJsonRules).forEach(field => {
      const value = this.getNestedValue(data, field);
      const fieldRules = this.validateField(field, value, data);
      allRules.push(...fieldRules);
    });

    // Cross-field validations
    this.performCrossFieldValidation(data, allRules);

    // Calculate score
    const score = this.calculateScore(allRules);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(allRules, data);

    // Generate auto-fixes
    const autoFixes = this.generateAutoFixes(allRules, data);

    return {
      isValid: allRules.filter(r => r.severity === 'error').length === 0,
      rules: allRules,
      score,
      suggestions,
      autoFixes
    };
  }

  private performCrossFieldValidation(data: any, rules: ValidationRule[]) {
    // Hero consistency check
    const heroTitle = this.getNestedValue(data, 'hero.title.main');
    const pageTitle = this.getNestedValue(data, 'page.title');
    
    if (heroTitle && pageTitle && !pageTitle.toLowerCase().includes(heroTitle.toLowerCase())) {
      rules.push({
        field: 'hero.title.main',
        type: 'content',
        severity: 'info',
        message: 'El título del hero no coincide con el título de página',
        suggestion: 'Considere alinear ambos títulos para consistencia de marca'
      });
    }

    // Statistics completeness check
    const statistics = this.getNestedValue(data, 'stats.statistics');
    if (Array.isArray(statistics) && statistics.length > 0) {
      const incompleteStats = statistics.filter((stat: any) => 
        !stat.value || !stat.label || !stat.description
      ).length;

      if (incompleteStats > 0) {
        rules.push({
          field: 'stats.statistics',
          type: 'content',
          severity: 'warning',
          message: `${incompleteStats} estadística(s) incompleta(s)`,
          suggestion: 'Complete valor, etiqueta y descripción para todas las estadísticas'
        });
      }
    }
  }

  private calculateScore(rules: ValidationRule[]): number {
    let score = 100;
    
    rules.forEach(rule => {
      switch (rule.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
        case 'success':
          score += 2;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateSuggestions(rules: ValidationRule[], data: any): string[] {
    const suggestions: string[] = [];
    
    // Priority suggestions (errors first)
    const errorRules = rules.filter(r => r.severity === 'error');
    const warningRules = rules.filter(r => r.severity === 'warning');
    
    errorRules.slice(0, 3).forEach(rule => {
      if (rule.suggestion) {
        suggestions.push(`🔴 ${rule.field}: ${rule.suggestion}`);
      }
    });

    warningRules.slice(0, 2).forEach(rule => {
      if (rule.suggestion) {
        suggestions.push(`⚠️ ${rule.field}: ${rule.suggestion}`);
      }
    });

    // General suggestions based on completeness
    const completeness = this.calculateCompleteness(data);
    if (completeness < 50) {
      suggestions.push('💡 Complete más secciones para mejorar la experiencia del usuario');
    }

    return suggestions.slice(0, 5);
  }

  private generateAutoFixes(rules: ValidationRule[], data: any): Record<string, any> {
    const autoFixes: Record<string, any> = {};
    
    rules.forEach(rule => {
      if (rule.autoFix) {
        autoFixes[rule.field] = rule.autoFix;
      }
    });

    return autoFixes;
  }

  private calculateCompleteness(data: any): number {
    const essentialFields = [
      'page.title',
      'page.description',
      'hero.title.main',
      'hero.title.secondary',
      'hero.subtitle',
      'hero.rotating_words',
      'services.main_service.name',
      'stats.statistics'
    ];

    const completed = essentialFields.filter(field => {
      const value = this.getNestedValue(data, field);
      return value && (
        typeof value === 'string' ? value.trim().length > 0 :
        Array.isArray(value) ? value.length > 0 :
        typeof value === 'object' ? Object.keys(value).length > 0 :
        true
      );
    }).length;

    return Math.round((completed / essentialFields.length) * 100);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  // Utility methods for UI components
  getRulesByField(rules: ValidationRule[]): Record<string, ValidationRule[]> {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.field]) acc[rule.field] = [];
      acc[rule.field].push(rule);
      return acc;
    }, {} as Record<string, ValidationRule[]>);
  }

  getRulesBySeverity(rules: ValidationRule[]): Record<string, ValidationRule[]> {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.severity]) acc[rule.severity] = [];
      acc[rule.severity].push(rule);
      return acc;
    }, {} as Record<string, ValidationRule[]>);
  }
}