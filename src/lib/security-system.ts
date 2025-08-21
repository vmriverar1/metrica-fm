/**
 * FASE 6: Security System - Sistema de seguridad y rate limiting avanzado
 * 
 * Características:
 * - Rate limiting inteligente
 * - Detección de ataques
 * - Firewall de aplicación web (WAF)
 * - Protección CSRF/XSS
 * - Monitoreo de seguridad en tiempo real
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Tipos para el sistema de seguridad
interface SecurityRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  action: 'block' | 'warn' | 'monitor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface RateLimitRule {
  id: string;
  name: string;
  pattern: string; // URL pattern
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'rate_limit' | 'malicious_request' | 'brute_force' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  url: string;
  details: Record<string, any>;
  blocked: boolean;
  userId?: string;
}

interface IPInfo {
  requests: { timestamp: number; endpoint: string; status: number }[];
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
  blockedUntil?: number;
  failedAttempts: number;
  riskScore: number;
  country?: string;
  isp?: string;
}

/**
 * Sistema principal de seguridad
 */
export class SecuritySystem {
  private ipTracker: Map<string, IPInfo> = new Map();
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private blockedIPs: Set<string> = new Set();
  
  private securityRules: SecurityRule[] = [
    {
      id: 'sql-injection',
      name: 'SQL Injection Detection',
      description: 'Detects SQL injection attempts',
      pattern: /(union|select|insert|update|delete|drop|create|alter|exec|script|javascript|vbscript|onload|onerror)/i,
      action: 'block',
      severity: 'critical',
      enabled: true
    },
    {
      id: 'xss-detection',
      name: 'XSS Detection',
      description: 'Detects cross-site scripting attempts',
      pattern: /<script|javascript:|data:text\/html|eval\(|expression\(/i,
      action: 'block',
      severity: 'high',
      enabled: true
    },
    {
      id: 'path-traversal',
      name: 'Path Traversal Detection',
      description: 'Detects directory traversal attempts',
      pattern: /\.\.\//,
      action: 'block',
      severity: 'high',
      enabled: true
    },
    {
      id: 'command-injection',
      name: 'Command Injection Detection',
      description: 'Detects command injection attempts',
      pattern: /(\||&&|;|\`|\$\(|\${)/,
      action: 'warn',
      severity: 'high',
      enabled: true
    },
    {
      id: 'suspicious-user-agent',
      name: 'Suspicious User Agent',
      description: 'Detects suspicious or malicious user agents',
      pattern: /(sqlmap|nikto|nmap|masscan|curl|wget|python-requests|bot|crawler)/i,
      action: 'monitor',
      severity: 'medium',
      enabled: true
    }
  ];

  private rateLimitRules: RateLimitRule[] = [
    {
      id: 'general-api',
      name: 'General API Rate Limit',
      pattern: '/api/**',
      maxRequests: 100,
      windowMs: 60 * 1000 // 1 minute
    },
    {
      id: 'auth-endpoints',
      name: 'Authentication Endpoints',
      pattern: '/api/admin/auth/**',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    {
      id: 'admin-endpoints',
      name: 'Admin Endpoints',
      pattern: '/api/admin/**',
      maxRequests: 200,
      windowMs: 60 * 1000 // 1 minute
    },
    {
      id: 'public-pages',
      name: 'Public Pages',
      pattern: '/**',
      maxRequests: 1000,
      windowMs: 60 * 1000 // 1 minute
    }
  ];

  constructor() {
    this.startCleanupTasks();
  }

  /**
   * Procesar request de seguridad
   */
  async processRequest(request: NextRequest): Promise<{
    allowed: boolean;
    reason?: string;
    event?: SecurityEvent;
    rateLimited?: boolean;
    resetTime?: number;
  }> {
    const ipAddress = this.extractIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const url = request.url;
    
    // 1. Verificar IP bloqueada
    if (this.blockedIPs.has(ipAddress)) {
      const event = await this.createSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ipAddress,
        userAgent,
        url,
        details: { reason: 'Blocked IP access attempt' },
        blocked: true
      });

      return {
        allowed: false,
        reason: 'IP blocked due to suspicious activity',
        event
      };
    }

    // 2. Verificar rate limiting
    const rateLimitResult = this.checkRateLimit(request, ipAddress);
    if (!rateLimitResult.allowed) {
      await this.trackIPActivity(ipAddress, url, 429);
      
      const event = await this.createSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        ipAddress,
        userAgent,
        url,
        details: { 
          limit: rateLimitResult.limit,
          current: rateLimitResult.current 
        },
        blocked: true
      });

      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        event,
        rateLimited: true,
        resetTime: rateLimitResult.resetTime
      };
    }

    // 3. Aplicar reglas de seguridad
    const securityResult = await this.applySecurityRules(request, ipAddress, userAgent);
    if (!securityResult.allowed) {
      await this.trackIPActivity(ipAddress, url, 403);
      return securityResult;
    }

    // 4. Analizar comportamiento sospechoso
    const behaviorResult = await this.analyzeSuspiciousBehavior(ipAddress, url);
    if (!behaviorResult.allowed) {
      return behaviorResult;
    }

    // Request permitido
    await this.trackIPActivity(ipAddress, url, 200);
    return { allowed: true };
  }

  /**
   * Aplicar reglas de seguridad
   */
  private async applySecurityRules(
    request: NextRequest,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    event?: SecurityEvent;
  }> {
    const url = request.url;
    
    // Obtener contenido del request para análisis
    let requestContent = '';
    try {
      if (request.method !== 'GET') {
        const body = await request.clone().text();
        requestContent = body;
      }
      requestContent += ' ' + url + ' ' + userAgent;
    } catch (error) {
      // Error leyendo body, continuar
    }

    // Aplicar cada regla de seguridad
    for (const rule of this.securityRules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(requestContent)) {
        const event = await this.createSecurityEvent({
          type: 'malicious_request',
          severity: rule.severity,
          ipAddress,
          userAgent,
          url,
          details: {
            rule: rule.name,
            pattern: rule.pattern.source,
            matchedContent: requestContent.substring(0, 200)
          },
          blocked: rule.action === 'block'
        });

        if (rule.action === 'block') {
          await this.incrementRiskScore(ipAddress, 20);
          return {
            allowed: false,
            reason: `Blocked by security rule: ${rule.name}`,
            event
          };
        } else if (rule.action === 'warn') {
          await this.incrementRiskScore(ipAddress, 5);
          console.warn(`[SECURITY] Warning: ${rule.name} - ${ipAddress}`);
        }

        // Para 'monitor', solo crear el evento sin bloquear
      }
    }

    return { allowed: true };
  }

  /**
   * Verificar rate limiting
   */
  private checkRateLimit(request: NextRequest, ipAddress: string): {
    allowed: boolean;
    limit?: number;
    current?: number;
    resetTime?: number;
  } {
    const url = new URL(request.url).pathname;
    
    // Encontrar regla aplicable
    const applicableRule = this.rateLimitRules.find(rule => {
      if (rule.pattern === '/**') return true;
      if (rule.pattern.endsWith('/**')) {
        const basePattern = rule.pattern.replace('/**', '');
        return url.startsWith(basePattern);
      }
      return url === rule.pattern;
    });

    if (!applicableRule) {
      return { allowed: true };
    }

    // Generar clave de rate limit
    const key = applicableRule.keyGenerator 
      ? applicableRule.keyGenerator(request)
      : `${ipAddress}:${applicableRule.id}`;

    const now = Date.now();
    const windowStart = now - applicableRule.windowMs;
    
    let rateLimitData = this.rateLimitStore.get(key);
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        count: 1,
        resetTime: now + applicableRule.windowMs
      };
      this.rateLimitStore.set(key, rateLimitData);
      return { allowed: true };
    }
    
    if (rateLimitData.count >= applicableRule.maxRequests) {
      return {
        allowed: false,
        limit: applicableRule.maxRequests,
        current: rateLimitData.count,
        resetTime: rateLimitData.resetTime
      };
    }
    
    rateLimitData.count++;
    return { allowed: true };
  }

  /**
   * Analizar comportamiento sospechoso
   */
  private async analyzeSuspiciousBehavior(ipAddress: string, url: string): Promise<{
    allowed: boolean;
    reason?: string;
    event?: SecurityEvent;
  }> {
    const ipInfo = this.ipTracker.get(ipAddress);
    if (!ipInfo) return { allowed: true };

    // Detectar brute force
    const recentFailedAttempts = ipInfo.requests
      .filter(req => 
        Date.now() - req.timestamp < 10 * 60 * 1000 && // Últimos 10 minutos
        req.status >= 400
      ).length;

    if (recentFailedAttempts > 10) {
      await this.blockIP(ipAddress, 60 * 60 * 1000); // Bloquear por 1 hora
      
      const event = await this.createSecurityEvent({
        type: 'brute_force',
        severity: 'critical',
        ipAddress,
        userAgent: 'Unknown',
        url,
        details: {
          failedAttempts: recentFailedAttempts,
          timeWindow: '10 minutes'
        },
        blocked: true
      });

      return {
        allowed: false,
        reason: 'IP blocked due to brute force attempts',
        event
      };
    }

    // Detectar actividad sospechosa por volumen
    const recentRequests = ipInfo.requests
      .filter(req => Date.now() - req.timestamp < 5 * 60 * 1000).length; // Últimos 5 minutos

    if (recentRequests > 500) { // Más de 500 requests en 5 minutos
      const event = await this.createSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ipAddress,
        userAgent: 'Unknown',
        url,
        details: {
          requestCount: recentRequests,
          timeWindow: '5 minutes'
        },
        blocked: false
      });

      await this.incrementRiskScore(ipAddress, 30);
      return { allowed: true, event };
    }

    return { allowed: true };
  }

  /**
   * Rastrear actividad de IP
   */
  private async trackIPActivity(ipAddress: string, url: string, statusCode: number): Promise<void> {
    const now = Date.now();
    let ipInfo = this.ipTracker.get(ipAddress);

    if (!ipInfo) {
      ipInfo = {
        requests: [],
        firstSeen: now,
        lastSeen: now,
        blocked: false,
        failedAttempts: 0,
        riskScore: 0
      };
      this.ipTracker.set(ipAddress, ipInfo);
    }

    ipInfo.requests.push({
      timestamp: now,
      endpoint: url,
      status: statusCode
    });

    ipInfo.lastSeen = now;

    if (statusCode >= 400) {
      ipInfo.failedAttempts++;
    }

    // Mantener solo los últimos 1000 requests por IP
    if (ipInfo.requests.length > 1000) {
      ipInfo.requests = ipInfo.requests.slice(-1000);
    }
  }

  /**
   * Incrementar score de riesgo
   */
  private async incrementRiskScore(ipAddress: string, points: number): Promise<void> {
    const ipInfo = this.ipTracker.get(ipAddress);
    if (ipInfo) {
      ipInfo.riskScore += points;
      
      // Auto-bloqueo si el score es muy alto
      if (ipInfo.riskScore > 100) {
        await this.blockIP(ipAddress, 24 * 60 * 60 * 1000); // 24 horas
      }
    }
  }

  /**
   * Bloquear IP
   */
  private async blockIP(ipAddress: string, durationMs: number): Promise<void> {
    this.blockedIPs.add(ipAddress);
    const ipInfo = this.ipTracker.get(ipAddress);
    
    if (ipInfo) {
      ipInfo.blocked = true;
      ipInfo.blockedUntil = Date.now() + durationMs;
    }

    console.warn(`[SECURITY] IP ${ipAddress} blocked for ${durationMs / 1000} seconds`);

    // Auto-desbloqueo
    setTimeout(() => {
      this.unblockIP(ipAddress);
    }, durationMs);
  }

  /**
   * Desbloquear IP
   */
  private unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    const ipInfo = this.ipTracker.get(ipAddress);
    
    if (ipInfo) {
      ipInfo.blocked = false;
      ipInfo.blockedUntil = undefined;
      ipInfo.riskScore = Math.max(0, ipInfo.riskScore - 20); // Reducir score
    }

    console.info(`[SECURITY] IP ${ipAddress} unblocked`);
  }

  /**
   * Crear evento de seguridad
   */
  private async createSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<SecurityEvent> {
    const securityEvent: SecurityEvent = {
      id: crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...event
    };

    this.securityEvents.push(securityEvent);
    
    // Mantener solo los últimos 10000 eventos
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }

    // Log eventos críticos
    if (event.severity === 'critical') {
      console.error(`[SECURITY CRITICAL] ${event.type}: ${JSON.stringify(event.details)}`);
    }

    return securityEvent;
  }

  /**
   * Extraer IP del request
   */
  private extractIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }
    
    const remoteAddr = request.headers.get('remote-addr');
    return remoteAddr || '127.0.0.1';
  }

  /**
   * Iniciar tareas de limpieza
   */
  private startCleanupTasks(): void {
    // Limpiar datos antiguos cada 15 minutos
    setInterval(() => {
      this.cleanupOldData();
    }, 15 * 60 * 1000);

    // Limpiar rate limit store cada 5 minutos
    setInterval(() => {
      this.cleanupRateLimitStore();
    }, 5 * 60 * 1000);
  }

  /**
   * Limpiar datos antiguos
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Limpiar IPs tracking
    for (const [ip, info] of this.ipTracker.entries()) {
      // Limpiar requests antiguos
      info.requests = info.requests.filter(req => req.timestamp > oneHourAgo);
      
      // Remover IPs inactivas por más de 24 horas
      if (info.lastSeen < oneDayAgo && !info.blocked) {
        this.ipTracker.delete(ip);
      }

      // Desbloquear IPs si el tiempo expiró
      if (info.blocked && info.blockedUntil && now > info.blockedUntil) {
        this.unblockIP(ip);
      }
    }

    // Limpiar eventos antiguos
    this.securityEvents = this.securityEvents.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
  }

  /**
   * Limpiar rate limit store
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    
    for (const [key, data] of this.rateLimitStore.entries()) {
      if (data.resetTime < now) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats(): {
    totalIPs: number;
    blockedIPs: number;
    highRiskIPs: number;
    recentEvents: number;
    topThreats: Array<{ type: string; count: number }>;
    rateLimitHits: number;
  } {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;

    const recentEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > lastHour
    );

    const threatCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topThreats = Object.entries(threatCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalIPs: this.ipTracker.size,
      blockedIPs: this.blockedIPs.size,
      highRiskIPs: Array.from(this.ipTracker.values()).filter(ip => ip.riskScore > 50).length,
      recentEvents: recentEvents.length,
      topThreats,
      rateLimitHits: recentEvents.filter(e => e.type === 'rate_limit').length
    };
  }

  /**
   * Obtener eventos de seguridad recientes
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Obtener información de IP específica
   */
  getIPInfo(ipAddress: string): IPInfo | null {
    return this.ipTracker.get(ipAddress) || null;
  }
}

/**
 * Middleware de seguridad para Next.js
 */
export function withSecurity(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const securityResult = await securitySystem.processRequest(request);
    
    if (!securityResult.allowed) {
      const status = securityResult.rateLimited ? 429 : 403;
      const response: any = {
        error: securityResult.reason || 'Request blocked by security system',
        timestamp: new Date().toISOString(),
        ...(securityResult.resetTime && {
          resetTime: securityResult.resetTime
        })
      };

      return new Response(JSON.stringify(response), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...(securityResult.resetTime && {
            'Retry-After': String(Math.ceil((securityResult.resetTime - Date.now()) / 1000))
          })
        }
      });
    }

    return handler(request, ...args);
  };
}

// Instancia global del sistema de seguridad
export const securitySystem = new SecuritySystem();

// API pública para seguridad
export const securityAPI = {
  getStats: () => securitySystem.getSecurityStats(),
  getEvents: (limit?: number) => securitySystem.getRecentEvents(limit),
  getIPInfo: (ip: string) => securitySystem.getIPInfo(ip),
  blockIP: (ip: string, duration: number) => securitySystem['blockIP'](ip, duration),
  unblockIP: (ip: string) => securitySystem['unblockIP'](ip)
};

export default securitySystem;