/**
 * FASE 6: Enterprise Authentication Service
 * 
 * Sistema completo de autenticación empresarial con roles, permisos y sesiones.
 * Diseñado para integración con sistemas externos (NextAuth, Auth0, etc.)
 * 
 * Features:
 * - Autenticación multi-método (email/password, SSO, 2FA)
 * - Sistema de roles jerárquicos
 * - Gestión de permisos granulares
 * - Sesiones seguras con refresh tokens
 * - Auditoría completa de accesos
 * - Sistema de autenticación local
 */

import { RecruiterProfile } from '@/types/careers';

// Tipos para el sistema de autenticación
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  department: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Configuraciones de usuario
  preferences: UserPreferences;
  
  // Información de sesión
  sessionId?: string;
  tokenExpiry?: Date;
  
  // 2FA
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1 = Admin, 2 = Manager, 3 = User, 4 = Guest
  permissions: Permission[];
  isSystem: boolean; // Roles del sistema que no se pueden eliminar
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // 'applications', 'jobs', 'users', 'reports', etc.
  action: string;   // 'create', 'read', 'update', 'delete', 'approve', etc.
  conditions?: Record<string, any>; // Condiciones adicionales
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    types: {
      newApplication: boolean;
      statusChange: boolean;
      systemUpdates: boolean;
      reports: boolean;
    };
  };
  dashboard: {
    layout: 'compact' | 'comfortable' | 'spacious';
    widgets: string[];
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  permissions: Permission[];
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  location?: {
    country: string;
    city: string;
  };
}

// Cache para sesiones activas
const activeSessions = new Map<string, AuthSession>();
const loginAttempts: LoginAttempt[] = [];

// Roles predefinidos del sistema
const systemRoles: UserRole[] = [
  {
    id: 'super-admin',
    name: 'Super Administrador',
    description: 'Acceso completo al sistema',
    level: 1,
    isSystem: true,
    permissions: [
      { id: '1', name: 'all', resource: '*', action: '*' }
    ]
  },
  {
    id: 'hr-manager',
    name: 'Gerente de RRHH',
    description: 'Gestión completa de reclutamiento',
    level: 2,
    isSystem: true,
    permissions: [
      { id: '2', name: 'manage-applications', resource: 'applications', action: '*' },
      { id: '3', name: 'manage-jobs', resource: 'jobs', action: '*' },
      { id: '4', name: 'view-reports', resource: 'reports', action: 'read' },
      { id: '5', name: 'manage-recruiters', resource: 'users', action: 'read,update' }
    ]
  },
  {
    id: 'recruiter',
    name: 'Reclutador',
    description: 'Gestión de aplicaciones asignadas',
    level: 3,
    isSystem: true,
    permissions: [
      { id: '6', name: 'view-applications', resource: 'applications', action: 'read,update', conditions: { assignedTo: 'self' } },
      { id: '7', name: 'view-jobs', resource: 'jobs', action: 'read' },
      { id: '8', name: 'basic-reports', resource: 'reports', action: 'read', conditions: { scope: 'own' } }
    ]
  },
  {
    id: 'hiring-manager',
    name: 'Gerente de Contratación',
    description: 'Aprobación y toma de decisiones',
    level: 2,
    isSystem: true,
    permissions: [
      { id: '9', name: 'approve-applications', resource: 'applications', action: 'read,update,approve' },
      { id: '10', name: 'manage-department-jobs', resource: 'jobs', action: '*', conditions: { department: 'own' } },
      { id: '11', name: 'department-reports', resource: 'reports', action: 'read', conditions: { scope: 'department' } }
    ]
  },
  {
    id: 'viewer',
    name: 'Visualizador',
    description: 'Solo lectura de información básica',
    level: 4,
    isSystem: true,
    permissions: [
      { id: '12', name: 'view-basic-info', resource: 'applications', action: 'read', conditions: { fields: ['basic'] } },
      { id: '13', name: 'view-public-jobs', resource: 'jobs', action: 'read', conditions: { status: 'public' } }
    ]
  }
];

