'use client';

import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Download, 
  Upload, 
  RotateCcw, 
  Calendar, 
  Clock, 
  HardDrive, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Play, 
  Pause,
  FileText,
  FolderOpen,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { useBackupSystem } from '@/hooks/useBackupSystem';

interface BackupManagerProps {
  resource: string;
  data?: any;
  onRestore?: (backupData: any) => void;
  className?: string;
}

interface BackupEntry {
  id: string;
  resource: string;
  filename: string;
  size: number;
  compressed: boolean;
  timestamp: Date;
  type: 'manual' | 'scheduled' | 'auto';
  description?: string;
  metadata: {
    version: string;
    userAgent: string;
    changes?: number;
    author?: string;
  };
}

const BackupManager: React.FC<BackupManagerProps> = ({
  resource,
  data,
  onRestore,
  className = ''
}) => {
  // const {
  //   backups,
  //   config,
  //   isScheduleActive,
  //   lastBackup,
  //   nextBackup,
  //   storageUsed,
  //   storageLimit,
  //   createBackup,
  //   restoreBackup,
  //   deleteBackup,
  //   updateConfig,
  //   startSchedule,
  //   stopSchedule,
  //   cleanupOldBackups,
  //   exportBackup,
  //   importBackup
  // } = useBackupSystem(resource);

  // Mock data for build
  const backups: any[] = [];
  const config = {};
  const isScheduleActive = false;
  const lastBackup = null;
  const nextBackup = null;
  const storageUsed = 0;
  const storageLimit = 100;
  const createBackup = () => {};
  const restoreBackup = () => {};
  const deleteBackup = () => {};
  const updateConfig = () => {};
  const startSchedule = () => {};
  const stopSchedule = () => {};
  const cleanupOldBackups = () => {};
  const exportBackup = () => {};
  const importBackup = () => {};

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupEntry | null>(null);
  const [backupDescription, setBackupDescription] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await createBackup(data, {
        type: 'manual',
        description: backupDescription || undefined
      });
      setBackupDescription('');
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupEntry) => {
    if (!onRestore) return;
    
    setIsRestoring(true);
    try {
      const backupData = await restoreBackup(backup.id);
      onRestore(backupData);
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm('¿Estás seguro de eliminar este backup? Esta acción no se puede deshacer.')) {
      await deleteBackup(backupId);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'auto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Backup & Restore</h3>
          <p className="text-sm text-gray-600">Gestiona backups automáticos y restauración</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          {isScheduleActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSchedule}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startSchedule}
            >
              <Play className="w-4 h-4 mr-2" />
              Activar
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Archive className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{backups.length}</p>
                <p className="text-xs text-gray-600">Backups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {lastBackup ? formatDate(lastBackup) : 'Nunca'}
                </p>
                <p className="text-xs text-gray-600">Último backup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {nextBackup ? formatDate(nextBackup) : 'No programado'}
                </p>
                <p className="text-xs text-gray-600">Próximo backup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HardDrive className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatFileSize(storageUsed)}
                </p>
                <p className="text-xs text-gray-600">Almacenamiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uso de almacenamiento</span>
            <span className="text-sm text-gray-600">
              {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          {storagePercentage > 80 && (
            <div className="flex items-center gap-2 mt-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Almacenamiento casi lleno</span>
              <Button
                size="sm"
                variant="outline"
                onClick={cleanupOldBackups}
                className="ml-auto"
              >
                Limpiar antiguos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="create">Crear Backup</TabsTrigger>
          <TabsTrigger value="import">Importar/Exportar</TabsTrigger>
        </TabsList>

        {/* Backups List */}
        <TabsContent value="backups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Backups disponibles ({backups.length})
            </h4>
            <Button
              size="sm"
              variant="outline"
              onClick={cleanupOldBackups}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar antiguos
            </Button>
          </div>

          <div className="space-y-3">
            {backups.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay backups disponibles</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Crea tu primer backup desde la pestaña "Crear Backup"
                  </p>
                </CardContent>
              </Card>
            ) : (
              backups.map((backup) => (
                <Card key={backup.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getBackupTypeColor(backup.type)}>
                            {backup.type}
                          </Badge>
                          {backup.compressed && (
                            <Badge variant="outline">
                              <Zap className="w-3 h-3 mr-1" />
                              Comprimido
                            </Badge>
                          )}
                        </div>
                        
                        <h5 className="font-medium text-gray-900 mb-1">
                          {backup.filename}
                        </h5>
                        
                        {backup.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {backup.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(backup.timestamp)}</span>
                          <span>{formatFileSize(backup.size)}</span>
                          {backup.metadata.author && (
                            <span>por {backup.metadata.author}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportBackup(backup.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreBackup(backup)}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Create Backup */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Crear nuevo backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-description">Descripción (opcional)</Label>
                <Input
                  id="backup-description"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Describe los cambios o motivo del backup..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Backup manual</p>
                    <p className="text-sm text-blue-700">
                      Crea una copia de seguridad inmediata de {resource}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreatingBackup ? (
                    <>
                      <Database className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Crear backup
                    </>
                  )}
                </Button>
              </div>

              {/* Backup Tips */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Recomendaciones:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Crea backups antes de hacer cambios importantes</li>
                  <li>• Los backups se comprimen automáticamente para ahorrar espacio</li>
                  <li>• Incluye una descripción para identificar fácilmente el contenido</li>
                  <li>• Los backups automáticos se crean según la programación configurada</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export */}
        <TabsContent value="import" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar backups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Descarga backups para almacenarlos externamente o transferirlos.
                </p>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportBackup('all')}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Exportar todos los backups
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportBackup('latest')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Exportar último backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importar backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Importa backups desde archivos externos.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".backup,.zip,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        importBackup(file);
                      }
                    }}
                    className="hidden"
                    id="backup-import"
                  />
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('backup-import')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Importar un backup sobrescribirá los datos actuales
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de backups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Programación automática</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Backups automáticos</Label>
                  <Switch
                    id="auto-backup"
                    checked={config.autoBackup}
                    onCheckedChange={(checked) => updateConfig({ autoBackup: checked })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Frecuencia</Label>
                  <Select
                    value={config.frequency}
                    onValueChange={(value) => updateConfig({ frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Retention Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Políticas de retención</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="max-backups">Máximo de backups</Label>
                  <Input
                    id="max-backups"
                    type="number"
                    value={config.maxBackups}
                    onChange={(e) => updateConfig({ maxBackups: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Días de retención</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={config.retentionDays}
                    onChange={(e) => updateConfig({ retentionDays: parseInt(e.target.value) })}
                    min="1"
                    max="365"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compression">Comprimir backups</Label>
                  <Switch
                    id="compression"
                    checked={config.compression}
                    onCheckedChange={(checked) => updateConfig({ compression: checked })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowConfig(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowConfig(false);
                  // Configuration is saved automatically via updateConfig
                }}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackupManager;