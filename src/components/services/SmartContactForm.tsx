'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  Send,
  Calculator,
  Clock,
  DollarSign,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
}

const services = [
  { value: 'consultoria-estrategica', label: 'Consultoría Estratégica' },
  { value: 'gestion-integral', label: 'Gestión Integral' },
  { value: 'supervision-tecnica', label: 'Supervisión Técnica' },
  { value: 'desarrollo-inmobiliario', label: 'Desarrollo Inmobiliario' },
  { value: 'project-management', label: 'Project Management' },
  { value: 'control-calidad', label: 'Control de Calidad' },
  { value: 'sostenibilidad', label: 'Sostenibilidad & Certificación' },
  { value: 'transformacion-digital', label: 'Transformación Digital' },
  { value: 'bim-tecnologia', label: 'BIM & Tecnología' },
  { value: 'no-estoy-seguro', label: 'No estoy seguro / Consulta general' }
];

const projectTypes = {
  'consultoria-estrategica': [
    'Estudio de Factibilidad',
    'Due Diligence Técnico',
    'Planificación Estratégica',
    'Análisis de Riesgos'
  ],
  'gestion-integral': [
    'Torre Corporativa',
    'Centro Comercial',
    'Proyecto Residencial',
    'Infraestructura Industrial'
  ],
  'supervision-tecnica': [
    'Supervisión de Obra',
    'Control de Calidad',
    'Inspecciones Técnicas',
    'Validación de Entregables'
  ],
  'desarrollo-inmobiliario': [
    'Proyecto Residencial',
    'Desarrollo Comercial',
    'Mixed-Use Development',
    'Renovación Urbana'
  ]
};

const budgetRanges = [
  { value: '100k-500k', label: 'S/ 100K - 500K', min: 100000, max: 500000 },
  { value: '500k-1m', label: 'S/ 500K - 1M', min: 500000, max: 1000000 },
  { value: '1m-5m', label: 'S/ 1M - 5M', min: 1000000, max: 5000000 },
  { value: '5m-20m', label: 'S/ 5M - 20M', min: 5000000, max: 20000000 },
  { value: '20m-50m', label: 'S/ 20M - 50M', min: 20000000, max: 50000000 },
  { value: '50m+', label: 'S/ 50M+', min: 50000000, max: 100000000 },
  { value: 'confidencial', label: 'Prefiero no especificar', min: 0, max: 0 }
];

const timelines = [
  { value: 'inmediato', label: 'Inmediato (< 1 mes)', urgency: 'high' },
  { value: '1-3-meses', label: '1 - 3 meses', urgency: 'medium' },
  { value: '3-6-meses', label: '3 - 6 meses', urgency: 'medium' },
  { value: '6-12-meses', label: '6 - 12 meses', urgency: 'low' },
  { value: '12m+', label: 'Más de 1 año', urgency: 'low' },
  { value: 'exploratorio', label: 'Solo explorando opciones', urgency: 'low' }
];

interface WhyChooseUsData {
  title: string;
  benefits: Array<{
    id: string;
    text: string;
    icon: string;
  }>;
}

