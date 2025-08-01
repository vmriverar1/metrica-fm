import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { GraduationCap, Users, BookOpen, Lightbulb } from 'lucide-react';

export default function ProyectosEducacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Proyectos de Educación"
          subtitle="Instituciones educativas que inspiran el aprendizaje y desarrollo"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/05.jpg"
        />
        
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Espacios que Transforman la Educación</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Diseñamos y construimos instituciones educativas modernas que fomentan el aprendizaje colaborativo, 
                la innovación pedagógica y el desarrollo integral de estudiantes de todas las edades.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Aprendizaje Integral</h3>
                <p className="text-muted-foreground text-sm">
                  Ambientes diseñados para diferentes metodologías de enseñanza y aprendizaje.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Espacios Colaborativos</h3>
                <p className="text-muted-foreground text-sm">
                  Áreas que fomentan la interacción y el trabajo en equipo entre estudiantes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Recursos Modernos</h3>
                <p className="text-muted-foreground text-sm">
                  Bibliotecas, laboratorios y aulas equipadas con tecnología de vanguardia.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Innovación Pedagógica</h3>
                <p className="text-muted-foreground text-sm">
                  Diseños flexibles que se adaptan a nuevas metodologías educativas.
                </p>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Tipos de Instituciones Educativas</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Educación Básica</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Jardines de infancia y preescolar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Colegios de primaria y secundaria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Instituciones educativas rurales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Colegios bilingües internacionales</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Educación Superior</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Universidades públicas y privadas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Institutos técnicos superiores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de investigación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Campus universitarios</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-primary mb-3">Educación Especializada</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de educación especial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Institutos de artes y música</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Centros de capacitación técnica</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>Academias deportivas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">Nuestro Compromiso con la Educación</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Hemos construido más de 80 instituciones educativas que han beneficiado a miles de estudiantes, 
                contribuyendo al desarrollo educativo del país con infraestructura de calidad y ambientes inspiradores.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">80+</div>
                  <div className="text-sm text-muted-foreground">Instituciones Educativas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                  <div className="text-sm text-muted-foreground">Estudiantes Beneficiados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">300K</div>
                  <div className="text-sm text-muted-foreground">m² Construidos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15</div>
                  <div className="text-sm text-muted-foreground">Regiones del País</div>
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