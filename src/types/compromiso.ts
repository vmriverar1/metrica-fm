export interface CompromisoPageData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback: string;
  };
  main_content: {
    introduction: {
      title: string;
      description: string;
    };
    sections: Section[];
  };
  impact_metrics: {
    title: string;
    subtitle: string;
    categories: MetricCategory[];
  };
  sustainability_goals: {
    title: string;
    subtitle: string;
    description: string;
    goals: SustainabilityGoal[];
  };
  future_commitments: {
    title: string;
    subtitle: string;
    description: string;
    commitments: FutureCommitment[];
  };
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pillars?: Pillar[];
  case_studies?: CaseStudy[];
  environmental_programs?: EnvironmentalProgram[];
  certifications?: Certification[];
  standards?: Standard[];
}

export interface Pillar {
  title: string;
  icon: string;
  color: string;
  initiatives: string[];
  metrics: Record<string, string>;
}

export interface CaseStudy {
  title: string;
  description: string;
  impact: string;
  image: string;
  image_fallback: string;
}

export interface EnvironmentalProgram {
  title: string;
  description: string;
  achievement: string;
}

export interface Certification {
  name: string;
  category: string;
  description: string;
  year_obtained: string;
  validity: string;
  icon: string;
  color: string;
}

export interface Standard {
  name: string;
  description: string;
  compliance: string;
}

export interface MetricCategory {
  title: string;
  icon: string;
  color: string;
  metrics: Metric[];
}

export interface Metric {
  value: string;
  label: string;
  description: string;
}

export interface SustainabilityGoal {
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  achievements: string[];
}

export interface FutureCommitment {
  year: string;
  title: string;
  description: string;
  progress: number;
  icon: string;
}