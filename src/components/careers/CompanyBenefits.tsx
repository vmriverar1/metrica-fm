'use client';

import React, { useRef } from 'react';
import { 
  Heart, 
  GraduationCap, 
  Plane, 
  Coffee, 
  Shield, 
  Trophy,
  Clock,
  Home,
  Users,
  Car,
  Gift,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'salud' | 'desarrollo' | 'bienestar' | 'compensacion';
  highlight?: boolean;
}

const benefits: Benefit[] = [
  {
    id: 'seguro-salud',
    title: 'Seguro de Salud Integral',
    description: 'Cobertura médica completa para ti y tu familia, incluyendo atención dental y oftalmológica.',
    icon: <Heart className="w-6 h-6" />,
    category: 'salud',
    highlight: true
  },
  {
    id: 'capacitacion',
    title: 'Capacitación Continua',
    description: 'Programas de desarrollo profesional, certificaciones y cursos especializados pagados por la empresa.',
    icon: <GraduationCap className="w-6 h-6" />,
    category: 'desarrollo',
    highlight: true
  },
  {
    id: 'vacaciones',
    title: 'Vacaciones Flexibles',
    description: '30 días de vacaciones anuales con flexibilidad para tomarlas según tus necesidades.',
    icon: <Plane className="w-6 h-6" />,
    category: 'bienestar'
  },
  {
    id: 'work-life',
    title: 'Balance Vida-Trabajo',
    description: 'Horarios flexibles y opciones de trabajo remoto para mantener el equilibrio personal.',
    icon: <Clock className="w-6 h-6" />,
    category: 'bienestar',
    highlight: true
  },
  {
    id: 'seguro-vida',
    title: 'Seguro de Vida',
    description: 'Protección financiera completa con cobertura de seguro de vida y accidentes.',
    icon: <Shield className="w-6 h-6" />,
    category: 'salud'
  },
  {
    id: 'bonos',
    title: 'Bonos por Performance',
    description: 'Reconocimiento económico adicional basado en el desempeño individual y de equipo.',
    icon: <Trophy className="w-6 h-6" />,
    category: 'compensacion'
  },
  {
    id: 'cafeteria',
    title: 'Cafetería Gratuita',
    description: 'Desayuno y refrigerios gratuitos en nuestras oficinas para todo el equipo.',
    icon: <Coffee className="w-6 h-6" />,
    category: 'bienestar'
  },
  {
    id: 'trabajo-remoto',
    title: 'Trabajo Remoto',
    description: 'Flexibilidad para trabajar desde casa con todas las herramientas necesarias.',
    icon: <Home className="w-6 h-6" />,
    category: 'bienestar'
  },
  {
    id: 'ambiente-colaborativo',
    title: 'Ambiente Colaborativo',
    description: 'Cultura de trabajo en equipo con espacios modernos y tecnología de vanguardia.',
    icon: <Users className="w-6 h-6" />,
    category: 'bienestar'
  },
  {
    id: 'transporte',
    title: 'Subsidio de Transporte',
    description: 'Apoyo económico mensual para gastos de transporte y movilización.',
    icon: <Car className="w-6 h-6" />,
    category: 'compensacion'
  },
  {
    id: 'eventos',
    title: 'Eventos y Celebraciones',
    description: 'Actividades de integración, celebraciones especiales y eventos de equipo.',
    icon: <Gift className="w-6 h-6" />,
    category: 'bienestar'
  },
  {
    id: 'gimnasio',
    title: 'Membresía de Gimnasio',
    description: 'Subsidio para membresía de gimnasio y actividades deportivas.',
    icon: <Dumbbell className="w-6 h-6" />,
    category: 'salud'
  }
];

const categoryLabels = {
  salud: 'Salud y Protección',
  desarrollo: 'Desarrollo Profesional',
  bienestar: 'Bienestar y Balance',
  compensacion: 'Compensación Adicional'
};

const categoryColors = {
  salud: 'from-red-50 to-pink-50 border-red-200',
  desarrollo: 'from-blue-50 to-indigo-50 border-blue-200',
  bienestar: 'from-green-50 to-emerald-50 border-green-200',
  compensacion: 'from-orange-50 to-yellow-50 border-orange-200'
};

const categoryIconColors = {
  salud: 'text-red-600',
  desarrollo: 'text-blue-600',
  bienestar: 'text-green-600',
  compensacion: 'text-orange-600'
};

interface CompanyBenefitsProps {
  className?: string;
}

export default function CompanyBenefits({ className }: CompanyBenefitsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.benefit-card');
    
    // Animación inicial de entrada
    gsap.fromTo(cards, 
      {
        opacity: 0,
        y: 60,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Hover effects
    cards.forEach((card) => {
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

  }, { scope: sectionRef });

  const groupedBenefits = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, Benefit[]>);

  return (
    <section 
      ref={sectionRef}
      id="company-benefits"
      className={cn("py-20 bg-background", className)}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Beneficios Métrica DIP
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Más que un trabajo,{' '}
            <span className="text-primary">una experiencia integral</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En Métrica DIP creemos que nuestro equipo es nuestro activo más valioso. 
            Por eso ofrecemos un paquete de beneficios integral que va más allá del salario.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-12">
          {Object.entries(groupedBenefits).map(([category, categoryBenefits]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <div className="w-20 h-1 bg-primary rounded-full"></div>
              </div>

              {/* Benefits Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className={cn(
                      "benefit-card relative p-6 rounded-xl border-2 transition-all duration-300 cursor-default",
                      "bg-gradient-to-br",
                      categoryColors[benefit.category],
                      benefit.highlight && "ring-2 ring-primary/20 ring-offset-2"
                    )}
                  >
                    {/* Highlight Badge */}
                    {benefit.highlight && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      "bg-white/80 backdrop-blur-sm",
                      categoryIconColors[benefit.category]
                    )}>
                      {benefit.icon}
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-3">
                        {benefit.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/30 rounded-full opacity-50"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                ¿Listo para formar parte del equipo?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Explora nuestras oportunidades laborales y descubre cómo puedes 
                crecer profesionalmente mientras contribuyes a proyectos de impacto.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Ver Posiciones Abiertas
                </button>
                <button className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium transition-colors">
                  Enviar CV Espontáneo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfacción del Equipo</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
            <div className="text-sm text-muted-foreground">Rating como Empleador</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Años de Experiencia</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">200+</div>
            <div className="text-sm text-muted-foreground">Proyectos Completados</div>
          </div>
        </div>
      </div>
    </section>
  );
}