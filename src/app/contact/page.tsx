import React from 'react';
import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ContactSection from '@/components/contact/ContactSection';
import { ContactPageData } from '@/types/contact';
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { Metadata } from 'next';

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

async function getContactData(): Promise<ContactPageData> {
  try {
    // Get contact data directly from Firestore using FirestoreCore
    console.log('📄 [ContactPage] Loading contact data from Firestore...');

    const result = await FirestoreCore.getDocumentById('pages', 'contact');

    if (result.success && result.data) {
      console.log('✅ [ContactPage] Contact data loaded from Firestore');
      // Serialize Firestore data before returning
      const serializedData = serializeFirestoreData(result.data);
      return serializedData as ContactPageData;
    }

    console.warn('⚠️ [FALLBACK] Contact Page: Sin datos en Firestore, usando fallback');
  } catch (error) {
    console.error('❌ [FIRESTORE] Contact Page error:', error);
    console.warn('⚠️ [FALLBACK] Contact Page: Error detectado, usando fallback');
  }

  // Fallback data with clean structure
  const fallbackData: ContactPageData = {
      hero: {
        title: "Contáctanos",
        background_image: "/images/proyectos/EDUCACIÓN/Cibertec/_ARI2623.webp",
        subtitle: "Estamos aquí para ayudarte a transformar tus proyectos en realidad, cuidando cada detalle para garantizar su rentabilidad."
      },
      seo: {
        meta_description: "Contáctanos para iniciar tu proyecto de infraestructura. Equipo experto en dirección integral de proyectos con más de 15 años de experiencia en Perú.",
        meta_title: "Contacto - Métrica FM | Dirección Integral de Proyectos",
        keywords: [
          "contacto métrica dip",
          "dirección integral proyectos perú",
          "consultoría construcción lima",
          "gestión proyectos infraestructura",
          "contacto empresa construcción"
        ]
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
          items: [
            {
              icon: "MapPin",
              content: "Andrés Reyes 388, San Isidro",
              title: "Oficina Principal"
            },
            {
              title: "Teléfonos",
              content: "+51 1 719-5990\n+51 989 742 678 (WhatsApp)",
              icon: "Phone"
            },
            {
              content: "info@metrica-dip.com\ninfo@metricadip.com",
              title: "Email",
              icon: "Mail"
            },
            {
              content: "Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 1:00 PM",
              icon: "Clock",
              title: "Horarios de Atención"
            }
          ]
        },
        map: {
          show_placeholder: true,
          title: "Mapa Interactivo",
          subtitle: "Santiago de Surco, Lima",
          address: "Andrés Reyes 388, San Isidro, Lima",
          embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.747374654482!2d-77.05284708570265!3d-12.09724084509915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c834244b1e1b%3A0x7e8bbf4c5a4b1f2c!2sAndres%20Reyes%20388%2C%20San%20Isidro%2015036%2C%20Peru!5e0!3m2!1sen!2sus!4v1632920000000!5m2!1sen!2sus"
        },
        intro: {
          title: "Hablemos de Tu Proyecto",
          description: "Nuestro equipo de expertos está listo para asesorarte en cada etapa de tu proyecto de CONSTRUCCIÓN. Desde la conceptualización hasta la entrega final, estamos comprometidos con tu éxito."
        },
        process: {
          title: "Proceso de Contacto",
          steps: [
            {
              description: "Conversamos sobre tu proyecto y necesidades específicas",
              title: "Consulta Inicial",
              number: "1"
            },
            {
              title: "Propuesta Técnica",
              number: "2",
              description: "Desarrollamos una propuesta detallada y personalizada"
            },
            {
              title: "Inicio del Proyecto",
              number: "3",
              description: "Comenzamos a trabajar juntos en la ejecución de tu visión"
            }
          ]
        }
      }
    };

  return fallbackData;
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