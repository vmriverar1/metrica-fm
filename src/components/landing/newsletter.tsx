import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoveRight } from 'lucide-react';

export default function Newsletter() {
  return (
    <section id="newsletter" className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold">
          Suscríbete a nuestro Newsletter
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
          Recibe las últimas noticias, análisis y casos de éxito del sector de infraestructura directamente en tu correo.
        </p>
        <form className="mt-8 max-w-lg mx-auto flex gap-2">
          <Input 
            type="email" 
            placeholder="Tu correo electrónico" 
            className="flex-grow bg-white/90 text-foreground focus:ring-accent"
          />
          <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 shrink-0">
            Suscribirme
            <MoveRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </section>
  );
}
