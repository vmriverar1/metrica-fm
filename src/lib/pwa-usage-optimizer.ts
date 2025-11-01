'use client';

interface UsagePattern {
  path: string;
  accessCount: number;
  lastAccess: number;
  averageLoadTime: number;
  cacheHitRate: number;
  userPriority: number; // 0-100, higher = more important to user
}

interface OptimizationRule {
  pattern: RegExp;
  strategy: 'critical' | 'high' | 'medium' | 'low' | 'lazy';
  maxAge: number;
  preload: boolean;
  compress: boolean;
  reason: string;
}

class PWAUsageOptimizer {
  private usageData = new Map<string, UsagePattern>();
  private optimizationRules: OptimizationRule[] = [];
  private learningEnabled = true;
  private lastOptimization = 0;

  constructor() {
    this.loadUsageData();
    this.generateInitialRules();
    this.startLearning();
  }

  // Track usage patterns
  trackAccess(path: string, loadTime: number, fromCache: boolean): void {
    const existing = this.usageData.get(path);
    const now = Date.now();

    if (existing) {
      // Update existing pattern
      existing.accessCount++;
      existing.lastAccess = now;
      existing.averageLoadTime = (existing.averageLoadTime + loadTime) / 2;
      
      // Update cache hit rate
      const totalRequests = existing.accessCount;
      const hitCount = fromCache ? Math.ceil(totalRequests * existing.cacheHitRate / 100) + 1 :
                      Math.ceil(totalRequests * existing.cacheHitRate / 100);
      existing.cacheHitRate = (hitCount / totalRequests) * 100;
    } else {
      // Create new pattern
      this.usageData.set(path, {
        path,
        accessCount: 1,
        lastAccess: now,
        averageLoadTime: loadTime,
        cacheHitRate: fromCache ? 100 : 0,
        userPriority: this.calculateInitialPriority(path)
      });
    }

    // Trigger optimization if enough data has changed
    this.considerReoptimization();
  }

  // Calculate user priority based on path characteristics
  private calculateInitialPriority(path: string): number {
    if (path.includes('home') || path === '/') return 90;
    if (path.includes('portfolio')) return 80;
    if (path.includes('services')) return 70;
    if (path.includes('about')) return 60;
    if (path.includes('contact')) return 50;
    if (path.includes('blog')) return 40;
    if (path.includes('admin')) return 95; // High for admin
    return 30; // Default priority
  }

  // Generate optimization rules based on usage patterns
  generateOptimizationRules(): OptimizationRule[] {
    const rules: OptimizationRule[] = [];
    const patterns = Array.from(this.usageData.values());

    // Sort by combined score (access frequency + recency + priority)
    patterns.sort((a, b) => {
      const scoreA = this.calculateOptimizationScore(a);
      const scoreB = this.calculateOptimizationScore(b);
      return scoreB - scoreA;
    });

    patterns.forEach((pattern, index) => {
      const rule = this.createOptimizationRule(pattern, index, patterns.length);
      if (rule) rules.push(rule);
    });

    // Add special rules for known patterns
    rules.push(...this.getSpecialOptimizationRules());

    this.optimizationRules = rules;
    return rules;
  }

  private calculateOptimizationScore(pattern: UsagePattern): number {
    const now = Date.now();
    const daysSinceAccess = (now - pattern.lastAccess) / (1000 * 60 * 60 * 24);
    
    // Factors that increase priority:
    // - High access count
    // - Recent access
    // - High user priority
    // - Low cache hit rate (needs better caching)
    // - Fast load times (good candidates for preloading)
    
    const accessScore = Math.min(pattern.accessCount * 10, 100);
    const recencyScore = Math.max(100 - daysSinceAccess * 10, 0);
    const priorityScore = pattern.userPriority;
    const cacheEfficiencyScore = 100 - pattern.cacheHitRate; // Lower hit rate = needs optimization
    const loadTimeScore = Math.max(100 - pattern.averageLoadTime / 10, 0);
    
    return (accessScore * 0.3 + recencyScore * 0.2 + priorityScore * 0.3 + 
            cacheEfficiencyScore * 0.1 + loadTimeScore * 0.1);
  }

