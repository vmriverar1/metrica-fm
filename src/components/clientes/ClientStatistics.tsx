'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface Statistic {
  number: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
}

interface StatCardProps {
  stat: Statistic;
  index: number;
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const [counter, setCounter] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract numeric value from the number string
    const match = stat.number.match(/([0-9.,]+)/);
    const targetValue = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

    // Simple counter animation on mount
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCounter(targetValue);
        clearInterval(timer);
      } else {
        setCounter(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stat.number]);

  // Extract prefix and suffix from number
  const numberMatch = stat.number.match(/^([^0-9.,]*)([0-9.,]+)(.*)$/);
  const prefix = numberMatch?.[1] || '';
  const suffix = numberMatch?.[3] || '';

  return (
    <div
      ref={cardRef}
      className="stat-card relative bg-card rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
    >
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icono */}
      <div className="stat-icon text-6xl mb-4">
        {stat.icon ? (
          <DynamicIcon
            name={stat.icon}
            className="h-14 w-14 mx-auto text-primary group-hover:text-accent transition-colors duration-300"
            fallbackIcon="Award"
          />
        ) : (
          '📊'
        )}
      </div>

      {/* Número animado */}
      <div className="relative mb-2">
        <span className="text-5xl font-alliance-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {prefix}{counter}{suffix}
        </span>
      </div>

      {/* Label */}
      {stat.label && stat.label.trim() && !stat.label.toLowerCase().includes('sin título') && (
        <h4 className="text-xl font-alliance-extrabold text-foreground mb-2">
          {stat.label}
        </h4>
      )}

      {/* Descripción */}
      {stat.description && stat.description.trim() && !stat.description.toLowerCase().includes('sin descripción') && (
        <p className="text-sm font-alliance-medium text-muted-foreground">
          {stat.description}
        </p>
      )}

      {/* Efecto de partículas en hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${20 + i * 15}%`,
              top: '100%',
              animation: 'particle-rise 2s ease-out infinite',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface ClientStatisticsProps {
  stats: Statistic[];
}

export default function ClientStatistics({ stats }: ClientStatisticsProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  // Determinar clases de grid según cantidad de estadísticas
  const gridClasses =
    stats.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
    stats.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
    stats.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="mb-16">
      <div className={`grid ${gridClasses} gap-8`}>
        {stats.map((stat, index) => (
          <StatCard
            key={`stat-${index}`}
            stat={stat}
            index={index}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes particle-rise {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
