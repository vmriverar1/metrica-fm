'use client';

import React, { useRef, useState } from 'react';
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
import CVModal from './CVModal';
import { CareersData } from '@/hooks/useCareersData';

// Mapeo de iconos por nombre
const iconMap = {
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
};

interface CompanyBenefitsProps {
  benefitsData: CareersData['company_benefits'];
  className?: string;
}

export default function CompanyBenefits({ benefitsData, className }: CompanyBenefitsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const scrollToJobs = () => {
    // Scroll to the jobs section (assuming it has an id)
    const jobsSection = document.getElementById('job-opportunities');
    if (jobsSection) {
      jobsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll down by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

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
            Beneficios Métrica FM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {benefitsData.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {benefitsData.description}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {benefitsData.benefits.map((benefit) => {
            const IconComponent = (iconMap as any)[benefit.icon] || Heart;
            return (
            <div
              key={benefit.id}
              className="benefit-card relative p-6 rounded-xl border-2 transition-all duration-300 cursor-default bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-primary/30 hover:shadow-lg w-full sm:w-80 md:w-72 lg:w-64"
            >
              {/* Highlight Badge */}
              {benefit.highlight && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white/80 backdrop-blur-sm text-primary">
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Content */}
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
                {benefit.details && (
                  <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                    {benefit.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Decorative Element */}
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/30 rounded-full opacity-50"></div>
            </div>
            );
          })}
        </div>

        {/* Call to Action */}
        {/* <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {benefitsData.cta.title}
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                {benefitsData.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={scrollToJobs}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {benefitsData.cta.button.text}
                </button>
                <button 
                  onClick={() => setIsCVModalOpen(true)}
                  className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Enviar CV Espontáneo
                </button>
              </div>
            </div>
          </div>
        </div> */}

      </div>

      {/* CV Modal */}
      <CVModal 
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />
    </section>
  );
}