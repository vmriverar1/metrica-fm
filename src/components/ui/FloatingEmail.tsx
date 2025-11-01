'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Mail, X, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingEmailProps {
  email?: string;
  className?: string;
  hiddenOnPaths?: string[];
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
}

function EmailModal({ isOpen, onClose, recipientEmail }: EmailModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    empresa: '',
    tipo_proyecto: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            empresa: formData.empresa,
            tipo_proyecto: formData.tipo_proyecto,
            mensaje: formData.mensaje,
            // Campos ocultos de tracking
            form_name: 'Formulario Flotante de Contacto',
            page_url: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
            form_location: 'floating_email_modal'
          },
          formType: 'contact',
          requiredFields: ['nombre', 'apellido', 'email', 'mensaje']
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar el mensaje');
      }

      console.log('Contact form submitted successfully:', result);

      // Mostrar estado de éxito
      setIsSuccess(true);

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          empresa: '',
          tipo_proyecto: '',
          mensaje: ''
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setError(error.message || 'Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#003F6F] to-[#00A8E8] p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Contáctanos</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 text-sm mt-2">
                  Envíanos un mensaje y te responderemos pronto
                </p>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Success State */}
                {isSuccess && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cerrando...</span>
                    </div>
                  </motion.div>
                )}

                {/* Loading State */}
                {isSubmitting && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Loader2 className="w-16 h-16 text-[#003F6F] animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Enviando mensaje...
                    </h3>
                    <p className="text-gray-600">
                      Por favor espera un momento
                    </p>
                  </motion.div>
                )}

                {/* Error State */}
                {error && !isSubmitting && !isSuccess && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Error al enviar</h4>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Form Fields */}
                {!isSubmitting && !isSuccess && (
                  <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombres *
                          </label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos *
                          </label>
                          <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
                            placeholder="Tus apellidos"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
                            placeholder="+51 999 999 999"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa/Organización
                        </label>
                        <input
                          type="text"
                          id="empresa"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
                          placeholder="Nombre de tu empresa"
                        />
                      </div>

                      <div>
                        <label htmlFor="tipo_proyecto" className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Proyecto
                        </label>
                        <select
                          id="tipo_proyecto"
                          name="tipo_proyecto"
                          value={formData.tipo_proyecto}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors"
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
                        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                          Mensaje *
                        </label>
                        <textarea
                          id="mensaje"
                          name="mensaje"
                          value={formData.mensaje}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003F6F] focus:border-transparent transition-colors resize-none"
                          placeholder="Cuéntanos sobre tu proyecto, presupuesto estimado, cronograma y cualquier detalle relevante..."
                        />
                      </div>

                      <div className="text-xs text-gray-500 text-center">
                        * Campos obligatorios. Nos comprometemos a responder en menos de 24 horas.
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Fixed Footer with Buttons */}
              {!isSubmitting && !isSuccess && (
                <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-6">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        const form = document.querySelector('form');
                        if (form) {
                          form.requestSubmit();
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-[#003F6F] to-[#00A8E8] hover:from-[#002c50] hover:to-[#d13e00] text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function FloatingEmail({
  email = "info@metrica-dip.com",
  className = "",
  hiddenOnPaths = ['/portfolio*', '/admin*']
}: FloatingEmailProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ocultar el botón en ciertas páginas
  useEffect(() => {
    const shouldHide = hiddenOnPaths.some(path => {
      if (path.endsWith('*')) {
        // Permite wildcards como '/portfolio*' para ocultar en todas las subpáginas
        const basePath = path.slice(0, -1);
        return pathname.startsWith(basePath);
      }
      return pathname === path;
    });

    setIsVisible(!shouldHide);
  }, [pathname, hiddenOnPaths]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20
            }}
            className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 ${className}`}
          >
            <motion.button
              onClick={openModal}
              className="group flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-gradient-to-r from-[#003F6F] to-[#00A8E8] hover:from-[#002c50] hover:to-[#d13e00] rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0, 63, 111, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Contactar por email"
            >
              <Mail className="w-7 h-7 md:w-10 md:h-10 text-white" />

              {/* Subtle pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#00A8E8] opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 hidden md:block pointer-events-none"
            >
              <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                ¡Escríbenos un mensaje!
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <EmailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        recipientEmail={email}
      />
    </>
  );
}