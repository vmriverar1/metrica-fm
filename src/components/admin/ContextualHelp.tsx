'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Keyboard,
  Zap,
  BookOpen,
  Target
} from 'lucide-react';

interface HelpTip {
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'success' | 'info';
  icon?: React.ComponentType<any>;
}

interface ContextualHelpProps {
  fieldKey: string;
  fieldType: string;
  tips?: HelpTip[];
  shortcuts?: string[];
  showShortcuts?: boolean;
  className?: string;
}

const helpDatabase: Record<string, HelpTip[]> = {
  // Hero & Certificate fields
  'hero.certificate_details.issue_date': [
    {
      title: 'Formato de fecha requerido',
      description: 'Use el formato YYYY-MM-DD. La fecha debe ser anterior a la fecha de vencimiento.',
      type: 'info'
    },
    {
      title: 'Validación automática',
      description: 'El sistema validará automáticamente que esta fecha sea lógica con respecto al vencimiento.',
      type: 'tip'
    }
  ],
  'hero.certificate_details.expiry_date': [
    {
      title: 'Control de vigencia',
      description: 'El sistema alertará si el certificado está por vencer en los próximos 6 meses.',
      type: 'warning'
    },
    {
      title: 'Renovación automática',
      description: 'Configure recordatorios automáticos para renovar el certificado a tiempo.',
      type: 'tip'
    }
  ],
  'hero.certificate_details.verification_url': [
    {
      title: 'Seguridad HTTPS',
      description: 'Use únicamente URLs HTTPS para garantizar la seguridad de la verificación.',
      type: 'warning'
    },
    {
      title: 'Verificación externa',
      description: 'Esta URL debe permitir a terceros verificar la autenticidad del certificado.',
      type: 'info'
    }
  ],
  'hero.action_buttons': [
    {
      title: 'Mejores prácticas UX',
      description: 'Use máximo 3 botones para evitar saturar al usuario. Priorice acciones principales.',
      type: 'tip'
    },
    {
      title: 'Llamadas a la acción efectivas',
      description: 'Use verbos de acción claros: "Descargar Certificado", "Solicitar Auditoría".',
      type: 'success'
    }
  ],
  'introduction.benefits': [
    {
      title: 'Beneficios persuasivos',
      description: 'Liste 4-6 beneficios clave que resuenen con las necesidades de sus clientes.',
      type: 'tip'
    },
    {
      title: 'Iconografía consistente',
      description: 'Use iconos que refuercen visualmente cada beneficio y mantenga consistencia de colores.',
      type: 'success'
    }
  ],
  'quality_policy.commitments': [
    {
      title: 'Compromisos medibles',
      description: 'Cada compromiso debe ser específico, medible y alineado con los objetivos ISO 9001.',
      type: 'warning'
    },
    {
      title: 'Lenguaje corporativo',
      description: 'Use un tono profesional que refleje los valores de la organización.',
      type: 'info'
    }
  ],
  'quality_policy.objectives': [
    {
      title: 'Objetivos SMART',
      description: 'Defina objetivos Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido.',
      type: 'tip'
    },
    {
      title: 'Seguimiento de progreso',
      description: 'Mantenga actualizado el estado de cada objetivo para demostrar mejora continua.',
      type: 'success'
    }
  ]
};

const typeConfig = {
  tip: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  warning: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  info: { icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
};

export default function ContextualHelp({
  fieldKey,
  fieldType,
  tips = [],
  shortcuts = [],
  showShortcuts = true,
  className = ''
}: ContextualHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get contextual tips from database
  const contextualTips = helpDatabase[fieldKey] || [];
  const allTips = [...contextualTips, ...tips];

  // Don't render if no help content
  if (allTips.length === 0 && shortcuts.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Ayuda
            {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 border-gray-200 bg-gray-50/50">
            <CardContent className="p-3">
              {/* Tips */}
              {allTips.length > 0 && (
                <div className="space-y-2 mb-3">
                  {allTips.map((tip, index) => {
                    const config = typeConfig[tip.type];
                    const IconComponent = tip.icon || config.icon;
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-2 p-2 rounded border ${config.bg} ${config.border}`}
                      >
                        <IconComponent className={`w-4 h-4 ${config.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{tip.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{tip.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Keyboard Shortcuts */}
              {showShortcuts && shortcuts.length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Keyboard className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Atajos de Teclado</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {shortcuts.map((shortcut, index) => (
                      <Badge key={index} variant="secondary" className="text-xs py-0 px-1">
                        {shortcut}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Hook para obtener ayuda contextual basada en el campo
export function useContextualHelp(fieldKey: string) {
  const tips = helpDatabase[fieldKey] || [];
  const hasHelp = tips.length > 0;
  
  return {
    tips,
    hasHelp,
    getTip: (type: 'tip' | 'warning' | 'success' | 'info') => 
      tips.find(tip => tip.type === type)
  };
}