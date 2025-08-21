/**
 * PermissionsManager - Sistema de control de acceso basado en roles (RBAC)
 * 
 * Características:
 * - Control granular de permisos por recurso y acción
 * - Roles jerárquicos con herencia de permisos
 * - Permisos contextuales (ej: "editar solo mis artículos")
 * - Auditoría de accesos
 * - Caché de permisos para performance
 * - Configuración basada en JSON
 */

import { fileManager } from '../core/file-manager';
import { logger } from '../core/logger';
import { UserRole, User } from './auth-manager';

// Tipos
export type Permission = 'read' | 'write' | 'delete' | 'admin';
export type Resource = 'pages' | 'portfolio' | 'careers' | 'newsletter' | 'users' | 'settings' | 'media' | 'backups';

export interface PermissionRule {
  resource: Resource;
  action: Permission;
  conditions?: PermissionCondition[];
  description?: string;
}

export interface PermissionCondition {
  type: 'owner' | 'role' | 'status' | 'custom';
  value?: any;
  field?: string;
  operator?: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater' | 'less';
}

export interface RoleDefinition {
  name: UserRole;
  description: string;
  inherits?: UserRole[];
  permissions: PermissionRule[];
  restrictions?: {
    max_items?: number;
    allowed_fields?: string[];
    forbidden_fields?: string[];
    conditions?: PermissionCondition[];
  };
}

export interface PermissionMatrix {
  roles: Record<UserRole, RoleDefinition>;
  resources: Record<Resource, {
    name: string;
    description: string;
    actions: Record<Permission, string>;
  }>;
  version: string;
  updated_at: string;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
  inherited_from?: UserRole;
}

export interface PermissionContext {
  user: User;
  resource: Resource;
  action: Permission;
  targetData?: any;
  resourceId?: string;
  extraContext?: Record<string, any>;
}

export interface AccessLog {
  timestamp: string;
  user_id: string;
  user_email: string;
  resource: Resource;
  action: Permission;
  resource_id?: string;
  allowed: boolean;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * PermissionsManager - Gestor principal de permisos
 */
export class PermissionsManager {
  private permissionMatrix: PermissionMatrix | null = null;
  private permissionCache: Map<string, { result: PermissionCheck; expires: number }> = new Map();
  private accessLogs: AccessLog[] = [];
  private matrixFile = 'data/permissions.json';
  private accessLogsFile = 'data/access-logs.json';
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.initializePermissions();
  }

  /**
   * Inicializar sistema de permisos
   */
  private async initializePermissions(): Promise<void> {
    try {
      await this.loadPermissionMatrix();
      await this.loadAccessLogs();
      this.startCacheCleanup();
      
      await logger.info('permissions', 'PermissionsManager initialized successfully', {
        rolesCount: this.permissionMatrix ? Object.keys(this.permissionMatrix.roles).length : 0,
        resourcesCount: this.permissionMatrix ? Object.keys(this.permissionMatrix.resources).length : 0
      });
      
    } catch (error) {
      await logger.error('permissions', 'Failed to initialize PermissionsManager', error);
      throw error;
    }
  }

  /**
   * Cargar matriz de permisos desde archivo JSON
   */
  private async loadPermissionMatrix(): Promise<void> {
    try {
      if (await fileManager.exists(this.matrixFile)) {
        const data = await fileManager.readJSON<PermissionMatrix>(this.matrixFile);
        this.permissionMatrix = data.data;
      } else {
        // Crear matriz por defecto
        await this.createDefaultPermissionMatrix();
      }
    } catch (error) {
      await logger.warn('permissions', 'Could not load permission matrix, using defaults', { 
        error: error.message 
      });
      await this.createDefaultPermissionMatrix();
    }
  }

