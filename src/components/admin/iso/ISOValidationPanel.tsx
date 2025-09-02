'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Shield,
  Calendar,
  Link,
  FileText,
  Users,
  Target,
  Star,
  Search,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useISOValidation } from '@/hooks/useISOValidation';

interface ISOValidationPanelProps {
  data: any;
  className?: string;
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-800'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800'
  }
};

const fieldIcons: Record<string, React.ComponentType<any>> = {
  'hero.certificate_details': Calendar,
  'hero.action_buttons': Zap,
  'introduction.benefits': Shield,
  'introduction.scope': FileText,
  'quality_policy.commitments': Target,
  'quality_policy.objectives': TrendingUp,
  'client_benefits.benefits_list': Users,
  'testimonials.testimonials_list': Star,
  'page.title': Search,
  'page.description': Search,
  'hero.certification_status': Shield
};

function getFieldIcon(fieldPath: string) {
  const matchingKey = Object.keys(fieldIcons).find(key => fieldPath.startsWith(key));
  return matchingKey ? fieldIcons[matchingKey] : FileText;
}

export default function ISOValidationPanel({ data, className = '' }: ISOValidationPanelProps) {
  const validation = useISOValidation(data);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getValidationScore = () => {
    const totalChecks = 20; // Número aproximado de validaciones
    const issues = validation.errors.length + validation.warnings.length;
    const score = Math.max(0, Math.round(((totalChecks - issues) / totalChecks) * 100));
    return score;
  };

  const score = getValidationScore();
  const scoreColor = score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';
  const scoreBgColor = score >= 90 ? 'bg-green-50' : score >= 70 ? 'bg-yellow-50' : 'bg-red-50';

  if (validation.totalIssues === 0) {
    return (
      <Card className={`border-l-4 border-l-green-500 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">✅ Validación Exitosa</h3>
              <p className="text-sm text-green-600">
                Todos los campos ISO 9001 están correctamente configurados
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 ml-auto">
              {score}% Calidad
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${
      validation.errors.length > 0 ? 'border-l-red-500' : 
      validation.warnings.length > 0 ? 'border-l-yellow-500' : 'border-l-blue-500'
    } ${className}`}>
      <CardHeader className="pb-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  validation.errors.length > 0 ? 'bg-red-100' : 
                  validation.warnings.length > 0 ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {validation.errors.length > 0 ? (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  ) : validation.warnings.length > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Info className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Validación ISO 9001
                  </h3>
                  <p className="text-sm text-gray-600">
                    {validation.totalIssues} {validation.totalIssues === 1 ? 'problema encontrado' : 'problemas encontrados'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${scoreBgColor} ${scoreColor}`}>
                  {score}% Calidad
                </Badge>
                <div className="flex items-center space-x-1">
                  {validation.errors.length > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {validation.errors.length} errores
                    </Badge>
                  )}
                  {validation.warnings.length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {validation.warnings.length} advertencias
                    </Badge>
                  )}
                  {validation.info.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {validation.info.length} sugerencias
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {/* Errores */}
              {validation.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-red-800 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Errores Críticos ({validation.errors.length})</span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('errors')}
                      className="h-6 text-xs"
                    >
                      {expandedSections.errors ? 'Ocultar' : 'Ver todos'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {validation.errors.slice(0, expandedSections.errors ? undefined : 3).map((error, index) => {
                      const FieldIcon = getFieldIcon(error.field);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                        >
                          <FieldIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">
                              {error.message}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Campo: {error.field}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validation.warnings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-800 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Advertencias ({validation.warnings.length})</span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('warnings')}
                      className="h-6 text-xs"
                    >
                      {expandedSections.warnings ? 'Ocultar' : 'Ver todas'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {validation.warnings.slice(0, expandedSections.warnings ? undefined : 3).map((warning, index) => {
                      const FieldIcon = getFieldIcon(warning.field);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3"
                        >
                          <FieldIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-yellow-800">
                              {warning.message}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              Campo: {warning.field}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sugerencias */}
              {validation.info.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800 flex items-center space-x-2">
                      <Info className="w-4 h-4" />
                      <span>Sugerencias de Mejora ({validation.info.length})</span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('info')}
                      className="h-6 text-xs"
                    >
                      {expandedSections.info ? 'Ocultar' : 'Ver todas'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {validation.info.slice(0, expandedSections.info ? undefined : 3).map((info, index) => {
                      const FieldIcon = getFieldIcon(info.field);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3"
                        >
                          <FieldIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-blue-800">
                              {info.message}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Campo: {info.field}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Barra de progreso de calidad */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Puntuación de Calidad ISO
                  </span>
                  <span className={`text-sm font-bold ${scoreColor}`}>
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      score >= 90 ? 'bg-green-500' : 
                      score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {score >= 90 ? '✅ Excelente calidad' : 
                   score >= 70 ? '⚠️ Buena calidad, algunas mejoras pendientes' : 
                   '🔴 Requiere atención inmediata'}
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}