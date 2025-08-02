import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CulturaInteractiva from '@/components/cultura/CulturaInteractiva';
import HeroEquipo from '@/components/cultura/HeroEquipo';
import VisionMision from '@/components/cultura/VisionMision';
import ValoresCore from '@/components/cultura/ValoresCore';

export default function CulturaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero fusionado con galería del equipo */}
        <HeroEquipo
          title="Cultura y Personas"
          subtitle="Un equipo multidisciplinario comprometido con la excelencia, innovación y desarrollo continuo"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/03.jpg"
        />
        
        {/* Sección interactiva de cultura */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-alliance-extrabold text-primary mb-8 text-center">Nuestra Cultura Organizacional</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12 font-alliance-medium">
              La cultura que nos define y los valores que guían cada proyecto que emprendemos
            </p>
            
            {/* Componente interactivo de cultura */}
            <CulturaInteractiva />
          </div>
        </section>

        {/* Sección Visión y Misión */}
        <VisionMision />

        {/* Sección Valores Core */}
        <ValoresCore />

        {/* Sección adicional del equipo */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-alliance-extrabold text-primary mb-6">Nuestro Compromiso</h3>
              <p className="text-lg text-muted-foreground mb-8 font-alliance-medium leading-relaxed">
                Contamos con profesionales altamente calificados en diversas disciplinas: ingeniería civil, 
                arquitectura, gestión de proyectos, control de calidad y supervisión técnica. Cada miembro 
                de nuestro equipo aporta su experiencia y conocimiento para garantizar resultados excepcionales.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">15+</span>
                  </div>
                  <h4 className="text-xl font-alliance-extrabold text-primary mb-2">Años de Experiencia</h4>
                  <p className="text-muted-foreground font-alliance-medium">Consolidando nuestra expertise en el mercado peruano</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">50+</span>
                  </div>
                  <h4 className="text-xl font-alliance-extrabold text-primary mb-2">Profesionales</h4>
                  <p className="text-muted-foreground font-alliance-medium">Equipo multidisciplinario altamente capacitado</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">100%</span>
                  </div>
                  <h4 className="text-xl font-alliance-extrabold text-primary mb-2">Compromiso</h4>
                  <p className="text-muted-foreground font-alliance-medium">Dedicación total en cada proyecto que emprendemos</p>
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