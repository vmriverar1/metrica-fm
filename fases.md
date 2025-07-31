# Plan de Implementación: Scroll Horizontal para DIP y Políticas

## Visión General
Transformar las secciones "¿Qué es DIP?" (Pillars) y "Nuestras políticas" (Policies) en carousels horizontales interactivos usando Swiper.js con GSAP ScrollTrigger, similar al ejemplo en html/horizontal-scroll.html pero adaptado a la identidad de Métrica.

## Características Principales
- **Scroll sincronizado**: El carousel avanza automáticamente con el scroll del usuario
- **Cards visuales**: Cada pilar/política tendrá imagen + texto descriptivo
- **Direcciones opuestas**: DIP de derecha a izquierda, Políticas de izquierda a derecha
- **Responsive**: Adaptación móvil con touch gestures
- **Animaciones suaves**: Fade-in y movimiento ascendente en títulos

---

## Fase 1: Preparación y Estructura Base
**Duración estimada**: 3-4 horas

### Objetivos:
- Instalar dependencias necesarias (Swiper)
- Crear estructura HTML de cards
- Establecer estilos base con colores de Métrica

### Tareas Técnicas:

#### 1.1 Instalación de Swiper
```bash
npm install swiper
```

#### 1.2 Estructura de Cards para Pillars (¿Qué es DIP?)
- Convertir los 6 pilares actuales en cards tipo Swiper
- Estructura por card:
  - Imagen representativa (aspect-ratio 8:5)
  - Título del pilar
  - Descripción breve
  - Indicador visual (ícono actual)

#### 1.3 Estructura de Cards para Policies
- Identificar y estructurar las políticas existentes
- Mismo formato que Pillars pero con diferentes imágenes
- Mantener coherencia visual

#### 1.4 Estilos Base
- Variables CSS para el carousel:
  ```css
  --swiper-column-gap: 1.5rem
  --swiper-slides-perview: 2.25 (desktop) / 1.05 (mobile)
  --media-aspect-ratio: 8/5
  ```
- Colores corporativos:
  - Fondo cards: #1D1D1B con opacity
  - Acentos: #E84E0F (naranja)
  - Texto: #D7D3CB
  - Hover effects con #003F6F (azul)

### Entregables:
- Componente PillarsCarousel.tsx
- Componente PoliciesCarousel.tsx
- Estilos base integrados con Tailwind
- Imágenes placeholder para cada card

---

## Fase 2: Animaciones de Entrada
**Duración estimada**: 2 horas

### Objetivos:
- Implementar animaciones de aparición para títulos
- Crear efectos de fade y movimiento

### Tareas Técnicas:

#### 2.1 Fade-in para Títulos
- ScrollTrigger para detectar entrada en viewport
- Animación con GSAP:
  ```javascript
  gsap.from(titleRef.current, {
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out'
  })
  ```

#### 2.2 Movimiento Ascendente
- Combinar con fade-in:
  ```javascript
  gsap.from(titleRef.current, {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power4.out'
  })
  ```

#### 2.3 Stagger para Subtítulos
- Delay progresivo en palabras del subtítulo
- Efecto de construcción del texto

### Entregables:
- Animaciones de entrada implementadas
- Hooks personalizados para reutilizar

---

## Fase 3: Scroll Horizontal Sincronizado
**Duración estimada**: 4-5 horas

### Objetivos:
- Implementar scroll horizontal controlado por scroll vertical
- Configurar direcciones opuestas para cada sección
- Optimizar performance

### Tareas Técnicas:

#### 3.1 Configuración de Swiper
```javascript
const swiperOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 0,
  speed: 700,
  grabCursor: true,
  watchSlidesProgress: true
}
```

#### 3.2 ScrollTrigger para Pillars (R→L)
```javascript
gsap.to(proxy, {
  progress: 1,
  scrollTrigger: {
    trigger: pillarsSection,
    pin: true,
    scrub: 1,
    start: 'top top',
    end: '+=200%' // 2x altura viewport
  }
})
```

#### 3.3 ScrollTrigger para Policies (L→R)
```javascript
// scrubDir: -1 para dirección inversa
```

#### 3.4 Sincronización Swiper-Scroll
- Traducir progreso de scroll a posición del carousel
- Smooth transitions entre slides
- Control de velocidad y easing

### Optimizaciones:
- `will-change: transform` en slides activos
- Lazy loading de imágenes fuera de viewport
- RequestAnimationFrame para animaciones fluidas

### Entregables:
- Scroll horizontal funcional en ambas secciones
- Direcciones configuradas (R→L y L→R)
- Performance optimizada

---

## Fase 4: Interactividad y Polish
**Duración estimada**: 2-3 horas

### Objetivos:
- Añadir navegación manual opcional
- Efectos hover y focus
- Indicadores de progreso

### Tareas:

#### 4.1 Navegación Manual (Desktop)
- Flechas de navegación que aparecen on hover
- Click para avanzar/retroceder slides
- Ocultar en móviles

#### 4.2 Efectos Visuales
- Opacity gradient en slides no activos
- Scale sutil en slide central
- Glow effect en hover
- Transiciones suaves

#### 4.3 Indicadores
- Dots de paginación opcional
- Progress bar sutil
- Current/Total counter

### Entregables:
- Experiencia interactiva completa
- Efectos visuales pulidos
- Navegación intuitiva

---

## Fase 5: Responsive y Testing
**Duración estimada**: 2 horas

### Objetivos:
- Adaptar para todos los dispositivos
- Testing cross-browser
- Optimización final

### Tareas:

#### 5.1 Mobile Adaptations
- Touch gestures nativos
- Reducir slides visibles (1.05)
- Ajustar espaciados
- Desactivar efectos pesados

#### 5.2 Tablet Optimization
- Slides intermedios (1.5-2)
- Mantener interactividad
- Balance visual

#### 5.3 Testing
- Chrome, Firefox, Safari, Edge
- iOS Safari particularidades
- Android Chrome
- Performance metrics

### Entregables:
- Responsive perfecto
- Cross-browser compatible
- Documentation actualizada

---

## Consideraciones Técnicas

### Dependencias
- **Swiper**: ^11.x para el carousel
- **GSAP**: Ya instalado (ScrollTrigger, DrawSVG)
- **React**: Hooks para gestión de estado

### Performance
- Intersection Observer para lazy load
- Transform3d para GPU acceleration
- Debounce en resize events
- Virtual slides si > 20 cards

### Accesibilidad
- Keyboard navigation
- ARIA labels
- Focus indicators
- Reduced motion support

### Integración
- Mantener consistencia con resto del sitio
- Reusar componentes UI existentes
- Seguir patrones de animación establecidos

---

## Tiempo Total: 13-16 horas

### Distribución:
- Fase 1: 25% (estructura base)
- Fase 2: 15% (animaciones)
- Fase 3: 35% (funcionalidad core)
- Fase 4: 15% (polish)
- Fase 5: 10% (responsive)

### Riesgos:
- Complejidad de sincronización scroll-swiper
- Performance en móviles antiguos
- Compatibilidad con navegadores legacy

### Mitigación:
- Fallback a scroll normal si no hay soporte
- Progressive enhancement
- Testing continuo durante desarrollo