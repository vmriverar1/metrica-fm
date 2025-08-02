'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface ContentItem {
  id: number;
  title: string;
  content: string;
  leftImage: string;
  rightImage: string;
}

const culturaData: ContentItem[] = [
  {
    id: 1,
    title: 'Excelencia Profesional',
    content: 'Nos comprometemos con los más altos estándares de calidad en cada proyecto. Nuestro equipo de profesionales altamente capacitados busca constantemente la perfección en la dirección integral de proyectos.',
    leftImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000',
    rightImage: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=2000'
  },
  {
    id: 2,
    title: 'Innovación Continua',
    content: 'Adoptamos las últimas tecnologías y metodologías para mantenernos a la vanguardia en la gestión de proyectos de infraestructura. La innovación es parte de nuestro ADN corporativo.',
    leftImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000',
    rightImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2000'
  },
  {
    id: 3,
    title: 'Trabajo en Equipo',
    content: 'Fomentamos un ambiente colaborativo donde cada miembro del equipo aporta su expertise único. Juntos, transformamos desafíos complejos en soluciones exitosas.',
    leftImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000',
    rightImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000'
  },
  {
    id: 4,
    title: 'Responsabilidad Social',
    content: 'Nuestro compromiso va más allá de los proyectos. Contribuimos activamente al desarrollo sostenible del Perú, creando infraestructura que mejora la calidad de vida de las comunidades.',
    leftImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2000',
    rightImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000'
  }
];

