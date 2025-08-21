import type { Metadata } from 'next';
import ISOContentWrapper from '@/components/iso/ISOContentWrapper';

export const metadata: Metadata = {
  title: 'ISO 9001:2015 Certificación | Métrica DIP - Calidad Garantizada',
  description: 'Métrica DIP cuenta con certificación ISO 9001:2015. Garantizamos excelencia en gestión de proyectos de construcción con estándares internacionales de calidad.',
  keywords: 'ISO 9001, certificación calidad, construcción certificada, gestión calidad Perú, sistema gestión calidad, auditoría ISO, procesos calidad, mejora continua, satisfacción cliente, control calidad construcción',
  
  openGraph: {
    title: 'ISO 9001:2015 Certificación | Métrica DIP',
    description: 'Excelencia certificada en gestión de proyectos de construcción. Sistema de gestión de calidad ISO 9001:2015 verificado.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Métrica DIP',
    images: [
      {
        url: '/images/iso-certificate-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Certificación ISO 9001:2015 Métrica DIP'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'ISO 9001:2015 | Métrica DIP',
    description: 'Sistema de gestión de calidad certificado para proyectos de construcción e infraestructura en Perú.',
    images: ['/images/iso-certificate-og.jpg'],
  },
  
  alternates: {
    canonical: '/iso'
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

// Schema.org structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Métrica DIP",
  "url": "https://metricadip.com",
  "logo": "https://metricadip.com/images/logo.png",
  "description": "Empresa certificada ISO 9001:2015 especializada en dirección integral de proyectos de construcción e infraestructura en Perú",
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "name": "ISO 9001:2015 Certification",
    "description": "Certificación del Sistema de Gestión de Calidad ISO 9001:2015",
    "credentialCategory": "Quality Management System",
    "dateCreated": "2018-06-15",
    "expires": "2027-06-14",
    "issuedBy": {
      "@type": "Organization",
      "name": "SGS Peru"
    }
  },
  "qualityPolicy": "https://metricadip.com/iso/quality-policy.pdf",
  "iso9001Certified": true,
  "certificationBody": "SGS Peru",
  "certificationDate": "2018-06-15",
  "certificationExpiry": "2027-06-14",
  "areaServed": {
    "@type": "Country",
    "name": "Peru"
  },
  "serviceType": [
    "Construction Project Management",
    "Infrastructure Development",
    "Quality Management Systems"
  ]
};

export default function ISOPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
        <ISOContentWrapper />
      </div>
    </>
  );
}