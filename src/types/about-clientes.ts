export interface ClientesPageData {
  page: {
    title: string;
    subtitle: string;
    hero_image: string;
    hero_image_fallback: string;
    description: string;
    url: string;
  };
  introduction: {
    title: string;
    text: string;
    highlight: string;
  };
  public_sector: {
    title: string;
    subtitle: string;
    clients: PublicClient[];
  };
  private_sector: {
    title: string;
    subtitle: string;
    categories: PrivateCategory[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    reviews: Testimonial[];
  };
  statistics: {
    title: string;
    metrics: Metric[];
  };
  call_to_action: {
    title: string;
    subtitle: string;
    description: string;
    primary_cta: CTAButton;
    secondary_cta: CTAButton;
    benefits: string[];
  };
}

export interface PublicClient {
  id: string;
  name: string;
  full_name: string;
  acronym: string;
  sector: string;
  description: string;
  logo: string;
  logo_fallback: string;
  color: string;
  projects_count: number;
  project_types: string[];
  notable_projects: string[];
}

export interface PrivateCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  client_types: string[];
  projects_completed: number;
  sectors_served: string[];
  key_services: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  sector: string;
  project: string;
  rating: number;
  date: string;
  avatar: string;
}

export interface Metric {
  number: string;
  label: string;
  description: string;
  icon: string;
}

export interface CTAButton {
  text: string;
  url: string;
  type: 'primary' | 'secondary';
}