'use client';

import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

// Imágenes del equipo - usando fotos profesionales de Unsplash
const teamImages = [
  // Columna 1
  [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&crop=face',
  ],
  // Columna 2
  [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&crop=face',
  ],
  // Columna 3
  [
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=600&fit=crop&crop=face',
  ],
];

export default function EquipoGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const additionalYRef = useRef({ val: 0 });

  useGSAP(() => {
    if (!sectionRef.current || !galleryRef.current) return;

    const cols = galleryRef.current.querySelectorAll('.col');
    let additionalYAnim: gsap.core.Tween | null = null;
    let offset = 0;

    cols.forEach((col, i) => {
      const images = Array.from(col.children);

      // Duplicar imágenes para el loop infinito
      images.forEach((image) => {
        const clone = image.cloneNode(true) as HTMLElement;
        col.appendChild(clone);
      });

      // Configurar animación para cada imagen
      Array.from(col.children).forEach((item) => {
        const columnHeight = col.clientHeight;
        const direction = i % 2 !== 0 ? '+=' : '-='; // Alternar dirección

        gsap.to(item, {
          y: direction + (columnHeight / 2),
          duration: 20,
          repeat: -1,
          ease: 'none',
          modifiers: {
            y: gsap.utils.unitize((y: string) => {
              const numY = parseFloat(y);
              if (direction === '+=') {
                offset += additionalYRef.current.val;
                return (numY - offset) % (columnHeight * 0.5);
              } else {
                offset += additionalYRef.current.val;
                return (numY + offset) % -(columnHeight * 0.5);
              }
            })
          }
        });
      });
    });

    // ScrollTrigger para acelerar con el scroll
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        
        if (velocity > 0) {
          if (additionalYAnim) additionalYAnim.kill();
          additionalYRef.current.val = -velocity / 2000;
          additionalYAnim = gsap.to(additionalYRef.current, { val: 0, duration: 1 });
        }
        
        if (velocity < 0) {
          if (additionalYAnim) additionalYAnim.kill();
          additionalYRef.current.val = -velocity / 3000;
          additionalYAnim = gsap.to(additionalYRef.current, { val: 0, duration: 1 });
        }
      }
    });

    return () => {
      scrollTrigger.kill();
      if (additionalYAnim) additionalYAnim.kill();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative py-24 bg-gradient-to-b from-background to-background/50 overflow-hidden">
      {/* Título fijo con mix-blend-mode */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <h2 className="text-4xl md:text-6xl font-alliance-extrabold text-white mix-blend-difference text-center max-w-4xl px-4">
          Conoce a Nuestro Equipo
        </h2>
      </div>

      {/* Galería de imágenes */}
      <div ref={galleryRef} className="gallery">
        {teamImages.map((columnImages, colIndex) => (
          <div key={colIndex} className="col">
            {columnImages.map((imageSrc, imgIndex) => (
              <div key={imgIndex} className="image">
                <img 
                  src={imageSrc} 
                  alt={`Miembro del equipo ${colIndex}-${imgIndex}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        section {
          min-height: 100vh;
          position: relative;
        }

        .gallery {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          z-index: 1;
          overflow: visible;
        }

        @media (max-width: 768px) {
          .gallery {
            width: 160%;
          }
        }

        .col {
          display: flex;
          flex: 1;
          flex-direction: column;
          width: 100%;
          align-self: flex-start;
          justify-self: flex-start;
        }

        .col:nth-child(2) {
          align-self: flex-end;
          justify-self: flex-end;
        }

        .image {
          width: 100%;
          filter: grayscale(1) contrast(1.1);
          padding: 1rem;
          transition: all 0.3s ease-out;
        }

        .image:hover {
          z-index: 999999 !important;
          filter: grayscale(0) contrast(1) saturate(1.2);
          transform: scale(1.02);
        }

        .image img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 
            0 2.8px 2.2px rgba(0, 63, 111, 0.034),
            0 6.7px 5.3px rgba(0, 63, 111, 0.048), 
            0 12.5px 10px rgba(0, 63, 111, 0.06),
            0 22.3px 17.9px rgba(0, 63, 111, 0.072), 
            0 41.8px 33.4px rgba(0, 63, 111, 0.086),
            0 100px 80px rgba(0, 63, 111, 0.12);
          transition: all 0.3s ease-out;
          object-fit: cover;
          aspect-ratio: 2/3;
        }

        .image:hover img {
          box-shadow: 
            0 5.6px 4.4px rgba(232, 78, 15, 0.034),
            0 13.4px 10.6px rgba(232, 78, 15, 0.048), 
            0 25px 20px rgba(232, 78, 15, 0.06),
            0 44.6px 35.8px rgba(232, 78, 15, 0.072), 
            0 83.6px 66.8px rgba(232, 78, 15, 0.086),
            0 200px 160px rgba(232, 78, 15, 0.12);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .image {
            padding: 0.5rem;
          }
          
          .image img {
            border-radius: 8px;
          }
        }
      `}</style>
    </section>
  );
}