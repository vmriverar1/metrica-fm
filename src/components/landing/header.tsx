'use client';

import React, { useState, useEffect } from 'react';
import NavigationLink from '@/components/ui/NavigationLink';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import './header.css';
import MegaMenu from '@/components/megamenu';
import { useMegaMenuData } from '@/hooks/useMegaMenuData';


const Logo = ({ isScrolled, menuOpen }: { isScrolled: boolean; menuOpen: boolean }) => (
  <NavigationLink href="/" className="flex items-center" loadingMessage="Volviendo al inicio...">
    <Image
      src={isScrolled || menuOpen ? "/img/logo-color.webp" : "/img/logo-blanco.png"}
      alt="Métrica Logo"
    width={200}
    height={60}
    priority
    className="h-10 md:h-16 w-auto"
    />
  </NavigationLink>
);


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { menuData } = useMegaMenuData();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 transition-all duration-300",
        menuOpen ? "z-[70]" : "z-50",
        isScrolled || menuOpen ? "bg-background shadow-md" : "bg-transparent"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Logo isScrolled={isScrolled} menuOpen={menuOpen}/>
            
            {/* Desktop Menu */}
            <MegaMenu 
              isScrolled={isScrolled} 
              onMenuChange={setMenuOpen}
            />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(isScrolled ? "text-foreground" : "text-white", "hover:bg-white/10")}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background w-[250px] sm:w-[300px]">
                  <VisuallyHidden>
                    <SheetTitle>Menú de navegación</SheetTitle>
                  </VisuallyHidden>
                  <div className="flex flex-col h-full">
                    <nav className="flex flex-col items-start gap-2 p-4">
                      {menuData.map((item) => (
                        <NavigationLink 
                          key={item.id} 
                          href={item.href || `#${item.id}`} 
                          className="w-full"
                          loadingMessage={`Navegando a ${item.label}...`}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-lg"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                          </Button>
                        </NavigationLink>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}