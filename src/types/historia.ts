export interface HistoriaPageData {
  page: {
    title: string;
    subtitle: string;
    hero_image: string;
    hero_image_fallback: string;
    hero_video: string;
    hero_video_fallback: string;
    description: string;
    url: string;
  };
  timeline_events: Array<{
    id: string;
    year: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    image_fallback?: string;
    achievements: string[];
    gallery?: string[];
    impact: string;
    metrics?: {
      team_size?: number;
      projects?: number;
      investment?: string;
    };
  }>;
  achievement_summary: {
    title: string;
    metrics: Array<{
      number: string;
      label: string;
      description: string;
    }>;
  };
  call_to_action: {
    title: string;
    description: string;
    primary_button: {
      text: string;
      href: string;
    };
    secondary_button: {
      text: string;
      href: string;
    };
  };
}