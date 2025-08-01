'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import './header.css';
import MegaMenu from '@/components/megamenu';

const navItems = [
  { id: 'hero', label: 'Inicio', subItems: null },
  { 
    id: 'about', 
    label: 'Nosotros',
    subItems: {
      section1: { title: "Nuestra Esencia", description: "Conoce los pilares que definen a Métrica y nuestro compromiso con el desarrollo." },
      links: [
        { href: "/about/historia", title: "Nuestra Historia", description: "Desde nuestros inicios en 2010, hemos transformado el sector construcción con más de 200 proyectos exitosos." },
        { href: "/services", title: "Qué Hacemos", description: "Especialistas en dirección integral de proyectos de infraestructura, supervisión técnica y gestión de calidad." },
        { href: "/about/cultura", title: "Cultura y Personas", description: "Un equipo multidisciplinario comprometido con la excelencia, innovación y desarrollo continuo." },
        { href: "/about/compromiso", title: "Compromiso Social y Medioambiental", description: "Construimos un futuro sostenible con responsabilidad social y las mejores prácticas ambientales." },
        { href: "/about/clientes", title: "Clientes", description: "Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo." },
      ],
      section3: { 
        title: "Cultura Métrica", 
        description: "Fomentamos un ambiente de innovación, integridad y excelencia.",
        image: "https://metrica-dip.com/images/slider-inicio-es/03.jpg"
      }
    }
  },
  { id: 'iso', label: 'ISO 9001', href: '/iso', subItems: null },
  { 
    id: 'portfolio', 
    label: 'Portafolio',
    subItems: {
      section1: { title: "Proyectos que Transforman", description: "Explora la diversidad y el impacto de nuestro trabajo a nivel nacional." },
      links: [
        { href: "/portfolio/oficina", title: "Proyectos de Oficina", description: "Espacios corporativos modernos y funcionales que potencian la productividad." },
        { href: "/portfolio/retail", title: "Proyectos de Retail", description: "Centros comerciales y tiendas que crean experiencias de compra excepcionales." },
        { href: "/portfolio/industria", title: "Proyectos de Industria", description: "Infraestructura industrial optimizada para procesos productivos eficientes." },
        { href: "/portfolio/hoteleria", title: "Proyectos de Hotelería", description: "Hoteles y complejos turísticos que combinan confort y elegancia." },
        { href: "/portfolio/educacion", title: "Proyectos de Educación", description: "Instituciones educativas que inspiran el aprendizaje y desarrollo." },
        { href: "/portfolio/vivienda", title: "Proyectos de Vivienda", description: "Complejos residenciales que ofrecen calidad de vida y bienestar." },
        { href: "/portfolio/salud", title: "Proyectos de Salud", description: "Infraestructura hospitalaria de vanguardia para el cuidado de la salud." },
      ],
      section3: { 
        title: "Innovación en Cada Obra", 
        description: "Aplicamos las últimas tecnologías y metodologías para garantizar resultados superiores.",
        image: "https://metrica-dip.com/images/slider-inicio-es/04.jpg"
      }
    }
  },
  { id: 'contact', label: 'Contáctanos', href: '/contact', subItems: null },
];

const Logo = ({ isScrolled, menuOpen }: { isScrolled: boolean; menuOpen: boolean }) => (
  <Link href="/" className="flex items-center">
    <Image 
      src={isScrolled || menuOpen ? "/img/logo-color.png" : "/img/logo-blanco.png"}
      alt="Métrica Logo"
      width={150}
      height={40}
      priority
      className="h-10 w-auto"
    />
  </Link>
);


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
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
              items={navItems} 
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
                  <div className="flex flex-col h-full">
                     <div className="flex items-center justify-between p-4 border-b">
                       <Image 
                         src="/img/logo-color.png"
                         alt="Métrica Logo"
                         width={120}
                         height={32}
                         className="h-8 w-auto"
                       />
                       <SheetTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Cerrar menú</span>
                         </Button>
                       </SheetTrigger>
                     </div>
                    <nav className="flex flex-col items-start gap-2 p-4">
                      {navItems.map((item) => (
                        <Link key={item.id} href={`#${item.id}`} className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-lg"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                          </Button>
                        </Link>
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