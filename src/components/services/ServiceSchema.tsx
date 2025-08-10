import React from 'react';

export default function ServiceSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Métrica DIP",
    "description": "Empresa líder en Dirección Integral de Proyectos de infraestructura en Perú",
    "url": "https://metrica-dip.com",
    "logo": "https://metrica-dip.com/img/logo-color.png",
    "foundingDate": "2008",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. El Derby 250",
      "addressLocality": "Santiago de Surco",
      "addressRegion": "Lima",
      "postalCode": "15023",
      "addressCountry": "PE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+51-1-234-5678",
      "contactType": "customer service",
      "email": "contacto@metrica-dip.com",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/metrica-dip",
      "https://www.facebook.com/metrica.dip",
      "https://twitter.com/metrica_dip"
    ]
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Servicios de Dirección Integral de Proyectos",
    "description": "Servicios especializados en gestión, consultoría y supervisión de proyectos de infraestructura",
    "itemListElement": [
      {
        "@type": "Service",
        "name": "Consultoría Estratégica",
        "description": "Asesoría integral desde la concepción hasta la viabilidad del proyecto",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Construction Consulting",
        "areaServed": "Peru"
      },
      {
        "@type": "Service",
        "name": "Gestión Integral",
        "description": "Project Management completo con metodologías PMI certificadas",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Project Management",
        "areaServed": "Peru"
      },
      {
        "@type": "Service",
        "name": "Supervisión Técnica",
        "description": "Supervisión especializada que garantiza calidad y cumplimiento normativo",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Construction Supervision",
        "areaServed": "Peru"
      },
      {
        "@type": "Service",
        "name": "Desarrollo Inmobiliario",
        "description": "Gestión completa de proyectos inmobiliarios desde terreno hasta entrega",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Real Estate Development",
        "areaServed": "Peru"
      },
      {
        "@type": "Service",
        "name": "Project Management",
        "description": "Dirección de proyectos con estándares internacionales PMI/PRINCE2",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Project Management",
        "areaServed": "Peru"
      },
      {
        "@type": "Service",
        "name": "Control de Calidad",
        "description": "Aseguramiento de calidad con protocolos internacionales",
        "provider": {
          "@type": "Organization",
          "name": "Métrica DIP"
        },
        "serviceType": "Quality Control",
        "areaServed": "Peru"
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Servicios de Dirección Integral de Proyectos | Métrica DIP",
    "description": "Servicios especializados en gestión, consultoría y supervisión de proyectos de infraestructura en Perú",
    "url": "https://metrica-dip.com/services",
    "mainEntity": servicesSchema,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://metrica-dip.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Servicios",
          "item": "https://metrica-dip.com/services"
        }
      ]
    },
    "about": {
      "@type": "Organization",
      "name": "Métrica DIP"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué servicios ofrece Métrica DIP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ofrecemos servicios integrales de dirección de proyectos incluyendo: Consultoría Estratégica, Gestión Integral, Supervisión Técnica, Desarrollo Inmobiliario, Project Management, Control de Calidad, Sostenibilidad & Certificación, Transformación Digital y BIM & Tecnología."
        }
      },
      {
        "@type": "Question",
        "name": "¿En qué tipos de proyectos se especializa Métrica DIP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nos especializamos en proyectos de infraestructura diversos: Torres corporativas, centros comerciales, proyectos residenciales, hoteles, clínicas, plantas industriales y desarrollos inmobiliarios de gran escala."
        }
      },
      {
        "@type": "Question",
        "name": "¿Métrica DIP tiene certificaciones internacionales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, contamos con certificación ISO 9001, profesionales certificados PMI, arquitectos LEED AP y especialistas BIM. Nuestro equipo mantiene los más altos estándares internacionales de calidad."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el proceso para contratar los servicios de Métrica DIP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El proceso inicia con una consulta gratuita donde evaluamos tu proyecto. Luego desarrollamos una propuesta personalizada, realizamos reuniones técnicas y formalizamos el acuerdo. Nuestro equipo se integra inmediatamente para comenzar la ejecución."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
    </>
  );
}