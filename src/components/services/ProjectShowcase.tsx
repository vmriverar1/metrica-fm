'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Filter,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface Project {
  id: string;
  title: string;
  service: string;
  category: string;
  image: string;
  location: string;
  area: string;
  budget: string;
  year: string;
  status: 'completed' | 'ongoing';
  description: string;
  achievements: string[];
  link: string;
  serviceType: 'consultoria' | 'gestion' | 'supervision' | 'desarrollo';
}

const projects: Project[] = [
  {
    id: 'torre-san-isidro',
    title: 'Torre Corporativa San Isidro',
    service: 'Gestión Integral',
    category: 'Oficinas',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
    location: 'San Isidro, Lima',
    area: '45,000 m²',
    budget: 'S/ 120M',
    year: '2023',
    status: 'completed',
    description: 'Torre corporativa clase A+ con certificación LEED Gold y tecnología BIM 5D.',
    achievements: [
      '15% bajo presupuesto',
      '2 meses adelantado',
      'LEED Gold certificado'
    ],
    link: '/portfolio/oficina/torre-san-isidro',
    serviceType: 'gestion'
  },
  {
    id: 'plaza-norte-retail',
    title: 'Centro Comercial Plaza Norte',
    service: 'Supervisión Técnica',
    category: 'Retail',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&h=400&fit=crop',
    location: 'Independencia, Lima',
    area: '80,000 m²',
    budget: 'S/ 200M',
    year: '2022',
    status: 'completed',
    description: 'Supervisión integral de expansión del centro comercial más grande del norte de Lima.',
    achievements: [
      'Cero accidentes laborales',
      '99.8% calidad técnica',
      'ISO 9001 compliance'
    ],
    link: '/portfolio/retail/plaza-norte',
    serviceType: 'supervision'
  },
  {
    id: 'hotel-miraflores',
    title: 'Hotel Boutique Miraflores',
    service: 'Consultoría Estratégica',
    category: 'Hotelería',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    location: 'Miraflores, Lima',
    area: '12,000 m²',
    budget: 'S/ 45M',
    year: '2024',
    status: 'ongoing',
    description: 'Consultoría integral para desarrollo de hotel boutique de lujo frente al mar.',
    achievements: [
      'ROI proyectado 28%',
      'Fast-track approvals',
      'Design optimization'
    ],
    link: '/portfolio/hoteleria/hotel-miraflores',
    serviceType: 'consultoria'
  },
  {
    id: 'residential-surco',
    title: 'Condominio Premium Surco',
    service: 'Desarrollo Inmobiliario',
    category: 'Vivienda',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
    location: 'Santiago de Surco, Lima',
    area: '25,000 m²',
    budget: 'S/ 85M',
    year: '2023',
    status: 'completed',
    description: 'Desarrollo integral de condominio residencial premium con áreas verdes.',
    achievements: [
      '100% pre-venta',
      '25% ROI efectivo',
      'Certificación EDGE'
    ],
    link: '/portfolio/vivienda/condominio-surco',
    serviceType: 'desarrollo'
  },
  {
    id: 'industrial-callao',
    title: 'Planta Industrial Callao',
    service: 'Project Management',
    category: 'Industria',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    location: 'Callao, Lima',
    area: '35,000 m²',
    budget: 'S/ 95M',
    year: '2024',
    status: 'ongoing',
    description: 'Gestión de proyecto para nueva planta industrial con tecnología 4.0.',
    achievements: [
      'Smart factory design',
      'Automated systems',
      'Sustainability focused'
    ],
    link: '/portfolio/industria/planta-callao',
    serviceType: 'gestion'
  },
  {
    id: 'hospital-lima',
    title: 'Clínica Especializada Lima',
    service: 'Supervisión Técnica',
    category: 'Salud',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=600&h=400&fit=crop',
    location: 'San Borja, Lima',
    area: '18,000 m²',
    budget: 'S/ 65M',
    year: '2023',
    status: 'completed',
    description: 'Supervisión de construcción de clínica con tecnología médica avanzada.',
    achievements: [
      'Medical grade compliance',
      'Zero defects delivery',
      'Advanced MEP systems'
    ],
    link: '/portfolio/salud/clinica-lima',
    serviceType: 'supervision'
  }
];

