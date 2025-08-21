'use client';

import { use, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { useDynamicCareersContent } from '@/hooks/useDynamicCareersContent';
import JobDetail from '@/components/careers/JobDetail';
import OptimizedLoading from '@/components/loading/OptimizedLoading';

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

function JobContent({ slug }: { slug: string }) {
  const { data: careersContent, loading, error } = useDynamicCareersContent();

  if (loading) {
    return <OptimizedLoading type="careers" message="Cargando detalles del puesto..." />;
  }

  if (error || !careersContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error al cargar</h1>
          <p className="text-muted-foreground">{error || 'No se pudo cargar el contenido'}</p>
        </div>
      </div>
    );
  }

  const job = careersContent.job_postings.find(job => job.slug === slug);
  
  if (!job) {
    notFound();
  }

  return <JobDetail job={job} />;
}

export default function JobPage({ params }: JobPageProps) {
  const resolvedParams = use(params);
  
  return (
    <Suspense fallback={<OptimizedLoading type="careers" message="Cargando detalles del puesto..." />}>
      <JobContent slug={resolvedParams.slug} />
    </Suspense>
  );
}