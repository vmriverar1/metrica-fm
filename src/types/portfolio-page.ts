// Types for the combined portfolio page data
export interface PortfolioPageData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    background_image: string;
    background_image_fallback: string;
    stats: {
      projects: {
        value: number;
        label: string;
        description: string;
        icon: string;
      };
      experience: {
        value: number;
        label: string;
        description: string;
        icon: string;
      };
      categories: {
        value: number;
        label: string;
        description: string;
        icon: string;
      };
      cities: {
        value: number;
        label: string;
        description: string;
        icon: string;
      };
    };
    total_investment: string;
    total_area: string;
  };
  introduction: {
    title: string;
    description: string;
    key_strengths: KeyStrength[];
  };
  featured_projects: {
    title: string;
    subtitle: string;
    description: string;
    projects: FeaturedProject[];
  };
  categories_overview: {
    title: string;
    subtitle: string;
    description: string;
    dynamic_content_source: string;
    categories_preview: CategoryPreview[];
  };
  portfolio_views: {
    title: string;
    subtitle: string;
    description: string;
    views: PortfolioView[];
  };
  interactive_features: {
    title: string;
    subtitle: string;
    features: InteractiveFeature[];
  };
  geographic_presence: {
    title: string;
    subtitle: string;
    description: string;
    locations: GeographicLocation[];
    total_coverage: {
      regions: number;
      cities: number;
      total_projects: number;
      total_investment: string;
    };
  };
  investment_analysis: {
    title: string;
    subtitle: string;
    description: string;
    investment_by_sector: InvestmentBySector[];
    investment_by_year: InvestmentByYear[];
  };
  project_methodology: {
    title: string;
    subtitle: string;
    description: string;
    phases: MethodologyPhase[];
  };
  success_metrics: {
    title: string;
    subtitle: string;
    description: string;
    metrics: SuccessMetric[];
  };
  innovation_highlights: {
    title: string;
    subtitle: string;
    description: string;
    innovations: Innovation[];
  };
  call_to_action: {
    title: string;
    subtitle: string;
    description: string;
    primary_button: CTAButton;
    secondary_button: CTAButton;
    contact_info: {
      phone: string;
      email: string;
      office: string;
    };
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
    canonical: string;
    og_image: string;
    structured_data: any;
  };
}

export interface KeyStrength {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface FeaturedProject {
  id: string;
  title: string;
  category: string;
  location: string;
  investment: string;
  area: string;
  year: string;
  featured_image: string;
  description: string;
  highlights: string[];
  status: string;
}

export interface CategoryPreview {
  id: string;
  name: string;
  description: string;
  project_count: number;
  total_investment: string;
  icon: string;
  color: string;
  featured: boolean;
}

export interface PortfolioView {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export interface InteractiveFeature {
  name: string;
  description: string;
  icon: string;
  benefits: string[];
}

export interface GeographicLocation {
  city: string;
  region: string;
  projects: number;
  investment: string;
  sectors: string[];
  highlight: string;
}

export interface InvestmentBySector {
  sector: string;
  amount: string;
  percentage: number;
  projects: number;
  average_per_project: string;
}

export interface InvestmentByYear {
  year: string | number;
  amount: string;
  projects: number;
  highlight: string;
}

export interface MethodologyPhase {
  phase: number;
  name: string;
  description: string;
  duration: string;
  key_activities: string[];
  deliverables: string[];
}

export interface SuccessMetric {
  category: string;
  value: string;
  description: string;
  trend: string;
  benchmark: string;
}

export interface Innovation {
  technology: string;
  description: string;
  projects_applied: number;
  impact: string;
  icon: string;
}

export interface CTAButton {
  text: string;
  href: string;
  icon: string;
}