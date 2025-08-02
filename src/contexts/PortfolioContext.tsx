'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Project, FilterState, ProjectCategory, sampleProjects } from '@/types/portfolio';

interface PortfolioContextType {
  // Data
  allProjects: Project[];
  filteredProjects: Project[];
  selectedProject: Project | null;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  
  // Actions
  selectProject: (project: Project | null) => void;
  searchProjects: (term: string) => void;
  filterByCategory: (category: ProjectCategory | 'all') => void;
  filterByLocation: (location: string | 'all') => void;
  filterByYear: (year: number | 'all') => void;
  
  // Computed values
  uniqueLocations: string[];
  uniqueYears: number[];
  projectCount: number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [allProjects] = useState<Project[]>(sampleProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    location: 'all',
    year: 'all',
    searchTerm: ''
  });

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(project => project.category === filters.category);
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(project => project.location.city === filters.location);
    }

    // Filter by year
    if (filters.year !== 'all') {
      filtered = filtered.filter(project => project.completedAt.getFullYear() === filters.year);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.location.city.toLowerCase().includes(searchLower) ||
        project.details.client.toLowerCase().includes(searchLower) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allProjects, filters]);

  // Memoized unique values
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allProjects.forEach(project => {
      locations.add(project.location.city);
    });
    return Array.from(locations).sort();
  }, [allProjects]);

  const uniqueYears = useMemo(() => {
    const years = new Set<number>();
    allProjects.forEach(project => {
      years.add(project.completedAt.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allProjects]);

  // Actions
  const selectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
  }, []);

  const searchProjects = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const filterByCategory = useCallback((category: ProjectCategory | 'all') => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const filterByLocation = useCallback((location: string | 'all') => {
    setFilters(prev => ({ ...prev, location }));
  }, []);

  const filterByYear = useCallback((year: number | 'all') => {
    setFilters(prev => ({ ...prev, year }));
  }, []);

  const contextValue: PortfolioContextType = {
    // Data
    allProjects,
    filteredProjects,
    selectedProject,
    
    // Filters
    filters,
    setFilters,
    
    // Actions
    selectProject,
    searchProjects,
    filterByCategory,
    filterByLocation,
    filterByYear,
    
    // Computed values
    uniqueLocations,
    uniqueYears,
    projectCount: filteredProjects.length,
    
    // Loading states
    isLoading,
    error
  };

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

// Hook para obtener un proyecto específico por slug
export function useProject(slug: string): Project | null {
  const { allProjects } = usePortfolio();
  return useMemo(() => {
    return allProjects.find(project => project.slug === slug) || null;
  }, [allProjects, slug]);
}

// Hook para obtener proyectos por categoría
export function useProjectsByCategory(category: ProjectCategory): Project[] {
  const { allProjects } = usePortfolio();
  return useMemo(() => {
    return allProjects.filter(project => project.category === category);
  }, [allProjects, category]);
}

// Hook para obtener proyectos destacados
export function useFeaturedProjects(): Project[] {
  const { allProjects } = usePortfolio();
  return useMemo(() => {
    return allProjects.filter(project => project.featured);
  }, [allProjects]);
}