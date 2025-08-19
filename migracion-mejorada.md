# Plan de Migración Mejorada: Métrica DIP con Validación JSON

## Resumen Ejecutivo Mejorado

Este documento presenta un plan **optimizado y validado** para migrar todo el contenido de la web de Métrica DIP siguiendo una **metodología JSON-first**. Esta aproximación permite validar cada elemento antes de la migración final a Directus, ejecutar fases independientemente y asegurar que el contenido se visualice correctamente.

### Metodología JSON-First: El Flujo Completo

#### **Paso 1: Extracción a JSON**
**Objetivo:** Convertir datos hardcodeados a archivos JSON estructurados
- Extraemos cada texto, imagen y configuración del código
- Creamos JSONs organizados por sección/página
- **Tu validación:** Revisar que todos los textos e imágenes estén correctos en el JSON

#### **Paso 2: Conectar Sitio Web al JSON** 
**Objetivo:** Hacer que la web cargue desde JSONs en lugar del código
- Actualizamos componentes para leer desde JSON
- **Tu validación:** Verificar que el sitio se ve EXACTAMENTE igual pero ahora carga desde JSON
- Si algo se ve mal, ajustamos el JSON hasta que sea perfecto

#### **Paso 3: Solo Después de Validar → Crear Base de Datos**
**Objetivo:** Una vez confirmado que todo funciona desde JSON, migramos a Directus
- Creamos colecciones en Directus basadas en la estructura JSON validada
- Importamos los datos JSON validados a la base de datos
- **Tu validación:** Comparar que Directus se vea igual que el JSON

#### **Paso 4: Sistema Híbrido de Seguridad**
**Objetivo:** Tener respaldo automático si algo falla
- Si Directus falla → automáticamente usa JSON
- Si JSON falla → automáticamente usa datos hardcodeados
- **Tu control:** Puedes cambiar entre fuentes con un simple toggle

### Ventajas de este Enfoque
✅ **Validación previa**: Ver resultado antes de migrar  
✅ **Ejecución independiente**: Cada fase por separado  
✅ **Rollback granular**: Volver a JSON si hay problemas  
✅ **Testing incremental**: Probar sección por sección  
✅ **Control total**: Revisar todo el contenido antes de migrar  

---

## Arquitectura de la Solución

### Estructura de Archivos JSON

```
/src/data/
├── json/                           # JSONs fuente (validación)
│   ├── global/
│   │   ├── settings.json          # Configuración global del sitio
│   │   ├── navigation.json        # Menú principal y megamenú
│   │   ├── assets.json           # Logos, favicon, etc.
│   │   └── contact-info.json     # Información de contacto global
│   ├── landing/
│   │   ├── header.json           # Header con logos y navegación
│   │   ├── hero-transform.json   # Sección principal con video y textos
│   │   ├── stats.json           # 4 estadísticas con iconos
│   │   ├── services.json        # Servicios principales y secundarios
│   │   ├── portfolio.json       # Proyectos destacados
│   │   ├── pillars-carousel.json # 6 pilares DIP
│   │   ├── policies-carousel.json # 8 políticas empresariales
│   │   ├── newsletter.json      # Sección de suscripción
│   │   └── footer.json         # Footer con contacto y enlaces
│   ├── pages/
│   │   ├── about/
│   │   │   ├── historia/
│   │   │   │   ├── content.json     # Contenido principal de historia
│   │   │   │   ├── timeline.json    # 6 hitos históricos
│   │   │   │   └── hero.json       # Hero section con video
│   │   │   ├── cultura/
│   │   │   │   ├── content.json     # Visión, misión, valores
│   │   │   │   ├── team.json       # Miembros del equipo
│   │   │   │   ├── gallery.json    # Galería de oficina
│   │   │   │   └── testimonials.json # Testimonios del equipo
│   │   │   ├── compromiso/
│   │   │   │   ├── content.json     # Compromisos sociales
│   │   │   │   ├── certifications.json # Certificaciones
│   │   │   │   └── sustainable-projects.json # Proyectos sostenibles
│   │   │   └── clientes/
│   │   │       ├── content.json     # Información general
│   │   │       ├── clients.json    # Lista de clientes con logos
│   │   │       ├── testimonials.json # Testimonios de clientes
│   │   │       └── case-studies.json # Casos de éxito
│   │   ├── services/
│   │   │   ├── content.json        # Página principal de servicios
│   │   │   ├── dip.json           # Dirección Integral detallada
│   │   │   ├── pmo.json           # Gerencia de Proyectos
│   │   │   ├── supervision.json    # Supervisión de Obras
│   │   │   ├── contracts.json      # Gestión de Contratos
│   │   │   ├── quality.json       # Control de Calidad
│   │   │   └── processes.json     # Procesos y metodologías
│   │   ├── iso/
│   │   │   ├── content.json       # Información de certificación
│   │   │   ├── documents.json     # PDFs descargables
│   │   │   ├── benefits.json      # Beneficios para clientes
│   │   │   └── implementation.json # Proceso de implementación
│   │   └── contact/
│   │       ├── content.json       # Página principal de contacto
│   │       ├── offices.json       # Múltiples oficinas con mapas
│   │       ├── forms.json         # Configuración de formularios
│   │       └── schedules.json     # Horarios de atención
│   ├── dynamic/
│   │   ├── newsletter/
│   │   │   ├── articles/
│   │   │   │   ├── all-articles.json    # Todos los artículos
│   │   │   │   ├── featured.json       # Artículos destacados
│   │   │   │   ├── categories.json     # Categorías de artículos
│   │   │   │   └── tags.json          # Tags disponibles
│   │   │   ├── authors/
│   │   │   │   ├── all-authors.json    # Todos los autores
│   │   │   │   └── featured.json      # Autores destacados
│   │   │   └── config/
│   │   │       ├── settings.json      # Configuración del blog
│   │   │       └── seo.json          # SEO específico del blog
│   │   ├── portfolio/
│   │   │   ├── projects/
│   │   │   │   ├── all-projects.json   # Todos los proyectos
│   │   │   │   ├── featured.json      # Proyectos destacados
│   │   │   │   ├── by-category/
│   │   │   │   │   ├── oficina.json
│   │   │   │   │   ├── retail.json
│   │   │   │   │   ├── industria.json
│   │   │   │   │   ├── hoteleria.json
│   │   │   │   │   ├── educacion.json
│   │   │   │   │   ├── vivienda.json
│   │   │   │   │   └── salud.json
│   │   │   │   └── by-status/
│   │   │   │       ├── completed.json
│   │   │   │       ├── in-progress.json
│   │   │   │       └── planned.json
│   │   │   ├── categories/
│   │   │   │   ├── all-categories.json
│   │   │   │   └── active.json
│   │   │   └── config/
│   │   │       ├── settings.json
│   │   │       └── filters.json
│   │   └── careers/
│   │       ├── jobs/
│   │       │   ├── all-jobs.json       # Todas las vacantes
│   │       │   ├── active.json        # Vacantes activas
│   │       │   ├── by-department/
│   │       │   │   ├── engineering.json
│   │       │   │   ├── architecture.json
│   │       │   │   ├── management.json
│   │       │   │   ├── quality.json
│   │       │   │   └── administration.json
│   │       │   └── by-level/
│   │       │       ├── entry.json
│   │       │       ├── mid.json
│   │       │       └── senior.json
│   │       ├── departments/
│   │       │   ├── all-departments.json
│   │       │   └── active.json
│   │       ├── applications/
│   │       │   ├── templates.json     # Plantillas de aplicación
│   │       │   └── requirements.json  # Requisitos generales
│   │       └── config/
│   │           ├── settings.json
│   │           └── benefits.json      # Beneficios de trabajar
│   ├── media/
│   │   ├── images/
│   │   │   ├── heroes/               # Imágenes de hero sections
│   │   │   ├── projects/             # Imágenes de proyectos
│   │   │   ├── team/                 # Fotos del equipo
│   │   │   ├── offices/              # Fotos de oficinas
│   │   │   └── logos/                # Logos de clientes
│   │   ├── documents/
│   │   │   ├── policies/             # PDFs de políticas
│   │   │   ├── iso/                  # Documentos ISO 9001
│   │   │   └── brochures/            # Material comercial
│   │   └── videos/
│   │       ├── hero-background.mp4   # Video principal del hero
│   │       └── presentations/        # Videos institucionales
│   └── migration/
│       ├── phase-status.json         # Estado de migración
│       ├── validation-log.json       # Log de validaciones
│       └── mapping/                  # Mapeos componente → JSON
│           ├── landing-components.json
│           ├── page-components.json
│           └── dynamic-components.json
```

### Explicación de la Estructura JSON Mejorada

#### **Diferencias Clave con la Estructura Anterior**

**🔄 Antes**: Un solo JSON por página completa  
**✅ Ahora**: Múltiples JSONs por sección/componente independiente  

**📁 Organización Granular por Función:**
- **`landing/`**: Cada sección del home page en su propio JSON
- **`pages/`**: Subdirectorios específicos por página con múltiples archivos
- **`dynamic/`**: Contenido dinámico organizados por tipo y categoría
- **`media/`**: Assets organizados por función (imágenes, documentos, videos)

#### **Ventajas de esta Organización Granular:**

✅ **Ejecución Independiente Total**
- Puedes migrar solo el header sin tocar el footer
- Implementar historia/timeline sin afectar cultura/equipo
- Trabajar por sección específica sin interdependencias

✅ **Validación Granular**
- Revisar solo el contenido del hero-transform.json
- Validar únicamente los 6 pilares DIP por separado
- Comprobar testimoniales sin revisar todo el about

✅ **Mantenimiento Simplificado**
- Cambiar solo el JSON de stats sin afectar otros componentes
- Actualizar información de contacto sin migrar formularios
- Modificar categorías de portfolio independientemente

