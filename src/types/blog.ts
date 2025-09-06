// Blog Types - Basado en la estrategia blog-strategy.md
export type BlogCategory = 
  | 'industria-tendencias' 
  | 'casos-estudio' 
  | 'guias-tecnicas' 
  | 'liderazgo-vision';

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  email?: string;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schemaType: 'Article' | 'BlogPosting' | 'TechArticle';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  tags: string[];
  author: Author;
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: number; // en minutos
  excerpt: string;
  content: string;
  featuredImage: string;
  images?: string[];
  seo: SEOData;
  featured: boolean;
  views?: number;
  likes?: number;
  status: 'draft' | 'published' | 'archived';
}

export interface BlogFilters {
  category?: BlogCategory;
  author?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  featured?: boolean;
  searchQuery?: string;
}

export interface BlogStats {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  averageReadingTime: number;
  totalViews: number;
  popularTags: { tag: string; count: number }[];
}

// Funciones helper
export function getBlogCategoryLabel(category: BlogCategory): string {
  const labels: Record<BlogCategory, string> = {
    'industria-tendencias': 'Industria & Tendencias',
    'casos-estudio': 'Casos de Estudio',
    'guias-tecnicas': 'Guías Técnicas',
    'liderazgo-vision': 'Liderazgo & Visión'
  };
  return labels[category];
}

export function getBlogCategoryDescription(category: BlogCategory): string {
  const descriptions: Record<BlogCategory, string> = {
    'industria-tendencias': 'Análisis de mercado inmobiliario, tendencias en construcción sostenible e innovaciones tecnológicas del sector.',
    'casos-estudio': 'Deep dives de proyectos emblemáticos con lecciones aprendidas, métricas reales y testimonios de clientes.',
    'guias-tecnicas': 'Metodologías de gestión de proyectos, guías de cumplimiento normativo y herramientas especializadas.',
    'liderazgo-vision': 'Insights de líderes, filosofía empresarial, predicciones de mercado y participación en eventos del sector.'
  };
  return descriptions[category];
}

// Data de ejemplo basada en blog-strategy.md
export const sampleAuthors: Author[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Director General',
    bio: 'Arquitecto con 20+ años de experiencia en dirección integral de proyectos. Especialista en infraestructura comercial y sostenibilidad.',
    avatar: 'https://i.pravatar.cc/400?img=12',
    linkedin: 'https://linkedin.com/in/carlos-mendoza',
    email: 'cmendoza@metricadip.com'
  },
  {
    id: '2', 
    name: 'Ana Rodriguez',
    role: 'Gerente de Proyectos',
    bio: 'Ingeniera Civil especializada en gestión de proyectos de gran escala. Experta en metodologías PMI y construcción sostenible.',
    avatar: 'https://i.pravatar.cc/400?img=32',
    linkedin: 'https://linkedin.com/in/ana-rodriguez',
    email: 'arodriguez@metricadip.com'
  },
  {
    id: '3',
    name: 'Roberto Silva',
    role: 'Especialista en Normativas',
    bio: 'Abogado especializado en normativas de construcción y regulaciones municipales. 15 años asesorando proyectos inmobiliarios.',
    avatar: 'https://i.pravatar.cc/400?img=14',
    linkedin: 'https://linkedin.com/in/roberto-silva',
    email: 'rsilva@metricadip.com'
  },
  {
    id: '4',
    name: 'María Fernández',
    role: 'Jefa de Sostenibilidad',
    bio: 'Arquitecta LEED AP con especialización en diseño bioclimático y eficiencia energética. Líder en proyectos de certificación verde.',
    avatar: 'https://i.pravatar.cc/400?img=45',
    linkedin: 'https://linkedin.com/in/maria-fernandez',
    email: 'mfernandez@metricadip.com'
  },
  {
    id: '5',
    name: 'Jorge Vargas',
    role: 'Director de Innovación',
    bio: 'Ingeniero Industrial con MBA, especializado en transformación digital y metodologías ágiles aplicadas a construcción.',
    avatar: 'https://i.pravatar.cc/400?img=68',
    linkedin: 'https://linkedin.com/in/jorge-vargas',
    email: 'jvargas@metricadip.com'
  }
];

