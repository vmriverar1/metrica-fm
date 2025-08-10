'use client';

import React from 'react';
import Head from 'next/head';
import { JobPosting, getJobCategoryLabel, getJobTypeLabel } from '@/types/careers';

interface JobSEOProps {
  job: JobPosting;
  canonicalUrl?: string;
}

export default function JobSEO({ job, canonicalUrl }: JobSEOProps) {
  const url = canonicalUrl || `https://metricadip.com/careers/job/${job.id}`;
  const postedDate = job.postedAt.toISOString();
  const validThroughDate = job.deadline.toISOString();
  const locationString = typeof job.location === 'string' ? job.location : 
    `${job.location.city}, ${job.location.region}, ${job.location.country}`;

  // Generate structured data for JobPosting
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JobPosting",
        "@id": `${url}#jobposting`,
        "title": job.title,
        "description": job.description,
        "identifier": {
          "@type": "PropertyValue",
          "name": "Métrica DIP Job ID",
          "value": job.id
        },
        "datePosted": postedDate,
        "validThrough": validThroughDate,
        "employmentType": job.type.toUpperCase().replace('-', '_'),
        "hiringOrganization": {
          "@type": "Organization",
          "@id": "https://metricadip.com#organization",
          "name": "Métrica DIP",
          "alternateName": "Métrica Dirección Integral de Proyectos",
          "url": "https://metricadip.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://metricadip.com/images/logo.png",
            "width": 180,
            "height": 60
          },
          "description": "Líderes en gestión integral de proyectos de infraestructura en Perú",
          "industry": "Construction & Infrastructure",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+51-1-234-5678",
            "contactType": "HR Department",
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
        },
        "jobLocation": typeof job.location === 'string' ? {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location,
            "addressCountry": "PE"
          }
        } : {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": job.location.address,
            "addressLocality": job.location.city,
            "addressRegion": job.location.region,
            "postalCode": job.location.postalCode,
            "addressCountry": job.location.country
          }
        },
        ...(job.salary && {
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": job.salary.currency,
            "value": {
              "@type": "QuantitativeValue",
              "minValue": job.salary.min,
              "maxValue": job.salary.max,
              "unitText": "MONTH"
            }
          }
        }),
        "jobBenefits": job.benefits,
        "qualifications": job.requirements.map(req => req.title),
        "responsibilities": job.responsibilities,
        "skills": job.requirements.filter(req => req.type === 'skill').map(skill => skill.title),
        "educationRequirements": job.requirements.filter(req => req.type === 'education').map(edu => edu.title),
        "experienceRequirements": {
          "@type": "OccupationalExperienceRequirements",
          "monthsOfExperience": job.experience * 12
        },
        "workHours": getJobTypeLabel(job.type),
        "jobLocationType": (typeof job.location === 'object' && job.location.remote) ? 
          "TELECOMMUTE" : "PHYSICAL",
        "applicantLocationRequirements": {
          "@type": "Country",
          "name": "Peru"
        },
        "jobImmediateStart": job.urgency === 'urgent',
        "specialCommitments": job.urgency === 'urgent' ? "Urgent Hiring" : undefined,
        "url": url
      },
      {
        "@type": "WebPage",
        "@id": url,
        "url": url,
        "name": `${job.title} - ${job.department} | Métrica DIP`,
        "description": job.description,
        "datePublished": postedDate,
        "dateModified": postedDate,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Carreras",
              "item": "https://metricadip.com/careers"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": getJobCategoryLabel(job.category),
              "item": `https://metricadip.com/careers/${job.category}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": job.title,
              "item": url
            }
          ]
        },
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://metricadip.com#website"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": `https://metricadip.com/api/og/job?title=${encodeURIComponent(job.title)}&department=${encodeURIComponent(job.department)}`,
          "width": 1200,
          "height": 630
        }
      },
      {
        "@type": "Organization",
        "@id": "https://metricadip.com#organization",
        "name": "Métrica DIP",
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
        "industry": "Construction & Infrastructure",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "minValue": 50,
          "maxValue": 200
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+51-1-234-5678",
            "contactType": "customer service",
            "availableLanguage": ["Spanish", "English"]
          },
          {
            "@type": "ContactPoint",
            "email": "careers@metricadip.com",
            "contactType": "HR Department",
            "availableLanguage": ["Spanish", "English"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "PE",
          "addressRegion": "Lima",
          "addressLocality": "Lima"
        },
        "sameAs": [
          "https://linkedin.com/company/metrica-dip",
          "https://facebook.com/metricadip"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Carreras en Métrica DIP",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Gestión y Dirección",
              "category": "Management"
            },
            {
              "@type": "Offer",
              "name": "Ingeniería Técnica",
              "category": "Engineering"
            },
            {
              "@type": "Offer",
              "name": "Arquitectura y Diseño",
              "category": "Architecture"
            }
          ]
        }
      }
    ]
  };

  const ogImage = `https://metricadip.com/api/og/job?title=${encodeURIComponent(job.title)}&department=${encodeURIComponent(job.department)}&location=${encodeURIComponent(locationString)}`;
  
  const pageTitle = `${job.title} - ${job.department} | Careers Métrica DIP`;
  const pageDescription = `Únete a nuestro equipo como ${job.title} en ${job.department}. ${job.description.substring(0, 150)}...`;

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${job.title}, ${job.department}, ${locationString}, ${job.tags.join(', ')}, carreras Métrica DIP, empleos ingeniería, trabajos construcción Perú`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Job-specific meta tags */}
        <meta name="job-title" content={job.title} />
        <meta name="job-department" content={job.department} />
        <meta name="job-location" content={locationString} />
        <meta name="job-type" content={getJobTypeLabel(job.type)} />
        <meta name="job-category" content={getJobCategoryLabel(job.category)} />
        <meta name="job-posted-date" content={postedDate} />
        <meta name="job-deadline" content={validThroughDate} />
        <meta name="experience-required" content={`${job.experience} años`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl || url} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${job.title} position at Métrica DIP`} />
        <meta property="og:site_name" content="Métrica DIP Careers" />
        <meta property="og:locale" content="es_PE" />
        
        {/* Job-specific Open Graph */}
        <meta property="job:posting_date" content={postedDate} />
        <meta property="job:expiration_date" content={validThroughDate} />
        <meta property="job:location" content={locationString} />
        <meta property="job:company" content="Métrica DIP" />
        <meta property="job:job_type" content={getJobTypeLabel(job.type)} />
        {job.salary && (
          <>
            <meta property="job:salary_min" content={job.salary.min.toString()} />
            <meta property="job:salary_max" content={job.salary.max.toString()} />
            <meta property="job:salary_currency" content={job.salary.currency} />
          </>
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={`${job.title} career opportunity`} />
        <meta name="twitter:site" content="@metricadip" />
        
        {/* LinkedIn specific */}
        <meta property="linkedin:owner" content="metrica-dip" />
        
        {/* Alternative Languages */}
        <link rel="alternate" hrefLang="es-PE" href={url} />
        <link rel="alternate" hrefLang="es" href={url} />
        <link rel="alternate" hrefLang="x-default" href={url} />
        
        {/* RSS Feed for Jobs */}
        <link rel="alternate" type="application/rss+xml" title="Métrica DIP Careers RSS" href="/careers/feed.xml" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href={ogImage} as="image" />
        
        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        
        {/* Geo tags for location */}
        {typeof job.location === 'object' && job.location.latitude && job.location.longitude && (
          <>
            <meta name="geo.position" content={`${job.location.latitude};${job.location.longitude}`} />
            <meta name="geo.placename" content={`${job.location.city}, ${job.location.region}`} />
            <meta name="geo.region" content={job.location.region} />
          </>
        )}
        
        {/* Urgency indicators */}
        {job.urgency === 'urgent' && (
          <>
            <meta name="job:urgency" content="urgent" />
            <meta name="priority" content="high" />
          </>
        )}
        
        {/* Featured job indicator */}
        {job.featured && (
          <meta name="job:featured" content="true" />
        )}
        
        {/* Application tracking */}
        <meta name="application_url" content={`${url}/apply`} />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
        
        {/* Google Jobs structured data (separate) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": job.title,
              "description": job.description,
              "datePosted": postedDate,
              "validThrough": validThroughDate,
              "employmentType": job.type.toUpperCase().replace('-', '_'),
              "hiringOrganization": {
                "@type": "Organization",
                "name": "Métrica DIP",
                "logo": "https://metricadip.com/images/logo.png"
              },
              "jobLocation": typeof job.location === 'string' ? {
                "@type": "Place",
                "address": job.location
              } : {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": job.location.city,
                  "addressRegion": job.location.region,
                  "addressCountry": job.location.country
                }
              },
              ...(job.salary && {
                "baseSalary": {
                  "@type": "MonetaryAmount",
                  "currency": job.salary.currency,
                  "value": {
                    "@type": "QuantitativeValue",
                    "minValue": job.salary.min,
                    "maxValue": job.salary.max
                  }
                }
              })
            }, null, 2)
          }}
        />
      </Head>
    </>
  );
}