  /**
   * Crear matriz de permisos por defecto
   */
  private async createDefaultPermissionMatrix(): Promise<void> {
    const defaultMatrix: PermissionMatrix = {
      roles: {
        admin: {
          name: 'admin',
          description: 'Administrador con acceso completo',
          permissions: [
            { resource: 'pages', action: 'admin', description: 'Control total de páginas' },
            { resource: 'portfolio', action: 'admin', description: 'Control total del portfolio' },
            { resource: 'careers', action: 'admin', description: 'Control total de empleos' },
            { resource: 'newsletter', action: 'admin', description: 'Control total del newsletter' },
            { resource: 'users', action: 'admin', description: 'Gestión de usuarios' },
            { resource: 'settings', action: 'admin', description: 'Configuración del sistema' },
            { resource: 'media', action: 'admin', description: 'Gestión de medios' },
            { resource: 'backups', action: 'admin', description: 'Gestión de backups' }
          ]
        },
        editor: {
          name: 'editor',
          description: 'Editor de contenido',
          permissions: [
            { resource: 'pages', action: 'write', description: 'Editar páginas' },
            { resource: 'portfolio', action: 'write', description: 'Editar portfolio' },
            { resource: 'careers', action: 'write', description: 'Editar empleos' },
            { resource: 'newsletter', action: 'write', description: 'Editar newsletter' },
            { resource: 'media', action: 'write', description: 'Subir y gestionar medios' },
            { resource: 'users', action: 'read', description: 'Ver información de usuarios' },
            { resource: 'settings', action: 'read', description: 'Ver configuración' }
          ],
          restrictions: {
            forbidden_fields: ['created_at', 'created_by', 'system_metadata'],
            conditions: [
              { type: 'status', field: 'status', operator: 'not_equals', value: 'system' }
            ]
          }
        },
        viewer: {
          name: 'viewer',
          description: 'Solo lectura',
          permissions: [
            { resource: 'pages', action: 'read', description: 'Ver páginas' },
            { resource: 'portfolio', action: 'read', description: 'Ver portfolio' },
            { resource: 'careers', action: 'read', description: 'Ver empleos' },
            { resource: 'newsletter', action: 'read', description: 'Ver newsletter' },
            { resource: 'media', action: 'read', description: 'Ver medios' }
          ],
          restrictions: {
            max_items: 100,
            forbidden_fields: ['email', 'internal_notes', 'system_metadata']
          }
        }
      },
      resources: {
        pages: {
          name: 'Páginas',
          description: 'Páginas estáticas del sitio',
          actions: {
            read: 'Ver contenido de páginas',
            write: 'Editar páginas existentes',
            delete: 'Eliminar páginas (no aplicable)',
            admin: 'Control total de páginas'
          }
        },
        portfolio: {
          name: 'Portfolio',
          description: 'Proyectos y categorías del portfolio',
          actions: {
            read: 'Ver proyectos y categorías',
            write: 'Crear y editar proyectos',
            delete: 'Eliminar proyectos y categorías',
            admin: 'Control total del portfolio'
          }
        },
        careers: {
          name: 'Empleos',
          description: 'Ofertas de trabajo y departamentos',
          actions: {
            read: 'Ver ofertas de trabajo',
            write: 'Crear y editar ofertas',
            delete: 'Eliminar ofertas',
            admin: 'Control total de empleos'
          }
        },
        newsletter: {
          name: 'Newsletter',
          description: 'Artículos, autores y categorías del blog',
          actions: {
            read: 'Ver artículos y contenido',
            write: 'Crear y editar artículos',
            delete: 'Eliminar artículos',
            admin: 'Control total del newsletter'
          }
        },
        users: {
          name: 'Usuarios',
          description: 'Gestión de usuarios y roles',
          actions: {
            read: 'Ver información de usuarios',
            write: 'Editar usuarios y asignar roles',
            delete: 'Eliminar usuarios',
            admin: 'Control total de usuarios'
          }
        },
        settings: {
          name: 'Configuración',
          description: 'Configuración del sistema',
          actions: {
            read: 'Ver configuración',
            write: 'Modificar configuración',
            delete: 'Resetear configuración',
            admin: 'Control total de configuración'
          }
        },
        media: {
          name: 'Medios',
          description: 'Archivos multimedia',
          actions: {
            read: 'Ver archivos',
            write: 'Subir y editar archivos',
            delete: 'Eliminar archivos',
            admin: 'Control total de medios'
          }
        },
        backups: {
          name: 'Backups',
          description: 'Copias de seguridad',
          actions: {
            read: 'Ver backups',
            write: 'Crear backups',
            delete: 'Eliminar backups',
            admin: 'Control total de backups'
          }
        }
      },
      version: '1.0.0',
      updated_at: new Date().toISOString()
    };

    this.permissionMatrix = defaultMatrix;
    await this.savePermissionMatrix();

    await logger.info('permissions', 'Created default permission matrix', {
      rolesCount: Object.keys(defaultMatrix.roles).length,
      resourcesCount: Object.keys(defaultMatrix.resources).length
    });
  }

