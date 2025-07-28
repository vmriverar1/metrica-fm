'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MegaMenuItem {
  id: string;
  label: string;
  href?: string;
  subItems?: {
    section1: { title: string; description: string };
    links: Array<{ href: string; title: string; description: string }>;
    section3: { title: string; description: string };
  } | null;
}

interface MegaMenuProps {
  items: MegaMenuItem[];
  isScrolled: boolean;
}

export default function MegaMenu({ items, isScrolled }: MegaMenuProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveItem(null);
    }, 100);
  };

  const navLinkClasses = cn(
    "bg-transparent hover:bg-accent/10",
    isScrolled ? "text-foreground/80 hover:text-accent" : "text-white/90 hover:text-white hover:bg-white/10"
  );

  return (
    <nav className="hidden md:block relative">
      <ul className="flex items-center gap-1">
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
                  className={cn(navLinkClasses, "group", activeItem === item.id && "bg-accent/10")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(activeItem === item.id ? null : item.id);
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
                
                {activeItem === item.id && (
                  <>
                    {/* Overlay */}
                    <div 
                      className="fixed inset-0 z-40 bg-black/40" 
                      onClick={() => setActiveItem(null)}
                    />
                    
                    {/* Megamenu dropdown */}
                    <div 
                      className="fixed left-0 right-0 top-20 z-50"
                      onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-screen bg-background backdrop-blur-md border-b border-border shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="container mx-auto px-4">
                          <div className="grid grid-cols-3 gap-x-6 p-6">
                            <div className="col-span-1 space-y-4">
                              <h3 className="font-bold text-lg text-primary">{item.subItems.section1.title}</h3>
                              <p className="text-sm text-foreground/70">{item.subItems.section1.description}</p>
                            </div>
                            <Separator orientation="vertical" className="h-full" />
                            <ul className="col-span-1 grid gap-3">
                              {item.subItems.links.map((link) => (
                                <li key={link.title}>
                                  <a
                                    href={link.href}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 focus:bg-accent/10"
                                    onClick={() => setActiveItem(null)}
                                  >
                                    <div className="text-sm font-medium leading-none">{link.title}</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {link.description}
                                    </p>
                                  </a>
                                </li>
                              ))}
                            </ul>
                            <div className="col-span-1 space-y-4 pl-6 border-l border-border/50">
                              <h3 className="font-bold text-lg text-accent">{item.subItems.section3.title}</h3>
                              <p className="text-sm text-foreground/70">{item.subItems.section3.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <a
                href={item.href || `#${item.id}`}
                className={cn(navLinkClasses, "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors")}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}