import { Metadata } from 'next';
import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { CompromisoPageData } from '@/types/compromiso';
import { 
  Users, 
  Heart, 
  Leaf, 
  Recycle, 
  Award, 
  Shield, 
  TreePine, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Thermometer 
} from 'lucide-react';
import { PagesService } from '@/lib/firestore/pages-service';

interface CompromisoPageProps {
  data: CompromisoPageData;
}

const iconMap = {
  Users,
  Heart,
  Leaf,
  Recycle,
  Award,
  Shield,
  TreePine,
  Building2,
  GraduationCap,
  Briefcase,
  Thermometer
};

export const metadata: Metadata = {
  title: 'Compromiso Social y Medioambiental | Métrica FM',
  description: 'Nuestro compromiso con el desarrollo sostenible, responsabilidad social y las mejores prácticas ambientales en la industria de la construcción.',
};

async function getCompromisoData(): Promise<CompromisoPageData> {
  try {
    // First try to load from Firestore
    const firestoreData = await PagesService.getCompromisoPage();
    if (firestoreData) {
      return firestoreData as CompromisoPageData;
    }

    // Fallback to API if Firestore fails
    const response = await fetch('/api/admin/pages/compromiso', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch compromiso data: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to load compromiso data');
    }

    return result.data;
  } catch (error) {
    console.error('Error loading compromiso data:', error);
    throw error;
  }
}

