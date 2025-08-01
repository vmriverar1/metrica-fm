import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Heart, Users, Shield, Zap } from 'lucide-react';

export default function ProyectosSaludPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Salud"
          subtitle="Infraestructura hospitalaria de vanguardia para el cuidado de la salud"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
        />
        
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Espacios que Salvan Vidas</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Desarrollamos hospitales, clínicas y centros de salud con los más altos estándares internacionales, 
                creando infraestructura que facilita la atención médica de calidad y mejora los resultados de salud.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Atención Integral</h3>
                <p className="text-muted-foreground text-sm">
                  Diseños que optimizan los flujos de pacientes y facilitan la atención médica.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Espacios Humanizados</h3>
                <p className="text-muted-foreground text-sm">
                  Ambientes que priorizan el bienestar emocional de pacientes y familias.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Bioseguridad</h3>
                <p className="text-muted-foreground text-sm">
                  Sistemas de control de infecciones y flujos separados para máxima seguridad.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Tecnología Médica</h3>
                <p className="text-muted-foreground text-sm">
                  Infraestructura preparada para equipos médicos de última generación.
                </p>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Proyectos de Salud</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Hospitales Generales</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hospitales públicos regionales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hospitales de tercer nivel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros médicos comunitarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Hospitales de emergencia</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Centros Especializados</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Institutos oncológicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros cardiovasculares</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de rehabilitación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Clínicas materno-infantiles</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Atención Primaria</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Postas médicas rurales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de salud urbanos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Policlínicos integrales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Consultorios especializados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Áreas Críticas Especializadas</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Servicios Críticos</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Unidades de Cuidados Intensivos</p>
                        <p className="text-sm text-muted-foreground">UCI neonatal, pediátrica y adultos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Quirófanos Especializados</p>
                        <p className="text-sm text-muted-foreground">Salas de cirugía con tecnología híbrida</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Servicios de Emergencia</p>
                        <p className="text-sm text-muted-foreground">Trauma center y atención de urgencias</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h4 className="text-lg font-semibold text-primary mb-4">Servicios de Apoyo</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Diagnóstico por Imágenes</p>
                        <p className="text-sm text-muted-foreground">Resonancia, tomografía y radiología</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Laboratorios Clínicos</p>
                        <p className="text-sm text-muted-foreground">Análisis clínicos y patología</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-foreground">Farmacia Hospitalaria</p>
                        <p className="text-sm text-muted-foreground">Preparación y dispensación de medicamentos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-16 bg-primary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Estándares y Certificaciones Médicas</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">MINSA</h4>
                  <p className="text-sm text-muted-foreground">Normativas del Ministerio de Salud</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">JCI</h4>
                  <p className="text-sm text-muted-foreground">Joint Commission International</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">OMS</h4>
                  <p className="text-sm text-muted-foreground">Estándares de la OMS</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary mb-2">NFPA</h4>
                  <p className="text-sm text-muted-foreground">Normativas de Seguridad</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Compromiso con la Salud</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos construido más de 25 establecimientos de salud que han mejorado el acceso a servicios médicos 
                de calidad para millones de peruanos, contribuyendo significativamente a la salud pública del país.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">25+</div>
                  <div className="text-sm text-muted-foreground">Establecimientos de Salud</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">2M+</div>
                  <div className="text-sm text-muted-foreground">Personas Beneficiadas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Camas Hospitalarias</div>
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