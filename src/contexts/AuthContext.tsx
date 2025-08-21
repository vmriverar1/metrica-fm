/**
 * FASE 6: Auth Context - Gestión de Autenticación Global
 * 
 * Context React para manejo de autenticación en toda la aplicación.
 * Proporciona estado global del usuario, sesión y permisos.
 */

'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthService, User, AuthSession, LoginCredentials } from '@/lib/auth-service-mock';

// Tipos para el contexto
export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (resource: string, action?: string) => boolean;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

export interface AuthContextType extends AuthState {
  actions: AuthActions;
}

// Actions para el reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; session: AuthSession } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGIN_REQUIRES_2FA' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: AuthSession }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

// Estado inicial
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresTwoFactor: false
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        requiresTwoFactor: false
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        requiresTwoFactor: false
      };

    case 'LOGIN_REQUIRES_2FA':
      return {
        ...state,
        isLoading: false,
        error: null,
        requiresTwoFactor: true
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresTwoFactor: false
      };

    case 'REFRESH_TOKEN':
      return {
        ...state,
        session: action.payload,
        error: null
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        requiresTwoFactor: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };

    default:
      return state;
  }
}

// Crear contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicializar sesión al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Intentar restaurar sesión desde storage
        const hasStoredSession = await AuthService.initializeFromStorage();
        
        if (hasStoredSession) {
          const user = await AuthService.getCurrentUser();
          const session = AuthService.getCurrentSession();
          
          if (user && session) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, session }
            });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          // Auto-login para desarrollo
          if (process.env.NODE_ENV === 'development') {
            const devLoginSuccess = await AuthService.devAutoLogin();
            if (devLoginSuccess) {
              const user = await AuthService.getCurrentUser();
              const session = AuthService.getCurrentSession();
              
              if (user && session) {
                dispatch({
                  type: 'LOGIN_SUCCESS',
                  payload: { user, session }
                });
              }
            } else {
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!state.isAuthenticated || !state.session) return;

    const refreshInterval = setInterval(async () => {
      try {
        const newSession = await AuthService.refreshToken(state.session?.refreshToken || '');
        if (newSession) {
          dispatch({ type: 'REFRESH_TOKEN', payload: newSession });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        dispatch({ type: 'LOGOUT' });
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, state.session]);

  // Actions
  const actions: AuthActions = {
    async login(credentials: LoginCredentials): Promise<boolean> {
      dispatch({ type: 'LOGIN_START' });

      try {
        const result = await AuthService.login(credentials);

        if (result && result.user && result.session) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.user,
              session: result.session
            }
          });
          return true;
        } else {
          dispatch({
            type: 'LOGIN_ERROR',
            payload: 'Error de autenticación'
          });
          return false;
        }
      } catch (error) {
        dispatch({
          type: 'LOGIN_ERROR',
          payload: error instanceof Error ? error.message : 'Error interno'
        });
        return false;
      }
    },

    async logout(): Promise<void> {
      await AuthService.logout();
      dispatch({ type: 'LOGOUT' });
    },

    async refreshToken(): Promise<void> {
      try {
        const newSession = await AuthService.refreshToken(state.session?.refreshToken || '');
        if (newSession) {
          dispatch({ type: 'REFRESH_TOKEN', payload: newSession });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        dispatch({ type: 'LOGOUT' });
      }
    },

    clearError(): void {
      dispatch({ type: 'CLEAR_ERROR' });
    },

    hasPermission(resource: string, action: string): boolean {
      return AuthService.hasPermission({ resource, action }, state.user || undefined);
    },

    canAccess(resource: string, action: string = 'read'): boolean {
      return AuthService.canAccess(resource, action);
    },

    async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<void> {
      if (!state.user) return;

      try {
        const updatedUser = await AuthService.updateUser(state.user.id, {
          preferences: {
            ...state.user.preferences,
            ...preferences
          }
        });

        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
      }
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    actions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

// Hook para verificar permisos
export function usePermissions() {
  const { actions } = useAuth();
  return {
    hasPermission: actions.hasPermission,
    canAccess: actions.canAccess
  };
}

// Hook para obtener información del usuario
export function useUser() {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
}

// HOC para proteger rutas
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
            <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// HOC para verificar permisos específicos
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: { resource: string; action: string }
) {
  return withAuth(function PermissionProtectedComponent(props: P) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta funcionalidad.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  });
}