'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import NavigationLink from '@/components/ui/NavigationLink';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMegaMenuData } from '@/hooks/useMegaMenuData';

interface MegaMenuItem {
  id: string;
  label: string;
  href?: string;
  subItems?: {
    section1: { title: string; description: string };
    links: Array<{ href: string; title: string; description: string }>;
    section3: { 
      title: string; 
      description: string;
      image?: string;
    };
  } | null;
}

interface MegaMenuProps {
  items?: MegaMenuItem[];
  isScrolled: boolean;
  onMenuChange?: (isOpen: boolean) => void;
}

export default function MegaMenu({ items: propItems, isScrolled, onMenuChange }: MegaMenuProps) {
  const { menuData, isLoading, error, trackItemClick } = useMegaMenuData();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use propItems if provided, otherwise use data from hook
  const items = propItems || menuData;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (itemId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveItem(itemId);
    onMenuChange?.(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveItem(null);
      onMenuChange?.(false);
    }, 100);
  };

  useEffect(() => {
    onMenuChange?.(!!activeItem);
  }, [activeItem, onMenuChange]);

  const navLinkClasses = cn(
    "bg-transparent transition-all duration-200",
    isScrolled || activeItem ? "text-foreground/80" : "text-white/90"
  );

  // Show loading state or error
  if (isLoading) {
    return (
      <nav className="hidden md:block relative">
        <div className="flex items-center gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-20 bg-muted rounded-md" />
          ))}
        </div>
      </nav>
    );
  }

  if (error) {
    console.error('MegaMenu error:', error);
    return null;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="hidden md:block relative">
      <ul className="flex items-center gap-1 relative z-[70]">
        {items.map((item) => (
          <li 
            key={item.id} 
            className="relative"
            onMouseEnter={() => item.subItems && handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            {item.subItems ? (
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    navLinkClasses, 
                    "group hover:bg-accent hover:text-white",
                    activeItem === item.id && "bg-accent text-white"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    const newState = activeItem === item.id ? null : item.id;
                    setActiveItem(newState);
                    onMenuChange?.(!!newState);
                  }}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "relative top-[1px] ml-1 h-3 w-3 transition duration-200",
                      activeItem === item.id && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </Button>
                
                {activeItem === item.id && typeof window !== 'undefined' && createPortal(
                  <>
                    {/* Megamenu dropdown */}
                    <div 
                      className="fixed left-0 right-0 top-20 z-[60]"
                      onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-screen bg-background backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="container mx-auto px-4">
                          <div className="grid grid-cols-3 gap-8 p-8">
                            {/* Primera columna - Título y descripción */}
                            <div className="col-span-1 flex flex-col justify-center space-y-4">
                              <h3 className="text-2xl font-bold text-primary">{item.subItems.section1.title}</h3>
                              <p className="text-base text-foreground/70 leading-relaxed">{item.subItems.section1.description}</p>
                            </div>
                            
                            {/* Segunda columna - Enlaces del submenú */}
                            <div className="col-span-1">
                              <ul className="grid gap-2">
                                {item.subItems.links.map((link) => (
                                  <li key={link.title}>
                                    <NavigationLink
                                      href={link.href}
                                      className="block select-none space-y-1 rounded-lg px-4 py-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-white hover:translate-x-1 group"
                                      loadingMessage={`Navegando a ${link.title}...`}
                                      onClick={() => {
                                        setActiveItem(null);
                                        trackItemClick(item.id);
                                      }}
                                    >
                                      <div className="text-sm font-semibold leading-none text-foreground group-hover:text-white">{link.title}</div>
                                      {link.description && (
                                        <p className="line-clamp-1 text-sm leading-snug text-muted-foreground mt-1 group-hover:text-white/90">
                                          {link.description}
                                        </p>
                                      )}
                                    </NavigationLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Tercera columna - Imagen con overlay */}
                            <div className="col-span-1">
                              <div className="relative h-full overflow-hidden rounded-xl group cursor-pointer">
                                {/* Imagen de fondo */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                                {item.subItems.section3.image && (
                                  <img 
                                    src={item.subItems.section3.image} 
                                    alt={item.subItems.section3.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                )}
                                
                                {/* Gradiente desde abajo */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                
                                {/* Contenido sobre la imagen */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform group-hover:translate-y-[-4px]">
                                  <h4 className="text-lg font-bold mb-2">{item.subItems.section3.title}</h4>
                                  <p className="text-sm leading-relaxed opacity-90">{item.subItems.section3.description}</p>
                                </div>
                                
                                {/* Sombra inferior */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-black/20 to-transparent transform translate-y-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </>
            ) : (
              <NavigationLink
                href={item.href || `#${item.id}`}
                className={cn(
                  navLinkClasses, 
                  "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-white"
                )}
                loadingMessage={`Navegando a ${item.label}...`}
                onClick={() => trackItemClick(item.id)}
              >
                {item.label}
              </NavigationLink>
            )}
          </li>
        ))}
      </ul>
      
      {/* Overlay - Renderizado en portal para evitar problemas de z-index */}
      {activeItem && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[45] bg-black/40" 
          onClick={() => {
            setActiveItem(null);
            onMenuChange?.(false);
          }}
        />,
        document.body
      )}
    </nav>
  );
}