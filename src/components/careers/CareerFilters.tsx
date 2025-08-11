'use client';

import React, { useState, useCallback } from 'react';
import { Search, Briefcase, MapPin, DollarSign, Clock, Building2, Star, Users, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  JobCategory, 
  JobType,
  getJobCategoryLabel,
  getJobTypeLabel
} from '@/types/careers';
import { useCareers } from '@/contexts/CareersContext';
import { cn } from '@/lib/utils';

interface CareerFiltersProps {
  className?: string;
}

export default function CareerFilters({ className }: CareerFiltersProps) {
  const { 
    filters, 
    setFilters, 
    jobCount, 
    uniqueLocations,
    uniqueDepartments,
    uniqueSkills
  } = useCareers();
  
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills || []);
  const [salaryRange, setSalaryRange] = useState<number[]>(
    filters.salaryRange ? [filters.salaryRange[0], filters.salaryRange[1]] : [0, 20000]
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCategoryChange = useCallback((category: JobCategory | 'all') => {
    setFilters({
      ...filters,
      category: category === 'all' ? undefined : category
    });
  }, [filters, setFilters]);

  const handleLocationChange = useCallback((location: string) => {
    setFilters({
      ...filters,
      location: location === 'all' ? undefined : location
    });
  }, [filters, setFilters]);

  const handleTypeChange = useCallback((type: JobType | 'all') => {
    setFilters({
      ...filters,
      type: type === 'all' ? undefined : type
    });
  }, [filters, setFilters]);

  const handleDepartmentChange = useCallback((department: string | undefined) => {
    setFilters({
      ...filters,
      department: department === 'all' ? undefined : department
    });
  }, [filters, setFilters]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        searchQuery: term
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, setFilters]);

  const handleSkillToggle = useCallback((skill: string) => {
    const newSelectedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSelectedSkills);
    setFilters({
      ...filters,
      skills: newSelectedSkills
    });
  }, [selectedSkills, filters, setFilters]);

  const handleSalaryChange = useCallback((newRange: number[]) => {
    setSalaryRange(newRange);
    setFilters({
      ...filters,
      salaryRange: [newRange[0], newRange[1]]
    });
  }, [filters, setFilters]);

  const toggleFeatured = useCallback(() => {
    setFilters({
      ...filters,
      featured: filters.featured ? undefined : true
    });
  }, [filters, setFilters]);

  const toggleRemote = useCallback(() => {
    setFilters({
      ...filters,
      remote: filters.remote ? undefined : true
    });
  }, [filters, setFilters]);

  const toggleUrgent = useCallback(() => {
    setFilters({
      ...filters,
      urgent: filters.urgent ? undefined : true
    });
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSalaryRange([0, 20000]);
    setFilters({
      searchQuery: ''
    });
  }, [setFilters]);

  const hasActiveFilters = !!(filters.category ||
                          filters.location ||
                          filters.type ||
                          filters.department ||
                          filters.featured ||
                          filters.remote ||
                          filters.urgent ||
                          (filters.skills && filters.skills.length > 0) ||
                          filters.searchQuery ||
                          (filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 20000)));

  return (
    <div className={cn("bg-background/95 backdrop-blur-sm border-b border-border sticky top-20 z-40", className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Explorar Oportunidades</h2>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Filtros Avanzados
                {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>

          {/* Basic Filters - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleCategoryChange(value as JobCategory | 'all')}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <SelectValue placeholder="Área" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {Object.values(JobCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {getJobCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select 
              value={filters.location || 'all'} 
              onValueChange={(value) => handleLocationChange(value)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <SelectValue placeholder="Ubicación" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvanced && (
            <div className="space-y-6 animate-in slide-in-from-top-5 duration-300">
              {/* Advanced Selects */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Job Type Filter */}
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value) => handleTypeChange(value as JobType | 'all')}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <SelectValue placeholder="Tipo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.values(JobType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getJobTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Department Filter */}
                <Select 
                  value={filters.department || 'all'} 
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <SelectValue placeholder="Departamento" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Featured Toggle */}
                <Button
                  variant={filters.featured ? "default" : "outline"}
                  onClick={toggleFeatured}
                  className="justify-start"
                >
                  <Star className={cn(
                    "w-4 h-4 mr-2",
                    filters.featured ? "fill-current" : ""
                  )} />
                  Destacados
                </Button>

                {/* Remote Toggle */}
                <Button
                  variant={filters.remote ? "default" : "outline"}
                  onClick={toggleRemote}
                  className="justify-start"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Remoto
                </Button>
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Rango salarial: S/ {salaryRange[0].toLocaleString('es-PE')} - S/ {salaryRange[1].toLocaleString('es-PE')}
                  </span>
                </div>
                <Slider
                  value={salaryRange}
                  onValueChange={handleSalaryChange}
                  max={20000}
                  min={0}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>S/ 0</span>
                  <span>S/ 20.000+</span>
                </div>
              </div>

              {/* Skills Section */}
              {uniqueSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Habilidades:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.slice(0, 15).map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                    {uniqueSkills.length > 15 && (
                      <Badge variant="secondary" className="cursor-default">
                        +{uniqueSkills.length - 15} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {getJobCategoryLabel(filters.category)}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.location && (
                <Badge variant="secondary" className="gap-1">
                  {filters.location}
                  <button
                    onClick={() => handleLocationChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.type && (
                <Badge variant="secondary" className="gap-1">
                  {getJobTypeLabel(filters.type)}
                  <button
                    onClick={() => handleTypeChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.department && (
                <Badge variant="secondary" className="gap-1">
                  {filters.department}
                  <button
                    onClick={() => handleDepartmentChange('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.featured && (
                <Badge variant="secondary" className="gap-1">
                  Destacados
                  <button
                    onClick={toggleFeatured}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.remote && (
                <Badge variant="secondary" className="gap-1">
                  Remoto
                  <button
                    onClick={toggleRemote}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.urgent && (
                <Badge variant="secondary" className="gap-1">
                  Urgente
                  <button
                    onClick={toggleUrgent}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}