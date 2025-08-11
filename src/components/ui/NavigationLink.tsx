'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function NavigationLink({ 
  href, 
  children, 
  className, 
  loadingMessage,
  onClick,
  ...props 
}: NavigationLinkProps) {
  const { handleLinkClick } = useNavigationLoading();

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Llamar el onClick personalizado si existe
    if (onClick) {
      onClick(event);
    }

    // Solo manejar el loading si no se previno el comportamiento por defecto
    // y no es un link de hash/ancla
    if (!event.defaultPrevented && !href.startsWith('#')) {
      await handleLinkClick(event, href, loadingMessage);
    }
  };

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}