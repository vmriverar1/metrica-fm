/**
 * Script de migración de Newsletter desde JSON a Firestore
 * Ejecuta la migración completa con datos de respaldo integrados
 */

import { Timestamp } from 'firebase/firestore';
import {
  autoresService,
  categoriasService, 
  articulosService
} from '@/lib/firestore/newsletter-service';
import {
  AutorData,
  CategoriaData,
  ArticuloData
} from '@/types/newsletter';

// ==========================================
// DATOS DE RESPALDO INTEGRADOS
// ==========================================

const BACKUP_AUTHORS: (AutorData & { originalId: string })[] = [
  {
    originalId: "author-001",
    name: "Carlos Mendoza",
    role: "Director General",
    bio: "Arquitecto con 10+ años de experiencia en dirección de proyectos de gran escala. Especialista en construcción sostenible y metodologías BIM.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    email: "carlos.mendoza@metrica-dip.com",
    linkedin: "https://linkedin.com/in/carlos-mendoza-metrica",
    specializations: ["Arquitectura", "PMO", "BIM"],
    featured: true
  },
  {
    originalId: "author-002",
    name: "Ana Rodríguez",
    role: "Jefa de Operaciones",
    bio: "Ingeniera Civil especializada en gestión de proyectos y control de calidad. Experta en normativas peruanas de construcción y certificaciones LEED.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    email: "ana.rodriguez@metrica-dip.com",
    linkedin: "https://linkedin.com/in/ana-rodriguez-metrica",
    specializations: ["Ingeniería Civil", "Control de Calidad", "LEED"],
    featured: true
  },
  {
    originalId: "author-003",
    name: "Luis García",
    role: "Especialista en Sostenibilidad",
    bio: "Arquitecto especializado en construcción sostenible y eficiencia energética. Consultor certificado en estándares internacionales de construcción verde.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    email: "luis.garcia@metrica-dip.com",
    linkedin: "https://linkedin.com/in/luis-garcia-metrica",
    specializations: ["Sostenibilidad", "Eficiencia Energética", "Construcción Verde"],
    featured: false
  },
  {
    originalId: "author-004",
    name: "María Torres",
    role: "Directora de Calidad",
    bio: "Ingeniera Industrial con especialización en sistemas de gestión de calidad y certificaciones ISO. Experta en implementación de procesos de mejora continua.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    email: "maria.torres@metrica-dip.com",
    linkedin: "https://linkedin.com/in/maria-torres-metrica",
    specializations: ["Calidad", "ISO", "Procesos"],
    featured: false
  },
  {
    originalId: "author-005",
    name: "Roberto Silva",
    role: "Gerente de Proyectos Senior",
    bio: "Project Manager certificado PMP con experiencia en proyectos de infraestructura y desarrollo inmobiliario. Especialista en metodologías ágiles aplicadas a construcción.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    email: "roberto.silva@metrica-dip.com",
    linkedin: "https://linkedin.com/in/roberto-silva-metrica",
    specializations: ["Project Management", "PMP", "Metodologías Ágiles"],
    featured: true
  }
];

const BACKUP_CATEGORIES: (CategoriaData & { originalId: string })[] = [
  {
    originalId: "cat-001",
    name: "Industria & Tendencias",
    slug: "industria-tendencias",
    description: "Análisis y perspectivas sobre las últimas tendencias en construcción e infraestructura",
    color: "#003F6F",
    icon: "TrendingUp",
    featured: true
  },
  {
    originalId: "cat-002",
    name: "Casos de Estudio",
    slug: "casos-estudio",
    description: "Análisis detallados de proyectos exitosos y lecciones aprendidas",
    color: "#00A8E8",
    icon: "FileText",
    featured: true
  },
  {
    originalId: "cat-003",
    name: "Guías Técnicas",
    slug: "guias-tecnicas",
    description: "Guías prácticas y recursos técnicos para profesionales del sector",
    color: "#16a34a",
    icon: "Settings",
    featured: false
  },
  {
    originalId: "cat-004",
    name: "Liderazgo & Visión",
    slug: "liderazgo-vision",
    description: "Reflexiones sobre liderazgo y visión estratégica en el sector construcción",
    color: "#9333ea",
    icon: "Crown",
    featured: false
  }
];

