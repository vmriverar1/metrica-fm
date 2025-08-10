// ISO 9001 Types - Certificación y Sistema de Gestión de Calidad

export interface ISOCertification {
  id: string;
  standard: 'ISO 9001:2015';
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
  certificateNumber: string;
  scope: string[];
  status: 'active' | 'renewal' | 'suspended' | 'expired';
  pdfUrl: string;
  verificationUrl?: string;
}

export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  category: 'satisfaction' | 'quality' | 'efficiency' | 'compliance';
  target: number;
  current: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  unit: string;
  lastUpdated: Date;
}

export interface QualityProcess {
  id: string;
  name: string;
  description: string;
  category: 'strategic' | 'operational' | 'support' | 'improvement';
  owner: string;
  inputs: string[];
  outputs: string[];
  kpis: string[];
  documentation: {
    procedure: string;
    workInstruction?: string;
    forms: string[];
  };
  lastReview: Date;
  nextReview: Date;
}

export interface AuditRecord {
  id: string;
  type: 'internal' | 'external' | 'certification' | 'surveillance';
  date: Date;
  auditor: string;
  area: string;
  result: 'conformity' | 'minor_nonconformity' | 'major_nonconformity' | 'opportunity';
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  followUpDate?: Date;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
}

export interface Finding {
  id: string;
  type: 'nonconformity' | 'observation' | 'opportunity';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  evidence: string;
  requirement: string; // ISO clause reference
  rootCause?: string;
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  responsible: string;
  dueDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  effectiveness?: 'effective' | 'partially_effective' | 'not_effective';
  verificationDate?: Date;
}

export interface QualityPolicy {
  id: string;
  title: string;
  version: string;
  approvalDate: Date;
  approvedBy: string;
  nextReview: Date;
  content: {
    commitment: string;
    objectives: string[];
    principles: string[];
    responsibilities: string[];
  };
  pdfUrl: string;
}

export interface QualityObjective {
  id: string;
  title: string;
  description: string;
  owner: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'not_started' | 'in_progress' | 'achieved' | 'overdue';
  progress: number; // 0-100
  actions: string[];
}

export interface DocumentControl {
  id: string;
  title: string;
  type: 'policy' | 'procedure' | 'work_instruction' | 'form' | 'manual';
  version: string;
  status: 'draft' | 'active' | 'obsolete' | 'under_review';
  approvalDate: Date;
  approvedBy: string;
  nextReview: Date;
  controlledCopies: number;
  distributionList: string[];
  url: string;
}

export interface CustomerSatisfaction {
  id: string;
  period: string;
  totalResponses: number;
  overallSatisfaction: number; // 1-5 scale
  categories: {
    quality: number;
    delivery: number;
    communication: number;
    support: number;
    value: number;
  };
  nps: number; // Net Promoter Score
  comments: {
    positive: string[];
    negative: string[];
    suggestions: string[];
  };
  trends: {
    period: string;
    score: number;
  }[];
}

export interface ImprovementOpportunity {
  id: string;
  title: string;
  description: string;
  source: 'audit' | 'customer_feedback' | 'employee_suggestion' | 'management_review' | 'data_analysis';
  category: 'process' | 'product' | 'service' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  proposedBy: string;
  dateProposed: Date;
  status: 'proposed' | 'approved' | 'in_progress' | 'implemented' | 'rejected';
  expectedBenefits: string[];
  resources: {
    budget: number;
    timeframe: string;
    personnel: string[];
  };
  roi?: number;
}

export interface CertificationTimeline {
  id: string;
  year: number;
  event: 'initial_certification' | 'surveillance_audit' | 'recertification' | 'scope_extension';
  status: 'completed' | 'scheduled' | 'in_progress';
  certifyingBody: string;
  outcome?: 'certificate_issued' | 'certificate_maintained' | 'minor_findings' | 'major_findings';
  validUntil?: Date;
  notes?: string;
}

export interface ISOStats {
  certificationYears: number;
  totalProcesses: number;
  totalAudits: number;
  averageSatisfaction: number;
  conformityRate: number;
  improvementProjects: number;
  certifiedProjects: number;
  teamMembers: number;
}

// Helper functions
export function getCertificationStatus(cert: ISOCertification): 'valid' | 'expiring_soon' | 'expired' {
  const now = new Date();
  const expiryDate = new Date(cert.expiryDate);
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 90) return 'expiring_soon';
  return 'valid';
}

export function getProcessCategoryLabel(category: QualityProcess['category']): string {
  const labels: Record<QualityProcess['category'], string> = {
    strategic: 'Procesos Estratégicos',
    operational: 'Procesos Operativos',
    support: 'Procesos de Apoyo',
    improvement: 'Procesos de Mejora'
  };
  return labels[category];
}

export function getAuditTypeLabel(type: AuditRecord['type']): string {
  const labels: Record<AuditRecord['type'], string> = {
    internal: 'Auditoría Interna',
    external: 'Auditoría Externa',
    certification: 'Auditoría de Certificación',
    surveillance: 'Auditoría de Seguimiento'
  };
  return labels[type];
}

export function calculateOverallCompliance(audits: AuditRecord[]): number {
  if (audits.length === 0) return 100;
  
  const totalFindings = audits.reduce((sum, audit) => sum + audit.findings.length, 0);
  const conformities = audits.filter(audit => audit.result === 'conformity').length;
  
  return Math.round((conformities / audits.length) * 100);
}

// Overloaded function signatures
export function formatMetricValue(metric: QualityMetric): string;
export function formatMetricValue(value: number, unit: string): string;
export function formatMetricValue(metricOrValue: QualityMetric | number, unit?: string): string {
  let value: number;
  let actualUnit: string;
  
  if (typeof metricOrValue === 'object') {
    // Called with QualityMetric object
    if (!metricOrValue || typeof metricOrValue.current === 'undefined') {
      return 'N/A';
    }
    value = metricOrValue.current;
    actualUnit = metricOrValue.unit;
  } else {
    // Called with separate value and unit parameters
    if (typeof metricOrValue === 'undefined' || typeof unit === 'undefined') {
      return 'N/A';
    }
    value = metricOrValue;
    actualUnit = unit;
  }
  
  switch (actualUnit) {
    case 'percentage':
      return `${value}%`;
    case 'days':
      return `${value} días`;
    case 'hours':
      return `${value} hrs`;
    case 'count':
      return value.toString();
    case 'currency':
      return `S/ ${value.toLocaleString('es-PE')}`;
    default:
      return `${value} ${actualUnit}`;
  }
}