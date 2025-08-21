'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ValidationRule } from '@/lib/validation/SmartValidator';

interface ValidationPanelProps {
  validationResult: any;
  isValidating: boolean;
  onApplyAutoFix?: (field: string, value: any) => void;
  onValidate?: () => void;
  compact?: boolean;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  isValidating,
  onApplyAutoFix,
  onValidate,
  compact = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    suggestions: true,
    errors: true,
    warnings: false,
    infos: false
  });

  if (!validationResult) {
    return (
      <Card className="border-gray-200">
        <CardContent className="text-center py-8">
          <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Validación no disponible</p>
        </CardContent>
      </Card>
    );
  }

  const { rules = [], score = 100, suggestions = [], autoFixes = {} } = validationResult;
  
  const rulesBySeverity = {
    error: rules.filter((r: ValidationRule) => r.severity === 'error'),
    warning: rules.filter((r: ValidationRule) => r.severity === 'warning'),
    info: rules.filter((r: ValidationRule) => r.severity === 'info'),
    success: rules.filter((r: ValidationRule) => r.severity === 'success')
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const RuleItem = ({ rule }: { rule: ValidationRule }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">
        {getSeverityIcon(rule.severity)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {rule.field.split('.').pop()}
          </Badge>
          <span className="text-xs text-gray-500 capitalize">
            {rule.type}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 mb-1">
          {rule.message}
        </p>
        {rule.suggestion && (
          <p className="text-xs text-gray-600">
            💡 {rule.suggestion}
          </p>
        )}
        {rule.autoFix && onApplyAutoFix && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onApplyAutoFix(rule.field, rule.autoFix)}
            className="mt-2 h-6 text-xs"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Auto-corregir
          </Button>
        )}
      </div>
    </div>
  );

  const SeveritySection = ({ 
    severity, 
    rules, 
    title, 
    icon 
  }: { 
    severity: string; 
    rules: ValidationRule[]; 
    title: string; 
    icon: React.ReactNode;
  }) => {
    if (rules.length === 0) return null;

    const isExpanded = expandedSections[severity];

    return (
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection(severity)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            <Badge variant="secondary">{rules.length}</Badge>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="border-t p-3 space-y-3">
            {rules.map((rule, index) => (
              <RuleItem key={index} rule={rule} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <Card className={`${getScoreBgColor(score)} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div className="space-y-1">
                {rulesBySeverity.error.length > 0 && (
                  <Badge variant="destructive" className="mr-1">
                    {rulesBySeverity.error.length} errores
                  </Badge>
                )}
                {rulesBySeverity.warning.length > 0 && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 mr-1">
                    {rulesBySeverity.warning.length} avisos
                  </Badge>
                )}
              </div>
            </div>
            
            {onValidate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Validación Inteligente
            </CardTitle>
            <CardDescription>
              Análisis en tiempo real con sugerencias de mejora
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`text-center px-3 py-2 rounded-lg ${getScoreBgColor(score)} border-2`}>
              <div className={`text-xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            
            {onValidate && (
              <Button
                type="button"
                variant="outline"
                onClick={onValidate}
                disabled={isValidating}
                size="sm"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Score Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Calidad del Contenido</span>
            <span className="text-sm text-gray-600">{score}/100</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1 text-sm">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{rulesBySeverity.error.length} errores</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>{rulesBySeverity.warning.length} avisos</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Info className="h-4 w-4 text-blue-500" />
            <span>{rulesBySeverity.info.length} sugerencias</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{rulesBySeverity.success.length} aciertos</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Sugerencias Principales</h4>
            </div>
            <ul className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Auto-fixes Available */}
        {Object.keys(autoFixes).length > 0 && onApplyAutoFix && (
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Correcciones Automáticas</h4>
                <Badge variant="secondary">{Object.keys(autoFixes).length}</Badge>
              </div>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Hay correcciones automáticas disponibles para algunos campos.
            </p>
          </div>
        )}

        {/* Validation Rules by Severity */}
        <div className="space-y-3">
          <SeveritySection
            severity="errors"
            rules={rulesBySeverity.error}
            title="Errores Críticos"
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
          />
          
          <SeveritySection
            severity="warnings"
            rules={rulesBySeverity.warning}
            title="Avisos Importantes"
            icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
          />
          
          <SeveritySection
            severity="infos"
            rules={rulesBySeverity.info}
            title="Sugerencias de Mejora"
            icon={<Info className="h-4 w-4 text-blue-500" />}
          />
          
          <SeveritySection
            severity="success"
            rules={rulesBySeverity.success}
            title="Aspectos Positivos"
            icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          />
        </div>

        {/* Tips */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Consejos de Validación:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• La validación se ejecuta automáticamente al escribir</li>
            <li>• Los errores críticos deben corregirse antes de publicar</li>
            <li>• Las sugerencias mejoran SEO y experiencia de usuario</li>
            <li>• Use las correcciones automáticas cuando estén disponibles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationPanel;