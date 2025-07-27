import { Button } from '@/components/ui/button';
import ParticleBackground from './particle-background';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section id="hero" className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <Image
        src="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
        data-ai-hint="architecture building"
      />
      <ParticleBackground />
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="z-10 flex flex-col items-center text-center px-4 text-white">
        <div className="animate-fade-in-up">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-glow">Dirección Integral</span>
            <span className="block">de Proyectos</span>
          </h1>
        </div>
        <div className="animate-fade-in-up animation-delay-200">
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-white/80">
            que transforman la infraestructura del Perú
          </p>
        </div>
        <div className="animate-fade-in-up animation-delay-400">
          <Link href="#pillars">
            <Button size="lg" className="mt-8 group relative overflow-hidden bg-white text-primary hover:bg-white/90">
              Explorar DIP
              <MoveRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 group-hover:animate-shine" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