const filters = [
  { id: 'todos', label: 'Todos', serviceType: null },
  { id: 'consultoria', label: 'Consultoría', serviceType: 'consultoria' },
  { id: 'gestion', label: 'Gestión', serviceType: 'gestion' },
  { id: 'supervision', label: 'Supervisión', serviceType: 'supervision' },
  { id: 'desarrollo', label: 'Desarrollo', serviceType: 'desarrollo' }
];

export default function ProjectShowcase() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter(project => {
    const filter = filters.find(f => f.id === activeFilter);
    return !filter?.serviceType || project.serviceType === filter.serviceType;
  });

  const equalizeCardHeights = () => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('[data-project-card]');
    const cardArray = Array.from(cards) as HTMLElement[];
    
    if (cardArray.length === 0) return;

    // Reset heights
    cardArray.forEach(card => {
      card.style.height = 'auto';
    });

    // Get grid computed style to determine columns
    const gridStyles = window.getComputedStyle(gridRef.current);
    const gridTemplateColumns = gridStyles.gridTemplateColumns;
    const columnCount = gridTemplateColumns.split(' ').length;

    // Group cards by rows
    const rows: HTMLElement[][] = [];
    for (let i = 0; i < cardArray.length; i += columnCount) {
      rows.push(cardArray.slice(i, i + columnCount));
    }

    // Set equal heights for each row
    rows.forEach(row => {
      const maxHeight = Math.max(
        ...row.map(card => card.offsetHeight)
      );
      row.forEach(card => {
        card.style.height = `${maxHeight}px`;
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      equalizeCardHeights();
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredProjects]);

  useEffect(() => {
    const handleResize = () => {
      const timer = setTimeout(() => {
        equalizeCardHeights();
      }, 100);
      return () => clearTimeout(timer);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <SectionTransition variant="slide" />
      
      <section id="project-showcase" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Layers className="w-4 h-4" />
              Casos de Éxito Comprobados
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Proyectos que Transforman
            </motion.h2>
            
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Cada proyecto es una historia de éxito. Descubre cómo nuestros servicios especializados 
              han creado valor excepcional para nuestros clientes.
            </motion.p>
          </div>

          {/* Filters */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mr-4 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtrar por servicio:
            </div>
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "transition-all duration-200",
                  activeFilter === filter.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeFilter}
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  data-project-card
                >
                  <div className={cn(
                    "relative bg-card rounded-2xl overflow-hidden shadow-lg transition-all duration-500 h-full flex flex-col",
                    "hover:shadow-2xl hover:-translate-y-2 cursor-pointer",
                    "border border-border hover:border-primary/20"
                  )}>
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant={project.status === 'completed' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {project.status === 'completed' ? 'Completado' : 'En Progreso'}
                        </Badge>
                      </div>

                      {/* Service Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge 
                          variant="outline"
                          className="bg-white/90 text-xs"
                        >
                          {project.service}
                        </Badge>
                      </div>

                      {/* Hover Overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-primary/80 transition-opacity duration-300",
                        hoveredProject === project.id ? "opacity-100" : "opacity-0"
                      )}>
                        <div className="flex items-center justify-center h-full">
                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => window.location.href = project.link}
                            className="gap-2"
                          >
                            Ver Proyecto
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1 flex flex-col">
                        {/* Title & Category */}
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">
                            {project.category}
                          </Badge>
                          <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>

                        {/* Project Info */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {project.area}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {project.budget}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.year}
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-2 flex-1">
                          <div className="text-xs font-medium text-foreground">Logros destacados:</div>
                          <div className="flex flex-wrap gap-1">
                            {project.achievements.slice(0, 2).map((achievement, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                            {project.achievements.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.achievements.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t border-border mt-auto">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground"
                            onClick={() => window.location.href = project.link}
                          >
                            Ver Caso Completo
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More / See All */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-6">
              ¿Quieres ver todos nuestros proyectos?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/portfolio'}
                className="px-8"
              >
                Ver Portfolio Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('contact-form')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="px-8"
              >
                Consultar Proyecto Similar
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/3 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </section>
    </>
  );
}