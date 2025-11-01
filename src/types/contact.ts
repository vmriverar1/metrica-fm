export interface ContactPageData {
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
  };
  sections: {
    intro: {
      title: string;
      description: string;
    };
    contact_info: {
      title: string;
      items: Array<{
        icon: string;
        title: string;
        content: string;
      }>;
    };
    map: {
      title: string;
      subtitle: string;
      show_placeholder: boolean;
      address?: string;
      embed_url?: string;
    };
    process: {
      title: string;
      steps: Array<{
        number: string;
        title: string;
        description: string;
      }>;
    };
  };
  settings: {
    form_action: string;
    form_method: string;
    show_map_placeholder: boolean;
    response_time: string;
    urgent_response_time: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}