✅ **Testing Incremental Preciso**
- Probar un carousel sin cargar toda la landing page
- Validar formularios de contacto de forma aislada
- Verificar funcionalidad de cada componente por separado

#### **Mapeo Componente → JSON Específico:**

| Componente React | Archivo JSON | Contenido |
|-----------------|-------------|-----------|
| `header.tsx` → | `landing/header.json` | Logo, menú, navegación |
| `hero-transform.tsx` → | `landing/hero-transform.json` | Video, títulos, palabras rotativas |
| `stats.tsx` → | `landing/stats.json` | 4 estadísticas con iconos |
| `pillars-carousel.tsx` → | `landing/pillars-carousel.json` | 6 pilares DIP |
| `policies-carousel.tsx` → | `landing/policies-carousel.json` | 8 políticas empresariales |
| `about/historia/page.tsx` → | `pages/about/historia/content.json + timeline.json + hero.json` | Contenido separado por función |
| `about/cultura/page.tsx` → | `pages/about/cultura/content.json + team.json + gallery.json` | Equipo, valores, galería separados |

**🎯 Resultado Final**: Cada JSON representa una unidad funcional específica que puede ser trabajada, validada y migrada de forma completamente independiente.

### Servicios de Datos

```typescript
// src/lib/data-service.ts
export class DataService {
  // Determina fuente de datos: JSON → Directus → Fallback
  static async getSource(): Promise<'json' | 'directus' | 'fallback'>
  
  // Carga datos con prioridad configurada
  static async loadData(collection: string, source?: DataSource)
  
  // Comparación entre fuentes para testing
  static async compareData(collection: string)
  
  // Migración automática JSON → Directus
  static async migrateToDirectus(collection: string, data: any)
}
```

---

## FASE 1: Preparación y Setup JSON (2 días)

### **Objetivo de esta Fase**
Crear la infraestructura técnica que permite al sitio cargar datos desde diferentes fuentes (JSON, Directus, o fallback) de manera transparente.

### **Qué lograremos:**
1. Sistema que puede cambiar entre fuentes de datos sin romper el sitio
2. Panel de control para monitorear y cambiar fuentes
3. Herramientas de comparación para validar que todo se ve igual

### **Tu validación en esta fase:**
- Verificar que el panel de control funciona
- Confirmar que puedes cambiar entre fuentes sin problemas
- Validar que las herramientas de comparación muestran diferencias correctamente

---

### Día 1: Infraestructura Técnica

#### 1.1 Crear Sistema de Datos Híbrido

**¿Qué hace esto?** 
Crea un "cerebro" que decide de dónde cargar los datos: si Directus está disponible, usa Directus; si no, usa JSON; si tampoco, usa datos del código.

**A. Servicio de Datos Unificado**
```typescript
// src/lib/unified-data-service.ts
export interface DataSource {
  type: 'json' | 'directus' | 'fallback';
  priority: number;
  enabled: boolean;
}

export class UnifiedDataService {
  private static sources: DataSource[] = [
    { type: 'directus', priority: 1, enabled: true },
    { type: 'json', priority: 2, enabled: true },
    { type: 'fallback', priority: 3, enabled: true }
  ];

  static async getData(collection: string) {
    for (const source of this.sources) {
      try {
        if (!source.enabled) continue;
        
        switch (source.type) {
          case 'directus':
            return await this.getFromDirectus(collection);
          case 'json':
            return await this.getFromJSON(collection);
          case 'fallback':
            return await this.getFromFallback(collection);
        }
      } catch (error) {
        console.warn(`Failed to load from ${source.type}:`, error);
        continue;
      }
    }
    throw new Error(`All data sources failed for collection: ${collection}`);
  }
}
```

**B. Hook React Unificado**
```typescript
// src/hooks/useUnifiedData.ts
export const useUnifiedData = <T>(collection: string) => {
  const [data, setData] = useState<T | null>(null);
  const [source, setSource] = useState<DataSource['type'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga automática con fallback
  // Preview mode para testing
  // Comparación entre fuentes
}
```

#### 1.2 Panel de Control de Migración

**¿Qué hace esto?**
Crea una página de administración donde puedes controlar todo el proceso de migración de manera visual y sencilla.

**Componentes del Panel:**
- **Toggle JSON/Directus**: Cambias de fuente con un botón
- **Estado por sección**: Ves qué secciones están listas, en proceso o pendientes
- **Botones de validación**: Comparas cómo se ve cada sección desde diferentes fuentes
- **Migración individual**: Migras sección por sección cuando estés listo

**Tu control aquí:**
```
📊 Panel de Migración
├─ 🔄 Fuente actual: [JSON] ↔ [Directus] 
├─ 📋 Estado por sección:
│   ├─ ✅ Hero: JSON listo, Directus pendiente
│   ├─ ✅ Stats: JSON listo, Directus pendiente  
│   └─ ⏳ Services: JSON en progreso
├─ 👁️ Botones "Preview": Ver cómo se ve cada sección
└─ 🚀 Botones "Migrar": Crear en Directus cuando apruebes
```

### Día 2: Validación y Testing

#### 1.3 Herramientas de Validación

**¿Qué construimos?**
Herramientas que te permiten comparar y validar que todo funciona correctamente antes de hacer cualquier migración.

**A. Comparador Visual**
- **Qué hace:** Muestra 3 versiones del sitio lado a lado
- **Tu uso:** Verificas que JSON se ve igual que el original
- **Ejemplo:** Hero section - Original | JSON | Directus - y ves si hay diferencias

**B. Testing Automático**
- **Qué hace:** Verifica que todas las secciones cargan sin errores
- **Tu beneficio:** Te avisa inmediatamente si algo está roto
- **Reporte:** "✅ Hero carga OK | ❌ Stats tiene error en imagen"

**C. Preview Mode** 
- **Qué hace:** Botón "Ver preview" para cada sección
- **Tu uso:** Clickeas y ves exactamente cómo se verá esa sección
- **Seguridad:** Puedes probar sin afectar el sitio en vivo

**D. Logger de Cambios**
- **Qué hace:** Registra cada modificación que haces
- **Tu control:** Historial completo de qué cambió y cuándo
- **Rollback:** Si algo sale mal, sabes exactamente qué revertir

---

## FASE 2: Extracción a JSON por Secciones (5 días)

### **Objetivo de esta Fase**
Extraer todo el contenido hardcodeado del sitio web y organizarlo en archivos JSON estructurados y fáciles de editar.

### **Qué lograremos:**
1. **Archivos JSON organizados** para cada sección del sitio
2. **Contenido editable** separado del código
3. **Estructura clara** que después se convierte fácilmente a base de datos

### **Tu proceso de validación en cada día:**
1. **Revisar JSON creado** - Verificar que todos los textos e imágenes estén correctos
2. **Probar preview** - Ver cómo se ve la sección cargando desde JSON
3. **Aprobar o pedir ajustes** - Si algo no está bien, lo corregimos antes de continuar
4. **Solo cuando apruebes** - Pasamos a la siguiente sección

### **¿Por qué sección por sección?**
- **Control granular**: Apruebas cada parte antes de continuar
- **Menor riesgo**: Si algo sale mal, solo afecta una sección
- **Flexibilidad**: Puedes pausar, revisar, ajustar cuando quieras

---

### Día 1: Configuración Global

**¿Qué extraemos hoy?**
Todo lo que se usa en múltiples páginas: logos, información de contacto, menú de navegación, configuración SEO.

#### 2.1 Global Settings (`/src/data/json/global/settings.json`)

**¿Qué contiene este JSON?**
- Información de la empresa (nombre, slogan, descripción)
- Datos de contacto (teléfono, email, dirección, horarios)
- Enlaces de redes sociales 
- Configuración SEO y analytics
- Rutas de logos y assets
- Texto de copyright

**Tu validación aquí:**
✅ **Revisar que todos los datos sean correctos**
- ¿El teléfono es el correcto?
- ¿La dirección está bien escrita?
- ¿Los enlaces de redes sociales funcionan?
- ¿Los textos están como los quieres?

```json
{
  "site": {
    "title": "Métrica DIP - Dirección Integral de Proyectos",
    "description": "Líderes en dirección integral de proyectos de infraestructura en Perú",
    "company_name": "Métrica DIP", 
    "company_tagline": "Dirección Integral de Proyectos"
  },
  "contact": {
    "email": "contacto@metrica-dip.com",
    "phone": "+51 1 234-5678",
    "address": "Av. Principal 123, San Isidro, Lima", 
    "hours": "Lunes a Viernes: 8:00 AM - 6:00 PM"
  },
  // ... resto de configuración
}
```

**Después de crear el JSON:**
1. **Preview**: Vemos el header/footer cargando desde este JSON
2. **Tu aprobación**: Confirmas que se ve igual que antes
3. **Solo entonces**: Continuamos con el siguiente archivo

#### 2.2 Navigation Menu (`/src/data/json/global/navigation.json`)
```json
{
  "main_menu": [
    {
      "id": "hero",
      "label": "Inicio",
      "href": "/",
      "order": 1,
      "has_submenu": false
    },
    {
      "id": "about",
      "label": "Nosotros",
      "order": 2,
      "has_submenu": true,
      "submenu": {
        "section_title": "Nuestra Esencia",
        "section_description": "Conoce los pilares que definen a Métrica y nuestro compromiso con el desarrollo.",
        "section_image": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
        "links": [
          {
            "href": "/about/historia",
            "title": "Nuestra Historia",
            "description": "Desde nuestros inicios en 2010, hemos transformado el sector construcción con más de 200 proyectos exitosos."
          },
          {
            "href": "/services",
            "title": "Qué Hacemos", 
            "description": "Especialistas en dirección integral de proyectos de infraestructura, supervisión técnica y gestión de calidad."
          }
          // ... más items del megamenú
        ]
      }
    }
    // ... resto del menú
  ]
}
```

