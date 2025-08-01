'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import EstadisticasAnimadas from './EstadisticasAnimadas';
import { ArrowRight } from 'lucide-react';

export default function CierreHistoria() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState('');
  
  const fullText = 'Después de más de una década transformando la infraestructura del Perú, seguimos escribiendo nuestra historia junto a ti.';

  useGSAP(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    
    // Timeline principal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      }
    });

    // Máscara circular que revela la imagen
    tl.from(maskRef.current, {
      scale: 0,
      duration: 2,
      ease: 'power2.inOut'
    });

    // Animación de escritura
    ScrollTrigger.create({
      trigger: textRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        let charIndex = 0;
        const typeWriter = setInterval(() => {
          if (charIndex < fullText.length) {
            setTypedText(fullText.slice(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typeWriter);
          }
        }, 30);
      }
    });

    // Animación del CTA
    ScrollTrigger.create({
      trigger: '.cta-container',
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.from('.cta-button', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.2
        });
      }
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-background overflow-hidden">
      {/* Transición suave desde el timeline */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
      {/* Imagen con máscara circular */}
      <div className="relative h-screen flex items-center justify-center">
        <div 
          ref={maskRef}
          className="relative w-[80vw] h-[80vh] rounded-full overflow-hidden shadow-2xl"
          style={{
            maskImage: 'radial-gradient(circle, black 100%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle, black 100%, transparent 100%)',
            boxShadow: '0 0 100px rgba(232, 78, 15, 0.3), 0 0 200px rgba(0, 63, 111, 0.2)'
          }}
        >
          <Image
            src="https://metrica-dip.com/images/slider-inicio-es/06.jpg"
            alt="Equipo Métrica"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Texto superpuesto */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-6xl lg:text-7xl font-alliance-extrabold text-white mb-8">
              El Futuro Continúa
            </h2>
            <div ref={textRef} className="text-xl lg:text-2xl font-alliance-medium text-white/90 min-h-[3em]">
              {typedText}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas animadas */}
      <div className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-4xl font-alliance-extrabold text-center mb-16">
            Nuestro Impacto en Números
          </h3>
          <EstadisticasAnimadas />
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-container py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h3 className="text-3xl lg:text-4xl font-alliance-extrabold mb-6">
            ¿Listo para construir el futuro juntos?
          </h3>
          <p className="text-lg font-alliance-medium text-muted-foreground mb-12">
            Descubre cómo nuestros servicios pueden transformar tu próximo proyecto
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/servicios"
              className="cta-button group relative px-8 py-4 bg-accent text-white font-alliance-medium rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Conoce nuestros servicios
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link 
              href="/contacto"
              className="cta-button px-8 py-4 border-2 border-primary text-primary font-alliance-medium rounded-full transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-1/4 left-10 w-20 h-20 border-2 border-accent/20 rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-primary/20 rotate-45 animate-pulse" />
      
      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-random ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes float-random {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate(10px, -10px) scale(1);
          }
          90% {
            opacity: 1;
            transform: translate(-10px, -100px) scale(1);
          }
          100% {
            transform: translate(0, -120px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}