const BACKUP_ARTICLES: (Omit<ArticuloData, 'author_id' | 'category_id'> & { 
  originalId: string;
  originalAuthorId: string;
  originalCategoryId: string;
})[] = [
  {
    originalId: "art-001",
    title: "El Futuro de la Construcción Sostenible en Perú: Tendencias 2025",
    slug: "futuro-construccion-sostenible-peru-2025",
    excerpt: "Análisis profundo de las tendencias emergentes en construcción sostenible que están transformando el mercado peruano. Desde tecnologías BIM hasta certificaciones LEED.",
    content: `# El Futuro de la Construcción Sostenible en Perú

La industria de la construcción peruana está experimentando una transformación sin precedentes hacia la sostenibilidad. En los últimos dos años, hemos observado un incremento del 150% en proyectos que buscan certificaciones ambientales.

## Tendencias Clave

### 1. Adopción Masiva de BIM
La metodología Building Information Modeling (BIM) ha dejado de ser una opción para convertirse en un estándar. El 78% de los proyectos de gran escala ya implementan BIM desde la fase de diseño.

### 2. Materiales Innovadores
- Concreto con aditivos reciclados
- Sistemas de aislamiento térmico avanzados
- Paneles solares integrados en fachadas

### 3. Certificaciones LEED
El mercado peruano ha visto un crecimiento del 200% en solicitudes de certificación LEED, posicionando a Lima como la segunda ciudad con más edificios certificados en Sudamérica.

## Impacto Económico

Los proyectos sostenibles no solo benefician al medio ambiente, sino que también generan:
- 15-20% de ahorro en costos operativos
- 12% de incremento en valor de reventa
- 25% de reducción en tiempos de construcción

## Conclusión

La construcción sostenible no es el futuro; es el presente. Las empresas que no se adapten a estas tendencias se quedarán atrás en un mercado cada vez más competitivo y consciente del medio ambiente.`,
    featured_image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop",
    featured_image_alt: "Edificio moderno con paneles solares y diseño sostenible",
    originalAuthorId: "author-003",
    originalCategoryId: "cat-001",
    author_id: "", // Se llenará durante la migración
    category_id: "", // Se llenará durante la migración
    tags: ["Sostenibilidad", "BIM", "LEED", "Tendencias", "Peru"],
    featured: true,
    reading_time: 7,
    published_date: new Date("2024-12-15T10:00:00Z"),
    seo: {
      meta_title: "Construcción Sostenible Perú 2025: Tendencias y Tecnologías",
      meta_description: "Descubre las principales tendencias en construcción sostenible que transformarán el mercado peruano en 2025. BIM, LEED y materiales innovadores.",
      keywords: ["construcción sostenible", "Peru", "BIM", "LEED", "tendencias 2025"],
      og_title: "El Futuro Verde de la Construcción Peruana",
      og_description: "Análisis exclusivo: cómo la sostenibilidad está revolucionando la construcción en Perú",
      og_image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1200&h=630&fit=crop"
    },
    url: "/blog/industria-tendencias/futuro-construccion-sostenible-peru-2025",
    related_articles: [], // Se llenará después de crear todos los artículos
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
        caption: "Ejemplo de arquitectura sostenible moderna"
      }
    ]
  },
  {
    originalId: "art-002",
    title: "Torre San Isidro: Caso de Estudio de Gestión de Proyectos Exitosa",
    slug: "torre-san-isidro-caso-estudio-gestion-proyectos",
    excerpt: "Análisis detallado de cómo Métrica FM logró entregar el proyecto Torre San Isidro 2 meses antes de lo programado y 8% bajo presupuesto usando metodologías ágiles.",
    content: `# Torre San Isidro: Un Caso de Éxito en Gestión

## El Desafío

Torre San Isidro representaba uno de los proyectos más ambiciosos del distrito financiero: 35 pisos, uso mixto (oficinas y retail), y un presupuesto de $45 millones USD.

### Complejidades Iniciales
- Terreno irregular con desnivel de 8 metros
- Restricciones municipales estrictas
- Timeline agresivo de 24 meses
- Coordinación con 15 subcontratistas

## Metodología Aplicada

### 1. Implementación de Agile Construction
Adaptamos metodologías ágiles del desarrollo de software:
- **Sprints de 2 semanas** para cada fase
- **Daily standups** con todos los contratistas
- **Retrospectivas mensuales** para mejora continua

### 2. Tecnología BIM Integrada
- Modelado 4D con programación temporal
- Detección temprana de conflictos (clash detection)
- Realidad virtual para aprobaciones de cliente

### 3. Dashboard en Tiempo Real
Desarrollamos un sistema de monitoreo que incluía:
- Avance físico por piso
- Consumo de materiales vs. presupuesto
- Indicadores de calidad y seguridad

## Resultados Excepcionales

### Métricas de Éxito
- ✅ **Entrega anticipada**: 2 meses antes
- ✅ **Ahorro presupuestal**: 8% ($3.6M)
- ✅ **Zero accidentes** graves
- ✅ **98% satisfacción** del cliente
- ✅ **Certificación LEED Gold**

### Lecciones Aprendidas

1. **Comunicación temprana** es clave
2. **Tecnología como habilitador**, no como fin
3. **Equipos multidisciplinarios** toman mejores decisiones
4. **Métricas en tiempo real** permiten correcciones rápidas

## Impacto en Siguientes Proyectos

Esta experiencia nos permitió:
- Refinar nuestro modelo de gestión ágil
- Desarrollar templates reutilizables
- Entrenar a todo el equipo en nuevas metodologías
- Establecer nuevos estándares de calidad

*Torre San Isidro no solo fue un proyecto exitoso; fue el laboratorio donde desarrollamos las capacidades que ahora aplicamos en todos nuestros proyectos.*`,
    featured_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
    featured_image_alt: "Torre moderna en el distrito financiero de San Isidro",
    originalAuthorId: "author-001",
    originalCategoryId: "cat-002",
    author_id: "",
    category_id: "",
    tags: ["Caso de Estudio", "Gestión de Proyectos", "BIM", "Metodologías Ágiles", "San Isidro"],
    featured: true,
    reading_time: 8,
    published_date: new Date("2024-12-10T14:30:00Z"),
    seo: {
      meta_title: "Torre San Isidro: Caso de Éxito en Gestión de Proyectos",
      meta_description: "Descubre cómo Métrica FM logró entregar Torre San Isidro 2 meses antes y 8% bajo presupuesto usando metodologías ágiles y BIM.",
      keywords: ["caso de estudio", "gestión proyectos", "torre san isidro", "construcción", "BIM"],
      og_title: "Caso de Éxito: Torre San Isidro",
      og_description: "2 meses antes, 8% bajo presupuesto: la historia detrás del éxito",
      og_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop"
    },
    url: "/blog/casos-estudio/torre-san-isidro-caso-estudio-gestion-proyectos",
    related_articles: [],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop",
        caption: "Vista aérea del progreso de construcción"
      },
      {
        url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=400&fit=crop",
        caption: "Equipo de trabajo en reunión de coordinación"
      }
    ]
  },
  {
    originalId: "art-003",
    title: "Guía Completa: Certificación LEED paso a paso en Perú",
    slug: "guia-completa-certificacion-leed-peru",
    excerpt: "Todo lo que necesitas saber para obtener la certificación LEED en Perú: requisitos, procesos, costos y timeline realista basado en nuestra experiencia con 12+ proyectos certificados.",
    content: `# Certificación LEED en Perú: Guía Práctica 2024

## ¿Qué es LEED?

LEED (Leadership in Energy and Environmental Design) es el sistema de certificación de edificios verdes más reconocido mundialmente. En Perú, la demanda ha crecido 200% en los últimos 3 años.

## Niveles de Certificación

| Nivel | Puntos Requeridos | % de Proyectos en Perú |
|-------|------------------|------------------------|
| Certified | 40-49 puntos | 45% |
| Silver | 50-59 puntos | 35% |
| Gold | 60-79 puntos | 18% |
| Platinum | 80+ puntos | 2% |

## Proceso Paso a Paso

### Fase 1: Planificación (Meses 1-2)

#### 1.1 Evaluación de Viabilidad
- **Análisis costo-beneficio**
- **Definición de nivel objetivo**
- **Selección del equipo LEED**

#### 1.2 Registro del Proyecto
- Costo: $1,200 - $6,000 USD según tamaño
- Documentación requerida:
  - Planos arquitectónicos
  - Especificaciones técnicas
  - Cronograma de construcción

### Fase 2: Diseño (Meses 3-8)

#### 2.1 Estrategias de Sitio Sostenible (SS)
- Selección del sitio
- Conectividad y transporte
- Manejo de aguas pluviales
- Efecto isla de calor

#### 2.2 Eficiencia en Agua (WE)
- Reducción del 20% en consumo
- Paisajismo eficiente
- Tecnologías innovadoras

#### 2.3 Energía y Atmósfera (EA)
- Modelado energético
- Sistemas HVAC eficientes
- Energías renovables
- Monitoreo y comisionado

#### 2.4 Materiales y Recursos (MR)
- 75% de residuos desviados del relleno sanitario
- Contenido reciclado mínimo 20%
- Materiales regionales (radio 800 km)

#### 2.5 Calidad Ambiental Interior (IEQ)
- Control de contaminantes
- Confort térmico
- Calidad del aire
- Luz natural y vistas

### Fase 3: Construcción (Durante Obra)

#### Documentación Crítica
- **Fotos de progreso** semanales
- **Facturas de materiales** con especificaciones
- **Reportes de residuos** con certificados de reciclaje
- **Pruebas de calidad de aire**

### Fase 4: Comisionado (Últimos 3 meses)

#### Pruebas Requeridas
- Sistemas HVAC
- Iluminación y controles
- Sistemas de agua
- Envolvente del edificio

## Costos Típicos en Perú

### Costos de Certificación
| Concepto | Rango USD |
|----------|----------|
| Registro USGBC | $1,200 - $6,000 |
| Consultor LEED | $8,000 - $25,000 |
| Comisionado | $5,000 - $15,000 |
| Pruebas y ensayos | $3,000 - $8,000 |
| **Total** | **$17,200 - $54,000** |

### Sobrecostos de Construcción
- **Certified/Silver**: 0-3% del costo total
- **Gold**: 3-5% del costo total
- **Platinum**: 5-8% del costo total

## Timeline Realista

\`\`\`
Mes 1-2:   Planificación y registro
Mes 3-8:   Diseño integrado
Mes 9-18:  Construcción con documentación
Mes 19-21: Comisionado y pruebas
Mes 22-24: Envío y revisión USGBC
\`\`\`

## Errores Comunes a Evitar

### ❌ No Hacer
1. **Decidir LEED después del diseño**
2. **Subestimar la documentación**
3. **No involucrar a subcontratistas**
4. **Cambios de último minuto**

### ✅ Mejores Prácticas
1. **Integrar LEED desde el conceptual**
2. **Asignar responsable LEED tiempo completo**
3. **Capacitar a todo el equipo**
4. **Documentar desde el día 1**

## Proveedores Locales Recomendados

### Materiales Sustentables
- **Cemento**: Cementos Lima (contenido reciclado)
- **Acero**: Aceros Arequipa (certificación reciclado)
- **Vidrio**: Guardian Glass (doble vidriado hermético)

### Consultores Especializados
- Consultor LEED AP certificado
- Comisionado independiente
- Modelador energético

## ROI de la Certificación LEED

### Beneficios Económicos
- **15-25% ahorro** en costos operativos
- **5-10% premium** en valor de renta
- **3-7% premium** en valor de venta
- **Incentivos fiscales** municipales

### Beneficios Intangibles
- **Reconocimiento de marca**
- **Atracción de talento**
- **Responsabilidad social corporativa**
- **Diferenciación competitiva**

## Contacto para Asesoría

¿Estás considerando LEED para tu próximo proyecto? En Métrica FM hemos certificado 12+ proyectos LEED en Perú.

**[Solicita una consulta gratuita](/contact)** y te ayudamos a evaluar la viabilidad de tu proyecto.`,
    featured_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop",
    featured_image_alt: "Edificio certificado LEED con características sostenibles",
    originalAuthorId: "author-002",
    originalCategoryId: "cat-003",
    author_id: "",
    category_id: "",
    tags: ["LEED", "Certificación", "Sostenibilidad", "Guía", "Perú"],
    featured: false,
    reading_time: 12,
    published_date: new Date("2024-12-05T09:15:00Z"),
    seo: {
      meta_title: "Guía LEED Perú 2024: Certificación paso a paso",
      meta_description: "Guía completa para certificación LEED en Perú: procesos, costos, timeline y mejores prácticas basadas en 12+ proyectos exitosos.",
      keywords: ["LEED Peru", "certificación LEED", "construcción sostenible", "guía LEED"],
      og_title: "Guía Definitiva: Certificación LEED en Perú",
      og_description: "Todo lo que necesitas saber para certificar tu proyecto LEED en Perú",
      og_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop"
    },
    url: "/blog/guias-tecnicas/guia-completa-certificacion-leed-peru",
    related_articles: [],
    gallery: []
  }
];

