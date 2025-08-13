'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, TrendingUp, Award, MapPin, Calendar, DollarSign, X } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, ProjectCategory } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface SmartFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  filter: (projects: Project[]) => Project[];
  color: string;
}

const smartFilters: SmartFilter[] = [
  {
    id: 'featured',
    label: 'Destacados',
    icon: <Award className="w-4 h-4" />,
    description: 'Proyectos premiados y reconocidos',
    filter: (projects) => projects.filter(p => p.featured),
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'recent',
    label: 'Más Recientes',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Proyectos de los últimos 2 años',
    filter: (projects) => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return projects.filter(p => p.completedAt >= twoYearsAgo)
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    },
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'large',
    label: 'Gran Escala',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Proyectos de más de 10,000 m²',
    filter: (projects) => projects.filter(p => {
      const area = parseInt(p.details.area.replace(/[^0-9]/g, ''));
      return area >= 10000;
    }),
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'sustainable',
    label: 'Sostenibles',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Proyectos con certificación LEED o sostenibles',
    filter: (projects) => projects.filter(p => 
      p.tags.includes('sostenible') || 
      p.details.certifications?.some(c => c.includes('LEED'))
    ),
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'capital',
    label: 'Lima Metropolitana',
    icon: <MapPin className="w-4 h-4" />,
    description: 'Proyectos en Lima y Callao',
    filter: (projects) => projects.filter(p => 
      p.location.city === 'Lima' || p.location.city === 'Callao'
    ),
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Inversiones superiores a $10M USD',
    filter: (projects) => projects.filter(p => {
      if (!p.details.investment) return false;
      const investment = parseInt(p.details.investment.replace(/[^0-9]/g, ''));
      return investment >= 10;
    }),
    color: 'from-amber-500 to-yellow-500'
  }
];

interface SearchSuggestion {
  type: 'category' | 'location' | 'tag' | 'project';
  value: string;
  label: string;
  count?: number;
}

interface SmartFiltersProps {
  showOnlyButtons?: boolean;
}

export default function SmartFilters({ showOnlyButtons = false }: SmartFiltersProps = {}) {
  const { allProjects, filteredProjects, filters, setFilters, searchProjects } = usePortfolio();
  const [activeSmartFilters, setActiveSmartFilters] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showAI, setShowAI] = useState(false);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Category suggestions
    Object.values(ProjectCategory).forEach(category => {
      if (category.toLowerCase().includes(term)) {
        const count = allProjects.filter(p => p.category === category).length;
        newSuggestions.push({
          type: 'category',
          value: category,
          label: `Categoría: ${category}`,
          count
        });
      }
    });

    // Location suggestions
    const locations = new Set(allProjects.map(p => p.location.city));
    locations.forEach(location => {
      if (location.toLowerCase().includes(term)) {
        const count = allProjects.filter(p => p.location.city === location).length;
        newSuggestions.push({
          type: 'location',
          value: location,
          label: `Ciudad: ${location}`,
          count
        });
      }
    });

    // Tag suggestions
    const tags = new Set(allProjects.flatMap(p => p.tags));
    tags.forEach(tag => {
      if (tag.toLowerCase().includes(term)) {
        const count = allProjects.filter(p => p.tags.includes(tag)).length;
        newSuggestions.push({
          type: 'tag',
          value: tag,
          label: `Tag: ${tag}`,
          count
        });
      }
    });

    // Project suggestions
    allProjects.forEach(project => {
      if (project.title.toLowerCase().includes(term)) {
        newSuggestions.push({
          type: 'project',
          value: project.slug,
          label: project.title
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, 8));
  }, [searchTerm, allProjects]);

  // Apply smart filters
  useEffect(() => {
    if (activeSmartFilters.length === 0) return;

    let filtered = [...allProjects];
    activeSmartFilters.forEach(filterId => {
      const smartFilter = smartFilters.find(f => f.id === filterId);
      if (smartFilter) {
        filtered = smartFilter.filter(filtered);
      }
    });

    // This would need integration with the PortfolioContext
    // For now, we'll just log the results
    console.log('Smart filtered projects:', filtered);
  }, [activeSmartFilters, allProjects]);

  const toggleSmartFilter = (filterId: string) => {
    setActiveSmartFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'category':
        setFilters({ ...filters, category: suggestion.value as ProjectCategory });
        break;
      case 'location':
        setFilters({ ...filters, location: suggestion.value });
        break;
      case 'tag':
        searchProjects(suggestion.value);
        break;
      case 'project':
        // Navigate to project
        if (typeof window !== 'undefined') {
          window.location.href = `/portfolio/${suggestion.value}`;
        }
        break;
    }
    setSearchTerm('');
    setSuggestions([]);
  };

  const getAIRecommendations = () => {
    // Simulate AI recommendations based on user behavior
    const recommendations = [
      'Proyectos similares a Torre Empresarial San Isidro',
      'Proyectos con certificación LEED en Lima',
      'Centros comerciales completados en 2023',
      'Proyectos de oficinas con más de 15,000 m²'
    ];
    return recommendations;
  };

  // Si solo queremos mostrar botones, devolver solo eso
  if (showOnlyButtons) {
    return (
      <>
        {smartFilters.map(filter => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSmartFilter(filter.id)}
            className={cn(
              "relative overflow-hidden rounded-full px-4 py-2 transition-all",
              activeSmartFilters.includes(filter.id)
                ? "text-white shadow-lg"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {activeSmartFilters.includes(filter.id) && (
              <div 
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  filter.color
                )} 
              />
            )}
            <div className="relative flex items-center gap-2">
              {filter.icon}
              <span className="text-sm font-medium">{filter.label}</span>
            </div>
          </motion.button>
        ))}
      </>
    );
  }

  // Componente completo normal
  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className={cn(
          "relative rounded-xl border-2 transition-all",
          searchFocused 
            ? "border-accent shadow-lg shadow-accent/20" 
            : "border-border"
        )}>
          <div className="flex items-center gap-3 p-4">
            <Search className={cn(
              "w-5 h-5 transition-colors",
              searchFocused ? "text-accent" : "text-muted-foreground"
            )} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Buscar proyectos, categorías, ubicaciones..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setShowAI(!showAI)}
              className={cn(
                "p-2 rounded-lg transition-all",
                showAI 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                  : "bg-muted hover:bg-accent hover:text-white"
              )}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Search Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-xl z-50 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-sm font-medium">{suggestion.label}</span>
                      {suggestion.count && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({suggestion.count})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-accent">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Smart Filter Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            Filtros Inteligentes
          </h3>
          {activeSmartFilters.length > 0 && (
            <button
              onClick={() => setActiveSmartFilters([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {smartFilters.map(filter => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSmartFilter(filter.id)}
              className={cn(
                "relative overflow-hidden rounded-full px-4 py-2 transition-all",
                activeSmartFilters.includes(filter.id)
                  ? "text-white shadow-lg"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {activeSmartFilters.includes(filter.id) && (
                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    filter.color
                  )} 
                />
              )}
              <div className="relative flex items-center gap-2">
                {filter.icon}
                <span className="text-sm font-medium">{filter.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Recomendaciones IA
                </h4>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {getAIRecommendations().map((rec, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors text-sm"
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeSmartFilters.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-accent">
            {activeSmartFilters.length} filtro(s) inteligente(s) activo(s)
          </span>
        </div>
      )}
    </div>
  );
}