  /**
   * Guardar matriz de permisos
   */
  private async savePermissionMatrix(): Promise<void> {
    if (!this.permissionMatrix) return;
    
    this.permissionMatrix.updated_at = new Date().toISOString();
    await fileManager.writeJSON(this.matrixFile, this.permissionMatrix, {
      createBackup: true,
      ensureDirectory: true
    });
  }

  /**
   * Cargar logs de acceso
   */
  private async loadAccessLogs(): Promise<void> {
    try {
      if (await fileManager.exists(this.accessLogsFile)) {
        const data = await fileManager.readJSON<{ logs: AccessLog[] }>(this.accessLogsFile);
        this.accessLogs = data.data.logs || [];
        
        // Mantener solo logs de los últimos 30 días
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.accessLogs = this.accessLogs.filter(log => 
          new Date(log.timestamp) > cutoff
        );
      }
    } catch (error) {
      await logger.warn('permissions', 'Could not load access logs', { error: error.message });
      this.accessLogs = [];
    }
  }

  /**
   * Guardar logs de acceso
   */
  private async saveAccessLogs(): Promise<void> {
    await fileManager.writeJSON(this.accessLogsFile, { logs: this.accessLogs }, {
      ensureDirectory: true
    });
  }

  /**
   * Iniciar limpieza de caché
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.permissionCache.entries()) {
        if (value.expires < now) {
          this.permissionCache.delete(key);
        }
      }
    }, 60 * 1000); // Cada minuto
  }

  /**
   * Generar clave de caché para permisos
   */
  private getCacheKey(context: PermissionContext): string {
    return `${context.user.id}:${context.resource}:${context.action}:${context.resourceId || 'global'}`;
  }

  /**
   * Verificar permiso principal
   */
  async checkPermission(context: PermissionContext): Promise<PermissionCheck> {
    try {
      // Verificar caché primero
      const cacheKey = this.getCacheKey(context);
      const cached = this.permissionCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.result;
      }

      // Verificar permiso
      const result = await this.evaluatePermission(context);
      
      // Cachear resultado
      this.permissionCache.set(cacheKey, {
        result,
        expires: Date.now() + this.cacheTimeout
      });

      // Registrar acceso
      await this.logAccess(context, result);

      return result;

    } catch (error) {
      await logger.error('permissions', 'Failed to check permission', error, {
        userId: context.user.id,
        resource: context.resource,
        action: context.action
      });

      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Evaluar permiso
   */
  private async evaluatePermission(context: PermissionContext): Promise<PermissionCheck> {
    if (!this.permissionMatrix) {
      return { allowed: false, reason: 'Permission matrix not loaded' };
    }

    const { user, resource, action } = context;
    
    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      return { allowed: false, reason: 'User account is not active' };
    }

    // Obtener definición del rol
    const roleDefinition = this.permissionMatrix.roles[user.role];
    if (!roleDefinition) {
      return { allowed: false, reason: 'User role not found' };
    }

    // Verificar permisos directos del rol
    const directPermission = this.checkDirectPermission(roleDefinition, resource, action);
    if (directPermission.allowed) {
      return directPermission;
    }

    // Verificar permisos heredados
    if (roleDefinition.inherits) {
      for (const inheritedRole of roleDefinition.inherits) {
        const inheritedRoleDefinition = this.permissionMatrix.roles[inheritedRole];
        if (inheritedRoleDefinition) {
          const inheritedPermission = this.checkDirectPermission(inheritedRoleDefinition, resource, action);
          if (inheritedPermission.allowed) {
            return {
              ...inheritedPermission,
              inherited_from: inheritedRole
            };
          }
        }
      }
    }

    return { allowed: false, reason: 'Permission not granted' };
  }

