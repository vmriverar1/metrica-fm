'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  Star,
  DollarSign,
  Calendar,
  Building2,
  ChevronLeft,
  Mail,
  FileText,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { JobPosting } from '@/hooks/useDynamicCareersContent';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobDetailProps {
  job: JobPosting;
}

export default function JobDetail({ job }: JobDetailProps) {
  // Helper functions
  const getJobCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'gestion-direccion': 'Gestión y Dirección',
      'ingenieria-tecnica': 'Ingeniería Técnica',
      'arquitectura-diseño': 'Arquitectura y Diseño',
      'operaciones-control': 'Operaciones y Control',
      'administracion-finanzas': 'Administración y Finanzas'
    };
    return categoryMap[category] || category;
  };

  const getJobTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'contract': 'Por Contrato',
      'internship': 'Prácticas'
    };
    return typeMap[type] || type;
  };

  const getCategoryBgColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'gestion-direccion': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'ingenieria-tecnica': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'arquitectura-diseño': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'operaciones-control': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'administracion-finanzas': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return null;
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('es-PE').format(num);
    };
    return `S/ ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/careers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Volver a oportunidades laborales
            </Link>
          </div>

          {/* Job Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getCategoryBgColor(job.category)}>
                  {getJobCategoryLabel(job.category)}
                </Badge>
                {job.featured && (
                  <Badge variant="secondary">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Destacado
                  </Badge>
                )}
                {job.urgent && (
                  <Badge variant="destructive">
                    Urgente
                  </Badge>
                )}
                {(job.location.remote || job.location.hybrid) && (
                  <Badge variant="outline">
                    {job.location.remote ? 'Remoto' : 'Híbrido'}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {job.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {job.short_description}
              </p>

              {/* Job Meta */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job.location.city}, {job.location.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{getJobTypeLabel(job.type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Publicado {formatDate(job.posted_date)}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:w-80">
              <Card>
                <CardContent className="p-6">
                  {job.salary && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground mb-2">Salario</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatSalary(job.salary.min, job.salary.max)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {job.salary.currency} mensual
                        {job.salary.negotiable && ' (Negociable)'}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-2">Experiencia requerida</h3>
                    <div className="text-lg font-medium text-primary">
                      {job.experience_years}+ años
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-2">Fecha límite</h3>
                    <div className="text-sm text-foreground">
                      {formatDate(job.deadline)}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open(`mailto:${job.application_process.contact_email}?subject=Postulación: ${job.title}`, '_blank')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Postular Ahora
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{job.full_description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Responsabilidades Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.key_responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos Esenciales</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.essential.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Preferred Requirements */}
            {job.requirements.preferred.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos Deseables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.preferred.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Application Process */}
            <Card>
              <CardHeader>
                <CardTitle>Proceso de Aplicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Pasos:</h4>
                    <ol className="space-y-2">
                      {job.application_process.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Documentos requeridos:</h4>
                    <ul className="space-y-1">
                      {job.application_process.required_documents.map((doc, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(`mailto:${job.application_process.contact_email}?subject=Postulación: ${job.title}`, '_blank')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Postulación
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Únete a nuestro equipo y sé parte de los proyectos de infraestructura más importantes del Perú.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.open(`mailto:${job.application_process.contact_email}?subject=Postulación: ${job.title}`, '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Postular a este puesto
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/careers">
                Ver todas las oportunidades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}