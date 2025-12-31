export interface CulturaData {
  page: {
    title: string;
    subtitle?: string;
    description: string;
    hero_image?: string;
    keywords: string[];
    url?: string;
    openGraph?: {
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