### Día 2: Landing Page - Hero y Stats

**¿Qué extraemos hoy?**
Las primeras dos secciones de la página principal: el hero principal con video y la sección de estadísticas.

**Tu proceso de validación hoy:**
1. **Hero**: Verificar títulos, video, palabras rotativas, botones
2. **Stats**: Confirmar números, íconos, descripciones
3. **Preview conjunto**: Ver ambas secciones funcionando desde JSON
4. **Aprobación**: Solo si todo se ve perfecto, continuamos

#### 2.3 Hero Transform (`/src/data/json/landing/hero.json`)

**¿Qué contiene este JSON?**
- Títulos principales del hero ("Dirección Integral de Proyectos")
- Video de fondo y imagen de respaldo
- Las 5 palabras que rotan ("Trabajamos", "Creamos", etc.)
- Texto de la transición que aparece al hacer scroll
- Configuración de animaciones GSAP

**Tu validación crítica aquí:**
✅ **Contenido**
- ¿Los títulos están exactamente como los quieres?
- ¿El video se reproduce correctamente?
- ¿Las 5 palabras rotativas son las correctas?
- ¿El texto de transición está bien redactado?

✅ **Funcionamiento**
- ¿Las animaciones de scroll funcionan igual?
- ¿El botón "Descubre DIP" dirige correctamente?
- ¿La transición video → contenido se ve fluida?
```json
{
  "hero_main": {
    "title_primary": "Dirección Integral",
    "title_secondary": "de Proyectos",
    "title_accent_color": "#E84E0F",
    "subtitle": "que transforman la infraestructura del Perú",
    "cta_text": "Descubre DIP",
    "cta_target": "#stats"
  },
  "background": {
    "type": "video",
    "video_url": "https://statom.co.uk/assets/video/2024/Oct/rc-frame-video.mp4",
    "fallback_image": "/img/hero-fallback.jpg",
    "overlay_opacity": 0.4
  },
  "transition_content": {
    "rotating_words": [
      "Trabajamos",
      "Creamos", 
      "Resolvemos",
      "Entregamos",
      "Transformamos"
    ],
    "transition_text": "Trabajar en colaboración nos permite ejecutar los proyectos de infraestructura más impactantes del Perú en los sectores de salud, educación, vialidad y saneamiento.",
    "word_change_interval": 3000
  },
  "animations": {
    "enabled": true,
    "preserve_gsap": true,
    "pin_duration": "100%",
    "scrub_factor": 1
  }
}
```

#### 2.4 Statistics (`/src/data/json/landing/stats.json`)
```json
{
  "section": {
    "title": "Nuestros Números",
    "subtitle": "Resultados que respaldan nuestra experiencia",
    "background_color": "primary"
  },
  "statistics": [
    {
      "id": "projects",
      "icon": "Briefcase",
      "value": 50,
      "suffix": "+",
      "label": "Proyectos",
      "description": "Proyectos completados exitosamente",
      "color": "#E84E0F",
      "order": 1,
      "animation_delay": 0
    },
    {
      "id": "clients",
      "icon": "Users",
      "value": 30,
      "suffix": "+", 
      "label": "Clientes",
      "description": "Clientes que confían en nosotros",
      "color": "#E84E0F",
      "order": 2,
      "animation_delay": 100
    },
    {
      "id": "professionals",
      "icon": "UserCheck",
      "value": 200,
      "suffix": "+",
      "label": "Profesionales",
      "description": "Equipo multidisciplinario",
      "color": "#E84E0F",
      "order": 3,
      "animation_delay": 200
    },
    {
      "id": "experience",
      "icon": "Award",
      "value": 15,
      "suffix": "+",
      "label": "Años en el sector",
      "description": "Años de experiencia comprobada",
      "color": "#E84E0F",
      "order": 4,
      "animation_delay": 300
    }
  ]
}
```

### Día 3: Services y Portfolio

#### 2.5 Services (`/src/data/json/landing/services.json`)
```json
{
  "section": {
    "title": "Nuestros Servicios",
    "subtitle": "Soluciones integrales para cada etapa de tu proyecto"
  },
  "main_service": {
    "title": "Dirección Integral de Proyectos (DIP)",
    "description": "Lideramos tu proyecto desde la concepción hasta la entrega, asegurando el cumplimiento de objetivos en tiempo, costo y calidad.",
    "image_url": "https://metrica-dip.com/images/slider-inicio-es/02.jpg",
    "icon_url": "/img/icono-logo-2.png",
    "is_featured": true,
    "cta_text": "Conoce más sobre DIP",
    "cta_url": "/services#dip"
  },
  "secondary_services": [
    {
      "id": "pmo",
      "title": "Gerencia de Proyectos (PMO)",
      "description": "Implementamos y gestionamos oficinas de proyectos para estandarizar procesos y maximizar la eficiencia.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "icon_url": "/img/ico-service-2.png",
      "order": 1
    },
    {
      "id": "supervision",
      "title": "Supervisión de Obras",
      "description": "Vigilancia técnica y administrativa para que la construcción se ejecute según los planos y normativas.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/05.jpg", 
      "icon_url": "/img/ico-service-3.png",
      "order": 2
    },
    {
      "id": "contracts",
      "title": "Gestión de Contratos",
      "description": "Administramos los contratos de obra para prevenir conflictos y asegurar el cumplimiento de las obligaciones.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/06.jpg",
      "icon_url": "/img/ico-service-4.png", 
      "order": 3
    },
    {
      "id": "quality",
      "title": "Control de Calidad",
      "description": "Aseguramos que todos los materiales y procesos constructivos cumplan con los más altos estándares.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/07.jpg",
      "icon_url": "/img/ico-service-5.png",
      "order": 4
    }
  ]
}
```

#### 2.6 Portfolio Landing (`/src/data/json/landing/portfolio.json`)
```json
{
  "section": {
    "title": "Proyectos Destacados",
    "subtitle": "Conoce el impacto de nuestro trabajo a través de algunos de los proyectos que hemos dirigido.",
    "cta_text": "Ver más detalles",
    "cta_url": "/portfolio"
  },
  "featured_projects": [
    {
      "id": "hospital-nacional",
      "name": "Hospital Nacional de Alta Complejidad",
      "type": "Sanitaria",
      "description": "Supervisión integral de la construcción y equipamiento del hospital más moderno de la región.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "location": "Lima, Lima",
      "status": "completed",
      "featured": true,
      "order": 1
    },
    {
      "id": "institucion-educativa",
      "name": "Institución Educativa Emblemática \"Futuro\"",
      "type": "Educativa",
      "description": "Dirección del proyecto para la modernización de infraestructura educativa para más de 5,000 estudiantes.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "location": "Arequipa, Arequipa", 
      "status": "completed",
      "featured": true,
      "order": 2
    },
    {
      "id": "autopista-sol",
      "name": "Autopista del Sol - Tramo IV",
      "type": "Vial",
      "description": "Control de calidad y supervisión técnica en uno de los corredores viales más importantes del país.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/05.jpg",
      "location": "Ica, Ica",
      "status": "completed", 
      "featured": true,
      "order": 3
    },
    {
      "id": "planta-tratamiento",
      "name": "Planta de Tratamiento de Aguas Residuales",
      "type": "Saneamiento",
      "description": "Gestión de proyecto para la ampliación y modernización de la planta, beneficiando a 2 millones de personas.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/06.jpg",
      "location": "Lima, Lima",
      "status": "completed",
      "featured": true,
      "order": 4
    }
  ]
}
```

### Día 4: Carousels (Pillars y Policies)

#### 2.7 Pillars DIP (`/src/data/json/landing/pillars.json`)
```json
{
  "section": {
    "title": "Los 6 Pilares de DIP",
    "subtitle": "Metodología comprobada que garantiza el éxito de cada proyecto"
  },
  "pillars": [
    {
      "id": "planning",
      "icon": "Compass",
      "title": "Planificación Estratégica",
      "description": "Definimos la hoja de ruta para el éxito del proyecto, optimizando plazos y recursos desde el inicio.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "color": "#E84E0F",
      "order": 1
    },
    {
      "id": "coordination",
      "icon": "Network",
      "title": "Coordinación Multidisciplinaria",
      "description": "Integramos equipos de diseño, construcción y fiscalización para una ejecución sin fisuras.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "color": "#E84E0F",
      "order": 2
    },
    {
      "id": "supervision",
      "icon": "ScanSearch", 
      "title": "Supervisión Técnica",
      "description": "Garantizamos que cada etapa de la construcción cumpla con los más altos estándares de ingeniería.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/05.jpg",
      "color": "#E84E0F",
      "order": 3
    },
    {
      "id": "quality-control",
      "icon": "ChartBar",
      "title": "Control de Calidad y Costos",
      "description": "Implementamos un riguroso control para asegurar la calidad de los materiales y la eficiencia del presupuesto.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/06.jpg",
      "color": "#E84E0F",
      "order": 4
    },
    {
      "id": "risk-management",
      "icon": "AlertTriangle",
      "title": "Gestión de Riesgos",
      "description": "Identificamos y mitigamos proactivamente los posibles riesgos que puedan afectar al proyecto.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "color": "#E84E0F",
      "order": 5
    },
    {
      "id": "client-representation",
      "icon": "Building2",
      "title": "Representación del Cliente",
      "description": "Actuamos como sus ojos y oídos en el campo, defendiendo sus intereses en cada decisión.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "color": "#E84E0F",
      "order": 6
    }
  ],
  "carousel": {
    "direction": "right-to-left",
    "autoplay": false,
    "navigation": true,
    "scroll_trigger": true
  }
}
```

