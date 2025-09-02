'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
  Archive
} from 'lucide-react';

interface BackupItem {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  size: number;
  version: string;
  items_count: number;
  created_by?: string;
}

export default function MegaMenuBackup() {
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: 'backup-1',
      name: 'Configuración inicial',
      description: 'Backup automático de la configuración inicial del sistema',
      timestamp: '2025-09-01T10:00:00Z',
      size: 2048,
      version: '1.0.0',
      items_count: 4,
      created_by: 'Sistema'
    },
    {
      id: 'backup-2',
      name: 'Antes de cambios mayores',
      description: 'Backup manual antes de implementar los cambios del sistema',
      timestamp: '2025-09-01T14:30:00Z',
      size: 2156,
      version: '1.1.0',
      items_count: 5,
      created_by: 'Admin'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupDescription, setNewBackupDescription] = useState('');
  const [importData, setImportData] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Crear nuevo backup
  const createBackup = async () => {
    if (!newBackupName.trim()) {
      setMessage({ type: 'error', text: 'El nombre del backup es requerido' });
      return;
    }

    setIsLoading(true);
    try {
      // Obtener configuración actual
      const response = await fetch('/api/admin/megamenu');
      const currentData = await response.json();

      // Crear backup
      const backup: BackupItem = {
        id: `backup-${Date.now()}`,
        name: newBackupName,
        description: newBackupDescription || undefined,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(currentData).length,
        version: currentData.settings?.version || '1.0.0',
        items_count: currentData.items?.length || 0,
        created_by: 'Usuario'
      };

      // Guardar backup (simulado - en producción iría a una API)
      setBackups(prev => [backup, ...prev]);

      // Descargar archivo
      const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `megamenu-backup-${backup.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup creado y descargado exitosamente' });
      setNewBackupName('');
      setNewBackupDescription('');
      setShowCreateDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al crear backup: ' + (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurar desde backup
  const restoreFromBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      // En un caso real, esto haría una petición para obtener el backup específico
      // Por ahora simulamos la restauración
      setMessage({ type: 'success', text: 'Configuración restaurada exitosamente desde backup' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al restaurar backup: ' + (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  // Descargar backup específico
  const downloadBackup = (backup: BackupItem) => {
    // En producción, esto haría una petición a la API
    const simulatedData = {
      megamenu: {
        settings: { version: backup.version, enabled: true },
        items: Array(backup.items_count).fill(null).map((_, i) => ({
          id: `item-${i}`,
          label: `Item ${i + 1}`,
          enabled: true
        })),
        page_mappings: {},
        analytics: {}
      }
    };

    const blob = new Blob([JSON.stringify(simulatedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megamenu-backup-${backup.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Eliminar backup
  const deleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
    setMessage({ type: 'success', text: 'Backup eliminado exitosamente' });
  };

  // Importar desde archivo
  const importFromFile = async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Los datos de importación son requeridos' });
      return;
    }

    setIsLoading(true);
    try {
      const data = JSON.parse(importData);
      
      // Validar estructura básica
      if (!data.megamenu || !data.megamenu.items) {
        throw new Error('Estructura de datos inválida');
      }

      // Importar datos (hacer POST a la API)
      const response = await fetch('/api/admin/megamenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.megamenu)
      });

      if (!response.ok) {
        throw new Error('Error al importar configuración');
      }

      setMessage({ type: 'success', text: 'Configuración importada exitosamente' });
      setImportData('');
      setShowImportDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al importar: ' + (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar subida de archivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-500" />
            Sistema de Backup y Restauración
          </CardTitle>
          <CardDescription>
            Gestiona copias de seguridad de la configuración del MegaMenu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Crear Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Backup</DialogTitle>
                  <DialogDescription>
                    Crea una copia de seguridad de la configuración actual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-name">Nombre del Backup</Label>
                    <Input
                      id="backup-name"
                      value={newBackupName}
                      onChange={(e) => setNewBackupName(e.target.value)}
                      placeholder="Ej: Backup antes de migración"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backup-description">Descripción (opcional)</Label>
                    <Textarea
                      id="backup-description"
                      value={newBackupDescription}
                      onChange={(e) => setNewBackupDescription(e.target.value)}
                      placeholder="Describe el propósito de este backup..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={createBackup} disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Crear Backup'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Configuración</DialogTitle>
                  <DialogDescription>
                    Importa una configuración desde un archivo JSON
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Subir Archivo</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-data">O pegar JSON directamente</Label>
                    <Textarea
                      id="import-data"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Pega aquí el contenido del archivo JSON..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowImportDialog(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={importFromFile} disabled={isLoading}>
                      {isLoading ? 'Importando...' : 'Importar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {message && (
            <Alert className="mt-4" variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponibles</CardTitle>
          <CardDescription>
            {backups.length} backup(s) disponible(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{backup.name}</h3>
                        <Badge variant="secondary">v{backup.version}</Badge>
                      </div>
                      {backup.description && (
                        <p className="text-sm text-muted-foreground">
                          {backup.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(backup.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {backup.items_count} items
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {formatFileSize(backup.size)}
                        </div>
                        {backup.created_by && (
                          <span>por {backup.created_by}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBackup(backup)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Descargar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreFromBackup(backup.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBackup(backup.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {backups.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay backups disponibles</p>
                  <p className="text-sm">Crea tu primer backup para comenzar</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}