Fase 1: Detección del Centro

  1. ScrollTrigger start: Cuando el centro del carousel llegue al centro del viewport
  2. Pin inmediato: Fijar la sección en ese punto exacto
  3. Cálculo dinámico: start: "center center" para el trigger

  Fase 2: Secuencia de Animación

  1. Usuario hace scroll → Carousel llega al centro vertical
  2. Pin activado → Sección se fija
  3. Timeline de expansión:
     - 0-20%: Fade out título/subtítulo
     - 20-50%: Carousel crece desde centro a 100vw x 100vh
     - 50-70%: Hold (mantener expandido mientras scrollea)
     - 70-90%: Contracción de vuelta al tamaño original
     - 90-100%: Fade in título/subtítulo
  4. Unpin → Continúa scroll normal

  Fase 3: Implementación Técnica

  ScrollTrigger Configuration:
  scrollTrigger: {
    trigger: carouselRef,
    start: "center center",    // Cuando centro del carousel = centro viewport
    end: "+=300%",            // Duración del efecto
    pin: true,                // Fijar sección
    scrub: 1,                 // Suave con scroll
    pinSpacing: true,         // Mantener espacio
  }

  Transform Strategy:
  - Usar scale en lugar de width/height
  - transform-origin: center center
  - Calcular scale factor basado en viewport vs carousel size

  Lo que necesitamos:

  1. Ref del carousel wrapper específicamente
  2. Medir dimensiones del carousel vs viewport
  3. Z-index alto durante expansión
  4. Desactivar interacciones del carousel durante animación