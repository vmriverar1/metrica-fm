import { Metadata } from 'next';
import { use } from 'react';
import CategoryPage from '@/components/portfolio/CategoryPage';
import { CareersProvider } from '@/contexts/CareersContext';
import { getJobCategoryLabel, getJobsByCategory } from '@/types/careers';

interface CareerCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CareerCategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryLabel = getJobCategoryLabel(resolvedParams.category as any);
  
  return {
    title: `${categoryLabel} | Carreras Métrica FM`,
    description: `Oportunidades laborales en ${categoryLabel.toLowerCase()}: posiciones disponibles, requisitos y beneficios en Métrica FM.`,
    keywords: `empleos ${categoryLabel.toLowerCase()}, trabajos construcción, carreras ingeniería, oportunidades ${categoryLabel.toLowerCase()}`,
    openGraph: {
      title: `${categoryLabel} | Carreras Métrica FM`,
      description: `Oportunidades laborales en ${categoryLabel.toLowerCase()}: posiciones disponibles, requisitos y beneficios en Métrica FM.`,
      type: 'website'
    }
  };
}

export default function CareerCategoryPage({ params }: CareerCategoryPageProps) {
  const resolvedParams = use(params);
  const categoryLabel = getJobCategoryLabel(resolvedParams.category as any);
  const jobs = getJobsByCategory(resolvedParams.category as any);

  return (
    <CareersProvider>
      <CategoryPage
        type="careers"
        category={resolvedParams.category}
        title={categoryLabel}
        description={`Explora las oportunidades disponibles en ${categoryLabel.toLowerCase()}`}
        items={jobs}
        totalItems={jobs.length}
      />
    </CareersProvider>
  );
}