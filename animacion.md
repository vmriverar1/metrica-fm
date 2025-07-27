# Documentación de Animaciones - Eden Coliving

## Librerías Utilizadas

### 1. GSAP (GreenSock Animation Platform)
- **Archivo**: `public/js/gsap.min.js`
- **Propósito**: Librería principal para animaciones avanzadas
- **Plugins**: ScrollTrigger (`public/js/ScrollTrigger.min.js`)

### 2. Locomotive Scroll
- **Archivo**: `public/js/locomotive-scroll.min.js`
- **CSS**: `public/css/locomotive-scroll.css`
- **Propósito**: Scroll suave y parallax avanzado
- **Condición**: Se activa solo cuando el HTML tiene la clase `has-scroll-smooth`

---

## Sistemas de Animación

### 1. **Preloader Animation System**
- **Archivo**: `public/js/preloader.js`
- **Propósito**: Animación de carga inicial con logo
- **Lógica**: 
  - Aparición del logo con scale y opacity
  - Animación de pulso con clase CSS
  - Desaparición completa con evento `preloaderComplete`
- **Condiciones**: Solo se ejecuta si existe `.preloader` en el DOM
- **Eventos**: Emite `preloaderComplete` al finalizar

### 2. **Header Animation System**
- **Archivo**: `public/js/animations.js` (función `initHeaderAnimation`)
- **Propósito**: Header dinámico que se oculta/muestra al hacer scroll
- **Lógica**:
  - Oculta header al hacer scroll down
  - Muestra header al hacer scroll up
  - Cambia transparencia basado en posición de scroll
- **Condiciones**: Se ejecuta si existe `.site-header`
- **Integración**: Compatible con Locomotive Scroll y scroll nativo

### 3. **Banner Hero Animation System**
- **Archivo**: `public/js/animations.js` (función `initBannerAnimations`)
- **Propósito**: Efecto parallax y fade en el banner principal
- **Lógica**: 
  - Animación inicial del asterisco (entrada desde izquierda con rotación)
  - Efecto parallax con fade y blur durante scroll
  - Animación de entrada escalonada para contenido
- **Condiciones**: Se activa si existe `#hero-banner`
- **Valores**: Fade de 50% de altura del banner

### 4. **Coliving Hero Video System**
- **Archivo**: `public/js/coliving-hero.js`
- **Propósito**: Animación compleja del hero con videos
- **Lógica**:
  - **Fase 1 (0-50%)**: Desaparición secuencial de paneles de video
  - **Fase 2 (50-100%)**: Fade out del fondo con blur
  - Timeline maestra con 100 unidades de duración
  - Animación de entrada con zoom inverso (scale 3 → 1)
- **Condiciones**: Se activa si existe `#video-banner`
- **Integración**: Compatible con Locomotive Scroll y scroll nativo

### 5. **Mobile Menu Animation System**
- **Archivo**: `public/js/animations.js` (función `initMobileMenu`)
- **Propósito**: Menú móvil animado con GSAP
- **Lógica**:
  - Calcula altura dinámica del contenido
  - Animación de apertura con height y opacity
  - Cambio de iconos hamburger ↔ X
- **Condiciones**: Se activa si existen `#menu-btn` y `#mobile-menu`
- **Duración**: 0.4s apertura, 0.3s cierre

### 6. **About Coliving Animation System**
- **Archivo**: `public/js/animations.js` (función `initAboutColivingAnimations`)
- **Propósito**: Animaciones sutiles para la sección About
- **Lógica**:
  - Entrada suave de imagen central (scale 0.9 → 1)
  - Efecto parallax moderado durante scroll
  - Animación escalonada de columnas de texto
  - Hover effects con scale y box-shadow
- **Condiciones**: Se activa si existe `#about-coliving-section`
- **Valores**: Parallax de -20px, scale hasta 1.02

