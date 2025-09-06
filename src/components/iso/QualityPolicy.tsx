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
import { useISOData } from '@/hooks/useISOData';

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
  const { data, loading, error } = useISOData();
  const [expandedCommitment, setExpandedCommitment] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando política de calidad...</p>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-red-600">Error cargando datos</p>
        </div>
      </section>
    );
  }

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
            Los principios y compromisos que guían cada decisión y acción en Métrica FM, 
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
                      {data.quality_policy.document.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span>Versión {data.quality_policy.document.version}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Actualizado: {new Date(data.quality_policy.document.last_update).toLocaleDateString('es-PE')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Aprobado por: {data.quality_policy.document.approved_by}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => window.open('/documents/politica-calidad-metrica-dip.pdf', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const element = document.querySelector('.policy-content');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
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
          className="mb-20 policy-content"
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
                    "En Métrica FM nos comprometemos a ser líderes en la dirección integral de proyectos 
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
                      <p className="text-sm text-muted-foreground">Métrica FM S.A.C.</p>
                    </div>
                  </div>
                </div>
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
                    onClick={() => window.open('/documents/politica-calidad-metrica-dip.pdf', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Política Completa
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      const element = document.getElementById('introduccion');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Ver Sistema de Gestión
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Próxima revisión:</strong> {new Date(data.quality_policy.document.next_review).toLocaleDateString('es-PE')} • 
                    <strong> Vigente desde:</strong> {new Date(data.quality_policy.document.effective_date).toLocaleDateString('es-PE')}
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