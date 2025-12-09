'use client';

import React, { useRef } from 'react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useSectionAnimation } from '@/hooks/use-gsap-animations';
import { HomePageData } from '@/types/home';


interface StatCardProps {
  stat: {
    id: string;
    icon: string;
    value: number;
    suffix: string;
    label: string;
    description?: string;
    prefix?: string;
  };
  index: number;
}

const StatCard = ({ stat, index }: StatCardProps) => {
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
      textContent: stat.value,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 0.1 }, // Allow decimals with 0.1 precision
      onUpdate: function() {
        if (numberRef.current) {
          const currentValue = Number(numberRef.current.textContent);
          // Keep one decimal place if needed
          const formattedValue = currentValue % 1 === 0
            ? Math.floor(currentValue).toString()
            : currentValue.toFixed(1);
          numberRef.current.textContent = formattedValue + stat.suffix;
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
        <DynamicIcon 
          name={stat.icon}
          className="h-12 w-12 text-accent mx-auto mb-4"
          fallbackIcon="Award"
        />
      </div>
      <p ref={numberRef} className="text-4xl font-alliance-extrabold text-foreground">
        0{stat.suffix}
      </p>
      <p className="text-foreground/70 mt-2 font-alliance-medium">{stat.label}</p>
    </div>
  );
};

interface StatsProps {
  data: HomePageData['stats'];
}

export default function Stats({ data }: StatsProps) {
  const sectionRef = useSectionAnimation();
  
  return (
    <section id="stats" ref={sectionRef} className="relative -mt-[100px] z-30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="w-[80vw] md:w-[65vw] mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/10">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {data.statistics.map((stat, index) => (
                <StatCard key={stat.id} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}