// ==========================================
// INTERFAZ DE RESULTADO DE MIGRACIÓN
// ==========================================

export interface MigrationResult {
  success: boolean;
  message: string;
  totalDocuments: number;
  collections: {
    authors?: { migrated: number; errors: string[] };
    categories?: { migrated: number; errors: string[] };
    articles?: { migrated: number; errors: string[] };
  };
  errors: string[];
  idMapping: {
    authors: Record<string, string>;
    categories: Record<string, string>;
    articles: Record<string, string>;
  };
}

// ==========================================
// FUNCIÓN PRINCIPAL DE MIGRACIÓN
// ==========================================

export async function migrateNewsletterFromJSON(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    message: '',
    totalDocuments: 0,
    collections: {},
    errors: [],
    idMapping: {
      authors: {},
      categories: {},
      articles: {}
    }
  };

  try {
    console.log('🚀 Iniciando migración de Newsletter a Firestore...');

    // PASO 1: Migrar Autores
    console.log('📝 Migrando autores...');
    const authorsResult = await migrateAuthors();
    result.collections.authors = authorsResult;
    result.totalDocuments += authorsResult.migrated;

    if (authorsResult.errors.length > 0) {
      result.errors.push(...authorsResult.errors);
    }

    // PASO 2: Migrar Categorías
    console.log('📂 Migrando categorías...');
    const categoriesResult = await migrateCategories();
    result.collections.categories = categoriesResult;
    result.totalDocuments += categoriesResult.migrated;

    if (categoriesResult.errors.length > 0) {
      result.errors.push(...categoriesResult.errors);
    }

    // PASO 3: Migrar Artículos
    console.log('📄 Migrando artículos...');
    const articlesResult = await migrateArticles();
    result.collections.articles = articlesResult;
    result.totalDocuments += articlesResult.migrated;

    if (articlesResult.errors.length > 0) {
      result.errors.push(...articlesResult.errors);
    }

    // Evaluar resultado general
    const totalErrors = result.errors.length;
    if (totalErrors === 0) {
      result.success = true;
      result.message = `✅ Migración completada exitosamente. ${result.totalDocuments} documentos migrados.`;
    } else if (result.totalDocuments > 0) {
      result.success = true; // Parcialmente exitoso
      result.message = `⚠️ Migración completada con ${totalErrors} errores. ${result.totalDocuments} documentos migrados.`;
    } else {
      result.message = `❌ Migración falló. ${totalErrors} errores encontrados.`;
    }

    console.log(result.message);
    return result;

  } catch (error) {
    console.error('❌ Error crítico en migración:', error);
    result.errors.push(error instanceof Error ? error.message : 'Error desconocido');
    result.message = '❌ Error crítico durante la migración';
    return result;
  }
}

