'use client';

import React, { useState, useRef } from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export default function RippleButton({ children, className, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples([...ripples, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    // Call original onClick if exists
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Button
      ref={buttonRef}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute animate-ripple bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </Button>
  );
}