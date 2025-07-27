'use client';

import React, { useRef } from 'react';
import { Briefcase, Users, UserCheck, Award } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useSectionAnimation } from '@/hooks/use-gsap-animations';

const stats = [
  { icon: Briefcase, end: 50, label: 'Proyectos', suffix: '+' },
  { icon: Users, end: 30, label: 'Clientes', suffix: '+' },
  { icon: UserCheck, end: 200, label: 'Profesionales', suffix: '+' },
  { icon: Award, end: 15, label: 'Años en el sector', suffix: '+' },
];

const StatCard = ({ stat, index }: { stat: typeof stats[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current || !numberRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 95%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Animate card entrance
    tl.from(cardRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'power3.out'
    })
    // Animate icon
    .from(iconRef.current, {
      scale: 0,
      rotation: 180,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    // Counter animation
    .to(numberRef.current, {
      textContent: stat.end,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      onUpdate: function() {
        if (numberRef.current) {
          numberRef.current.textContent = Math.floor(Number(numberRef.current.textContent)) + stat.suffix;
        }
      }
    }, '-=0.4');
    
    // Hover animation for icon
    if (iconRef.current && cardRef.current) {
      const iconElement = iconRef.current.querySelector('svg');
      if (iconElement) {
        const iconHover = gsap.to(iconElement, {
          scale: 1.2,
          duration: 0.3,
          paused: true,
          ease: 'power2.out'
        });
        
        cardRef.current.addEventListener('mouseenter', () => iconHover.play());
        cardRef.current.addEventListener('mouseleave', () => iconHover.reverse());
      }
    }
    
  }, { scope: cardRef });
  
  return (
    <div ref={cardRef} className="text-center p-4 cursor-pointer transition-colors hover:bg-accent/5">
      <div ref={iconRef} className="inline-block">
        <stat.icon className="h-12 w-12 text-accent mx-auto mb-4" />
      </div>
      <p ref={numberRef} className="text-4xl font-bold text-foreground">
        0{stat.suffix}
      </p>
      <p className="text-foreground/70 mt-2">{stat.label}</p>
    </div>
  );
};

export default function Stats() {
  const sectionRef = useSectionAnimation();
  
  return (
    <section ref={sectionRef} className="relative -mt-[100px] z-30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="w-[80vw] md:w-[65vw] mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/10">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}