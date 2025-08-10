# Plan de Desarrollo - Página "Qué Hacemos"

## Concepto General
Experiencia cinematográfica inmersiva donde el usuario explora los servicios de Métrica DIP como si navegara por un universo visual en construcción. La narrativa visual se desarrolla a través del scroll, transformando una ciudad que cobra vida en una exploración profunda de servicios, con fragmentación de capas, mini-universos por servicio y convergencia final en un símbolo luminoso.

## Fase 1: Hero Dinámico - Ciudad en Construcción (3-4 horas)
### Objetivos:
- Escena animada en bucle de una ciudad construyéndose
- Partículas brillantes que forman iconos de servicios
- Texto flotante con efecto escritura: "¿Cómo transformamos ideas en impacto?"
- Al scrollar, la escena se fragmenta en capas 3D (edificios, iconos, fondo)

### Componentes:
- `app/services/page.tsx` - Página principal
- `components/services/HeroCity.tsx` - Ciudad animada con GSAP
- `components/services/ParticleIcons.tsx` - Partículas que forman iconos
- `components/services/FragmentLayers.tsx` - Sistema de capas fragmentables

### Implementación:
- Canvas 2D para partículas (sin Three.js para mejor performance)
- GSAP timeline para construcción de edificios
- ScrollTrigger para fragmentación en profundidad
- Efecto zoom 0-3D con perspectiva CSS

## Fase 2: Universos de Servicios - Tour Aéreo (4-5 horas)
### Objetivos:
- Cada servicio tiene su "mini-universo" panorámico
- Vista que gira 180° al pasar al siguiente servicio
- Cambios de fondos, luz y tonalidades entre servicios
- Cards emergentes desde el centro con microanimaciones contextuales

### Componentes:
- `components/services/ServiceUniverse.tsx` - Contenedor de universos
- `components/services/PanoramicScene.tsx` - Escena 180° por servicio
- `components/services/EmergentCard.tsx` - Cards con animaciones únicas
- `components/services/ContextualAnimation.tsx` - Mini ilustraciones en bucle

### Efectos:
- Transición de cámara fluida entre escenarios
- Morphing de colores y ambiente
- Iconos que se expanden con gráficos generativos
- Fade-in y bounce para textos inspiradores

## Fase 3: Políticas Full-Screen con Overlays Mutantes (3-4 horas)
### Objetivos:
- Cada política es un slide full-screen fijado
- Icono central con animación secuencial (trazo, color, escala)
- Overlay de color dominante que evoluciona progresivamente
- Halos giratorios con slogans alrededor del icono

### Componentes:
- `components/services/PolicySlide.tsx` - Slide full-screen por política
- `components/services/AnimatedPolicyIcon.tsx` - Icono con DrawSVG
- `components/services/ColorOverlay.tsx` - Sistema de overlays mutantes
- `components/services/RotatingHalos.tsx` - Textos orbitales

### Animaciones:
- Pin-scroll con microanimaciones vectoriales
- Parallax suave del fondo con sensación de profundidad
- Cambio progresivo de colores dominantes
- Rotación y aparición de halos textuales

## Fase 4: Metodología Isométrica Explorable (3-4 horas)
### Objetivos:
- Escenario isométrico que rota revelando 5 etapas
- Cada etapa se ilumina con haz de luz y microanimación
- Perspectiva que gira suavemente mostrando diferentes ángulos
- Tooltips flotantes con descripciones contextuales

### Componentes:
- `components/services/IsometricMethod.tsx` - Escenario 3D isométrico
- `components/services/StageSpotlight.tsx` - Sistema de iluminación
- `components/services/FloatingTooltip.tsx` - Tooltips animados
- `components/services/PerspectiveController.tsx` - Control de rotación

### Implementación:
- CSS 3D transforms para isometría (sin WebGL)
- GSAP para rotaciones suaves y sincronizadas
- Partículas emergentes en cada etapa
- Transiciones con easing personalizado

## Fase 5: Testimonios como Gotas Flotantes (2-3 horas)
### Objetivos:
- Citas en burbujas que emergen como gotas ascendentes
- Fotos de proyectos con efecto focus/blur dinámico
- Bounce-in y rotación ligera al aparecer
- Intensidad emocional con desenfoques contextuales

### Componentes:
- `components/services/TestimonialDrops.tsx` - Sistema de gotas
- `components/services/BubbleQuote.tsx` - Burbujas con citas
- `components/services/DynamicBlur.tsx` - Control de enfoque
- `components/services/EmotionalIntensity.tsx` - Efectos visuales

### Efectos:
- Animación de ascenso con física simulada
- Rotación sutil durante el movimiento
- Transición de blur según proximidad
- Carrusel opcional para desktop

## Fase 6: Convergencia Cinemática Final (3-4 horas)
### Objetivos:
- Elementos de toda la página convergen hacia el centro
- Partículas que se transforman en símbolo luminoso
- Símbolo que explota revelando CTA pulsante
- Degradado vibrante de fondo como cierre emocional

### Componentes:
- `components/services/CinematicConvergence.tsx` - Orquestador de convergencia
- `components/services/ParticleTransform.tsx` - Sistema de partículas
- `components/services/LuminousSymbol.tsx` - Símbolo central animado
- `components/services/PulsingCTA.tsx` - Botón con microanimación

### Animaciones:
- Trayectorias curvas para elementos convergentes
- Morphing de partículas a símbolo
- Explosión con timing preciso
- Pulse animation continuo en CTA

## Fase 7: Polish y Orquestación (2-3 horas)
### Objetivos:
- Sincronización perfecta entre todas las transiciones
- Optimización de performance manteniendo fluidez
- Versión reducida para prefers-reduced-motion
- Testing en dispositivos reales

### Implementación:
- Master timeline con GSAP
- Lazy loading inteligente de assets
- Fallbacks elegantes para móviles básicos
- Métricas de performance y ajustes

## Recursos Necesarios

### Assets Visuales:
- Sprites de edificios para ciudad animada
- Texturas de fondos para cada universo de servicio
- Iconos vectoriales animables para políticas
- Modelos isométricos simplificados para metodología
- Fotos de alta calidad para testimonios
- Partículas y efectos visuales

### Contenido:
- Textos inspiradores por servicio
- Descripciones evocativas de políticas
- Narrativa de metodología por etapas
- Testimonios emotivos y concisos
- Mensajes de cierre impactantes

## Tiempo Total Estimado: 20-25 horas

### Notas Críticas:
- Priorizar transform/opacity pero permitir efectos complejos en momentos clave
- Balance entre inmersión y performance
- Mobile-first pero sin sacrificar la experiencia desktop
- Cada transición debe sentirse coreografiada y significativa
- El usuario debe sentir que explora un mundo, no solo lee información