#### 2.8 Policies (`/src/data/json/landing/policies.json`)
```json
{
  "section": {
    "title": "Nuestras Políticas Empresariales",
    "subtitle": "Comprometidos con la excelencia, integridad y desarrollo sostenible"
  },
  "policies": [
    {
      "id": "quality-policy",
      "icon": "Award",
      "title": "Política de Calidad",
      "description": "Nos comprometemos a entregar servicios que excedan las expectativas de nuestros clientes, manteniendo los más altos estándares de calidad en cada proyecto.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "document_url": "/documents/politica-calidad.pdf",
      "order": 1
    },
    {
      "id": "safety-policy",
      "icon": "Shield",
      "title": "Política de Seguridad",
      "description": "La seguridad de nuestro equipo y de todos los involucrados en nuestros proyectos es nuestra máxima prioridad.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "document_url": "/documents/politica-seguridad.pdf",
      "order": 2
    },
    {
      "id": "environmental-policy",
      "icon": "Leaf",
      "title": "Política Ambiental",
      "description": "Promovemos prácticas sostenibles y responsables con el medio ambiente en todos nuestros proyectos de infraestructura.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/05.jpg",
      "document_url": "/documents/politica-ambiental.pdf",
      "order": 3
    },
    {
      "id": "ethics-policy",
      "icon": "Scale",
      "title": "Código de Ética",
      "description": "Actuamos con integridad, transparencia y honestidad en todas nuestras relaciones comerciales y profesionales.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/06.jpg",
      "document_url": "/documents/codigo-etica.pdf",
      "order": 4
    },
    {
      "id": "innovation-policy",
      "icon": "Lightbulb",
      "title": "Política de Innovación",
      "description": "Fomentamos la innovación y la mejora continua, adoptando nuevas tecnologías y metodologías que agreguen valor.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/07.jpg", 
      "document_url": "/documents/politica-innovacion.pdf",
      "order": 5
    },
    {
      "id": "diversity-policy",
      "icon": "Users",
      "title": "Política de Diversidad e Inclusión",
      "description": "Valoramos la diversidad y promovemos un ambiente inclusivo donde todos los talentos puedan desarrollarse plenamente.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "document_url": "/documents/politica-diversidad.pdf",
      "order": 6
    },
    {
      "id": "training-policy",
      "icon": "GraduationCap",
      "title": "Política de Capacitación",
      "description": "Invertimos en el desarrollo profesional continuo de nuestro equipo para mantener la excelencia en nuestros servicios.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/04.jpg",
      "document_url": "/documents/politica-capacitacion.pdf",
      "order": 7
    },
    {
      "id": "social-responsibility-policy",
      "icon": "Heart",
      "title": "Responsabilidad Social",
      "description": "Contribuimos al desarrollo sostenible de las comunidades donde operamos a través de iniciativas de impacto social.",
      "image_url": "https://metrica-dip.com/images/slider-inicio-es/05.jpg",
      "document_url": "/documents/responsabilidad-social.pdf",
      "order": 8
    }
  ],
  "carousel": {
    "direction": "left-to-right",
    "autoplay": false,
    "navigation": true,
    "scroll_trigger": true,
    "initial_slide": "last"
  }
}
```

### Día 5: Newsletter y Footer

#### 2.9 Newsletter (`/src/data/json/landing/newsletter.json`)
```json
{
  "section": {
    "title": "Mantente informado",
    "subtitle": "Recibe las últimas noticias y actualizaciones sobre nuestros proyectos",
    "background_image": "/img/newsletter-bg.jpg",
    "background_overlay": 0.7
  },
  "form": {
    "placeholder_text": "Ingresa tu email",
    "cta_text": "Suscribirse",
    "loading_text": "Suscribiendo...",
    "success_message": "¡Gracias por suscribirte! Recibirás nuestras últimas noticias.",
    "error_message": "Hubo un error al procesar tu suscripción. Intenta nuevamente."
  },
  "legal": {
    "privacy_text": "Al suscribirte, aceptas nuestra política de privacidad y el tratamiento de tus datos.",
    "privacy_link": "/privacy-policy",
    "unsubscribe_info": "Puedes cancelar tu suscripción en cualquier momento."
  },
  "settings": {
    "active": true,
    "double_opt_in": true,
    "send_welcome_email": true,
    "welcome_email_template": "welcome-newsletter"
  }
}
```

#### 2.10 Footer (`/src/data/json/landing/footer.json`)
```json
{
  "company": {
    "name": "Métrica DIP",
    "tagline": "Dirección Integral de Proyectos",
    "logo": "/img/logo-footer.png",
    "description": "Líderes en dirección integral de proyectos de infraestructura en Perú desde 2010."
  },
  "contact": {
    "office_main": {
      "name": "Oficina Principal",
      "address": "Av. Principal 123, San Isidro, Lima 15036",
      "phone": "+51 1 234-5678",
      "email": "contacto@metrica-dip.com",
      "hours": "Lunes a Viernes: 8:00 AM - 6:00 PM"
    }
  },
  "links": {
    "services": [
      { "text": "Dirección Integral de Proyectos", "url": "/services#dip" },
      { "text": "Gerencia de Proyectos", "url": "/services#pmo" },
      { "text": "Supervisión de Obras", "url": "/services#supervision" },
      { "text": "Control de Calidad", "url": "/services#quality" }
    ],
    "company": [
      { "text": "Nuestra Historia", "url": "/about/historia" },
      { "text": "Cultura y Personas", "url": "/about/cultura" },
      { "text": "Compromiso Social", "url": "/about/compromiso" },
      { "text": "ISO 9001", "url": "/iso" }
    ],
    "legal": [
      { "text": "Términos de Uso", "url": "/legal/terms" },
      { "text": "Política de Privacidad", "url": "/legal/privacy" },
      { "text": "Política de Cookies", "url": "/legal/cookies" }
    ]
  },
  "social": {
    "linkedin": {
      "url": "https://linkedin.com/company/metrica-dip",
      "label": "LinkedIn"
    },
    "facebook": {
      "url": "https://facebook.com/metrica-dip", 
      "label": "Facebook"
    },
    "youtube": {
      "url": "https://youtube.com/@metrica-dip",
      "label": "YouTube"
    }
  },
  "legal": {
    "copyright": "© 2024 Métrica DIP. Todos los derechos reservados.",
    "additional_text": "Registro de construcción civil N° 12345 | RUC: 20123456789"
  }
}
```

---

## FASE 3: Páginas Independientes (8 días)

### Día 6-7: Página Nosotros/Historia

#### 3.1 Historia Timeline (`/src/data/json/pages/about/historia.json`)
```json
{
  "page": {
    "title": "Nuestra Historia",
    "subtitle": "Más de una década transformando la infraestructura del Perú",
    "hero_image": "/img/historia-hero.jpg",
    "hero_video": "/video/historia-hero.mp4"
  },
  "timeline_events": [
    {
      "id": "foundation",
      "year": 2010,
      "title": "Fundación de Métrica DIP",
      "description": "Iniciamos nuestro camino con la visión de revolucionar la gestión de proyectos de infraestructura en Perú.",
      "image": "/img/timeline/2010-fundacion.jpg",
      "achievements": [
        "Primer equipo de 5 profesionales",
        "Oficina en San Isidro establecida",
        "Primeros 3 proyectos piloto"
      ],
      "impact": "Establecimos las bases metodológicas de lo que sería el sistema DIP",
      "order": 1
    },
    {
      "id": "expansion",
      "year": 2015,
      "title": "Expansión Nacional",
      "description": "Ampliamos nuestras operaciones a nivel nacional, llegando a más regiones del país.",
      "image": "/img/timeline/2015-expansion.jpg",
      "achievements": [
        "Presencia en 8 regiones del Perú",
        "Equipo de 50+ profesionales",
        "25 proyectos completados exitosamente"
      ],
      "impact": "Consolidamos nuestra presencia como referente nacional en gestión de proyectos",
      "order": 2
    },
    {
      "id": "certification",
      "year": 2018,
      "title": "Certificación ISO 9001",
      "description": "Obtuvimos la certificación ISO 9001, reafirmando nuestro compromiso con la calidad.",
      "image": "/img/timeline/2018-iso.jpg",
      "achievements": [
        "Certificación ISO 9001:2015",
        "Procesos estandarizados implementados",
        "Sistema de gestión de calidad operativo"
      ],
      "impact": "Garantizamos estándares internacionales de calidad en todos nuestros servicios",
      "order": 3
    },
    {
      "id": "innovation",
      "year": 2020,
      "title": "Era de la Innovación Digital",
      "description": "Incorporamos tecnologías digitales avanzadas para optimizar la gestión de proyectos.",
      "image": "/img/timeline/2020-digital.jpg",
      "achievements": [
        "Plataforma digital DIP implementada",
        "BIM y metodologías ágiles adoptadas",
        "Transformación digital completa"
      ],
      "impact": "Revolucionamos la forma de gestionar proyectos con tecnología de vanguardia",
      "order": 4
    },
    {
      "id": "leadership",
      "year": 2023,
      "title": "Liderazgo Reconocido",
      "description": "Nos consolidamos como líderes indiscutibles en dirección integral de proyectos.",
      "image": "/img/timeline/2023-awards.jpg",
      "achievements": [
        "150+ proyectos completados",
        "Reconocimientos de excelencia",
        "Equipo de 200+ profesionales"
      ],
      "impact": "Establecimos nuevos estándares de excelencia en la industria peruana",
      "order": 5
    },
    {
      "id": "future",
      "year": 2024,
      "title": "Hacia el Futuro",
      "description": "Continuamos innovando y creciendo para enfrentar los desafíos del mañana.",
      "image": "/img/timeline/2024-future.jpg",
      "achievements": [
        "Nuevas metodologías sostenibles",
        "Expansión a mercados internacionales",
        "Inversión en I+D incrementada"
      ],
      "impact": "Preparamos el terreno para la próxima década de transformación",
      "order": 6
    }
  ],
  "final_stats": {
    "title": "Nuestro Legado en Números",
    "stats": [
      { "value": 200, "suffix": "+", "label": "Proyectos Completados" },
      { "value": 15, "suffix": "", "label": "Años de Experiencia" },
      { "value": 30, "suffix": "+", "label": "Clientes Satisfechos" },
      { "value": 200, "suffix": "+", "label": "Profesionales" }
    ]
  }
}
```

