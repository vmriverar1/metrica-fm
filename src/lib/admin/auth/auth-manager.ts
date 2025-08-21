/**
 * AuthManager - Sistema de autenticación con magic links
 * 
 * Características:
 * - Autenticación sin contraseñas usando magic links
 * - JWT para sesiones seguras
 * - Control de usuarios basado en JSON
 * - Integración con sistema de logging
 * - Rate limiting para prevenir abuso
 * - Expiración configurable de tokens
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { fileManager } from '../core/file-manager';
import { logger } from '../core/logger';

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  metadata?: {
    avatar?: string;
    preferences?: Record<string, any>;
    two_factor_enabled?: boolean;
  };
}

export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface MagicLinkToken {
  token: string;
  email: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  reason?: string;
}

export interface AuthConfig {
  jwtSecret: string;
  magicLinkTTL: number; // minutes
  sessionTTL: number; // hours
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  rateLimitWindow: number; // minutes
  rateLimitMax: number;
  enableEmailNotifications: boolean;
  emailConfig?: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
    templates: {
      magicLink: string;
      welcomeEmail: string;
      securityAlert: string;
    };
  };
}

export interface AuthResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Constantes
const DEFAULT_CONFIG: Partial<AuthConfig> = {
  magicLinkTTL: 15, // 15 minutos
  sessionTTL: 24, // 24 horas
  maxLoginAttempts: 5,
  lockoutDuration: 30, // 30 minutos
  rateLimitWindow: 15, // 15 minutos
  rateLimitMax: 10,
  enableEmailNotifications: false
};

/**
 * AuthManager - Gestor principal de autenticación
 */
export class AuthManager {
  private config: AuthConfig;
  private users: User[] = [];
  private activeSessions: Map<string, AuthSession> = new Map();
  private magicTokens: Map<string, MagicLinkToken> = new Map();
  private loginAttempts: Map<string, LoginAttempt[]> = new Map(); // IP -> attempts
  private usersFile = 'data/users.json';
  private sessionsFile = 'data/sessions.json';
  private attemptsFile = 'data/login-attempts.json';

  constructor(config: Partial<AuthConfig>) {
    if (!config.jwtSecret) {
      throw new Error('JWT secret is required for AuthManager');
    }
    
    this.config = { ...DEFAULT_CONFIG, ...config } as AuthConfig;
    this.initializeAuth();
  }

  /**
   * Inicializar sistema de autenticación
   */
  private async initializeAuth(): Promise<void> {
    try {
      // Cargar usuarios existentes
      await this.loadUsers();
      
      // Cargar sesiones activas
      await this.loadActiveSessions();
      
      // Cargar intentos de login
      await this.loadLoginAttempts();
      
      // Configurar limpieza automática
      this.startCleanupTimer();
      
      await logger.info('auth', 'AuthManager initialized successfully', {
        usersCount: this.users.length,
        activeSessionsCount: this.activeSessions.size
      });
      
    } catch (error) {
      await logger.error('auth', 'Failed to initialize AuthManager', error);
      throw error;
    }
  }

  /**
   * Cargar usuarios desde archivo JSON
   */
  private async loadUsers(): Promise<void> {
    try {
      if (await fileManager.exists(this.usersFile)) {
        const data = await fileManager.readJSON<{ users: User[] }>(this.usersFile);
        this.users = data.data.users || [];
      } else {
        // Crear archivo inicial con usuario admin por defecto
        await this.createDefaultAdmin();
      }
    } catch (error) {
      await logger.warn('auth', 'Could not load users, using empty list', { error: error.message });
      this.users = [];
    }
  }

  /**
   * Crear usuario admin por defecto
   */
  private async createDefaultAdmin(): Promise<void> {
    const defaultAdmin: User = {
      id: 'admin_' + crypto.randomBytes(8).toString('hex'),
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@metrica-dip.com',
      name: 'Administrador',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      login_attempts: 0
    };

    this.users = [defaultAdmin];
    await this.saveUsers();
    
    await logger.info('auth', 'Created default admin user', {
      email: defaultAdmin.email,
      id: defaultAdmin.id
    });
  }

  /**
   * Guardar usuarios en archivo JSON
   */
  private async saveUsers(): Promise<void> {
    await fileManager.writeJSON(this.usersFile, { users: this.users }, {
      createBackup: true,
      ensureDirectory: true
    });
  }

