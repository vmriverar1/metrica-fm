import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Building2, Users, Zap, Shield } from 'lucide-react';

export default function ProyectosOficinaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Oficina"
          subtitle="Espacios corporativos modernos y funcionales que potencian la productividad"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
        />
        
        {/* Contenido específico de proyectos de oficina */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Espacios Corporativos de Vanguardia</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Diseñamos y construimos oficinas que reflejan la identidad corporativa, fomentan la colaboración 
                y optimizan el rendimiento empresarial a través de soluciones arquitectónicas innovadoras.
              </p>
            </div>

            {/* Características principales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Diseño Moderno</h3>
                <p className="text-muted-foreground text-sm">
                  Arquitectura contemporánea que refleja la imagen corporativa y valores de la empresa.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Espacios Colaborativos</h3>
                <p className="text-muted-foreground text-sm">
                  Áreas diseñadas para fomentar la colaboración, creatividad y comunicación efectiva.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Eficiencia Energética</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas inteligentes que optimizan el consumo energético y reducen costos operativos.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Seguridad Integral</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas de seguridad avanzados que protegen personas, información y activos.
                </p>
              </div>
            </div>

            {/* Tipos de proyectos */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Proyectos Corporativos</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Torres Corporativas</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Edificios de altura con oficinas premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Sistemas de climatización inteligente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Ascensores de alta velocidad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fachadas de vidrio de última generación</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Complejos Empresariales</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Campus corporativos integrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Áreas verdes y espacios de recreación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Estacionamientos subterráneos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Servicios complementarios integrados</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Oficinas Especializadas</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de datos y servidores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Salas de juntas de alta tecnología</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Espacios de coworking flexibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Laboratorios y áreas técnicas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Proyectos destacados */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Proyectos Destacados</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-primary mb-2">Torre Empresarial San Isidro</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Edificio corporativo de 25 pisos con certificación LEED Gold, featuring espacios de trabajo 
                      colaborativo y tecnología de punta.
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">25 pisos</span>
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded">LEED Gold</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">15,000 m²</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20"></div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-primary mb-2">Campus Corporativo La Molina</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Complejo empresarial sustentable con múltiples edificios, áreas verdes y servicios integrados 
                      para 2,000 colaboradores.
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">4 edificios</span>
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded">Sustentable</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">28,000 m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nuestra experiencia */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestra Experiencia en Proyectos Corporativos</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Con más de una década de experiencia, hemos desarrollado más de 50 proyectos corporativos, 
                desde oficinas boutique hasta complejos empresariales de gran escala, siempre priorizando 
                la funcionalidad, sostenibilidad y bienestar de los usuarios.
              </p>
              
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Proyectos Completados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">500K</div>
                  <div className="text-sm text-muted-foreground">m² Construidos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15+</div>
                  <div className="text-sm text-muted-foreground">Años de Experiencia</div>
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