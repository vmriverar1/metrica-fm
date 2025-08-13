'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  JobPosting, 
  CareerFilters, 
  JobCategory, 
  JobType, 
  JobLevel, 
  sampleJobPostings,
  sampleBenefits,
  JobBenefit 
} from '@/types/careers';

interface CareersContextType {
  // Data
  allJobs: JobPosting[];
  filteredJobs: JobPosting[];
  selectedJob: JobPosting | null;
  benefits: JobBenefit[];
  
  // Filters
  filters: CareerFilters;
  setFilters: (filters: CareerFilters) => void;
  
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
  clearFilters: () => void;
  
  // Computed values
  uniqueCategories: JobCategory[];
  uniqueLocations: string[];
  uniqueDepartments: string[];
  uniqueTypes: JobType[];
  uniqueLevels: JobLevel[];
  uniqueTags: string[];
  uniqueSkills: string[];
  jobCount: number;
  salaryRange: { min: number; max: number };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const CareersContext = createContext<CareersContextType | undefined>(undefined);

interface CareersProviderProps {
  children: ReactNode;
}

export function CareersProvider({ children }: CareersProviderProps) {
  const [allJobs] = useState<JobPosting[]>(sampleJobPostings);
  const [benefits] = useState<JobBenefit[]>(sampleBenefits);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CareerFilters>({
    searchQuery: ''
  });

  // Memoized filtered jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...allJobs];

    // Only show active jobs
    filtered = filtered.filter(job => job.status === 'active');

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category);
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(job => 
        `${job.location.city}, ${job.location.region}` === filters.location ||
        job.location.city === filters.location
      );
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    // Filter by level
    if (filters.level) {
      filtered = filtered.filter(job => job.level === filters.level);
    }

    // Filter by salary range
    if (filters.salaryRange) {
      filtered = filtered.filter(job => {
        if (!job.salary) return false;
        const jobAvgSalary = (job.salary.min + job.salary.max) / 2;
        return jobAvgSalary >= filters.salaryRange![0] && jobAvgSalary <= filters.salaryRange![1];
      });
    }
    
    // Filter by department
    if (filters.department) {
      filtered = filtered.filter(job => job.department === filters.department);
    }
    
    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobSkills = job.requirements
          .filter(req => req.type === 'skill')
          .map(req => req.title.toLowerCase());
        return filters.skills!.some(skill => 
          jobSkills.some(jobSkill => jobSkill.includes(skill.toLowerCase()))
        );
      });
    }

    // Filter by remote
    if (filters.remote !== undefined && filters.remote !== null) {
      filtered = filtered.filter(job => 
        filters.remote ? job.location.remote || job.location.hybrid : !job.location.remote
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(job => 
        filters.tags!.some(tag => job.tags.includes(tag))
      );
    }

    // Filter by featured
    if (filters.featured) {
      filtered = filtered.filter(job => job.featured);
    }

    // Filter by urgent
    if (filters.urgent) {
      filtered = filtered.filter(job => job.urgent);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.city.toLowerCase().includes(searchLower) ||
        job.responsibilities.some(resp => resp.toLowerCase().includes(searchLower)) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by priority: featured > urgent > posted date
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return b.postedAt.getTime() - a.postedAt.getTime();
    });

    return filtered;
  }, [allJobs, filters]);

  // Memoized unique values
  const uniqueCategories = useMemo(() => {
    const categories = new Set<JobCategory>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        categories.add(job.category);
      }
    });
    return Array.from(categories);
  }, [allJobs]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        locations.add(`${job.location.city}, ${job.location.region}`);
      }
    });
    return Array.from(locations).sort();
  }, [allJobs]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<JobType>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        types.add(job.type);
      }
    });
    return Array.from(types);
  }, [allJobs]);

  const uniqueLevels = useMemo(() => {
    const levels = new Set<JobLevel>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        levels.add(job.level);
      }
    });
    return Array.from(levels);
  }, [allJobs]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        departments.add(job.department);
      }
    });
    return Array.from(departments).sort();
  }, [allJobs]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        job.requirements.forEach(req => {
          if (req.type === 'skill') {
            skills.add(req.title);
          }
        });
        job.tags.forEach(tag => skills.add(tag));
      }
    });
    return Array.from(skills).sort();
  }, [allJobs]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    allJobs.forEach(job => {
      if (job.status === 'active') {
        job.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [allJobs]);

  const salaryRange = useMemo(() => {
    const activeJobsWithSalary = allJobs.filter(job => 
      job.status === 'active' && job.salary
    );
    
    if (activeJobsWithSalary.length === 0) {
      return { min: 0, max: 20000 };
    }

    const salaries = activeJobsWithSalary.map(job => 
      (job.salary!.min + job.salary!.max) / 2
    );

    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  }, [allJobs]);

  // Actions
  const selectJob = useCallback((job: JobPosting | null) => {
    setSelectedJob(job);
  }, []);

  const searchJobs = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchQuery: term }));
  }, []);

  const filterByCategory = useCallback((category: JobCategory | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      category: category === 'all' ? undefined : category 
    }));
  }, []);

  const filterByLocation = useCallback((location: string | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      location: location === 'all' ? undefined : location 
    }));
  }, []);

  const filterByType = useCallback((type: JobType | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      type: type === 'all' ? undefined : type 
    }));
  }, []);

  const filterByLevel = useCallback((level: JobLevel | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      level: level === 'all' ? undefined : level 
    }));
  }, []);

  const filterBySalary = useCallback((min: number, max: number) => {
    setFilters(prev => ({ ...prev, salary: { min, max } }));
  }, []);

  const filterByRemote = useCallback((remote: boolean | null) => {
    setFilters(prev => ({ ...prev, remote }));
  }, []);

  const filterByTags = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  const toggleFeatured = useCallback(() => {
    setFilters(prev => ({ ...prev, featured: !prev.featured }));
  }, []);

  const toggleUrgent = useCallback(() => {
    setFilters(prev => ({ ...prev, urgent: !prev.urgent }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      category: 'all',
      location: 'all',
      type: 'all',
      level: 'all',
      salaryRange: { min: 0, max: 50000 },
      remote: null,
      tags: [],
      featured: false,
      urgent: false
    });
  }, []);

  const contextValue: CareersContextType = {
    // Data
    allJobs,
    filteredJobs,
    selectedJob,
    benefits,
    
    // Filters
    filters,
    setFilters,
    
    // Actions
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
    clearFilters,
    
    // Computed values
    uniqueCategories,
    uniqueLocations,
    uniqueDepartments,
    uniqueTypes,
    uniqueLevels,
    uniqueTags,
    uniqueSkills,
    jobCount: filteredJobs.length,
    salaryRange,
    
    // Loading states
    isLoading,
    error
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