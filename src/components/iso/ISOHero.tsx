'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  Calendar,
  Globe,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { currentCertification, isoStats } from '@/data/iso-sample';
import { getCertificationStatus } from '@/types/iso';

export default function ISOHero() {
  const [isHovered, setIsHovered] = useState(false);
  const [certificateRotation, setCertificateRotation] = useState({ x: 0, y: 0 });
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!certificateRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / rect.height) * -10; // Inverted for natural feel
    const rotateY = (mouseX / rect.width) * 10;
    
    setCertificateRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCertificateRotation({ x: 0, y: 0 });
  };

  const status = getCertificationStatus(currentCertification);
  const isValidCertificate = status === 'valid';

  // Auto-rotation animation when not hovered
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCertificateRotation(prev => ({
          x: Math.sin(Date.now() * 0.001) * 3,
          y: Math.cos(Date.now() * 0.0015) * 5
        }));
      }, 16);

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#003F6F] via-[#002A4D] to-[#001A33] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E84E0F]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Badge 
                className={cn(
                  "text-sm px-4 py-2 font-medium",
                  isValidCertificate 
                    ? "bg-green-500/20 text-green-100 border-green-400/30"
                    : "bg-yellow-500/20 text-yellow-100 border-yellow-400/30"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isValidCertificate ? 'Certificación Vigente' : 'En Renovación'}
              </Badge>
              <Badge variant="outline" className="text-xs text-white border-white/30">
                Desde 2018
              </Badge>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl lg:text-7xl font-bold text-white drop-shadow-2xl leading-tight"
                style={{
                  textShadow: '0 0 30px rgba(232, 78, 15, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                ISO 9001
                <span className="block text-3xl lg:text-4xl text-[#E84E0F] font-medium mt-2 drop-shadow-lg">
                  Certificación 2015
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-gray-200 max-w-2xl leading-relaxed"
              >
                Excelencia certificada en gestión de proyectos de construcción e infraestructura
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {isoStats.certificationYears}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  Años Certificados
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {isoStats.certifiedProjects}+
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  Proyectos Certificados
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {isoStats.averageSatisfaction}%
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  Satisfacción Cliente
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                className="bg-[#E84E0F] hover:bg-[#E84E0F]/90 text-white px-8 py-3 text-base font-medium shadow-lg"
                onClick={() => window.open(currentCertification.pdfUrl, '_blank')}
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar Certificado
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/70 bg-white/10 backdrop-blur-sm text-white px-8 py-3 text-base font-medium hover:bg-white/20 hover:border-white"
                onClick={() => {
                  const element = document.getElementById('politica-calidad');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <FileText className="w-5 h-5 mr-2" />
                Ver Política de Calidad
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Certification Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-6 border-t border-white/20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-200">
                  <Shield className="w-4 h-4 text-[#E84E0F]" />
                  <span className="font-medium">Ente Certificador:</span>
                  <span>{currentCertification.certifyingBody}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Calendar className="w-4 h-4 text-[#E84E0F]" />
                  <span className="font-medium">Vigente hasta:</span>
                  <span>{currentCertification.expiryDate.toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Award className="w-4 h-4 text-[#E84E0F]" />
                  <span className="font-medium">N° Certificado:</span>
                  <span>{currentCertification.certificateNumber}</span>
                </div>
                {currentCertification.verificationUrl && (
                  <div className="flex items-center gap-2 text-gray-200">
                    <ExternalLink className="w-4 h-4 text-[#E84E0F]" />
                    <span className="font-medium">
                      <a 
                        href={currentCertification.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E84E0F] hover:underline"
                      >
                        Verificar Autenticidad
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Certificate */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Certificate Container */}
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#E84E0F]/20 to-yellow-500/20 rounded-2xl blur-xl"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  opacity: isHovered ? 0.6 : 0.3
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Certificate */}
              <motion.div
                ref={certificateRef}
                className="relative w-80 h-[500px] cursor-pointer perspective-1000"
                style={{
                  transformStyle: 'preserve-3d'
                }}
                animate={{
                  rotateX: certificateRotation.x,
                  rotateY: certificateRotation.y,
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  mass: 0.5
                }}
              >
                <Card className="w-full h-full bg-gradient-to-br from-white to-gray-50 border-2 border-[#E84E0F]/20 shadow-2xl overflow-hidden">
                  <CardContent className="p-8 h-full flex flex-col relative">
                    {/* Certificate Header */}
                    <div className="text-center space-y-4">
                      <div>
                        <Award className="w-16 h-16 text-[#E84E0F] mx-auto" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          CERTIFICADO
                        </h3>
                        <p className="text-lg font-semibold text-[#E84E0F] mt-1">
                          ISO 9001:2015
                        </p>
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="flex-1 flex flex-col justify-center space-y-6 text-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Se certifica que
                        </p>
                        <h4 className="text-xl font-bold text-gray-800">
                          MÉTRICA DIP
                        </h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Dirección Integral de Proyectos
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          Ha implementado y mantiene un Sistema de
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          GESTIÓN DE CALIDAD
                        </p>
                        <p className="text-xs text-gray-600">
                          conforme a los requisitos de la norma
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E84E0F]/10 rounded-lg">
                          <Sparkles className="w-4 h-4 text-[#E84E0F]" />
                          <span className="text-sm font-medium text-[#E84E0F]">
                            Vigente hasta 2027
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Footer */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Cert. N° {currentCertification.certificateNumber}</span>
                        <span>{currentCertification.certifyingBody}</span>
                      </div>
                      <div className="text-center">
                        <Globe className="w-4 h-4 text-[#E84E0F] mx-auto" />
                      </div>
                    </div>

                    {/* Holographic Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-transparent via-[#E84E0F]/5 to-yellow-500/5 pointer-events-none"
                      animate={{
                        opacity: isHovered ? [0.3, 0.6, 0.3] : 0
                      }}
                      transition={{
                        duration: 2,
                        repeat: isHovered ? Infinity : 0
                      }}
                    />

                    {/* Corner Decorations */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#E84E0F]/30" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#E84E0F]/30" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#E84E0F]/30" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#E84E0F]/30" />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Floating Action Button */}
              <motion.div
                className="absolute -bottom-4 -right-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <Button
                  size="lg"
                  className="rounded-full w-14 h-14 shadow-lg bg-[#E84E0F] hover:bg-[#E84E0F]/90"
                  onClick={() => window.open(currentCertification.pdfUrl, '_blank')}
                >
                  <Download className="w-6 h-6" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#003F6F] to-transparent" />
    </section>
  );
}