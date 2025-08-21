# Plan de Implementación Detallado - Portafolio de Proyectos Métrica DIP

## 🎯 Visión General
Crear una experiencia visual inmersiva y minimalista para mostrar el portafolio de proyectos de Métrica DIP, con componentes reutilizables y efectos de movimiento sofisticados.

## 📋 Fases de Implementación

### Fase 1: Arquitectura y Componentes Base (DETALLADO)
**Objetivo**: Establecer la estructura de componentes reutilizables con TypeScript estricto

#### 1.1 ProjectCard Component (`/src/components/portfolio/ProjectCard.tsx`)
```typescript
// Estructura del componente con props tipadas
interface ProjectCardProps {
  title: string;              // "Centro Comercial Plaza Norte"
  location: string;           // "Lima, Perú"
  type: ProjectCategory;      // "retail" | "oficina" | "industria" etc.
  image: string;             // URL de imagen principal
  slug: string;              // "plaza-norte-lima"
  area?: string;             // "45,000 m²"
  year?: number;             // 2023
  onHover?: (isHovered: boolean) => void;
}

// Implementación específica:
- Container: aspect-ratio 4:3, overflow hidden, position relative
- Image: object-cover, scale(1) → scale(1.05) en hover con duration-700
- Overlay gradient: bg-gradient-to-t from-black/70 via-black/20 to-transparent
- Content box: absolute bottom-0, padding-6, transform translateY(20px) → translateY(0)
- Title: text-white font-bold text-xl, opacity 0 → 1
- Metadata: text-white/80 text-sm con iconos (MapPin, Calendar, Ruler)
- Hover effects: 
  * Container: shadow-2xl con transition
  * Borde luminoso: box-shadow 0 0 30px rgba(232, 78, 15, 0.3)
  * Cursor magnético: track mouse position y aplicar transform sutil
```

#### 1.2 ProjectFilter Component (`/src/components/portfolio/ProjectFilter.tsx`)
```typescript
// Estado de filtros con tipos estrictos
interface FilterState {
  category: ProjectCategory | 'all';
  location: string | 'all';
  year: number | 'all';
  searchTerm: string;
}

// UI específica:
- Pills/Chips design para categorías con colores según tipo:
  * oficina: bg-blue-500/10 text-blue-500
  * retail: bg-orange-500/10 text-orange-500
  * industria: bg-gray-500/10 text-gray-500
  * etc.
- Dropdown minimalista para ubicaciones con search interno
- Slider para rango de años con tooltips
- Search input con debounce de 300ms
- Animación al cambiar filtros: opacity 1 → 0.5 → 1
- Counter animado mostrando resultados: "Mostrando 24 proyectos"
```

#### 1.3 Estructura de Datos y Types (`/src/types/portfolio.ts`)
```typescript
// Enums para categorías con valores específicos
enum ProjectCategory {
  OFICINA = 'oficina',
  RETAIL = 'retail',
  INDUSTRIA = 'industria',
  HOTELERIA = 'hoteleria',
  EDUCACION = 'educacion',
  VIVIENDA = 'vivienda',
  SALUD = 'salud'
}

// Tipos para imágenes de galería
interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  stage: 'inicio' | 'proceso' | 'final';
  order: number;
}

// Detalles técnicos del proyecto
interface ProjectDetails {
  client: string;
  duration: string;           // "18 meses"
  investment?: string;        // "$15M USD"
  team: string[];            // ["Arquitectura", "Ingeniería", "Supervisión"]
  certifications?: string[]; // ["LEED Gold", "ISO 9001"]
}

// Interface principal del proyecto
interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  location: {
    city: string;
    region: string;
    address?: string;
    coordinates: [number, number]; // [lat, lng]
  };
  featuredImage: string;
  thumbnailImage: string;
  gallery: GalleryImage[];
  description: string;
  shortDescription: string;    // Para cards y previews
  details: ProjectDetails;
  featured: boolean;          // Para destacar en home
  completedAt: Date;
  tags: string[];            // ["sostenible", "premiado", "innovador"]
}
```

#### 1.4 Context para Estado Global (`/src/contexts/PortfolioContext.tsx`)
```typescript
// Crear context con:
- Lista completa de proyectos
- Proyectos filtrados
- Estado de filtros activos
- Funciones de filtrado con memoización
- Loading states
- Proyecto seleccionado actual
- Historia de navegación en portfolio
```