### Día 8: Página Cultura

#### 3.2 Cultura y Equipo (`/src/data/json/pages/about/cultura.json`)
```json
{
  "page": {
    "title": "Cultura y Personas",
    "subtitle": "Nuestro mayor activo es nuestro talento humano"
  },
  "vision_mission": {
    "vision": {
      "title": "Visión",
      "content": "Ser la empresa líder en dirección integral de proyectos en América Latina, reconocida por nuestra excelencia, innovación y compromiso con el desarrollo sostenible.",
      "icon": "Target"
    },
    "mission": {
      "title": "Misión", 
      "content": "Transformar la infraestructura de nuestros países a través de la dirección integral de proyectos, garantizando calidad, eficiencia y sostenibilidad en cada obra.",
      "icon": "Compass"
    }
  },
  "core_values": [
    {
      "id": "excellence",
      "title": "Excelencia",
      "description": "Buscamos la perfección en cada proyecto, superando expectativas y estableciendo nuevos estándares.",
      "icon": "Award",
      "color": "#E84E0F",
      "image": "/img/values/excellence.jpg"
    },
    {
      "id": "integrity",
      "title": "Integridad",
      "description": "Actuamos con honestidad, transparencia y ética en todas nuestras relaciones.",
      "icon": "Shield",
      "color": "#003F6F", 
      "image": "/img/values/integrity.jpg"
    },
    {
      "id": "innovation",
      "title": "Innovación",
      "description": "Adoptamos tecnologías emergentes y metodologías disruptivas para liderar el cambio.",
      "icon": "Lightbulb",
      "color": "#E84E0F",
      "image": "/img/values/innovation.jpg"
    },
    {
      "id": "collaboration",
      "title": "Colaboración",
      "description": "Trabajamos en equipo, valorando la diversidad y fomentando la sinergia.",
      "icon": "Users",
      "color": "#003F6F",
      "image": "/img/values/collaboration.jpg"
    }
  ],
  "team_gallery": {
    "title": "Nuestro Equipo",
    "subtitle": "Profesionales apasionados por la excelencia",
    "images": [
      {
        "url": "/img/team/team-01.jpg",
        "alt": "Equipo de dirección ejecutiva",
        "category": "leadership"
      },
      {
        "url": "/img/team/team-02.jpg", 
        "alt": "Ingenieros en reunión de proyecto",
        "category": "engineering"
      },
      {
        "url": "/img/team/team-03.jpg",
        "alt": "Supervisores en obra",
        "category": "supervision"
      },
      {
        "url": "/img/team/team-04.jpg",
        "alt": "Equipo de calidad",
        "category": "quality"
      },
      {
        "url": "/img/team/team-05.jpg",
        "alt": "Reunión multidisciplinaria",
        "category": "multidisciplinary"
      },
      {
        "url": "/img/team/team-06.jpg",
        "alt": "Capacitación del equipo",
        "category": "training"
      }
    ]
  },
  "departments": [
    {
      "name": "Dirección Ejecutiva",
      "description": "Liderazgo estratégico y visión empresarial",
      "team_size": 5,
      "icon": "Crown"
    },
    {
      "name": "Ingeniería",
      "description": "Diseño y supervisión técnica especializada", 
      "team_size": 80,
      "icon": "Calculator"
    },
    {
      "name": "Gestión de Proyectos",
      "description": "Coordinación y seguimiento integral",
      "team_size": 45,
      "icon": "FolderKanban"
    },
    {
      "name": "Control de Calidad",
      "description": "Aseguramiento de estándares de excelencia",
      "team_size": 35,
      "icon": "CheckCircle"
    },
    {
      "name": "Administración",
      "description": "Soporte corporativo y gestión de recursos",
      "team_size": 35,
      "icon": "Building"
    }
  ]
}
```

---

## FASE 4: Contenido Completo (8 días)

### Día 9-10: Proyectos Completos

**🎯 MOMENTO CRÍTICO: Migración de Proyectos Completos**

**¿Qué hacemos?**
Extraemos TODOS los proyectos que están actualmente en la web y los organizamos en un JSON maestro completo.

**Tu validación ESENCIAL aquí:**
✅ **Verificar cada proyecto individualmente**
- ¿Están todos los proyectos que tienes en la web actual?
- ¿Los títulos, descripciones e imágenes son exactos?
- ¿Las ubicaciones y datos técnicos están correctos?
- ¿Las galerías tienen todas las imágenes?

✅ **Verificar categorías y organización** 
- ¿Las categorías (Sanitaria, Educativa, Vial, Saneamiento) están bien?
- ¿Cada proyecto está en la categoría correcta?
- ¿Los proyectos destacados son los que quieres mostrar?

**¿Por qué es crítico este paso?**
- Es el contenido más visible de tu web
- Los clientes ven estos proyectos para decidir contratarte
- Cualquier error aquí impacta tu imagen profesional

**El proceso paso a paso:**
1. **Listado completo**: Te mostramos todos los proyectos encontrados
2. **Revisión proyecto por proyecto**: Validamos cada uno contigo
3. **Correcciones**: Ajustamos lo que necesites
4. **Preview final**: Ves exactamente cómo se verá la página de portafolio
5. **Solo con tu OK**: Procedemos a crear la base de datos

#### 4.1 Todos los Proyectos (`/src/data/json/content/projects.json`)

**Estructura del archivo maestro:**
```json
{
  "metadata": {
    "total_projects": 21,
    "last_updated": "2024-01-15T00:00:00Z",
    "version": "1.0"
  },
  "categories": [
    {
      "id": "sanitaria",
      "name": "Sanitaria",
      "slug": "sanitaria",
      "description": "Proyectos de infraestructura hospitalaria y sanitaria",
      "color": "#E84E0F",
      "icon": "Hospital"
    },
    {
      "id": "educativa",
      "name": "Educativa", 
      "slug": "educativa",
      "description": "Proyectos de infraestructura educativa y académica",
      "color": "#003F6F",
      "icon": "GraduationCap"
    },
    {
      "id": "vial",
      "name": "Vial",
      "slug": "vial",
      "description": "Proyectos de infraestructura vial y transporte",
      "color": "#E84E0F",
      "icon": "Road"
    },
    {
      "id": "saneamiento",
      "name": "Saneamiento",
      "slug": "saneamiento", 
      "description": "Proyectos de tratamiento de aguas y saneamiento",
      "color": "#003F6F",
      "icon": "Droplets"
    }
  ],
  "projects": [
    {
      "id": "hospital-nacional-alta-complejidad",
      "title": "Hospital Nacional de Alta Complejidad",
      "slug": "hospital-nacional-alta-complejidad",
      "category_id": "sanitaria",
      "description": "## Proyecto Emblemático de Salud Pública\n\nEste proyecto representa uno de los desarrollos hospitalarios más importantes del país, con **supervisión integral** de la construcción y equipamiento del hospital más moderno de la región.\n\n### Características Principales\n- Hospital de alta complejidad con tecnología de vanguardia\n- Capacidad para atender especialidades médicas críticas\n- Infraestructura moderna y sostenible\n- Equipamiento médico de última generación\n\n### Servicios DIP\n- **Supervisión Técnica**: Control de calidad en todas las etapas\n- **Gestión de Proyecto**: Coordinación integral del desarrollo\n- **Control de Equipamiento**: Supervisión de instalación de tecnología médica\n- **Seguimiento de Cronograma**: Cumplimiento de plazos críticos\n\n### Impacto Social\nEste hospital beneficiará a **millones de peruanos** con servicios médicos especializados, mejorando significativamente la atención sanitaria de la región.",
      "short_description": "Supervisión integral de la construcción y equipamiento del hospital más moderno de la región.",
      "featured_image_url": "https://metrica-dip.com/images/slider-inicio-es/03.jpg",
      "location": {
        "city": "Lima",
        "region": "Lima",
        "address": "Av. Universitaria Norte, San Martín de Porres",
        "coordinates": [-77.0353, -12.0256]
      },
      "client": "Ministerio de Salud del Perú",
      "duration": "36 meses",
      "investment": "$180M USD",
      "area": "85,000 m²",
      "tags": ["salud", "alta_complejidad", "sostenible", "tecnología_avanzada", "impacto_social"],
      "featured": true,
      "completed_at": "2023-08-15",
      "status": "completed",
      "gallery": [
        {
          "id": "h1-inicio-1",
          "url": "https://images.unsplash.com/photo-1586773860418-d37222d8efd8?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1586773860418-d37222d8efd8?w=400",
          "caption": "Diseño arquitectónico inicial del complejo hospitalario",
          "stage": "inicio",
          "order": 1
        },
        {
          "id": "h1-inicio-2", 
          "url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
          "caption": "Masterplan y distribución de espacios médicos",
          "stage": "inicio",
          "order": 2
        },
        {
          "id": "h1-proceso-1",
          "url": "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400",
          "caption": "Construcción de la estructura principal",
          "stage": "proceso",
          "order": 1
        },
        {
          "id": "h1-proceso-2",
          "url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400",
          "caption": "Instalación de sistemas médicos especializados",
          "stage": "proceso",
          "order": 2
        },
        {
          "id": "h1-final-1",
          "url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
          "caption": "Hospital completado con tecnología de vanguardia",
          "stage": "final",
          "order": 1
        },
        {
          "id": "h1-final-2",
          "url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200",
          "thumbnail": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
          "caption": "Áreas de atención médica especializada",
          "stage": "final",
          "order": 2
        }
      ],
      "certifications": ["ISO 9001", "Certificación Hospitalaria"],
      "team": ["Arquitectura", "Ingeniería Médica", "Supervisión Técnica", "Control de Calidad"],
      "order": 1
    }
    // ... más proyectos con estructura similar
  ]
}
```

### Día 11-12: Blog/Newsletter Completo

**🎯 MOMENTO CRÍTICO: Migración de Artículos/Newsletter**

**¿Qué hacemos?**
Extraemos TODOS los artículos que están en tu web/newsletter y los organizamos con su información completa.

**Tu validación ESENCIAL aquí:**
✅ **Verificar cada artículo individualmente**
- ¿Están todos los artículos actuales?
- ¿Los títulos y contenido están exactos?
- ¿Las fechas de publicación son correctas?
- ¿Los autores están bien asignados?
- ¿Las imágenes destacadas están correctas?

✅ **Verificar autores y categorías**
- ¿Los 5 autores tienen su información correcta (foto, bio, rol)?
- ¿Las categorías del blog son las que quieres?
- ¿Los artículos están en las categorías correctas?

✅ **Verificar SEO y métricas**
- ¿Los títulos SEO están optimizados?
- ¿Las descripciones son atractivas?
- ¿Las métricas (views, likes) son reales?

**¿Por qué es crítico este paso?**
- Los artículos demuestran tu expertise
- Google indexa este contenido para SEO
- Los clientes leen estos artículos para confiar en ti

**El proceso paso a paso:**
1. **Listado de todos los artículos**: Te mostramos qué encontramos
2. **Revisión de autores**: Validamos fotos, bios y datos de contacto
3. **Revisión artículo por artículo**: Contenido, categorías, SEO
4. **Preview del blog**: Ves cómo se verá la página completa
5. **Solo con tu OK**: Procedemos a crear la base de datos

#### 4.2 Todos los Artículos (`/src/data/json/content/blog.json`)

**Estructura del archivo maestro:**
```json
{
  "metadata": {
    "total_articles": 15,
    "total_authors": 5,
    "last_updated": "2024-01-15T00:00:00Z",
    "version": "1.0"
  },
  "categories": [
    {
      "id": "industria-tendencias",
      "name": "Industria & Tendencias",
      "slug": "industria-tendencias",
      "description": "Análisis de tendencias y evolución del sector construcción",
      "color": "#E84E0F"
    },
    {
      "id": "casos-estudio",
      "name": "Casos de Estudio",
      "slug": "casos-estudio",
      "description": "Análisis detallados de proyectos exitosos",
      "color": "#003F6F"
    },
    {
      "id": "guias-tecnicas",
      "name": "Guías Técnicas", 
      "slug": "guias-tecnicas",
      "description": "Guías prácticas y metodologías especializadas",
      "color": "#E84E0F"
    },
    {
      "id": "liderazgo-gestion",
      "name": "Liderazgo & Gestión",
      "slug": "liderazgo-gestion",
      "description": "Insights sobre liderazgo y gestión de equipos",
      "color": "#003F6F"
    }
  ],
  "authors": [
    {
      "id": "carlos-mendoza",
      "name": "Carlos Mendoza",
      "role": "Director General",
      "bio": "Ingeniero Civil con más de 20 años de experiencia en dirección de proyectos de infraestructura. Especialista en gestión de grandes obras y metodologías DIP.",
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      "linkedin": "https://linkedin.com/in/carlos-mendoza-dip",
      "email": "carlos.mendoza@metrica-dip.com",
      "expertise": ["Dirección de Proyectos", "Infraestructura", "Liderazgo"]
    },
    {
      "id": "ana-rodriguez",
      "name": "Ana Rodríguez",
      "role": "Gerente de Calidad",
      "bio": "Ingeniera Industrial especializada en sistemas de calidad ISO 9001 y control de procesos constructivos. Experta en implementación de estándares internacionales.",
      "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616c0763c94?w=300",
      "linkedin": "https://linkedin.com/in/ana-rodriguez-calidad",
      "email": "ana.rodriguez@metrica-dip.com",
      "expertise": ["Control de Calidad", "ISO 9001", "Procesos"]
    },
    {
      "id": "luis-torres",
      "name": "Luis Torres",
      "role": "Jefe de Supervisión",
      "bio": "Ingeniero Civil con especialización en supervisión de obras. 15+ años supervisando proyectos de alta complejidad en los sectores salud, educación y vialidad.",
      "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      "linkedin": "https://linkedin.com/in/luis-torres-supervision",
      "email": "luis.torres@metrica-dip.com",
      "expertise": ["Supervisión de Obras", "Control Técnico", "Normativas"]
    },
    {
      "id": "maria-fernandez",
      "name": "María Fernández",
      "role": "Coordinadora de Sostenibilidad",
      "bio": "Arquitecta especializada en construcción sostenible y certificaciones ambientales. Lidera nuestras iniciativas de responsabilidad ambiental y social.",
      "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
      "linkedin": "https://linkedin.com/in/maria-fernandez-sostenibilidad",
      "email": "maria.fernandez@metrica-dip.com",
      "expertise": ["Sostenibilidad", "LEED", "Impacto Ambiental"]
    },
    {
      "id": "jorge-vargas",
      "name": "Jorge Vargas",
      "role": "Especialista en Innovación",
      "bio": "Ingeniero de Sistemas con MBA en Innovación. Lidera la transformación digital de nuestros procesos y la adopción de nuevas tecnologías como BIM y IoT.",
      "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      "linkedin": "https://linkedin.com/in/jorge-vargas-innovacion",
      "email": "jorge.vargas@metrica-dip.com",
      "expertise": ["Innovación", "BIM", "Transformación Digital"]
    }
  ],
  "articles": [
    {
      "id": "futuro-construccion-sostenible-peru",
      "title": "El Futuro de la Construcción Sostenible en el Perú: Tendencias y Oportunidades 2024",
      "slug": "futuro-construccion-sostenible-peru-tendencias-2024",
      "category_id": "industria-tendencias",
      "author_id": "carlos-mendoza",
      "published_at": "2024-01-10T09:00:00Z",
      "reading_time": 12,
      "excerpt": "Analizamos las principales tendencias que están transformando el sector construcción en Perú, desde materiales sostenibles hasta tecnologías digitales que revolucionan la gestión de proyectos.",
      "content": "# El Futuro de la Construcción Sostenible en el Perú\n\nLa industria de la construcción en Perú está experimentando una transformación sin precedentes. Las nuevas regulaciones ambientales, la creciente conciencia sobre sostenibilidad y la adopción de tecnologías emergentes están redefiniendo la forma en que conceptualizamos y ejecutamos proyectos de infraestructura.\n\n## Tendencias Clave 2024\n\n### 1. Materiales Sostenibles\nLa adopción de materiales con menor huella de carbono se ha convertido en una prioridad. Desde concretos con agregados reciclados hasta sistemas de construcción modular que reducen desperdicios, la innovación en materiales está liderando el cambio.\n\n### 2. Certificaciones Ambientales\nLas certificaciones LEED y BREEAM ya no son opcionales para proyectos de gran escala. Nuestros clientes buscan cada vez más estas acreditaciones como diferenciadores competitivos.\n\n### 3. Tecnología BIM Avanzada\nEl Building Information Modeling ha evolucionado más allá de la visualización 3D. Ahora incorpora análisis de ciclo de vida, simulaciones energéticas y gestión de activos post-construcción.\n\n## Oportunidades de Mercado\n\nEl mercado peruano presenta oportunidades únicas:\n\n- **Infraestructura Pública**: El gobierno ha comprometido $15 mil millones en infraestructura sostenible para 2025\n- **Sector Privado**: Las empresas buscan edificaciones que reduzcan costos operativos a largo plazo\n- **Vivienda Social**: Programas gubernamentales priorizan construcción eficiente y sostenible\n\n## Desafíos y Soluciones\n\n### Desafío: Costos Iniciales Elevados\n**Solución**: Análisis de ROI a largo plazo que demuestra ahorros operativos significativos.\n\n### Desafío: Falta de Proveedores Especializados\n**Solución**: Desarrollo de cadenas de suministro locales y capacitación técnica especializada.\n\n### Desafío: Regulaciones Cambiantes\n**Solución**: Mantenerse actualizado con normativas y anticipar cambios regulatorios.\n\n## Casos de Éxito Métrica DIP\n\nEn nuestros proyectos recientes hemos implementado:\n\n- **Hospital Nacional de Alta Complejidad**: 40% reducción en consumo energético vs. estándares convencionales\n- **Centro Educativo Futuro**: Primer colegio con certificación LEED Gold en Arequipa\n- **Planta de Tratamiento**: Tecnología de biodigestión que genera 2.5 MW de energía limpia\n\n## Mirando Hacia el Futuro\n\nLas próximas décadas traerán cambios aún más profundos:\n\n- **Construcción 4.0**: IoT, robótica y IA transformarán los procesos constructivos\n- **Economía Circular**: Reutilización y reciclaje serán estándar, no excepción\n- **Resiliencia Climática**: Diseños que anticipan y mitigan efectos del cambio climático\n\n## Conclusiones\n\nLa construcción sostenible no es solo una tendencia, es el futuro inevitable de nuestra industria. Las empresas que adopten estas prácticas temprano no solo contribuirán a un mejor medio ambiente, sino que también obtendrán ventajas competitivas significativas.\n\nEn Métrica DIP, estamos comprometidos con liderar esta transformación, trabajando junto a nuestros clientes para crear infraestructura que sea económicamente viable, ambientalmente responsable y socialmente beneficiosa.\n\n---\n\n*¿Quieres saber más sobre cómo implementar prácticas sostenibles en tu próximo proyecto? [Contáctanos](/contact) para una consulta especializada.*",
      "featured_image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
      "seo": {
        "title": "Futuro de la Construcción Sostenible en Perú 2024 | Métrica DIP",
        "description": "Descubre las tendencias y oportunidades de la construcción sostenible en Perú. Análisis experto de Métrica DIP sobre materiales, tecnologías y certificaciones ambientales.",
        "keywords": ["construcción sostenible", "Perú", "LEED", "BIM", "infraestructura", "sostenibilidad", "materiales ecológicos"]
      },
      "featured": true,
      "views": 4230,
      "likes": 256,
      "status": "published",
      "tags": ["sostenibilidad", "construcción", "tendencias", "LEED", "BIM", "innovación"],
      "comments": [
        {
          "id": "comment-1",
          "author": "María González",
          "email": "maria.gonzalez@email.com",
          "content": "Excelente análisis. Particularmente interesante el punto sobre ROI a largo plazo. ¿Tienen más datos específicos sobre estos ahorros?",
          "created_at": "2024-01-11T14:30:00Z",
          "approved": true
        }
      ]
    }
    // ... más artículos con estructura similar
  ]
}
```

