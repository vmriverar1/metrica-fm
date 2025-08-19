'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  JobPosting, 
  CareerFilters, 
  JobCategory, 
  JobType, 
  JobLevel, 
  JobBenefit 
} from '@/types/careers';
import { useCareersService, CareersHookResult } from '@/hooks/useCareersService';
import { CareersServiceCategory } from '@/lib/careers-service';

interface CareersContextType extends Omit<CareersHookResult, 'jobs'> {
  // Data extendida del hook
  allJobs: JobPosting[];
  filteredJobs: JobPosting[];
  selectedJob: JobPosting | null;
  
  // Filters
  filters: CareerFilters;
  setFilters: (filters: CareerFilters) => void;
  updateFilters: (newFilters: Partial<CareerFilters>) => void;
  
  // Actions
  selectJob: (job: JobPosting | null) => void;
  searchJobs: (term: string) => void;
  filterByCategory: (category: JobCategory | 'all') => void;
  filterByLocation: (location: string | 'all') => void;
  filterByType: (type: JobType | 'all') => void;
  filterByLevel: (level: JobLevel | 'all') => void;
  filterBySalary: (min: number, max: number) => void;
  filterByRemote: (remote: boolean | null) => void;
  filterByTags: (tags: string[]) => void;
  toggleFeatured: () => void;
  toggleUrgent: () => void;
  resetFilters: () => void;
  
  // Computed values
  uniqueCategories: JobCategory[];
  uniqueLocations: string[];
  uniqueDepartments: string[];
  uniqueTypes: JobType[];
  uniqueLevels: JobLevel[];
  uniqueTags: string[];
  uniqueSkills: string[];
  featuredJobs: JobPosting[];
  urgentJobs: JobPosting[];
  jobCount: number;
  salaryRange: { min: number; max: number };
  
  // Renamed loading state for compatibility
  isLoading: boolean;
}

const CareersContext = createContext<CareersContextType | undefined>(undefined);

interface CareersProviderProps {
  children: ReactNode;
}

export function CareersProvider({ children }: CareersProviderProps) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [filters, setFilters] = useState<CareerFilters>({
    searchQuery: ''
  });

  // Usar el hook híbrido del CareersService
  const careersService = useCareersService(filters);

  // Los trabajos filtrados vienen directamente del CareersService
  const allJobs = careersService.jobs;
  const filteredJobs = careersService.jobs; // Ya están filtrados por el service

  // Memoized unique values basados en categorías del service
  const uniqueCategories = useMemo(() => {
    return careersService.categories.map(cat => cat.slug as JobCategory);
  }, [careersService.categories]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    careersService.jobs.forEach(job => {
      locations.add(`${job.location.city}, ${job.location.region}`);
    });
    return Array.from(locations).sort();
  }, [careersService.jobs]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<JobType>();
    careersService.jobs.forEach(job => {
      types.add(job.type);
    });
    return Array.from(types);
  }, [careersService.jobs]);

  const uniqueLevels = useMemo(() => {
    const levels = new Set<JobLevel>();
    careersService.jobs.forEach(job => {
      levels.add(job.level);
    });
    return Array.from(levels);
  }, [careersService.jobs]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();
    careersService.jobs.forEach(job => {
      if (job.status === 'active') {
        departments.add(job.department);
      }
    });
    return Array.from(departments).sort();
  }, [careersService.jobs]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    careersService.jobs.forEach(job => {
      job.requirements.forEach(req => {
        if (req.type === 'skill') {
          skills.add(req.title);
        }
      });
      job.tags.forEach(tag => skills.add(tag));
    });
    return Array.from(skills).sort();
  }, [careersService.jobs]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    careersService.jobs.forEach(job => {
      job.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [careersService.jobs]);

  const featuredJobs = useMemo(() => {
    return careersService.jobs.filter(job => job.featured);
  }, [careersService.jobs]);

  const urgentJobs = useMemo(() => {
    return careersService.jobs.filter(job => job.urgent);
  }, [careersService.jobs]);

  const salaryRange = useMemo(() => {
    const jobsWithSalary = careersService.jobs.filter(job => job.salary);
    
    if (jobsWithSalary.length === 0) {
      return { min: 0, max: 20000 };
    }

    const salaries = jobsWithSalary.map(job => 
      (job.salary!.min + job.salary!.max) / 2
    );

    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  }, [careersService.jobs]);

  // Actions
  const selectJob = useCallback((job: JobPosting | null) => {
    setSelectedJob(job);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<CareerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const searchJobs = useCallback((term: string) => {
    updateFilters({ searchQuery: term });
  }, [updateFilters]);

  const filterByCategory = useCallback((category: JobCategory | 'all') => {
    updateFilters({ category: category === 'all' ? undefined : category });
  }, [updateFilters]);

  const filterByLocation = useCallback((location: string | 'all') => {
    updateFilters({ location: location === 'all' ? undefined : location });
  }, [updateFilters]);

  const filterByType = useCallback((type: JobType | 'all') => {
    updateFilters({ type: type === 'all' ? undefined : type });
  }, [updateFilters]);

  const filterByLevel = useCallback((level: JobLevel | 'all') => {
    updateFilters({ level: level === 'all' ? undefined : level });
  }, [updateFilters]);

  const filterBySalary = useCallback((min: number, max: number) => {
    updateFilters({ salaryRange: [min, max] });
  }, [updateFilters]);

  const filterByRemote = useCallback((remote: boolean | null) => {
    updateFilters({ remote });
  }, [updateFilters]);

  const filterByTags = useCallback((tags: string[]) => {
    updateFilters({ tags });
  }, [updateFilters]);

  const toggleFeatured = useCallback(() => {
    updateFilters({ featured: !filters.featured });
  }, [updateFilters, filters.featured]);

  const toggleUrgent = useCallback(() => {
    updateFilters({ urgent: !filters.urgent });
  }, [updateFilters, filters.urgent]);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '' });
  }, []);

  const contextValue: CareersContextType = {
    // Data del CareersService híbrido
    allJobs,
    filteredJobs,
    selectedJob,
    categories: careersService.categories,
    benefits: careersService.benefits,
    stats: careersService.stats,
    
    // Filters
    filters,
    setFilters,
    updateFilters,
    
    // Actions del CareersService
    selectJob,
    searchJobs,
    filterByCategory,
    filterByLocation,
    filterByType,
    filterByLevel,
    filterBySalary,
    filterByRemote,
    filterByTags,
    toggleFeatured,
    toggleUrgent,
    resetFilters,
    refresh: careersService.refresh,
    getJobBySlug: careersService.getJobBySlug,
    getRelatedJobs: careersService.getRelatedJobs,
    clearCache: careersService.clearCache,
    
    // Computed values
    uniqueCategories,
    uniqueLocations,
    uniqueDepartments,
    uniqueTypes,
    uniqueLevels,
    uniqueTags,
    uniqueSkills,
    featuredJobs,
    urgentJobs,
    jobCount: filteredJobs.length,
    salaryRange,
    
    // System info del CareersService
    systemInfo: careersService.systemInfo,
    
    // Loading states (renombrados para compatibilidad)
    isLoading: careersService.loading,
    loading: careersService.loading,
    categoriesLoading: careersService.categoriesLoading,
    benefitsLoading: careersService.benefitsLoading,
    statsLoading: careersService.statsLoading,
    error: careersService.error
  };

  return (
    <CareersContext.Provider value={contextValue}>
      {children}
    </CareersContext.Provider>
  );
}

