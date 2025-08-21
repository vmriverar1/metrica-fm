'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users,
  Shield,
  Key,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Globe,
  Building,
  Mail,
  Phone,
  MapPin,
  Activity,
  History,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Share2
} from 'lucide-react';

// Interfaces principales
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  location?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  groups: string[];
  sessionTimeout?: number;
  allowedIPs?: string[];
  metadata: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  permissions: string[];
  users: string[];
  groups: string[];
  inherit?: string[];
  restrictions: {
    ipWhitelist?: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      days: number[];
    };
    sessionTimeout?: number;
    maxSessions?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'content' | 'users' | 'analytics' | 'settings' | 'api';
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
  level: 'basic' | 'advanced' | 'admin' | 'superadmin';
  dependencies?: string[];
  isSystem: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'role' | 'custom';
  members: string[];
  permissions: string[];
  parent?: string;
  children: string[];
  settings: {
    autoJoin?: boolean;
    requiresApproval?: boolean;
    maxMembers?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'blocked';
  details?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecial: boolean;
    passwordExpiryDays?: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
    require2FA: boolean;
    sessionTimeout: number;
    maxConcurrentSessions: number;
    ipWhitelistEnabled: boolean;
    allowedDomains?: string[];
  };
  isActive: boolean;
  appliesTo: 'all' | 'role' | 'group' | 'users';
  targets?: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserPermissionsManagerProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  groups: Group[];
  accessLogs: AccessLog[];
  securityPolicies: SecurityPolicy[];
  currentUser?: User;
  onUsersChange: (users: User[]) => void;
  onRolesChange: (roles: Role[]) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
  onGroupsChange: (groups: Group[]) => void;
  onPoliciesChange: (policies: SecurityPolicy[]) => void;
  onUserCreate?: (user: Partial<User>) => Promise<User>;
  onUserUpdate?: (id: string, updates: Partial<User>) => Promise<void>;
  onUserDelete?: (id: string) => Promise<void>;
  onRoleAssign?: (userId: string, roleId: string) => Promise<void>;
  onPermissionGrant?: (userId: string, permissionId: string) => Promise<void>;
  onPermissionRevoke?: (userId: string, permissionId: string) => Promise<void>;
  readOnly?: boolean;
}

