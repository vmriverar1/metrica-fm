// FASE 5B: Critical CSS Extraction and Inlining
// Sistema para extraer e inline critical CSS above-the-fold

export interface CriticalCSSConfig {
  route: string;
  viewport: {
    width: number;
    height: number;
  };
  selectors: string[];
  ignoreSelectors?: string[];
}

// Critical CSS para diferentes rutas
export const CRITICAL_CSS_CONFIGS: CriticalCSSConfig[] = [
  {
    route: '/',
    viewport: { width: 1200, height: 600 },
    selectors: [
      // Layout fundamentals
      'html', 'body', '*', '*:before', '*:after',
      // Header crítico
      'header', '.header-container', '.header-nav',
      // Hero section above fold
      '.hero', '.hero-container', '.hero-title', '.hero-subtitle',
      '.hero-cta', '.hero-background',
      // Typography crítico
      'h1', 'h2', 'p', 'a', 'button',
      // Tailwind utilities críticas
      '.container', '.mx-auto', '.px-4', '.py-8', '.mb-6',
      '.text-center', '.font-bold', '.text-2xl', '.text-lg',
      '.bg-blue-600', '.text-white', '.rounded-lg',
      // Animations críticas
      '.fade-in-up', '.animate-fade-in',
    ],
    ignoreSelectors: [
      // Footer y componentes below fold
      'footer', '.footer-container',
      // Portfolio section (below fold)
      '.portfolio-section', '.portfolio-grid',
      // Complex animations
      '@keyframes', '.animate-',
    ],
  },
  {
    route: '/portfolio',
    viewport: { width: 1200, height: 600 },
    selectors: [
      'html', 'body', '*', '*:before', '*:after',
      'header', '.header-container', '.header-nav',
      '.portfolio-header', '.portfolio-title',
      '.category-filter', '.filter-button',
      '.portfolio-grid', '.portfolio-card:nth-child(-n+6)', // First 6 cards only
      'h1', 'h2', 'h3', 'p', 'button',
      '.container', '.mx-auto', '.grid', '.gap-6',
    ],
  },
  {
    route: '/services',
    viewport: { width: 1200, height: 600 },
    selectors: [
      'html', 'body', '*', '*:before', '*:after',
      'header', '.header-container', '.header-nav',
      '.services-hero', '.services-title',
      '.services-grid', '.service-card:nth-child(-n+3)', // First 3 services
      'h1', 'h2', 'h3', 'p',
      '.container', '.mx-auto', '.grid', '.gap-8',
    ],
  },
];

// Critical CSS base - Always included
export const BASE_CRITICAL_CSS = `
/* FASE 5B: Critical CSS Base - Above the fold essentials */

/* Reset and base */
*,*:before,*:after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:80px}
body{margin:0;padding:0;font-family:'Alliance No.2','Poppins',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}

/* Typography critical */
h1,h2,h3{margin:0 0 1rem 0;font-weight:800;line-height:1.2}
h1{font-size:2.5rem}
h2{font-size:2rem}
p{margin:0 0 1rem 0}
a{color:inherit;text-decoration:none}

/* Layout critical */
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
.mx-auto{margin-left:auto;margin-right:auto}
.px-4{padding-left:1rem;padding-right:1rem}
.py-8{padding-top:2rem;padding-bottom:2rem}
.mb-6{margin-bottom:1.5rem}
.text-center{text-align:center}
.grid{display:grid}
.flex{display:flex}
.items-center{align-items:center}
.justify-center{justify-content:center}

/* Colors critical */
.bg-blue-600{background-color:#2563eb}
.text-white{color:#ffffff}
.text-gray-900{color:#111827}
.text-gray-600{color:#4b5563}

/* Button critical */
button,.btn{display:inline-flex;align-items:center;justify-content:center;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:500;transition:all 0.2s;border:none;cursor:pointer}
.btn-primary{background-color:#2563eb;color:#ffffff}
.btn-primary:hover{background-color:#1d4ed8}

/* Header critical */
header{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb}
.header-container{display:flex;align-items:center;justify-content:between;padding:1rem}

/* Hero critical - Above fold only */
.hero{min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative}
.hero-title{font-size:3rem;font-weight:800;margin-bottom:1rem;color:#111827}
.hero-subtitle{font-size:1.25rem;color:#4b5563;margin-bottom:2rem;max-width:600px;margin-left:auto;margin-right:auto}

/* Font loading optimization */
.font-loading{font-family:'Alliance No.2','Poppins',system-ui,sans-serif}

@media (max-width: 768px) {
  html{scroll-padding-top:60px}
  .hero-title{font-size:2rem}
  .hero-subtitle{font-size:1rem}
  .container{padding:0 0.75rem}
}
`;