  /**
   * Cargar sesiones activas
   */
  private async loadActiveSessions(): Promise<void> {
    try {
      if (await fileManager.exists(this.sessionsFile)) {
        const data = await fileManager.readJSON<{ sessions: AuthSession[] }>(this.sessionsFile);
        const sessions = data.data.sessions || [];
        
        // Filtrar sesiones expiradas
        const now = new Date();
        sessions.forEach(session => {
          if (new Date(session.expires_at) > now) {
            this.activeSessions.set(session.sessionId, session);
          }
        });
      }
    } catch (error) {
      await logger.warn('auth', 'Could not load sessions', { error: error.message });
    }
  }

  /**
   * Guardar sesiones activas
   */
  private async saveSessions(): Promise<void> {
    const sessions = Array.from(this.activeSessions.values());
    await fileManager.writeJSON(this.sessionsFile, { sessions }, {
      ensureDirectory: true
    });
  }

  /**
   * Cargar intentos de login
   */
  private async loadLoginAttempts(): Promise<void> {
    try {
      if (await fileManager.exists(this.attemptsFile)) {
        const data = await fileManager.readJSON<{ attempts: Record<string, LoginAttempt[]> }>(this.attemptsFile);
        const attempts = data.data.attempts || {};
        
        // Convertir a Map y filtrar intentos viejos
        const cutoff = new Date(Date.now() - this.config.rateLimitWindow * 60 * 1000);
        Object.entries(attempts).forEach(([ip, ipAttempts]) => {
          const recentAttempts = ipAttempts.filter(attempt => 
            new Date(attempt.timestamp) > cutoff
          );
          if (recentAttempts.length > 0) {
            this.loginAttempts.set(ip, recentAttempts);
          }
        });
      }
    } catch (error) {
      await logger.warn('auth', 'Could not load login attempts', { error: error.message });
    }
  }

  /**
   * Guardar intentos de login
   */
  private async saveLoginAttempts(): Promise<void> {
    const attempts: Record<string, LoginAttempt[]> = {};
    this.loginAttempts.forEach((ipAttempts, ip) => {
      attempts[ip] = ipAttempts;
    });
    
    await fileManager.writeJSON(this.attemptsFile, { attempts }, {
      ensureDirectory: true
    });
  }

  /**
   * Iniciar limpieza automática de tokens y sesiones expiradas
   */
  private startCleanupTimer(): void {
    setInterval(async () => {
      await this.cleanupExpiredTokens();
      await this.cleanupExpiredSessions();
      await this.cleanupOldLoginAttempts();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  /**
   * Verificar rate limiting
   */
  private checkRateLimit(ipAddress: string): boolean {
    const attempts = this.loginAttempts.get(ipAddress) || [];
    const cutoff = new Date(Date.now() - this.config.rateLimitWindow * 60 * 1000);
    
    const recentAttempts = attempts.filter(attempt => 
      new Date(attempt.timestamp) > cutoff
    );
    
    return recentAttempts.length < this.config.rateLimitMax;
  }

  /**
   * Registrar intento de login
   */
  private async recordLoginAttempt(
    email: string, 
    ipAddress: string, 
    userAgent: string, 
    success: boolean, 
    reason?: string
  ): Promise<void> {
    const attempt: LoginAttempt = {
      email,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      reason
    };

    const attempts = this.loginAttempts.get(ipAddress) || [];
    attempts.push(attempt);
    
    // Mantener solo intentos recientes
    const cutoff = new Date(Date.now() - this.config.rateLimitWindow * 60 * 1000);
    const filteredAttempts = attempts.filter(a => new Date(a.timestamp) > cutoff);
    
    this.loginAttempts.set(ipAddress, filteredAttempts);
    
    // Guardar periódicamente
    if (Math.random() < 0.1) { // 10% de probabilidad
      await this.saveLoginAttempts();
    }

    await logger.info('auth', `Login attempt: ${success ? 'success' : 'failed'}`, {
      email,
      ipAddress,
      success,
      reason
    });
  }

  /**
   * Buscar usuario por email
   */
  private findUserByEmail(email: string): User | null {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Buscar usuario por ID
   */
  private findUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  /**
   * Verificar si el usuario está bloqueado
   */
  private isUserLocked(user: User): boolean {
    if (!user.locked_until) return false;
    return new Date(user.locked_until) > new Date();
  }

  /**
   * Bloquear usuario por intentos fallidos
   */
  private async lockUser(user: User): Promise<void> {
    const lockUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
    user.locked_until = lockUntil.toISOString();
    user.login_attempts = 0; // Reset counter
    
    await this.saveUsers();
    
    await logger.warn('auth', `User locked due to too many failed attempts`, {
      userId: user.id,
      email: user.email,
      lockedUntil: user.locked_until
    });
  }

  /**
   * Generar magic link token
   */
  private generateMagicToken(email: string, ipAddress?: string, userAgent?: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.config.magicLinkTTL * 60 * 1000);
    
    const magicToken: MagicLinkToken = {
      token,
      email: email.toLowerCase(),
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    };
    
    this.magicTokens.set(token, magicToken);
    return token;
  }

  /**
   * Generar JWT para sesión
   */
  private generateJWT(user: User, sessionId: string): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (this.config.sessionTTL * 3600)
    };
    
    return jwt.sign(payload, this.config.jwtSecret);
  }

  /**
   * Verificar JWT
   */
  verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret);
      
