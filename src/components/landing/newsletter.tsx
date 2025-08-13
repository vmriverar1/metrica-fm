'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MoveRight, CheckCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simular suscripción
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast({
        title: "¡Suscripción exitosa!",
        description: "Te has suscrito correctamente a nuestro newsletter",
      });
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }, 1500);
  };

  return (
    <section id="newsletter" className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold">
          Suscríbete a nuestro Newsletter
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
          Recibe las últimas noticias, análisis y casos de éxito del sector de infraestructura directamente en tu correo.
        </p>
        
        {isSubscribed ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-accent" />
            <p className="text-lg font-semibold">¡Gracias por suscribirte!</p>
            <p className="text-primary-foreground/80">Pronto recibirás nuestro contenido exclusivo</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto flex gap-2">
            <Input 
              type="email" 
              placeholder="Tu correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-grow bg-white/90 text-foreground focus:ring-accent"
            />
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent/90 shrink-0"
            >
              {isSubmitting ? 'Suscribiendo...' : 'Suscribirme'}
              <MoveRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
