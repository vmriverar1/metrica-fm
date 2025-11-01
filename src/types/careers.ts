/**
 * Tipos de datos para el sistema de Careers/Jobs
 * Siguiendo el mismo patrón básico que newsletter.ts
 */

import { Timestamp } from 'firebase/firestore';

// Categorías de trabajo (siguiendo el patrón de newsletter)
export type JobCategory =
  | 'gestion-direccion'
  | 'ingenieria-tecnica'
  | 'arquitectura-diseño'
  | 'operaciones-control'
  | 'administracion-soporte';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'director';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';

// Departamento (similar a Category en newsletter)
export interface Department {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Trabajo principal (similar a Article en newsletter)
export interface JobPosting {
  id: string;
  title: string;
  slug: string;

  // Relations (como en newsletter)
  category: JobCategory;
  departmentId: string;
  authorId: string;

  // Content básico
  description: string;
  requirements: string;
  benefits: string;

  // Meta básica
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  featured: boolean;
  urgent: boolean;

  // Location simple
  location: string;
  remote: boolean;

  // Salary simple
  salary?: {
    min: number;
    max: number;
    currency: string;
  };

  // Dates
  postedAt: Date;
  deadline: Date;
  createdAt: Date;
  updatedAt?: Date;

  // SEO básico (como en newsletter)
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };

  // Tags simples
  tags: string;
}

// Interface con relaciones populadas (como en newsletter)
export interface JobPostingWithRelations extends JobPosting {
  department: Department;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

// Helper functions básicas
export function getJobCategoryLabel(category: JobCategory): string {
  const labels: Record<JobCategory, string> = {
    'gestion-direccion': 'Gestión y Dirección',
    'ingenieria-tecnica': 'Ingeniería y Técnica',
    'arquitectura-diseño': 'Arquitectura y Diseño',
    'operaciones-control': 'Operaciones y Control',
    'administracion-soporte': 'Administración y Soporte'
  };
  return labels[category];
}

export function getJobTypeLabel(type: JobType): string {
  const labels: Record<JobType, string> = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Por Contrato',
    'internship': 'Prácticas'
  };
  return labels[type];
}

export function getJobLevelLabel(level: JobLevel): string {
  const labels: Record<JobLevel, string> = {
    'entry': 'Nivel de Entrada',
    'junior': 'Junior',
    'mid': 'Intermedio',
    'senior': 'Senior',
    'lead': 'Líder de Equipo',
    'director': 'Director'
  };
  return labels[level];
}