'use client';

import React from 'react';
import { Search, Briefcase, MapPin, Users } from 'lucide-react';
import { CareersData } from '@/hooks/useCareersData';
import { useDynamicCareersContent } from '@/hooks/useDynamicCareersContent';
import { cn } from '@/lib/utils';

interface CareerFiltersProps {
  jobOpportunitiesData: CareersData['job_opportunities'];
  className?: string;
}

export default function CareerFilters({ jobOpportunitiesData, className }: CareerFiltersProps) {
  const { data: dynamicContent } = useDynamicCareersContent();

  // Provide fallback values if data is undefined
  const title = jobOpportunitiesData?.title || '';
  const subtitle = jobOpportunitiesData?.subtitle || '';

  // Calculate stats from dynamic data (live count instead of static JSON values)
  const jobs = dynamicContent?.job_postings || [];
  const stats = {
    total_positions: jobs.length,
    departments: new Set(jobs.map(job => job.department)).size,
    locations: new Set(jobs.map(job => job.location?.city).filter(Boolean)).size,
    remote_positions: jobs.filter(job => job.location?.remote || job.location?.hybrid).length
  };

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.total_positions}
              </div>
              <div className="text-sm text-muted-foreground">
                Posiciones Abiertas
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.departments}
              </div>
              <div className="text-sm text-muted-foreground">
                Departamentos
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.locations}
              </div>
              <div className="text-sm text-muted-foreground">
                Ubicaciones
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.remote_positions}
              </div>
              <div className="text-sm text-muted-foreground">
                Trabajo Flexible
              </div>
            </div>
          </div>
        </div>

        {/* Search Info */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {jobOpportunitiesData.description}
          </p>
        </div>
      </div>
    </section>
  );
}