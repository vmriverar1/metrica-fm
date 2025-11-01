'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Shield, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ContactoEtico() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Canales de <span className="text-cyan-500">Contacto</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-slate-300 max-w-2xl mx-auto"
            >
              Múltiples formas de contactar con nuestro Comité de Ética de manera confidencial.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan-500" />
                Métodos de Contacto
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Email Directo</h4>
                      <p className="text-slate-300 mb-3">
                        Envía tu denuncia directamente a nuestro equipo de ética.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white"
                        onClick={() => window.location.href = 'mailto:info@metricadip.com?subject=Denuncia Ética'}
                      >
                        info@metricadip.com
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Línea Directa</h4>
                      <p className="text-slate-300 mb-3">
                        Línea telefónica confidencial disponible en horario laboral.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                        onClick={() => window.location.href = 'tel:+51989742678'}
                      >
                        +51 989 742 678
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Formulario Web</h4>
                      <p className="text-slate-300 mb-3">
                        Completa nuestro formulario seguro en línea.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Ir al Formulario
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-500" />
                Información Importante
              </h3>

              <div className="space-y-6">
                {/* Business Hours */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4">Horarios de Atención</h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes:</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábados:</span>
                      <span>9:00 AM - 1:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4">Tiempos de Respuesta</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-400">
                        Urgente
                      </Badge>
                      <span className="text-slate-300">24 horas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500 text-cyan-400">
                        Normal
                      </Badge>
                      <span className="text-slate-300">72 horas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-400">
                        Consulta
                      </Badge>
                      <span className="text-slate-300">5 días laborales</span>
                    </div>
                  </div>
                </div>

                {/* Confidentiality Guarantee */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-red-500/10 border border-cyan-500/20 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3 text-cyan-400">
                    Garantía de Confidencialidad
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Todos los reportes son tratados con absoluta confidencialidad. Solo el Comité de Ética
                    y personal autorizado tienen acceso a esta información. Prohibimos estrictamente
                    cualquier represalia contra quien reporte de buena fe.
                  </p>
                </div>

                {/* Legal Notice */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">Marco Legal</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Este canal de denuncias opera bajo el marco legal peruano y nuestro Código de Ética
                    Empresarial. Todas las denuncias son evaluadas conforme a la legislación vigente
                    y nuestros estándares internacionales de compliance.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-slate-800 rounded-lg p-6 max-w-3xl mx-auto">
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">Recuerda:</strong> Este canal está destinado para reportar
                irregularidades serias que afecten la integridad de nuestros proyectos y valores empresariales.
                Para consultas generales o solicitudes de información, utiliza nuestros canales de contacto habituales.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}