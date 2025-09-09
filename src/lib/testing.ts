/**
 * Testing utilities for Métrica FM
 * Provides comprehensive testing helpers for components, hooks, and application logic
 */

import React from 'react';

// Mock data generators for testing
export const mockGenerators = {
  // Generate mock project data
  generateProject: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Proyecto de Prueba',
    description: 'Descripción del proyecto de prueba para testing',
    image_url: 'https://picsum.photos/800/600',
    image_url_fallback: 'https://via.placeholder.com/800x600',
    category: 'construccion',
    status: 'completed',
    client: 'Cliente de Prueba',
    location: 'Lima, Perú',
    year: new Date().getFullYear(),
    duration: '12 meses',
    budget: '$1,000,000',
    team_size: 15,
    technologies: ['Concreto', 'Acero', 'BIM'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  // Generate mock service data
  generateService: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Servicio de Prueba',
    description: 'Descripción del servicio de prueba',
    icon_url: 'https://picsum.photos/64/64',
    image_url: 'https://picsum.photos/400/300',
    category: 'consultoria',
    price_range: '$5,000 - $50,000',
    duration: '3-6 meses',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    benefits: ['Beneficio 1', 'Beneficio 2'],
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  // Generate mock team member data
  generateTeamMember: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Juan Pérez',
    position: 'Ingeniero Senior',
    department: 'Construcción',
    avatar_url: `https://i.pravatar.cc/150?u=${Math.random()}`,
    bio: 'Especialista en construcción con 10 años de experiencia',
    skills: ['AutoCAD', 'BIM', 'Project Management'],
    certifications: ['PMP', 'Lean Construction'],
    email: 'juan.perez@metrica-fm.com',
    phone: '+51 999 999 999',
    linkedin: 'https://linkedin.com/in/juan-perez',
    years_experience: 10,
    projects_count: 25,
    ...overrides,
  }),

  // Generate mock blog post data
  generateBlogPost: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Artículo de Prueba',
    excerpt: 'Resumen del artículo de prueba para testing',
    content: 'Contenido completo del artículo de prueba...',
    featured_image: 'https://picsum.photos/800/400',
    author: 'Editor Métrica FM',
    author_avatar: 'https://i.pravatar.cc/64',
    category: 'Tendencias',
    tags: ['construccion', 'tecnologia', 'innovacion'],
    reading_time: '5 min',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'articulo-de-prueba',
    meta_description: 'Meta descripción del artículo de prueba',
    views: 150,
    likes: 25,
    ...overrides,
  }),

  // Generate mock form data
  generateFormData: (type = 'contact', overrides = {}) => {
    const baseData = {
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      status: 'pending',
      ...overrides,
    };

    switch (type) {
      case 'contact':
        return {
          ...baseData,
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+51 999 999 999',
          company: 'Empresa Ejemplo',
          message: 'Mensaje de prueba para contacto',
          subject: 'Consulta sobre servicios',
        };
      
      case 'quote':
        return {
          ...baseData,
          name: 'María García',
          email: 'maria@example.com',
          phone: '+51 888 888 888',
          company: 'Constructora ABC',
          service: 'Dirección de Proyectos',
          project_type: 'Edificio Residencial',
          budget_range: '$100,000 - $500,000',
          timeline: '6-12 meses',
          description: 'Descripción del proyecto para cotización',
        };

      default:
        return baseData;
    }
  },

  // Generate mock API response
  generateAPIResponse: (data: any, success = true, overrides = {}) => ({
    success,
    message: success ? 'Operación exitosa' : 'Error en la operación',
    data: success ? data : null,
    error: success ? null : 'Error de prueba',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  // Generate array of mock data
  generateArray: <T>(generator: (index: number) => T, count = 5): T[] => {
    return Array.from({ length: count }, (_, index) => generator(index));
  },
};

// Component testing helpers
export const componentHelpers = {
  // Create mock props for common components
  createMockProps: (componentName: string, overrides = {}) => {
    const propSets: Record<string, any> = {
      HeroTransform: {
        data: {
          title: { main: 'Título', secondary: 'Subtítulo' },
          subtitle: 'Subtítulo del hero',
          background: {
            video_url: 'https://example.com/video.mp4',
            video_url_fallback: 'https://example.com/fallback.mp4',
            image_fallback: 'https://example.com/image.jpg',
            overlay_opacity: 0.6,
          },
          rotating_words: ['Palabra 1', 'Palabra 2'],
          transition_text: 'Texto de transición',
          cta: { text: 'Botón CTA', target: '#services' },
        },
      },
      
      Portfolio: {
        data: {
          section: {
            title: 'Nuestros Proyectos',
            subtitle: 'Subtítulo del portfolio',
          },
          featured_projects: mockGenerators.generateArray(
            (i) => mockGenerators.generateProject({ id: `project-${i}` }), 
            6
          ),
        },
      },

      Services: {
        data: {
          section: {
            title: 'Nuestros Servicios',
            subtitle: 'Subtítulo de servicios',
          },
          services: mockGenerators.generateArray(
            (i) => mockGenerators.generateService({ id: `service-${i}` }),
            4
          ),
        },
      },

      ErrorBoundary: {
        children: React.createElement('div', {}, 'Contenido de prueba'),
        level: 'component' as const,
        showDetails: false,
      },
    };

    return {
      ...propSets[componentName],
      ...overrides,
    };
  },

  // Create mock event objects
  createMockEvent: (type = 'click', overrides = {}) => {
    const events = {
      click: {
        type: 'click',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { tagName: 'BUTTON' },
        currentTarget: { tagName: 'BUTTON' },
        ...overrides,
      },
      
      submit: {
        type: 'submit',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { tagName: 'FORM' },
        currentTarget: { tagName: 'FORM' },
        ...overrides,
      },

      keydown: {
        type: 'keydown',
        key: 'Enter',
        code: 'Enter',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { tagName: 'INPUT' },
        ...overrides,
      },
    };

    return events[type as keyof typeof events] || events.click;
  },

  // Wait for async operations in tests
  waitFor: async (condition: () => boolean, timeout = 5000, interval = 100) => {
    const start = Date.now();
    
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },
};

// API testing helpers
export const apiHelpers = {
  // Mock fetch responses
  mockFetch: (response: any, status = 200, headers = {}) => {
    const mockResponse = {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers(headers),
      json: async () => response,
      text: async () => JSON.stringify(response),
      blob: async () => new Blob([JSON.stringify(response)]),
      clone: function() { return this; },
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse as any);
    
    return mockResponse;
  },

  // Create mock API endpoints
  createMockEndpoints: () => {
    const endpoints = {
      '/api/projects': mockGenerators.generateAPIResponse(
        mockGenerators.generateArray(() => mockGenerators.generateProject(), 10)
      ),
      
      '/api/services': mockGenerators.generateAPIResponse(
        mockGenerators.generateArray(() => mockGenerators.generateService(), 6)
      ),
      
      '/api/team': mockGenerators.generateAPIResponse(
        mockGenerators.generateArray(() => mockGenerators.generateTeamMember(), 8)
      ),
      
      '/api/blog': mockGenerators.generateAPIResponse(
        mockGenerators.generateArray(() => mockGenerators.generateBlogPost(), 12)
      ),
      
      '/api/contact': mockGenerators.generateAPIResponse(
        { message: 'Mensaje enviado exitosamente' }
      ),
    };

    // Mock fetch to return appropriate responses
    global.fetch = jest.fn().mockImplementation((url: string) => {
      const endpoint = Object.keys(endpoints).find(path => url.includes(path));
      const response = endpoint ? endpoints[endpoint as keyof typeof endpoints] : 
        mockGenerators.generateAPIResponse(null, false, { error: 'Endpoint not found' });
      
      return Promise.resolve({
        ok: response.success,
        status: response.success ? 200 : 404,
        json: async () => response,
      } as Response);
    });

    return endpoints;
  },

  // Simulate network delays
  delay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    
    global.localStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      length: 0,
      key: jest.fn(),
    } as any;
    
    return store;
  },
};