  /**
   * Verificar permiso directo en rol
   */
  private checkDirectPermission(
    roleDefinition: RoleDefinition, 
    resource: Resource, 
    action: Permission
  ): PermissionCheck {
    // Buscar regla de permiso específica
    const permission = roleDefinition.permissions.find(p => 
      p.resource === resource && (p.action === action || p.action === 'admin')
    );

    if (!permission) {
      return { allowed: false, reason: 'Permission rule not found' };
    }

    // Si es permiso de admin, permitir todas las acciones
    if (permission.action === 'admin') {
      return { allowed: true, reason: 'Admin permission granted' };
    }

    // Verificar jerarquía de permisos
    const actionHierarchy: Permission[] = ['read', 'write', 'delete', 'admin'];
    const requiredLevel = actionHierarchy.indexOf(action);
    const grantedLevel = actionHierarchy.indexOf(permission.action);

    if (grantedLevel >= requiredLevel) {
      return { 
        allowed: true, 
        reason: `Permission granted: ${permission.action}`,
        conditions: permission.conditions
      };
    }

    return { 
      allowed: false, 
      reason: `Insufficient permission level: required ${action}, granted ${permission.action}` 
    };
  }

  /**
   * Verificar condiciones contextuales
   */
  async checkConditions(
    context: PermissionContext, 
    conditions: PermissionCondition[]
  ): Promise<PermissionCheck> {
    for (const condition of conditions) {
      const conditionResult = await this.evaluateCondition(context, condition);
      if (!conditionResult.allowed) {
        return conditionResult;
      }
    }

    return { allowed: true, reason: 'All conditions satisfied' };
  }

  /**
   * Evaluar condición específica
   */
  private async evaluateCondition(
    context: PermissionContext, 
    condition: PermissionCondition
  ): Promise<PermissionCheck> {
    const { user, targetData } = context;

    switch (condition.type) {
      case 'owner':
        // Verificar si el usuario es propietario del recurso
        if (!targetData) {
          return { allowed: false, reason: 'Cannot verify ownership: no target data' };
        }
        
        const ownerField = condition.field || 'created_by';
        const isOwner = targetData[ownerField] === user.id || targetData[ownerField] === user.email;
        
        return {
          allowed: isOwner,
          reason: isOwner ? 'User is owner' : 'User is not owner'
        };

      case 'role':
        // Verificar rol específico
        const hasRole = condition.value === user.role;
        return {
          allowed: hasRole,
          reason: hasRole ? 'Role matches' : `Role mismatch: required ${condition.value}, user has ${user.role}`
        };

      case 'status':
        // Verificar estado del recurso
        if (!targetData || !condition.field) {
          return { allowed: false, reason: 'Cannot verify status: missing data or field' };
        }
        
        const fieldValue = targetData[condition.field];
        const operator = condition.operator || 'equals';
        const conditionValue = condition.value;
        
        let statusMatches = false;
        switch (operator) {
          case 'equals':
            statusMatches = fieldValue === conditionValue;
            break;
          case 'not_equals':
            statusMatches = fieldValue !== conditionValue;
            break;
          case 'in':
            statusMatches = Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            break;
          case 'not_in':
            statusMatches = Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            break;
        }
        
        return {
          allowed: statusMatches,
          reason: statusMatches ? 'Status condition satisfied' : `Status condition failed: ${fieldValue} ${operator} ${conditionValue}`
        };

      case 'custom':
        // Lógica personalizada - extender según necesidades
        return { allowed: true, reason: 'Custom condition not implemented' };

      default:
        return { allowed: false, reason: `Unknown condition type: ${condition.type}` };
    }
  }

