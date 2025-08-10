'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { JobPosting } from '@/types/careers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  resume?: File;
  coverLetter?: File;
  experience: string;
  education: string;
  motivationLetter: string;
  availability: string;
  salaryExpectation?: string;
  agreeToTerms: boolean;
  agreeToDataProcessing: boolean;
}

interface ApplicationFormProps {
  job: JobPosting;
  onSubmit?: (data: ApplicationFormData) => void;
  onCancel?: () => void;
  className?: string;
}

const initialFormData: ApplicationFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  experience: '',
  education: '',
  motivationLetter: '',
  availability: '',
  salaryExpectation: '',
  agreeToTerms: false,
  agreeToDataProcessing: false
};

export default function ApplicationForm({ job, onSubmit, onCancel, className }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  const handleInputChange = (field: keyof ApplicationFormData, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
        if (!formData.email.trim()) {
          newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email inválido';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        if (!formData.location.trim()) newErrors.location = 'Ubicación es requerida';
        break;

      case 2:
        if (!formData.experience.trim()) newErrors.experience = 'Experiencia es requerida';
        if (!formData.education.trim()) newErrors.education = 'Educación es requerida';
        if (!formData.motivationLetter.trim()) newErrors.motivationLetter = 'Carta de motivación es requerida';
        if (!formData.availability.trim()) newErrors.availability = 'Disponibilidad es requerida';
        break;

      case 3:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Debe aceptar los términos y condiciones';
        if (!formData.agreeToDataProcessing) newErrors.agreeToDataProcessing = 'Debe autorizar el tratamiento de datos';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Reset form after successful submission
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (field: 'resume' | 'coverLetter', file: File | null) => {
    if (file) {
      handleInputChange(field, file);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombres *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="Ej: Juan Carlos"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={cn("pl-10", errors.firstName && "border-destructive")}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellidos *</Label>
          <Input
            id="lastName"
            placeholder="Ej: Pérez García"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu.email@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn("pl-10", errors.email && "border-destructive")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+51 999 888 777"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={cn("pl-10", errors.phone && "border-destructive")}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación actual *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="location"
            placeholder="Ej: Lima, Perú"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={cn("pl-10", errors.location && "border-destructive")}
          />
        </div>
        {errors.location && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.location}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/tu-perfil"
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio/Web (opcional)</Label>
          <Input
            id="portfolio"
            placeholder="https://tu-portfolio.com"
            value={formData.portfolio}
            onChange={(e) => handleInputChange('portfolio', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="experience">Experiencia laboral *</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Textarea
            id="experience"
            placeholder="Describe tu experiencia laboral relevante, incluyendo cargos, empresas y logros principales..."
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className={cn("pl-10 min-h-24", errors.experience && "border-destructive")}
            rows={4}
          />
        </div>
        {errors.experience && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.experience}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Educación *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Textarea
            id="education"
            placeholder="Detalla tu formación académica, certificaciones y cursos relevantes..."
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className={cn("pl-10 min-h-20", errors.education && "border-destructive")}
            rows={3}
          />
        </div>
        {errors.education && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.education}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivationLetter">¿Por qué quieres trabajar en esta posición? *</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Textarea
            id="motivationLetter"
            placeholder="Explica tu motivación para aplicar a esta posición y cómo puedes contribuir al equipo..."
            value={formData.motivationLetter}
            onChange={(e) => handleInputChange('motivationLetter', e.target.value)}
            className={cn("pl-10 min-h-32", errors.motivationLetter && "border-destructive")}
            rows={5}
          />
        </div>
        {errors.motivationLetter && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.motivationLetter}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilidad de inicio *</Label>
          <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
            <SelectTrigger className={cn(errors.availability && "border-destructive")}>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecciona disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inmediato">Inmediato</SelectItem>
              <SelectItem value="1-semana">1 semana</SelectItem>
              <SelectItem value="2-semanas">2 semanas</SelectItem>
              <SelectItem value="1-mes">1 mes</SelectItem>
              <SelectItem value="2-meses">2 meses</SelectItem>
              <SelectItem value="otro">Otro (especificar en comentarios)</SelectItem>
            </SelectContent>
          </Select>
          {errors.availability && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.availability}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryExpectation">Expectativa salarial (opcional)</Label>
          <Select value={formData.salaryExpectation || ''} onValueChange={(value) => handleInputChange('salaryExpectation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Rango salarial esperado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2000-4000">S/ 2,000 - 4,000</SelectItem>
              <SelectItem value="4000-6000">S/ 4,000 - 6,000</SelectItem>
              <SelectItem value="6000-8000">S/ 6,000 - 8,000</SelectItem>
              <SelectItem value="8000-10000">S/ 8,000 - 10,000</SelectItem>
              <SelectItem value="10000+">S/ 10,000+</SelectItem>
              <SelectItem value="abierto">Abierto a negociación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documentos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>CV/Currículum (opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Arrastra tu CV aquí o haz clic para seleccionar
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload('resume', e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="resume-upload" className="cursor-pointer">
                  Seleccionar archivo
                </label>
              </Button>
              {formData.resume && (
                <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {formData.resume.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Carta de presentación (opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Arrastra tu carta aquí o haz clic para seleccionar
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload('coverLetter', e.target.files?.[0] || null)}
                className="hidden"
                id="cover-letter-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="cover-letter-upload" className="cursor-pointer">
                  Seleccionar archivo
                </label>
              </Button>
              {formData.coverLetter && (
                <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {formData.coverLetter.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consentimientos</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
              className={cn(errors.agreeToTerms && "border-destructive")}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="agreeToTerms" className="text-sm font-medium leading-5">
                Acepto los términos y condiciones *
              </Label>
              <p className="text-xs text-muted-foreground">
                He leído y acepto los términos y condiciones de Métrica DIP
              </p>
            </div>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-destructive flex items-center gap-1 ml-6">
              <AlertCircle className="w-4 h-4" />
              {errors.agreeToTerms}
            </p>
          )}

          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToDataProcessing"
              checked={formData.agreeToDataProcessing}
              onCheckedChange={(checked) => handleInputChange('agreeToDataProcessing', !!checked)}
              className={cn(errors.agreeToDataProcessing && "border-destructive")}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="agreeToDataProcessing" className="text-sm font-medium leading-5">
                Autorizo el tratamiento de mis datos personales *
              </Label>
              <p className="text-xs text-muted-foreground">
                Autorizo a Métrica DIP a procesar mis datos para fines de reclutamiento
              </p>
            </div>
          </div>
          {errors.agreeToDataProcessing && (
            <p className="text-sm text-destructive flex items-center gap-1 ml-6">
              <AlertCircle className="w-4 h-4" />
              {errors.agreeToDataProcessing}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("max-w-2xl mx-auto p-8", className)}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Aplicar a {job.title}
        </h2>
        <p className="text-muted-foreground">
          Completa el formulario para enviar tu aplicación
        </p>
        
        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between pt-8 mt-8 border-t border-border">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
              >
                Anterior
              </Button>
            )}
            {onCancel && currentStep === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>

          <div>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Aplicación'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}