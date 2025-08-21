'use client';

import { useState, useEffect } from 'react';

export interface CareersData {
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
    background: {
      image: string;
      image_fallback: string;
      overlay_opacity: number;
      overlay_color: string;
    };
    badge: {
      icon: string;
      text: string;
    };
    title: string;
    subtitle: string;
    typing_effect: {
      enabled: boolean;
      speed: number;
      cursor: boolean;
    };
    stats: Array<{
      icon: string;
      number: string;
      label: string;
      description: string;
    }>;
    cta: {
      primary: {
        text: string;
        href: string;
        scroll: boolean;
      };
      secondary: {
        text: string;
        href: string;
        scroll: boolean;
      };
    };
  };
  company_benefits: {
    title: string;
    subtitle: string;
    description: string;
    categories: Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
    }>;
    benefits: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      category: string;
      highlight?: boolean;
      details: string[];
    }>;
    cta: {
      title: string;
      description: string;
      button: {
        text: string;
        href: string;
        type: string;
      };
    };
  };
  job_opportunities: {
    title: string;
    subtitle: string;
    description: string;
    note: string;
    filters: {
      title: string;
      options: Array<{
        id: string;
        label: string;
        count: string;
      }>;
    };
    empty_state: {
      title: string;
      description: string;
      cta: {
        text: string;
        description: string;
      };
    };
  };
  culture_preview: {
    title: string;
    subtitle: string;
    description: string;
    values: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    cta: {
      text: string;
      href: string;
    };
  };
  application_process: {
    title: string;
    subtitle: string;
    steps: Array<{
      step: number;
      title: string;
      description: string;
      icon: string;
      duration: string;
    }>;
    average_time: string;
    note: string;
  };
  final_cta: {
    title: string;
    subtitle: string;
    description: string;
    primary_button: {
      text: string;
      href: string;
      description: string;
    };
    secondary_button: {
      text: string;
      href: string;
      description: string;
    };
    contact_info: {
      title: string;
      description: string;
      email: string;
      phone: string;
    };
  };
}

export function useCareersData() {
  const [data, setData] = useState<CareersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/json/pages/careers.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('Error loading careers data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load careers data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}