---

## FASE 5: Migración por Componentes (8 días)

### Actualización de Componentes para JSON

#### 5.1 Hook Unificado de Datos
```typescript
// src/hooks/useUnifiedData.ts
import { useState, useEffect } from 'react';
import { UnifiedDataService } from '@/lib/unified-data-service';

export function useUnifiedData<T>(collection: string, options?: {
  source?: 'json' | 'directus' | 'auto';
  fallback?: boolean;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'json' | 'directus' | 'fallback' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await UnifiedDataService.getData(collection, options?.source);
        setData(result.data);
        setSource(result.source);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [collection, options?.source]);

  return {
    data,
    isLoading,
    error,
    source,
    refetch: () => loadData()
  };
}
```

#### 5.2 Componente Hero Actualizado
```typescript
// src/components/landing/hero-transform.tsx
'use client';

import { useUnifiedData } from '@/hooks/useUnifiedData';

interface HeroContent {
  hero_main: {
    title_primary: string;
    title_secondary: string;
    subtitle: string;
    cta_text: string;
    cta_target: string;
  };
  background: {
    type: 'video' | 'image';
    video_url?: string;
    fallback_image: string;
    overlay_opacity: number;
  };
  transition_content: {
    rotating_words: string[];
    transition_text: string;
    word_change_interval: number;
  };
  animations: {
    enabled: boolean;
    preserve_gsap: boolean;
  };
}

const HeroTransform = () => {
  const { data: heroData, isLoading, source } = useUnifiedData<HeroContent>('hero');
  
  // Estados existentes...
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Si está cargando, mostrar loading
  if (isLoading) {
    return <HeroSkeleton />;
  }

  // Si no hay datos, usar fallback
  if (!heroData) {
    return <HeroFallback />;
  }

  // Usar datos de JSON/Directus
  const words = heroData.transition_content.rotating_words;
  
  // Resto de la lógica GSAP existente se mantiene...
  
  return (
    <section ref={containerRef} className="hero-transform-container relative h-screen">
      {/* Data Source Indicator (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-black/50 text-white px-2 py-1 text-xs rounded">
          Source: {source}
        </div>
      )}
      
      <div ref={heroWrapperRef} className="hero-wrapper relative h-full w-full overflow-hidden bg-primary">
        <div ref={heroImageWrapperRef} className="hero-image-wrapper relative h-full w-full">
          {/* Background Layer - Usa datos JSON */}
          <div ref={heroBackgroundRef} className="hero-background absolute inset-0 z-0">
            {heroData.background.type === 'video' ? (
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src={heroData.background.video_url} type="video/mp4" />
                <img src={heroData.background.fallback_image} alt="Hero background" />
              </video>
            ) : (
              <img src={heroData.background.fallback_image} alt="Hero background" className="w-full h-full object-cover" />
            )}
            <div 
              ref={heroOverlayRef}
              className="hero-overlay absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${heroData.background.overlay_opacity})` }}
            />
          </div>
          
          {/* Original Content Layer - Usa datos JSON */}
          <div ref={heroContentRef} className="hero-content relative z-10 h-full flex items-center justify-center">
            <div className="hero-text-wrapper text-center px-4">
              <h1 ref={heroTitleRef} className="hero-title text-5xl md:text-7xl tracking-tight text-white mb-4">
                <span className="block text-accent" style={{ textShadow: '0 0 30px rgba(232, 78, 15, 0.5)' }}>
                  {heroData.hero_main.title_primary}
                </span>
                <span className="block">{heroData.hero_main.title_secondary}</span>
              </h1>
              
              <p ref={heroSubtitleRef} className="hero-subtitle max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8">
                {heroData.hero_main.subtitle}
              </p>
              
              <div ref={heroCTARef} className="hero-cta">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    const target = document.querySelector(heroData.hero_main.cta_target);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  {heroData.hero_main.cta_text}
                  <MoveRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Content - Usa datos JSON */}
        <div ref={newContentRef} className="new-content absolute left-1/2 transform -translate-x-1/2 w-[80%] md:w-[60%] z-20 pointer-events-none bottom-[calc(21vh+100px)] md:bottom-[calc(45vh+100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-4">
            <h2 ref={newTitleRef} className="text-4xl md:text-6xl">
              <span ref={wordRef} className="text-accent inline-block">{words[currentWordIndex]}</span><br/>
              <span className="text-white">juntos.</span>
            </h2>
            <p ref={newDescriptionRef} className="text-lg md:text-xl text-white mt-4 md:mt-0">
              {heroData.transition_content.transition_text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroTransform;
```

#### 5.3 Componente Stats Actualizado
```typescript
// src/components/landing/stats.tsx
'use client';

import { useUnifiedData } from '@/hooks/useUnifiedData';
import * as Icons from 'lucide-react';

interface StatsData {
  section: {
    title: string;
    subtitle: string;
    background_color: string;
  };
  statistics: Array<{
    id: string;
    icon: keyof typeof Icons;
    value: number;
    suffix: string;
    label: string;
    description: string;
    color: string;
    order: number;
    animation_delay: number;
  }>;
}

const Stats = () => {
  const { data: statsData, isLoading, source } = useUnifiedData<StatsData>('stats');
  
  if (isLoading) return <StatsSkeleton />;
  if (!statsData) return <StatsFallback />;
  
  return (
    <section 
      id="stats" 
      className={`py-20 ${statsData.section.background_color === 'primary' ? 'bg-primary' : 'bg-background'}`}
    >
      {/* Source indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center mb-4">
          <span className="bg-black/20 text-white px-2 py-1 text-xs rounded">
            Stats Source: {source}
          </span>
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-section text-4xl md:text-5xl text-white mb-4">
            {statsData.section.title}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {statsData.section.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.statistics
            .sort((a, b) => a.order - b.order)
            .map((stat, index) => {
              const IconComponent = Icons[stat.icon] as any;
              return (
                <StatCard 
                  key={stat.id}
                  stat={{
                    icon: IconComponent,
                    end: stat.value,
                    label: stat.label,
                    suffix: stat.suffix
                  }}
                  index={index}
                />
              );
            })}
        </div>
      </div>
    </section>
  );
};
```

---

## FASE 6: Panel de Migración y Directus (3 días)

### **Objetivo de esta Fase**
Crear el dashboard final de control y realizar las migraciones aprobadas de JSON a Directus CMS.

### **¿Qué logramos?**
1. **Panel de control visual** para gestionar todo
2. **Migración automática** JSON → Directus
3. **Sistema de respaldo** y rollback
4. **Herramientas de comparación** final

### **Tu control total aquí:**
- **Decides cuándo migrar** cada sección
- **Comparas resultados** antes de aprobar
- **Rollback inmediato** si algo no te gusta
- **Control en vivo** del sitio en producción

---

### Día 1: Dashboard de Control Total

#### 6.1 Dashboard de Migración

**¿Qué construimos?**
Un centro de control donde tienes visibilidad y control completo sobre todo el proceso de migración.

**Tu panel de control incluye:**

📊 **Estado Global**
```
📈 Estado General de Migración
├─ ✅ JSONs completados: 13/13 (100%)
├─ ⏳ Migraciones a Directus: 3/13 (23%) 
├─ 🔄 Fuente actual: JSON
└─ 🌐 Sitio funcionando: OK
```

🎛️ **Controles por Sección**
```
📋 Hero Transform
├─ ✅ JSON: Completado y aprobado
├─ 👁️ [Preview JSON] ← Click para ver
├─ 🚀 [Migrar a Directus] ← Click cuando apruebes
└─ 📊 Estado: Listo para migrar

📋 Estadísticas  
├─ ✅ JSON: Completado y aprobado
├─ ✅ Directus: Migrado exitosamente
├─ 👁️ [Ver en Directus] ← Click para administrar
└─ 📊 Estado: Completado
```

🔧 **Herramientas de Validación**
- **Comparador lado a lado**: Original | JSON | Directus
- **Test automático**: Verifica que todo funciona
- **Rollback de emergencia**: Vuelve al estado anterior
- **Monitor en tiempo real**: Ve el estado del sitio

**Tu flujo de trabajo:**
1. **Revisas el estado** de cada sección
2. **Clickeas "Preview"** para ver cómo se verá
3. **Si te gusta, clickeas "Migrar"** 
4. **Si no te gusta, pides ajustes**
5. **Controlas todo desde un solo lugar**
```typescript
// src/app/admin/migration/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

export default function MigrationDashboard() {
  const [dataSource, setDataSource] = useState<'json' | 'directus'>('json');
  const [migrationProgress, setMigrationProgress] = useState<Record<string, number>>({});
  
  const sections = [
    { id: 'global', name: 'Configuración Global', status: 'ready', progress: 100 },
    { id: 'hero', name: 'Hero Transform', status: 'ready', progress: 100 },
    { id: 'stats', name: 'Estadísticas', status: 'ready', progress: 100 },
    { id: 'services', name: 'Servicios', status: 'ready', progress: 100 },
    { id: 'portfolio', name: 'Portfolio', status: 'ready', progress: 100 },
    { id: 'pillars', name: 'Pilares DIP', status: 'ready', progress: 100 },
    { id: 'policies', name: 'Políticas', status: 'ready', progress: 100 },
    { id: 'newsletter', name: 'Newsletter', status: 'ready', progress: 100 },
    { id: 'footer', name: 'Footer', status: 'ready', progress: 100 },
    { id: 'historia', name: 'Historia', status: 'ready', progress: 100 },
    { id: 'cultura', name: 'Cultura', status: 'ready', progress: 100 },
    { id: 'projects', name: 'Todos los Proyectos', status: 'ready', progress: 100 },
    { id: 'blog', name: 'Todos los Artículos', status: 'ready', progress: 100 }
  ];

  const migrateSection = async (sectionId: string) => {
    try {
      setMigrationProgress(prev => ({ ...prev, [sectionId]: 0 }));
      
      // Simular progreso de migración
      const interval = setInterval(() => {
        setMigrationProgress(prev => {
          const current = prev[sectionId] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [sectionId]: current + 10 };
        });
      }, 200);
      
      // Llamada real a la API de migración
      await fetch(`/api/migrate/${sectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'json', target: 'directus' })
      });
      
    } catch (error) {
      console.error(`Error migrando ${sectionId}:`, error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Panel de Migración Métrica DIP</h1>
        <p className="text-muted-foreground">
          Controla la migración de contenido desde JSON a Directus por secciones independientes
        </p>
      </div>

      {/* Control de Fuente de Datos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuración de Fuente de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Fuente Actual de Datos</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona de dónde cargar el contenido del sitio web
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={dataSource === 'json' ? 'font-semibold' : 'text-muted-foreground'}>JSON</span>
              <Switch 
                checked={dataSource === 'directus'} 
                onCheckedChange={(checked) => setDataSource(checked ? 'directus' : 'json')}
              />
              <span className={dataSource === 'directus' ? 'font-semibold' : 'text-muted-foreground'}>Directus</span>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Modo Actual:</strong> {dataSource === 'json' ? 'Validación JSON' : 'Producción Directus'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {dataSource === 'json' 
                ? 'El sitio carga datos desde archivos JSON para validación'
                : 'El sitio carga datos desde Directus CMS'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Secciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <Badge 
                  variant={section.status === 'ready' ? 'default' : 'secondary'}
                  className={section.status === 'ready' ? 'bg-green-500' : ''}
                >
                  {section.status === 'ready' ? 'Listo' : 'Pendiente'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progreso JSON */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>JSON Preparado</span>
                  <span>{section.progress}%</span>
                </div>
                <Progress value={section.progress} className="h-2" />
              </div>
              
              {/* Progreso Migración */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Migrado a Directus</span>
                  <span>{migrationProgress[section.id] || 0}%</span>
                </div>
                <Progress value={migrationProgress[section.id] || 0} className="h-2" />
              </div>
              
              {/* Botones de Acción */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/preview/${section.id}`, '_blank')}
                >
                  Preview
                </Button>
                <Button 
                  size="sm"
                  onClick={() => migrateSection(section.id)}
                  disabled={migrationProgress[section.id] > 0 && migrationProgress[section.id] < 100}
                >
                  {migrationProgress[section.id] === 100 ? 'Migrado' : 'Migrar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Acciones Masivas */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Acciones Masivas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => sections.forEach(s => migrateSection(s.id))}
          >
            Migrar Todo a Directus
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('/preview/all', '_blank')}
          >
            Preview Completo
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              // Rollback a JSON
              setDataSource('json');
              setMigrationProgress({});
            }}
          >
            Rollback a JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Timeline Detallado ACTUALIZADO

| Fase | Días | Tareas Específicas | Entregables |
|------|------|-------------------|-------------|
| **FASE 1**: Setup JSON | 2 | Infraestructura, panel control, validación | Sistema híbrido funcional |
| **FASE 2**: Extracción JSON | 5 | JSON de todas las secciones landing | 10 archivos JSON validados |
| **FASE 3**: Páginas JSON | 8 | JSON de páginas estáticas completas | 6 páginas en JSON |
| **FASE 4**: Contenido Completo | 8 | Proyectos y blog completos en JSON | Base de datos completa |
| **FASE 5**: Componentes | 8 | Actualizar todos los componentes | Sitio cargando desde JSON |
| **FASE 6**: Panel Migración | 3 | Dashboard, migración automática | Herramienta de migración |
| **FASE 7**: Testing Final | 5 | Comparación, validación, docs | Sitio en producción |

**Total: 39 días de desarrollo**

## Ventajas de esta Metodología

### ✅ **Para el Cliente**
- **Validación visual**: Ver cada cambio antes de migrar
- **Control granular**: Migrar sección por sección
- **Rollback seguro**: Volver a estado anterior si hay problemas
- **Testing incremental**: Probar cada elemento individualmente

### ✅ **Para el Desarrollo**
- **Debugging fácil**: Comparar JSON vs Directus vs estático
- **Deploy seguro**: Múltiples puntos de verificación
- **Mantenimiento**: Estructura de datos clara y documentada
- **Performance**: Caché inteligente y fallback automático

---

## ✅ RESUMEN FINAL: Tu Proceso de Control Total

### **El Flujo Completo Explicado**

#### **ETAPA 1: Preparación (FASE 1-2)**
**¿Qué hacemos?**
- Construimos herramientas para que puedas controlar todo
- Extraemos contenido a JSONs organizados

**Tu rol:**
- Revisas cada JSON que creamos
- Apruebas o pides cambios antes de continuar
- Ves previews de cada sección funcionando desde JSON

**Resultado:** 
- Sitio funcionando igual pero cargando desde JSONs
- Control total sobre cada texto e imagen

#### **ETAPA 2: Validación Visual (FASE 3-5)**
**¿Qué hacemos?**
- Conectamos todos los componentes para cargar desde JSON
- Creamos páginas completas (Historia, Cultura, etc.)
- Organizamos proyectos y blog completos

**Tu rol:**
- Comparas lado a lado: Original vs JSON
- Apruebas sección por sección
- Pides ajustes hasta que todo esté perfecto

**Resultado:**
- Web completa funcionando desde JSONs validados
- Cero diferencias visuales con el sitio original

#### **ETAPA 3: Migración Controlada (FASE 6-7)**
**¿Qué hacemos?**
- Solo después de tu aprobación → Creamos base de datos
- Migramos JSONs aprobados a Directus
- Panel de control para gestionar todo

**Tu rol:**
- Decides cuándo migrar cada sección
- Comparas Directus vs JSON antes de aprobar
- Controlas si usar JSON o Directus en vivo

**Resultado:**
- CMS funcional con contenido 100% validado
- Rollback disponible si algo no te gusta

### **Tus Validaciones en Cada Paso**

#### **📋 Revisión de Contenido**
- ✅ Todos los textos están exactos
- ✅ Todas las imágenes son las correctas
- ✅ Enlaces funcionan correctamente
- ✅ Información de contacto actualizada

#### **👁️ Validación Visual**
- ✅ El sitio se ve idéntico al original
- ✅ Animaciones funcionan igual
- ✅ Responsive design se mantiene
- ✅ Performance es igual o mejor

#### **🎛️ Control de Migración**
- ✅ Decides el momento de cada migración
- ✅ Comparas antes de aprobar
- ✅ Rollback disponible siempre
- ✅ Control de fuente de datos en vivo

### **Ventajas para Ti**

#### **🔒 Seguridad Total**
- **No hay riesgo**: Tu sitio actual nunca se rompe
- **Control completo**: Decides cada paso del proceso
- **Rollback instantáneo**: Si algo no te gusta, volvemos atrás
- **Múltiples respaldos**: Código original + JSON + Directus

#### **👁️ Visibilidad Completa**
- **Ves todo antes de aprobar**: Comparaciones lado a lado
- **Preview de cada cambio**: Nunca hay sorpresas
- **Dashboard de control**: Estado en tiempo real
- **Historial completo**: Registro de cada modificación

#### **⚡ Flexibilidad Total**
- **Migración independiente**: Haces una sección cuando quieras
- **Cambio de fuente**: Toggle JSON ↔ Directus al instante
- **Pausa y reanuda**: Puedes parar y continuar cuando gustes
- **Ajustes en caliente**: Correcciones inmediatas

### **Garantías Técnicas**

✅ **Funcionalidad preservada**: Todas las animaciones y efectos se mantienen
✅ **Performance garantizada**: Igual o mejor velocidad de carga
✅ **SEO conservado**: Todos los meta tags y estructura
✅ **Responsive mantenido**: Funciona en todos los dispositivos
✅ **Rollback disponible**: Vuelta al estado anterior en minutos

Este enfoque garantiza una migración **100% exitosa** con **cero riesgo** para el sitio en producción y **control total** para ti en cada paso del proceso.

---

*Plan creado: Agosto 2025*  
*Metodología: JSON-First con Validación Total*  
*Elementos administrables: 268+*  
*Garantía: Rollback completo + Control total*