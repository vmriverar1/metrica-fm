'use client';

import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface HeroEquipoProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  teamImages?: string[][];
}

export default function HeroEquipo({ title, subtitle, backgroundImage, teamImages }: HeroEquipoProps) {
  // Fallback a imágenes por defecto si no se proporcionan desde JSON
  const defaultTeamImages = [
    // Columna 1
    [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop&crop=face',
    ],
    // Columna 2
    [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=700&fit=crop&crop=face',
    ],
    // Columna 3
    [
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=700&fit=crop&crop=face',
    ],
  ];
  
  const finalTeamImages = teamImages || defaultTeamImages;
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const additionalYRef = useRef({ val: 0 });

  useGSAP(() => {
    if (!containerRef.current || !galleryRef.current) return;

    // Animaciones de entrada del hero
    const tl = gsap.timeline({ delay: 0.5 });
    
    if (titleRef.current) {
      gsap.set(titleRef.current.children, { y: 100, opacity: 0 });
      tl.to(titleRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }

    if (subtitleRef.current) {
      tl.from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.8');
    }

    // Configurar galería infinita (exactamente como en html/personas.html)
    let additionalYAnim: gsap.core.Tween | null = null;
    let offset = 0;
    const cols = gsap.utils.toArray('.col') as HTMLElement[];

    cols.forEach((col, i) => {
      const images = Array.from(col.children);

      // DUPLICAR IMÁGENES PARA LOOP (igual que el original)
      images.forEach((image) => {
        const clone = image.cloneNode(true);
        col.appendChild(clone);
      });

      // CONFIGURAR ANIMACIÓN (igual que el original)
      Array.from(col.children).forEach((item) => {
        const columnHeight = col.clientHeight;
        const direction = i % 2 !== 0 ? "+=" : "-="; // Cambiar dirección para columnas impares

        gsap.to(item, {
          y: direction + Number(columnHeight / 2),
          duration: 20,
          repeat: -1,
          ease: "none",
          modifiers: {
            y: gsap.utils.unitize((y: string) => {
              if (direction === "+=") {
                offset += additionalYRef.current.val;
                return (parseFloat(y) - offset) % (columnHeight * 0.5);
              } else {
                offset += additionalYRef.current.val;
                return (parseFloat(y) + offset) % -Number(columnHeight * 0.5);
              }
            })
          }
        });
      });
    });

    // ScrollTrigger para acelerar con scroll (igual que el original)
    const imagesScrollerTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 50%",
      end: "bottom 50%",
      onUpdate: function (self) {
        const velocity = self.getVelocity();
        if (velocity > 0) {
          if (additionalYAnim) additionalYAnim.kill();
          additionalYRef.current.val = -velocity / 2000;
          additionalYAnim = gsap.to(additionalYRef.current, { val: 0 });
        }
        if (velocity < 0) {
          if (additionalYAnim) additionalYAnim.kill();
          additionalYRef.current.val = -velocity / 3000;
          additionalYAnim = gsap.to(additionalYRef.current, { val: 0 });
        }
      }
    });

    return () => {
      imagesScrollerTrigger.kill();
      if (additionalYAnim) additionalYAnim.kill();
    };

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hero-equipo-container">

      {/* Overlay con gradiente */}
      <div className="hero-overlay" />

      {/* Galería de imágenes */}
      <div ref={galleryRef} className="gallery">
        {finalTeamImages.map((columnImages, colIndex) => (
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

      {/* Contenido del hero */}
      <div className="hero-content">
        <h1 ref={titleRef} className="hero-title">
          {title.split(' ').map((word, index) => (
            <span key={index} className="word">
              {word}
            </span>
          ))}
        </h1>
        <p ref={subtitleRef} className="hero-subtitle">
          {subtitle}
        </p>
      </div>

      <style jsx>{`
        .hero-equipo-container {
          position: relative;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #003f6f 0%,
            #004d8a 50%,
            #005ca8 100%
          );
        }


        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 63, 111, 0.1) 0%,
            rgba(0, 63, 111, 0.3) 50%,
            rgba(232, 78, 15, 0.2) 100%
          );
          z-index: 2;
        }

        .gallery {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          z-index: 3;
          overflow: hidden;
          opacity: 0.3;
          padding: 0;
        }

        @media (max-width: 768px) {
          .gallery {
            opacity: 0.2;
          }
        }

        .col {
          display: flex;
          flex: 1;
          flex-direction: column;
          width: 100%;
          align-self: flex-start;
          justify-self: flex-start;
          max-width: none;
          will-change: transform;
          transform: translateZ(0);
        }

        .col:nth-child(2) {
          align-self: flex-end;
          justify-self: flex-end;
        }

        .col:nth-child(3) {
          align-self: center;
        }

        .image {
          width: 100%;
          filter: grayscale(1) contrast(1.2) brightness(0.8);
          padding: 0.5rem;
          transition: all 0.3s ease-out;
        }

        .image:hover {
          z-index: 999999 !important;
          filter: grayscale(0) contrast(1.1) saturate(1.3) brightness(1.1);
        }

        .image img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.1),
            0 8px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-out;
          object-fit: cover;
          aspect-ratio: 2/3;
        }

        .image:hover img {
          box-shadow: 
            0 8px 16px rgba(232, 78, 15, 0.3),
            0 16px 32px rgba(232, 78, 15, 0.2);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          max-width: 900px;
          padding: 0 2rem;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-family: 'Marsek Demi', 'Alliance No.2', sans-serif;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-title .word {
          display: inline-block;
          margin-right: 0.3em;
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-family: 'Alliance No.2', sans-serif;
          font-weight: 400;
          line-height: 1.6;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          max-width: 700px;
          margin: 0 auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content {
            padding: 0 1rem;
          }
          
          .image {
            padding: 0.25rem;
          }
          
          .image img {
            border-radius: 6px;
          }
        }

        @media (max-width: 480px) {
          .gallery {
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}