// ==========================================
// FUNCIONES DE MIGRACIÓN ESPECÍFICAS
// ==========================================

async function migrateAuthors(): Promise<{ migrated: number; errors: string[] }> {
  const result = { migrated: 0, errors: [] as string[] };

  for (const authorData of BACKUP_AUTHORS) {
    try {
      const { originalId, ...autorData } = authorData;
      const response = await autoresService.create(autorData);

      if (response.success && response.data) {
        result.migrated++;
        // Guardar mapeo de IDs
        (migrateNewsletterFromJSON as any).idMapping = (migrateNewsletterFromJSON as any).idMapping || { authors: {}, categories: {}, articles: {} };
        (migrateNewsletterFromJSON as any).idMapping.authors[originalId] = response.data;
        console.log(`✅ Autor migrado: ${autorData.name} (${originalId} → ${response.data})`);
      } else {
        result.errors.push(`Error creando autor ${autorData.name}: ${response.message}`);
      }
    } catch (error) {
      result.errors.push(`Error crítico migrando autor ${authorData.name}: ${error}`);
    }
  }

  return result;
}

async function migrateCategories(): Promise<{ migrated: number; errors: string[] }> {
  const result = { migrated: 0, errors: [] as string[] };

  for (const categoryData of BACKUP_CATEGORIES) {
    try {
      const { originalId, ...categoriaData } = categoryData;
      const response = await categoriasService.create(categoriaData);

      if (response.success && response.data) {
        result.migrated++;
        // Guardar mapeo de IDs
        (migrateNewsletterFromJSON as any).idMapping = (migrateNewsletterFromJSON as any).idMapping || { authors: {}, categories: {}, articles: {} };
        (migrateNewsletterFromJSON as any).idMapping.categories[originalId] = response.data;
        console.log(`✅ Categoría migrada: ${categoriaData.name} (${originalId} → ${response.data})`);
      } else {
        result.errors.push(`Error creando categoría ${categoriaData.name}: ${response.message}`);
      }
    } catch (error) {
      result.errors.push(`Error crítico migrando categoría ${categoryData.name}: ${error}`);
    }
  }

  return result;
}

