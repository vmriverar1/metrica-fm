import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

export default function CompromisoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Compromiso Social y Medioambiental"
          subtitle="Construimos un futuro sostenible con responsabilidad social y las mejores prácticas ambientales"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
        />
        
        {/* Contenido específico de la página */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-6">Nuestro Compromiso con el Futuro</h2>
              <p className="text-lg text-muted-foreground mb-8">
                En Métrica DIP entendemos que nuestro trabajo va más allá de la construcción de infraestructuras. 
                Tenemos la responsabilidad de contribuir al desarrollo sostenible del país, cuidando el medio ambiente 
                y generando un impacto positivo en las comunidades donde operamos.
              </p>
              
              <h3 className="text-2xl font-semibold text-primary mb-4">Responsabilidad Social</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-primary">Desarrollo Local</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Contratación de mano de obra local</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Capacitación técnica para la comunidad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Apoyo a proveedores regionales</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-primary">Impacto Comunitario</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Programas educativos en seguridad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Mejora de infraestructura comunitaria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Comunicación transparente con vecinos</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-primary mb-4">Compromiso Ambiental</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-primary">Gestión Ambiental</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Planes de manejo ambiental</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Monitoreo de calidad del aire y agua</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Gestión responsable de residuos</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-primary">Sostenibilidad</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Uso eficiente de recursos naturales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Tecnologías limpias y eficientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Compensación de huella de carbono</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-primary mb-4">Certificaciones y Estándares</h3>
              <p className="text-muted-foreground mb-6">
                Mantenemos las más altas certificaciones internacionales en gestión de calidad, medio ambiente 
                y seguridad ocupacional, garantizando que nuestros procesos cumplan con los estándares más exigentes 
                del sector construcción.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}