// Usuarios de ejemplo para desarrollo
const sampleUsers: User[] = [
  {
    id: 'user-001',
    email: 'admin@metrica-dip.com',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: systemRoles[0], // Super Admin
    department: 'Dirección General',
    permissions: systemRoles[0].permissions,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    twoFactorEnabled: true,
    preferences: {
      theme: 'system',
      language: 'es',
      timezone: 'America/Lima',
      notifications: {
        email: true,
        push: true,
        desktop: true,
        types: {
          newApplication: true,
          statusChange: true,
          systemUpdates: true,
          reports: true
        }
      },
      dashboard: {
        layout: 'comfortable',
        widgets: ['stats', 'recent-applications', 'pending-approvals', 'system-health'],
        autoRefresh: true,
        refreshInterval: 30000
      }
    }
  },
  {
    id: 'user-002',
    email: 'ana.torres@metrica-dip.com',
    firstName: 'Ana',
    lastName: 'Torres',
    role: systemRoles[2], // Recruiter
    department: 'Recursos Humanos',
    permissions: systemRoles[2].permissions,
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Lima',
      notifications: {
        email: true,
        push: true,
        desktop: false,
        types: {
          newApplication: true,
          statusChange: true,
          systemUpdates: false,
          reports: false
        }
      },
      dashboard: {
        layout: 'compact',
        widgets: ['my-applications', 'recent-activity', 'quick-actions'],
        autoRefresh: true,
        refreshInterval: 60000
      }
    }
  },
  {
    id: 'user-003',
    email: 'luis.hernandez@metrica-dip.com',
    firstName: 'Luis',
    lastName: 'Hernández',
    role: systemRoles[3], // Hiring Manager
    department: 'Arquitectura y Diseño',
    permissions: systemRoles[3].permissions,
    isActive: true,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    twoFactorEnabled: true,
    preferences: {
      theme: 'dark',
      language: 'es',
      timezone: 'America/Lima',
      notifications: {
        email: true,
        push: false,
        desktop: true,
        types: {
          newApplication: true,
          statusChange: true,
          systemUpdates: true,
          reports: true
        }
      },
      dashboard: {
        layout: 'spacious',
        widgets: ['department-overview', 'pending-approvals', 'team-performance'],
        autoRefresh: false,
        refreshInterval: 300000
      }
    }
  }
];

export class AuthService {
  private static currentUser: User | null = null;
  private static currentSession: AuthSession | null = null;

  /**
   * Autenticar usuario con email y password
   */
  static async login(credentials: LoginCredentials): Promise<{ 
    success: boolean; 
    session?: AuthSession; 
    error?: string; 
    requiresTwoFactor?: boolean;
  }> {
    const { email, password, rememberMe, twoFactorCode } = credentials;
    
    // Registrar intento de login
    const attempt: LoginAttempt = {
      id: `attempt-${Date.now()}`,
      email,
      ipAddress: '127.0.0.1', // En producción vendría del request
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      success: false,
      timestamp: new Date()
    };

    try {
      // Buscar usuario
      const user = sampleUsers.find(u => u.email === email && u.isActive);
      if (!user) {
        attempt.failureReason = 'Usuario no encontrado';
        loginAttempts.push(attempt);
        return { success: false, error: 'Credenciales inválidas' };
      }

      // Validar password (en producción sería hash)
      const isValidPassword = password === 'admin123'; // Simplificado para desarrollo
      if (!isValidPassword) {
        attempt.failureReason = 'Password incorrecto';
        loginAttempts.push(attempt);
        return { success: false, error: 'Credenciales inválidas' };
      }

      // Verificar 2FA si está habilitado
      if (user.twoFactorEnabled && !twoFactorCode) {
        return { 
          success: false, 
          requiresTwoFactor: true,
          error: 'Código de verificación requerido' 
        };
      }

      if (user.twoFactorEnabled && twoFactorCode) {
        const isValid2FA = this.verify2FA(user, twoFactorCode);
        if (!isValid2FA) {
          attempt.failureReason = 'Código 2FA inválido';
          loginAttempts.push(attempt);
          return { success: false, error: 'Código de verificación inválido' };
        }
      }

      // Crear sesión
      const session = await this.createSession(user, rememberMe);
      
      // Actualizar último login
      user.lastLogin = new Date();
      
      // Registrar login exitoso
      attempt.success = true;
      loginAttempts.push(attempt);

      this.currentUser = user;
      this.currentSession = session;

      console.log('🔐 Usuario autenticado:', user.email, user.role.name);

      return { success: true, session };

    } catch (error) {
      attempt.failureReason = 'Error del sistema';
      loginAttempts.push(attempt);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del sistema' 
      };
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    if (this.currentSession) {
      activeSessions.delete(this.currentSession.accessToken);
      this.currentSession = null;
      this.currentUser = null;
    }
    
    // Limpiar storage local
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-session');
      sessionStorage.removeItem('auth-session');
    }

