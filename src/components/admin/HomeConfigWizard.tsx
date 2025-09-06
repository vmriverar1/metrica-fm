'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  Info,
  Sparkles,
  FileText,
  BarChart3,
  Wrench,
  Briefcase,
  Building2,
  Shield,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface HomeConfigWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: string[];
  required: boolean;
}

const HomeConfigWizard: React.FC<HomeConfigWizardProps> = ({
  onComplete,
  onCancel,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'basic_info',
      title: 'Información Básica',
      description: 'Configura los metadatos principales de tu página',
      icon: FileText,
      fields: ['page.title', 'page.description'],
      required: true
    },
    {
      id: 'hero_section',
      title: 'Hero y Presentación',
      description: 'Define el encabezado principal que verán los visitantes',
      icon: Sparkles,
      fields: ['hero.title.main', 'hero.title.secondary', 'hero.subtitle'],
      required: true
    },
    {
      id: 'rotating_words',
      title: 'Palabras Rotatorias',
      description: 'Agrega palabras clave que describan tu empresa',
      icon: BarChart3,
      fields: ['hero.rotating_words'],
      required: false
    },
    {
      id: 'statistics',
      title: 'Estadísticas Clave',
      description: 'Muestra los números que impresionan a tus clientes',
      icon: BarChart3,
      fields: ['stats.statistics'],
      required: false
    },
    {
      id: 'main_service',
      title: 'Servicio Principal',
      description: 'Define tu oferta de valor principal (DIP)',
      icon: Wrench,
      fields: ['services.main_service'],
      required: true
    },
    {
      id: 'secondary_services',
      title: 'Servicios Secundarios',
      description: 'Agrega hasta 4 servicios complementarios',
      icon: Briefcase,
      fields: ['services.secondary_services'],
      required: false
    },
    {
      id: 'featured_projects',
      title: 'Proyectos Destacados',
      description: 'Selecciona 4 proyectos que mejor representen tu trabajo',
      icon: Building2,
      fields: ['portfolio.featured_projects'],
      required: false
    },
    {
      id: 'company_policies',
      title: 'Políticas Corporativas',
      description: 'Define las políticas y compromisos de tu empresa',
      icon: Shield,
      fields: ['policies.policies'],
      required: false
    },
    {
      id: 'newsletter',
      title: 'Newsletter y Contacto',
      description: 'Configura la sección de suscripción',
      icon: Mail,
      fields: ['newsletter.section'],
      required: false
    }
  ];

  useEffect(() => {
    validateCurrentStep();
  }, [currentStep, formData]);

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const stepErrors: Record<string, string> = {};
    let valid = true;

    if (step.required) {
      step.fields.forEach(field => {
        const value = getNestedValue(formData, field);
        if (!value || (Array.isArray(value) && value.length === 0)) {
          stepErrors[field] = `${field} es requerido`;
          valid = false;
        }
      });
    }

    setErrors(stepErrors);
    setIsValid(valid);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((o, k) => {
      if (!(k in o)) o[k] = {};
      return o[k];
    }, obj);
    target[lastKey] = value;
    return { ...obj };
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => setNestedValue(prev, field, value));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const handleSkipStep = () => {
    handleNext();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  // Step Content Renderers
  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título de la Página *
        </label>
        <Input
          value={getNestedValue(formData, 'page.title') || ''}
          onChange={(e) => handleFieldChange('page.title', e.target.value)}
          placeholder="ej: Métrica FM - Dirección Integral de Proyectos"
          maxLength={60}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(getNestedValue(formData, 'page.title') || '').length}/60 caracteres
        </p>
        {errors['page.title'] && (
          <p className="text-red-500 text-sm mt-1">{errors['page.title']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Meta *
        </label>
        <Textarea
          value={getNestedValue(formData, 'page.description') || ''}
          onChange={(e) => handleFieldChange('page.description', e.target.value)}
          placeholder="Descripción para motores de búsqueda y redes sociales..."
          rows={3}
          maxLength={160}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(getNestedValue(formData, 'page.description') || '').length}/160 caracteres
        </p>
        {errors['page.description'] && (
          <p className="text-red-500 text-sm mt-1">{errors['page.description']}</p>
        )}
      </div>
    </div>
  );

  const renderHeroSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Principal *
          </label>
          <Input
            value={getNestedValue(formData, 'hero.title.main') || ''}
            onChange={(e) => handleFieldChange('hero.title.main', e.target.value)}
            placeholder="ej: Métrica"
            maxLength={25}
          />
          {errors['hero.title.main'] && (
            <p className="text-red-500 text-sm mt-1">{errors['hero.title.main']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Secundario *
          </label>
          <Input
            value={getNestedValue(formData, 'hero.title.secondary') || ''}
            onChange={(e) => handleFieldChange('hero.title.secondary', e.target.value)}
            placeholder="ej: DIP"
            maxLength={25}
          />
          {errors['hero.title.secondary'] && (
            <p className="text-red-500 text-sm mt-1">{errors['hero.title.secondary']}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtítulo *
        </label>
        <Textarea
          value={getNestedValue(formData, 'hero.subtitle') || ''}
          onChange={(e) => handleFieldChange('hero.subtitle', e.target.value)}
          placeholder="Una frase que resuma tu propuesta de valor..."
          rows={2}
          maxLength={150}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(getNestedValue(formData, 'hero.subtitle') || '').length}/150 caracteres
        </p>
        {errors['hero.subtitle'] && (
          <p className="text-red-500 text-sm mt-1">{errors['hero.subtitle']}</p>
        )}
      </div>
    </div>
  );

  const renderRotatingWords = () => {
    const words = getNestedValue(formData, 'hero.rotating_words') || [];

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palabras Rotatorias (3-8 palabras)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Estas palabras aparecerán en rotación para describir tu empresa. Ejemplo: "Innovación", "Calidad", "Excelencia"
          </p>
          
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <Input
                key={index}
                value={words[index] || ''}
                onChange={(e) => {
                  const newWords = [...words];
                  if (e.target.value) {
                    newWords[index] = e.target.value;
                  } else {
                    newWords.splice(index, 1);
                  }
                  handleFieldChange('hero.rotating_words', newWords.filter(w => w));
                }}
                placeholder={`Palabra ${index + 1}${index < 3 ? ' (requerida)' : ' (opcional)'}`}
                maxLength={15}
              />
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
            <div className="flex flex-wrap gap-2">
              {words.map((word: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericStep = () => (
    <div className="text-center py-8">
      <currentStepData.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {currentStepData.title}
      </h3>
      <p className="text-gray-600 mb-6">
        Esta sección se configurará con los componentes especializados implementados en la Fase 2.
      </p>
      <Badge variant="outline">
        {currentStepData.required ? 'Requerido' : 'Opcional'}
      </Badge>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basic_info':
        return renderBasicInfo();
      case 'hero_section':
        return renderHeroSection();
      case 'rotating_words':
        return renderRotatingWords();
      default:
        return renderGenericStep();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Wizard de Configuración Inicial
            </CardTitle>
            <CardDescription>
              Te guiaremos paso a paso para configurar tu página principal
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Paso {currentStep + 1} de {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(progress)}% completado
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center space-x-2 mt-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 p-2 rounded-lg text-sm whitespace-nowrap ${
                index === currentStep
                  ? 'bg-blue-100 text-blue-800'
                  : index < currentStep
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <currentStepData.icon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-gray-600 text-sm">{currentStepData.description}</p>
            </div>
            {currentStepData.required && (
              <Badge variant="destructive" className="ml-auto">
                Requerido
              </Badge>
            )}
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            {!currentStepData.required && currentStep < steps.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkipStep}
                className="text-gray-600"
              >
                Omitir Paso
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Completar Setup
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStepData.required && !isValid}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                💡 Consejo para este paso:
              </h4>
              <p className="text-sm text-blue-800">
                {currentStepData.id === 'basic_info' && 
                  'Use palabras clave relevantes para mejorar el SEO. El título aparecerá en Google y redes sociales.'}
                {currentStepData.id === 'hero_section' && 
                  'Mantenga el título corto e impactante. El subtítulo puede explicar más detalladamente qué hace su empresa.'}
                {currentStepData.id === 'rotating_words' && 
                  'Use palabras de acción cortas que representen los valores de su empresa. Evite términos muy técnicos.'}
                {!['basic_info', 'hero_section', 'rotating_words'].includes(currentStepData.id) &&
                  'Esta sección se configurará usando los editores especializados implementados en la Fase 2.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeConfigWizard;