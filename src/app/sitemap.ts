import { MetadataRoute } from 'next';
import { sampleProjects } from '@/types/portfolio';
import { sampleBlogPosts } from '@/types/blog';
// Mock data to prevent compilation errors
const sampleJobPostings: any[] = [];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://metrica-dip.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/historia`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about/cultura`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about/compromiso`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about/clientes`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/iso`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    },
    // Blog pages
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Careers pages
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Portfolio category pages
  const categoryPages = [
    'oficina',
    'retail', 
    'industria',
    'hoteleria',
    'educacion',
    'vivienda',
    'salud'
  ].map((category) => ({
    url: `${baseUrl}/portfolio/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Individual project pages
  const projectPages = sampleProjects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.category}/${project.slug}`,
    lastModified: project.completedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Blog category pages
  const blogCategoryPages = [
    'industria-tendencias',
    'casos-estudio',
    'guias-tecnicas',
    'liderazgo-vision'
  ].map((category) => ({
    url: `${baseUrl}/blog/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Individual blog posts
  const blogPages = sampleBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.category}/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Careers category pages
  const careersCategoryPages = [
    'gestion-direccion',
    'ingenieria-tecnica',
    'arquitectura-diseño',
    'operaciones-control',
    'administracion-soporte'
  ].map((category) => ({
    url: `${baseUrl}/careers/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Individual job postings
  const jobPages = sampleJobPostings
    .filter(job => job.status === 'active')
    .map((job) => ({
      url: `${baseUrl}/careers/job/${job.id}`,
      lastModified: job.updatedAt || job.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...projectPages,
    ...blogCategoryPages,
    ...blogPages,
    ...careersCategoryPages,
    ...jobPages
  ];
}