const UserPermissionsManager: React.FC<UserPermissionsManagerProps> = ({
  users,
  roles,
  permissions,
  groups,
  accessLogs,
  securityPolicies,
  currentUser,
  onUsersChange,
  onRolesChange,
  onPermissionsChange,
  onGroupsChange,
  onPoliciesChange,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onRoleAssign,
  onPermissionGrant,
  onPermissionRevoke,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissionCategory, setSelectedPermissionCategory] = useState<string>('all');
  const [bulkActions, setBulkActions] = useState(false);

  // Filtros y búsqueda
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, filterStatus, filterRole]);

  const filteredPermissions = useMemo(() => {
    if (selectedPermissionCategory === 'all') return permissions;
    return permissions.filter(permission => permission.category === selectedPermissionCategory);
  }, [permissions, selectedPermissionCategory]);

  const recentAccessLogs = useMemo(() => {
    return accessLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [accessLogs]);

  // Handlers
  const handleUserSelection = useCallback((userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  }, []);

  const handleBulkStatusChange = useCallback(async (status: User['status']) => {
    if (!onUserUpdate || readOnly) return;
    
    try {
      for (const userId of selectedUsers) {
        await onUserUpdate(userId, { status });
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [selectedUsers, onUserUpdate, readOnly]);

  const handleRoleAssignment = useCallback(async (userId: string, roleId: string) => {
    if (!onRoleAssign || readOnly) return;
    
    try {
      await onRoleAssign(userId, roleId);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  }, [onRoleAssign, readOnly]);

  const getUserDisplayName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getPermissionsByCategory = () => {
    const categories = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    
    return categories;
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Permisos</h2>
          <p className="text-sm text-gray-600">
            Control de acceso y permisos de usuarios del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Auditoría
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowCreateUser(true)}
                disabled={readOnly}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} usuario(s) seleccionado(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange('active')}
                      disabled={readOnly}
                    >
                      Activar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange('suspended')}
                      disabled={readOnly}
                    >
                      Suspender
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkStatusChange('inactive')}
                      disabled={readOnly}
                    >
                      Desactivar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => 
                          handleUserSelection(user.id, checked as boolean)
                        }
                      />
                      
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={getUserDisplayName(user)}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                          {user.department && (
                            <Badge variant="outline" className="text-xs">
                              {user.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'active' ? 'Activo' :
                           user.status === 'inactive' ? 'Inactivo' :
                           user.status === 'suspended' ? 'Suspendido' : 'Pendiente'}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1">
                          {user.isEmailVerified && (
                            <CheckCircle className="w-3 h-3 text-green-500" title="Email verificado" />
                          )}
                          {user.is2FAEnabled && (
                            <Shield className="w-3 h-3 text-blue-500" title="2FA habilitado" />
                          )}
                        </div>
                        {user.lastLogin && (
                          <p className="text-xs text-gray-500">
                            Último: {new Date(user.lastLogin).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View user details
                            console.log('View user:', user.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay usuarios que coincidan con los filtros</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Roles del Sistema</h3>
            <Button 
              size="sm" 
              onClick={() => setShowCreateRole(true)}
              disabled={readOnly}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Nivel {role.level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Permisos ({role.permissions.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permId) => {
                        const permission = permissions.find(p => p.id === permId);
                        return permission ? (
                          <Badge key={permId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Usuarios ({role.users.length})</p>
                    <div className="flex -space-x-2">
                      {role.users.slice(0, 4).map((userId) => {
                        const user = users.find(u => u.id === userId);
                        return user ? (
                          <div 
                            key={userId}
                            className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                          >
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={getUserDisplayName(user)}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })}
                      {role.users.length > 4 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            +{role.users.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      Creado: {new Date(role.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(role)}
                        disabled={role.isSystem && readOnly}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Permisos del Sistema</h3>
              <Select value={selectedPermissionCategory} onValueChange={setSelectedPermissionCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="content">Contenido</SelectItem>
                  <SelectItem value="users">Usuarios</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="settings">Configuración</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Permiso
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{permission.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {permission.category}
                        </Badge>
                        <Badge className={getRiskLevelColor(permission.riskLevel)}>
                          {permission.riskLevel === 'low' ? 'Bajo' :
                           permission.riskLevel === 'medium' ? 'Medio' :
                           permission.riskLevel === 'high' ? 'Alto' : 'Crítico'}
                        </Badge>
                        {permission.isSystem && (
                          <Badge variant="secondary">Sistema</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Recurso: {permission.resource}</span>
                        <span>Acciones: {permission.actions.join(', ')}</span>
                        <span>Nivel: {permission.level}</span>
                      </div>
                      {permission.dependencies && permission.dependencies.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Dependencias:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {permission.dependencies.map((depId) => {
                              const dep = permissions.find(p => p.id === depId);
                              return dep ? (
                                <Badge key={depId} variant="outline" className="text-xs">
                                  {dep.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-gray-500">
                        {roles.filter(r => r.permissions.includes(permission.id)).length} roles
                      </span>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Grupos de Usuarios</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {group.type === 'department' ? 'Departamento' :
                       group.type === 'project' ? 'Proyecto' :
                       group.type === 'role' ? 'Rol' : 'Personalizado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Miembros ({group.members.length})
                      {group.settings.maxMembers && ` / ${group.settings.maxMembers}`}
                    </p>
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map((userId) => {
                        const user = users.find(u => u.id === userId);
                        return user ? (
                          <div 
                            key={userId}
                            className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                            title={getUserDisplayName(user)}
                          >
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={getUserDisplayName(user)}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })}
                      {group.members.length > 5 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            +{group.members.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Permisos ({group.permissions.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.slice(0, 3).map((permId) => {
                        const permission = permissions.find(p => p.id === permId);
                        return permission ? (
                          <Badge key={permId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {group.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {group.settings.autoJoin && (
                        <Badge variant="outline" className="text-xs">Auto-join</Badge>
                      )}
                      {group.settings.requiresApproval && (
                        <Badge variant="outline" className="text-xs">Requiere aprobación</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Logs de Acceso</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentAccessLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(log.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.userEmail}</span>
                          <Badge variant={log.result === 'success' ? 'default' : 
                                         log.result === 'failure' ? 'destructive' : 'secondary'}>
                            {log.result === 'success' ? 'Éxito' :
                             log.result === 'failure' ? 'Error' : 'Bloqueado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {log.action} en {log.resource}
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-500">{log.details}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-xs">{log.ipAddress}</p>
                      {log.location && (
                        <p className="text-xs">{log.location.city}, {log.location.country}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Políticas de Seguridad</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Política
            </Button>
          </div>

          <div className="space-y-6">
            {securityPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{policy.name}</CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Badge variant="outline">
                        {policy.appliesTo === 'all' ? 'Todos' :
                         policy.appliesTo === 'role' ? 'Por rol' :
                         policy.appliesTo === 'group' ? 'Por grupo' : 'Usuarios específicos'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Contraseña mínima:</span>
                      <p>{policy.rules.passwordMinLength} caracteres</p>
                    </div>
                    <div>
                      <span className="font-medium">Intentos máx:</span>
                      <p>{policy.rules.maxFailedAttempts}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timeout sesión:</span>
                      <p>{policy.rules.sessionTimeout} min</p>
                    </div>
                    <div>
                      <span className="font-medium">2FA requerido:</span>
                      <p>{policy.rules.require2FA ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      Actualizada: {new Date(policy.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled={readOnly}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPermissionsManager;