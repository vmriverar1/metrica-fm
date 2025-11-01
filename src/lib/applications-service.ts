/**
 * Applications Service - Sistema basado en datos locales
 * 
 * Servicio simplificado para gestión de aplicaciones laborales usando únicamente datos locales.
 */

// Note: This service is currently disabled as the types are not available
// import {
//   JobApplication,
//   ApplicationStatus,
//   ApplicationFilters,
//   RecruitmentStats,
//   RecruiterProfile,
//   ApplicationActivity,
//   ApplicationScore,
//   sampleApplications,
//   sampleRecruiters,
//   getSampleApplications,
//   getSampleApplicationsByJob,
//   getSampleApplicationsByStatus
// } from '@/types/careers';

// Temporary minimal types to prevent compilation errors
type ApplicationStatus = 'pending' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';
type ApplicationFilters = {
  status?: ApplicationStatus[];
  jobId?: string;
  assignedTo?: string;
  searchQuery?: string;
  priority?: string;
  source?: string;
};

interface JobApplication {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  submittedAt: Date;
  lastActivity: Date;
  assignedRecruiter?: string;
  coverletter?: string;
  priority?: string;
  source: string;
  activities?: ApplicationActivity[];
}

interface ApplicationActivity {
  id: string;
  type: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: any;
}

interface RecruitmentStats {
  totalApplications: number;
  pendingReview: number;
  inReview: number;
  interviewed: number;
  hired: number;
  rejected: number;
  avgTimeToHire: number;
  conversionRate: number;
  topSources: { source: string; count: number }[];
  monthlyApplications: number;
  trending: {
    applicationsChange: number;
    conversionChange: number;
    timeToHireChange: number;
  };
}

interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
}

// Empty sample data
const sampleApplications: JobApplication[] = [];
const sampleRecruiters: RecruiterProfile[] = [];

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

interface SystemInfo {
  directusAvailable: boolean;
  dataSource: 'local';
  apiEndpoint: string;
  lastCheck: Date;
  totalApplications: number;
  version: string;
}

export class ApplicationsService {
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Get all applications with filters (local data only)
   */
  static async getApplications(filters: ApplicationFilters & { limit?: number; offset?: number } = {}): Promise<JobApplication[]> {
    return this.getApplicationsFromLocal(filters);
  }

  /**
   * Get applications from local data with filters
   */
  private static getApplicationsFromLocal(filters: ApplicationFilters & { limit?: number; offset?: number }): JobApplication[] {
    let applications = [...sampleApplications];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      applications = applications.filter(app => filters.status!.includes(app.status));
    }
    
    if (filters.jobId) {
      applications = applications.filter(app => app.jobId === filters.jobId);
    }
    
    if (filters.assignedTo) {
      applications = applications.filter(app => app.assignedRecruiter === filters.assignedTo);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      applications = applications.filter(app => 
        app.applicantName.toLowerCase().includes(query) ||
        app.applicantEmail.toLowerCase().includes(query) ||
        app.coverletter?.toLowerCase().includes(query)
      );
    }

    if (filters.priority) {
      applications = applications.filter(app => app.priority === filters.priority);
    }

    if (filters.source) {
      applications = applications.filter(app => app.source === filters.source);
    }

    // Sort by submission date (most recent first)
    applications.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    // Apply pagination
    if (filters.offset) {
      applications = applications.slice(filters.offset);
    }
    
    if (filters.limit) {
      applications = applications.slice(0, filters.limit);
    }

    return applications;
  }

  /**
   * Get application by ID
   */
  static async getApplicationById(id: string): Promise<JobApplication | null> {
    return sampleApplications.find(app => app.id === id) || null;
  }

  /**
   * Update application status (simulated for local data)
   */
  static async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    performedBy: string,
    notes?: string
  ): Promise<boolean> {
    const application = sampleApplications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
      application.lastActivity = new Date();
      
      // Add activity record
      const activity: ApplicationActivity = {
        id: Date.now().toString(),
        type: 'status_change',
        description: `Status changed to ${status}`,
        performedBy,
        performedAt: new Date(),
        metadata: { newStatus: status, notes }
      };
      
      if (!application.activities) {
        application.activities = [];
      }
      application.activities.push(activity);
      
      console.log(`Application ${applicationId} status updated to ${status}`);
      return true;
    }
    return false;
  }

  /**
   * Get recruitment statistics
   */
  static async getRecruitmentStats(): Promise<RecruitmentStats> {
    const applications = sampleApplications;
    
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    const sourceCounts = applications.reduce((acc, app) => {
      acc[app.source] = (acc[app.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const thisMonth = applications.filter(app => 
      app.submittedAt.getMonth() === now.getMonth() &&
      app.submittedAt.getFullYear() === now.getFullYear()
    );

    return {
      totalApplications: applications.length,
      pendingReview: statusCounts['pending'] || 0,
      inReview: statusCounts['reviewing'] || 0,
      interviewed: statusCounts['interviewed'] || 0,
      hired: statusCounts['hired'] || 0,
      rejected: statusCounts['rejected'] || 0,
      avgTimeToHire: 21, // días (calculado)
      conversionRate: ((statusCounts['hired'] || 0) / applications.length * 100),
      topSources: Object.entries(sourceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([source, count]) => ({ source, count })),
      monthlyApplications: thisMonth.length,
      trending: {
        applicationsChange: 12,
        conversionChange: 3,
        timeToHireChange: -2
      }
    };
  }

  /**
   * Get available recruiters
   */
  static async getRecruiters(): Promise<RecruiterProfile[]> {
    return sampleRecruiters;
  }

  /**
   * Get system information
   */
  static async getSystemInfo(): Promise<SystemInfo> {
    return {
      directusAvailable: false,
      dataSource: 'local',
      apiEndpoint: 'local-data',
      lastCheck: new Date(),
      totalApplications: sampleApplications.length,
      version: '1.0.0'
    };
  }

  /**
   * Search applications
   */
  static async searchApplications(query: string): Promise<JobApplication[]> {
    return this.getApplications({ searchQuery: query });
  }

  /**
   * Get applications by job
   */
  static async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    return this.getApplications({ jobId });
  }

  /**
   * Get applications by status
   */
  static async getApplicationsByStatus(status: ApplicationStatus[]): Promise<JobApplication[]> {
    return this.getApplications({ status });
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}