'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Target, 
  Users, 
  Shield, 
  TrendingUp, 
  Heart,
  Download,
  Eye,
  ArrowRight,
  CheckCircle2,
  Award,
  Sparkles,
  Globe,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const policyDocument = {
  title: "Política de Calidad",
  version: "3.2",
  lastUpdate: new Date(2024, 0, 15),
  approvedBy: "Dirección General",
  effectiveDate: new Date(2024, 1, 1),
  nextReview: new Date(2025, 0, 31)
};

const commitments = [
  {
    icon: Target,
    title: "Excelencia en la Entrega",
    description: "Nos comprometemos a entregar proyectos que superen las expectativas de nuestros clientes, cumpliendo con los más altos estándares de calidad, tiempo y presupuesto.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    icon: Users,
    title: "Desarrollo del Talento",
    description: "Invertimos en el desarrollo continuo de nuestro equipo, asegurando competencias técnicas y humanas que garanticen la excelencia operativa.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    icon: Shield,
    title: "Cumplimiento Normativo",
    description: "Mantenemos el estricto cumplimiento de todas las normativas aplicables, códigos de construcción y requisitos legales vigentes.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    icon: TrendingUp,
    title: "Mejora Continua",
    description: "Implementamos un ciclo constante de mejora en nuestros procesos, tecnologías y metodologías de gestión de proyectos.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Heart,
    title: "Responsabilidad Social",
    description: "Actuamos como agentes de desarrollo sostenible, contribuyendo positivamente al crecimiento de las comunidades donde operamos.",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200"
  },
  {
    icon: Globe,
    title: "Sostenibilidad Ambiental",
    description: "Integramos prácticas ambientalmente responsables en todos nuestros proyectos, minimizando impactos y promoviendo la construcción sostenible.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  }
];

const objectives = [
  {
    id: "customer-satisfaction",
    title: "Satisfacción del Cliente",
    target: "≥ 95%",
    current: "98.2%",
    description: "Mantener niveles excepcionales de satisfacción en todos nuestros proyectos",
    status: "achieved"
  },
  {
    id: "delivery-time",
    title: "Cumplimiento de Cronograma",
    target: "≥ 90%",
    current: "94.8%",
    description: "Entregar proyectos dentro del plazo establecido",
    status: "achieved"
  },
  {
    id: "budget-compliance",
    title: "Cumplimiento Presupuestario",
    target: "≥ 95%",
    current: "96.1%",
    description: "Mantener los proyectos dentro del presupuesto aprobado",
    status: "achieved"
  },
  {
    id: "safety-incidents",
    title: "Incidentes de Seguridad",
    target: "0",
    current: "0",
    description: "Cero incidentes de seguridad en obra",
    status: "achieved"
  },
  {
    id: "team-competency",
    title: "Competencia del Equipo",
    target: "≥ 85%",
    current: "92.4%",
    description: "Nivel de competencia certificada del personal técnico",
    status: "achieved"
  },
  {
    id: "process-efficiency",
    title: "Eficiencia de Procesos",
    target: "≥ 80%",
    current: "87.6%",
    description: "Optimización continua de procesos internos",
    status: "achieved"
  }
];

const policyStructure = [
  {
    section: "1. Propósito y Alcance",
    content: "Establecer los principios fundamentales que guían nuestro compromiso con la calidad en la dirección integral de proyectos de construcción e infraestructura.",
    isExpanded: false
  },
  {
    section: "2. Compromisos de la Dirección",
    content: "La alta dirección se compromete a proporcionar los recursos necesarios, liderar con el ejemplo y mantener el enfoque en la satisfacción del cliente.",
    isExpanded: false
  },
  {
    section: "3. Principios de Calidad",
    content: "Basamos nuestro sistema en los 7 principios de gestión de calidad ISO 9001, adaptados específicamente a nuestro sector de construcción.",
    isExpanded: false
  },
  {
    section: "4. Objetivos y Metas",
    content: "Establecemos objetivos cuantificables y medibles que se revisan periódicamente para asegurar la mejora continua del sistema.",
    isExpanded: false
  }
];

export default function QualityPolicy() {
  const [expandedCommitment, setExpandedCommitment] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

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
            Compromiso Organizacional
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Nuestra <span className="text-primary">Política de Calidad</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Los principios y compromisos que guían cada decisión y acción en Métrica DIP, 
            asegurando la excelencia en todos nuestros proyectos de construcción e infraestructura.
          </p>
        </motion.div>

        {/* Policy Document Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      {policyDocument.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span>Versión {policyDocument.version}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Actualizado: {policyDocument.lastUpdate.toLocaleDateString('es-PE')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Aprobado por: {policyDocument.approvedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Completa
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Policy Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Declaración de Política de Calidad
                  </h3>
                  <blockquote className="text-lg leading-relaxed text-muted-foreground italic border-l-4 border-primary/30 pl-6">
                    "En Métrica DIP nos comprometemos a ser líderes en la dirección integral de proyectos 
                    de construcción e infraestructura, proporcionando servicios que superen consistentemente 
                    las expectativas de nuestros clientes. Basamos nuestro éxito en un equipo altamente 
                    competente, procesos eficientes, mejora continua y un inquebrantable compromiso con 
                    la excelencia, la seguridad y la responsabilidad social."
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Dirección General</p>
                      <p className="text-sm text-muted-foreground">Métrica DIP S.A.C.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Commitments Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Nuestros Compromisos</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Seis pilares fundamentales que definen nuestra cultura de calidad y excelencia operativa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commitments.map((commitment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                onMouseEnter={() => setExpandedCommitment(index)}
                onMouseLeave={() => setExpandedCommitment(null)}
                className="group"
              >
                <Card className={cn(
                  "h-full border-2 transition-all duration-300 cursor-pointer",
                  "hover:shadow-lg hover:border-primary/30",
                  expandedCommitment === index && "border-primary/50 shadow-lg"
                )}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                          expandedCommitment === index ? "bg-primary text-primary-foreground" : commitment.bgColor
                        )}>
                          <commitment.icon className={cn(
                            "w-6 h-6 transition-colors duration-300",
                            expandedCommitment === index ? "text-primary-foreground" : commitment.color
                          )} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-semibold text-lg mb-2 transition-colors duration-300",
                            expandedCommitment === index ? "text-primary" : "text-foreground"
                          )}>
                            {commitment.title}
                          </h4>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {commitment.description}
                      </p>

                      <AnimatePresence>
                        {expandedCommitment === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pt-4 border-t border-border"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Estado:</span>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Activo
                              </Badge>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Objetivos de Calidad 2024</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Metas cuantificables que demuestran nuestro compromiso con la excelencia operativa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => (
              <motion.div
                key={objective.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="h-full border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-transparent">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg text-foreground">
                          {objective.title}
                        </h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Logrado
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {objective.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Meta:</span>
                          <span className="text-sm font-semibold text-primary">{objective.target}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Actual:</span>
                          <span className="text-lg font-bold text-green-600">{objective.current}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Policy Structure */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Estructura del Documento</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Resumen de las secciones principales de nuestra política de calidad
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                {policyStructure.map((section, index) => (
                  <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <motion.div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                        {expandedSection === index ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground mb-2 hover:text-primary transition-colors">
                          {section.section}
                        </h4>
                        <AnimatePresence>
                          {expandedSection === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <p className="text-muted-foreground leading-relaxed">
                                {section.content}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold mb-4">
                    Comprometidos con la Excelencia
                  </h4>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Nuestra política de calidad no es solo un documento, es el corazón de todo lo que hacemos. 
                    Cada proyecto refleja estos principios y compromisos.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Política Completa
                  </Button>
                  <Button variant="outline" size="lg">
                    <Shield className="w-4 h-4 mr-2" />
                    Ver Sistema de Gestión
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Próxima revisión:</strong> {policyDocument.nextReview.toLocaleDateString('es-PE')} • 
                    <strong> Vigente desde:</strong> {policyDocument.effectiveDate.toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}