async function migrateArticles(): Promise<{ migrated: number; errors: string[] }> {
  const result = { migrated: 0, errors: [] as string[] };

  // Obtener mapeos de IDs (esto es un hack para el ejemplo, en producción se haría diferente)
  const authorMapping = (migrateNewsletterFromJSON as any).idMapping?.authors || {};
  const categoryMapping = (migrateNewsletterFromJSON as any).idMapping?.categories || {};

  for (const articleData of BACKUP_ARTICLES) {
    try {
      const { originalId, originalAuthorId, originalCategoryId, ...articuloData } = articleData;

      // Mapear IDs a los nuevos IDs de Firestore
      const newAuthorId = authorMapping[originalAuthorId];
      const newCategoryId = categoryMapping[originalCategoryId];

      if (!newAuthorId || !newCategoryId) {
        result.errors.push(`Error mapeando IDs para artículo ${articuloData.title}: autor=${newAuthorId}, categoria=${newCategoryId}`);
        continue;
      }

      const finalArticleData: ArticuloData = {
        ...articuloData,
        author_id: newAuthorId,
        category_id: newCategoryId
      };

      const response = await articulosService.create(finalArticleData);

      if (response.success && response.data) {
        result.migrated++;
        (migrateNewsletterFromJSON as any).idMapping = (migrateNewsletterFromJSON as any).idMapping || { authors: {}, categories: {}, articles: {} };
        (migrateNewsletterFromJSON as any).idMapping.articles[originalId] = response.data;
        console.log(`✅ Artículo migrado: ${articuloData.title} (${originalId} → ${response.data})`);
      } else {
        result.errors.push(`Error creando artículo ${articuloData.title}: ${response.message}`);
      }
    } catch (error) {
      result.errors.push(`Error crítico migrando artículo ${articleData.title}: ${error}`);
    }
  }

  return result;
}