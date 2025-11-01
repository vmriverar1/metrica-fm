// Types for the blog page JSON data
export interface BlogPageData {
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
    title: string;
    subtitle: string;
    description: string;
    background: {
      image: string;
      image_fallback: string;
      overlay_opacity: number;
      overlay_color: string;
    };
    stats: {
      dynamic_note: string;
      labels: {
        total_posts: string;
        total_categories: string;
        total_authors: string;
        average_reading_time: string;
      };
      default_values: {
        total_posts: number;
        total_categories: number;
        total_authors: number;
        average_reading_time: number;
      };
    };
  };
  content_sections: {
    featured_content: {
      title: string;
      subtitle: string;
      show_featured_badge: boolean;
      max_featured: number;
    };
    latest_content: {
      title: string;
      subtitle: string;
      posts_per_page: number;
      show_date: boolean;
      show_reading_time: boolean;
      show_author: boolean;
    };
    categories_overview: {
      title: string;
      subtitle: string;
      show_post_count: boolean;
      dynamic_note: string;
    };
  };
  filters: {
    title: string;
    description: string;
    search: {
      placeholder: string;
      search_in: string[];
      min_characters: number;
    };
    category_filter: {
      label: string;
      all_option: string;
      dynamic_source: string;
    };
    author_filter: {
      label: string;
      all_option: string;
      dynamic_source: string;
    };
    tag_filter: {
      label: string;
      all_option: string;
      dynamic_source: string;
    };
    featured_toggle: {
      label: string;
      description: string;
    };
    sort_options: SortOption[];
  };
  content_types: {
    article_categories: {
      note: string;
      expected_categories: string[];
    };
    article_structure: {
      required_fields: string[];
      optional_fields: string[];
      dynamic_source: string;
    };
  };
  author_showcase: {
    title: string;
    subtitle: string;
    description: string;
    show_in_sidebar: boolean;
    featured_authors_count: number;
    author_details: {
      show_bio: boolean;
      show_specializations: boolean;
      show_articles_count: boolean;
      show_social_links: boolean;
    };
    dynamic_note: string;
  };
  newsletter_signup: {
    title: string;
    subtitle: string;
    description: string;
    form: {
      email_placeholder: string;
      name_placeholder: string;
      submit_text: string;
      loading_text: string;
      success_message: string;
      success_description: string;
      error_message: string;
    };
    benefits: string[];
    privacy_note: string;
  };
  related_content: {
    title: string;
    subtitle: string;
    algorithm: {
      match_by: string[];
      max_suggestions: number;
      exclude_current: boolean;
    };
  };
  search_functionality: {
    advanced_search: {
      title: string;
      filters: AdvancedSearchFilter[];
    };
    search_suggestions: {
      popular_searches: string[];
      trending_topics: string[];
    };
  };
  content_interaction: {
    engagement_features: {
      article_rating: {
        enabled: boolean;
        scale: string;
        show_average: boolean;
      };
      social_sharing: {
        platforms: string[];
        custom_messages: boolean;
      };
      comments: {
        enabled: boolean;
        moderation: boolean;
        guest_comments: boolean;
      };
      bookmarks: {
        enabled: boolean;
        require_login: boolean;
      };
    };
    reading_progress: {
      show_progress_bar: boolean;
      show_reading_time: boolean;
      save_position: boolean;
    };
  };
  seo_optimization: {
    structured_data: {
      article_schema: boolean;
      breadcrumb_schema: boolean;
      author_schema: boolean;
      organization_schema: boolean;
    };
    meta_tags: {
      dynamic_titles: boolean;
      dynamic_descriptions: boolean;
      og_images: boolean;
      twitter_cards: boolean;
    };
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
    contact_options: ContactOption[];
  };
}

export interface SortOption {
  value: string;
  label: string;
  default?: boolean;
}

export interface AdvancedSearchFilter {
  type: string;
  label: string;
  options: string[];
}

export interface ContactOption {
  type: string;
  label: string;
  value: string;
  hours?: string;
  response_time?: string;
}

// Types for newsletter/blog content
export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin: string;
  email: string;
  featured: boolean;
  articles_count: number;
  specializations: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  articles_count: number;
  featured: boolean;
  order?: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  author_id: string;
  featured_image: string;
  featured_image_alt: string;
  excerpt: string;
  content: string;
  published_date: string;
  reading_time: number;
  featured: boolean;
  tags: string[];
  seo_description: string;
  social_image?: string;
  url: string;
  related_articles: string[];
  gallery?: GalleryItem[];
}

export interface GalleryItem {
  url: string;
  caption: string;
}

export interface BlogContentData {
  authors: BlogAuthor[];
  categories: BlogCategory[];
  articles: BlogArticle[];
  metadata: {
    total_authors: number;
    total_categories: number;
    total_articles: number;
    featured_authors: number;
    featured_categories: number;
    last_updated: string;
    total_reading_time: number;
    average_reading_time: number;
    featured_articles: number;
    total_words: number;
  };
}