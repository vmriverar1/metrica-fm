'use client';

import React from 'react';
import UniversalHero from '@/components/ui/universal-hero';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function PortfolioHero() {
  const { pageData, allProjects, isLoading, error } = usePortfolio();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando portafolio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !pageData) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-red-600">Error cargando datos del portafolio</p>
        </div>
      </div>
    );
  }

  // Convert portfolio data to UniversalHero format using Firestore structure
  const universalHeroProps = {
    title: pageData.hero.title,
    subtitle: pageData.hero.subtitle,
    description: pageData.hero.description,
    backgroundImage: pageData.hero.background_image || pageData.hero.background_image_fallback,
    primaryButton: pageData.hero.primary_button && {
      text: pageData.hero.primary_button.text,
      href: pageData.hero.primary_button.href
    },
    secondaryButton: pageData.hero.secondary_button && {
      text: pageData.hero.secondary_button.text,
      href: pageData.hero.secondary_button.href
    },
    metadata: {
      stats: [
        pageData.hero.total_investment && `${pageData.hero.total_investment} Inversión Total`,
        pageData.hero.total_area && `${pageData.hero.total_area} Área Total`
      ].filter(Boolean)
    }
  };

  return <UniversalHero {...universalHeroProps} />;
}