### Fase 2: Página Principal del Portafolio (DETALLADO)
**Ruta**: `/portfolio` y subpáginas `/portfolio/[categoria]`

#### 2.1 Hero Section (`/src/components/portfolio/PortfolioHero.tsx`)
```typescript
// Estructura visual específica:
- Height: 60vh en desktop, 50vh en mobile
- Background: imagen con overlay gradient + efecto parallax (translateY basado en scroll)
- Título principal:
  * Font-size: clamp(2.5rem, 5vw, 4rem)
  * Efecto glitch sutil: duplicar texto con offset y animación
  * Split text animation: cada palabra aparece con delay incremental
- Subtítulo: fade-in-up con delay de 500ms
- Estadísticas animadas:
  * "+200 Proyectos" - counter animation de 0 a 200
  * "15 Años" - counter de 0 a 15
  * "7 Categorías" - fade in secuencial
  * Usar Intersection Observer para trigger
```

#### 2.2 Galería Grid (`/src/components/portfolio/ProjectGrid.tsx`)
```typescript
// Layout específico:
- CSS Grid con template: repeat(auto-fill, minmax(350px, 1fr))
- Gap: 2rem
- Animación de entrada:
  * Usar GSAP ScrollTrigger
  * Stagger: 0.1s entre cards
  * From: opacity 0, y: 50px, scale: 0.9
  * To: opacity 1, y: 0, scale: 1
  * Duration: 0.8s, ease: "power3.out"

// Efecto de filtrado:
- Al cambiar filtros:
  1. Cards que salen: scale(0.8), opacity(0), rotateY(-15deg)
  2. Grid re-layout con GSAP Flip
  3. Nuevas cards entran: scale desde 0.8, opacity fade in
  4. Duration total: 600ms
```

#### 2.3 Loading States y Skeletons
```typescript
// Skeleton loader específico:
- Shimmer effect con gradient animado
- Mantener aspect ratio de cards reales
- Skeleton para: imagen, título, ubicación
- Fade out al cargar datos reales
```

### Fase 3: Mapa Interactivo (DETALLADO)

#### 3.1 Configuración de Mapbox (`/src/components/portfolio/ProjectMap.tsx`)
```typescript
// Estilo del mapa:
const mapStyle = {
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-77.0428, -12.0464], // Lima, Perú
  zoom: 5,
  pitch: 45, // Vista 3D sutil
  bearing: -20,
}

// Markers personalizados:
- Diseño: círculo con borde naranja (#E84E0F)
- Interior: ícono de categoría
- Hover: scale(1.2) + glow effect
- Cluster: número en círculo más grande
```

#### 3.2 Interacciones del Mapa
```typescript
// Comportamientos específicos:
- Click en marker:
  * Flyto animation (duration: 1500ms, zoom: 12)
  * Mostrar popup con preview del proyecto
  * Imagen thumbnail + título + botón "Ver proyecto"
  
- Sincronización con galería:
  * Al hacer hover en card → highlight marker en mapa
  * Al filtrar → actualizar markers visibles
  * Smooth pan/zoom a región con proyectos filtrados
```

### Fase 4: Página Individual de Proyecto (DETALLADO)
**Ruta**: `/portfolio/[categoria]/[slug]`

#### 4.1 Hero Inmersivo (`/src/components/project/ProjectHero.tsx`)
```typescript
// Layout específico:
- Height: 100vh con scroll indicator
- Imagen con efecto Ken Burns:
  * Scale: 1 → 1.1 en 20s
  * Transform-origin alternando
- Overlay gradient más intenso en bottom
- Contenido centrado:
  * Categoría: uppercase, letter-spacing 2px, opacity 0.8
  * Título: font-size clamp(3rem, 6vw, 5rem)
  * Reveal animation por palabras con GSAP SplitText
  * Metadata con iconos: ubicación, año, área
```

#### 4.2 Galería Segmentada (`/src/components/project/ProjectGallery.tsx`)
```typescript
// Secciones por etapa:
tabs = ['Inicio', 'Desarrollo', 'Finalización']

// Grid layout:
- Inicio: 2 imágenes grandes
- Desarrollo: grid 3x2 mezclado
- Finalización: 1 hero + 3 pequeñas

// Lightbox implementation:
- PhotoSwipe con customización
- Navegación con teclado/gestos
- Transición smooth desde thumbnail
- Caption con fade in
```

