'use client';

import React from 'react';
import UniversalHero from '@/components/ui/universal-hero';
import { CareersData } from '@/hooks/useCareersData';

interface CareersHeroProps {
  heroData: CareersData['hero'];
}

export default function CareersHero({ heroData }: CareersHeroProps) {
  // Convert careers data to UniversalHero format
  const universalHeroProps = {
    title: heroData.title,
    subtitle: heroData.subtitle,
    description: heroData.description,
    background: heroData.background && {
      type: heroData.background.type as 'image' | 'video',
      primary_url: heroData.background.video_url || heroData.background.image,
      fallback_url: heroData.background.image || '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2359.webp',
      overlay_opacity: heroData.background.overlay_opacity || 0.6
    },
    primaryButton: heroData.primary_button && {
      text: heroData.primary_button.text,
      href: heroData.primary_button.href
    },
    secondaryButton: heroData.secondary_button && {
      text: heroData.secondary_button.text,
      href: heroData.secondary_button.href
    }
  };

  return <UniversalHero {...universalHeroProps} />;
}