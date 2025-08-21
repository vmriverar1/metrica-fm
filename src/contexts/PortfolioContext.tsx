'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Project, FilterState, ProjectCategory } from '@/types/portfolio';
import { PortfolioPageData } from '@/types/portfolio-page';

interface PortfolioContextType {
  // Combined data
  pageData: PortfolioPageData | null;
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
  const [pageData, setPageData] = useState<PortfolioPageData | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    location: 'all',
    year: 'all',
    searchTerm: ''
  });

  // Fetch portfolio data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both page content and project data in parallel
        const [pageResponse, projectsResponse] = await Promise.all([
          fetch('/json/pages/portfolio.json', { cache: 'no-store' }),
          fetch('/json/dynamic-content/portfolio/content.json', { cache: 'no-store' })
        ]);

        if (!pageResponse.ok) {
          throw new Error(`Failed to fetch page data: ${pageResponse.status}`);
        }

        if (!projectsResponse.ok) {
          throw new Error(`Failed to fetch projects data: ${projectsResponse.status}`);
        }

        const [pageJson, projectsJson] = await Promise.all([
          pageResponse.json(),
          projectsResponse.json()
        ]);

        setPageData(pageJson);
        
        // Extract and transform projects from the dynamic content JSON
        if (projectsJson.projects && Array.isArray(projectsJson.projects)) {
          console.log('Raw projects from JSON:', projectsJson.projects.length);
          const transformedProjects = projectsJson.projects.map((project: any) => ({
            ...project,
            // Transform completed_at string to completedAt Date object
            completedAt: project.completed_at ? new Date(project.completed_at) : new Date(),
            // Map snake_case to camelCase for image fields
            featuredImage: project.featured_image || '',
            thumbnailImage: project.thumbnail_image || '',
            shortDescription: project.short_description || project.description || '',
            // Map any other field names if needed
            category: project.category as ProjectCategory
          }));
          console.log('Transformed projects:', transformedProjects.length);
          console.log('First few projects:', transformedProjects.slice(0, 3).map(p => ({ id: p.id, title: p.title, featuredImage: p.featuredImage })));
          setAllProjects(transformedProjects);
        }
        
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];
    console.log('Starting filter with', allProjects.length, 'projects');
    console.log('Current filters:', filters);

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(project => project.category === filters.category);
      console.log('After category filter:', filtered.length);
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(project => project.location.city === filters.location);
      console.log('After location filter:', filtered.length);
    }

    // Filter by year
    if (filters.year !== 'all') {
      filtered = filtered.filter(project => 
        project.completedAt && project.completedAt.getFullYear() === filters.year
      );
      console.log('After year filter:', filtered.length);
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
      console.log('After search filter:', filtered.length);
    }

    console.log('Final filtered projects:', filtered.length);
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
      if (project.completedAt) {
        years.add(project.completedAt.getFullYear());
      }
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
    // Combined data
    pageData,
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