import React from 'react';
import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ContactSection from '@/components/contact/ContactSection';
import { ContactPageData } from '@/types/contact';
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { Metadata } from 'next';


// Forzar contenido dinámico - los cambios del admin se reflejan inmediatamente
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getContactData();

    // Usar datos SEO del editor con fallbacks estáticos
    const title = data.seo?.meta_title || 'Contáctanos | Métrica FM';
    const description = data.seo?.meta_description || 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos. Estamos listos para transformar tus ideas en realidad.';
    const keywords = Array.isArray(data.seo?.keywords) ? data.seo.keywords.join(', ') : 'contacto, métrica dip, dirección integral proyectos, consultoría construcción';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'es_PE',
        url: 'https://metricadip.com/contact',
        siteName: 'Métrica FM',
        images: [
          {
            url: data.hero?.background_image || '/images/proyectos/hero-background.jpg',
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [data.hero?.background_image || '/images/proyectos/hero-background.jpg']
      },
      robots: {
        index: true,
        follow: true
      },
      alternates: {
        canonical: 'https://metricadip.com/contact'
      }
    };
  } catch (error) {
    console.error('Error generating metadata for contact page:', error);
    return {
      title: 'Contáctanos | Métrica FM',
      description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos. Estamos listos para transformar tus ideas en realidad.',
      keywords: 'contacto, métrica dip, dirección integral proyectos, consultoría construcción',
      openGraph: {
        title: 'Contáctanos | Métrica FM',
        description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos.',
        type: 'website',
        locale: 'es_PE',
        url: 'https://metricadip.com/contact',
        siteName: 'Métrica FM'
      },
      robots: {
        index: true,
        follow: true
      }
    };
  }
}

// Helper function to serialize Firestore data for Client Components
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item));
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    // Check if it's a Firestore timestamp
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toISOString();
    }

    // Recursively process object properties
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreData(value);
    }
    return serialized;
  }

  return data;
}

// Fallback data with clean structure
const CONTACT_FALLBACK: ContactPageData = {
  hero: {
    title: "Contáctanos",
    background_image: "/images/proyectos/EDUCACIÓN/Cibertec/_ARI2623.webp",
    subtitle: "Estamos aquí para ayudarte a transformar tus proyectos en realidad."
  },
  seo: {
    meta_description: "Contáctanos para iniciar tu proyecto de infraestructura.",
    meta_title: "Contacto - Métrica FM",
    keywords: ["contacto", "métrica fm"]
  },
  settings: {
    form_method: "POST",
    form_action: "/api/contact",
    urgent_response_time: "48 horas",
    response_time: "24 horas",
    show_map_placeholder: true
  },
  sections: {
    contact_info: {
      title: "Información de Contacto",
      items: []
    },
    map: {
      show_placeholder: true,
      title: "Ubicación",
      subtitle: "Lima, Perú",
      address: "Lima, Perú",
      embed_url: ""
    },
    intro: {
      title: "Hablemos de Tu Proyecto",
      description: "Nuestro equipo está listo para asesorarte."
    },
    process: {
      title: "Proceso de Contacto",
      steps: []
    }
  }
};

async function getContactData(): Promise<ContactPageData> {
  try {
    console.log('📄 [ContactPage] Loading contact data from Firestore...');

    const result = await FirestoreCore.getDocumentById('pages', 'contact');

    if (result.success && result.data) {
      console.log('✅ [ContactPage] Contact data loaded from Firestore');
      const serializedData = serializeFirestoreData(result.data);

      // Deep merge con fallback para asegurar que todos los campos existan
      return {
        ...CONTACT_FALLBACK,
        ...serializedData,
        hero: { ...CONTACT_FALLBACK.hero, ...serializedData.hero },
        seo: { ...CONTACT_FALLBACK.seo, ...serializedData.seo },
        settings: { ...CONTACT_FALLBACK.settings, ...serializedData.settings },
        sections: {
          ...CONTACT_FALLBACK.sections,
          ...serializedData.sections,
          contact_info: { ...CONTACT_FALLBACK.sections.contact_info, ...serializedData.sections?.contact_info },
          map: { ...CONTACT_FALLBACK.sections.map, ...serializedData.sections?.map },
          intro: { ...CONTACT_FALLBACK.sections.intro, ...serializedData.sections?.intro },
          process: { ...CONTACT_FALLBACK.sections.process, ...serializedData.sections?.process }
        }
      } as ContactPageData;
    }

    console.warn('⚠️ [FALLBACK] Contact Page: Sin datos en Firestore, usando fallback');
  } catch (error) {
    console.error('❌ [FIRESTORE] Contact Page error:', error);
    console.warn('⚠️ [FALLBACK] Contact Page: Error detectado, usando fallback');
  }

  return CONTACT_FALLBACK;
}

function ContactContent({ data }: { data: ContactPageData }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          backgroundImage={data.hero.background_image}
        />

        {/* Contenido de contacto */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">{data.sections.intro.title}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {data.sections.intro.description}
              </p>
            </div>

            <ContactSection
              contactInfo={data.sections.contact_info}
              map={data.sections.map}
            />

            {/* Sección adicional */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.sections.process.title}</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {data.sections.process.steps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-primary font-bold">{step.number}</span>
                      </div>
                      <h4 className="font-semibold text-primary mb-2">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function ContactPage() {
  const data = await getContactData();
  return <ContactContent data={data} />;
}