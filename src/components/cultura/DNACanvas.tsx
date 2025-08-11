'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Building2, Target, Award, TrendingUp, Shield, CheckCircle } from 'lucide-react';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Proceso de trabajo de Métrica DIP - pasos organizados y lógicos
const workflowSteps = [
  {
    id: 'consulta',
    title: 'Consulta Inicial',
    description: 'Reunión con el cliente para entender necesidades específicas del proyecto',
    icon: Users,
    color: '#003F6F',
    duration: '1-2 semanas',
    deliverables: ['Análisis de requerimientos', 'Propuesta técnica', 'Cronograma inicial'],
    nextSteps: ['planificacion']
  },
  {
    id: 'planificacion',
    title: 'Planificación',
    description: 'Desarrollo detallado del plan de proyecto con todos los especialistas',
    icon: Target,
    color: '#E84E0F',
    duration: '2-4 semanas',
    deliverables: ['Plan detallado', 'Presupuesto final', 'Equipo asignado'],
    nextSteps: ['diseno']
  },
  {
    id: 'diseno',
    title: 'Diseño y Ingeniería',
    description: 'Elaboración de planos, cálculos estructurales y especificaciones técnicas',
    icon: Building2,
    color: '#003F6F',
    duration: '4-8 semanas',
    deliverables: ['Planos ejecutivos', 'Especificaciones', 'Memorias de cálculo'],
    nextSteps: ['construccion']
  },
  {
    id: 'construccion',
    title: 'Supervisión de Obra',
    description: 'Dirección integral durante la fase constructiva del proyecto',
    icon: Shield,
    color: '#E84E0F',
    duration: 'Variable',
    deliverables: ['Reportes semanales', 'Control de calidad', 'Supervisión técnica'],
    nextSteps: ['entrega']
  },
  {
    id: 'entrega',
    title: 'Entrega y Seguimiento',
    description: 'Finalización del proyecto con documentación completa y garantías',
    icon: Award,
    color: '#003F6F',
    duration: '1-2 semanas',
    deliverables: ['Documentación as-built', 'Manuales', 'Garantías'],
    nextSteps: ['mejora']
  },
  {
    id: 'mejora',
    title: 'Mejora Continua',
    description: 'Evaluación post-proyecto y retroalimentación para futuros desarrollos',
    icon: TrendingUp,
    color: '#059669',
    duration: 'Continuo',
    deliverables: ['Evaluación del proyecto', 'Lecciones aprendidas', 'Mejoras implementadas'],
    nextSteps: []
  }
];

interface StepCardProps {
  step: typeof workflowSteps[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function StepCard({ step, index, isActive, onClick }: StepCardProps) {
  const Icon = step.icon;
  
  return (
    <motion.div
      onClick={onClick}
      className={`workflow-step cursor-pointer p-6 rounded-2xl border-2 transition-all duration-500 ${
        isActive 
          ? 'bg-white shadow-2xl border-transparent scale-105 z-10' 
          : 'bg-white/90 hover:bg-white shadow-lg border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ y: isActive ? 0 : -8 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Número de paso */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: step.color }}
        >
          {index + 1}
        </div>
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${step.color}20` }}
        >
          <Icon size={24} style={{ color: step.color }} />
        </div>
      </div>

      {/* Contenido */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {step.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {step.description}
      </p>

      {/* Duración */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: step.color }}></div>
        <span className="text-xs font-medium text-gray-500">
          Duración: {step.duration}
        </span>
      </div>

      {/* Detalles expandidos */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Entregables */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Entregables:</h4>
            <div className="space-y-1">
              {step.deliverables.map((deliverable, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{deliverable}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Siguientes pasos */}
          {step.nextSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Conecta con:</h4>
              <div className="flex flex-wrap gap-2">
                {step.nextSteps.map((nextStepId) => {
                  const nextStep = workflowSteps.find(s => s.id === nextStepId);
                  return nextStep ? (
                    <div 
                      key={nextStepId}
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: nextStep.color }}
                    >
                      {nextStep.title}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function WorkflowGuide() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<string>('consulta');

  useGSAP(() => {
    if (!containerRef.current) return;

    // Animación de entrada de las tarjetas
    gsap.fromTo('.workflow-step', 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, { scope: containerRef });

  const activeStepData = workflowSteps.find(s => s.id === activeStep);

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E0F] to-[#003F6F]">
              Nuestro Proceso de Trabajo
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Un flujo de trabajo estructurado que garantiza la excelencia en cada proyecto de dirección integral
          </p>
        </motion.div>

        {/* Grid de pasos del proceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {workflowSteps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isActive={activeStep === step.id}
              onClick={() => setActiveStep(step.id)}
            />
          ))}
        </div>

        {/* Panel de información detallada */}
        {activeStepData && (
          <motion.div
            layout
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
          >
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: activeStepData.color }}
                  >
                    {workflowSteps.findIndex(s => s.id === activeStep) + 1}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800">
                      {activeStepData.title}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {activeStepData.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Duración estimada</div>
                  <div 
                    className="text-lg font-semibold px-4 py-2 rounded-full text-white"
                    style={{ backgroundColor: activeStepData.color }}
                  >
                    {activeStepData.duration}
                  </div>
                </div>
              </div>

              {/* Flujo visual del proceso */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Flujo del Proceso Completo
                </h4>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer ${
                          step.id === activeStep ? 'ring-4 ring-opacity-50' : 'opacity-60'
                        }`}
                        style={{ 
                          backgroundColor: step.color,
                          ringColor: step.id === activeStep ? step.color : undefined
                        }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setActiveStep(step.id)}
                      >
                        {index + 1}
                      </motion.div>
                      
                      {index < workflowSteps.length - 1 && (
                        <div className="w-8 h-px bg-gray-300 mx-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            ¿Listo para iniciar tu proyecto con nosotros?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#E84E0F] to-[#003F6F] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Solicitar Consulta Inicial
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}