export default function SmartContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validación con hook mejorado
  const formValidation = useEnhancedFormValidation({
    name: { type: 'name', required: true, label: 'Nombre' },
    email: { type: 'email', required: true, label: 'Email' },
    phone: { type: 'phone', required: true, label: 'Teléfono' },
    company: { type: 'company', required: false, label: 'Empresa' },
    message: { type: 'message', required: false, label: 'Mensaje', minLength: 10, maxLength: 1000 }
  });

  // Estados para campos no validados (selects)
  const [service, setService] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [whyChooseUsData, setWhyChooseUsData] = useState<WhyChooseUsData | null>(null);

  // Calculate estimated project fee based on selections
  useEffect(() => {
    if (service && budget && budget !== 'confidencial') {
      const budgetRange = budgetRanges.find(b => b.value === budget);
      if (budgetRange) {
        const feePercentage = getFeePercentage(service);
        const estimatedFee = ((budgetRange.min + budgetRange.max) / 2) * feePercentage / 100;
        setEstimatedBudget(formatCurrency(estimatedFee));
      }
    }
  }, [service, budget]);

  // Load Why Choose Us data from Firestore
  useEffect(() => {
    const loadWhyChooseUsData = async () => {
      try {
        const response = await fetch('/api/admin/pages/services');
        const result = await response.json();

        if (result.success && result.data?.contact_form?.why_choose_us) {
          setWhyChooseUsData(result.data.contact_form.why_choose_us);
        } else {
          // Datos por defecto si no hay en Firestore
          setWhyChooseUsData({
            title: '¿Por qué Métrica FM?',
            benefits: [
              { id: 'exp1', text: '10+ años de experiencia', icon: 'CheckCircle2' },
              { id: 'exp2', text: 'ISO 9001 Certificado', icon: 'CheckCircle2' },
              { id: 'exp3', text: '300+ proyectos exitosos', icon: 'CheckCircle2' },
              { id: 'exp4', text: '99% satisfacción del cliente', icon: 'CheckCircle2' },
              { id: 'exp5', text: 'Respuesta en 48 horas', icon: 'CheckCircle2' }
            ]
          });
        }
      } catch (error) {
        console.error('Error loading why-choose-us data:', error);
        // Datos por defecto en caso de error
        setWhyChooseUsData({
          title: '¿Por qué Métrica FM?',
          benefits: [
            { id: 'exp1', text: '10+ años de experiencia', icon: 'CheckCircle2' },
            { id: 'exp2', text: 'ISO 9001 Certificado', icon: 'CheckCircle2' },
            { id: 'exp3', text: '300+ proyectos exitosos', icon: 'CheckCircle2' },
            { id: 'exp4', text: '99% satisfacción del cliente', icon: 'CheckCircle2' },
            { id: 'exp5', text: 'Respuesta en 48 horas', icon: 'CheckCircle2' }
          ]
        });
      }
    };

    loadWhyChooseUsData();
  }, []);

  const getFeePercentage = (service: string): number => {
    const feeMap: Record<string, number> = {
      'consultoria-estrategica': 8,
      'gestion-integral': 12,
      'supervision-tecnica': 6,
      'desarrollo-inmobiliario': 15,
      'project-management': 10,
      'control-calidad': 5,
      'sostenibilidad': 7,
      'transformacion-digital': 9,
      'bim-tecnologia': 8
    };
    return feeMap[service] || 10;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `S/ ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `S/ ${(amount / 1000).toFixed(0)}K`;
    }
    return `S/ ${amount.toLocaleString()}`;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validar todos los campos de Step 1 con el hook
      const nameValid = formValidation.validateFieldImmediate('name', formValidation.getFieldState('name').value);
      const emailValid = formValidation.validateFieldImmediate('email', formValidation.getFieldState('email').value);
      const phoneValid = formValidation.validateFieldImmediate('phone', formValidation.getFieldState('phone').value);

      if (!nameValid) {
        const error = formValidation.getFieldError('name');
        if (error) newErrors.name = error;
      }
      if (!emailValid) {
        const error = formValidation.getFieldError('email');
        if (error) newErrors.email = error;
      }
      if (!phoneValid) {
        const error = formValidation.getFieldError('phone');
        if (error) newErrors.phone = error;
      }
    }

    if (step === 2) {
      if (!service) newErrors.service = 'Selecciona un servicio';
      if (!timeline) newErrors.timeline = 'Selecciona un timeline';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('smart_contact_form_submit');

      // Obtener valores validados
      const formValues = formValidation.getFormValues();

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            company: formValues.company || '',
            service: service,
            projectType: projectType,
            budget: budget,
            timeline: timeline,
            message: formValues.message || '',
            // Campos ocultos de tracking
            form_name: 'Smart Contact Form - Servicios',
            page_url: '/services',
            form_location: 'services_page_smart_form'
          },
          formType: 'smart-contact',
          requiredFields: ['name', 'email', 'phone', 'service'],
          recaptchaToken: recaptchaToken
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar el formulario');
      }

      console.log('Form submitted successfully:', result);
      setIsSubmitted(true);

      // Reset form after 4 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep(1);
        formValidation.resetForm();
        setService('');
        setProjectType('');
        setBudget('');
        setTimeline('');
      }, 4000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Error al enviar el formulario. Por favor intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SectionTransition variant="slide" />
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="mb-8">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  ¡Consulta Enviada Exitosamente!
                </h2>
                <p className="text-muted-foreground text-lg">
                  Hemos recibido tu consulta. Nuestro equipo especializado se pondrá en contacto contigo 
                  en las próximas 24 horas para agendar una reunión.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="p-6 text-left">
                  <h3 className="font-semibold mb-4">Próximos pasos:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</div>
                      <span className="text-sm">Revisión interna de tu consulta (2-4 horas)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</div>
                      <span className="text-sm">Llamada de nuestro especialista (24 horas)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</div>
                      <span className="text-sm">Reunión personalizada y propuesta (3-5 días)</span>
                    </div>
                  </div>
                </Card>
                
                <Button onClick={() => window.location.href = '/'} className="mt-6">
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SectionTransition variant="slide" />
      
      <section id="contact-form" className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Consulta Personalizada
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Cuéntanos sobre tu proyecto y te conectaremos con el especialista adecuado
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <Card className="lg:col-span-2 p-8 relative">
                {/* Loading Overlay */}
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg"
                  >
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Enviando tu consulta...
                    </h3>
                    <p className="text-muted-foreground text-center px-4">
                      Por favor espera mientras procesamos tu información
                    </p>
                  </motion.div>
                )}

                {/* Error Alert */}
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Error al enviar</h4>
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  </motion.div>
                )}

                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Paso {currentStep} de 3
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {Math.round((currentStep / 3) * 100)}% completado
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div 
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / 3) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Información de Contacto
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Nombre Completo *
                        </label>
                        <Input
                          value={formValidation.getFieldState('name').value}
                          onChange={(e) => formValidation.handleFieldChange('name', e.target.value)}
                          onBlur={() => formValidation.handleFieldBlur('name')}
                          placeholder="Tu nombre completo"
                          className={cn(
                            formValidation.hasFieldError('name')
                              ? 'border-red-500'
                              : formValidation.isFieldValid('name')
                              ? 'border-green-500'
                              : ''
                          )}
                        />
                        {formValidation.hasFieldError('name') && (
                          <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('name')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formValidation.getFieldState('email').value}
                          onChange={(e) => formValidation.handleFieldChange('email', e.target.value)}
                          onBlur={() => formValidation.handleFieldBlur('email')}
                          placeholder="tu@empresa.com"
                          className={cn(
                            formValidation.hasFieldError('email')
                              ? 'border-red-500'
                              : formValidation.isFieldValid('email')
                              ? 'border-green-500'
                              : ''
                          )}
                        />
                        {formValidation.hasFieldError('email') && (
                          <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('email')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Teléfono *
                        </label>
                        <Input
                          value={formValidation.getFieldState('phone').value}
                          onChange={(e) => formValidation.handleFieldChange('phone', e.target.value)}
                          onBlur={() => formValidation.handleFieldBlur('phone')}
                          placeholder="+51 999 999 999"
                          className={cn(
                            formValidation.hasFieldError('phone')
                              ? 'border-red-500'
                              : formValidation.isFieldValid('phone')
                              ? 'border-green-500'
                              : ''
                          )}
                        />
                        {formValidation.hasFieldError('phone') && (
                          <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('phone')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Empresa
                        </label>
                        <Input
                          value={formValidation.getFieldState('company').value}
                          onChange={(e) => formValidation.handleFieldChange('company', e.target.value)}
                          onBlur={() => formValidation.handleFieldBlur('company')}
                          placeholder="Nombre de tu empresa"
                          className={cn(
                            formValidation.hasFieldError('company')
                              ? 'border-red-500'
                              : formValidation.isFieldValid('company')
                              ? 'border-green-500'
                              : ''
                          )}
                        />
                        {formValidation.hasFieldError('company') && (
                          <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('company')}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleNext} className="px-8">
                        Siguiente
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Project Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Detalles del Proyecto
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          ¿Qué servicio necesitas? *
                        </label>
                        <Select
                          value={service}
                          onValueChange={(value) => {
                            setService(value);
                            setProjectType('');
                          }}
                        >
                          <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((serviceItem) => (
                              <SelectItem key={serviceItem.value} value={serviceItem.value}>
                                {serviceItem.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.service && (
                          <p className="text-red-500 text-xs mt-1">{errors.service}</p>
                        )}
                      </div>

                      {service && projectTypes[service as keyof typeof projectTypes] && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Tipo de Proyecto
                          </label>
                          <Select
                            value={projectType}
                            onValueChange={(value) => setProjectType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de proyecto" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectTypes[service as keyof typeof projectTypes]?.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Presupuesto Estimado del Proyecto
                        </label>
                        <Select
                          value={budget}
                          onValueChange={(value) => setBudget(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el rango de presupuesto" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Timeline del Proyecto *
                        </label>
                        <Select
                          value={timeline}
                          onValueChange={(value) => setTimeline(value)}
                        >
                          <SelectTrigger className={errors.timeline ? 'border-red-500' : ''}>
                            <SelectValue placeholder="¿Cuándo necesitas comenzar?" />
                          </SelectTrigger>
                          <SelectContent>
                            {timelines.map((timelineItem) => (
                              <SelectItem key={timelineItem.value} value={timelineItem.value}>
                                <div className="flex items-center gap-2">
                                  {timelineItem.label}
                                  {timelineItem.urgency === 'high' && (
                                    <Badge variant="destructive" className="ml-2 text-xs">Urgente</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.timeline && (
                          <p className="text-red-500 text-xs mt-1">{errors.timeline}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(1)}
                      >
                        Anterior
                      </Button>
                      <Button onClick={handleNext} className="px-8">
                        Siguiente
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Message & Review */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Mensaje Adicional
                      </h3>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Cuéntanos más sobre tu proyecto
                      </label>
                      <Textarea
                        value={formValidation.getFieldState('message').value}
                        onChange={(e) => formValidation.handleFieldChange('message', e.target.value)}
                        onBlur={() => formValidation.handleFieldBlur('message')}
                        placeholder="Describe tu proyecto, objetivos, desafíos específicos, o cualquier pregunta que tengas..."
                        rows={6}
                        className={cn(
                          'resize-none',
                          formValidation.hasFieldError('message')
                            ? 'border-red-500'
                            : formValidation.isFieldValid('message')
                            ? 'border-green-500'
                            : ''
                        )}
                      />
                      {formValidation.hasFieldError('message') && (
                        <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('message')}</p>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                      >
                        Anterior
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="px-8"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Contacto Directo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>+51 989 742 678 </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>info@metricadip.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Lun - Vie: 8:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </Card>

                {/* Estimated Budget */}
                {estimatedBudget && (
                  <Card className="p-6 border-primary/20 bg-primary/5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Estimación de Honorarios
                    </h3>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {estimatedBudget}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estimación aproximada. El costo final dependerá de la complejidad y alcance específico del proyecto.
                    </p>
                  </Card>
                )}

                {/* Why Choose Us */}
                {whyChooseUsData && whyChooseUsData.benefits && Array.isArray(whyChooseUsData.benefits) && whyChooseUsData.benefits.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">{whyChooseUsData.title || '¿Por qué Métrica FM?'}</h3>
                    <div className="space-y-3 text-sm">
                      {whyChooseUsData.benefits.map((benefit) => (
                        <div key={benefit.id || Math.random()} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit.text || ''}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      </section>
    </>
  );
}