### 7. **Three Steps Animation System**
- **Archivo**: `public/js/animations.js` (función `initThreeStepsAnimation`)
- **Propósito**: Animación dramática de zoom inverso para pasos
- **Lógica**:
  - Estado inicial: scale 2.5 (súper grande)
  - Animación secuencial con delay escalonado
  - Efecto hover con highlight sutil
  - Destello final de brightness
- **Condiciones**: Se activa si existe `#three-steps-section`
- **Duración**: 0.7s por paso, delay de 0.7s entre pasos

### 8. **Property Management Animation System**
- **Archivo**: `public/js/animations.js` (función `initPropertyManagementAnimations`)
- **Propósito**: Barra de progreso y animaciones de tarjetas
- **Lógica**:
  - **Barra de progreso**: Crece de 0% a 100% durante scroll
  - **Tarjetas**: Zoom inverso (scale 2.5 → 1) con stagger
  - Hover effects con elevación y rotación
- **Condiciones**: Se activa si existe `#property-management`
- **Valores**: Tarjetas con stagger de 1s, progreso con scrub

### 9. **Property Cards Animation System**
- **Archivo**: `public/js/animations.js` (función `initPropertyCardAnimations`)
- **Propósito**: Animaciones para tarjetas de propiedades
- **Lógica**:
  - Entrada desde abajo (y: 50 → 0)
  - Delay escalonado por índice
  - Hover con elevación y sombra
- **Condiciones**: Se activa si existen `.property-card`
- **Valores**: 0.2s delay por tarjeta, elevación de -10px

### 10. **Passion Section Animation System**
- **Archivo**: `public/js/animations.js` (función `initPassionSectionAnimations`)
- **Propósito**: Animaciones para sección "Somos apasionados"
- **Lógica**:
  - Entrada dramática de imágenes (scale 0.7 → 1)
  - Efecto de brillo en hover con overlay
  - Animación escalonada con stagger 0.4s
  - Botón con entrada retardada (delay 0.8s)
- **Condiciones**: Se activa si existe `#about-passion`
- **Efectos**: Brillo con gradiente blanco, scale 1.05 en hover

### 11. **Features Animation System**
- **Archivo**: `public/js/animations.js` (función `initFeaturesAnimations`)
- **Propósito**: Animaciones súper dramáticas para características
- **Lógica**:
  - **Activación**: Cuando 70% de la sección es visible
  - **Tarjetas**: Zoom inverso extremo (scale 0.1 → 1)
  - **Título**: Elastic bounce con destello
  - **Hover**: Elevación, rotación y efectos de brillo
  - **Fondo**: Animación continua de scale mientras esté visible
- **Condiciones**: Se activa si existe `#section-features`
- **Valores**: Stagger 0.6s, elastic bounce, brightness 1.3

### 12. **Passion Mobile Slider System**
- **Archivo**: `public/js/animations.js` (función `initPassionSlider`)
- **Propósito**: Slider automático solo para móvil
- **Lógica**:
  - Autoplay cada 4 segundos
  - Navegación con dots
  - Pausa y reanudación inteligente
- **Condiciones**: Solo se activa si `window.innerWidth <= 767`
- **Duración**: 4s autoplay, 2s pausa tras interacción

### 13. **Testimonials Animation System**
- **Archivo**: `public/js/animations.js` (función `initTestimonialsAnimations`)
- **Propósito**: Sistema de carousel de testimonios
- **Lógica**:
  - Función principal + fallback
  - Configuración responsive del ancho
  - Visibilidad y opacidad automáticas
- **Condiciones**: Se activa si existe `#testimonials-section`
- **Fallback**: Configuración básica si falla la función principal

### 14. **Carousel 3D Parallax System**
- **Archivo**: `public/js/carousel-parallax-3d.js`
- **Propósito**: Carousel con efecto parallax 3D
- **Lógica**:
  - Separación vertical basada en scroll
  - Z-index dinámico para profundidad
  - Transiciones suaves con cubic-bezier
  - Soporte para gestos táctiles
- **Condiciones**: Se activa si existe `#parallax-carousel`
- **Valores**: 30px separación máxima, z-index 10-100

