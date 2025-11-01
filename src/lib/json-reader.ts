// Only import fs on server-side
const isServer = typeof window === 'undefined';
let fs: any, path: any;

if (isServer) {
  fs = require('fs');
  path = require('path');
}
import { z } from 'zod';
import { validatePageData, getDefaultPageData } from './schemas/page-schemas';

interface JsonReadOptions {
  enableFallback?: boolean;
  enableValidation?: boolean;
  cacheTime?: number; // in minutes
}

interface JsonReadResult<T> {
  data: T;
  source: 'cache' | 'file' | 'fallback';
  validationErrors?: string[];
  loadTime: number;
}

// Simple in-memory cache
const jsonCache = new Map<string, { data: any; timestamp: number; }>();

/**
 * Legacy function for backwards compatibility
 * Works both in development and production environments
 */
export function readPublicJSON<T = any>(filePath: string): T {
  if (!isServer || !fs || !path) {
    throw new Error('readPublicJSON can only be used on the server side');
  }
  
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw new Error(`Failed to load JSON file: ${filePath}`);
  }
}

/**
 * Legacy async version for consistency with existing fetch calls
 */
export async function readPublicJSONAsync<T = any>(filePath: string): Promise<T> {
  return readPublicJSON<T>(filePath);
}

/**
 * Enhanced JSON reader with validation, fallbacks, and caching
 */
export async function getPageData<T>(
  pageName: string,
  schema: z.ZodSchema<T>,
  options: JsonReadOptions = {}
): Promise<JsonReadResult<T>> {
  const startTime = Date.now();
  const {
    enableFallback = true,
    enableValidation = true,
    cacheTime = 5 // 5 minutes default cache
  } = options;

  const cacheKey = `page_${pageName}`;
  const now = Date.now();

  // Check cache first
  if (jsonCache.has(cacheKey)) {
    const cached = jsonCache.get(cacheKey)!;
    const isExpired = (now - cached.timestamp) > (cacheTime * 60 * 1000);
    
    if (!isExpired) {
      return {
        data: cached.data,
        source: 'cache',
        loadTime: Date.now() - startTime
      };
    }
  }

  try {
    // Try to load from file (client-side fetch)
    if (typeof window !== 'undefined') {
      const response = await fetch(`/json/pages/${pageName}.json`, {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${pageName}.json: ${response.status}`);
      }

      const rawData = await response.json();
      return processJsonData(rawData, schema, cacheKey, now, enableValidation, enableFallback, pageName, startTime);
    } else {
      // Server-side file read
      try {
        const rawData = readPublicJSON(`json/pages/${pageName}.json`);
        return processJsonData(rawData, schema, cacheKey, now, enableValidation, enableFallback, pageName, startTime);
      } catch (error) {
        console.warn(`Server-side read failed, using fallback:`, error);
        throw error; // Let the outer catch handle it with fallback
      }
    }

  } catch (error) {
    console.warn(`Failed to load ${pageName}.json:`, error);
    
    if (enableFallback) {
      const fallbackData = getDefaultPageData(pageName, schema);
      
      // Cache fallback data
      jsonCache.set(cacheKey, { 
        data: fallbackData, 
        timestamp: now 
      });
      
      return {
        data: fallbackData,
        source: 'fallback',
        validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
        loadTime: Date.now() - startTime
      };
    } else {
      throw error;
    }
  }
}

/**
 * Process JSON data with validation and caching
 */
function processJsonData<T>(
  rawData: any,
  schema: z.ZodSchema<T>,
  cacheKey: string,
  timestamp: number,
  enableValidation: boolean,
  enableFallback: boolean,
  pageName: string,
  startTime: number
): JsonReadResult<T> {
  // Validate if enabled
  if (enableValidation) {
    const validation = validatePageData(rawData, schema);
    
    if (!validation.success) {
      console.warn(`Validation failed for ${pageName}:`, validation.error);
      
      if (enableFallback) {
        const fallbackData = getDefaultPageData(pageName, schema);
        
        // Cache fallback data
        jsonCache.set(cacheKey, { 
          data: fallbackData, 
          timestamp 
        });
        
        return {
          data: fallbackData,
          source: 'fallback',
          validationErrors: [validation.error],
          loadTime: Date.now() - startTime
        };
      } else {
        throw new Error(validation.error);
      }
    }

    // Cache validated data
    jsonCache.set(cacheKey, { 
      data: validation.data, 
      timestamp 
    });
    
    return {
      data: validation.data,
      source: 'file',
      loadTime: Date.now() - startTime
    };
  } else {
    // No validation, just cache and return
    jsonCache.set(cacheKey, { 
      data: rawData, 
      timestamp 
    });
    
    return {
      data: rawData,
      source: 'file',
      loadTime: Date.now() - startTime
    };
  }
}

/**
 * Get dynamic content with validation
 */
export async function getDynamicContent<T>(
  contentType: string,
  schema: z.ZodSchema<T>,
  options: JsonReadOptions = {}
): Promise<JsonReadResult<T>> {
  const startTime = Date.now();
  const {
    enableFallback = true,
    enableValidation = true,
    cacheTime = 5
  } = options;

  const cacheKey = `dynamic_${contentType}`;
  const now = Date.now();

  // Check cache first
  if (jsonCache.has(cacheKey)) {
    const cached = jsonCache.get(cacheKey)!;
    const isExpired = (now - cached.timestamp) > (cacheTime * 60 * 1000);
    
    if (!isExpired) {
      return {
        data: cached.data,
        source: 'cache',
        loadTime: Date.now() - startTime
      };
    }
  }

  try {
    let rawData: any;
    
    if (typeof window !== 'undefined') {
      const response = await fetch(`/json/dynamic-content/${contentType}.json`, {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dynamic content ${contentType}: ${response.status}`);
      }

      rawData = await response.json();
    } else {
      try {
        rawData = readPublicJSON(`json/dynamic-content/${contentType}.json`);
      } catch (error) {
        console.warn(`Server-side read failed for dynamic content:`, error);
        throw error; // Let the outer catch handle it with fallback
      }
    }

    if (enableValidation) {
      const validation = validatePageData(rawData, schema);
      
      if (!validation.success) {
        console.warn(`Validation failed for ${contentType}:`, validation.error);
        
        if (enableFallback) {
          // For dynamic content, return empty structure
          const fallbackData = schema.parse({});
          
          jsonCache.set(cacheKey, { 
            data: fallbackData, 
            timestamp: now 
          });
          
          return {
            data: fallbackData,
            source: 'fallback',
            validationErrors: [validation.error],
            loadTime: Date.now() - startTime
          };
        } else {
          throw new Error(validation.error);
        }
      }

      jsonCache.set(cacheKey, { 
        data: validation.data, 
        timestamp: now 
      });
      
      return {
        data: validation.data,
        source: 'file',
        loadTime: Date.now() - startTime
      };
    } else {
      jsonCache.set(cacheKey, { 
        data: rawData, 
        timestamp: now 
      });
      
      return {
        data: rawData,
        source: 'file',
        loadTime: Date.now() - startTime
      };
    }

  } catch (error) {
    console.warn(`Failed to load dynamic content ${contentType}:`, error);
    
    if (enableFallback) {
      const fallbackData = schema.parse({});
      
      jsonCache.set(cacheKey, { 
        data: fallbackData, 
        timestamp: now 
      });
      
      return {
        data: fallbackData,
        source: 'fallback',
        validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
        loadTime: Date.now() - startTime
      };
    } else {
      throw error;
    }
  }
}