// Performance testing utilities
export const performanceHelpers = {
  // Measure component render time
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    // Wait for next tick to ensure render is complete
    await new Promise(resolve => setTimeout(resolve, 0));
    return performance.now() - start;
  },

  // Measure memory usage
  measureMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },

  // Test component performance under load
  stressTest: async (component: () => void, iterations = 100): Promise<{
    averageRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    totalTime: number;
  }> => {
    const renderTimes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const renderTime = await performanceHelpers.measureRenderTime(component);
      renderTimes.push(renderTime);
    }
    
    return {
      averageRenderTime: renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
      maxRenderTime: Math.max(...renderTimes),
      minRenderTime: Math.min(...renderTimes),
      totalTime: renderTimes.reduce((sum, time) => sum + time, 0),
    };
  },
};

// Accessibility testing helpers
export const a11yHelpers = {
  // Check if element has proper ARIA attributes
  checkARIAAttributes: (element: HTMLElement): boolean => {
    const requiredAttributes = ['aria-label', 'aria-labelledby', 'aria-describedby'];
    return requiredAttributes.some(attr => element.hasAttribute(attr));
  },

  // Check keyboard navigation
  simulateKeyPress: (element: HTMLElement, key: string): void => {
    const event = new KeyboardEvent('keydown', { key });
    element.dispatchEvent(event);
  },

  // Check focus management
  checkFocusOrder: (container: HTMLElement): HTMLElement[] => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusableElements) as HTMLElement[];
  },

  // Test screen reader announcements
  mockScreenReader: () => {
    const announcements: string[] = [];
    
    // Mock aria-live regions
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name: string, value: string) {
      if (name === 'aria-live' && this.textContent) {
        announcements.push(this.textContent);
      }
      return originalSetAttribute.call(this, name, value);
    };
    
    return {
      getAnnouncements: () => announcements,
      clearAnnouncements: () => announcements.splice(0, announcements.length),
    };
  },
};

// Visual regression testing helpers
export const visualHelpers = {
  // Create consistent viewport for screenshots
  setViewport: (width = 1280, height = 720) => {
    Object.defineProperty(window, 'innerWidth', { value: width });
    Object.defineProperty(window, 'innerHeight', { value: height });
    window.dispatchEvent(new Event('resize'));
  },

  // Test responsive breakpoints
  testBreakpoints: (component: () => void, breakpoints = [320, 768, 1024, 1280]) => {
    return breakpoints.map(width => {
      visualHelpers.setViewport(width);
      return { width, component: component() };
    });
  },
};

// Environment setup for tests
export const setupHelpers = {
  // Setup DOM environment
  setupDOM: () => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock matchMedia
    global.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  },

  // Clean up after tests
  cleanup: () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  },

  // Setup complete test environment
  setupTestEnvironment: () => {
    setupHelpers.setupDOM();
    apiHelpers.mockLocalStorage();
    return {
      cleanup: setupHelpers.cleanup,
    };
  },
};

export default {
  mockGenerators,
  componentHelpers,
  apiHelpers,
  performanceHelpers,
  a11yHelpers,
  visualHelpers,
  setupHelpers,
};