  /**
   * Verificar permiso con datos de contexto
   */
  async checkPermissionWithData(
    user: User,
    resource: Resource,
    action: Permission,
    targetData?: any,
    resourceId?: string
  ): Promise<PermissionCheck> {
    const context: PermissionContext = {
      user,
      resource,
      action,
      targetData,
      resourceId
    };

    const basePermission = await this.checkPermission(context);
    if (!basePermission.allowed) {
      return basePermission;
    }

    // Verificar condiciones adicionales si existen
    if (basePermission.conditions && basePermission.conditions.length > 0) {
      return this.checkConditions(context, basePermission.conditions);
    }

    return basePermission;
  }

  /**
   * Registrar acceso
   */
  private async logAccess(context: PermissionContext, result: PermissionCheck): Promise<void> {
    const accessLog: AccessLog = {
      timestamp: new Date().toISOString(),
      user_id: context.user.id,
      user_email: context.user.email,
      resource: context.resource,
      action: context.action,
      resource_id: context.resourceId,
      allowed: result.allowed,
      reason: result.reason,
      ip_address: context.extraContext?.ip_address,
      user_agent: context.extraContext?.user_agent
    };

    this.accessLogs.push(accessLog);

    // Guardar logs periódicamente
    if (this.accessLogs.length % 100 === 0) {
      await this.saveAccessLogs();
    }

    // Log crítico para accesos denegados
    if (!result.allowed) {
      await logger.warn('permissions', 'Access denied', {
        userId: context.user.id,
        resource: context.resource,
        action: context.action,
        reason: result.reason
      });
    }
  }

  /**
   * Obtener permisos de un usuario
   */
  getUserPermissions(user: User): PermissionRule[] {
    if (!this.permissionMatrix) return [];
    
    const roleDefinition = this.permissionMatrix.roles[user.role];
    if (!roleDefinition) return [];
    
    let permissions = [...roleDefinition.permissions];
    
    // Agregar permisos heredados
    if (roleDefinition.inherits) {
      for (const inheritedRole of roleDefinition.inherits) {
        const inheritedRoleDefinition = this.permissionMatrix.roles[inheritedRole];
        if (inheritedRoleDefinition) {
          permissions.push(...inheritedRoleDefinition.permissions);
        }
      }
    }
    
    return permissions;
  }

  /**
   * Obtener recursos disponibles
   */
  getAvailableResources(): Record<Resource, any> {
    return this.permissionMatrix?.resources || {};
  }

  /**
   * Obtener definiciones de roles
   */
  getRoleDefinitions(): Record<UserRole, RoleDefinition> {
    return this.permissionMatrix?.roles || {};
  }

  /**
   * Obtener logs de acceso recientes
   */
  getRecentAccessLogs(limit: number = 100): AccessLog[] {
    return this.accessLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Limpiar caché de permisos
   */
  clearPermissionCache(): void {
    this.permissionCache.clear();
    logger.info('permissions', 'Permission cache cleared');
  }

  /**
   * Recargar matriz de permisos
   */
  async reloadPermissions(): Promise<void> {
    this.clearPermissionCache();
    await this.loadPermissionMatrix();
    await logger.info('permissions', 'Permission matrix reloaded');
  }
}

// Instancia singleton del permissions manager
export const permissionsManager = new PermissionsManager();