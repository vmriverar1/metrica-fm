import { Button } from '@/components/ui/button';
import { FileText, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Artículo no encontrado
            </h1>
            <p className="text-muted-foreground">
              El artículo que buscas no existe o ha sido movido. 
              Te sugerimos explorar nuestro contenido disponible.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/blog" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Explorar Blog
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Link>
            </Button>
          </div>
          
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Categorías populares:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { slug: 'industria-tendencias', label: 'Industria & Tendencias' },
                { slug: 'casos-estudio', label: 'Casos de Estudio' },
                { slug: 'guias-tecnicas', label: 'Guías Técnicas' },
                { slug: 'liderazgo-vision', label: 'Liderazgo' }
              ].map((category) => (
                <Button
                  key={category.slug}
                  variant="secondary" 
                  size="sm"
                  asChild
                >
                  <Link href={`/blog/${category.slug}`}>
                    {category.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}