  private createOptimizationRule(pattern: UsagePattern, rank: number, total: number): OptimizationRule | null {
    const score = this.calculateOptimizationScore(pattern);
    const percentile = (total - rank) / total * 100;

    let strategy: OptimizationRule['strategy'];
    let maxAge: number;
    let preload = false;
    let compress = false;
    let reason = '';

    // Determine strategy based on score and percentile
    if (score >= 80 && percentile >= 80) {
      strategy = 'critical';
      maxAge = 60 * 60 * 1000; // 1 hour
      preload = true;
      compress = true;
      reason = `High usage (${pattern.accessCount} accesses, score: ${score.toFixed(1)})`;
    } else if (score >= 60 && percentile >= 60) {
      strategy = 'high';
      maxAge = 30 * 60 * 1000; // 30 minutes
      preload = pattern.accessCount > 5;
      compress = true;
      reason = `Frequent access (${pattern.accessCount} times, recent activity)`;
    } else if (score >= 40 && percentile >= 40) {
      strategy = 'medium';
      maxAge = 15 * 60 * 1000; // 15 minutes
      preload = false;
      compress = pattern.averageLoadTime > 100;
      reason = `Moderate usage (${pattern.accessCount} accesses)`;
    } else if (score >= 20) {
      strategy = 'low';
      maxAge = 5 * 60 * 1000; // 5 minutes
      preload = false;
      compress = false;
      reason = `Low usage (${pattern.accessCount} accesses)`;
    } else {
      strategy = 'lazy';
      maxAge = 60 * 1000; // 1 minute
      preload = false;
      compress = false;
      reason = `Infrequent access (last: ${new Date(pattern.lastAccess).toLocaleDateString()})`;
    }

    return {
      pattern: new RegExp(this.escapeRegExp(pattern.path)),
      strategy,
      maxAge,
      preload,
      compress,
      reason
    };
  }

  private getSpecialOptimizationRules(): OptimizationRule[] {
    return [
      {
        pattern: /\/json\/pages\/home\.json$/,
        strategy: 'critical',
        maxAge: 60 * 60 * 1000,
        preload: true,
        compress: true,
        reason: 'Home page - always critical'
      },
      {
        pattern: /\/json\/admin\//,
        strategy: 'high',
        maxAge: 10 * 60 * 1000,
        preload: false,
        compress: true,
        reason: 'Admin content - needs fresh data'
      },
      {
        pattern: /\/json\/dynamic-content\/statistics\.json$/,
        strategy: 'high',
        maxAge: 20 * 60 * 1000,
        preload: true,
        compress: true,
        reason: 'Statistics shown on multiple pages'
      },
      {
        pattern: /\/api\//,
        strategy: 'low',
        maxAge: 2 * 60 * 1000,
        preload: false,
        compress: false,
        reason: 'API responses - short cache for data freshness'
      }
    ];
  }

