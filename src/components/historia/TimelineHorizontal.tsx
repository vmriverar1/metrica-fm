'use client';

import React, { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import HitoFullScreen from './HitoFullScreen';
import ProgressIndicator from './ProgressIndicator';
import HitoPanel from './HitoPanel';
import FloatingElements from './FloatingElements';

// Datos extendidos para cada hito
const hitosExtendidos = {
  1: {
    longDescription: 'En 2010, un grupo de profesionales visionarios decidió transformar la forma en que se gestionan los proyectos de infraestructura en el Perú. Con una oficina modesta pero llena de sueños, Métrica DIP dio sus primeros pasos hacia lo que hoy es una empresa líder en el sector.',
    achievements: [
      { number: '5', label: 'Profesionales fundadores' },
      { number: '1', label: 'Oficina inaugural' },
      { number: '3', label: 'Primeros clientes' },
      { number: '100%', label: 'Pasión y compromiso' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/04.jpg'
    ],
    quote: 'El éxito no se mide solo en números, sino en la confianza que construimos cada día.',
    quoteAuthor: 'Equipo Fundador'
  },
  2: {
    longDescription: 'Cinco años después de nuestra fundación, Métrica DIP experimentó un crecimiento exponencial. La calidad de nuestro trabajo y el compromiso con cada proyecto nos abrió las puertas a proyectos de mayor envergadura en todo el territorio nacional.',
    achievements: [
      { number: '50+', label: 'Proyectos completados' },
      { number: '15', label: 'Regiones del Perú' },
      { number: '30', label: 'Profesionales especializados' },
      { number: '98%', label: 'Satisfacción del cliente' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/05.jpg'
    ]
  },
  3: {
    longDescription: 'La obtención de la certificación ISO 9001 marcó un hito fundamental en nuestra historia. Este logro no solo validó nuestros procesos y metodologías, sino que nos posicionó como una empresa con estándares internacionales de calidad.',
    achievements: [
      { number: 'ISO 9001', label: 'Certificación obtenida' },
      { number: '100+', label: 'Procesos optimizados' },
      { number: '0', label: 'No conformidades críticas' },
      { number: '24/7', label: 'Mejora continua' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/06.jpg'
    ],
    quote: 'La excelencia no es un destino, es un viaje constante de mejora y aprendizaje.',
    quoteAuthor: 'Director de Calidad'
  },
  4: {
    longDescription: 'El 2020 puso a prueba nuestra capacidad de adaptación. Mientras el mundo enfrentaba desafíos sin precedentes, Métrica DIP demostró su resiliencia manteniendo la continuidad de todos sus proyectos y apoyando a sus clientes en momentos críticos.',
    achievements: [
      { number: '100%', label: 'Continuidad operativa' },
      { number: '0', label: 'Proyectos detenidos' },
      { number: '90%', label: 'Equipo en trabajo remoto' },
      { number: '50+', label: 'Protocolos implementados' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/03.jpg'
    ]
  },
  5: {
    longDescription: 'La transformación digital llegó para quedarse. En 2023, integramos tecnologías BIM y prácticas sostenibles en todos nuestros procesos, marcando el inicio de una nueva era en la gestión de proyectos de infraestructura.',
    achievements: [
      { number: 'BIM', label: 'Metodología implementada' },
      { number: '80%', label: 'Reducción de errores' },
      { number: '30%', label: 'Ahorro en recursos' },
      { number: '100%', label: 'Proyectos digitalizados' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/04.jpg'
    ],
    quote: 'La innovación no es solo adoptar tecnología, es transformar la forma en que creamos valor.',
    quoteAuthor: 'Director de Innovación'
  },
  6: {
    longDescription: 'Hoy, Métrica DIP se consolida como líder indiscutible en la dirección integral de proyectos. Con más de 200 proyectos exitosos y un equipo de profesionales apasionados, miramos al futuro con la misma ilusión del primer día.',
    achievements: [
      { number: '200+', label: 'Proyectos exitosos' },
      { number: '50+', label: 'Profesionales expertos' },
      { number: '14', label: 'Años de experiencia' },
      { number: '#1', label: 'Líder del sector' }
    ],
    gallery: [
      'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
      'https://metrica-dip.com/images/slider-inicio-es/05.jpg'
    ]
  }
};

// Datos de los hitos históricos
const hitos = [
  {
    id: 1,
    year: '2010',
    title: 'Fundación',
    subtitle: 'El inicio de un sueño',
    description: 'Métrica DIP nace con la visión de transformar la dirección de proyectos en el Perú. Un equipo de profesionales apasionados se une para crear una empresa que marcaría la diferencia en el sector de infraestructura.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    highlights: ['Primer proyecto', 'Equipo fundador', 'Visión establecida']
  },
  {
    id: 2,
    year: '2015',
    title: 'Expansión',
    subtitle: 'Primeros grandes proyectos',
    description: 'Consolidamos nuestra presencia con proyectos de infraestructura a nivel nacional. La confianza de nuestros clientes nos impulsa a crecer y asumir desafíos cada vez más grandes.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    highlights: ['50+ proyectos', 'Presencia nacional', 'Equipo especializado']
  },
  {
    id: 3,
    year: '2018',
    title: 'Certificación ISO',
    subtitle: 'Excelencia reconocida',
    description: 'Obtenemos la certificación ISO 9001, reafirmando nuestro compromiso con la calidad. Este logro nos posiciona como líderes en gestión de proyectos con estándares internacionales.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    highlights: ['ISO 9001', 'Procesos optimizados', 'Calidad garantizada']
  },
  {
    id: 4,
    year: '2020',
    title: 'Resiliencia',
    subtitle: 'Adaptación y crecimiento',
    description: 'Superamos desafíos globales manteniendo la continuidad de nuestros servicios. La innovación y adaptabilidad nos permiten seguir adelante con todos nuestros proyectos.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    highlights: ['Continuidad operativa', 'Trabajo remoto', 'Cero retrasos']
  },
  {
    id: 5,
    year: '2023',
    title: 'Innovación',
    subtitle: 'Tecnología y sostenibilidad',
    description: 'Integramos tecnologías BIM y prácticas sostenibles en nuestros procesos. La transformación digital nos permite ofrecer soluciones más eficientes y responsables con el medio ambiente.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    highlights: ['Metodología BIM', 'Proyectos sostenibles', 'Digitalización']
  },
  {
    id: 6,
    year: '2024',
    title: 'Presente',
    subtitle: 'Líderes en dirección de proyectos',
    description: 'Más de 200 proyectos exitosos nos posicionan como referentes del sector. Miramos al futuro con la experiencia acumulada y la pasión intacta del primer día.',
    image: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    highlights: ['200+ proyectos', 'Líder del sector', 'Visión de futuro']
  }
];

export default function TimelineHorizontal() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    if (!sectionRef.current || !wrapperRef.current) return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const totalWidth = (hitos.length - 1) * 100; // Porcentaje total de desplazamiento
    
    // Animación de revelado cuando entramos a la sección
    if (revealRef.current) {
      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%', // Empieza más tarde
          end: 'top top',   // Termina cuando el timeline está completamente visible
          scrub: 1,
          onUpdate: undefined,
          onEnter: () => {
            // Optional: handle when entering the trigger
          },
          onLeave: () => {
            if (revealRef.current) {
              gsap.set(revealRef.current, { display: 'none' });
            }
          },
          onEnterBack: () => {
            if (revealRef.current) {
              gsap.set(revealRef.current, { display: 'block', opacity: 1 });
            }
          },
          onLeaveBack: undefined
        }
      });

      // Primera parte: el overlay se mantiene negro sólido
      revealTimeline
        .set(revealRef.current, { opacity: 1, display: 'block' })
        .to(revealRef.current, {
          opacity: 0.9,
          duration: 0.3,
          ease: 'power2.in'
        })
        .to(revealRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out'
        });
    }

    // Timeline principal con ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (hitos.length - 1)}`, // Altura correcta: n-1 transiciones
        scrub: 1,
        pin: true,
        snap: {
          snapTo: 1 / (hitos.length - 1),
          duration: { min: 0.4, max: 0.8 },
          delay: 0,
          ease: "power2.inOut"
        },
        onUpdate: (self) => {
          const newProgress = self.progress * 100;
          setProgress(newProgress);
          
          // Actualizar índice activo
          const newIndex = Math.round(self.progress * (hitos.length - 1));
          const clampedIndex = Math.max(0, Math.min(newIndex, hitos.length - 1));
          
          
          setActiveIndex(clampedIndex);
          
          // Calcular velocidad para efectos de blur
          const currentVelocity = Math.abs(self.getVelocity() / 1000);
          setVelocity(Math.min(currentVelocity, 3));
        },
        onScrubComplete: () => {
          setVelocity(0);
        }
      }
    });

    // Guardar referencia al ScrollTrigger
    scrollTriggerRef.current = tl.scrollTrigger ?? null;

    // Animación horizontal del timeline
    tl.to(wrapper, {
      x: () => `-${(hitos.length - 1) * window.innerWidth}px`, // Usar píxeles para precisión
      ease: 'none',
      duration: 1
    });
    
    
  }, { scope: sectionRef });

  const handleDotClick = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st || index === activeIndex) return;

    const targetProgress = index / (hitos.length - 1);
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    
    // NO actualizar activeIndex aquí - dejar que ScrollTrigger lo maneje
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={sectionRef} 
      id="timeline-horizontal-section"
      className="relative bg-background overflow-hidden"
      style={{ height: '100vh' }}
    >
        {/* Capa de revelado negro con degradado que se desvanece */}
        <div 
          ref={revealRef}
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.8) 30%, black 50%, black 100%)'
          }}
        />

        {/* Efectos de transición cinematográfica */}
        <div className="fixed inset-0 pointer-events-none z-10">
        {/* Barras cinematográficas */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Viñeta */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.3) 100%)'
        }} />
      </div>

      {/* Elementos flotantes que acompañan el movimiento */}
      <FloatingElements velocity={velocity} activeIndex={activeIndex} />
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <ProgressIndicator 
          progress={progress} 
          hitos={hitos} 
          activeIndex={activeIndex}
          onDotClick={handleDotClick}
        />
      </div>

      {/* Timeline Wrapper con efecto de blur dinámico */}
      <div 
        ref={wrapperRef}
        className="flex h-full"
        style={{ 
          filter: `blur(${velocity * 2}px)`
          // Width se maneja automáticamente por flex y los hijos w-screen
        }}
      >
        {hitos.map((hito, index) => (
          <HitoFullScreen 
            key={hito.id} 
            hito={hito} 
            index={index}
            isActive={index === activeIndex}
            showPanel={showPanel && index === activeIndex}
            onTogglePanel={() => setShowPanel(!showPanel)}
          />
        ))}
      </div>

      {/* Panel lateral con información detallada */}
      {hitos.map((hito, index) => (
        <HitoPanel
          key={hito.id}
          isActive={index === activeIndex && showPanel}
          hitoData={hitosExtendidos[hito.id as keyof typeof hitosExtendidos]}
          color={index % 2 === 0 ? '#E84E0F' : '#003F6F'}
        />
      ))}
    </section>
  );
}