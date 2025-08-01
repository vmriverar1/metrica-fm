import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Home, Users, TreePine, Shield } from 'lucide-react';

export default function ProyectosViviendaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Vivienda"
          subtitle="Complejos residenciales que ofrecen calidad de vida y bienestar"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
        />
        
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Hogares que Inspiran Vida</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Desarrollamos proyectos residenciales que combinan diseño contemporáneo, funcionalidad y sostenibilidad, 
                creando comunidades donde las familias peruanas pueden prosperar y construir su futuro.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Diseño Familiar</h3>
                <p className="text-muted-foreground text-sm">
                  Espacios pensados para el confort y crecimiento de las familias peruanas.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Vida Comunitaria</h3>
                <p className="text-muted-foreground text-sm">
                  Áreas comunes que fomentan la integración y el sentido de comunidad.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TreePine className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Espacios Verdes</h3>
                <p className="text-muted-foreground text-sm">
                  Jardines, parques y áreas naturales integradas al diseño urbano.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Seguridad Integral</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas de seguridad 24/7 y diseño urbano que promueve espacios seguros.
                </p>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Proyectos Residenciales</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Vivienda Social</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Conjuntos habitacionales del Estado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Programas de vivienda popular</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Proyectos Techo Propio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Viviendas de interés social</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Condominios Residenciales</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Torres de departamentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Condominios horizontales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Conjuntos cerrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Edificios multifamiliares</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Vivienda Premium</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Casas de campo y club</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Penthouses y áticos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Condominios exclusivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Desarrollos de lujo integrados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Servicios y Amenidades</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Áreas Comunes</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <span>• Clubhouse y salón social</span>
                    <span>• Piscinas familiares</span>
                    <span>• Gimnasios equipados</span>
                    <span>• Áreas de juegos infantiles</span>
                    <span>• Canchas deportivas</span>
                    <span>• Zonas de parrillas</span>
                    <span>• Jardines paisajísticos</span>
                    <span>• Senderos peatonales</span>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Servicios Integrados</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <span>• Seguridad 24/7</span>
                    <span>• Administración profesional</span>
                    <span>• Mantenimiento de áreas</span>
                    <span>• Estacionamientos</span>
                    <span>• Depósitos privados</span>
                    <span>• Servicios de conserjería</span>
                    <span>• Sistema de intercomunicadores</span>
                    <span>• Acceso controlado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Impacto en Vivienda</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos desarrollado más de 5,000 unidades de vivienda que han mejorado la calidad de vida de miles 
                de familias peruanas, contribuyendo al desarrollo urbano sostenible del país.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">5,000+</div>
                  <div className="text-sm text-muted-foreground">Unidades de Vivienda</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15K+</div>
                  <div className="text-sm text-muted-foreground">Familias Beneficiadas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">60</div>
                  <div className="text-sm text-muted-foreground">Proyectos Completados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfacción del Cliente</div>
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