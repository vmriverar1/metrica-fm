import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { ShoppingBag, Users, Lightbulb, MapPin } from 'lucide-react';

export default function ProyectosRetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Retail"
          subtitle="Centros comerciales y tiendas que crean experiencias de compra excepcionales"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
        />
        
        {/* Contenido específico de proyectos de retail */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Espacios Comerciales que Conectan</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Desarrollamos centros comerciales, tiendas departamentales y espacios retail que maximizan 
                la experiencia del cliente y optimizan el rendimiento comercial a través del diseño estratégico.
              </p>
            </div>

            {/* Características clave */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Experiencia de Compra</h3>
                <p className="text-muted-foreground text-sm">
                  Diseños que guían al cliente y crean ambientes atractivos para aumentar las ventas.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Flujo de Personas</h3>
                <p className="text-muted-foreground text-sm">
                  Circulaciones optimizadas que distribuyen eficientemente el tráfico de visitantes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Iluminación Estratégica</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas de iluminación que realzan productos y crean ambientes acogedores.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Ubicación Estratégica</h3>
                <p className="text-muted-foreground text-sm">
                  Análisis de ubicación y accesibilidad para maximizar la afluencia de clientes.
                </p>
              </div>
            </div>

            {/* Tipos de proyectos retail */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Proyectos Retail</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Centros Comerciales</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Malls regionales y super-regionales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros comerciales de barrio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Outlets y centros de descuento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Food courts y patios de comida</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Tiendas Especializadas</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Tiendas departamentales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Supermercados e hipermercados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Tiendas de mejoramiento del hogar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Showrooms automotrices</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Espacios Mixtos</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de entretenimiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Complejos retail-residencial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Retail con oficinas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros comerciales temáticos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Factores clave de diseño */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Factores Clave de Diseño</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Análisis de Mercado</h4>
                      <p className="text-muted-foreground text-sm">
                        Estudio del mercado objetivo, competencia y patrones de consumo para definir el mix comercial óptimo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Diseño Arquitectónico</h4>
                      <p className="text-muted-foreground text-sm">
                        Fachadas atractivas, espacios amplios y distribución eficiente que invite a recorrer y comprar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tecnología Integrada</h4>
                      <p className="text-muted-foreground text-sm">
                        Sistemas de climatización, seguridad, sonido y conectividad digital de última generación.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Sostenibilidad</h4>
                      <p className="text-muted-foreground text-sm">
                        Eficiencia energética, manejo de residuos y certificaciones ambientales para operación responsable.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Accesibilidad</h4>
                      <p className="text-muted-foreground text-sm">
                        Diseño universal, estacionamientos amplios y conexiones de transporte público eficientes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Flexibilidad</h4>
                      <p className="text-muted-foreground text-sm">
                        Espacios adaptables que permiten cambios en el mix comercial según evolución del mercado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de logros */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Impacto en Retail</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos desarrollado proyectos retail que transforman comunidades, generan empleo y dinamizan 
                la economía local, siempre con los más altos estándares de calidad y sostenibilidad.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">25+</div>
                  <div className="text-sm text-muted-foreground">Centros Comerciales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">150K</div>
                  <div className="text-sm text-muted-foreground">m² de Retail</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">5M+</div>
                  <div className="text-sm text-muted-foreground">Visitantes Anuales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">Ocupación Promedio</div>
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