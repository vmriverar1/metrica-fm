'use client';

import React, { useRef, useEffect } from 'react';
import { Target, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MissionVision: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    if (!missionRef.current || !visionRef.current || !sectionRef.current) return;

    // Marcar como animado para evitar re-ejecución
    hasAnimated.current = true;

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      if (!missionRef.current || !visionRef.current) return;

      // Animar entrada con efecto sutil
      gsap.fromTo(missionRef.current,
        { opacity: 0.3, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
      );

      gsap.fromTo(visionRef.current,
        { opacity: 0.3, x: 30 },
        { opacity: 1, x: 0, duration: 0.7, delay: 0.15, ease: 'power2.out' }
      );
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">

          {/* Misión */}
          <div
            ref={missionRef}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
            style={{ opacity: 1 }}
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#003F6F]/10 to-transparent rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />

            {/* Contenido */}
            <div className="relative p-8 lg:p-10">
              {/* Ícono y Título */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#003F6F] to-[#004A87] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-alliance-extrabold text-[#003F6F] tracking-tight">
                  MISIÓN
                </h2>
              </div>

              {/* Descripción */}
              <p className="text-gray-700 leading-relaxed text-base font-alliance-medium">
                Proporcionar soluciones de Facility Management eficientes y personalizadas para mejorar la operación de las instalaciones de nuestros clientes.
              </p>

              {/* Línea decorativa inferior */}
              <div className="mt-8 h-1 w-20 bg-gradient-to-r from-[#003F6F] to-[#00A8E8] rounded-full group-hover:w-32 transition-all duration-500" />
            </div>
          </div>

          {/* Visión */}
          <div
            ref={visionRef}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
            style={{ opacity: 1 }}
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-bl from-[#00A8E8]/10 to-transparent rounded-br-full transform -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />

            {/* Contenido */}
            <div className="relative p-8 lg:p-10">
              {/* Ícono y Título */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#00A8E8] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-alliance-extrabold text-[#00A8E8] tracking-tight">
                  VISIÓN
                </h2>
              </div>

              {/* Descripción */}
              <p className="text-gray-700 leading-relaxed text-base font-alliance-medium">
                Ser reconocidos como líderes en el mercado de Facility Management en Perú, brindando servicios de alta calidad y generando valor para nuestros clientes.
              </p>

              {/* Línea decorativa inferior */}
              <div className="mt-8 h-1 w-20 bg-gradient-to-r from-[#00A8E8] to-[#003F6F] rounded-full group-hover:w-32 transition-all duration-500" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MissionVision;
