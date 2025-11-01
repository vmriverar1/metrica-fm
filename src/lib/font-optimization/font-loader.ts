// FASE 5C: Font Loading Optimization
// Sistema optimizado para carga de fuentes con minimal CLS

export interface FontConfig {
  family: string;
  src: string;
  weight: string;
  style: string;
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload: boolean;
  critical: boolean;
}

// Configuración de fuentes optimizada para Métrica FM
export const FONT_CONFIGS: FontConfig[] = [
  {
    family: 'Alliance No.2',
    src: '/fonts/Alliance No.2 Medium.otf',
    weight: '500',
    style: 'normal',
    display: 'swap',
    preload: true,
    critical: true, // Usado en body text
  },
  {
    family: 'Alliance No.2',
    src: '/fonts/Alliance No.2 ExtraBold.otf',
    weight: '800',
    style: 'normal',
    display: 'swap',
    preload: true,
    critical: true, // Usado en headings
  },
  {
    family: 'Alliance No.2',
    src: '/fonts/Alliance No.2 Light.otf',
    weight: '300',
    style: 'normal',
    display: 'swap',
    preload: false,
    critical: false, // Usado menos frecuentemente
  },
  {
    family: 'Marsek Demi',
    src: '/fonts/Marsek-Demi.ttf',
    weight: '600',
    style: 'normal',
    display: 'swap',
    preload: false,
    critical: false, // Solo para el logo
  },
];

// Fuentes fallback del sistema
export const SYSTEM_FONTS = {
  sansSerif: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ].join(', '),

  serif: [
    'Georgia',
    'Cambria',
    '"Times New Roman"',
    'Times',
    'serif'
  ].join(', '),
};

