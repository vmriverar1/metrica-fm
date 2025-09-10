'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast-simple';
import { MoveRight, CheckCircle } from 'lucide-react';
import { HomePageData } from '@/types/home';

interface NewsletterProps {
  data: HomePageData['newsletter'];
}

export default function Newsletter({ data }: NewsletterProps) {
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
        title: data.form.success_message,
        description: data.form.success_description,
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
          {data.section.title}
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
          {data.section.subtitle}
        </p>
        
        {isSubscribed ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-accent" />
            <p className="text-lg font-semibold">{data.form.success_message}</p>
            <p className="text-primary-foreground/80">{data.form.success_description}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto flex gap-2">
            <Input 
              type="email" 
              placeholder={data.form.placeholder_text} 
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
              {isSubmitting ? data.form.loading_text : data.form.cta_text}
              <MoveRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