### 15. **Comunidad Slider System**
- **Archivo**: `public/js/comunidad-slider.js`
- **Propósito**: Slider circular para comunidad
- **Lógica**:
  - 3 imágenes visibles: central + 2 laterales
  - Navegación circular infinita
  - Posiciones con stack apilado
  - Soporte para teclado y gestos
- **Condiciones**: Se activa si existen `.slide-item`
- **Posiciones**: 7 posiciones (centro, laterales, stacks ocultos)

### 16. **Landlords Video Section System**
- **Archivo**: `public/js/landlords-video-section.js`
- **Propósito**: Reproductor de video con controles animados
- **Lógica**:
  - Botón play/pause con animaciones GSAP
  - Hover effects con scale y background
  - Gestión de visibilidad de página
  - Controles táctiles con timeout
- **Condiciones**: Se activa si existe `#testimonials-section` con video
- **Efectos**: Scale 1.1 en hover, fade 0.3s

### 17. **Scroll Down Button System**
- **Archivo**: `public/js/animations.js` (función `initScrollDownButton`)
- **Propósito**: Botón de scroll animado hacia siguiente sección
- **Lógica**:
  - Scroll suave hacia sección siguiente
  - Duración lenta (2s) con easing personalizado
  - Compatible con Locomotive Scroll
- **Condiciones**: Se activa si existe `#scroll-down-btn`
- **Duración**: 2s con easing custom para suavidad

---

## Condiciones de Activación

### Detección de Locomotive Scroll
```javascript
const usesLocomotiveScroll = document.documentElement.classList.contains('has-scroll-smooth');
```

### Detección de Preloader
```javascript
const hasPreloader = document.querySelector('.preloader') !== null;
```

### Inicialización Condicional
- Si hay preloader: espera evento `preloaderComplete`
- Si no hay preloader: inicializa inmediatamente en `DOMContentLoaded`

---

## Rendimiento y Optimización

### Will-Change Properties
- Se aplica `will-change: transform` a elementos animados
- Se remueve después de animaciones para optimizar memoria

### Scroll Optimization
- Transiciones desactivadas durante scroll rápido
- Timeout para reactivar tras scroll
- Eventos pasivos para mejor rendimiento

### Timeline Management
- Timelines maestras para control granular
- Seek manual para sincronización precisa
- Cleanup automático en leave/enterBack

---

## Breakpoints y Responsive

### Mobile First
- Passion slider: solo activo en móvil (≤767px)
- Carousel: configuración diferente para desktop/mobile

### Responsive Adjustments
- Locomotive Scroll: configuración específica para smartphone/tablet
- Animaciones: delays y duraciones ajustadas por dispositivo

---

## Debugging y Monitoreo

### Console Logging
- Logs informativos para inicialización
- Debugging de progress en timelines
- Verificación de elementos encontrados

### Fallback Systems
- Scroll nativo como fallback de Locomotive
- Testimonials fallback si función principal falla
- Verificación de librerías antes de uso

---

## Integración con ScrollTrigger

### Configuración Base
```javascript
ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    pinType: scrollContainer.style.transform ? "transform" : "fixed"
});
```

### Sincronización
- `locoScroll.on('scroll', ScrollTrigger.update)`
- `ScrollTrigger.addEventListener('refresh', () => locoScroll.update())`

---

## Naming Conventions

### Funciones
- `init[SectionName]Animations()` - Inicialización de animaciones
- `init[Component]()` - Inicialización de componentes
- `setup[Type]Effects()` - Configuración de efectos

### Classes CSS
- `.active` - Estado activo
- `.scrolled` - Estado con scroll
- `.is-loading` - Estado de carga
- `.has-scroll-smooth` - Indicador de Locomotive Scroll

### IDs
- `#hero-banner` - Banner principal
- `#video-banner` - Banner de video
- `#three-steps-section` - Sección de pasos
- `#property-management` - Gestión de propiedades
- `#about-passion` - Sección pasión
- `#section-features` - Sección características