      // Verificar que la sesión sigue activa
      const sessionId = (payload as any).sessionId;
      if (!this.activeSessions.has(sessionId)) {
        return { valid: false, error: 'Session not found' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Solicitar magic link
   */
  async requestMagicLink(
    email: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<AuthResult> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Verificar rate limiting
      if (!this.checkRateLimit(ipAddress)) {
        await this.recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'rate_limited');
        return {
          success: false,
          message: 'Too many requests. Please try again later.',
          error: 'RATE_LIMITED'
        };
      }
      
      // Buscar usuario
      const user = this.findUserByEmail(normalizedEmail);
      if (!user) {
        await this.recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'user_not_found');
        // No revelar si el usuario existe o no
        return {
          success: true,
          message: 'If the email exists, a magic link has been sent.'
        };
      }
      
      // Verificar estado del usuario
      if (user.status !== 'active') {
        await this.recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'user_inactive');
        return {
          success: false,
          message: 'Account is not active.',
          error: 'USER_INACTIVE'
        };
      }
      
      // Verificar si está bloqueado
      if (this.isUserLocked(user)) {
        await this.recordLoginAttempt(normalizedEmail, ipAddress, userAgent, false, 'user_locked');
        return {
          success: false,
          message: 'Account is temporarily locked. Please try again later.',
          error: 'USER_LOCKED'
        };
      }
      
      // Generar magic token
      const token = this.generateMagicToken(normalizedEmail, ipAddress, userAgent);
      
      // TODO: Enviar email con magic link
      // Por ahora solo loggeamos el token para desarrollo
      await logger.info('auth', 'Magic link generated', {
        email: normalizedEmail,
        token: token,
        ipAddress,
        development_url: `/api/admin/auth/verify?token=${token}`
      });
      
      await this.recordLoginAttempt(normalizedEmail, ipAddress, userAgent, true, 'magic_link_sent');
      
