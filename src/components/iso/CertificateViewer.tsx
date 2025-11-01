'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Download, 
  ExternalLink,
  Share2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Shield,
  Calendar,
  Building2,
  Globe,
  CheckCircle,
  X,
  Copy,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Printer,
  FileText,
  QrCode,
  Sparkles,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { currentCertification } from '@/data/iso-sample';
import { getCertificationStatus } from '@/types/iso';
import { cn } from '@/lib/utils';

export default function CertificateViewer() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const status = getCertificationStatus(currentCertification);
  const isValid = status === 'valid';

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Certificación ISO 9001:2015 - Métrica FM - Vigente hasta ${currentCertification.expiryDate.getFullYear()}`;

    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'print':
        window.print();
        break;
    }
  };

  const shareOptions = [
    { id: 'copy', label: 'Copiar Enlace', icon: Copy, color: 'text-blue-600' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-gray-600' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-700' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-800' },
    { id: 'print', label: 'Imprimir', icon: Printer, color: 'text-gray-700' }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Visor de Certificado
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Certificado <span className="text-primary">ISO 9001:2015</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Visualiza, descarga y comparte nuestro certificado oficial de gestión de calidad 
            con todas las herramientas necesarias para verificación y autenticidad.
          </p>
        </motion.div>

        {/* Certificate Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className={cn(
            "border-l-4",
            isValid ? "border-l-green-500 bg-green-50/50" : "border-l-yellow-500 bg-yellow-50/50"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    isValid ? "bg-green-100" : "bg-yellow-100"
                  )}>
                    {isValid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isValid ? 'Certificación Vigente' : 'En Proceso de Renovación'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isValid 
                        ? `Válida hasta ${currentCertification.expiryDate.toLocaleDateString('es-PE')}`
                        : 'Proceso de recertificación en curso'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "text-sm",
                    isValid 
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  )}>
                    <Star className="w-3 h-3 mr-1" />
                    {isValid ? 'Certificado Válido' : 'En Renovación'}
                  </Badge>
                  {currentCertification.verificationUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(currentCertification.verificationUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Verificar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Certificate Viewer */}
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Certificate Display */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              
              {/* Certificate Viewer Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                  >
                    Reiniciar
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Zoom: {Math.round(zoom * 100)}%
                  </span>
                  <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Pantalla Completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Certificado ISO 9001:2015 - Vista Completa</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <div 
                          className="max-w-full max-h-full transition-all duration-300"
                          style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`
                          }}
                        >
                          <CertificateContent />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Certificate Container */}
              <div className="relative bg-gradient-to-br from-muted/20 to-muted/5 rounded-2xl p-8 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(var(--primary)) 1px, transparent 0)',
                      backgroundSize: '30px 30px'
                    }}
                  />
                </div>

                {/* Certificate with transformations */}
                <div 
                  ref={certificateRef}
                  className="relative transition-all duration-500 origin-center mx-auto max-w-2xl"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`
                  }}
                >
                  <CertificateContent />
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="rounded-full w-10 h-10 shadow-lg"
                    onClick={() => window.open(currentCertification.pdfUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full w-10 h-10 shadow-lg"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Compartir Certificado</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        {shareOptions.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            className="flex items-center gap-3 justify-start p-4 h-auto"
                            onClick={() => handleShare(option.id)}
                          >
                            <option.icon className={cn("w-5 h-5", option.color)} />
                            <span>{option.label}</span>
                            {option.id === 'copy' && copied && (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Certificate Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            
            {/* Certificate Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Información del Certificado
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Norma:</span>
                      <div className="font-medium">ISO 9001:2015</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">N° Certificado:</span>
                      <div className="font-medium">{currentCertification.certificateNumber}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha Emisión:</span>
                      <div className="font-medium">
                        {currentCertification.issueDate.toLocaleDateString('es-PE')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vigencia:</span>
                      <div className="font-medium">
                        {currentCertification.expiryDate.toLocaleDateString('es-PE')}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Ente Certificador:</span>
                      <div className="font-medium">{currentCertification.certifyingBody}</div>
                    </div>
                  </div>
                  
                  {currentCertification.accreditationNumber && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-muted-foreground text-sm">N° Acreditación:</span>
                      <div className="font-medium">{currentCertification.accreditationNumber}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scope of Certification */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Alcance de Certificación
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Actividades Certificadas:</span>
                    <ul className="mt-2 space-y-1 text-sm">

                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        Gestión de proyectos de infraestructura
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        Supervisión y control de obras
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        Consultoría en construcción
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Descargas Disponibles
                </h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-primary hover:bg-primary/90"
                    onClick={() => window.open(currentCertification.pdfUrl, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Certificado PDF (Oficial)
                    <Badge className="ml-auto bg-primary-foreground text-primary">
                      Vigente
                    </Badge>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <QrCode className="w-4 h-4 mr-3" />
                    Código QR de Verificación
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-3" />
                    Cadena de Autenticidad
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-800">
                  <Shield className="w-5 h-5" />
                  Verificación de Autenticidad
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Este certificado puede ser verificado directamente en el sitio web 
                  del ente certificador.
                </p>
                {currentCertification.verificationUrl && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(currentCertification.verificationUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar Ahora
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Separate certificate content component for reusability
function CertificateContent() {
  return (
    <Card className="w-full bg-gradient-to-br from-background to-muted/20 border-2 border-primary/20 shadow-2xl">
      <CardContent className="p-12 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <Award className="w-20 h-20 text-primary mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CERTIFICADO
          </h1>
          <h2 className="text-xl font-semibold text-primary">
            ISO 9001:2015
          </h2>
        </div>

        {/* Body */}
        <div className="text-center space-y-6">
          <div>
            <p className="text-muted-foreground mb-3">Se certifica que</p>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              MÉTRICA DIP S.A.C.
            </h3>
            <p className="text-muted-foreground">
              Dirección Integral de Proyectos
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ha implementado y mantiene un Sistema de
            </p>
            <p className="text-lg font-semibold text-foreground">
              GESTIÓN DE CALIDAD
            </p>
            <p className="text-sm text-muted-foreground">
              conforme a los requisitos de la norma ISO 9001:2015
            </p>
          </div>

          {/* Certificate Status Indicator */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgb(var(--primary) / 0.4)",
                "0 0 0 10px rgb(var(--primary) / 0)",
                "0 0 0 0 rgb(var(--primary) / 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">
              Vigente hasta {currentCertification.expiryDate.getFullYear()}
            </span>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div>
              <div>Cert. N° {currentCertification.certificateNumber}</div>
              <div>Emitido: {currentCertification.issueDate.toLocaleDateString('es-PE')}</div>
            </div>
            <div className="text-center">
              <Globe className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className="text-primary font-medium">
                {currentCertification.certifyingBody}
              </div>
            </div>
            <div className="text-right">
              <div>Válido hasta:</div>
              <div>{currentCertification.expiryDate.toLocaleDateString('es-PE')}</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary/30" />

        {/* Holographic Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-yellow-500/5 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(45deg, transparent, rgb(var(--primary) / 0.05), transparent)",
              "linear-gradient(90deg, transparent, rgb(var(--primary) / 0.1), transparent)",
              "linear-gradient(135deg, transparent, rgb(var(--primary) / 0.05), transparent)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </CardContent>
    </Card>
  );
}