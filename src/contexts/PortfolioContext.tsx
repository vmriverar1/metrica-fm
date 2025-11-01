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

        // Try to fetch from Firestore first, then fallback to JSON
        try {
          console.log('🔥 Fetching portfolio data from Firestore...');

          // Fetch from Firestore using our unified API
          const [pageResponse, projectsResponse] = await Promise.all([
            fetch('/api/admin/pages/portfolio', { cache: 'no-store' }), // Load page data from Firestore
            fetch('/api/portfolio/projects', { cache: 'no-store' }) // Use Firestore API
          ]);

          let pageJson;
          let firestoreProjects: any[] = [];

          // Handle page data (from Firestore)
          if (pageResponse.ok) {
            const pageApiResponse = await pageResponse.json();
            if (pageApiResponse.success && pageApiResponse.data) {
              pageJson = pageApiResponse.data;
              // Transform Firestore structure to match expected format
              const transformedPageData = {
                ...pageJson.content,
                seo: pageJson.content.seo,
                source: pageJson.source
              };
              setPageData(transformedPageData);
            }
          }

          // Handle projects data (from Firestore)
          if (projectsResponse.ok) {
            const firestoreData = await projectsResponse.json();
            if (firestoreData.success && firestoreData.data) {
              firestoreProjects = firestoreData.data;
              console.log('✅ Found', firestoreProjects.length, 'projects in Firestore');
            }
          }

          // If we have Firestore data, transform it to match our Project type
          if (firestoreProjects.length > 0) {
            // Mapeo de categorías de Firestore a enum ProjectCategory
            const categoryMapping: Record<string, ProjectCategory> = {
              'EDUCACIÓN': ProjectCategory.EDUCACION,
              'HOTELERÍA': ProjectCategory.HOTELERIA,
              'INDUSTRIA': ProjectCategory.INDUSTRIA,
              'OFICINAS': ProjectCategory.OFICINA,
              'RETAIL': ProjectCategory.RETAIL,
              'VIVIENDA': ProjectCategory.VIVIENDA,
              'SALUD': ProjectCategory.SALUD,
              // También mapear las versiones en minúscula por si acaso
              'educacion': ProjectCategory.EDUCACION,
              'hoteleria': ProjectCategory.HOTELERIA,
              'industria': ProjectCategory.INDUSTRIA,
              'oficina': ProjectCategory.OFICINA,
              'retail': ProjectCategory.RETAIL,
              'vivienda': ProjectCategory.VIVIENDA,
              'salud': ProjectCategory.SALUD
            };

            const transformedProjects = firestoreProjects.map((project: any) => {
              // Debug logging para fechas (solo usamos start_date ahora)
              console.log('📅 [PortfolioContext] Transformando proyecto:', project.id);
              console.log('📅 [PortfolioContext] hide_dates:', project.hide_dates);
              console.log('📅 [PortfolioContext] start_date (ÚNICA USADA):', project.start_date);
              console.log('📅 [PortfolioContext] year (fallback):', project.year);

              return {
              id: project.id,
              title: project.title,
              category: categoryMapping[project.category] || categoryMapping[project.category_id] || project.category as ProjectCategory,
              description: project.description || project.short_description,
              location: {
                city: project.location?.city || project.location || '',
                region: project.location?.state || project.location?.country || '',
                coordinates: [0, 0] as [number, number]
              },
              // Si hide_dates está activo, no asignar fecha aunque exista year legacy
              // Usar solo start_date (fecha de inicio)
              completedAt: project.hide_dates
                ? null
                : project.start_date
                  ? new Date(project.start_date)
                  : project.year
                    ? new Date(project.year + '-01-01')
                    : null,
              status: project.status || 'completed',
              featuredImage: project.image || project.featured_image || '',
              thumbnailImage: project.image || project.featured_image || '',
              shortDescription: project.short_description || project.description,
              gallery: (project.gallery || []).map((imgUrl: string, index: number) => {
                const totalImages = project.gallery?.length || 1;
                let stage: 'inicio' | 'proceso' | 'final';

                // Distribución más equitativa de imágenes en las 3 etapas
                if (totalImages <= 3) {
                  // Si hay 3 o menos imágenes, una por etapa
                  stage = index === 0 ? 'inicio' : index === 1 ? 'proceso' : 'final';
                } else {
                  // Para más de 3 imágenes, distribuir más equitativamente
                  const tercio = Math.ceil(totalImages / 3);
                  if (index < tercio) {
                    stage = 'inicio';
                  } else if (index < tercio * 2) {
                    stage = 'proceso';
                  } else {
                    stage = 'final';
                  }
                }

                return {
                  id: `${project.id}-img-${index}`,
                  url: imgUrl,
                  thumbnail: imgUrl,
                  caption: '',
                  stage: stage,
                  order: index
                };
              }),
              details: {
                client: project.client || '',
                duration: project.duration || '',
                investment: project.budget?.amount || project.investment || '',
                team: project.team || [],
                area: project.area || ''
              },
              tags: project.tags || [],
              featured: project.featured || false,
              slug: project.slug || project.id
            };
            });

            setAllProjects(transformedProjects);
            console.log('✅ Transformed', transformedProjects.length, 'projects from Firestore');

            // Debug: Log the hotel project specifically
            const hotelProject = transformedProjects.find(p => p.id === 'hotel-hilton-bajada-balta');
            console.log('🏨 Hotel Hilton project:', hotelProject ? {
              id: hotelProject.id,
              slug: hotelProject.slug,
              category: hotelProject.category,
              title: hotelProject.title
            } : 'NOT FOUND');

            return; // Exit early if Firestore data was successful
          }

        } catch (firestoreError) {
          console.warn('⚠️ Firestore fetch failed, falling back to JSON:', firestoreError);
        }

        // Fallback to API endpoints if direct Firestore fails
        console.log('📄 Falling back to API endpoints...');
        const [pageResponse, projectsResponse] = await Promise.all([
          fetch('/api/admin/pages/portfolio', { cache: 'no-store' }),
          fetch('/api/portfolio/projects', { cache: 'no-store' })
        ]);

        if (!pageResponse.ok) {
          throw new Error(`Failed to fetch page data: ${pageResponse.status}`);
        }

        if (!projectsResponse.ok) {
          throw new Error(`Failed to fetch projects data: ${projectsResponse.status}`);
        }

        const [pageApiResponse, projectsApiResponse] = await Promise.all([
          pageResponse.json(),
          projectsResponse.json()
        ]);

        // Handle page data from API
        if (pageApiResponse.success && pageApiResponse.data) {
          // Transform Firestore structure to match expected format
          const transformedPageData = {
            ...pageApiResponse.data.content,
            seo: pageApiResponse.data.content.seo,
            source: pageApiResponse.data.source
          };
          setPageData(transformedPageData);
        }

        // Handle projects data from API
        let projectsJson = [];
        if (projectsApiResponse.success && projectsApiResponse.data) {
          projectsJson = projectsApiResponse.data;
        }

        // Extract and transform projects from the categories structure
        if (projectsJson.categories && Array.isArray(projectsJson.categories)) {
          const allProjects: any[] = [];

          // Flatten projects from all categories
          projectsJson.categories.forEach((category: any) => {
            if (category.projects && Array.isArray(category.projects)) {
              allProjects.push(...category.projects);
            }
          });

          console.log('Raw projects from JSON categories:', allProjects.length);
          const transformedProjects = allProjects.map((project: any) => ({
            id: project.id,
            title: project.name,
            category: project.category as ProjectCategory,
            description: project.description,
            location: {
              city: project.location || '',
              region: project.region || '',
              coordinates: [0, 0] as [number, number]
            },
            // Si hide_dates está activo, no asignar fecha aunque exista year legacy
            // Usar solo start_date (fecha de inicio)
            completedAt: project.hide_dates
              ? null
              : project.start_date
                ? new Date(project.start_date)
                : project.year
                  ? new Date(project.year + '-01-01')
                  : null,
            status: project.status,
            featuredImage: project.images?.[0]?.url || '',
            thumbnailImage: project.images?.[0]?.url || '',
            shortDescription: project.description,
            gallery: (project.gallery || []).map((imgUrl: string, index: number) => ({
              id: `${project.id}-img-${index}`,
              url: imgUrl,
              thumbnail: imgUrl,
              caption: '',
              stage: index === 0 ? 'inicio' : index < (project.gallery?.length || 1) / 2 ? 'proceso' : 'final' as 'inicio' | 'proceso' | 'final',
              order: index
            })),
            details: {
              client: project.client || '',
              duration: project.duration || '',
              investment: project.budget || '',
              team: project.services || [],
              area: project.area || ''
            },
            tags: project.services || [],
            featured: project.featured || false,
            slug: project.id
          }));
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
      filtered = filtered.filter(project => 
        project.completedAt && project.completedAt.getFullYear() === filters.year
      );
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
    console.log('🔍 useProject Debug:', {
      searchingForSlug: slug,
      totalProjects: allProjects.length,
      projectSlugs: allProjects.map(p => p.slug).slice(0, 5), // First 5 slugs
      foundProject: allProjects.find(project => project.slug === slug)?.title || null
    });
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