function CompromisoContent({ data }: CompromisoPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          backgroundImage={data.hero.background_image}
        />
        
        {/* Introducción */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">{data.main_content.introduction.title}</h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                {data.main_content.introduction.description}
              </p>
            </div>

            {/* Secciones principales */}
            {data.main_content.sections.map((section) => (
              <div key={section.id} className="mb-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-semibold text-primary mb-4">{section.title}</h3>
                  <p className="text-accent font-medium mb-4">{section.subtitle}</p>
                  <p className="text-muted-foreground max-w-3xl mx-auto">{section.description}</p>
                </div>

                {/* Pillars */}
                {section.pillars && (
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {section.pillars.map((pillar, index) => {
                      const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
                      return (
                        <div key={index} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            {IconComponent && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${pillar.color}20` }}>
                                <IconComponent className="w-6 h-6" style={{ color: pillar.color }} />
                              </div>
                            )}
                            <h4 className="text-xl font-semibold text-primary">{pillar.title}</h4>
                          </div>
                          
                          <div className="space-y-4">
                            <ul className="space-y-2">
                              {pillar.initiatives.map((initiative, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pillar.color }}></div>
                                  <span>{initiative}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="pt-4 border-t border-border">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                {Object.entries(pillar.metrics).map(([key, value]) => {
                                  const metricLabels: Record<string, string> = {
                                    'local_hiring': 'Contratación Local',
                                    'local_suppliers': 'Proveedores Locales',
                                    'beneficiaries': 'Beneficiarios',
                                    'safety_programs': 'Programas de Seguridad',
                                    'community_projects': 'Proyectos Comunitarios',
                                    'training_hours': 'Horas de Capacitación'
                                  };

                                  return (
                                    <div key={key}>
                                      <div className="text-lg font-bold text-primary">{value}</div>
                                      <div className="text-xs text-muted-foreground">{metricLabels[key] || key.replace('_', ' ')}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Case Studies */}
                {section.case_studies && (
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {section.case_studies.map((caseStudy, index) => (
                      <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-lg transition-shadow">
                        <div 
                          className="h-48 bg-cover bg-center"
                          style={{ backgroundImage: `url("${caseStudy.image}")` }}
                        />
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-primary mb-2">{caseStudy.title}</h4>
                          <p className="text-muted-foreground mb-3">{caseStudy.description}</p>
                          <div className="bg-accent/10 rounded-lg p-3">
                            <p className="text-accent font-medium text-sm">{caseStudy.impact}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Environmental Programs */}
                {section.environmental_programs && (
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {section.environmental_programs.map((program, index) => (
                      <div key={index} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-shadow">
                        <h4 className="text-lg font-semibold text-primary mb-3">{program.title}</h4>
                        <p className="text-muted-foreground mb-4 text-sm">{program.description}</p>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-green-700 font-medium text-sm">{program.achievement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {section.certifications && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {section.certifications.map((cert, index) => {
                      const IconComponent = iconMap[cert.icon as keyof typeof iconMap];
                      return (
                        <div key={index} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-all duration-300 text-center">
                          {IconComponent && (
                            <div className="flex justify-center mb-4">
                              <div className="p-3 rounded-full" style={{ backgroundColor: `${cert.color}20` }}>
                                <IconComponent className="w-8 h-8" style={{ color: cert.color }} />
                              </div>
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-primary mb-2">{cert.name}</h4>
                          <p className="text-xs text-accent mb-2">{cert.category}</p>
                          <p className="text-xs text-muted-foreground mb-3">{cert.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <div>Obtenida: {cert.year_obtained}</div>
                            <div>Válida hasta: {cert.validity}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Standards */}
                {section.standards && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {section.standards.map((standard, index) => (
                      <div key={index} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-shadow">
                        <h4 className="text-lg font-semibold text-primary mb-2">{standard.name}</h4>
                        <p className="text-muted-foreground mb-3 text-sm">{standard.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cumplimiento:</span>
                          <span className="text-accent font-semibold">{standard.compliance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Impact Metrics */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.impact_metrics.title}</h3>
                <p className="text-muted-foreground">{data.impact_metrics.subtitle}</p>
              </div>
              
              <div className="space-y-12">
                {data.impact_metrics.categories.map((category, index) => {
                  const IconComponent = iconMap[category.icon as keyof typeof iconMap];
                  return (
                    <div key={index} className="bg-card rounded-lg p-8 shadow-sm border">
                      <div className="flex items-center gap-3 mb-6">
                        {IconComponent && (
                          <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                            <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                          </div>
                        )}
                        <h4 className="text-xl font-semibold text-primary">{category.title}</h4>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        {category.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                            <div className="text-sm font-semibold text-foreground mb-1">{metric.label}</div>
                            <div className="text-xs text-muted-foreground">{metric.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sustainability Goals */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.sustainability_goals.title}</h3>
                <p className="text-accent font-medium mb-4">{data.sustainability_goals.subtitle}</p>
                <p className="text-muted-foreground max-w-3xl mx-auto">{data.sustainability_goals.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.sustainability_goals.goals.map((goal) => {
                  const IconComponent = iconMap[goal.icon as keyof typeof iconMap];
                  return (
                    <div key={goal.number} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: goal.color }}>
                          {goal.number}
                        </div>
                        {IconComponent && (
                          <IconComponent className="w-5 h-5" style={{ color: goal.color }} />
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-primary mb-2">{goal.title}</h4>
                      <p className="text-muted-foreground mb-4 text-sm">{goal.description}</p>
                      
                      <div className="space-y-2">
                        {goal.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: goal.color }}></div>
                            <span>{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Future Commitments */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-4">{data.future_commitments.title}</h3>
                <p className="text-white/90 mb-2">{data.future_commitments.subtitle}</p>
                <p className="text-white/80 max-w-3xl mx-auto">{data.future_commitments.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {data.future_commitments.commitments.map((commitment, index) => {
                  const IconComponent = iconMap[commitment.icon as keyof typeof iconMap];
                  return (
                    <div key={index} className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <span className="text-white font-bold">{commitment.year}</span>
                        </div>
                        {IconComponent && (
                          <IconComponent className="w-5 h-5 text-white" />
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-2">{commitment.title}</h4>
                      <p className="text-white/80 mb-4 text-sm">{commitment.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">Progreso:</span>
                          <span className="text-white font-semibold">{commitment.progress}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all duration-500"
                            style={{ width: `${commitment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function CompromisoPage() {
  const data = await getCompromisoData();
  return <CompromisoContent data={data} />;
}