'use client';

import { useState, useEffect } from 'react';

export interface ISOData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    background_gradient: string;
    certification_status: {
      is_valid: boolean;
      status_text: string;
      since_year: string;
    };
    stats: {
      certification_years: string;
      certified_projects: string;
      average_satisfaction: string;
    };
    certificate_details: {
      certifying_body: string;
      certificate_number: string;
      issue_date: string;
      expiry_date: string;
      verification_url: string;
      pdf_url: string;
    };
    action_buttons: Array<{
      text: string;
      type: string;
      icon: string;
      action: string;
    }>;
  };
  introduction: any;
  quality_policy: any;
  client_benefits: any;
  testimonials: any;
  process_overview: any;
  certifications_standards: any;
  quality_metrics: any;
  audit_information: any;
}

export function useISOData() {
  const [data, setData] = useState<ISOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchISOData() {
      try {
        setLoading(true);
        const response = await fetch('/json/pages/iso.json');
        if (!response.ok) {
          throw new Error('Failed to load ISO data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchISOData();
  }, []);

  return { data, loading, error };
}