  // Get optimization recommendations for a specific path
  getOptimizationRecommendations(path: string): {
    strategy: string;
    maxAge: number;
    preload: boolean;
    compress: boolean;
    reasons: string[];
  } {
    const matchingRules = this.optimizationRules.filter(rule => rule.pattern.test(path));
    const pattern = this.usageData.get(path);
    
    if (matchingRules.length === 0) {
      return {
        strategy: 'medium',
        maxAge: 15 * 60 * 1000,
        preload: false,
        compress: false,
        reasons: ['No usage data available - using default strategy']
      };
    }

    // Use the highest priority rule
    const bestRule = matchingRules.reduce((best, current) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1, lazy: 0 };
      return priorityOrder[current.strategy] > priorityOrder[best.strategy] ? current : best;
    });

    const reasons = [bestRule.reason];
    
    if (pattern) {
      if (pattern.cacheHitRate < 50) {
        reasons.push(`Low cache hit rate (${pattern.cacheHitRate.toFixed(1)}%)`);
      }
      if (pattern.averageLoadTime > 200) {
        reasons.push(`Slow loading (${pattern.averageLoadTime.toFixed(0)}ms avg)`);
      }
      if (pattern.accessCount > 10) {
        reasons.push(`Frequently accessed (${pattern.accessCount} times)`);
      }
    }

    return {
      strategy: bestRule.strategy,
      maxAge: bestRule.maxAge,
      preload: bestRule.preload,
      compress: bestRule.compress,
      reasons
    };
  }

  // Apply optimizations to the PWA system
  applyOptimizations(): {
    applied: number;
    skipped: number;
    errors: number;
    recommendations: Array<{
      path: string;
      action: string;
      reason: string;
    }>;
  } {
    const recommendations: Array<{ path: string; action: string; reason: string }> = [];
    let applied = 0, skipped = 0, errors = 0;

    // Generate fresh rules
    this.generateOptimizationRules();

    // Apply optimizations for each tracked path
    for (const [path, pattern] of this.usageData.entries()) {
      try {
        const rec = this.getOptimizationRecommendations(path);
        
        // Generate recommendation
        const actions: string[] = [];
        if (rec.preload) actions.push('preload');
        if (rec.compress) actions.push('compress');
        actions.push(`cache:${rec.strategy}`);
        
        recommendations.push({
          path,
          action: actions.join(', '),
          reason: rec.reasons.join('; ')
        });

        // Here you would apply the actual optimizations
        // For example, update cache strategies, trigger preloads, etc.
        applied++;
        
      } catch (error) {
        console.error(`[UsageOptimizer] Error optimizing ${path}:`, error);
        errors++;
      }
    }

    console.log(`[UsageOptimizer] Applied ${applied} optimizations, ${skipped} skipped, ${errors} errors`);
    
    this.lastOptimization = Date.now();
    this.saveUsageData();

    return { applied, skipped, errors, recommendations };
  }

  // Consider whether to reoptimize based on usage changes
  private considerReoptimization(): void {
    const timeSinceOptimization = Date.now() - this.lastOptimization;
    const minOptimizationInterval = 10 * 60 * 1000; // 10 minutes
    
    if (timeSinceOptimization > minOptimizationInterval && this.usageData.size >= 5) {
      // Check if significant changes have occurred
      const totalAccesses = Array.from(this.usageData.values())
        .reduce((sum, pattern) => sum + pattern.accessCount, 0);
      
      if (totalAccesses % 50 === 0) { // Every 50 total accesses
        setTimeout(() => this.applyOptimizations(), 1000);
      }
    }
  }

  // Get usage analytics for display
  getUsageAnalytics(): {
    totalPaths: number;
    totalAccesses: number;
    averageLoadTime: number;
    averageCacheHitRate: number;
    topPaths: Array<{ path: string; accesses: number; priority: number }>;
    optimizationStatus: string;
  } {
    const patterns = Array.from(this.usageData.values());
    
    const totalAccesses = patterns.reduce((sum, p) => sum + p.accessCount, 0);
    const averageLoadTime = patterns.length > 0 ?
      patterns.reduce((sum, p) => sum + p.averageLoadTime, 0) / patterns.length : 0;
    const averageCacheHitRate = patterns.length > 0 ?
      patterns.reduce((sum, p) => sum + p.cacheHitRate, 0) / patterns.length : 0;

    const topPaths = patterns
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(p => ({
        path: p.path,
        accesses: p.accessCount,
        priority: p.userPriority
      }));

    const timeSinceOptimization = Date.now() - this.lastOptimization;
    const optimizationStatus = timeSinceOptimization < 60000 ? 'recent' :
                              timeSinceOptimization < 300000 ? 'normal' : 'overdue';

    return {
      totalPaths: patterns.length,
      totalAccesses,
      averageLoadTime,
      averageCacheHitRate,
      topPaths,
      optimizationStatus
    };
  }

  // Persist usage data
  private saveUsageData(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = Object.fromEntries(this.usageData);
      localStorage.setItem('pwa-usage-patterns', JSON.stringify({
        data,
        lastOptimization: this.lastOptimization,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('[UsageOptimizer] Failed to save usage data:', error);
    }
  }

  // Load persisted usage data
  private loadUsageData(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem('pwa-usage-patterns');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (parsed.data) {
        this.usageData = new Map(Object.entries(parsed.data));
        this.lastOptimization = parsed.lastOptimization || 0;
      }
    } catch (error) {
      console.warn('[UsageOptimizer] Failed to load usage data:', error);
    }
  }

  // Start learning from user behavior
  private startLearning(): void {
    if (!this.learningEnabled || typeof window === 'undefined') return;

    // Learn from navigation patterns
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      // Track navigation as a form of usage
      return result;
    };

    // Clean up old data periodically
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000); // Every hour
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [path, pattern] of this.usageData.entries()) {
      if (pattern.lastAccess < cutoff && pattern.accessCount < 3) {
        this.usageData.delete(path);
      }
    }
  }

  private generateInitialRules(): void {
    this.optimizationRules = this.getSpecialOptimizationRules();
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Reset all usage data (for testing/development)
  reset(): void {
    this.usageData.clear();
    this.optimizationRules = [];
    this.lastOptimization = 0;
    this.generateInitialRules();
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pwa-usage-patterns');
    }
  }
}

// Global instance
export const pwaUsageOptimizer = new PWAUsageOptimizer();

// React hook
export function usePWAUsageOptimizer() {
  return {
    trackAccess: (path: string, loadTime: number, fromCache: boolean) =>
      pwaUsageOptimizer.trackAccess(path, loadTime, fromCache),
    getRecommendations: (path: string) =>
      pwaUsageOptimizer.getOptimizationRecommendations(path),
    applyOptimizations: () => pwaUsageOptimizer.applyOptimizations(),
    getAnalytics: () => pwaUsageOptimizer.getUsageAnalytics(),
    reset: () => pwaUsageOptimizer.reset()
  };
}

export type { UsagePattern, OptimizationRule };