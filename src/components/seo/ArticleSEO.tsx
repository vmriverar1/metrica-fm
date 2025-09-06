'use client';

import React from 'react';
import Head from 'next/head';
import { BlogPost } from '@/types/blog';

interface ArticleSEOProps {
  article: BlogPost;
  canonicalUrl?: string;
}

export default function ArticleSEO({ article, canonicalUrl }: ArticleSEOProps) {
  const url = canonicalUrl || `https://metricadip.com/blog/${article.category}/${article.slug}`;
  const publishedDate = article.publishedAt.toISOString();
  const modifiedDate = article.updatedAt?.toISOString() || publishedDate;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        "headline": article.title,
        "image": {
          "@type": "ImageObject",
          "@id": `${url}#primaryimage`,
          "url": article.featuredImage,
          "caption": article.title,
          "contentUrl": article.featuredImage,
          "width": 1200,
          "height": 630
        },
        "datePublished": publishedDate,
        "dateModified": modifiedDate,
        "author": {
          "@type": "Person",
          "@id": `https://metricadip.com/author/${article.author.id}#person`,
          "name": article.author.name,
          "image": {
            "@type": "ImageObject",
            "url": article.author.avatar || "/images/default-avatar.jpg",
            "caption": article.author.name
          },
          "description": article.author.bio,
          "jobTitle": article.author.role,
          "knowsAbout": article.author.expertise,
          "url": `https://metricadip.com/author/${article.author.id}`
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://metricadip.com#organization",
          "name": "Métrica FM",
          "url": "https://metricadip.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://metricadip.com/images/logo.png",
            "width": 180,
            "height": 60
          }
        },
        "description": article.excerpt,
        "articleBody": article.content,
        "wordCount": Math.ceil(article.content.length / 5),
        "timeRequired": `PT${article.readingTime}M`,
        "articleSection": article.category,
        "keywords": article.tags.join(", "),
        "about": {
          "@type": "Thing",
          "name": article.category === 'industria-tendencias' ? 'Industria de la Construcción' :
                  article.category === 'casos-estudio' ? 'Casos de Estudio' :
                  article.category === 'guias-tecnicas' ? 'Guías Técnicas' :
                  'Liderazgo y Visión'
        },
        "mentions": article.tags.map(tag => ({
          "@type": "Thing",
          "name": tag
        })),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "url": url,
        "isAccessibleForFree": true,
        "creativeWorkStatus": "Published"
      },
      {
        "@type": "WebPage",
        "@id": url,
        "url": url,
        "name": article.title,
        "description": article.excerpt,
        "datePublished": publishedDate,
        "dateModified": modifiedDate,
        "primaryImageOfPage": {
          "@id": `${url}#primaryimage`
        },
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://metricadip.com#website"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://metricadip.com#organization",
        "name": "Métrica FM",
        "alternateName": "Métrica Dirección Integral de Proyectos",
        "url": "https://metricadip.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://metricadip.com/images/logo.png",
          "width": 180,
          "height": 60
        },
        "description": "Líderes en gestión integral de proyectos de infraestructura en Perú",
        "foundingDate": "2009",
        "founders": [
          {
            "@type": "Person",
            "name": "Fundadores Métrica FM"
          }
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+51-1-234-5678",
          "contactType": "customer service",
          "availableLanguage": ["Spanish", "English"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "PE",
          "addressRegion": "Lima",
          "addressLocality": "Lima"
        },
        "sameAs": [
          "https://linkedin.com/company/metrica-dip",
          "https://facebook.com/metricadip"
        ]
      }
    ]
  };

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{article.seo?.title || `${article.title} | Blog Métrica FM`}</title>
        <meta name="description" content={article.seo?.description || article.excerpt} />
        <meta name="keywords" content={article.seo?.keywords || article.tags.join(', ')} />
        <meta name="author" content={article.author.name} />
        <meta name="robots" content={article.seo?.robots || "index, follow, max-image-preview:large"} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl || url} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={article.seo?.ogTitle || article.title} />
        <meta property="og:description" content={article.seo?.ogDescription || article.excerpt} />
        <meta property="og:image" content={article.featuredImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.title} />
        <meta property="og:site_name" content="Métrica FM" />
        <meta property="og:locale" content="es_PE" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content={article.author.name} />
        <meta property="article:section" content={article.category} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={article.seo?.twitterTitle || article.title} />
        <meta name="twitter:description" content={article.seo?.twitterDescription || article.excerpt} />
        <meta name="twitter:image" content={article.featuredImage} />
        <meta name="twitter:image:alt" content={article.title} />
        <meta name="twitter:creator" content={`@${article.author.social?.twitter || 'metricadip'}`} />
        <meta name="twitter:site" content="@metricadip" />
        
        {/* Additional Meta Tags */}
        <meta name="publish_date" property="og:publish_date" content={publishedDate} />
        <meta name="category" content={article.category} />
        <meta name="reading_time" content={`${article.readingTime} minutos`} />
        
        {/* Prev/Next Navigation for Series */}
        {article.series?.previousPost && (
          <link rel="prev" href={`/blog/${article.category}/${article.series.previousPost.slug}`} />
        )}
        {article.series?.nextPost && (
          <link rel="next" href={`/blog/${article.category}/${article.series.nextPost.slug}`} />
        )}
        
        {/* Alternative Languages */}
        <link rel="alternate" hrefLang="es-PE" href={url} />
        <link rel="alternate" hrefLang="es" href={url} />
        <link rel="alternate" hrefLang="x-default" href={url} />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Métrica FM Blog RSS" href="/feed.xml" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href={article.featuredImage} as="image" />
        {article.author.avatar && (
          <link rel="preload" href={article.author.avatar} as="image" />
        )}
        
        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
      </Head>
    </>
  );
}