export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'El Futuro de la Construcción Sostenible en el Perú: Tendencias y Oportunidades para 2025',
    slug: 'futuro-construccion-sostenible-peru',
    category: 'industria-tendencias',
    tags: ['sostenibilidad', 'construcción verde', 'LEED', 'innovación', 'tendencias 2025'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-12-15'),
    readingTime: 12,
    excerpt: 'Análisis exhaustivo de las tendencias emergentes en construcción sostenible, tecnologías disruptivas y su impacto transformador en el mercado inmobiliario peruano para 2025. Descubre las oportunidades de inversión y los desafíos regulatorios que definirán la próxima década del sector.',
    content: `# El Futuro de la Construcción Sostenible en el Perú: Tendencias y Oportunidades para 2025

La industria de la construcción en el Perú está experimentando una transformación sin precedentes hacia prácticas más sostenibles, impulsada por factores ambientales, económicos y regulatorios que están redefiniendo completamente el panorama del sector...

## Tendencias Clave para 2025

### 1. Certificaciones Verdes: El Nuevo Estándar
La adopción de certificaciones LEED y BREEAM está creciendo exponencialmente, con un incremento del 340% en solicitudes durante 2024. Los desarrolladores peruanos están descubriendo que la inversión inicial en certificación verde se recupera en promedio en 3.2 años...

### 2. Materiales Innovadores: Revolución Local
El uso de materiales locales y reciclados se está convirtiendo en estándar de la industria. Destacan los adobes mejorados con fibras naturales, concretos con agregados reciclados y sistemas de aislamiento térmico fabricados con residuos agrícolas de la costa peruana...

### 3. Eficiencia Energética: Hacia el Net-Zero
Los edificios net-zero están ganando tracción en el mercado corporativo, especialmente en Lima y Arequipa. Las tecnologías de paneles solares integrados arquitectónicamente y sistemas geotérmicos adaptativos están demostrando viabilidad económica excepcional...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    seo: {
      metaTitle: 'El Futuro de la Construcción Sostenible en el Perú | Blog Métrica FM',
      metaDescription: 'Descubre las tendencias en construcción sostenible que transformarán el mercado inmobiliario peruano en 2025.',
      keywords: ['construcción sostenible', 'LEED Perú', 'edificios verdes', 'arquitectura sostenible'],
      schemaType: 'Article'
    },
    featured: true,
    views: 4230,
    likes: 256,
    status: 'published'
  },
  {
    id: '2',
    title: 'Caso de Estudio: Torre San Isidro - Innovación Tecnológica en Construcción Vertical',
    slug: 'caso-estudio-torre-san-isidro',
    category: 'casos-estudio',
    tags: ['caso estudio', 'oficinas premium', 'San Isidro', 'BIM', 'tecnología constructiva'],
    author: sampleAuthors[1],
    publishedAt: new Date('2024-12-10'),
    readingTime: 16,
    excerpt: 'Deep dive completo del proyecto Torre San Isidro: metodologías avanzadas de construcción, desafíos técnicos únicos, soluciones innovadoras implementadas y lecciones críticas aprendidas durante 24 meses de desarrollo y construcción en uno de los terrenos más desafiantes de Lima.',
    content: `# Caso de Estudio: Torre San Isidro - Innovación Tecnológica en Construcción Vertical

La Torre San Isidro representa uno de nuestros proyectos más ambiciosos y técnicamente desafiantes, estableciendo nuevos estándares en construcción de oficinas premium en Lima. Con 28 pisos, 45,000 m² de área construida y una inversión total de $85 millones, este proyecto redefine las posibilidades arquitectónicas en terrenos urbanos complejos...

## El Desafío Inicial: Complejidad Geotécnica y Urbana
Construir 28 pisos en un terreno irregular de apenas 1,200m², ubicado en una zona de alta densidad urbana, presentó desafíos únicos. El análisis geotécnico reveló la presencia de tres capas diferenciadas de suelo, incluyendo arcillas expansivas hasta los 15 metros de profundidad...

## Soluciones Innovadoras Implementadas
### Tecnología BIM 5D Integrada
Implementamos modelado BIM 5D completo, integrando diseño arquitectónico, estructural, MEP y análisis de costos en tiempo real. Esta metodología nos permitió identificar y resolver 347 interferencias potenciales antes del inicio de construcción, generando ahorros del 23% en tiempos de ejecución...

### Sistema Constructivo Híbrido
Desarrollamos un sistema constructivo híbrido que combina estructura metálica en niveles superiores con núcleo de concreto armado, optimizando tanto la velocidad de construcción como la resistencia sísmica. Los resultados excedieron las expectativas de performance estructural...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    seo: {
      metaTitle: 'Caso de Estudio: Torre San Isidro | Blog Métrica FM',
      metaDescription: 'Análisis completo del proyecto Torre San Isidro: metodologías, desafíos y resultados de construcción.',
      keywords: ['torre san isidro', 'caso estudio construcción', 'oficinas lima', 'BIM'],
      schemaType: 'Article'
    },
    featured: true,
    views: 3475,
    likes: 198,
    status: 'published'
  },
  {
    id: '3',
    title: 'Guía Definitiva: Certificación LEED en el Perú - Proceso Completo 2024-2025',
    slug: 'guia-certificacion-leed-peru',
    category: 'guias-tecnicas',
    tags: ['LEED', 'certificación verde', 'sostenibilidad', 'proceso técnico', 'regulación peruana'],
    author: sampleAuthors[3],
    publishedAt: new Date('2024-12-05'),
    readingTime: 18,
    excerpt: 'Guía técnica exhaustiva y actualizada para obtener certificación LEED en proyectos peruanos: análisis detallado de requisitos actualizados, proceso paso a paso, estructura de costos reales, cronogramas típicos, casos de éxito locales y estrategias específicas para maximizar puntuación en clima tropical y normativa local.',
    content: `# Guía Definitiva: Certificación LEED en el Perú - Proceso Completo 2024-2025

La certificación LEED (Leadership in Energy and Environmental Design) se ha consolidado como el estándar gold de sostenibilidad en construcción a nivel mundial. En el Perú, la demanda por edificaciones certificadas ha crecido exponencialmente, con más de 150 proyectos registrados en el último bienio...

## ¿Qué es LEED y Por Qué Importa en el Contexto Peruano?
LEED es un sistema de certificación desarrollado por el U.S. Green Building Council que evalúa el performance ambiental de edificios a través de múltiples criterios. En el mercado peruano, los edificios certificados LEED muestran un premium de valoración del 12-18% y tasas de ocupación superiores al 94%...

## Proceso Detallado de Certificación: Metodología Probada
### Fase 1: Registro y Estrategia Inicial (Mes 1-2)
El registro del proyecto debe realizarse durante la fase de diseño conceptual. Recomendamos formar un equipo multidisciplinario que incluya: arquitecto LEED AP, especialista en sistemas MEP, consultor en energía y especialista en sostenibilidad local...

### Fase 2: Diseño Integrado y Documentación (Mes 3-12)
La fase de diseño integrado es crítica para maximizar la puntuación LEED. Implementamos workshops colaborativos mensuales donde todos los especialistas optimizan soluciones de forma sinérgica...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    seo: {
      metaTitle: 'Guía LEED Perú: Certificación Paso a Paso | Blog Métrica FM',
      metaDescription: 'Guía completa para obtener certificación LEED en Perú: proceso, requisitos, costos y beneficios.',
      keywords: ['LEED Perú', 'certificación verde', 'construcción sostenible', 'guía LEED'],
      schemaType: 'TechArticle'
    },
    featured: false,
    views: 5240,
    likes: 387,
    status: 'published'
  },
  {
    id: '4',
    title: 'Transformación Digital en Construcción: BIM, IoT y AI Revolucionan la Industria Peruana',
    slug: 'transformacion-digital-construccion-peru',
    category: 'industria-tendencias',
    tags: ['BIM', 'IoT', 'inteligencia artificial', 'transformación digital', 'construcción 4.0'],
    author: sampleAuthors[4],
    publishedAt: new Date('2024-12-01'),
    readingTime: 14,
    excerpt: 'La construcción 4.0 está transformando radicalmente la industria peruana. Exploramos cómo la integración de metodologías BIM avanzadas, sensores IoT en tiempo real y algoritmos de inteligencia artificial están optimizando productividad, reduciendo desperdicios y mejorando la seguridad en obra de manera exponencial.',
    content: `# Transformación Digital en Construcción: BIM, IoT y AI Revolucionan la Industria Peruana

La cuarta revolución industrial está transformando la construcción peruana de forma acelerada. Empresas líderes están adoptando tecnologías emergentes que prometen reducir costos en 25%, mejorar tiempos de entrega en 30% y virtualmente eliminar accidentes laborales graves...

## BIM: Más Allá del Modelado 3D
La implementación de Building Information Modeling ha evolucionado de simples representaciones 3D hacia ecosistemas digitales complejos que integran análisis paramétrico, simulaciones ambientales y gestión de activos durante todo el ciclo de vida del edificio...

## Internet de las Cosas: Obra Inteligente y Conectada
Los sensores IoT están revolucionando el monitoreo en tiempo real de variables críticas: humedad del concreto, cargas estructurales, calidad del aire, temperatura ambiental y niveles de ruido. Esta data alimenta dashboards predictivos que permiten tomar decisiones informadas instantáneamente...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    seo: {
      metaTitle: 'Transformación Digital Construcción Perú | BIM IoT AI | Blog Métrica FM',
      metaDescription: 'Descubre cómo BIM, IoT y AI están revolucionando la construcción peruana con casos reales y resultados.',
      keywords: ['BIM Perú', 'IoT construcción', 'AI construcción', 'construcción 4.0', 'transformación digital'],
      schemaType: 'TechArticle'
    },
    featured: true,
    views: 2890,
    likes: 164,
    status: 'published'
  },
  {
    id: '5',
    title: 'Liderazgo en Tiempos de Cambio: Estrategias para Directores de Proyecto en Era Post-Pandemia',
    slug: 'liderazgo-directores-proyecto-post-pandemia',
    category: 'liderazgo-vision',
    tags: ['liderazgo', 'gestión de proyectos', 'post-pandemia', 'equipos remotos', 'resiliencia'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-11-28'),
    readingTime: 11,
    excerpt: 'La pandemia redefinió permanentemente la gestión de proyectos de construcción. Analizamos las nuevas competencias de liderazgo requeridas, estrategias efectivas para gestionar equipos híbridos, metodologías ágiles adaptadas al sector y herramientas digitales que están marcando la diferencia en productividad y cohesión de equipo.',
    content: `# Liderazgo en Tiempos de Cambio: Estrategias para Directores de Proyecto en Era Post-Pandemia

El liderazgo en construcción ha evolucionado dramáticamente desde 2020. Los directores de proyecto exitosos han desarrollado nuevas competencias que combinan gestión técnica tradicional con habilidades digitales avanzadas y inteligencia emocional elevada...

## El Nuevo Perfil del Director de Proyecto
Los líderes excepcionales de hoy dominan tres dimensiones críticas: excelencia técnica tradicional, competencia digital avanzada y liderazgo empático. Esta combinación está probando ser el diferenciador competitivo más importante en el mercado actual...

## Gestión de Equipos Híbridos: Presencial y Remoto
La gestión de equipos distribuidos requiere metodologías específicas. Implementamos protocolos de comunicación estructurados, herramientas de colaboración sincrónica y asincrónica, y métricas de performance adaptadas a la realidad híbrida...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    seo: {
      metaTitle: 'Liderazgo Directores Proyecto Post-Pandemia | Blog Métrica FM',
      metaDescription: 'Estrategias de liderazgo para directores de proyecto en construcción: equipos híbridos y metodologías ágiles.',
      keywords: ['liderazgo construcción', 'directores proyecto', 'equipos híbridos', 'post-pandemia'],
      schemaType: 'Article'
    },
    featured: false,
    views: 1960,
    likes: 143,
    status: 'published'
  },
  {
    id: '6',
    title: 'Centro Comercial Jockey Plaza: Renovación Integral con Criterios de Sostenibilidad',
    slug: 'caso-estudio-jockey-plaza-renovacion',
    category: 'casos-estudio',
    tags: ['renovación comercial', 'retail', 'sostenibilidad', 'Jockey Plaza', 'modernización'],
    author: sampleAuthors[1],
    publishedAt: new Date('2024-11-25'),
    readingTime: 13,
    excerpt: 'Análisis técnico completo de la renovación integral del Centro Comercial Jockey Plaza: desafíos únicos de modernización sin interrumpir operaciones comerciales, implementación de tecnologías sostenibles avanzadas, optimización de flujos peatonales y resultados excepcionales en eficiencia energética y experiencia del usuario.',
    content: `# Centro Comercial Jockey Plaza: Renovación Integral con Criterios de Sostenibilidad

La renovación del Centro Comercial Jockey Plaza representó uno de los desafíos técnicos y logísticos más complejos de nuestro portafolio. Modernizar 180,000 m² de área comercial operativa, sin interrumpir las actividades de 400 tiendas y manteniendo flujo de 2.8 millones de visitantes mensuales...

## El Desafío: Construcción en Operación Total
Renovar un centro comercial completamente operativo requirió desarrollar una metodología de construcción por fases que garantizara continuidad comercial 100%. Dividimos el proyecto en 12 etapas secuenciales, cada una con duración máxima de 45 días...

## Innovaciones en Sostenibilidad Comercial
Implementamos el primer sistema de climatización geotérmica en un centro comercial peruano, aprovechando la temperatura constante del subsuelo limeño para reducir consumo energético en 40%. Adicionalmente, instalamos 2,400 m² de paneles solares integrados arquitectónicamente...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    seo: {
      metaTitle: 'Renovación Jockey Plaza: Caso Estudio Sostenibilidad | Blog Métrica FM',
      metaDescription: 'Análisis técnico de la renovación sostenible del Centro Comercial Jockey Plaza con metodologías innovadoras.',
      keywords: ['Jockey Plaza', 'renovación comercial', 'sostenibilidad retail', 'modernización centros comerciales'],
      schemaType: 'Article'
    },
    featured: true,
    views: 2340,
    likes: 156,
    status: 'published'
  },
  {
    id: '7',
    title: 'Normativa de Construcción en Perú: Actualizaciones Críticas RNE 2024 y Su Impacto',
    slug: 'normativa-construccion-rne-2024-actualizaciones',
    category: 'guias-tecnicas',
    tags: ['RNE', 'normativa peruana', 'regulación construcción', 'compliance', 'actualización legal'],
    author: sampleAuthors[2],
    publishedAt: new Date('2024-11-22'),
    readingTime: 16,
    excerpt: 'Análisis exhaustivo de las modificaciones al Reglamento Nacional de Edificaciones 2024: nuevos estándares sísmicos, requisitos de accesibilidad ampliados, normativas ambientales reforzadas y procedimientos administrativos digitalizados. Guía práctica para asegurar compliance total en proyectos actuales y futuros.',
    content: `# Normativa de Construcción en Perú: Actualizaciones Críticas RNE 2024 y Su Impacto

Las modificaciones al Reglamento Nacional de Edificaciones (RNE) 2024 introducen cambios fundamentales que afectan significativamente el diseño, construcción y operación de edificaciones en todo el territorio peruano. Estos cambios responden a lecciones aprendidas de eventos sísmicos recientes y estándares internacionales actualizados...

## Nuevos Estándares Sísmicos: Incremento en Exigencias
La Norma E.030 introduce factores de amplificación sísmica actualizados para 147 distritos del país, basados en estudios de microzonificación completados en 2023. Los factores de suelo han sido recalibrados, resultando en incrementos de hasta 15% en las fuerzas de diseño para ciertas zonas...

## Accesibilidad Universal: Expansión de Requisitos
La Norma A.120 amplía significativamente los requisitos de accesibilidad, incluyendo por primera vez edificaciones residenciales multifamiliares de más de 3 pisos. Las nuevas exigencias incluyen rutas accesibles, sistemas de evacuación para personas con discapacidad y señalización táctil obligatoria...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    seo: {
      metaTitle: 'RNE 2024: Nueva Normativa Construcción Perú | Blog Métrica FM',
      metaDescription: 'Análisis completo de las actualizaciones RNE 2024: cambios sísmicos, accesibilidad y compliance.',
      keywords: ['RNE 2024', 'normativa construcción Perú', 'reglamento edificaciones', 'compliance construcción'],
      schemaType: 'TechArticle'
    },
    featured: false,
    views: 4120,
    likes: 298,
    status: 'published'
  },
  {
    id: '8',
    title: 'Mercado Inmobiliario Lima 2024: Análisis de Tendencias, Precios y Proyecciones 2025',
    slug: 'mercado-inmobiliario-lima-analisis-2024',
    category: 'industria-tendencias',
    tags: ['mercado inmobiliario', 'Lima', 'precios', 'tendencias', 'proyecciones 2025'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-11-18'),
    readingTime: 15,
    excerpt: 'Análisis integral del mercado inmobiliario limeño 2024: evolución de precios por distrito, nuevos segmentos emergentes, impacto de políticas monetarias, tendencias de demanda generacional y proyecciones fundamentadas para 2025. Incluye data exclusiva de transacciones y matriz de oportunidades de inversión.',
    content: `# Mercado Inmobiliario Lima 2024: Análisis de Tendencias, Precios y Proyecciones 2025

El mercado inmobiliario limeño ha mostrado una resiliencia excepcional durante 2024, registrando crecimiento del 8.3% en valores promedio y una reconfiguración significativa en patrones de demanda. Nuestro análisis de 15,000 transacciones revela tendencias que definirán las oportunidades de inversión en 2025...

## Evolución de Precios por Segmento y Distrito
### Segmento Premium (San Isidro, Miraflores, La Molina)
Los distritos premium mantienen liderazgo en valorización, con incrementos promedio del 12.4%. San Isidro lidera con $2,850/m², seguido por Miraflores con $2,640/m². La demanda se concentra en unidades de 80-120 m² con amenities diferenciados...

### Segmento Medio-Alto Emergente (San Borja, Surco, Magdalena)
San Borja emerge como el distrito con mayor potencial de revalorización, registrando incrementos del 15.7% anual. Los proyectos mixed-use están redefiniendo la oferta, con precios promedio de $1,890/m²...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    seo: {
      metaTitle: 'Mercado Inmobiliario Lima 2024: Análisis y Proyecciones | Blog Métrica FM',
      metaDescription: 'Análisis completo del mercado inmobiliario limeño 2024: precios, tendencias y proyecciones para 2025.',
      keywords: ['mercado inmobiliario Lima', 'precios inmobiliarios 2024', 'tendencias inmobiliarias', 'inversión inmobiliaria'],
      schemaType: 'Article'
    },
    featured: true,
    views: 3780,
    likes: 224,
    status: 'published'
  },
  {
    id: '9',
    title: 'Seguridad en Obra: Protocolos Avanzados y Tecnologías de Prevención en Construcción',
    slug: 'seguridad-obra-protocolos-avanzados',
    category: 'guias-tecnicas',
    tags: ['seguridad', 'protocolos', 'prevención', 'obra', 'tecnología'],
    author: sampleAuthors[2],
    publishedAt: new Date('2024-11-15'),
    readingTime: 14,
    excerpt: 'Guía completa de implementación de protocolos de seguridad avanzados en obra: nuevas tecnologías de monitoreo, sistemas de alerta temprana, capacitación digital del personal y metodologías que han reducido accidentes laborales hasta un 85% en proyectos de construcción de gran escala.',
    content: `# Seguridad en Obra: Protocolos Avanzados y Tecnologías de Prevención en Construcción

La seguridad en obra ha evolucionado dramáticamente con la integración de tecnologías avanzadas y protocolos sistematizados. Las empresas líderes están implementando soluciones que combinan IoT, inteligencia artificial y capacitación digital para crear entornos de trabajo excepcionalmente seguros...

## Tecnologías de Monitoreo en Tiempo Real
Los sensores IoT distribuidos estratégicamente en obra monitorean constantemente variables críticas: calidad del aire, niveles de ruido, proximidad a zonas peligrosas y uso correcto de equipos de protección personal...

## Sistemas de Alerta Temprana Inteligentes
Los algoritmos de machine learning analizan patrones de comportamiento y condiciones ambientales para predecir situaciones de riesgo antes de que ocurran, activando alertas automáticas y protocolos de respuesta inmediata...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    seo: {
      metaTitle: 'Seguridad en Obra: Protocolos Avanzados | Blog Métrica FM',
      metaDescription: 'Implementa protocolos de seguridad avanzados con tecnologías IoT y AI para reducir accidentes en obra.',
      keywords: ['seguridad obra', 'protocolos construcción', 'prevención accidentes', 'IoT construcción'],
      schemaType: 'TechArticle'
    },
    featured: false,
    views: 2180,
    likes: 167,
    status: 'published'
  },
  {
    id: '10',
    title: 'Estrategias de Financiamiento para Proyectos Inmobiliarios: Nuevas Modalidades 2024',
    slug: 'financiamiento-proyectos-inmobiliarios-2024',
    category: 'industria-tendencias',
    tags: ['financiamiento', 'inmobiliario', 'inversión', 'crowdfunding', 'fintech'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-11-12'),
    readingTime: 13,
    excerpt: 'Panorama completo de las nuevas modalidades de financiamiento inmobiliario en Perú: crowdfunding inmobiliario, tokenización de activos, fondos de inversión especializados y partnerships estratégicos que están democratizando el acceso a inversiones en desarrollo inmobiliario de alta rentabilidad.',
    content: `# Estrategias de Financiamiento para Proyectos Inmobiliarios: Nuevas Modalidades 2024

El ecosistema de financiamiento inmobiliario peruano está experimentando una revolución con la llegada de nuevas modalidades que combinan tecnología financiera, regulación flexible y demanda creciente de alternativas de inversión...

## Crowdfunding Inmobiliario: Democratización del Acceso
Las plataformas de crowdfunding inmobiliario han procesado más de $45 millones en 2024, permitiendo a inversionistas acceder a proyectos premium con montos mínimos de $5,000...

## Tokenización de Activos Inmobiliarios
La tokenización permite fraccionar la propiedad de activos inmobiliarios de alto valor, creando liquidez en un mercado tradicionalmente ilíquido y abriendo oportunidades de inversión granular...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    seo: {
      metaTitle: 'Financiamiento Proyectos Inmobiliarios 2024 | Blog Métrica FM',
      metaDescription: 'Descubre las nuevas modalidades de financiamiento inmobiliario: crowdfunding, tokenización y más.',
      keywords: ['financiamiento inmobiliario', 'crowdfunding', 'tokenización', 'inversión inmobiliaria'],
      schemaType: 'Article'
    },
    featured: true,
    views: 3210,
    likes: 198,
    status: 'published'
  },
  {
    id: '11',
    title: 'Residencial Las Flores: Proyecto Piloto de Vivienda Social Sostenible en Lima Norte',
    slug: 'caso-estudio-residencial-las-flores',
    category: 'casos-estudio',
    tags: ['vivienda social', 'Lima Norte', 'sostenible', 'proyecto piloto', 'innovación social'],
    author: sampleAuthors[1],
    publishedAt: new Date('2024-11-08'),
    readingTime: 15,
    excerpt: 'Análisis detallado del Residencial Las Flores, primer proyecto de vivienda social sostenible en Lima Norte: metodologías de construcción industrializada, sistemas de captación de agua lluvia, energía solar comunitaria y modelo de gestión vecinal que ha establecido nuevos estándares para vivienda accesible y ambientalmente responsable.',
    content: `# Residencial Las Flores: Proyecto Piloto de Vivienda Social Sostenible en Lima Norte

El Residencial Las Flores marca un hito en vivienda social peruana, combinando accesibilidad económica con sostenibilidad ambiental. Este proyecto piloto de 240 unidades ha demostrado que es posible construir vivienda digna y sostenible para familias de ingresos medios-bajos...

## Innovación en Sistemas Constructivos
Implementamos técnicas de construcción industrializada que redujeron tiempos de edificación en 40% y costos en 25%, manteniendo estándares de calidad superiores a la vivienda social tradicional...

## Sostenibilidad Integral Comunitaria
El proyecto incluye sistemas de captación y tratamiento de aguas grises, paneles solares comunitarios y áreas verdes productivas que generan alimentos para los residentes, creando un ecosistema autosustentable...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    seo: {
      metaTitle: 'Residencial Las Flores: Vivienda Social Sostenible | Blog Métrica FM',
      metaDescription: 'Caso de estudio completo del primer proyecto de vivienda social sostenible en Lima Norte.',
      keywords: ['vivienda social', 'construcción sostenible', 'Lima Norte', 'innovación social'],
      schemaType: 'Article'
    },
    featured: true,
    views: 1890,
    likes: 143,
    status: 'published'
  },
  {
    id: '12',
    title: 'Gestión de Stakeholders en Proyectos de Gran Escala: Metodologías Efectivas',
    slug: 'gestion-stakeholders-proyectos-gran-escala',
    category: 'liderazgo-vision',
    tags: ['stakeholders', 'gestión', 'comunicación', 'gran escala', 'metodologías'],
    author: sampleAuthors[4],
    publishedAt: new Date('2024-11-05'),
    readingTime: 12,
    excerpt: 'Metodologías probadas para la gestión efectiva de stakeholders en proyectos de infraestructura de gran escala: mapeo de influencias, estrategias de comunicación diferenciada, manejo de conflictos, construcción de consensos y herramientas digitales que han garantizado el éxito en proyectos con más de 50 stakeholders diversos.',
    content: `# Gestión de Stakeholders en Proyectos de Gran Escala: Metodologías Efectivas

La gestión de stakeholders en proyectos de infraestructura complejos requiere un enfoque sistemático y diferenciado. Nuestra experiencia en proyectos con presupuestos superiores a $100 millones ha generado metodologías probadas para alinear intereses diversos...

## Mapeo Dinámico de Stakeholders
Desarrollamos matrices dinámicas que categorizan stakeholders por nivel de influencia, interés en el proyecto y capacidad de impacto, actualizando estas evaluaciones mensualmente durante todo el ciclo del proyecto...

## Estrategias de Comunicación Multicanal
Implementamos protocolos de comunicación diferenciados por perfil de stakeholder: reportes ejecutivos para inversionistas, dashboards técnicos para autoridades y comunicados vecinales para comunidades locales...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    seo: {
      metaTitle: 'Gestión Stakeholders Proyectos Gran Escala | Blog Métrica FM',
      metaDescription: 'Metodologías efectivas para gestionar stakeholders en proyectos de infraestructura complejos.',
      keywords: ['gestión stakeholders', 'proyectos gran escala', 'comunicación proyecto', 'liderazgo'],
      schemaType: 'Article'
    },
    featured: false,
    views: 1560,
    likes: 89,
    status: 'published'
  },
  {
    id: '13',
    title: 'Materiales de Construcción del Futuro: Innovaciones que Revolucionan la Industria',
    slug: 'materiales-construccion-futuro-innovaciones',
    category: 'industria-tendencias',
    tags: ['materiales innovadores', 'nanotecnología', 'construcción futuro', 'sostenibilidad', 'investigación'],
    author: sampleAuthors[3],
    publishedAt: new Date('2024-11-01'),
    readingTime: 16,
    excerpt: 'Exploración detallada de los materiales de construcción más innovadores: concretos autorreparables con nanotecnología, maderas modificadas genéticamente, composites de fibra de carbono reciclable, materiales biológicos cultivados en laboratorio y polímeros inteligentes que están redefiniendo las posibilidades arquitectónicas y estructurales.',
    content: `# Materiales de Construcción del Futuro: Innovaciones que Revolucionan la Industria

La ciencia de materiales está experimentando avances revolucionarios que prometen transformar fundamentalmente la construcción. Desde concretos que se reparan a sí mismos hasta materiales biológicos cultivados en laboratorio...

## Concretos Inteligentes con Nanotecnología
Los nuevos concretos incorporan nanocápsulas que liberan agentes reparadores cuando se detectan fisuras, extendiendo la vida útil de estructuras de 50 a más de 100 años...

## Biomateriales: La Construcción Viva
Materiales cultivados a partir de organismos vivos, como el "micelio brick" fabricado con hongos, ofrecen propiedades únicas: son naturalmente ignífugos, tienen excelente aislamiento térmico y son completamente biodegradables...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    seo: {
      metaTitle: 'Materiales Construcción Futuro: Innovaciones | Blog Métrica FM',
      metaDescription: 'Descubre los materiales innovadores que revolucionarán la construcción: nanotecnología, biomateriales y más.',
      keywords: ['materiales innovadores', 'nanotecnología construcción', 'biomateriales', 'construcción futuro'],
      schemaType: 'TechArticle'
    },
    featured: true,
    views: 4150,
    likes: 312,
    status: 'published'
  },
  {
    id: '14',
    title: 'Automatización en Construcción: Robots y Drones Transforman la Productividad',
    slug: 'automatizacion-construccion-robots-drones',
    category: 'guias-tecnicas',
    tags: ['automatización', 'robots', 'drones', 'productividad', 'construcción 4.0'],
    author: sampleAuthors[4],
    publishedAt: new Date('2024-10-28'),
    readingTime: 17,
    excerpt: 'Guía técnica completa sobre la implementación de automatización en construcción: robots de albañilería autónomos, drones de topografía y monitoreo, impresoras 3D de gran formato, vehículos autónomos de carga y sistemas de control inteligente que están multiplicando la productividad y reduciendo errores humanos de manera exponencial.',
    content: `# Automatización en Construcción: Robots y Drones Transforman la Productividad

La automatización en construcción ha alcanzado un punto de inflexión. Las tecnologías robóticas y los sistemas autónomos están demostrando ROI positivo en proyectos comerciales, marcando el inicio de la verdadera revolución industrial en construcción...

## Robots de Construcción: De la Fantasía a la Realidad
Los robots de albañilería pueden colocar hasta 3,000 ladrillos por día con precisión milimétrica, superando ampliamente la productividad humana y eliminando virtualmente los errores de alineación...

## Drones Inteligentes: Ojos en el Cielo
Los drones equipados con LiDAR y cámaras multiespectrales realizan levantamientos topográficos completos en horas en lugar de semanas, con precisión superior a métodos tradicionales...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    seo: {
      metaTitle: 'Automatización Construcción: Robots y Drones | Blog Métrica FM',
      metaDescription: 'Implementa robots y drones en construcción para multiplicar productividad y reducir errores.',
      keywords: ['automatización construcción', 'robots construcción', 'drones construcción', 'construcción 4.0'],
      schemaType: 'TechArticle'
    },
    featured: false,
    views: 2760,
    likes: 184,
    status: 'published'
  },
  {
    id: '15',
    title: 'Desarrollo Urbano Sostenible: Planificación Integral para Ciudades del Futuro',
    slug: 'desarrollo-urbano-sostenible-ciudades-futuro',
    category: 'liderazgo-vision',
    tags: ['desarrollo urbano', 'ciudades sostenibles', 'planificación', 'smart cities', 'futuro urbano'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-10-25'),
    readingTime: 18,
    excerpt: 'Visión integral del desarrollo urbano sostenible en Perú: principios de planificación bioclimática, integración de infraestructura verde, movilidad multimodal, gestión inteligente de recursos, participación ciudadana digital y modelos de financiamiento innovadores que están creando las ciudades peruanas del siglo XXI.',
    content: `# Desarrollo Urbano Sostenible: Planificación Integral para Ciudades del Futuro

Las ciudades peruanas están en una encrucijada histórica. El crecimiento urbano acelerado presenta tanto desafíos como oportunidades únicas para crear centros urbanos que sean ambientalmente sostenibles, económicamente viables y socialmente inclusivos...

## Principios de Planificación Bioclimática
La planificación urbana debe aprovechar las condiciones climáticas locales: orientación de vías para ventilación natural, posicionamiento de edificios para aprovechamiento solar y sistemas de drenaje que imiten procesos hidrológicos naturales...

## Infraestructura Verde Integrada
Los corredores ecológicos urbanos no son solo espacios verdes, sino sistemas multifuncionales que gestionan aguas pluviales, mejoran calidad del aire, regulan temperatura urbana y proporcionan espacios de recreación y biodiversidad...`,
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    seo: {
      metaTitle: 'Desarrollo Urbano Sostenible: Ciudades Futuro | Blog Métrica FM',
      metaDescription: 'Planificación integral para desarrollo urbano sostenible: smart cities, infraestructura verde y más.',
      keywords: ['desarrollo urbano sostenible', 'ciudades sostenibles', 'smart cities', 'planificación urbana'],
      schemaType: 'Article'
    },
    featured: true,
    views: 3890,
    likes: 267,
    status: 'published'
  }
];

// Funciones helper para datos
export function getBlogPost(slug: string): BlogPost | null {
  return sampleBlogPosts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  return sampleBlogPosts.filter(post => post.category === category);
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return sampleBlogPosts.filter(post => post.featured);
}

export function getBlogStats(): BlogStats {
  const totalViews = sampleBlogPosts.reduce((sum, post) => sum + (post.views || 0), 0);
  const averageReadingTime = Math.round(
    sampleBlogPosts.reduce((sum, post) => sum + post.readingTime, 0) / sampleBlogPosts.length
  );
  
  const allTags = sampleBlogPosts.flatMap(post => post.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalPosts: sampleBlogPosts.length,
    totalAuthors: sampleAuthors.length,
    totalCategories: 4,
    averageReadingTime,
    totalViews,
    popularTags
  };
}