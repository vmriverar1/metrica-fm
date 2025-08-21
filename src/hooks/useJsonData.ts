'use client';

import { useState, useEffect } from 'react';

export function useJsonData<T>(jsonPath: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJsonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar el JSON desde la ruta pública
        const response = await fetch(jsonPath);
        if (!response.ok) {
          throw new Error(`Error loading JSON: ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading JSON data');
        console.error('Error loading JSON:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJsonData();
  }, [jsonPath]);

  return { data, loading, error };
}

// Hook específico para la página de historia
export function useHistoriaData() {
  return useJsonData<{
    page: {
      title: string;
      subtitle: string;
      hero_image: string;
      hero_image_fallback: string;
      hero_video: string;
      hero_video_fallback: string;
      description: string;
      url: string;
    };
    introduction: {
      text: string;
      highlight: string;
      mission_statement: string;
    };
    timeline_events: Array<{
      id: string;
      year: number;
      title: string;
      subtitle: string;
      description: string;
      image: string;
      image_fallback?: string;
      achievements: string[];
      impact: string;
      metrics: {
        team_size: number;
        projects: number;
        investment: string;
      };
    }>;
    achievement_summary: {
      title: string;
      metrics: Array<{
        number: string;
        label: string;
        description: string;
      }>;
    };
    company_evolution: {
      title: string;
      phases: Array<{
        phase: string;
        period: string;
        focus: string;
        achievement: string;
      }>;
    };
  }>('/json/pages/about-historia.json');
}