import Link from 'next/link';
import { Linkedin, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-bold text-lg font-headline">Métrica FM SAC</h4>
            <p className="text-sm text-primary-foreground/70 mt-2">Dirección Integral de Proyectos</p>
          </div>
          <div>
            <h4 className="font-bold text-lg font-headline">Navegación</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="#hero" className="text-sm text-primary-foreground/70 hover:text-white">Inicio</Link></li>
              <li><Link href="#pillars" className="text-sm text-primary-foreground/70 hover:text-white">DIP</Link></li>
              <li><Link href="#portfolio" className="text-sm text-primary-foreground/70 hover:text-white">Proyectos</Link></li>
              <li><Link href="#newsletter" className="text-sm text-primary-foreground/70 hover:text-white">Newsletter</Link></li>
              <li><Link href="/libro-reclamaciones" className="text-sm text-primary-foreground/70 hover:text-white">Libro de Reclamaciones</Link></li>
              <li><Link href="/canal-de-denuncias" className="text-sm text-primary-foreground/70 hover:text-white">Canal de Denuncias</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg font-headline">Síguenos</h4>
            <div className="flex justify-center md:justify-start gap-2 mt-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-white" asChild>
                <a href="https://linkedin.com/company/metrica-dip" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-white" asChild>
                <a href="https://twitter.com/metrica_dip" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hover:text-white" asChild>
                <a href="https://facebook.com/metrica.dip" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Métrica FM SAC. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