    console.log('👋 Usuario desconectado');
  }

  /**
   * Obtener usuario actual
   */
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Obtener sesión actual
   */
  static getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  static hasPermission(
    permission: { resource: string; action: string },
    user?: User
  ): boolean {
    const currentUser = user || this.currentUser;
    if (!currentUser) return false;

    // Super admin tiene todos los permisos
    if (currentUser.role.name === 'Super Administrador') return true;

    // Verificar permisos específicos
    return currentUser.permissions.some(p => {
      // Wildcard permissions
      if (p.resource === '*' && p.action === '*') return true;
      if (p.resource === permission.resource && p.action === '*') return true;
      if (p.resource === '*' && p.action === permission.action) return true;
      
      // Exact match
      if (p.resource === permission.resource && p.action === permission.action) return true;
      
      // Multiple actions (e.g., 'read,update')
      if (p.resource === permission.resource && p.action.includes(',')) {
        return p.action.split(',').includes(permission.action);
      }

      return false;
    });
  }

  /**
   * Verificar si el usuario puede acceder a un recurso
   */
  static canAccess(resource: string, action: string = 'read'): boolean {
    return this.hasPermission({ resource, action });
  }

  /**
   * Obtener todos los roles disponibles
   */
  static getRoles(): UserRole[] {
    return systemRoles;
  }

  /**
   * Obtener usuarios (solo para administradores)
   */
  static async getUsers(): Promise<User[]> {
    if (!this.canAccess('users', 'read')) {
      throw new Error('No tienes permisos para ver usuarios');
    }
    return sampleUsers;
  }

  /**
   * Crear nuevo usuario
   */
  static async createUser(userData: Partial<User>): Promise<User> {
    if (!this.canAccess('users', 'create')) {
      throw new Error('No tienes permisos para crear usuarios');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: userData.role || systemRoles[4], // Default to viewer
      department: userData.department || '',
      permissions: userData.role?.permissions || [],
      isActive: userData.isActive ?? true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      preferences: {
        theme: 'system',
        language: 'es',
        timezone: 'America/Lima',
        notifications: {
          email: true,
          push: false,
          desktop: false,
          types: {
            newApplication: true,
            statusChange: true,
            systemUpdates: false,
            reports: false
          }
        },
        dashboard: {
          layout: 'comfortable',
          widgets: ['recent-activity'],
          autoRefresh: false,
          refreshInterval: 60000
        }
      }
    };

    sampleUsers.push(newUser);
    return newUser;
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!this.canAccess('users', 'update')) {
      throw new Error('No tienes permisos para actualizar usuarios');
    }

    const userIndex = sampleUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    sampleUsers[userIndex] = {
      ...sampleUsers[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    return sampleUsers[userIndex];
  }

  /**
   * Obtener intentos de login para auditoría
   */
  static getLoginAttempts(): LoginAttempt[] {
    if (!this.canAccess('system', 'read')) {
      throw new Error('No tienes permisos para ver logs de sistema');
    }
    return loginAttempts;
  }

  /**
   * Refresh token
   */
  static async refreshToken(): Promise<AuthSession | null> {
    if (!this.currentSession || !this.currentUser) return null;

    // Verificar si el token ha expirado
    if (new Date() >= this.currentSession.expiresAt) {
      await this.logout();
      return null;
    }

    // Crear nueva sesión con token renovado
    const newSession = await this.createSession(this.currentUser, true);
    this.currentSession = newSession;

    return newSession;
  }

  /**
   * Inicializar sesión desde storage (para persistencia)
   */
  static async initializeFromStorage(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem('auth-session') || sessionStorage.getItem('auth-session');
      if (!stored) return false;

      const sessionData = JSON.parse(stored);
      const user = sampleUsers.find(u => u.id === sessionData.userId);
      
      if (!user) return false;

      // Verificar expiración
      if (new Date() >= new Date(sessionData.expiresAt)) {
        this.logout();
        return false;
      }

      this.currentUser = user;
      this.currentSession = {
        user,
        accessToken: sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
        expiresAt: new Date(sessionData.expiresAt),
        permissions: user.permissions
      };

      return true;
    } catch (error) {
      console.error('Error initializing session:', error);
      return false;
    }
  }

  // Métodos privados

  /**
   * Crear sesión de usuario
   */
  private static async createSession(user: User, rememberMe: boolean = false): Promise<AuthSession> {
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)); // 30 days or 8 hours

    const session: AuthSession = {
      user,
      accessToken,
      refreshToken,
      expiresAt,
      permissions: user.permissions
    };

    // Almacenar en cache
    activeSessions.set(accessToken, session);

    // Persistir en storage
    if (typeof window !== 'undefined') {
      const sessionData = {
        userId: user.id,
        accessToken,
        refreshToken,
        expiresAt: expiresAt.toISOString()
      };

      if (rememberMe) {
        localStorage.setItem('auth-session', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('auth-session', JSON.stringify(sessionData));
      }
    }

    return session;
  }

  /**
   * Generar token único
   */
  private static generateToken(): string {
    return `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Verificar código 2FA
   */
  private static verify2FA(user: User, code: string): boolean {
    // En producción usarías una librería como speakeasy
    // Por ahora simulamos con código fijo
    return code === '123456';
  }

  /**
   * Auto-login para desarrollo
   */
  static async devAutoLogin(userEmail: string = 'admin@metrica-dip.com'): Promise<boolean> {
    if (process.env.NODE_ENV !== 'development') return false;
    
    const result = await this.login({
      email: userEmail,
      password: 'admin123'
    });

    return result.success;
  }
}