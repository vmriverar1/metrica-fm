import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Factory, Cog, Shield, Truck } from 'lucide-react';

export default function ProyectosIndustriaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Industria"
          subtitle="Infraestructura industrial optimizada para procesos productivos eficientes"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/03.jpg"
        />
        
        {/* Contenido específico de proyectos industriales */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Infraestructura Industrial de Vanguardia</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Desarrollamos plantas industriales, centros de distribución y complejos manufactureros que optimizan 
                los procesos productivos y cumplen con los más altos estándares de seguridad y eficiencia operacional.
              </p>
            </div>

            {/* Características principales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Plantas Industriales</h3>
                <p className="text-muted-foreground text-sm">
                  Diseño especializado para procesos manufactureros con flujos de producción optimizados.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cog className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Eficiencia Operacional</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas automatizados y layouts que maximizan la productividad y minimizan costos.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Seguridad Industrial</h3>
                <p className="text-muted-foreground text-sm">
                  Cumplimiento estricto de normas de seguridad y salud ocupacional internacionales.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Logística Integrada</h3>
                <p className="text-muted-foreground text-sm">
                  Centros de distribución con sistemas de almacenaje y despacho de última generación.
                </p>
              </div>
            </div>

            {/* Sectores industriales */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Sectores Industriales</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Manufactura</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Plantas de producción alimentaria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fábricas textiles y confección</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Industria automotriz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Manufacturas especializadas</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Logística y Almacenaje</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de distribución automatizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Almacenes de alta rotación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Cámaras frigoríficas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Terminales de carga</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Industria Pesada</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Plantas químicas y petroquímicas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Acerías y metalúrgicas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Cementeras y minerales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Energía y utilities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Especializaciones técnicas */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Especializaciones Técnicas</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Sistemas Especializados</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Control de Procesos</p>
                        <p className="text-sm text-muted-foreground">Sistemas SCADA y automatización industrial</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Climatización Industrial</p>
                        <p className="text-sm text-muted-foreground">Control de temperatura, humedad y calidad del aire</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Tratamiento de Residuos</p>
                        <p className="text-sm text-muted-foreground">Sistemas de manejo y tratamiento de efluentes</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Infraestructura de Soporte</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Suministro Eléctrico</p>
                        <p className="text-sm text-muted-foreground">Subestaciones y sistemas de respaldo energético</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Sistemas contra Incendios</p>
                        <p className="text-sm text-muted-foreground">Detección, supresión y evacuación automatizada</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Accesos y Seguridad</p>
                        <p className="text-sm text-muted-foreground">Control de acceso y sistemas de vigilancia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificaciones y normativas */}
            <div className="mb-16 bg-primary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Certificaciones y Normativas</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">OHSAS 18001</h4>
                  <p className="text-sm text-muted-foreground">Seguridad y Salud Ocupacional</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Factory className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">ISO 14001</h4>
                  <p className="text-sm text-muted-foreground">Gestión Ambiental</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cog className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">HACCP</h4>
                  <p className="text-sm text-muted-foreground">Industria Alimentaria</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">LEED</h4>
                  <p className="text-sm text-muted-foreground">Construcción Sostenible</p>
                </div>
              </div>
            </div>

            {/* Resultados y logros */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Impacto Industrial</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos contribuido al desarrollo industrial del país con proyectos que generan empleo, 
                impulsan la productividad y cumplen con los más altos estándares ambientales y de seguridad.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">40+</div>
                  <div className="text-sm text-muted-foreground">Plantas Industriales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">800K</div>
                  <div className="text-sm text-muted-foreground">m² Construidos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15K+</div>
                  <div className="text-sm text-muted-foreground">Empleos Generados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Cumplimiento Normativo</div>
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