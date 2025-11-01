'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Loader2, AlertCircle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';

export default function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validación mejorada con anti-spam
  const formValidation = useEnhancedFormValidation({
    nombre: { type: 'name', required: true, label: 'Nombre' },
    apellido: { type: 'name', required: true, label: 'Apellido' },
    email: { type: 'email', required: true, label: 'Email' },
    telefono: { type: 'phone', required: false, label: 'Teléfono' },
    empresa: { type: 'company', required: false, label: 'Empresa' },
    mensaje: { type: 'message', required: true, label: 'Mensaje', minLength: 10, maxLength: 1000 }
  });

  const [tipoProyecto, setTipoProyecto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    if (!formValidation.validateAllFields()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Obtener valores validados
    const formValues = formValidation.getFormValues();

    // Track form submission attempt
    analytics.logEvent('form_start', {
      form_name: 'contact_form',
      form_location: 'contact_page',
      project_type: tipoProyecto || 'not_specified'
    });

    try {
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('contact_form_submit');

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            nombre: formValues.nombre,
            apellido: formValues.apellido,
            email: formValues.email,
            telefono: formValues.telefono || '',
            empresa: formValues.empresa || '',
            tipo_proyecto: tipoProyecto,
            mensaje: formValues.mensaje,
            // Campos ocultos de tracking
            form_name: 'Formulario de Contacto Principal',
            page_url: '/contact',
            form_location: 'contact_page'
          },
          formType: 'contact',
          requiredFields: ['nombre', 'apellido', 'email', 'mensaje'],
          recaptchaToken: recaptchaToken
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar el mensaje');
      }

      console.log('Contact form submitted successfully:', result);

      // Track successful submission
      analytics.formSubmit('contact_form', true);
      analytics.logEvent('contact_form_success', {
        form_location: 'contact_page',
        project_type: tipoProyecto || 'not_specified',
        has_company: formValues.empresa ? 'yes' : 'no',
        has_phone: formValues.telefono ? 'yes' : 'no'
      });

      // Mostrar estado de éxito
      setIsSuccess(true);

      // Reset form después de 5 segundos
      setTimeout(() => {
        setIsSuccess(false);
        formValidation.resetForm();
        setTipoProyecto('');
      }, 5000);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);

      // Track form error
      analytics.formSubmit('contact_form', false);
      analytics.logEvent('contact_form_error', {
        form_location: 'contact_page',
        error_message: error.message || 'unknown_error'
      });

      setError(error.message || 'Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ya no necesitamos handleChange genérico, usamos formValidation.handleFieldChange

  return (
    <div className="bg-card rounded-2xl p-8 shadow-sm border relative overflow-hidden">
      <h3 className="text-2xl font-semibold text-primary mb-6">Envíanos un Mensaje</h3>

      <AnimatePresence mode="wait">
        {/* Success State */}
        {isSuccess && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              ¡Mensaje Enviado!
            </h3>
            <p className="text-muted-foreground mb-4">
              Gracias por contactarnos. Te responderemos pronto.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Restableciendo formulario...</span>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isSubmitting && !isSuccess && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center"
          >
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Enviando mensaje...
            </h3>
            <p className="text-muted-foreground">
              Por favor espera un momento
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && !isSubmitting && !isSuccess && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 mb-1">Error al enviar</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
              Nombres *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formValidation.getFieldState('nombre').value}
              onChange={(e) => formValidation.handleFieldChange('nombre', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('nombre')}
              required
              disabled={isSubmitting || isSuccess}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                formValidation.hasFieldError('nombre')
                  ? 'border-red-500'
                  : formValidation.isFieldValid('nombre')
                  ? 'border-green-500'
                  : 'border-border'
              }`}
              placeholder="Tu nombre completo"
            />
            {formValidation.hasFieldError('nombre') && (
              <p className="text-red-500 text-sm mt-1">
                {formValidation.getFieldError('nombre')}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-foreground mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formValidation.getFieldState('apellido').value}
              onChange={(e) => formValidation.handleFieldChange('apellido', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('apellido')}
              required
              disabled={isSubmitting || isSuccess}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                formValidation.hasFieldError('apellido')
                  ? 'border-red-500'
                  : formValidation.isFieldValid('apellido')
                  ? 'border-green-500'
                  : 'border-border'
              }`}
              placeholder="Tus apellidos"
            />
            {formValidation.hasFieldError('apellido') && (
              <p className="text-red-500 text-sm mt-1">
                {formValidation.getFieldError('apellido')}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formValidation.getFieldState('email').value}
              onChange={(e) => formValidation.handleFieldChange('email', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('email')}
              required
              disabled={isSubmitting || isSuccess}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                formValidation.hasFieldError('email')
                  ? 'border-red-500'
                  : formValidation.isFieldValid('email')
                  ? 'border-green-500'
                  : 'border-border'
              }`}
              placeholder="tu@email.com"
            />
            {formValidation.hasFieldError('email') && (
              <p className="text-red-500 text-sm mt-1">
                {formValidation.getFieldError('email')}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formValidation.getFieldState('telefono').value}
              onChange={(e) => formValidation.handleFieldChange('telefono', e.target.value)}
              onBlur={() => formValidation.handleFieldBlur('telefono')}
              disabled={isSubmitting || isSuccess}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                formValidation.hasFieldError('telefono')
                  ? 'border-red-500'
                  : formValidation.isFieldValid('telefono')
                  ? 'border-green-500'
                  : 'border-border'
              }`}
              placeholder="+51 999 999 999"
            />
            {formValidation.hasFieldError('telefono') && (
              <p className="text-red-500 text-sm mt-1">
                {formValidation.getFieldError('telefono')}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="empresa" className="block text-sm font-medium text-foreground mb-2">
            Empresa/Organización
          </label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            value={formValidation.getFieldState('empresa').value}
            onChange={(e) => formValidation.handleFieldChange('empresa', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('empresa')}
            disabled={isSubmitting || isSuccess}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
              formValidation.hasFieldError('empresa')
                ? 'border-red-500'
                : formValidation.isFieldValid('empresa')
                ? 'border-green-500'
                : 'border-border'
            }`}
            placeholder="Nombre de tu empresa"
          />
          {formValidation.hasFieldError('empresa') && (
            <p className="text-red-500 text-sm mt-1">
              {formValidation.getFieldError('empresa')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="tipo_proyecto" className="block text-sm font-medium text-foreground mb-2">
            Tipo de Proyecto
          </label>
          <select
            id="tipo_proyecto"
            name="tipo_proyecto"
            value={tipoProyecto}
            onChange={(e) => setTipoProyecto(e.target.value)}
            disabled={isSubmitting || isSuccess}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Selecciona un tipo de proyecto</option>
            <option value="salud">Proyectos de Salud</option>
            <option value="educacion">Proyectos de Educación</option>
            <option value="vivienda">Proyectos de Vivienda</option>
            <option value="oficina">Proyectos de Oficina</option>
            <option value="retail">Proyectos de Retail</option>
            <option value="industria">Proyectos de Industria</option>
            <option value="hoteleria">Proyectos de Hotelería</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">
            Mensaje *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={5}
            value={formValidation.getFieldState('mensaje').value}
            onChange={(e) => formValidation.handleFieldChange('mensaje', e.target.value)}
            onBlur={() => formValidation.handleFieldBlur('mensaje')}
            required
            disabled={isSubmitting || isSuccess}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
              formValidation.hasFieldError('mensaje')
                ? 'border-red-500'
                : formValidation.isFieldValid('mensaje')
                ? 'border-green-500'
                : 'border-border'
            }`}
            placeholder="Cuéntanos sobre tu proyecto, presupuesto estimado, cronograma y cualquier detalle relevante..."
          ></textarea>
          {formValidation.hasFieldError('mensaje') && (
            <p className="text-red-500 text-sm mt-1">
              {formValidation.getFieldError('mensaje')}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={isSubmitting || isSuccess}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          * Campos obligatorios. Nos comprometemos a responder en menos de 24 horas.
        </p>

        <div className="pt-4 border-t border-border">
          <Link href="/privacy-policy">
            <Button variant="outline" size="sm" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Política de Privacidad
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