export function useCareers() {
  const context = useContext(CareersContext);
  if (context === undefined) {
    throw new Error('useCareers must be used within a CareersProvider');
  }
  return context;
}

// Hook para obtener un trabajo específico por id
export function useJob(id: string): JobPosting | null {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs.find(job => job.id === id) || null;
  }, [allJobs, id]);
}

// Hook para obtener trabajos por categoría
export function useJobsByCategory(category: JobCategory): JobPosting[] {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs.filter(job => 
      job.category === category && job.status === 'active'
    );
  }, [allJobs, category]);
}

// Hook para obtener trabajos destacados
export function useFeaturedJobs(): JobPosting[] {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs.filter(job => 
      job.featured && job.status === 'active'
    );
  }, [allJobs]);
}

// Hook para obtener trabajos urgentes
export function useUrgentJobs(): JobPosting[] {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs.filter(job => 
      job.urgent && job.status === 'active'
    );
  }, [allJobs]);
}

// Hook para obtener trabajos recientes
export function useRecentJobs(limit: number = 5): JobPosting[] {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs
      .filter(job => job.status === 'active')
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      .slice(0, limit);
  }, [allJobs, limit]);
}

// Hook para obtener trabajos relacionados
export function useRelatedJobs(currentJob: JobPosting, limit: number = 3): JobPosting[] {
  const { allJobs } = useCareers();
  return useMemo(() => {
    return allJobs
      .filter(job => 
        job.id !== currentJob.id && 
        job.status === 'active' &&
        (job.category === currentJob.category || 
         job.level === currentJob.level ||
         job.location.city === currentJob.location.city ||
         job.tags.some(tag => currentJob.tags.includes(tag)))
      )
      .sort((a, b) => {
        // Score by category, level, location and tag overlap
        const aScore = 
          (a.category === currentJob.category ? 3 : 0) +
          (a.level === currentJob.level ? 2 : 0) +
          (a.location.city === currentJob.location.city ? 1 : 0) +
          a.tags.filter(tag => currentJob.tags.includes(tag)).length;
        
        const bScore = 
          (b.category === currentJob.category ? 3 : 0) +
          (b.level === currentJob.level ? 2 : 0) +
          (b.location.city === currentJob.location.city ? 1 : 0) +
          b.tags.filter(tag => currentJob.tags.includes(tag)).length;
        
        return bScore - aScore;
      })
      .slice(0, limit);
  }, [allJobs, currentJob, limit]);
}

// Hook para cache similar al portfolio
export function useCareersCache() {
  const cacheKey = 'metrica-careers-cache';
  
  const getCache = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const setCache = useCallback((data: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch {
      // Silent fail
    }
  }, []);

  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      // Silent fail
    }
  }, []);

  return { getCache, setCache, clearCache };
}

// Hook para tracking de aplicaciones (simulado)
export function useApplicationTracking() {
  const trackApplication = useCallback((jobId: string, candidateEmail: string) => {
    if (typeof window === 'undefined') return;
    
    // Simular tracking de aplicación
    const applications = JSON.parse(
      localStorage.getItem('metrica-applications') || '[]'
    );
    
    const newApplication = {
      id: Date.now().toString(),
      jobId,
      candidateEmail,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    
    applications.push(newApplication);
    localStorage.setItem('metrica-applications', JSON.stringify(applications));
    
    return newApplication;
  }, []);

  const getApplications = useCallback((candidateEmail: string) => {
    if (typeof window === 'undefined') return [];
    
    try {
      const applications = JSON.parse(
        localStorage.getItem('metrica-applications') || '[]'
      );
      return applications.filter((app: any) => app.candidateEmail === candidateEmail);
    } catch {
      return [];
    }
  }, []);

  return { trackApplication, getApplications };
}