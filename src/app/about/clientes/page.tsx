import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

export default function ClientesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Nuestros Clientes"
          subtitle="Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/04.jpg"
        />
        
        {/* Contenido específico de la página */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-6">Clientes que Confían en Nosotros</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                A lo largo de más de una década, hemos construido relaciones sólidas con organismos públicos 
                y empresas privadas líderes en el sector construcción e infraestructura del Perú.
              </p>
            </div>

            {/* Sector Público */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Sector Público</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">MINSA</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Ministerio de Salud</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">MINEDU</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Ministerio de Educación</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">MTC</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Min. Transportes y Comunicaciones</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">MVCS</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Min. Vivienda, Construcción y Saneamiento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sector Privado */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Sector Privado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Constructoras Líderes</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Empresas constructoras nacionales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Consorcios de construcción</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Empresas de ingeniería</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Desarrolladores Inmobiliarios</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Proyectos residenciales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Complejos comerciales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Edificaciones corporativas</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Empresas de Servicios</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Empresas de saneamiento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Concesionarias viales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      <span>Empresas de energía</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Testimonios */}
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Lo que Dicen de Nosotros</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <blockquote className="bg-background rounded-lg p-6 shadow-sm">
                  <p className="text-muted-foreground italic mb-4">
                    "Métrica DIP ha demostrado un nivel excepcional de profesionalismo y expertise técnico 
                    en la supervisión de nuestros proyectos hospitalarios. Su compromiso con la calidad 
                    es invaluable."
                  </p>
                  <footer className="text-sm font-medium text-primary">
                    — Director de Infraestructura, MINSA
                  </footer>
                </blockquote>
                
                <blockquote className="bg-background rounded-lg p-6 shadow-sm">
                  <p className="text-muted-foreground italic mb-4">
                    "La dirección integral de proyectos que proporciona Métrica nos ha permitido cumplir 
                    con los cronogramas más exigentes manteniendo los más altos estándares de calidad."
                  </p>
                  <footer className="text-sm font-medium text-primary">
                    — Gerente General, Constructora Líder
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}