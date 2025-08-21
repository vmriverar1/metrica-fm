'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Database, 
  Shield, 
  Globe, 
  Palette, 
  Bell,
  Server,
  Mail,
  Eye,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  security: {
    enableRateLimit: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireStrongPasswords: boolean;
    enableTwoFactor: boolean;
    allowedOrigins: string;
    enableCORS: boolean;
  };
  performance: {
    enableCaching: boolean;
    cacheTimeout: number;
    enableCompression: boolean;
    maxUploadSize: number;
    enableCDN: boolean;
    cdnUrl: string;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSystemAlerts: boolean;
    emailProvider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
    enableCustomThemes: boolean;
    defaultTheme: string;
  };
  seo: {
    enableSEO: boolean;
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    enableSitemap: boolean;
    enableRobots: boolean;
    googleAnalyticsId: string;
  };
}

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  // Configuración por defecto
  useEffect(() => {
    const defaultSettings: SystemSettings = {
      general: {
        siteName: 'Métrica DIP',
        siteDescription: 'Dirección Integral de Proyectos - Empresa líder en gestión de proyectos en Perú',
        siteUrl: 'https://metrica-dip.com',
        adminEmail: 'admin@metrica-dip.com',
        timezone: 'America/Lima',
        language: 'es',
        maintenanceMode: false,
        debugMode: false,
      },
      security: {
        enableRateLimit: true,
        maxLoginAttempts: 3,
        sessionTimeout: 3600,
        requireStrongPasswords: true,
        enableTwoFactor: false,
        allowedOrigins: 'https://metrica-dip.com,https://www.metrica-dip.com',
        enableCORS: true,
      },
      performance: {
        enableCaching: true,
        cacheTimeout: 3600,
        enableCompression: true,
        maxUploadSize: 10,
        enableCDN: false,
        cdnUrl: '',
      },
      notifications: {
        enableEmailNotifications: true,
        enableSystemAlerts: true,
        emailProvider: 'sendgrid',
        smtpHost: 'smtp.sendgrid.net',
        smtpPort: 587,
        smtpUser: 'apikey',
        smtpPassword: '',
      },
      theme: {
        primaryColor: '#003F6F',
        secondaryColor: '#E84E0F',
        darkMode: false,
        enableCustomThemes: true,
        defaultTheme: 'metrica',
      },
      seo: {
        enableSEO: true,
        defaultMetaTitle: 'Métrica DIP - Dirección Integral de Proyectos',
        defaultMetaDescription: 'Empresa líder en dirección integral de proyectos en Perú. Especialistas en gestión de proyectos de infraestructura.',
        enableSitemap: true,
        enableRobots: true,
        googleAnalyticsId: '',
      }
    };

    setTimeout(() => {
      setSettings(defaultSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    if (settings) {
      setSettings(prev => ({
        ...prev!,
        [category]: {
          ...prev![category],
          [field]: value
        }
      }));
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente.",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer la configuración por defecto?')) {
      window.location.reload();
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F6F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Administra la configuración general del sistema y sus componentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-[#E84E0F] hover:bg-[#E84E0F]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-800">
              <Bell className="h-4 w-4" />
              <span className="text-sm">Tienes cambios sin guardar</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuración básica del sitio web y sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Sitio</label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL del Sitio</label>
                  <Input
                    value={settings.general.siteUrl}
                    onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción del Sitio</label>
                <Textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email del Administrador</label>
                  <Input
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zona Horaria</label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Lima">Lima (UTC-5)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Idioma</label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => handleSettingChange('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Modo de Mantenimiento</label>
                    <p className="text-xs text-gray-500">Activar cuando el sitio esté en mantenimiento</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Modo Debug</label>
                    <p className="text-xs text-gray-500">Mostrar información de depuración</p>
                  </div>
                  <Switch
                    checked={settings.general.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('general', 'debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Configurar políticas de seguridad y protección del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Máximo Intentos de Login</label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeout de Sesión (segundos)</label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orígenes Permitidos</label>
                  <Input
                    value={settings.security.allowedOrigins}
                    onChange={(e) => handleSettingChange('security', 'allowedOrigins', e.target.value)}
                    placeholder="Separados por comas"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar Rate Limiting</label>
                    <p className="text-xs text-gray-500">Limitar número de requests por IP</p>
                  </div>
                  <Switch
                    checked={settings.security.enableRateLimit}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableRateLimit', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Contraseñas Seguras</label>
                    <p className="text-xs text-gray-500">Requerir contraseñas complejas</p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPasswords}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireStrongPasswords', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Autenticación de Dos Factores</label>
                    <p className="text-xs text-gray-500">Habilitar 2FA para administradores</p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar CORS</label>
                    <p className="text-xs text-gray-500">Permitir requests de otros dominios</p>
                  </div>
                  <Switch
                    checked={settings.security.enableCORS}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableCORS', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configuración de Rendimiento
              </CardTitle>
              <CardDescription>
                Optimizar el rendimiento y la velocidad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeout de Cache (segundos)</label>
                  <Input
                    type="number"
                    value={settings.performance.cacheTimeout}
                    onChange={(e) => handleSettingChange('performance', 'cacheTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tamaño Máximo de Subida (MB)</label>
                  <Input
                    type="number"
                    value={settings.performance.maxUploadSize}
                    onChange={(e) => handleSettingChange('performance', 'maxUploadSize', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL del CDN</label>
                  <Input
                    value={settings.performance.cdnUrl}
                    onChange={(e) => handleSettingChange('performance', 'cdnUrl', e.target.value)}
                    placeholder="https://cdn.ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar Cache</label>
                    <p className="text-xs text-gray-500">Cachear respuestas para mejor rendimiento</p>
                  </div>
                  <Switch
                    checked={settings.performance.enableCaching}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableCaching', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar Compresión</label>
                    <p className="text-xs text-gray-500">Comprimir respuestas HTTP</p>
                  </div>
                  <Switch
                    checked={settings.performance.enableCompression}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableCompression', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar CDN</label>
                    <p className="text-xs text-gray-500">Usar CDN para recursos estáticos</p>
                  </div>
                  <Switch
                    checked={settings.performance.enableCDN}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableCDN', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Configurar el sistema de notificaciones y emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proveedor de Email</label>
                  <Select
                    value={settings.notifications.emailProvider}
                    onValueChange={(value) => handleSettingChange('notifications', 'emailProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="smtp">SMTP Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puerto SMTP</label>
                  <Input
                    type="number"
                    value={settings.notifications.smtpPort}
                    onChange={(e) => handleSettingChange('notifications', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Host SMTP</label>
                  <Input
                    value={settings.notifications.smtpHost}
                    onChange={(e) => handleSettingChange('notifications', 'smtpHost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario SMTP</label>
                  <Input
                    value={settings.notifications.smtpUser}
                    onChange={(e) => handleSettingChange('notifications', 'smtpUser', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña SMTP</label>
                <Input
                  type="password"
                  value={settings.notifications.smtpPassword}
                  onChange={(e) => handleSettingChange('notifications', 'smtpPassword', e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Notificaciones por Email</label>
                    <p className="text-xs text-gray-500">Enviar notificaciones importantes por email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableEmailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'enableEmailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Alertas del Sistema</label>
                    <p className="text-xs text-gray-500">Recibir alertas de errores y problemas</p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableSystemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'enableSystemAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configuración del Tema
              </CardTitle>
              <CardDescription>
                Personalizar la apariencia y colores del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Primario</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => handleSettingChange('theme', 'primaryColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.theme.primaryColor}
                      onChange={(e) => handleSettingChange('theme', 'primaryColor', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Secundario</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => handleSettingChange('theme', 'secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.theme.secondaryColor}
                      onChange={(e) => handleSettingChange('theme', 'secondaryColor', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tema por Defecto</label>
                  <Select
                    value={settings.theme.defaultTheme}
                    onValueChange={(value) => handleSettingChange('theme', 'defaultTheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metrica">Métrica</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Modo Oscuro</label>
                    <p className="text-xs text-gray-500">Usar tema oscuro por defecto</p>
                  </div>
                  <Switch
                    checked={settings.theme.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('theme', 'darkMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Temas Personalizados</label>
                    <p className="text-xs text-gray-500">Permitir temas personalizados</p>
                  </div>
                  <Switch
                    checked={settings.theme.enableCustomThemes}
                    onCheckedChange={(checked) => handleSettingChange('theme', 'enableCustomThemes', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración SEO
              </CardTitle>
              <CardDescription>
                Optimizar el sitio para motores de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título Meta por Defecto</label>
                <Input
                  value={settings.seo.defaultMetaTitle}
                  onChange={(e) => handleSettingChange('seo', 'defaultMetaTitle', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción Meta por Defecto</label>
                <Textarea
                  value={settings.seo.defaultMetaDescription}
                  onChange={(e) => handleSettingChange('seo', 'defaultMetaDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Google Analytics ID</label>
                <Input
                  value={settings.seo.googleAnalyticsId}
                  onChange={(e) => handleSettingChange('seo', 'googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Activar SEO</label>
                    <p className="text-xs text-gray-500">Habilitar optimizaciones SEO</p>
                  </div>
                  <Switch
                    checked={settings.seo.enableSEO}
                    onCheckedChange={(checked) => handleSettingChange('seo', 'enableSEO', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Generar Sitemap</label>
                    <p className="text-xs text-gray-500">Generar sitemap.xml automáticamente</p>
                  </div>
                  <Switch
                    checked={settings.seo.enableSitemap}
                    onCheckedChange={(checked) => handleSettingChange('seo', 'enableSitemap', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Generar Robots.txt</label>
                    <p className="text-xs text-gray-500">Generar robots.txt automáticamente</p>
                  </div>
                  <Switch
                    checked={settings.seo.enableRobots}
                    onCheckedChange={(checked) => handleSettingChange('seo', 'enableRobots', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsPage;