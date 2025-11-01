export interface ServicesPageData {
  page: {
    title: string;
    description: string;
    url: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    stats: string[];
    buttons: {
      primary: {
        text: string;
        href: string;
      };
      secondary: {
        text: string;
        href: string;
      };
    };
  };
  services: {
    title: string;
    subtitle: string;
    list: Array<{
      id: string;
      title: string;
      category: string;
      icon: string;
      description: string;
      benefits: string[];
      case_study_link?: string;
      color: string;
    }>;
  };
  sectors: {
    title: string;
    subtitle: string;
    list: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
      projects_count: number;
      recent_projects: Array<{
        name: string;
        year: number;
        location: string;
      }>;
      color: string;
    }>;
  };
  methodology: {
    title: string;
    subtitle: string;
    phases: Array<{
      number: number;
      title: string;
      description: string;
      icon: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  contact_form: {
    title: string;
    subtitle: string;
    description: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      placeholder: string;
      required: boolean;
      options?: string[];
    }>;
    submit_button: {
      text: string;
      loading_text: string;
    };
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
    og_image: string;
    canonical_url: string;
  };
}