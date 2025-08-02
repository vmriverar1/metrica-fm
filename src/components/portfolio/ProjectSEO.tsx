'use client';

import React from 'react';
import Head from 'next/head';
import { Project, getCategoryLabel } from '@/types/portfolio';

interface ProjectSEOProps {
  project: Project;
  baseUrl?: string;
}

export default function ProjectSEO({ 
  project, 
  baseUrl = 'https://metrica-dip.com' 
}: ProjectSEOProps) {
  const title = `${project.title} | Métrica DIP - Dirección Integral de Proyectos`;
  const description = project.description || project.shortDescription;
  const categoryLabel = getCategoryLabel(project.category);
  const url = `${baseUrl}/portfolio/${project.category}/${project.slug}`;
  const imageUrl = project.featuredImage;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": description,
    "image": imageUrl,
    "url": url,
    "creator": {
      "@type": "Organization",
      "name": "Métrica DIP",
      "url": baseUrl
    },
    "dateCreated": project.completedAt.toISOString(),
    "inLanguage": "es-PE",
    "locationCreated": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": project.location.city,
        "addressRegion": project.location.region,
        "addressCountry": "PE"
      }
    },
    "about": {
      "@type": "Thing",
      "name": categoryLabel
    },
    "keywords": [
      ...project.tags,
      categoryLabel.toLowerCase(),
      "arquitectura",
      "construcción",
      "ingeniería",
      "Perú",
      project.location.city,
      project.location.region
    ].join(", ")
  };

  // Generate additional project-specific keywords
  const additionalKeywords = [
    `proyecto ${categoryLabel.toLowerCase()}`,
    `${categoryLabel} en ${project.location.city}`,
    `construcción ${project.location.region}`,
    `arquitectura ${project.location.city}`,
    "dirección de proyectos",
    "gestión de construcción",
    "supervisión de obras"
  ];

  const allKeywords = [
    ...project.tags,
    ...additionalKeywords,
    categoryLabel.toLowerCase()
  ].join(", ");

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content="Métrica DIP" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="es-PE" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Métrica DIP" />
      <meta property="og:locale" content="es_PE" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@MetricaDIP" />
      
      {/* Additional Meta Tags */}
      <meta name="geo.region" content={`PE-${project.location.region}`} />
      <meta name="geo.placename" content={project.location.city} />
      <meta name="geo.position" content={`${project.location.coordinates[1]};${project.location.coordinates[0]}`} />
      <meta name="ICBM" content={`${project.location.coordinates[1]}, ${project.location.coordinates[0]}`} />
      
      {/* Project specific meta */}
      <meta name="project:category" content={categoryLabel} />
      <meta name="project:location" content={`${project.location.city}, ${project.location.region}`} />
      <meta name="project:completion_date" content={project.completedAt.toISOString().split('T')[0]} />
      <meta name="project:area" content={project.details.area} />
      {project.details.investment && (
        <meta name="project:investment" content={project.details.investment} />
      )}
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Preload critical resources */}
      <link rel="preload" href={imageUrl} as="image" />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//metrica-dip.com" />
    </Head>
  );
}

// Hook to generate dynamic meta tags for project pages
export function useProjectMeta(project: Project | null) {
  if (!project) return {};

  return {
    title: `${project.title} | Métrica DIP`,
    description: project.description || project.shortDescription,
    openGraph: {
      title: `${project.title} | Métrica DIP`,
      description: project.description || project.shortDescription,
      images: [
        {
          url: project.featuredImage,
          width: 1200,
          height: 630,
          alt: project.title
        }
      ],
      type: 'article',
      locale: 'es_PE',
      siteName: 'Métrica DIP'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Métrica DIP`,
      description: project.description || project.shortDescription,
      images: [project.featuredImage]
    }
  };
}