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
import FloatingButtons from '@/components/portfolio/FloatingButtons';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { BarChart3, Calendar, Grid3x3, Map, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PortfolioPage() {
  const [activeView, setActiveView] = useState<'grid' | 'timeline' | 'map' | 'stats'>('grid');
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);

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

          {/* Dynamic Content Based on View */}
          <section className="pt-4 pb-16">
            <div className="container mx-auto px-4">
              {activeView === 'grid' && (
                <div className="space-y-3">
                  <ProjectFilter 
                    viewOptions={viewOptions}
                    activeView={activeView}
                    onViewChange={setActiveView}
                  />
                  <ProjectGrid />
                </div>
              )}
              
              {activeView === 'timeline' && (
                <div className="space-y-3">
                  <ProjectFilter 
                    viewOptions={viewOptions}
                    activeView={activeView}
                    onViewChange={setActiveView}
                  />
                  <ProjectTimeline />
                </div>
              )}
              
              {activeView === 'map' && (
                <div className="space-y-3">
                  <ProjectFilter 
                    viewOptions={viewOptions}
                    activeView={activeView}
                    onViewChange={setActiveView}
                  />
                  <MapSection />
                </div>
              )}
              
              {activeView === 'stats' && (
                <div className="space-y-3">
                  <ProjectFilter 
                    viewOptions={viewOptions}
                    activeView={activeView}
                    onViewChange={setActiveView}
                  />
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
        <ProjectComparison 
          isOpen={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
        />
        <FavoritesShare />
        <PresentationMode 
          isPresenting={isPresentationOpen}
          onExitPresentation={() => setIsPresentationOpen(false)}
        />
        
        {/* Floating Buttons Container */}
        <FloatingButtons 
          onCompareClick={() => setIsComparisonOpen(!isComparisonOpen)}
          onPresentationClick={() => setIsPresentationOpen(true)}
          selectedProjects={selectedProjects}
        />
        
        {/* Performance monitoring for development */}
      </div>
    </PortfolioProvider>
  );
}