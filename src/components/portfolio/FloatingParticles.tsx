'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  animated?: boolean;
}

// Valores por defecto constantes para evitar recreación
const DEFAULT_COLORS = ['#E84E0F', '#003F6F', '#ffffff'];
const DEFAULT_COUNT = 20;

export default function FloatingParticles({
  count = DEFAULT_COUNT,
  colors = DEFAULT_COLORS,
  className = '',
  animated = true
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate particles - solo una vez al montar el componente
  useEffect(() => {
    const generateParticles = (): Particle[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    setParticles(generateParticles());
  }, []); // Array vacío para ejecutar solo una vez

  // Animate particles
  useEffect(() => {
    if (!animated || particles.length === 0) return;

    const animateParticles = () => {
      particleRefs.current.forEach((particle, index) => {
        if (!particle) return;

        const particleData = particles[index];
        if (!particleData) return;

        // Floating animation
        gsap.to(particle, {
          y: `${Math.sin(Date.now() * 0.001 + index) * 20}px`,
          x: `${Math.cos(Date.now() * 0.0008 + index) * 15}px`,
          duration: 3 + Math.random() * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });

        // Opacity pulsing
        gsap.to(particle, {
          opacity: particleData.opacity * 0.3,
          duration: 2 + Math.random() * 3,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        });

        // Rotation
        gsap.to(particle, {
          rotation: 360,
          duration: 10 + Math.random() * 10,
          ease: "none",
          repeat: -1
        });
      });
    };

    const timeoutId = setTimeout(animateParticles, 100);
    return () => clearTimeout(timeoutId);
  }, [particles, animated]);

  // Mouse interaction
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

      particleRefs.current.forEach((particle, index) => {
        if (!particle) return;

        const particleData = particles[index];
        if (!particleData) return;

        const distance = Math.sqrt(
          Math.pow(mouseX - particleData.x, 2) + 
          Math.pow(mouseY - particleData.y, 2)
        );

        if (distance < 20) {
          // Repel particles from mouse
          const angle = Math.atan2(particleData.y - mouseY, particleData.x - mouseX);
          const force = (20 - distance) / 20;
          
          gsap.to(particle, {
            x: `+=${Math.cos(angle) * force * 30}px`,
            y: `+=${Math.sin(angle) * force * 30}px`,
            scale: 1 + force * 0.5,
            duration: 0.3,
            ease: "power2.out"
          });

          // Return to original position
          gsap.to(particle, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
            delay: 0.3
          });
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [particles]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          ref={el => particleRefs.current[index] = el}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`
          }}
        />
      ))}
    </div>
  );
}