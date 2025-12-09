'use client';

import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { uploadJobApplicationFile, validateFile, formatFileSize } from '@/lib/storage/file-upload-service';
import { Progress } from '@/components/ui/progress';

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
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validación con hook mejorado
  const formValidation = useEnhancedFormValidation({
    firstName: { type: 'name', required: true, label: 'Nombres' },
    lastName: { type: 'name', required: true, label: 'Apellidos' },
    email: { type: 'email', required: true, label: 'Email' },
    phone: { type: 'phone', required: true, label: 'Teléfono' },
    location: { type: 'company', required: true, label: 'Ubicación' },
    linkedin: { type: 'linkedin', required: false, label: 'LinkedIn' },
    portfolio: { type: 'portfolio', required: false, label: 'Portfolio' },
    motivationLetter: { type: 'message', required: true, label: 'Carta de motivación', minLength: 50, maxLength: 1000 }
  });

  // Estados para campos no validados
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [availability, setAvailability] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [resume, setResume] = useState<File | undefined>();
  const [coverLetter, setCoverLetter] = useState<File | undefined>();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToDataProcessing, setAgreeToDataProcessing] = useState(false);

  // Estados para subida de archivos a Firebase Storage
  const [resumeURL, setResumeURL] = useState<string>('');
  const [coverLetterURL, setCoverLetterURL] = useState<string>('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [coverLetterProgress, setCoverLetterProgress] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // Validar campos de Step 1 con el hook
        const firstNameValid = formValidation.validateFieldImmediate('firstName', formValidation.getFieldState('firstName').value);
        const lastNameValid = formValidation.validateFieldImmediate('lastName', formValidation.getFieldState('lastName').value);
        const emailValid = formValidation.validateFieldImmediate('email', formValidation.getFieldState('email').value);
        const phoneValid = formValidation.validateFieldImmediate('phone', formValidation.getFieldState('phone').value);
        const locationValid = formValidation.validateFieldImmediate('location', formValidation.getFieldState('location').value);

        if (!firstNameValid) {
          const error = formValidation.getFieldError('firstName');
          if (error) newErrors.firstName = error;
        }
        if (!lastNameValid) {
          const error = formValidation.getFieldError('lastName');
          if (error) newErrors.lastName = error;
        }
        if (!emailValid) {
          const error = formValidation.getFieldError('email');
          if (error) newErrors.email = error;
        }
        if (!phoneValid) {
          const error = formValidation.getFieldError('phone');
          if (error) newErrors.phone = error;
        }
        if (!locationValid) {
          const error = formValidation.getFieldError('location');
          if (error) newErrors.location = error;
        }

        // Validar LinkedIn y Portfolio si tienen valores
        if (formValidation.getFieldState('linkedin').value) {
          const linkedinValid = formValidation.validateFieldImmediate('linkedin', formValidation.getFieldState('linkedin').value);
          if (!linkedinValid) {
            const error = formValidation.getFieldError('linkedin');
            if (error) newErrors.linkedin = error;
          }
        }
        if (formValidation.getFieldState('portfolio').value) {
          const portfolioValid = formValidation.validateFieldImmediate('portfolio', formValidation.getFieldState('portfolio').value);
          if (!portfolioValid) {
            const error = formValidation.getFieldError('portfolio');
            if (error) newErrors.portfolio = error;
          }
        }
        break;

      case 2:
        if (!experience.trim()) newErrors.experience = 'Experiencia es requerida';
        if (!education.trim()) newErrors.education = 'Educación es requerida';

        const motivationValid = formValidation.validateFieldImmediate('motivationLetter', formValidation.getFieldState('motivationLetter').value);
        if (!motivationValid) {
          const error = formValidation.getFieldError('motivationLetter');
          if (error) newErrors.motivationLetter = error;
        }

        if (!availability.trim()) newErrors.availability = 'Disponibilidad es requerida';
        break;

      case 3:
        if (!agreeToTerms) newErrors.agreeToTerms = 'Debe aceptar los términos y condiciones';
        if (!agreeToDataProcessing) newErrors.agreeToDataProcessing = 'Debe autorizar el tratamiento de datos';
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
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('application_form_submit');

      // Obtener valores validados
      const formValues = formValidation.getFormValues();

      // Preparar datos del formulario con URLs de archivos subidos a Storage
      const submissionData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        location: formValues.location,
        linkedin: formValues.linkedin || '',
        portfolio: formValues.portfolio || '',
        experience: experience,
        education: education,
        motivationLetter: formValues.motivationLetter,
        availability: availability,
        salaryExpectation: salaryExpectation || '',
        resumeURL: resumeURL || '',
        coverLetterURL: coverLetterURL || '',
        jobTitle: job.title,
        jobId: job.id,
        department: job.department
      };

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            ...submissionData,
            // Campos ocultos de tracking
            form_name: 'Formulario de Aplicación de Trabajo',
            page_url: '/careers',
            form_location: 'careers_page_application_form'
          },
          formType: 'application',
          requiredFields: ['firstName', 'lastName', 'email', 'phone', 'experience', 'education', 'motivationLetter'],
          recaptchaToken: recaptchaToken
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar la aplicación');
      }

      console.log('Application submitted successfully:', result);

      // Call onSubmit callback with the data
      if (onSubmit) {
        const callbackData: ApplicationFormData = {
          ...submissionData,
          resume: resume,
          coverLetter: coverLetter,
          agreeToTerms: agreeToTerms,
          agreeToDataProcessing: agreeToDataProcessing
        };
        onSubmit(callbackData);
      }

      // Reset form after successful submission
      alert('¡Aplicación enviada exitosamente! Nos pondremos en contacto contigo pronto.');
      formValidation.resetForm();
      setExperience('');
      setEducation('');
      setAvailability('');
      setSalaryExpectation('');
      setResume(undefined);
      setCoverLetter(undefined);
      setAgreeToTerms(false);
      setAgreeToDataProcessing(false);
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Error al enviar la aplicación. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (field: 'resume' | 'coverLetter', file: File | null) => {
    if (!file) return;

    // Validar archivo antes de subir
    const validation = validateFile(file);
    if (!validation.valid) {
      const newErrors = { ...errors };
      newErrors[field] = validation.error || 'Archivo inválido';
      setErrors(newErrors);
      return;
    }

    // Limpiar errores previos
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);

    try {
      if (field === 'resume') {
        setUploadingResume(true);
        setResume(file);

        const result = await uploadJobApplicationFile(
          file,
          job.id,
          'resume',
          (progress) => setResumeProgress(progress.progress)
        );

        if (result.success && result.url) {
          setResumeURL(result.url);
          console.log('✅ Resume uploaded:', result.url);
        } else {
          throw new Error(result.error || 'Error al subir CV');
        }
      } else {
        setUploadingCoverLetter(true);
        setCoverLetter(file);

        const result = await uploadJobApplicationFile(
          file,
          job.id,
          'coverLetter',
          (progress) => setCoverLetterProgress(progress.progress)
        );

        if (result.success && result.url) {
          setCoverLetterURL(result.url);
          console.log('✅ Cover letter uploaded:', result.url);
        } else {
          throw new Error(result.error || 'Error al subir carta de presentación');
        }
      }
    } catch (error) {
      const newErrors = { ...errors };
      newErrors[field] = error instanceof Error ? error.message : 'Error al subir archivo';
      setErrors(newErrors);

      // Limpiar archivo en caso de error
      if (field === 'resume') {
        setResume(undefined);
        setResumeURL('');
      } else {
        setCoverLetter(undefined);
        setCoverLetterURL('');
      }
    } finally {
      if (field === 'resume') {
        setUploadingResume(false);
        setResumeProgress(0);
      } else {
        setUploadingCoverLetter(false);
        setCoverLetterProgress(0);
      }
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
              value={formValidation.getFieldState('firstName').value}
              onChange={(e) => formValidation.handleFieldChange('firstName', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('firstName')}
              className={cn(
                "pl-10",
                formValidation.hasFieldError('firstName')
                  ? "border-destructive"
                  : formValidation.isFieldValid('firstName')
                  ? "border-green-500"
                  : ""
              )}
            />
          </div>
          {formValidation.hasFieldError('firstName') && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formValidation.getFieldError('firstName')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellidos *</Label>
          <Input
            id="lastName"
            placeholder="Ej: Pérez García"
            value={formValidation.getFieldState('lastName').value}
            onChange={(e) => formValidation.handleFieldChange('lastName', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('lastName')}
            className={cn(
              formValidation.hasFieldError('lastName')
                ? "border-destructive"
                : formValidation.isFieldValid('lastName')
                ? "border-green-500"
                : ""
            )}
          />
          {formValidation.hasFieldError('lastName') && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formValidation.getFieldError('lastName')}
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
              value={formValidation.getFieldState('email').value}
              onChange={(e) => formValidation.handleFieldChange('email', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('email')}
              className={cn(
                "pl-10",
                formValidation.hasFieldError('email')
                  ? "border-destructive"
                  : formValidation.isFieldValid('email')
                  ? "border-green-500"
                  : ""
              )}
            />
          </div>
          {formValidation.hasFieldError('email') && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formValidation.getFieldError('email')}
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
              value={formValidation.getFieldState('phone').value}
              onChange={(e) => formValidation.handleFieldChange('phone', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('phone')}
              className={cn(
                "pl-10",
                formValidation.hasFieldError('phone')
                  ? "border-destructive"
                  : formValidation.isFieldValid('phone')
                  ? "border-green-500"
                  : ""
              )}
            />
          </div>
          {formValidation.hasFieldError('phone') && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formValidation.getFieldError('phone')}
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
            value={formValidation.getFieldState('location').value}
            onChange={(e) => formValidation.handleFieldChange('location', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('location')}
            className={cn(
              "pl-10",
              formValidation.hasFieldError('location')
                ? "border-destructive"
                : formValidation.isFieldValid('location')
                ? "border-green-500"
                : ""
            )}
          />
        </div>
        {formValidation.hasFieldError('location') && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formValidation.getFieldError('location')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/tu-perfil"
            value={formValidation.getFieldState('linkedin').value}
            onChange={(e) => formValidation.handleFieldChange('linkedin', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('linkedin')}
            className={cn(
              formValidation.hasFieldError('linkedin')
                ? "border-destructive"
                : formValidation.isFieldValid('linkedin')
                ? "border-green-500"
                : ""
            )}
          />
          {formValidation.hasFieldError('linkedin') && (
            <p className="text-sm text-destructive text-xs mt-1">
              {formValidation.getFieldError('linkedin')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio/Web (opcional)</Label>
          <Input
            id="portfolio"
            placeholder="https://tu-portfolio.com"
            value={formValidation.getFieldState('portfolio').value}
            onChange={(e) => formValidation.handleFieldChange('portfolio', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('portfolio')}
            className={cn(
              formValidation.hasFieldError('portfolio')
                ? "border-destructive"
                : formValidation.isFieldValid('portfolio')
                ? "border-green-500"
                : ""
            )}
          />
          {formValidation.hasFieldError('portfolio') && (
            <p className="text-sm text-destructive text-xs mt-1">
              {formValidation.getFieldError('portfolio')}
            </p>
          )}
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
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
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
            value={education}
            onChange={(e) => setEducation(e.target.value)}
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
            value={formValidation.getFieldState('motivationLetter').value}
            onChange={(e) => formValidation.handleFieldChange('motivationLetter', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('motivationLetter')}
            className={cn(
              "pl-10 min-h-32",
              formValidation.hasFieldError('motivationLetter')
                ? "border-destructive"
                : formValidation.isFieldValid('motivationLetter')
                ? "border-green-500"
                : ""
            )}
            rows={5}
          />
        </div>
        {formValidation.hasFieldError('motivationLetter') && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formValidation.getFieldError('motivationLetter')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilidad de inicio *</Label>
          <Select value={availability} onValueChange={(value) => setAvailability(value)}>
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
          <Select value={salaryExpectation} onValueChange={(value) => setSalaryExpectation(value)}>
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
              {uploadingResume ? (
                <>
                  <Loader2 className="w-8 h-8 mx-auto text-primary mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground mb-2">Subiendo CV...</p>
                  <div className="w-full max-w-xs mx-auto">
                    <Progress value={resumeProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(resumeProgress)}%</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra tu CV aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">PDF, DOC, DOCX (máx. 5MB)</p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('resume', e.target.files?.[0] || null)}
                    className="hidden"
                    id="resume-upload"
                    disabled={uploadingResume}
                  />
                  <Button variant="outline" size="sm" asChild disabled={uploadingResume}>
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      Seleccionar archivo
                    </label>
                  </Button>
                </>
              )}
              {resume && resumeURL && !uploadingResume && (
                <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {resume.name} - Subido correctamente
                </p>
              )}
              {errors.resume && (
                <p className="text-sm text-destructive mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.resume}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Carta de presentación (opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {uploadingCoverLetter ? (
                <>
                  <Loader2 className="w-8 h-8 mx-auto text-primary mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground mb-2">Subiendo carta...</p>
                  <div className="w-full max-w-xs mx-auto">
                    <Progress value={coverLetterProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(coverLetterProgress)}%</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra tu carta aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">PDF, DOC, DOCX (máx. 5MB)</p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('coverLetter', e.target.files?.[0] || null)}
                    className="hidden"
                    id="cover-letter-upload"
                    disabled={uploadingCoverLetter}
                  />
                  <Button variant="outline" size="sm" asChild disabled={uploadingCoverLetter}>
                    <label htmlFor="cover-letter-upload" className="cursor-pointer">
                      Seleccionar archivo
                    </label>
                  </Button>
                </>
              )}
              {coverLetter && coverLetterURL && !uploadingCoverLetter && (
                <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {coverLetter.name} - Subido correctamente
                </p>
              )}
              {errors.coverLetter && (
                <p className="text-sm text-destructive mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.coverLetter}
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
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
              className={cn(errors.agreeToTerms && "border-destructive")}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="agreeToTerms" className="text-sm font-medium leading-5">
                Acepto los términos y condiciones *
              </Label>
              <p className="text-xs text-muted-foreground">
                He leído y acepto los términos y condiciones de Métrica FM
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
              checked={agreeToDataProcessing}
              onCheckedChange={(checked) => setAgreeToDataProcessing(!!checked)}
              className={cn(errors.agreeToDataProcessing && "border-destructive")}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="agreeToDataProcessing" className="text-sm font-medium leading-5">
                Autorizo el tratamiento de mis datos personales *
              </Label>
              <p className="text-xs text-muted-foreground">
                Autorizo a Métrica FM a procesar mis datos para fines de reclutamiento
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