'use client';

import { useState, useEffect } from 'react';

export interface CulturaData {
  page: {
    title: string;
    description: string;
    keywords: string[];
    url: string;
    openGraph: {
      title: string;
      description: string;
      type: string;
      locale: string;
      siteName: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback: string;
    team_gallery: {
      columns: string[][];
    };
  };
  values: {
    section: {
      title: string;
      subtitle: string;
    };
    values_list: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      color: string;
      size: string;
      images: string[];
      image_descriptions: string[];
    }>;
  };
  culture_stats: {
    section: {
      title: string;
      subtitle: string;
    };
    categories: {
      [key: string]: {
        title: string;
        icon: string;
        color: string;
        stats: Array<{
          label: string;
          value: string;
          description: string;
        }>;
      };
    };
  };
  team: {
    section: {
      title: string;
      subtitle: string;
    };
    members: Array<{
      id: number;
      name: string;
      role: string;
      description: string;
      image: string;
      image_fallback: string;
    }>;
    moments: {
      title: string;
      subtitle: string;
      gallery: Array<{
        id: number;
        title: string;
        description: string;
        image: string;
        image_fallback: string;
      }>;
    };
  };
  technologies: {
    section: {
      title: string;
      subtitle: string;
    };
    tech_list: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      color: string;
      description: string;
      features: string[];
      image: string;
      image_fallback: string;
      case_study: {
        project: string;
        result: string;
        savings: string;
      };
    }>;
  };
}

export function useCulturaData() {
  const [data, setData] = useState<CulturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/json/pages/cultura.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('Error loading cultura data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cultura data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}