export default function CulturaInteractiva() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeContent, setActiveContent] = useState<number | null>(null);
  const [isSceneActive, setIsSceneActive] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Initialize GSAP and ScrollTrigger for pinning only
  useGSAP(() => {
    if (!wrapperRef.current || !sceneRef.current) return;

    // Create ScrollTrigger that pins the section
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: '+=400%',
      pin: true,
      pinSpacing: true,
      scrub: false, // No scrub, we handle scroll manually
      onLeave: () => {
        // Permitir scroll normal cuando se sale del trigger hacia abajo
        if (currentPage === culturaData.length) {
          setIsScrolling(false);
        }
      },
      onEnterBack: () => {
        // Permitir scroll normal cuando se vuelve a entrar desde arriba
        if (currentPage === 1) {
          setIsScrolling(false);
        }
      }
    });

    // Initial setup
    updateMargins(1);

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, { scope: wrapperRef });

  const updateMargins = (page: number) => {
    const leftImages = sceneRef.current?.querySelectorAll('.img-cont.left');
    const rightImages = sceneRef.current?.querySelectorAll('.img-cont.right');

    leftImages?.forEach((img, index) => {
      const helper = -(index);
      const marginMult = helper + page - 1;
      gsap.to(img, {
        marginTop: `${marginMult * 100}vh`,
        duration: 1,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    });

    rightImages?.forEach((img, index) => {
      const helper = index;
      const marginMult = helper - page + 1;
      gsap.to(img, {
        marginTop: `${marginMult * 100}vh`,
        duration: 1,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    });
  };

  const navigateUp = () => {
    if (currentPage > 1 && !isScrolling) {
      setIsScrolling(true);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateMargins(newPage);
      setTimeout(() => setIsScrolling(false), 1000);
    } else if (currentPage === 1) {
      // Si está en la primera página, permitir scroll hacia arriba normalmente
      // Esto deshabilitará temporalmente el ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.disable();
        setTimeout(() => {
          if (scrollTriggerRef.current) {
            scrollTriggerRef.current.enable();
          }
        }, 100);
      }
    }
  };

  const navigateDown = () => {
    if (currentPage < culturaData.length && !isScrolling) {
      setIsScrolling(true);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateMargins(newPage);
      setTimeout(() => setIsScrolling(false), 1000);
    } else if (currentPage === culturaData.length) {
      // Si está en la última página, permitir scroll hacia abajo normalmente
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.disable();
        setTimeout(() => {
          if (scrollTriggerRef.current) {
            scrollTriggerRef.current.enable();
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isScrolling && activeContent === null) {
        e.preventDefault();
        if (e.deltaY < 0) {
          navigateUp();
        } else if (e.deltaY > 0) {
          navigateDown();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScrolling && activeContent === null) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateUp();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateDown();
        }
      }
    };

    const sceneElement = sceneRef.current;
    if (sceneElement) {
      sceneElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (sceneElement) {
        sceneElement.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScrolling, currentPage, activeContent]);

  const handlePageDotClick = (page: number) => {
    if (!isScrolling && activeContent === null) {
      setIsScrolling(true);
      setCurrentPage(page);
      updateMargins(page);
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  const openContent = (blockNumber: number) => {
    setIsSceneActive(true);
    
    // Pause ScrollTrigger
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.disable();
    }
    
    // Add active class to clicked images
    setTimeout(() => {
      const leftImg = sceneRef.current?.querySelector(`.img-cont.left.cont-${blockNumber}`);
      const rightImg = sceneRef.current?.querySelector(`.img-cont.right.cont-${blockNumber}`);
      
      leftImg?.classList.add('active');
      rightImg?.classList.add('active');
      
      // Show content after images expand
      setTimeout(() => {
        setActiveContent(blockNumber);
        const contentEl = contentRefs.current[blockNumber - 1];
        if (contentEl) {
          contentEl.style.display = 'flex';
          
          gsap.set(contentEl, { opacity: 0 });
          gsap.to(contentEl, { 
            opacity: 1, 
            duration: 0.3,
            onComplete: () => {
              // Animate title and text
              const title = contentEl.querySelector('.title');
              const text = contentEl.querySelector('.content-text');
              
              if (title) {
                gsap.to(title, {
                  x: 0,
                  duration: 0.5,
                  ease: 'power3.out'
                });
              }
              
              if (text) {
                gsap.to(text, {
                  scale: 1,
                  opacity: 1,
                  duration: 0.5,
                  delay: 0.1,
                  ease: 'power3.out'
                });
              }
            }
          });
        }
      }, 300);
    }, 300);
  };

  const closeContent = () => {
    const contentElement = contentRefs.current[activeContent! - 1];
    if (contentElement) {
      // First animate text elements out
      const title = contentElement.querySelector('.title');
      const text = contentElement.querySelector('.content-text');
      
      if (title) {
        gsap.to(title, {
          x: '-115%',
          duration: 0.3,
          ease: 'power3.in'
        });
      }
      
      if (text) {
        gsap.to(text, {
          scale: 0.3,
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in'
        });
      }
      
      // Then fade out the container
      gsap.to(contentElement, {
        opacity: 0,
        duration: 0.3,
        delay: 0.2,
        onComplete: () => {
          contentElement.style.display = 'none';
          
          // Remove active class from images with closing class
          const leftImg = sceneRef.current?.querySelector(`.img-cont.left.cont-${activeContent}`);
          const rightImg = sceneRef.current?.querySelector(`.img-cont.right.cont-${activeContent}`);
          
          leftImg?.classList.remove('active');
          leftImg?.classList.add('closing');
          rightImg?.classList.remove('active');
          rightImg?.classList.add('closing');
          
          setTimeout(() => {
            setActiveContent(null);
            setIsSceneActive(false);
            leftImg?.classList.remove('closing');
            rightImg?.classList.remove('closing');
            
            // Re-enable ScrollTrigger
            if (scrollTriggerRef.current) {
              scrollTriggerRef.current.enable();
            }
          }, 300);
        }
      });
    }
  };

  return (
    <div ref={wrapperRef} className="cultura-wrapper" style={{ position: 'relative' }}>
      <div ref={sceneRef} className={`scene ${isSceneActive ? 'active' : ''}`}>
        {culturaData.map((item, index) => (
          <React.Fragment key={item.id}>
            <div
              className={`img-cont left cont-${item.id}`}
              style={{ 
                backgroundImage: `url(${item.leftImage})`,
                marginTop: index === 0 ? '0' : `-${index * 100}vh`
              }}
              onClick={() => !activeContent && !isSceneActive && openContent(item.id)}
              data-helper={-(index)}
              data-blocks={item.id}
            />
            <div
              className={`img-cont right cont-${item.id}`}
              style={{ 
                backgroundImage: `url(${item.rightImage})`,
                marginTop: index === 0 ? '0' : `${index * 100}vh`
              }}
              onClick={() => !activeContent && !isSceneActive && openContent(item.id)}
              data-helper={index}
              data-blocks={item.id}
            />
            <div
              ref={el => contentRefs.current[index] = el}
              className={`content cont-${item.id}`}
              style={{ display: 'none' }}
            >
              <h2 className="title">{item.title}</h2>
              <p className="content-text">{item.content}</p>
              <span className="close" onClick={closeContent}>
                <X size={48} />
              </span>
            </div>
          </React.Fragment>
        ))}
        
        <h1 className="heading">NUESTRA CULTURA</h1>
        <p className="scroll-down">desplázate</p>
        <p className="click-blocks">haz clic en los bloques</p>
        
        <div className="pagination">
          <ul className="page-names">
            {culturaData.map((item) => (
              <li
                key={item.id}
                className={currentPage === item.id ? 'active' : ''}
                data-page={item.id}
              >
                {item.title}
              </li>
            ))}
          </ul>
          <ul className="page-dots">
            {culturaData.map((item) => (
              <li
                key={item.id}
                className={currentPage === item.id ? 'active' : ''}
                data-page={item.id}
                onClick={() => handlePageDotClick(item.id)}
              >
                •
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .cultura-wrapper {
          height: 100vh;
          width: 100%;
        }

        .scene {
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
        }

        .scene.active .heading,
        .scene.active .scroll-down,
        .scene.active .click-blocks,
        .scene.active .pagination {
          opacity: 0;
          z-index: -100;
        }

        .scene.active .heading {
          transform: translateX(-50%) translateY(-50%) scale(0.5);
        }

        .scene.active .scroll-down {
          transform: rotate(-90deg) scale(0.5);
        }

        .scene.active .click-blocks {
          transform: rotate(-90deg) scale(0.5);
        }

        .scene.active .pagination {
          transform: translateX(-50%) translateY(-50%) scale(0.5);
        }

        .scene.active .img-cont.active {
          margin-top: -10vh !important;
          width: 50vw;
          height: 100vh;
          transition: margin 0.3s, width 0.3s, height 0.3s;
          z-index: 500;
        }

        .scene.active .img-cont.active.left {
          margin-left: -50vw;
        }

        .scene.active .img-cont.active.right {
          margin-left: 0;
        }

        .heading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          z-index: 100;
          font-size: 5vw;
          font-weight: 800;
          color: #003f6f;
          opacity: 0.7;
          transition: opacity 0.3s, transform 0.3s;
          will-change: opacity, transform;
        }

        .scroll-down {
          position: absolute;
          bottom: 13%;
          left: 50%;
          transform-origin: 0% 50%;
          transform: rotate(-90deg);
          font-size: 1.3vmax;
          transition: opacity 0.3s, transform 0.3s;
          will-change: opacity, transform;
          z-index: 100;
          color: #333;
          font-family: 'Alliance No.2', sans-serif;
        }

        .click-blocks {
          position: absolute;
          top: 23%;
          left: 50%;
          transform-origin: 0% 50%;
          transform: rotate(-90deg);
          font-size: 1.3vmax;
          transition: opacity 0.3s, transform 0.3s, color 0.3s;
          will-change: opacity, transform;
          z-index: 100;
          color: #333;
          font-family: 'Alliance No.2', sans-serif;
        }

        .pagination {
          position: absolute;
          left: 50%;
          top: 95%;
          transform: translateX(-50%) translateY(-50%);
          transition: opacity 0.3s, transform 0.3s;
          will-change: opacity, transform;
          z-index: 100;
        }

        .pagination .page-names {
          text-align: center;
          margin-bottom: 1vh;
          font-size: 1.2vw;
          list-style: none;
          padding: 0;
          margin: 0 0 1vh 0;
        }

        .pagination .page-names li {
          display: none;
          will-change: opacity;
          font-weight: 700;
          color: #003f6f;
          font-family: 'Alliance No.2', sans-serif;
        }

        .pagination .page-names li.active {
          display: block;
        }

        .pagination .page-dots {
          text-align: center;
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          justify-content: center;
        }

        .pagination .page-dots li {
          margin: 0.3vw;
          cursor: pointer;
          color: #cfcfcf;
          font-size: 1.5rem;
          transition: color 0.3s;
        }

        .pagination .page-dots li.active {
          color: #003f6f;
        }

        .img-cont {
          height: 80vh;
          width: 35vw;
          position: absolute;
          top: 10vh;
          left: 50%;
          background-size: cover;
          background-position: center;
          transition: margin 1s cubic-bezier(0.99, 0.1, 0.35, 1.2);
          will-change: margin;
          z-index: 10;
          background-repeat: no-repeat;
        }

        .img-cont.closing {
          transition: margin 0.3s, width 0.3s, height 0.3s;
        }

        .img-cont:not(.active) {
          cursor: pointer;
        }

        .img-cont:not(.active):hover ~ .click-blocks {
          color: #e84e0f;
        }

        .img-cont.left {
          margin-left: calc(-35vw - 50px);
        }

        .img-cont.right {
          margin-left: 50px;
        }

        .content {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 63, 111, 0.98);
          padding: 4rem;
          overflow-x: hidden;
          overflow-y: auto;
          color: #fff;
          z-index: 2000;
          opacity: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .content .title {
          font-size: 4rem;
          text-transform: uppercase;
          font-weight: 800;
          transform: translateX(-115%);
          margin-bottom: 2rem;
          color: #e84e0f;
          text-align: center;
          width: 100%;
          will-change: transform;
          font-family: 'Alliance No.2', sans-serif;
        }

        .content .content-text {
          font-size: 1.5rem;
          line-height: 1.8;
          max-width: 800px;
          transform-origin: 50% 80%;
          transform: scale(0.3);
          opacity: 0;
          color: #fff;
          text-align: center;
          will-change: transform, opacity;
          font-family: 'Alliance No.2', sans-serif;
        }

        .content .close {
          position: absolute;
          top: 2rem;
          right: 2rem;
          color: #fff;
          cursor: pointer;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content .close:hover {
          color: #e84e0f;
        }

        @media (max-width: 768px) {
          .heading {
            font-size: 8vw;
          }
          
          .img-cont {
            width: 40vw;
            height: 60vh;
            top: 20vh;
          }
          
          .img-cont.left {
            margin-left: calc(-40vw - 25px);
          }
          
          .img-cont.right {
            margin-left: 25px;
          }
          
          .content .title {
            font-size: 2.5rem;
          }
          
          .content .content-text {
            font-size: 1.2rem;
          }
          
          .pagination .page-names {
            font-size: 3vw;
          }
        }
      `}</style>
    </div>
  );
}