// Route-specific critical CSS
export const ROUTE_CRITICAL_CSS: Record<string, string> = {
  '/': `
/* Homepage specific critical CSS */
.hero-cta{margin-top:2rem}
.hero-background{position:absolute;top:0;left:0;right:0;bottom:0;z-index:-1;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%)}
.stats-section{padding:3rem 0;background:#f9fafb}
.stat-item{text-align:center;padding:1rem}
.stat-number{font-size:2.5rem;font-weight:800;color:#2563eb}
.stat-label{font-size:0.875rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em}
  `,

  '/portfolio': `
/* Portfolio specific critical CSS */
.portfolio-header{text-align:center;padding:2rem 0}
.portfolio-title{font-size:2.5rem;margin-bottom:1rem}
.category-filter{display:flex;gap:0.5rem;justify-content:center;margin:2rem 0;flex-wrap:wrap}
.filter-button{padding:0.5rem 1rem;border:1px solid #d1d5db;border-radius:0.5rem;background:#ffffff;cursor:pointer;transition:all 0.2s}
.filter-button.active,.filter-button:hover{background:#2563eb;color:#ffffff;border-color:#2563eb}
.portfolio-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
  `,

  '/services': `
/* Services specific critical CSS */
.services-hero{text-align:center;padding:3rem 0;background:#f9fafb}
.services-title{font-size:2.5rem;margin-bottom:1rem}
.services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-top:2rem}
.service-card{background:#ffffff;padding:1.5rem;border-radius:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
.service-icon{width:3rem;height:3rem;margin-bottom:1rem;color:#2563eb}
.service-title{font-size:1.25rem;font-weight:600;margin-bottom:0.5rem}
  `,
};

export class CriticalCSSExtractor {
  private route: string;
  private config: CriticalCSSConfig;

  constructor(route: string) {
    this.route = route;
    this.config = CRITICAL_CSS_CONFIGS.find(c => c.route === route) || CRITICAL_CSS_CONFIGS[0];
  }

  generateCriticalCSS(): string {
    const baseCss = BASE_CRITICAL_CSS;
    const routeSpecificCss = ROUTE_CRITICAL_CSS[this.route] || '';

    return `${baseCss}${routeSpecificCss}`.replace(/\s+/g, ' ').trim();
  }

  generateInlineStyles(): string {
    const criticalCSS = this.generateCriticalCSS();
    return `<style id="critical-css">${criticalCSS}</style>`;
  }

  // For build time optimization
  static generateAllRoutes(): Record<string, string> {
    const result: Record<string, string> = {};

    CRITICAL_CSS_CONFIGS.forEach(config => {
      const extractor = new CriticalCSSExtractor(config.route);
      result[config.route] = extractor.generateCriticalCSS();
    });

    return result;
  }

  // Font loading optimization
  static generateFontPreloadLinks(): string[] {
    return [
      '<link rel="preload" href="/fonts/Alliance No.2 Medium.otf" as="font" type="font/otf" crossorigin="anonymous">',
      '<link rel="preload" href="/fonts/Alliance No.2 ExtraBold.otf" as="font" type="font/otf" crossorigin="anonymous">',
    ];
  }

  // Resource hints for critical resources
  static generateResourceHints(): string[] {
    return [
      // Preconnect to external domains
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link rel="preconnect" href="https://images.unsplash.com">',

      // DNS prefetch for less critical resources
      '<link rel="dns-prefetch" href="https://picsum.photos">',
      '<link rel="dns-prefetch" href="https://via.placeholder.com">',

      // Preload critical resources
      '<link rel="preload" href="/icons/icon-192x192.png" as="image">',
      '<link rel="modulepreload" href="/_next/static/chunks/main.js">',
    ];
  }

  // Critical path optimization
  static shouldInlineCriticalCSS(userAgent?: string): boolean {
    // Only inline for modern browsers to avoid bloat
    if (!userAgent) return true;

    // Skip inlining for old browsers that might struggle with large inline CSS
    const isOldBrowser = /MSIE|Trident|Edge\/[0-9]{2}\./.test(userAgent);
    return !isOldBrowser;
  }
}

// Hook para usar en componentes React
export function useCriticalCSS(route: string) {
  const extractor = new CriticalCSSExtractor(route);

  return {
    criticalCSS: extractor.generateCriticalCSS(),
    inlineStyles: extractor.generateInlineStyles(),
    fontPreloads: CriticalCSSExtractor.generateFontPreloadLinks(),
    resourceHints: CriticalCSSExtractor.generateResourceHints(),
  };
}