export class FontOptimizer {
  private loadedFonts: Set<string> = new Set();
  private fontPromises: Map<string, Promise<FontFace>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeFontLoading();
    }
  }

  private initializeFontLoading(): void {
    // Set initial font-display class
    document.documentElement.classList.add('fonts-loading');

    // Listen for font loading events
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', () => {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        console.warn('Font loading error:', event);
      });
    }
  }

  // Generate preload links for critical fonts
  generatePreloadLinks(): string[] {
    return FONT_CONFIGS
      .filter(config => config.preload)
      .map(config => {
        const format = config.src.endsWith('.woff2') ? 'woff2' :
                     config.src.endsWith('.woff') ? 'woff' :
                     config.src.endsWith('.otf') ? 'truetype' : 'truetype';

        return `<link rel="preload" href="${config.src}" as="font" type="font/${format}" crossorigin="anonymous">`;
      });
  }

  // Generate CSS font-face declarations
  generateFontFaceCSS(): string {
    return FONT_CONFIGS
      .map(config => `
        @font-face {
          font-family: '${config.family}';
          src: url('${config.src}') format('${this.getFormat(config.src)}');
          font-weight: ${config.weight};
          font-style: ${config.style};
          font-display: ${config.display};
        }
      `)
      .join('\n');
  }

  private getFormat(src: string): string {
    if (src.endsWith('.woff2')) return 'woff2';
    if (src.endsWith('.woff')) return 'woff';
    if (src.endsWith('.otf')) return 'opentype';
    return 'truetype';
  }

  // Load fonts programmatically with Promise API
  async loadFont(config: FontConfig): Promise<FontFace> {
    const fontKey = `${config.family}-${config.weight}-${config.style}`;

    if (this.fontPromises.has(fontKey)) {
      return this.fontPromises.get(fontKey)!;
    }

    const fontPromise = this.createFontFace(config);
    this.fontPromises.set(fontKey, fontPromise);

    try {
      const fontFace = await fontPromise;
      document.fonts.add(fontFace);
      this.loadedFonts.add(fontKey);
      return fontFace;
    } catch (error) {
      console.error(`Failed to load font ${fontKey}:`, error);
      throw error;
    }
  }

  private async createFontFace(config: FontConfig): Promise<FontFace> {
    const fontFace = new FontFace(
      config.family,
      `url(${config.src})`,
      {
        weight: config.weight,
        style: config.style,
        display: config.display,
      }
    );

    return fontFace.load();
  }

  // Load critical fonts with high priority
  async loadCriticalFonts(): Promise<FontFace[]> {
    const criticalFonts = FONT_CONFIGS.filter(config => config.critical);
    const promises = criticalFonts.map(config => this.loadFont(config));

    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Failed to load critical fonts:', error);
      return [];
    }
  }

  // Load non-critical fonts with lower priority
  loadNonCriticalFonts(): void {
    const nonCriticalFonts = FONT_CONFIGS.filter(config => !config.critical);

    // Use requestIdleCallback for non-critical fonts
    const loadWhenIdle = () => {
      nonCriticalFonts.forEach(config => {
        this.loadFont(config).catch(error => {
          console.warn(`Non-critical font failed to load: ${config.family}`, error);
        });
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadWhenIdle, { timeout: 2000 });
    } else {
      setTimeout(loadWhenIdle, 1000);
    }
  }

  // Check if all critical fonts are loaded
  areAllCriticalFontsLoaded(): boolean {
    const criticalFontKeys = FONT_CONFIGS
      .filter(config => config.critical)
      .map(config => `${config.family}-${config.weight}-${config.style}`);

    return criticalFontKeys.every(key => this.loadedFonts.has(key));
  }

  // Get optimal font stack with loaded fonts first
  getFontStack(type: 'sans-serif' | 'serif' = 'sans-serif'): string {
    const customFonts = FONT_CONFIGS
      .filter(config => this.loadedFonts.has(`${config.family}-${config.weight}-${config.style}`))
      .map(config => `"${config.family}"`)
      .join(', ');

    const systemFonts = type === 'serif' ? SYSTEM_FONTS.serif : SYSTEM_FONTS.sansSerif;

    return customFonts ? `${customFonts}, ${systemFonts}` : systemFonts;
  }

  // Generate CSS custom properties for dynamic font stacks
  generateFontStackCSS(): string {
    const sansSerifStack = this.getFontStack('sans-serif');
    const serifStack = this.getFontStack('serif');

    return `
      :root {
        --font-sans: ${sansSerifStack};
        --font-serif: ${serifStack};
        --font-heading: "Alliance No.2", ${SYSTEM_FONTS.sansSerif};
        --font-body: "Alliance No.2", ${SYSTEM_FONTS.sansSerif};
        --font-logo: "Marsek Demi", ${SYSTEM_FONTS.sansSerif};
      }

      .fonts-loading {
        --font-heading: ${SYSTEM_FONTS.sansSerif};
        --font-body: ${SYSTEM_FONTS.sansSerif};
        --font-logo: ${SYSTEM_FONTS.sansSerif};
      }

      .fonts-loaded {
        --font-heading: "Alliance No.2", ${SYSTEM_FONTS.sansSerif};
        --font-body: "Alliance No.2", ${SYSTEM_FONTS.sansSerif};
        --font-logo: "Marsek Demi", ${SYSTEM_FONTS.sansSerif};
      }
    `;
  }

  // Measure font loading performance
  measureFontPerformance(): void {
    if ('performance' in window && 'measure' in window.performance) {
      const criticalFonts = FONT_CONFIGS.filter(config => config.critical);

      criticalFonts.forEach(config => {
        const fontKey = `${config.family}-${config.weight}`;
        performance.mark(`font-start-${fontKey}`);

        this.loadFont(config).then(() => {
          performance.mark(`font-end-${fontKey}`);
          performance.measure(`font-load-${fontKey}`, `font-start-${fontKey}`, `font-end-${fontKey}`);
        });
      });
    }
  }
}

// Singleton instance
let fontOptimizer: FontOptimizer | null = null;

export function getFontOptimizer(): FontOptimizer {
  if (!fontOptimizer) {
    fontOptimizer = new FontOptimizer();
  }
  return fontOptimizer;
}

// Utility functions
export function generateFontPreloadHTML(): string {
  const optimizer = getFontOptimizer();
  return optimizer.generatePreloadLinks().join('\n');
}

export function generateFontFaceCSS(): string {
  const optimizer = getFontOptimizer();
  return optimizer.generateFontFaceCSS() + optimizer.generateFontStackCSS();
}

// React hooks
export function useFontLoading() {
  const optimizer = getFontOptimizer();

  const loadCriticalFonts = () => optimizer.loadCriticalFonts();
  const loadNonCriticalFonts = () => optimizer.loadNonCriticalFonts();
  const areCriticalFontsLoaded = () => optimizer.areAllCriticalFontsLoaded();

  return {
    loadCriticalFonts,
    loadNonCriticalFonts,
    areCriticalFontsLoaded,
    getFontStack: (type: 'sans-serif' | 'serif' = 'sans-serif') => optimizer.getFontStack(type),
  };
}

// Performance monitoring hook
export function useFontPerformanceTracking() {
  const optimizer = getFontOptimizer();

  return {
    measurePerformance: () => optimizer.measureFontPerformance(),
    trackFontUsage: (fontFamily: string, context: string) => {
      if (window.gtag) {
        window.gtag('event', 'font_usage', {
          event_category: 'Performance',
          event_label: fontFamily,
          custom_map: { context },
        });
      }
    },
  };
}