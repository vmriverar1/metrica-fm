/**
 * Sistema de Configuración Global
 * URL: http://localhost:9002/admin/settings
 * 
 * Sistema consolidado para gestionar todas las configuraciones del sistema,
 * desde configuraciones generales hasta integraciones y seguridad.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast-simple';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Globe,
  Shield,
  Mail,
  Database,
  Zap,
  Palette,
  Bell,
  Upload,
  Monitor,
  Cloud,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsData {
  general: any;
  authentication: any;
  email: any;
  database: any;
  security: any;
  features: any;
  analytics: any;
  integrations: any;
  performance: any;
  notifications_settings: any;
  content: any;
  ui_preferences: any;
  system: any;
  backup: any;
}

const SETTINGS_CATEGORIES = [
  {
    id: 'general',
    name: 'General',
    description: 'Configuraciones básicas del sitio',
    icon: Globe,
    color: 'blue'
  },
  {
    id: 'authentication',
    name: 'Autenticación',
    description: 'Seguridad y políticas de contraseñas',
    icon: Shield,
    color: 'red'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'SMTP y configuraciones de correo',
    icon: Mail,
    color: 'green'
  },
  {
    id: 'notifications_settings',
    name: 'Notificaciones',
    description: 'Configuración de notificaciones del sistema',
    icon: Bell,
    color: 'yellow'
  },
  {
    id: 'database',
    name: 'Base de Datos',
    description: 'Backups y mantenimiento',
    icon: Database,
    color: 'purple'
  },
  {
    id: 'security',
    name: 'Seguridad',
    description: 'SSL, CORS y políticas de seguridad',
    icon: Shield,
    color: 'red'
  },
  {
    id: 'features',
    name: 'Características',
    description: 'Habilitar/deshabilitar funcionalidades',
    icon: Zap,
    color: 'orange'
  },
  {
    id: 'ui_preferences',
    name: 'Interfaz',
    description: 'Temas, colores y preferencias visuales',
    icon: Palette,
    color: 'pink'
  },
  {
    id: 'performance',
    name: 'Rendimiento',
    description: 'Cache, optimizaciones y CDN',
    icon: Zap,
    color: 'indigo'
  },
  {
    id: 'integrations',
    name: 'Integraciones',
    description: 'APIs externas y redes sociales',
    icon: Cloud,
    color: 'cyan'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Google Analytics y métricas',
    icon: Monitor,
    color: 'teal'
  },
  {
    id: 'backup',
    name: 'Respaldos',
    description: 'Configuración de backups automáticos',
    icon: Upload,
    color: 'gray'
  }
];

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Error al cargar configuraciones');
      }
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando configuraciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingChange = (category: string, key: string, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof SettingsData],
        [key]: value
      }
    };
    setSettings(newSettings);
    setUnsavedChanges(true);
  };

  const handleNestedSettingChange = (category: string, parentKey: string, childKey: string, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof SettingsData],
        [parentKey]: {
          ...settings[category as keyof SettingsData][parentKey],
          [childKey]: value
        }
      }
    };
    setSettings(newSettings);
    setUnsavedChanges(true);
  };

  const saveSettings = useCallback(async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Error al guardar configuraciones');
      }

      setUnsavedChanges(false);
      setError(null);
      
      // Toast notification
      console.log('Toast: Configuraciones guardadas correctamente');
    } catch (err) {
      console.error('Error guardando configuraciones:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const resetCategory = useCallback(async () => {
    await loadSettings();
    setUnsavedChanges(false);
  }, [loadSettings]);

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderFormField = (category: string, key: string, value: any, label: string, type = 'text', options?: string[]) => {
    const fieldKey = `${category}-${key}`;
    const isPassword = type === 'password';
    const showPassword = showPasswords[fieldKey];

    if (type === 'boolean') {
      return (
        <div key={fieldKey} className="flex items-center justify-between py-3 border-b">
          <div>
            <label className="text-sm font-medium text-gray-900">{label}</label>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(category, key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <div key={fieldKey} className="py-3 border-b">
          <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
          <select
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div key={fieldKey} className="py-3 border-b">
          <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    }

    return (
      <div key={fieldKey} className="py-3 border-b">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
        <div className="relative">
          <input
            type={isPassword && !showPassword ? 'password' : type}
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={isPassword ? '••••••••' : ''}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility(fieldKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCategoryContent = (category: string) => {
    if (!settings) return null;

    const categoryData = settings[category as keyof SettingsData];
    if (!categoryData) return null;

    switch (category) {
      case 'general':
        return (
          <div>
            {renderFormField(category, 'site_name', categoryData.site_name, 'Nombre del Sitio')}
            {renderFormField(category, 'site_description', categoryData.site_description, 'Descripción', 'textarea')}
            {renderFormField(category, 'site_url', categoryData.site_url, 'URL del Sitio')}
            {renderFormField(category, 'admin_email', categoryData.admin_email, 'Email del Administrador')}
            {renderFormField(category, 'contact_email', categoryData.contact_email, 'Email de Contacto')}
            {renderFormField(category, 'phone', categoryData.phone, 'Teléfono')}
            {renderFormField(category, 'address', categoryData.address, 'Dirección', 'textarea')}
            {renderFormField(category, 'timezone', categoryData.timezone, 'Zona Horaria')}
            {renderFormField(category, 'language', categoryData.language, 'Idioma', 'select', ['es', 'en'])}
            {renderFormField(category, 'maintenance_mode', categoryData.maintenance_mode, 'Modo Mantenimiento', 'boolean')}
          </div>
        );

      case 'authentication':
        return (
          <div>
            {renderFormField(category, 'session_timeout', categoryData.session_timeout, 'Timeout de Sesión (horas)', 'number')}
            {renderFormField(category, 'max_login_attempts', categoryData.max_login_attempts, 'Máx. Intentos de Login', 'number')}
            {renderFormField(category, 'lockout_duration', categoryData.lockout_duration, 'Duración de Bloqueo (min)', 'number')}
            {renderFormField(category, 'require_2fa', categoryData.require_2fa, 'Requerir 2FA', 'boolean')}
            {renderFormField(category, 'password_min_length', categoryData.password_min_length, 'Longitud Mínima Contraseña', 'number')}
            {renderFormField(category, 'password_require_uppercase', categoryData.password_require_uppercase, 'Requerir Mayúsculas', 'boolean')}
            {renderFormField(category, 'password_require_lowercase', categoryData.password_require_lowercase, 'Requerir Minúsculas', 'boolean')}
            {renderFormField(category, 'password_require_numbers', categoryData.password_require_numbers, 'Requerir Números', 'boolean')}
            {renderFormField(category, 'password_require_symbols', categoryData.password_require_symbols, 'Requerir Símbolos', 'boolean')}
            {renderFormField(category, 'password_expiry_days', categoryData.password_expiry_days, 'Expiración Contraseña (días)', 'number')}
          </div>
        );

      case 'email':
        return (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4 pt-4">Configuración SMTP</h4>
            {renderFormField(category, 'smtp_host', categoryData.smtp_host, 'Servidor SMTP')}
            {renderFormField(category, 'smtp_port', categoryData.smtp_port, 'Puerto SMTP', 'number')}
            {renderFormField(category, 'smtp_secure', categoryData.smtp_secure, 'SSL/TLS Habilitado', 'boolean')}
            {renderFormField(category, 'smtp_username', categoryData.smtp_username, 'Usuario SMTP')}
            {renderFormField(category, 'smtp_password', categoryData.smtp_password, 'Contraseña SMTP', 'password')}
            {renderFormField(category, 'from_email', categoryData.from_email, 'Email Remitente')}
            {renderFormField(category, 'from_name', categoryData.from_name, 'Nombre Remitente')}
            
            <h4 className="text-md font-semibold text-gray-900 mb-4 pt-6">Newsletter</h4>
            {renderFormField(category, 'newsletter', categoryData.newsletter?.enabled, 'Newsletter Habilitado', 'boolean')}
            {renderFormField(category, 'newsletter', categoryData.newsletter?.send_welcome_email, 'Email de Bienvenida', 'boolean')}
            {renderFormField(category, 'newsletter', categoryData.newsletter?.send_confirmation_email, 'Email de Confirmación', 'boolean')}
          </div>
        );

      case 'features':
        return (
          <div>
            {Object.entries(categoryData).map(([key, value]) => 
              renderFormField(category, key, value, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 'boolean')
            )}
          </div>
        );

      case 'notifications_settings':
        return (
          <div>
            {renderFormField(category, 'max_notifications', categoryData.max_notifications, 'Máximo de Notificaciones', 'number')}
            {renderFormField(category, 'auto_mark_read_after_days', categoryData.auto_mark_read_after_days, 'Auto-marcar como leídas (días)', 'number')}
            {renderFormField(category, 'admin_email_alerts', categoryData.admin_email_alerts, 'Alertas por Email', 'boolean')}
            {renderFormField(category, 'real_time_notifications', categoryData.real_time_notifications, 'Notificaciones en Tiempo Real', 'boolean')}
            
            <h4 className="text-md font-semibold text-gray-900 mb-4 pt-6">Tipos Habilitados</h4>
            {Object.entries(categoryData.enabled_types || {}).map(([key, value]) => 
              <div key={key} className="flex items-center justify-between py-3 border-b">
                <div>
                  <label className="text-sm font-medium text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => handleNestedSettingChange(category, 'enabled_types', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>
        );

      case 'ui_preferences':
        return (
          <div>
            {renderFormField(category, 'theme', categoryData.theme, 'Tema', 'select', ['light', 'dark', 'auto'])}
            {renderFormField(category, 'primary_color', categoryData.primary_color, 'Color Primario', 'color')}
            {renderFormField(category, 'secondary_color', categoryData.secondary_color, 'Color Secundario', 'color')}
            {renderFormField(category, 'font_family', categoryData.font_family, 'Fuente')}
            {renderFormField(category, 'sidebar_collapsed', categoryData.sidebar_collapsed, 'Sidebar Colapsado', 'boolean')}
            {renderFormField(category, 'show_breadcrumbs', categoryData.show_breadcrumbs, 'Mostrar Breadcrumbs', 'boolean')}
            {renderFormField(category, 'items_per_page', categoryData.items_per_page, 'Items por Página', 'number')}
            {renderFormField(category, 'date_format', categoryData.date_format, 'Formato de Fecha')}
            {renderFormField(category, 'time_format', categoryData.time_format, 'Formato de Hora', 'select', ['12h', '24h'])}
          </div>
        );

      default:
        return (
          <div>
            {Object.entries(categoryData).map(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className="py-4 border-b">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    {Object.entries(value).map(([subKey, subValue]) => 
                      renderFormField(category, `${key}.${subKey}`, subValue, subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                    )}
                  </div>
                );
              }
              return renderFormField(category, key, value, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), typeof value === 'boolean' ? 'boolean' : 'text');
            })}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Configuración" description="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Configuración" description="Error al cargar datos">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadSettings}>Reintentar</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Configuración del Sistema" 
      description="Gestiona todas las configuraciones de la aplicación"
      actions={
        <div className="flex space-x-2">
          {unsavedChanges && (
            <Button
              onClick={resetCategory}
              variant="outline"
              size="sm"
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetear
            </Button>
          )}
          <Button
            onClick={saveSettings}
            disabled={!unsavedChanges || saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
            </div>
            <div className="p-2">
              {SETTINGS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-gray-500">{cat.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido de la categoría activa */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {SETTINGS_CATEGORIES.find(cat => cat.id === activeCategory)?.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {SETTINGS_CATEGORIES.find(cat => cat.id === activeCategory)?.description}
                  </p>
                </div>
                {unsavedChanges && (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Cambios sin guardar</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {renderCategoryContent(activeCategory)}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default SettingsPage;