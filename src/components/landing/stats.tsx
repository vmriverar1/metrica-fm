'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, UserCheck, Award } from 'lucide-react';

const stats = [
  { icon: Briefcase, end: 50, label: 'Proyectos', suffix: '+' },
  { icon: Users, end: 30, label: 'Clientes', suffix: '+' },
  { icon: UserCheck, end: 200, label: 'Profesionales', suffix: '+' },
  { icon: Award, end: 15, label: 'Años en el sector', suffix: '+' },
];

const StatCard = ({ stat }: { stat: typeof stats[0] }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = stat.end;
          if (start === end) return;

          const duration = 2000;
          const incrementTime = (duration / end);

          const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) {
              clearInterval(timer);
            }
          }, incrementTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [stat.end]);

  return (
    <div ref={ref} className="text-center p-4">
      <stat.icon className="h-12 w-12 text-accent mx-auto mb-4" />
      <p className="text-4xl font-bold text-foreground">
        {count}{stat.suffix}
      </p>
      <p className="text-foreground/70">{stat.label}</p>
    </div>
  );
};

export default function Stats() {
  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
