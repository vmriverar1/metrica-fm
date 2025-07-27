
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from '../ui/separator';

const navItems = [
  { id: 'hero', label: 'Inicio', subItems: null },
  { 
    id: 'about', 
    label: 'Nosotros',
    subItems: {
      section1: { title: "Nuestra Esencia", description: "Conoce los pilares que definen a Métrica y nuestro compromiso con el desarrollo." },
      links: [
        { href: "/about/quienes-somos", title: "Quiénes Somos", description: "Nuestra historia, misión y visión." },
        { href: "/about/politicas", title: "Políticas", description: "Compromiso con la calidad y la gestión." },
        { href: "/about/servicios", title: "Servicios", description: "Soluciones integrales que ofrecemos." },
        { href: "/about/clientes", title: "Clientes", description: "Quienes confían en nosotros." },
      ],
      section3: { title: "Cultura Métrica", description: "Fomentamos un ambiente de innovación, integridad y excelencia." }
    }
  },
  { id: 'iso', label: 'ISO 9001', subItems: null },
  { 
    id: 'portfolio', 
    label: 'Portafolio',
    subItems: {
      section1: { title: "Proyectos que Transforman", description: "Explora la diversidad y el impacto de nuestro trabajo a nivel nacional." },
      links: [
        { href: "/portfolio/clientes", title: "Nuestros Clientes", description: "" },
        { href: "/portfolio/proyecto-1", title: "Proyecto Hospitalario", description: "" },
        { href: "/portfolio/proyecto-2", title: "Infraestructura Vial", description: "" },
        { href: "/portfolio/proyecto-3", title: "Edificación Educativa", description: "" },
        { href: "/portfolio/proyecto-4", title: "Saneamiento Urbano", description: "" },
        { href: "/portfolio/proyecto-5", title: "Complejo Residencial", description: "" },
      ],
      section3: { title: "Innovación en Cada Obra", description: "Aplicamos las últimas tecnologías y metodologías para garantizar resultados superiores." }
    }
  },
  { 
    id: 'contact', 
    label: 'Contáctanos',
    subItems: {
      section1: { title: "Estamos para Ayudarte", description: "Ponte en contacto con nuestro equipo para cualquier consulta o requerimiento." },
      links: [
        { href: "/contact", title: "Formulario de Contacto", description: "Envíanos tus preguntas directamente." },
        { href: "/contact/claims", title: "Libro de Reclamaciones", description: "Tu opinión es importante para nosotros." },
      ],
      section3: { title: "Oficina Central", description: "Av. Principal 123, San Isidro, Lima, Perú." }
    }
  },
];

const Logo = ({ isScrolled }: { isScrolled: boolean }) => (
  <Link href="/" className="flex items-center space-x-2">
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0L100 28.87V86.6L50 115.47L0 86.6V28.87L50 0Z" className={cn(isScrolled ? "fill-primary" : "fill-white")}/>
      <path d="M50 18L77.5 33.5V64.5L50 79.5L22.5 64.5V33.5L50 18Z" className={cn(isScrolled ? "fill-accent" : "fill-gray-300")}/>
    </svg>
    <span className={cn(
      "font-bold text-xl",
      isScrolled ? "text-foreground" : "text-white"
    )}>Métrica</span>
  </Link>
);

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 focus:bg-accent/10",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


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

  const navLinkClasses = cn(
    "bg-transparent hover:bg-accent/10",
    isScrolled ? "text-foreground/80 hover:text-accent" : "text-white/90 hover:text-white hover:bg-white/10"
  );

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent",
        menuOpen ? "bg-background/80 backdrop-blur-sm" : ""
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Logo isScrolled={isScrolled}/>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-1">
              <NavigationMenu onValueChange={(value) => setMenuOpen(!!value)}>
                <NavigationMenuList>
                  {navItems.map((item) => (
                    <NavigationMenuItem key={item.id}>
                      {item.subItems ? (
                        <>
                          <NavigationMenuTrigger className={navLinkClasses}>
                            {item.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="container mx-auto px-4">
                              <div className="grid grid-cols-3 gap-x-6 p-6">
                                <div className="col-span-1 space-y-4">
                                  <h3 className="font-bold text-lg text-primary">{item.subItems.section1.title}</h3>
                                  <p className="text-sm text-foreground/70">{item.subItems.section1.description}</p>
                                </div>
                                <Separator orientation="vertical" className="h-full" />
                                <ul className="col-span-1 grid gap-3">
                                  {item.subItems.links.map((link) => (
                                    <ListItem
                                      key={link.title}
                                      title={link.title}
                                      href={link.href}
                                    >
                                      {link.description}
                                    </ListItem>
                                  ))}
                                </ul>
                                <div className="col-span-1 space-y-4 pl-6 border-l border-border/50">
                                   <h3 className="font-bold text-lg text-accent">{item.subItems.section3.title}</h3>
                                   <p className="text-sm text-foreground/70">{item.subItems.section3.description}</p>
                                </div>
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <Link href={`#${item.id}`} passHref>
                           <NavigationMenuLink asChild>
                             <a className={cn(navigationMenuTriggerStyle(), navLinkClasses)}>
                               {item.label}
                             </a>
                           </NavigationMenuLink>
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

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
                       <Logo isScrolled={true} />
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
      <div className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity",
        menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} />
    </>
  );
}

    