'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Star,
  Share2,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import { JobPosting, getJobCategoryLabel, getJobTypeLabel } from '@/types/careers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

interface JobDescriptionProps {
  job: JobPosting;
  onApply?: () => void;
  className?: string;
}

export default function JobDescription({ job, onApply, className }: JobDescriptionProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
      }
      return num.toString();
    };
    return `S/ ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // Here you would typically save to localStorage or API
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: job.description,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'gestion': 'bg-blue-100 text-blue-800 border-blue-200',
      'ingenieria': 'bg-green-100 text-green-800 border-green-200',
      'arquitectura': 'bg-purple-100 text-purple-800 border-purple-200',
      'operaciones': 'bg-orange-100 text-orange-800 border-orange-200',
      'administracion': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-8", className)}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={getCategoryColor(job.category)}>
            {getJobCategoryLabel(job.category)}
          </Badge>
          {job.featured && (
            <Badge variant="secondary">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
          {job.remote && (
            <Badge variant="outline">
              Trabajo Remoto
            </Badge>
          )}
          {job.urgency === 'urgent' && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Urgente
            </Badge>
          )}
        </div>

        {/* Title and Company */}
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {job.title}
          </h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <Building2 className="w-5 h-5" />
            <span>{job.department}</span>
            <span>•</span>
            <span>Métrica DIP</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Ubicación</div>
              <div className="font-medium">{job.location.city}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Tipo</div>
              <div className="font-medium">{getJobTypeLabel(job.type)}</div>
            </div>
          </div>
          
          {job.salary && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Salario</div>
                <div className="font-medium">{formatSalary(job.salary.min, job.salary.max)}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Publicado</div>
              <div className="font-medium">{formatDate(job.postedAt)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={onApply} size="lg" className="bg-primary hover:bg-primary/90">
            Aplicar Ahora
          </Button>
          <Button variant="outline" onClick={handleBookmark} className="gap-2">
            <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
            {bookmarked ? 'Guardado' : 'Guardar'}
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Description */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Descripción del Puesto
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Requisitos
            </h2>
            <div className="space-y-3">
              {job.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{requirement.title}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Beneficios
              </h2>
              <div className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground font-medium">{benefit.title}</span>
                      {benefit.description && (
                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Nice to Have */}
          {job.niceToHave && job.niceToHave.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Deseable (No indispensable)
              </h2>
              <div className="space-y-3">
                {job.niceToHave.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 border-2 border-muted-foreground rounded-full flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Apply */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Aplicación Rápida
              </h3>
              <p className="text-sm text-muted-foreground">
                ¿Cumples con los requisitos? Aplica directamente.
              </p>
              <Button onClick={onApply} className="w-full">
                Aplicar Ahora
              </Button>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  ¿Tienes preguntas?
                </p>
                <Button variant="outline" size="sm">
                  Contactar RRHH
                </Button>
              </div>
            </div>
          </Card>

          {/* Job Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Resumen de la Posición
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Experiencia</div>
                <div className="font-medium">{job.experience} años</div>
              </div>
              
              {job.salary && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Salario</div>
                  <div className="font-medium">
                    {formatSalary(job.salary.min, job.salary.max)} mensual
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Tipo de contrato</div>
                <div className="font-medium">{getJobTypeLabel(job.type)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Modalidad</div>
                <div className="font-medium">
                  {job.remote ? 'Remoto/Híbrido' : 'Presencial'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Válida hasta</div>
                <div className="font-medium">
                  {formatDate(job.deadline)}
                </div>
              </div>
            </div>
          </Card>

          {/* Skills Required */}
          {job.requirements.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Habilidades Clave
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requirements.slice(0, 8).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill.title}
                  </Badge>
                ))}
                {job.requirements.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.requirements.length - 8} más
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Company Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Sobre Métrica DIP
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Somos líderes en gestión integral de proyectos de infraestructura en Perú, 
              con más de 15 años de experiencia transformando el sector construcción 
              con innovación y excelencia.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Conocer más sobre nosotros
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}