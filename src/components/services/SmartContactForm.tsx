'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';

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

export default function SmartContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');

  // Calculate estimated project fee based on selections
  useEffect(() => {
    if (formData.service && formData.budget && formData.budget !== 'confidencial') {
      const budget = budgetRanges.find(b => b.value === formData.budget);
      if (budget) {
        const feePercentage = getFeePercentage(formData.service);
        const estimatedFee = ((budget.min + budget.max) / 2) * feePercentage / 100;
        setEstimatedBudget(formatCurrency(estimatedFee));
      }
    }
  }, [formData.service, formData.budget]);

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
      if (!formData.name) newErrors.name = 'Nombre es requerido';
      if (!formData.email) newErrors.email = 'Email es requerido';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.phone) newErrors.phone = 'Teléfono es requerido';
    }

    if (step === 2) {
      if (!formData.service) newErrors.service = 'Selecciona un servicio';
      if (!formData.timeline) newErrors.timeline = 'Selecciona un timeline';
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
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
                Consulta Personalizada Gratuita
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Cuéntanos sobre tu proyecto y te conectaremos con el especialista adecuado
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <Card className="lg:col-span-2 p-8">
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
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                          placeholder="Tu nombre completo"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          placeholder="tu@empresa.com"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Teléfono *
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                          placeholder="+51 999 999 999"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Empresa
                        </label>
                        <Input
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                          placeholder="Nombre de tu empresa"
                        />
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
                          value={formData.service} 
                          onValueChange={(value) => setFormData(prev => ({...prev, service: value, projectType: ''}))}
                        >
                          <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.service && (
                          <p className="text-red-500 text-xs mt-1">{errors.service}</p>
                        )}
                      </div>

                      {formData.service && projectTypes[formData.service as keyof typeof projectTypes] && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Tipo de Proyecto
                          </label>
                          <Select 
                            value={formData.projectType} 
                            onValueChange={(value) => setFormData(prev => ({...prev, projectType: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de proyecto" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectTypes[formData.service as keyof typeof projectTypes]?.map((type) => (
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
                          value={formData.budget} 
                          onValueChange={(value) => setFormData(prev => ({...prev, budget: value}))}
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
                          value={formData.timeline} 
                          onValueChange={(value) => setFormData(prev => ({...prev, timeline: value}))}
                        >
                          <SelectTrigger className={errors.timeline ? 'border-red-500' : ''}>
                            <SelectValue placeholder="¿Cuándo necesitas comenzar?" />
                          </SelectTrigger>
                          <SelectContent>
                            {timelines.map((timeline) => (
                              <SelectItem key={timeline.value} value={timeline.value}>
                                <div className="flex items-center gap-2">
                                  {timeline.label}
                                  {timeline.urgency === 'high' && (
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
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                        placeholder="Describe tu proyecto, objetivos, desafíos específicos, o cualquier pregunta que tengas..."
                        rows={6}
                        className="resize-none"
                      />
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
                      <span>+51 1 234 5678</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>proyectos@metrica-dip.com</span>
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
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">¿Por qué Métrica DIP?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>15+ años de experiencia</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>ISO 9001 Certificado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>300+ proyectos exitosos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>99% satisfacción del cliente</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Respuesta en 24 horas</span>
                    </div>
                  </div>
                </Card>
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