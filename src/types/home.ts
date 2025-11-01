export interface HomePageData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: {
      main: string;
      secondary: string;
    };
    subtitle: string;
    background: {
      type: 'video' | 'image';
      video_url?: string;
      video_url_fallback?: string;
      image_fallback?: string;
      image_fallback_internal?: string;
      image_main?: string;
      overlay_opacity: number;
    };
    rotating_words: string[];
    transition_text: string;
    cta: {
      text: string;
      target: string;
    };
  };
  stats: {
    statistics: Array<{
      id: string;
      icon: string;
      value: number;
      suffix: string;
      prefix?: string;
      label: string;
    }>;
  };
  services: {
    section: {
      title: string;
      subtitle: string;
    };
    main_service?: {
      id?: string;
      title: string;
      description: string;
      image_url?: string;
      icon_url?: string;
      is_main?: boolean;
      width?: '1/3' | '2/3' | '3/3';
      cta?: {
        text: string;
        url: string;
      };
    };
    secondary_services?: Array<{
      id: string;
      title: string;
      description: string;
      image_url?: string;
      image_url_fallback?: string;
      icon_url?: string;
      is_main?: boolean;
      width?: '1/3' | '2/3' | '3/3';
      cta?: {
        text: string;
        url: string;
      };
    }>;
    services_list?: Array<{
      id: string;
      title: string;
      description: string;
      image_url?: string;
      image_url_fallback?: string;
      icon_url?: string;
      is_main?: boolean;
      width?: '1/3' | '2/3' | '3/3';
      cta?: {
        text: string;
        url: string;
      };
    }>;
  };
  portfolio: {
    section: {
      title: string;
      subtitle: string;
      cta: {
        text: string;
      };
    };
    featured_projects: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      image_url: string;
      link_url?: string;
      featured_order?: number;
    }>;
  };
  pillars: {
    section: {
      title: string;
      subtitle: string;
    };
    pillars: Array<{
      id: number;
      icon: string;
      title: string;
      description: string;
      image: string;
    }>;
  };
  policies: {
    section: {
      title: string;
      subtitle: string;
    };
    policies: Array<{
      id: number;
      icon: string;
      title: string;
      description: string;
      image: string;
      pdf?: string;
    }>;
  };
  clients: {
    section: {
      title: string;
      subtitle: string;
    };
    logos: Array<{
      id: string;
      name: string;
      alt: string;
      image: string;
    }>;
  };
  newsletter: {
    section: {
      title: string;
      subtitle: string;
    };
    form: {
      placeholder_text: string;
      cta_text: string;
      loading_text: string;
      success_message: string;
      success_description: string;
    };
  };
}