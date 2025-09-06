import { Metadata } from 'next';
import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { 
  Heart, 
  GraduationCap, 
  Truck, 
  Home,
  Building2,
  Building,
  Settings,
  Award,
  Shield,
  TrendingUp,
  Cpu,
  Star,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { readPublicJSONAsync } from '@/lib/json-reader';

interface ClientesData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback: string;
  };
  introduction: {
    title: string;
    description: string;
    stats: {
      total_clients: string;
      public_sector: string;
      private_sector: string;
      years_experience: string;
    };
  };
  client_sectors: any[];
  testimonials: {
    title: string;
    subtitle: string;
    testimonials_list: any[];
  };
  client_benefits: {
    title: string;
    subtitle: string;
    benefits: any[];
  };
  success_metrics: {
    title: string;
    subtitle: string;
    metrics: any[];
  };
}

const iconMap = {
  Heart,
  GraduationCap,
  Truck,
  Home,
  Building2,
  Building,
  Settings,
  Award,
  Shield,
  TrendingUp,
  Cpu,
  Star,
  Users,
  Clock,
  Target
};

export const metadata: Metadata = {
  title: 'Nuestros Clientes | Métrica FM',
  description: 'Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo en dirección integral de proyectos de infraestructura.',
};

async function getClientesData(): Promise<ClientesData> {
  return readPublicJSONAsync<ClientesData>('/json/pages/clientes.json');
}

function ClientesContent({ data }: { data: ClientesData }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          backgroundImage={data.hero.background_image}
        />
        
        {/* Introducción y estadísticas */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">{data.introduction.title}</h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
                {data.introduction.description}
              </p>
              
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{data.introduction.stats.total_clients}</div>
                  <div className="text-sm text-muted-foreground">Clientes Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{data.introduction.stats.public_sector}</div>
                  <div className="text-sm text-muted-foreground">Sector Público</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{data.introduction.stats.private_sector}</div>
                  <div className="text-sm text-muted-foreground">Sector Privado</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{data.introduction.stats.years_experience}</div>
                  <div className="text-sm text-muted-foreground">Años de Experiencia</div>
                </div>
              </div>
            </div>

            {/* Client Sectors */}
            {data.client_sectors.map((sector, sectorIndex) => (
              <div key={sector.id} className="mb-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-semibold text-primary mb-4">{sector.title}</h3>
                  <p className="text-accent font-medium mb-4">{sector.subtitle}</p>
                  <p className="text-muted-foreground max-w-3xl mx-auto">{sector.description}</p>
                </div>

                {/* Sector Público - Clients */}
                {sector.clients && (
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {sector.clients.map((client: any, index: number) => {
                      const IconComponent = iconMap[client.icon as keyof typeof iconMap];
                      return (
                        <div key={client.id} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            {IconComponent && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${client.color}20` }}>
                                <IconComponent className="w-6 h-6" style={{ color: client.color }} />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xl font-semibold text-primary">{client.name}</h4>
                              <p className="text-sm text-muted-foreground">{client.full_name}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{client.description}</p>
                          
                          <div className="mb-4">
                            <p className="text-sm font-medium text-primary mb-2">{client.projects_count} proyectos realizados</p>
                            {client.specialties && (
                              <div className="flex flex-wrap gap-1">
                                {client.specialties.map((specialty: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {client.key_projects && (
                            <div>
                              <h5 className="text-sm font-semibold text-primary mb-2">Proyectos Clave:</h5>
                              <div className="space-y-2">
                                {client.key_projects.slice(0, 2).map((project: any, idx: number) => (
                                  <div key={idx} className="text-xs text-muted-foreground">
                                    <div className="font-medium">{project.name}</div>
                                    <div className="flex justify-between">
                                      <span>{project.value}</span>
                                      <span className={project.status === 'Completado' ? 'text-green-600' : 'text-blue-600'}>
                                        {project.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sector Privado - Categories */}
                {sector.categories && (
                  <div className="space-y-12">
                    {sector.categories.map((category: any, catIndex: number) => {
                      const IconComponent = iconMap[category.icon as keyof typeof iconMap];
                      return (
                        <div key={category.id} className="bg-card rounded-lg p-8 shadow-sm border">
                          <div className="flex items-center gap-3 mb-6">
                            {IconComponent && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                                <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xl font-semibold text-primary">{category.title}</h4>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Clients */}
                            <div>
                              <h5 className="text-sm font-semibold text-primary mb-4">Clientes Principales:</h5>
                              <div className="grid grid-cols-2 gap-3">
                                {category.clients.map((client: any, idx: number) => (
                                  <div key={idx} className="bg-muted rounded p-3">
                                    <div className="font-medium text-sm">{client.name}</div>
                                    <div className="text-xs text-muted-foreground">{client.projects} proyectos</div>
                                    <div className="text-xs text-muted-foreground mt-1">{client.specialization}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Services */}
                            <div>
                              <h5 className="text-sm font-semibold text-primary mb-4">Servicios Proporcionados:</h5>
                              <ul className="space-y-2">
                                {category.services.map((service: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }}></div>
                                    <span>{service}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Key Projects */}
                          {category.key_projects && (
                            <div className="mt-6 pt-6 border-t border-border">
                              <h5 className="text-sm font-semibold text-primary mb-4">Proyectos Destacados:</h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                {category.key_projects.map((project: any, idx: number) => (
                                  <div key={idx} className="bg-muted rounded p-4">
                                    <div className="font-medium text-sm mb-1">{project.name}</div>
                                    <div className="text-xs text-muted-foreground">Cliente: {project.client}</div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-xs font-medium">{project.value}</span>
                                      <span className={`text-xs px-2 py-1 rounded ${project.status === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {project.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sector Stats */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mt-8">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{sector.total_investment}</div>
                      <div className="text-sm text-muted-foreground">Inversión Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{sector.active_projects}</div>
                      <div className="text-sm text-muted-foreground">Proyectos Activos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{sector.completed_projects}</div>
                      <div className="text-sm text-muted-foreground">Proyectos Completados</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Testimonials */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.testimonials.title}</h3>
                <p className="text-muted-foreground">{data.testimonials.subtitle}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.testimonials.testimonials_list.map((testimonial) => (
                  <div key={testimonial.id} className="bg-card rounded-lg p-6 shadow-sm border">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="border-t pt-4">
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                      <div className="text-xs text-accent">{testimonial.project}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Benefits */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.client_benefits.title}</h3>
                <p className="text-muted-foreground">{data.client_benefits.subtitle}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.client_benefits.benefits.map((benefit) => {
                  const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
                  return (
                    <div key={benefit.id} className="text-center">
                      {IconComponent && (
                        <div className="flex justify-center mb-4">
                          <div className="p-4 rounded-full" style={{ backgroundColor: `${benefit.color}20` }}>
                            <IconComponent className="w-8 h-8" style={{ color: benefit.color }} />
                          </div>
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-primary mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{benefit.description}</p>
                      <div className="space-y-1">
                        {benefit.metrics.map((metric: string, idx: number) => (
                          <div key={idx} className="text-xs text-muted-foreground">• {metric}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Metrics */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-4">{data.success_metrics.title}</h3>
                <p className="text-white/90">{data.success_metrics.subtitle}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.success_metrics.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                    <div className="text-sm font-semibold text-white/90 mb-1">{metric.category}</div>
                    <div className="text-xs text-white/80 mb-2">{metric.description}</div>
                    <div className="text-xs text-accent font-medium">{metric.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function ClientesPage() {
  const data = await getClientesData();
  return <ClientesContent data={data} />;
}