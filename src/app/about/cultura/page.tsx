import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

export default function CulturaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Cultura y Personas"
          subtitle="Un equipo multidisciplinario comprometido con la excelencia, innovación y desarrollo continuo"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/03.jpg"
        />
        
        {/* Contenido específico de la página */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-6">Nuestra Cultura Organizacional</h2>
              <p className="text-lg text-muted-foreground mb-8">
                En Métrica DIP, cultivamos un ambiente de trabajo que fomenta la innovación, la integridad y la excelencia. 
                Nuestro equipo multidisciplinario está comprometido con el desarrollo continuo y la búsqueda constante de 
                mejores prácticas en la gestión de proyectos de infraestructura.
              </p>
              
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestros Valores</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-primary">Excelencia:</strong> Buscamos la perfección en cada proyecto que emprendemos.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-primary">Innovación:</strong> Aplicamos las últimas tecnologías y metodologías del sector.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-primary">Integridad:</strong> Actuamos con transparencia y ética en todas nuestras relaciones.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-primary">Compromiso:</strong> Nos dedicamos completamente al éxito de nuestros clientes.
                  </div>
                </li>
              </ul>

              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Equipo</h3>
              <p className="text-muted-foreground mb-6">
                Contamos con profesionales altamente calificados en diversas disciplinas: ingeniería civil, 
                arquitectura, gestión de proyectos, control de calidad y supervisión técnica. Cada miembro 
                de nuestro equipo aporta su experiencia y conocimiento para garantizar resultados excepcionales.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}