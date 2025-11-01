'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Users, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Recepción',
    description: 'Tu denuncia es recibida y registrada de forma confidencial en nuestro sistema seguro.',
    color: 'bg-blue-500'
  },
  {
    icon: Search,
    title: 'Evaluación',
    description: 'Nuestro Comité de Ética evalúa y clasifica la denuncia según su naturaleza y gravedad.',
    color: 'bg-cyan-500'
  },
  {
    icon: Users,
    title: 'Investigación',
    description: 'Se asigna a un equipo especializado para investigar de manera imparcial y exhaustiva.',
    color: 'bg-green-500'
  },
  {
    icon: CheckCircle,
    title: 'Resolución',
    description: 'Se toman las medidas correctivas necesarias y se comunican los resultados cuando corresponde.',
    color: 'bg-purple-500'
  }
];

export default function ProcesoEtico() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Proceso de <span className="text-primary">Manejo Ético</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Cada denuncia sigue un proceso estructurado que garantiza confidencialidad,
              imparcialidad y resolución efectiva.
            </motion.p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 via-green-200 to-purple-200 transform -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Step Number */}
                    <div className="text-center mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-center leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-4 mb-4">
                      <ArrowRight className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 bg-slate-50 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Compromiso con la Transparencia
            </h3>
            <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
              En Métrica FM promovemos un ambiente de trabajo ético y transparente. Prohibimos
              terminantemente cualquier acto de corrupción, fraude o comportamiento que vaya
              contra nuestros valores empresariales. Tu denuncia contribuye a mantener los
              más altos estándares de integridad en el sector construcción.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}