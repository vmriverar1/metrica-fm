'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CanalDenunciasHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003F6F' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Badge variant="outline" className="bg-cyan-50 border-cyan-200 text-cyan-700 px-4 py-2 text-sm font-medium">
              <Shield className="w-4 h-4 mr-2" />
              Línea Ética Métrica FM
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Canal de <span className="text-primary">Denuncias</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Canal confidencial para reportar irregularidades, actos de corrupción o violaciones éticas
            en nuestros proyectos. <strong>Tu identidad está protegida.</strong>
          </motion.p>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8"
          >
            <div className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <Lock className="w-5 h-5 text-primary" />
              <span className="font-medium text-slate-700">100% Confidencial</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <Eye className="w-5 h-5 text-primary" />
              <span className="font-medium text-slate-700">Anónimo Opcional</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium text-slate-700">Sin Represalias</span>
            </div>
          </motion.div>

          {/* Warning Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-amber-800 text-sm">
                  <strong>Importante:</strong> Este canal está destinado para reportar irregularidades serias.
                  Para consultas generales, utiliza nuestros canales de contacto habituales.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-100 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-primary/10 rounded-full opacity-30 animate-pulse delay-500" />
    </section>
  );
}