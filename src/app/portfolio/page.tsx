'use client';

import React, { useState } from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import FeaturedProjects from '@/components/portfolio/FeaturedProjects';
import ProjectGrid from '@/components/portfolio/ProjectGrid';
import ProjectFilter from '@/components/portfolio/ProjectFilter';
import SmartFilters from '@/components/portfolio/SmartFilters';
import MapSection from '@/components/portfolio/MapSection';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import DataVisualization from '@/components/portfolio/DataVisualization';
import ProjectTimeline from '@/components/portfolio/ProjectTimeline';
import ProjectComparison from '@/components/portfolio/ProjectComparison';
import FavoritesShare from '@/components/portfolio/FavoritesShare';
import PresentationMode from '@/components/portfolio/PresentationMode';
import PerformanceMonitor from '@/components/portfolio/PerformanceMonitor';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { BarChart3, Calendar, Grid3x3, Map, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PortfolioPage() {
  const [activeView, setActiveView] = useState<'grid' | 'timeline' | 'map' | 'stats'>('grid');

  const viewOptions = [
    { id: 'grid', label: 'Galería', icon: <Grid3x3 className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'map', label: 'Mapa', icon: <Map className="w-4 h-4" /> },
    { id: 'stats', label: 'Estadísticas', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-background relative">
        <Header />
        <main className="relative">
          {/* Hero Section */}
          <PortfolioHero />
          
          {/* Featured Projects Section */}
          <FeaturedProjects />
          
          {/* Enhanced Filters Section */}
          <section className="py-8 px-4 border-b">
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Smart Filters on the left */}
                <div className="lg:w-2/3">
                  <SmartFilters />
                </div>
                
                {/* View Mode Selector on the right */}
                <div className="lg:w-1/3">
                  <div className="bg-card border rounded-xl p-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Modo de Vista
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {viewOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setActiveView(option.id as any)}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            activeView === option.id
                              ? "bg-accent text-white shadow-lg"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Original Filter Bar */}
              <div className="mt-6">
                <ProjectFilter />
              </div>
            </div>
          </section>
          
          {/* Dynamic Content Based on View */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {activeView === 'grid' && (
                <div className="space-y-8">
                  <ProjectGrid />
                </div>
              )}
              
              {activeView === 'timeline' && (
                <div className="space-y-8">
                  <ProjectTimeline />
                </div>
              )}
              
              {activeView === 'map' && (
                <div className="space-y-8">
                  <MapSection />
                </div>
              )}
              
              {activeView === 'stats' && (
                <div className="space-y-8">
                  <DataVisualization />
                </div>
              )}
            </div>
          </section>
          
          {/* Call to Action */}
          <PortfolioCTA />
        </main>
        
        <Footer />
        
        {/* Advanced Features - Floating Components */}
        <ProjectComparison />
        <FavoritesShare />
        <PresentationMode />
        
        {/* Performance monitoring for development */}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </div>
    </PortfolioProvider>
  );
}