      return {
        success: true,
        message: 'Magic link sent to your email.',
        data: process.env.NODE_ENV === 'development' ? { 
          token,
          verify_url: `/api/admin/auth/verify?token=${token}`
        } : undefined
      };
      
    } catch (error) {
      await logger.error('auth', 'Failed to generate magic link', error, {
        email,
        ipAddress
      });
      
      return {
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Verificar magic link y crear sesión
   */
  async verifyMagicLink(
    token: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<AuthResult> {
    try {
      // Buscar token
      const magicToken = this.magicTokens.get(token);
      if (!magicToken) {
        await logger.warn('auth', 'Invalid magic token used', { token, ipAddress });
        return {
          success: false,
          message: 'Invalid or expired magic link.',
          error: 'INVALID_TOKEN'
        };
      }
      
      // Verificar expiración
      if (new Date(magicToken.expires_at) < new Date()) {
        this.magicTokens.delete(token);
        await logger.warn('auth', 'Expired magic token used', { 
          token, 
          ipAddress,
          expiredAt: magicToken.expires_at
        });
        return {
          success: false,
          message: 'Magic link has expired.',
          error: 'TOKEN_EXPIRED'
        };
      }
      
      // Verificar si ya fue usado
      if (magicToken.used) {
        await logger.warn('auth', 'Already used magic token', { token, ipAddress });
        return {
          success: false,
          message: 'Magic link has already been used.',
          error: 'TOKEN_USED'
        };
      }
      
      // Buscar usuario
      const user = this.findUserByEmail(magicToken.email);
      if (!user || user.status !== 'active') {
        this.magicTokens.delete(token);
        return {
          success: false,
          message: 'User account not found or inactive.',
          error: 'USER_NOT_FOUND'
        };
      }
      
      // Marcar token como usado
      magicToken.used = true;
      
      // Crear sesión
      const sessionId = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + this.config.sessionTTL * 3600 * 1000);
      
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      };
      
      this.activeSessions.set(sessionId, session);
      
      // Generar JWT
      const jwtToken = this.generateJWT(user, sessionId);
      
      // Actualizar último login del usuario
      user.last_login = new Date().toISOString();
      user.login_attempts = 0; // Reset attempts counter
      if (user.locked_until) {
        delete user.locked_until; // Unlock user
      }
      
      await this.saveUsers();
      await this.saveSessions();
      
      // Limpiar token usado
      this.magicTokens.delete(token);
      
      await logger.info('auth', 'User logged in successfully', {
        userId: user.id,
        email: user.email,
        sessionId,
        ipAddress
      });
      
      return {
        success: true,
        message: 'Login successful.',
        data: {
          token: jwtToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          session: {
            id: sessionId,
            expires_at: session.expires_at
          }
        }
      };
      
    } catch (error) {
      await logger.error('auth', 'Failed to verify magic link', error, {
        token,
        ipAddress
      });
      
      return {
        success: false,
        message: 'Internal server error.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(sessionId: string): Promise<AuthResult> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        this.activeSessions.delete(sessionId);
        await this.saveSessions();
        
        await logger.info('auth', 'User logged out', {
          userId: session.userId,
          sessionId
        });
      }
      
      return {
        success: true,
        message: 'Logged out successfully.'
      };
      
    } catch (error) {
      await logger.error('auth', 'Failed to logout', error, { sessionId });
      return {
        success: false,
        message: 'Logout failed.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtener sesión por ID
   */
  getSession(sessionId: string): AuthSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    // Verificar expiración
    if (new Date(session.expires_at) < new Date()) {
      this.activeSessions.delete(sessionId);
      return null;
    }
    
    return session;
  }

  /**
   * Obtener usuario por sesión
   */
  getUserBySession(sessionId: string): User | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    return this.findUserById(session.userId);
  }

  /**
   * Limpiar tokens expirados
   */
  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [token, magicToken] of this.magicTokens.entries()) {
      if (new Date(magicToken.expires_at) < now || magicToken.used) {
        this.magicTokens.delete(token);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      await logger.debug('auth', `Cleaned up ${cleaned} expired magic tokens`);
    }
  }

  /**
   * Limpiar sesiones expiradas
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (new Date(session.expires_at) < now) {
        this.activeSessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      await this.saveSessions();
      await logger.debug('auth', `Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * Limpiar intentos de login antiguos
   */
  private async cleanupOldLoginAttempts(): Promise<void> {
    const cutoff = new Date(Date.now() - this.config.rateLimitWindow * 60 * 1000);
    let cleaned = 0;
    
    for (const [ip, attempts] of this.loginAttempts.entries()) {
      const filteredAttempts = attempts.filter(attempt => 
        new Date(attempt.timestamp) > cutoff
      );
      
      if (filteredAttempts.length === 0) {
        this.loginAttempts.delete(ip);
        cleaned++;
      } else if (filteredAttempts.length !== attempts.length) {
        this.loginAttempts.set(ip, filteredAttempts);
      }
    }
    
    if (cleaned > 0) {
      await this.saveLoginAttempts();
      await logger.debug('auth', `Cleaned up login attempts for ${cleaned} IPs`);
    }
  }

  /**
   * Obtener estadísticas de autenticación
   */
  getAuthStats(): {
    usersCount: number;
    activeSessionsCount: number;
    magicTokensCount: number;
    loginAttemptsCount: number;
  } {
    return {
      usersCount: this.users.length,
      activeSessionsCount: this.activeSessions.size,
      magicTokensCount: this.magicTokens.size,
      loginAttemptsCount: Array.from(this.loginAttempts.values())
        .reduce((sum, attempts) => sum + attempts.length, 0)
    };
  }

  /**
   * Obtener todos los usuarios (solo para admins)
   */
  getAllUsers(): User[] {
    return this.users.map(user => ({
      ...user,
      // No incluir datos sensibles
    }));
  }
}

// Configuración por defecto del auth manager
const authConfig: Partial<AuthConfig> = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  magicLinkTTL: 15,
  sessionTTL: 24,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  rateLimitWindow: 15,
  rateLimitMax: 10,
  enableEmailNotifications: false
};

// Instancia singleton del auth manager
export const authManager = new AuthManager(authConfig);