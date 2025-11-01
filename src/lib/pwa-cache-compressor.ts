'use client';

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
}

interface CacheEntry {
  data: any;
  compressed: boolean;
  algorithm?: string;
  originalSize: number;
  compressedSize?: number;
  timestamp: number;
  expires: number;
}

class PWACacheCompressor {
  private static readonly DEBUG = process.env.NODE_ENV === 'development';

  // Compress JSON data using multiple algorithms
  static async compressData(data: any): Promise<{
    compressed: string;
    metadata: CompressionResult;
  }> {
    const originalJson = JSON.stringify(data);
    const originalSize = new TextEncoder().encode(originalJson).length;

    if (this.DEBUG) {
      console.log(`[CacheCompressor] Original size: ${originalSize} bytes`);
    }

    // Try different compression methods
    const results = await Promise.allSettled([
      this.compressWithLZ4(originalJson),
      this.compressWithDeflate(originalJson),
      this.compressWithBrotli(originalJson)
    ]);

    // Find the best compression result
    let bestResult = {
      compressed: originalJson,
      algorithm: 'none',
      compressedSize: originalSize
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const algorithms = ['lz4', 'deflate', 'brotli'];
        if (result.value.length < bestResult.compressedSize) {
          bestResult = {
            compressed: result.value,
            algorithm: algorithms[index],
            compressedSize: result.value.length
          };
        }
      }
    });

    const compressionRatio = originalSize > 0 ? 
      ((originalSize - bestResult.compressedSize) / originalSize) * 100 : 0;

    if (this.DEBUG) {
      console.log(`[CacheCompressor] Best compression: ${bestResult.algorithm} 
        (${bestResult.compressedSize} bytes, ${compressionRatio.toFixed(1)}% saved)`);
    }

    return {
      compressed: bestResult.compressed,
      metadata: {
        originalSize,
        compressedSize: bestResult.compressedSize,
        compressionRatio,
        algorithm: bestResult.algorithm
      }
    };
  }

  // Decompress data based on algorithm
  static async decompressData(compressed: string, algorithm: string): Promise<any> {
    let decompressed: string;

    try {
      switch (algorithm) {
        case 'lz4':
          decompressed = await this.decompressLZ4(compressed);
          break;
        case 'deflate':
          decompressed = await this.decompressDeflate(compressed);
          break;
        case 'brotli':
          decompressed = await this.decompressBrotli(compressed);
          break;
        case 'none':
        default:
          decompressed = compressed;
      }

      return JSON.parse(decompressed);
    } catch (error) {
      console.error(`[CacheCompressor] Decompression failed for ${algorithm}:`, error);
      // Fallback to original data
      return JSON.parse(compressed);
    }
  }

  // LZ4-like compression (simplified implementation)
  private static async compressWithLZ4(data: string): Promise<string> {
    // Simple run-length encoding + dictionary compression
    const compressed = this.simpleCompress(data);
    return btoa(compressed); // Base64 encode for storage
  }

  private static async decompressLZ4(compressed: string): Promise<string> {
    const decoded = atob(compressed);
    return this.simpleDecompress(decoded);
  }

  // Deflate compression using native APIs
  private static async compressWithDeflate(data: string): Promise<string> {
    if ('CompressionStream' in window) {
      try {
        const stream = new CompressionStream('deflate');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(new TextEncoder().encode(data));
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }

        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        chunks.forEach(chunk => {
          compressed.set(chunk, offset);
          offset += chunk.length;
        });

        return btoa(String.fromCharCode(...compressed));
      } catch (error) {
        if (this.DEBUG) {
          console.warn('[CacheCompressor] Native deflate failed, using fallback');
        }
        return this.compressWithLZ4(data);
      }
    }
    
    return this.compressWithLZ4(data); // Fallback
  }

  private static async decompressDeflate(compressed: string): Promise<string> {
    if ('DecompressionStream' in window) {
      try {
        const compressedData = Uint8Array.from(atob(compressed), c => c.charCodeAt(0));
        const stream = new DecompressionStream('deflate');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(compressedData);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }

        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        chunks.forEach(chunk => {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        });

        return new TextDecoder().decode(decompressed);
      } catch (error) {
        if (this.DEBUG) {
          console.warn('[CacheCompressor] Native deflate decompression failed');
        }
        return this.decompressLZ4(compressed);
      }
    }
    
    return this.decompressLZ4(compressed); // Fallback
  }

  // Brotli compression (if supported)
  private static async compressWithBrotli(data: string): Promise<string> {
    // Brotli not widely supported yet, use deflate as fallback
    return this.compressWithDeflate(data);
  }

  private static async decompressBrotli(compressed: string): Promise<string> {
    return this.decompressDeflate(compressed);
  }

  // Simple compression algorithm (fallback)
  private static simpleCompress(data: string): string {
    // Dictionary-based compression for JSON
    const dictionary = this.buildDictionary(data);
    let compressed = data;
    
    dictionary.forEach((replacement, original) => {
      compressed = compressed.split(original).join(replacement);
    });

    return `${JSON.stringify(Object.fromEntries(dictionary))}|${compressed}`;
  }

  private static simpleDecompress(compressed: string): string {
    const [dictStr, data] = compressed.split('|');
    const dictionary = new Map(Object.entries(JSON.parse(dictStr)));
    
    let decompressed = data;
    dictionary.forEach((original, replacement) => {
      decompressed = decompressed.split(replacement).join(original);
    });

    return decompressed;
  }

  // Build a dictionary of common patterns in JSON
  private static buildDictionary(data: string): Map<string, string> {
    const dictionary = new Map<string, string>();
    const commonPatterns = [
      '","', '":', '{"', '"}', '[{', '}]', ',"', 
      '"title":', '"description":', '"id":', '"name":',
      'true', 'false', 'null'
    ];

    let replacementId = 1;
    commonPatterns.forEach(pattern => {
      if (data.includes(pattern) && data.split(pattern).length > 3) {
        const replacement = `~${replacementId}~`;
        dictionary.set(pattern, replacement);
        replacementId++;
      }
    });

    return dictionary;
  }

  // Minify JSON by removing unnecessary whitespace and optimizing structure
  static minifyJSON(data: any): any {
    if (typeof data === 'string') {
      // Remove extra whitespace, normalize quotes
      return data.trim().replace(/\s+/g, ' ');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.minifyJSON(item));
    }
    
    if (data && typeof data === 'object') {
      const minified: any = {};
      
      Object.keys(data).forEach(key => {
        const value = data[key];
        
        // Skip null or undefined values
        if (value == null) return;
        
        // Skip empty arrays or objects
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'object' && Object.keys(value).length === 0) return;
        
        // Recursively minify
        minified[key] = this.minifyJSON(value);
      });
      
      return minified;
    }
    
    return data;
  }

  // Create optimized cache entry
  static async createCacheEntry(data: any, maxAge: number): Promise<CacheEntry> {
    const minified = this.minifyJSON(data);
    const originalSize = new TextEncoder().encode(JSON.stringify(data)).length;
    
    // Only compress if data is large enough to benefit
    if (originalSize > 1024) { // 1KB threshold
      try {
        const { compressed, metadata } = await this.compressData(minified);
        
        return {
          data: compressed,
          compressed: true,
          algorithm: metadata.algorithm,
          originalSize: metadata.originalSize,
          compressedSize: metadata.compressedSize,
          timestamp: Date.now(),
          expires: Date.now() + maxAge
        };
      } catch (error) {
        console.warn('[CacheCompressor] Compression failed, storing uncompressed:', error);
      }
    }

    return {
      data: minified,
      compressed: false,
      originalSize,
      timestamp: Date.now(),
      expires: Date.now() + maxAge
    };
  }

  // Extract data from cache entry
  static async extractFromCacheEntry(entry: CacheEntry): Promise<any> {
    if (!entry.compressed) {
      return entry.data;
    }

    if (entry.algorithm) {
      return this.decompressData(entry.data, entry.algorithm);
    }

    return entry.data;
  }

  // Get compression statistics
  static getCompressionStats(entries: CacheEntry[]): {
    totalEntries: number;
    compressedEntries: number;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithms: Record<string, number>;
  } {
    const stats = {
      totalEntries: entries.length,
      compressedEntries: 0,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      algorithms: {} as Record<string, number>
    };

    entries.forEach(entry => {
      stats.originalSize += entry.originalSize;
      
      if (entry.compressed && entry.compressedSize) {
        stats.compressedEntries++;
        stats.compressedSize += entry.compressedSize;
        
        const algo = entry.algorithm || 'unknown';
        stats.algorithms[algo] = (stats.algorithms[algo] || 0) + 1;
      } else {
        stats.compressedSize += entry.originalSize;
      }
    });

    stats.compressionRatio = stats.originalSize > 0 ?
      ((stats.originalSize - stats.compressedSize) / stats.originalSize) * 100 : 0;

    return stats;
  }
}

export { PWACacheCompressor };
export type { CacheEntry, CompressionResult };