/**
 * Clear cache for specific page or all pages
 */
export function clearJsonCache(pageName?: string): void {
  if (pageName) {
    jsonCache.delete(`page_${pageName}`);
  } else {
    jsonCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { 
  totalEntries: number; 
  entries: Array<{ key: string; age: number; size: number }> 
} {
  const now = Date.now();
  const entries: Array<{ key: string; age: number; size: number }> = [];
  
  jsonCache.forEach((value, key) => {
    entries.push({
      key,
      age: Math.floor((now - value.timestamp) / 1000), // age in seconds
      size: JSON.stringify(value.data).length
    });
  });

  return {
    totalEntries: jsonCache.size,
    entries: entries.sort((a, b) => b.age - a.age)
  };
}

/**
 * Preload critical pages
 */
export async function preloadCriticalPages(): Promise<void> {
  const criticalPages = ['home', 'blog', 'careers', 'portfolio'];
  const { HomePageSchema, BlogPageSchema, BasePageSchema } = await import('./schemas/page-schemas');
  
  const preloadPromises = criticalPages.map(async (pageName) => {
    try {
      let schema;
      switch (pageName) {
        case 'home':
          schema = HomePageSchema;
          break;
        case 'blog':
          schema = BlogPageSchema;
          break;
        default:
          schema = BasePageSchema;
      }
      
      await getPageData(pageName, schema, { enableFallback: true, cacheTime: 30 });
    } catch (error) {
      console.warn(`Failed to preload ${pageName}:`, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
}