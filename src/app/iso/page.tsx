import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { CheckCircle, Award, Users, Zap } from 'lucide-react';

export default function ISOPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="ISO 9001"
          subtitle="Certificación internacional en Sistemas de Gestión de Calidad que garantiza la excelencia en nuestros procesos"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
        />
        
        {/* Contenido específico de la página ISO */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Introducción */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Certificación ISO 9001:2015</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                Métrica DIP cuenta con la certificación ISO 9001:2015, el estándar internacional más reconocido 
                para Sistemas de Gestión de Calidad. Esta certificación avala nuestro compromiso con la mejora 
                continua y la satisfacción del cliente.
              </p>
              
              <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-8 py-4">
                <Award className="w-8 h-8 text-primary" />
                <span className="text-xl font-semibold text-primary">Certificado ISO 9001:2015</span>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Calidad Garantizada</h3>
                <p className="text-muted-foreground text-sm">
                  Procesos estandarizados que aseguran la consistencia y excelencia en cada proyecto.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Satisfacción del Cliente</h3>
                <p className="text-muted-foreground text-sm">
                  Enfoque sistemático para superar las expectativas de nuestros clientes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Mejora Continua</h3>
                <p className="text-muted-foreground text-sm">
                  Evaluación y optimización constante de nuestros procesos y servicios.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Reconocimiento Internacional</h3>
                <p className="text-muted-foreground text-sm">
                  Validación externa de nuestros estándares de calidad y profesionalismo.
                </p>
              </div>
            </div>

            {/* Alcance de la Certificación */}
            <div className="bg-card rounded-2xl p-8 mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-6">Alcance de Nuestra Certificación</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-4">Servicios Certificados</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Dirección Integral de Proyectos de Infraestructura</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Supervisión y Control de Calidad</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Gestión de Proyectos de Construcción</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Consultoría en Ingeniería Civil</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-4">Sectores de Aplicación</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Infraestructura Hospitalaria y de Salud</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Proyectos Educativos e Institucionales</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Infraestructura Vial y de Transporte</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Saneamiento y Servicios Públicos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Principios de Gestión de Calidad */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Principios de Gestión de Calidad ISO 9001</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">1. Enfoque al Cliente</h4>
                  <p className="text-muted-foreground text-sm">
                    Comprendemos y satisfacemos los requisitos del cliente, esforzándonos por exceder sus expectativas.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">2. Liderazgo</h4>
                  <p className="text-muted-foreground text-sm">
                    Nuestros líderes establecen la unidad de propósito y dirección, creando condiciones para el éxito.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">3. Compromiso de las Personas</h4>
                  <p className="text-muted-foreground text-sm">
                    Las personas competentes, empoderadas y comprometidas son esenciales para crear valor.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">4. Enfoque por Procesos</h4>
                  <p className="text-muted-foreground text-sm">
                    Gestionamos nuestras actividades como procesos interrelacionados para mayor eficiencia.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">5. Mejora Continua</h4>
                  <p className="text-muted-foreground text-sm">
                    La mejora continua del desempeño global es un objetivo permanente de la organización.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">6. Toma de Decisiones Basada en Evidencia</h4>
                  <p className="text-muted-foreground text-sm">
                    Las decisiones basadas en el análisis de datos e información son más efectivas.
                  </p>
                </div>
              </div>
            </div>

            {/* Compromiso con la Calidad */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Compromiso con la Calidad</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                La certificación ISO 9001:2015 no es solo un reconocimiento, sino un compromiso diario con la excelencia. 
                Cada proyecto que desarrollamos está respaldado por procesos rigurosos, controles de calidad sistemáticos 
                y la búsqueda constante de la mejora continua.
              </p>
              
              <div className="inline-flex items-center gap-4 bg-background rounded-full px-8 py-4 shadow-sm">
                <Award className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Certificado desde 2015 • Auditorías anuales superadas exitosamente</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}