'use client';

import { useState, useEffect } from 'react';

export interface JobLocation {
  city: string;
  region: string;
  country: string;
  remote: boolean;
  hybrid: boolean;
  address: string;
}

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  category: string;
  department: string;
  location: JobLocation;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'junior' | 'mid' | 'senior' | 'director';
  status: 'active' | 'inactive' | 'closed';
  experience_years: number;
  featured: boolean;
  urgent: boolean;
  posted_date: string;
  deadline: string;
  short_description: string;
  full_description: string;
  key_responsibilities: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  benefits: string[];
  application_process: {
    steps: string[];
    contact_email: string;
    required_documents: string[];
  };
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailed_description: string;
  icon: string;
  color: string;
  open_positions: number;
  total_employees: number;
  featured: boolean;
  required_skills: string[];
  career_path: {
    entry_level: string;
    mid_level: string;
    senior_level: string;
    leadership: string;
  };
  typical_projects: string[];
  positions: string[];
}

export interface DynamicCareersContent {
  page_info: {
    title: string;
    description: string;
    hero: {
      title: string;
      subtitle: string;
      background_image: string;
      cta_text: string;
      stats: {
        total_positions: number;
        departments: number;
        average_growth: string;
        team_size: string;
      };
    };
  };
  departments: Department[];
  job_postings: JobPosting[];
}

export const useDynamicCareersContent = () => {
  const [data, setData] = useState<DynamicCareersContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/json/dynamic-content/careers/content.json');
        if (!response.ok) {
          throw new Error(`Failed to load careers content: ${response.status}`);
        }
        
        const contentData = await response.json();
        setData(contentData);
      } catch (err) {
        console.error('Error loading dynamic careers content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return { data, loading, error };
};