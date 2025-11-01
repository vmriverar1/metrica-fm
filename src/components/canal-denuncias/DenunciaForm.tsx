'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Lock, AlertCircle, CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';

export default function DenunciaForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validación con hook mejorado
  const formValidation = useEnhancedFormValidation({
    nombre: { type: 'name', required: false, label: 'Nombre' },
    email: { type: 'email', required: false, label: 'Email' },
    telefono: { type: 'phone', required: false, label: 'Teléfono' },
    descripcion: { type: 'message', required: true, label: 'Descripción', minLength: 20, maxLength: 2000 }
  });

  // Estados para campos no validados
  const [tipoDenuncia, setTipoDenuncia] = useState('');
  const [proyectoRelacionado, setProyectoRelacionado] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [personasInvolucradas, setPersonasInvolucradas] = useState('');
  const [evidencias, setEvidencias] = useState('');
  const [contactoPreferido, setContactoPreferido] = useState('');
  const [anonimo, setAnonimo] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos según modo anónimo o no
    if (!anonimo) {
      // Si no es anónimo, validar nombre y email
      const nombreValid = formValidation.validateFieldImmediate('nombre', formValidation.getFieldState('nombre').value);
      const emailValid = formValidation.validateFieldImmediate('email', formValidation.getFieldState('email').value);

      if (!nombreValid || !emailValid) {
        alert('Por favor completa correctamente tu nombre y email');
        return;
      }
    }

    // Validar descripción siempre
    const descripcionValid = formValidation.validateFieldImmediate('descripcion', formValidation.getFieldState('descripcion').value);
    if (!descripcionValid) {
      alert('Por favor completa correctamente la descripción del incidente');
      return;
    }

    // Validar tipo de denuncia
    if (!tipoDenuncia) {
      alert('Por favor selecciona el tipo de denuncia');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('denuncia_form_submit');

      // Obtener valores validados
      const formValues = formValidation.getFormValues();

      // Determinar campos requeridos según si es anónimo o no
      const requiredFields = anonimo
        ? ['tipo_denuncia', 'descripcion']
        : ['tipo_denuncia', 'descripcion', 'nombre', 'email'];

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            tipo_denuncia: tipoDenuncia,
            descripcion: formValues.descripcion,
            proyecto_relacionado: proyectoRelacionado,
            fecha_incidente: fechaIncidente,
            personas_involucradas: personasInvolucradas,
            evidencias: evidencias,
            anonimo: anonimo,
            nombre: anonimo ? '' : formValues.nombre,
            email: anonimo ? '' : formValues.email,
            telefono: anonimo ? '' : formValues.telefono,
            contacto_preferido: contactoPreferido,
            // Campos ocultos de tracking
            form_name: 'Formulario de Canal de Denuncias',
            page_url: '/canal-denuncias',
            form_location: 'canal_denuncias_page'
          },
          formType: 'denuncia',
          requiredFields: requiredFields,
          recaptchaToken: recaptchaToken
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar la denuncia');
      }

      console.log('Denuncia submitted successfully:', result);
      setSubmitted(true);

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        formValidation.resetForm();
        setTipoDenuncia('');
        setProyectoRelacionado('');
        setFechaIncidente('');
        setPersonasInvolucradas('');
        setEvidencias('');
        setContactoPreferido('');
        setAnonimo(true);
      }, 5000);
    } catch (error: any) {
      console.error('Error submitting denuncia:', error);
      alert(error.message || 'Error al enviar la denuncia. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Denuncia Recibida
              </h3>
              <p className="text-slate-600 mb-6">
                Tu denuncia ha sido registrada exitosamente. Nuestro Comité de Ética la revisará
                y tomará las medidas correspondientes.
              </p>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Número de seguimiento: DEN-{Date.now().toString().slice(-6)}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="formulario" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Registrar <span className="text-primary">Denuncia</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600"
            >
              Completa el formulario con la mayor información posible.
              Todos los campos marcados con * son obligatorios.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8">
              {/* Confidentiality Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Confidencialidad Garantizada</h4>
                    <p className="text-blue-700 text-sm">
                      Toda la información proporcionada será tratada con estricta confidencialidad.
                      Solo el Comité de Ética tendrá acceso a estos datos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="anonimo"
                    checked={anonimo}
                    onChange={(e) => setAnonimo(e.target.checked)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium">Enviar denuncia de forma anónima</span>
                </label>
                <p className="text-sm text-slate-500 mt-1 ml-7">
                  Si desmarcas esta opción, podremos contactarte para obtener más información.
                </p>
              </div>

              {/* Contact Information (shown only if not anonymous) */}
              {!anonimo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 space-y-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información de Contacto (Opcional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formValidation.getFieldState('nombre').value}
                        onChange={(e) => formValidation.handleFieldChange('nombre', e.target.value)}
                        onBlur={() => formValidation.handleFieldBlur('nombre')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          formValidation.hasFieldError('nombre')
                            ? 'border-red-500'
                            : formValidation.isFieldValid('nombre')
                            ? 'border-green-500'
                            : 'border-slate-300'
                        }`}
                        placeholder="Tu nombre completo"
                      />
                      {formValidation.hasFieldError('nombre') && (
                        <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('nombre')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formValidation.getFieldState('email').value}
                        onChange={(e) => formValidation.handleFieldChange('email', e.target.value)}
                        onBlur={() => formValidation.handleFieldBlur('email')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          formValidation.hasFieldError('email')
                            ? 'border-red-500'
                            : formValidation.isFieldValid('email')
                            ? 'border-green-500'
                            : 'border-slate-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                      {formValidation.hasFieldError('email') && (
                        <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('email')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formValidation.getFieldState('telefono').value}
                        onChange={(e) => formValidation.handleFieldChange('telefono', e.target.value)}
                        onBlur={() => formValidation.handleFieldBlur('telefono')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          formValidation.hasFieldError('telefono')
                            ? 'border-red-500'
                            : formValidation.isFieldValid('telefono')
                            ? 'border-green-500'
                            : 'border-slate-300'
                        }`}
                        placeholder="+51 999 999 999"
                      />
                      {formValidation.hasFieldError('telefono') && (
                        <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('telefono')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Método de Contacto Preferido
                      </label>
                      <select
                        name="contacto_preferido"
                        value={contactoPreferido}
                        onChange={(e) => setContactoPreferido(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="email">Email</option>
                        <option value="telefono">Teléfono</option>
                        <option value="ambos">Ambos</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Incident Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Información del Incidente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Denuncia *
                    </label>
                    <select
                      name="tipo_denuncia"
                      value={tipoDenuncia}
                      onChange={(e) => setTipoDenuncia(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="corrupcion">Actos de Corrupción</option>
                      <option value="fraude">Fraude</option>
                      <option value="conflicto_interes">Conflicto de Intereses</option>
                      <option value="acoso">Acoso Laboral</option>
                      <option value="discriminacion">Discriminación</option>
                      <option value="seguridad">Violaciones de Seguridad</option>
                      <option value="medio_ambiente">Daños Ambientales</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha del Incidente
                    </label>
                    <input
                      type="date"
                      name="fecha_incidente"
                      value={fechaIncidente}
                      onChange={(e) => setFechaIncidente(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proyecto o Área Relacionada
                  </label>
                  <input
                    type="text"
                    name="proyecto_relacionado"
                    value={proyectoRelacionado}
                    onChange={(e) => setProyectoRelacionado(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Nombre del proyecto, departamento o área"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción Detallada del Incidente *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formValidation.getFieldState('descripcion').value}
                    onChange={(e) => formValidation.handleFieldChange('descripcion', e.target.value)}
                    onBlur={() => formValidation.handleFieldBlur('descripcion')}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
                      formValidation.hasFieldError('descripcion')
                        ? 'border-red-500'
                        : formValidation.isFieldValid('descripcion')
                        ? 'border-green-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Describe los hechos de manera detallada: qué ocurrió, cuándo, dónde, quiénes estuvieron involucrados..."
                  />
                  {formValidation.hasFieldError('descripcion') && (
                    <p className="text-red-500 text-xs mt-1">{formValidation.getFieldError('descripcion')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personas Involucradas
                  </label>
                  <textarea
                    name="personas_involucradas"
                    value={personasInvolucradas}
                    onChange={(e) => setPersonasInvolucradas(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Nombres, cargos o descripciones de las personas involucradas (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Evidencias o Información Adicional
                  </label>
                  <textarea
                    name="evidencias"
                    value={evidencias}
                    onChange={(e) => setEvidencias(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Menciona cualquier evidencia disponible (documentos, testigos, etc.)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formValidation.getFieldState('descripcion').value || !tipoDenuncia}
                  className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Denuncia
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 mt-3">
                  Al enviar esta denuncia, confirmas que la información proporcionada es veraz
                  y comprendes que podrías ser contactado para obtener información adicional.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}