'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  HardDrive,
  Image,
  Calendar,
  FolderOpen,
  FileArchive,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Database,
  Shield,
  Cloud,
  Clock,
  Filter
} from 'lucide-react';

interface ImageInfo {
  path: string;
  relativePath: string;
  size: number;
  modified: string;
  created: string;
  type: string;
}

interface ScanStats {
  totalImages: number;
  totalSize: number;
  byType: Record<string, number>;
  byFolder: Record<string, number>;
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('backup');
  const [isScanning, setIsScanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scanResults, setScanResults] = useState<{
    images: ImageInfo[];
    stats: ScanStats;
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Escanear imágenes
  const scanImages = async () => {
    setIsScanning(true);
    setError(null);
    setSuccess(null);
    setScanResults(null);
    setSelectedImages([]);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/backup/scan-images?${params}`);
      const data = await response.json();

      if (data.success) {
        setScanResults({
          images: data.images,
          stats: data.stats
        });
        setSelectedImages(data.images); // Seleccionar todas por defecto
        setSuccess(`Se encontraron ${data.images.length} imágenes (${formatFileSize(data.stats.totalSize)})`);
      } else {
        setError(data.error || 'Error al escanear imágenes');
      }
    } catch (err) {
      setError('Error de conexión al escanear imágenes');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Descargar imágenes seleccionadas
  const downloadBackup = async () => {
    if (!selectedImages.length) {
      setError('No hay imágenes seleccionadas para descargar');
      return;
    }

    setIsDownloading(true);
    setError(null);
    setDownloadProgress(0);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/admin/backup/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImages
        })
      });

      clearInterval(progressInterval);
      setDownloadProgress(100);

      if (!response.ok) {
        throw new Error('Error al generar el archivo ZIP');
      }

      // Obtener el blob del response
      const blob = await response.blob();

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      a.download = `backup-images-${timestamp}.zip`;

      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Backup descargado exitosamente');
    } catch (err) {
      setError('Error al descargar el backup');
      console.error(err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Seleccionar/deseleccionar por tipo
  const toggleTypeSelection = (type: string) => {
    if (!scanResults) return;

    const typeImages = scanResults.images.filter(img => img.type === type);
    const allSelected = typeImages.every(img =>
      selectedImages.some(sel => sel.relativePath === img.relativePath)
    );

    if (allSelected) {
      // Deseleccionar todas de este tipo
      setSelectedImages(selectedImages.filter(img => img.type !== type));
    } else {
      // Seleccionar todas de este tipo
      const newSelected = [...selectedImages];
      typeImages.forEach(img => {
        if (!selectedImages.some(sel => sel.relativePath === img.relativePath)) {
          newSelected.push(img);
        }
      });
      setSelectedImages(newSelected);
    }
  };

  // Seleccionar/deseleccionar por carpeta
  const toggleFolderSelection = (folder: string) => {
    if (!scanResults) return;

    const folderImages = scanResults.images.filter(img => {
      const imgFolder = img.relativePath.split('/')[0] || 'root';
      return imgFolder === folder;
    });

    const allSelected = folderImages.every(img =>
      selectedImages.some(sel => sel.relativePath === img.relativePath)
    );

    if (allSelected) {
      // Deseleccionar todas de esta carpeta
      setSelectedImages(selectedImages.filter(img => {
        const imgFolder = img.relativePath.split('/')[0] || 'root';
        return imgFolder !== folder;
      }));
    } else {
      // Seleccionar todas de esta carpeta
      const newSelected = [...selectedImages];
      folderImages.forEach(img => {
        if (!selectedImages.some(sel => sel.relativePath === img.relativePath)) {
          newSelected.push(img);
        }
      });
      setSelectedImages(newSelected);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground">
          Gestiona las configuraciones y utilidades del sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Base de Datos
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Sincronización
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="w-5 h-5" />
                Backup de Imágenes del Servidor
              </CardTitle>
              <CardDescription>
                Descarga todas las imágenes del directorio public manteniendo la estructura de carpetas.
                Útil para sincronizar imágenes antes de hacer despliegues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtros de fecha */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar por fecha de modificación
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Desde</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Hasta</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={scanImages}
                  disabled={isScanning}
                  className="w-full sm:w-auto"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Escaneando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Escanear Imágenes
                    </>
                  )}
                </Button>
              </div>

              {/* Resultados del escaneo */}
              {scanResults && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3">Resultados del Escaneo</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{scanResults.stats.totalImages}</div>
                        <div className="text-sm text-muted-foreground">Imágenes totales</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatFileSize(scanResults.stats.totalSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tamaño total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{selectedImages.length}</div>
                        <div className="text-sm text-muted-foreground">Seleccionadas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatFileSize(
                            selectedImages.reduce((sum, img) => sum + img.size, 0)
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Tamaño selección</div>
                      </div>
                    </div>
                  </div>

                  {/* Filtros por tipo */}
                  <div>
                    <h4 className="font-medium mb-2">Por tipo de archivo</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(scanResults.stats.byType).map(([type, count]) => {
                        const typeImages = scanResults.images.filter(img => img.type === type);
                        const selectedCount = typeImages.filter(img =>
                          selectedImages.some(sel => sel.relativePath === img.relativePath)
                        ).length;

                        return (
                          <Badge
                            key={type}
                            variant={selectedCount === count ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTypeSelection(type)}
                          >
                            .{type} ({selectedCount}/{count})
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtros por carpeta */}
                  <div>
                    <h4 className="font-medium mb-2">Por carpeta</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(scanResults.stats.byFolder).map(([folder, count]) => {
                        const folderImages = scanResults.images.filter(img => {
                          const imgFolder = img.relativePath.split('/')[0] || 'root';
                          return imgFolder === folder;
                        });
                        const selectedCount = folderImages.filter(img =>
                          selectedImages.some(sel => sel.relativePath === img.relativePath)
                        ).length;

                        return (
                          <Badge
                            key={folder}
                            variant={selectedCount === count ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleFolderSelection(folder)}
                          >
                            <FolderOpen className="w-3 h-3 mr-1" />
                            {folder} ({selectedCount}/{count})
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedImages(scanResults.images)}
                      disabled={selectedImages.length === scanResults.images.length}
                    >
                      Seleccionar Todas
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedImages([])}
                      disabled={selectedImages.length === 0}
                    >
                      Deseleccionar Todas
                    </Button>
                    <Button
                      onClick={downloadBackup}
                      disabled={isDownloading || selectedImages.length === 0}
                      className="ml-auto"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generando ZIP...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar Backup ({selectedImages.length})
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progreso de descarga */}
                  {isDownloading && (
                    <Progress value={downloadProgress} className="h-2" />
                  )}
                </div>
              )}

              {/* Mensajes de estado */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Instrucciones */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">📝 Instrucciones de uso:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. <strong>Filtrar por fecha</strong> (opcional): Selecciona un rango de fechas para filtrar las imágenes por fecha de modificación</li>
                  <li>2. <strong>Escanear</strong>: Haz clic en "Escanear Imágenes" para buscar todas las imágenes en el directorio public</li>
                  <li>3. <strong>Seleccionar</strong>: Usa los filtros por tipo o carpeta para seleccionar las imágenes que deseas descargar</li>
                  <li>4. <strong>Descargar</strong>: Haz clic en "Descargar Backup" para generar y descargar un archivo ZIP</li>
                  <li>5. <strong>Estructura preservada</strong>: El ZIP mantendrá la misma estructura de carpetas que en el servidor</li>
                </ol>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Importante:</strong> Ejecuta este backup antes de hacer <code className="px-1 py-0.5 bg-yellow-100 rounded">git push</code> para asegurarte de no perder imágenes del servidor que no estén en el repositorio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Base de Datos
              </CardTitle>
              <CardDescription>
                Configuración y mantenimiento de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sección en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sección en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Sincronización
              </CardTitle>
              <CardDescription>
                Configuración de sincronización con servicios en la nube
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sección en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}