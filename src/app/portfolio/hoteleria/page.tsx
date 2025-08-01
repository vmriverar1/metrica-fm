import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Hotel, Star, Wifi, Car } from 'lucide-react';

export default function ProyectosHoteleriaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Hotelería"
          subtitle="Hoteles y complejos turísticos que combinan confort y elegancia"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/04.jpg"
        />
        
        {/* Contenido específico de proyectos hoteleros */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Experiencias Hoteleras Excepcionales</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Desarrollamos hoteles, resorts y complejos turísticos que crean experiencias memorables para huéspedes, 
                optimizando la operatividad y maximizando la rentabilidad a través del diseño estratégico.
              </p>
            </div>

            {/* Características principales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hotel className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Diseño Hospitalario</h3>
                <p className="text-muted-foreground text-sm">
                  Espacios que generan bienestar y crean conexiones emocionales con los huéspedes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Experiencia Premium</h3>
                <p className="text-muted-foreground text-sm">
                  Servicios de lujo y comodidades que superan las expectativas de los huéspedes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Tecnología Integrada</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas inteligentes que mejoran la operación y la experiencia del huésped.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Servicios Completos</h3>
                <p className="text-muted-foreground text-sm">
                  Facilidades integrales desde estacionamiento hasta centros de entretenimiento.
                </p>
              </div>
            </div>

            {/* Tipos de proyectos hoteleros */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Proyectos Hoteleros</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Hoteles Urbanos</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hoteles de negocios ejecutivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hoteles boutique de lujo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Cadenas hoteleras internacionales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Apart-hoteles residenciales</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Resorts y Complejos</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Resorts de playa all-inclusive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Lodges de montaña y naturaleza</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Complejos turísticos familiares</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de convenciones</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Hoteles Especializados</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Spa hotels y wellness retreats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hoteles gastronómicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Eco-lodges sostenibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hoteles temáticos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Áreas especializadas */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Áreas Especializadas del Hotel</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg p-6 shadow-sm border">
                    <h4 className="text-lg font-semibold text-primary mb-3">Áreas Públicas</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <span>• Lobby y recepción</span>
                      <span>• Restaurantes gourmet</span>
                      <span>• Bares y lounges</span>
                      <span>• Salones de eventos</span>
                      <span>• Centros de negocios</span>
                      <span>• Áreas de recreación</span>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-6 shadow-sm border">
                    <h4 className="text-lg font-semibold text-primary mb-3">Servicios Wellness</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <span>• Spa y tratamientos</span>
                      <span>• Gimnasios equipados</span>
                      <span>• Piscinas climatizadas</span>
                      <span>• Saunas y jacuzzis</span>
                      <span>• Canchas deportivas</span>
                      <span>• Jardines zen</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-card rounded-lg p-6 shadow-sm border">
                    <h4 className="text-lg font-semibold text-primary mb-3">Áreas Operativas</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <span>• Cocinas industriales</span>
                      <span>• Áreas de lavandería</span>
                      <span>• Almacenes y depósitos</span>
                      <span>• Oficinas administrativas</span>
                      <span>• Áreas de personal</span>
                      <span>• Sistemas técnicos</span>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-6 shadow-sm border">
                    <h4 className="text-lg font-semibold text-primary mb-3">Habitaciones</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <span>• Suites presidenciales</span>
                      <span>• Habitaciones ejecutivas</span>
                      <span>• Habitaciones estándar</span>
                      <span>• Habitaciones familiares</span>
                      <span>• Habitaciones accesibles</span>
                      <span>• Villas privadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estándares y certificaciones */}
            <div className="mb-16 bg-primary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Estándares Hoteleros Internacionales</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">5⭐</div>
                  <h4 className="font-semibold text-primary mb-2">Clasificación</h4>
                  <p className="text-sm text-muted-foreground">Estándares de lujo internacional</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">LEED</div>
                  <h4 className="font-semibold text-primary mb-2">Sostenibilidad</h4>
                  <p className="text-sm text-muted-foreground">Construcción verde certificada</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">AAA</div>
                  <h4 className="font-semibold text-primary mb-2">Calidad</h4>
                  <p className="text-sm text-muted-foreground">Servicios de máxima calidad</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">ISO</div>
                  <h4 className="font-semibold text-primary mb-2">Gestión</h4>
                  <p className="text-sm text-muted-foreground">Sistemas de calidad certificados</p>
                </div>
              </div>
            </div>

            {/* Logros y estadísticas */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Legado Hotelero</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos contribuido al desarrollo turístico del país con hoteles que generan experiencias únicas, 
                impulsan el turismo local y establecen nuevos estándares de hospitalidad y confort.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15+</div>
                  <div className="text-sm text-muted-foreground">Hoteles Construidos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">2,500</div>
                  <div className="text-sm text-muted-foreground">Habitaciones Totales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">90%+</div>
                  <div className="text-sm text-muted-foreground">Ocupación Promedio</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Rating Promedio</div>
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