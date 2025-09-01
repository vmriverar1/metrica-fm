'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRobustNavigation } from '@/hooks/useRobustNavigation';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
  [key: string]: any;
}

export default function NavigationLink({ 
  href, 
  children, 
  className, 
  loadingMessage,
  onClick,
  prefetch = true,
  ...props 
}: NavigationLinkProps) {
  const { handleLinkClick, smartPrefetch, canNavigate, networkConditions } = useRobustNavigation();

  // Prefetch inteligente al montar el componente
  useEffect(() => {
    if (prefetch && href.startsWith('/')) {
      smartPrefetch(href);
    }
  }, [href, prefetch, smartPrefetch]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Llamar el onClick personalizado si existe
    if (onClick) {
      onClick(event);
    }

    // Solo manejar si no se canceló el evento
    if (!event.defaultPrevented) {
      handleLinkClick(event, href, loadingMessage);
    }
  };

  const handleMouseEnter = () => {
    // Prefetch adicional al hover si la conexión es rápida
    if (prefetch && networkConditions.speed === 'fast') {
      smartPrefetch(href);
    }
  };

  return (
    <Link 
      href={href} 
      className={`${className || ''} ${!canNavigate ? 'pointer-events-none opacity-60' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}