#### 4.3 Navegación Contextual
```typescript
// Footer con next/prev:
- Preview cards de proyectos adyacentes
- Hover: imagen hace parallax sutil
- Click: page transition con morphing
```

### Fase 5: Efectos y Animaciones Avanzadas (DETALLADO)

#### 5.1 Custom Cursor (`/src/components/ui/CustomCursor.tsx`)
```typescript
// Estados del cursor:
- Default: círculo pequeño (8px)
- Hover en links: scale(3) + border
- Hover en imágenes: texto "Ver" rotando
- Dragging: línea que sigue dirección

// Implementación:
- Mix-blend-mode: difference
- Pointer-events: none
- Spring animation con tension: 150
```

#### 5.2 Scroll Effects
```typescript
// Parallax layers:
- Background: speed 0.5
- Content: speed 1
- Foreground elements: speed 1.2

// Progress indicator:
- Línea vertical/horizontal
- Fill basado en scroll percentage
- Cambio de color en secciones
```

#### 5.3 Page Transitions
```typescript
// Con Barba.js:
- Leave: current page scales down + opacity
- Enter: new page scales up desde 0.95
- Duration: 600ms con ease-in-out
- Mantener elementos persistentes (header)
```

### Fase 6: Call to Action y Optimización (DETALLADO)

#### 6.1 CTA Section (`/src/components/portfolio/PortfolioCTA.tsx`)
```typescript
// Diseño:
- Background: gradient sutil naranja
- Pattern overlay con opacity 0.1
- Contenido centrado con max-width
- Botón con hover effect:
  * Background fill animation
  * Icono arrow animado
  * Box-shadow glow

// Copy específico:
"¿Tienes un proyecto en mente?"
"Conversemos sobre cómo podemos ayudarte a hacerlo realidad"
[Botón: "Iniciar Conversación →"]
```

#### 6.2 Optimizaciones Técnicas
```typescript
// Imágenes:
- Formato: WebP con fallback JPG
- Sizes: 400w, 800w, 1200w, 1600w
- Lazy loading con blur placeholder
- CDN con compresión automática

// Performance:
- Route prefetching en hover
- Component code splitting
- CSS crítico inline
- Font preload para Alliance No.2

// SEO:
- Metadata dinámica por proyecto
- Schema.org para Portfolio
- Sitemap automático
- OG images generadas
```

## 🎨 Guía de Implementación Visual

### Colores del Sistema
```css
/* Adaptados al branding Métrica */
--primary-blue: #003F6F;
--accent-orange: #E84E0F;
--gray-light: #D0D0D0;
--gray-medium: #9D9D9C;
--gray-dark: #646363;
--black-deep: #1D1D1B;

/* Categorías */
--cat-oficina: #0EA5E9;
--cat-retail: #F97316;
--cat-industria: #6B7280;
--cat-hoteleria: #8B5CF6;
--cat-educacion: #10B981;
--cat-vivienda: #F59E0B;
--cat-salud: #EF4444;
```

### Animaciones Reutilizables
```css
/* Definir como CSS custom properties */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(232, 78, 15, 0.5);
  }
  50% {
    box-shadow: 0 0 35px rgba(232, 78, 15, 0.8);
  }
}
```

## 📱 Breakpoints y Responsive
```typescript
// Consistentes con Tailwind
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Adaptaciones específicas:
- Mobile: Stack filters verticalmente, mapa como lista
- Tablet: Grid 2 columnas, mapa lateral
- Desktop: Grid 3-4 columnas, mapa modal
```

## 🚀 Orden de Implementación Sugerido

1. **Types y estructura de datos** (30 min)
2. **ProjectCard component** (2 horas)
3. **Context y estado global** (1 hora)
4. **Portfolio page layout** (2 horas)
5. **Filtros funcionales** (2 horas)
6. **Animaciones GSAP** (3 horas)
7. **Individual project page** (3 horas)
8. **Mapa interactivo** (2 horas)
9. **Optimizaciones** (2 horas)
10. **Testing y pulido** (2 horas)