/**
 * Mock del servicio de autenticación para desarrollo
 */

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
  preferences: UserPreferences;
  sessionId?: string;
  tokenExpiry?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: any;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    digest: 'daily' | 'weekly' | 'never';
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  userAgent: string;
  ipAddress: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

// Mock data
const mockUser: User = {
  id: '1',
  email: 'admin@metrica.pe',
  firstName: 'Admin',
  lastName: 'Usuario',
  avatar: '',
  role: {
    id: 'admin',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    level: 1,
    permissions: [
      {
        id: 'admin-all',
        name: 'Administrar todo',
        resource: '*',
        action: '*'
      }
    ]
  },
  department: 'Tecnología',
  permissions: [],
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    theme: 'light',
    language: 'es',
    timezone: 'America/Lima',
    notifications: {
      email: true,
      browser: true,
      digest: 'daily'
    },
    dashboard: {
      layout: 'default',
      widgets: []
    }
  },
  twoFactorEnabled: false
};

const mockSession: AuthSession = {
  id: 'session-1',
  userId: '1',
  token: 'mock-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  createdAt: new Date(),
  lastActivity: new Date(),
  userAgent: 'Mock Browser',
  ipAddress: '127.0.0.1'
};

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; session: AuthSession } | null> {
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    if (credentials.email === 'admin@metrica.pe' && credentials.password === 'admin123') {
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
      }
      
      return { user: mockUser, session: mockSession };
    }
    
    throw new Error('Credenciales inválidas');
  }

  static async logout(): Promise<void> {
    // Clear auth data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  static async refreshToken(refreshToken: string): Promise<AuthSession> {
    // Mock refresh logic
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockSession, token: 'new-mock-token' };
  }

  static async getCurrentUser(): Promise<User | null> {
    // Check if user is logged in via localStorage
    if (typeof window === 'undefined') return null; // SSR check
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    
    if (token === 'mock-token' && userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  static getCurrentUserSync(): User | null {
    // Check if user is logged in via localStorage (synchronous)
    if (typeof window === 'undefined') return null; // SSR check
    const token = localStorage?.getItem('auth-token');
    const userStr = localStorage?.getItem('auth-user');
    
    if (token === 'mock-token' && userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User> {
    // Mock update preferences
    return { ...mockUser, preferences: { ...mockUser.preferences, ...preferences } };
  }

  static hasPermission(user: User, resource: string, action: string): boolean {
    // Mock permission check - admin has all permissions
    return user.role.level === 1;
  }

  static canAccess(user: User, resource: string, action?: string): boolean {
    // Mock access check - admin can access everything
    return user.role.level === 1;
  }

  static async initializeFromStorage(): Promise<boolean> {
    // Check if there's a valid session in storage
    if (typeof window === 'undefined') return false; // SSR check
    const token = localStorage?.getItem('auth-token');
    return token === 'mock-token';
  }

  static getCurrentSession(): AuthSession | null {
    // Check if session exists
    if (typeof window === 'undefined') return null; // SSR check
    const token = localStorage?.getItem('auth-token');
    return token === 'mock-token' ? mockSession : null;
  }

  static getCurrentSessionSync(): AuthSession | null {
    // Check if session exists (synchronous)
    if (typeof window === 'undefined') return null; // SSR check
    const token = localStorage?.getItem('auth-token');
    return token === 'mock-token' ? mockSession : null;
  }

  static async devAutoLogin(): Promise<boolean> {
    // Only auto-login if user is already logged in
    if (typeof window === 'undefined') return false; // SSR check
    const token = localStorage?.getItem('auth-token');
    return token === 'mock-token';
  }
}