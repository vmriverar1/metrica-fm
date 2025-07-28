'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export default function TiltCard({ 
  children, 
  className = '',
  maxTilt = 15,
  scale = 1.05,
  speed = 300
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: `transform ${speed}ms ease-out`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: `transform ${speed}ms ease-out`,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn('relative transform-gpu', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {children}
      {/* Glow effect overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 blur-xl" />
      </div>
    </div>
  );
}