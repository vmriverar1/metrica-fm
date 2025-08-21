'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, SearchX } from 'lucide-react';

export default function JobNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
            <SearchX className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Puesto no encontrado
          </h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            La oportunidad laboral que buscas no existe o ha sido removida. 
            Explora nuestras otras oportunidades disponibles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/careers">
                Ver todas las oportunidades
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/careers" className="inline-flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Volver a carreras
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}