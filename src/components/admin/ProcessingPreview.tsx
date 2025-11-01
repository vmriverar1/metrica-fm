/**
 * ProcessingPreview - Preview del proceso de optimización de imágenes
 * Fase 4 del plan de mejora de upload de imágenes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  EyeOff,
  FileImage,
  Square,
  Zap,
  CheckCircle,
  ArrowRight,
  TrendingDown,
  Info,
  Image as ImageIcon
} from 'lucide-react';

export interface ProcessingPreviewData {
  fileName: string;
  originalFile: File;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
  originalFormat: string;
  finalFormat: string;
  originalSize: number;
  finalSize: number;
  wasResized: boolean;
  wasConverted: boolean;
  compressionRatio: number;
  previewUrl?: string;
  optimizedPreviewUrl?: string;
}

interface ProcessingPreviewProps {
  files: ProcessingPreviewData[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFormatBadge = (format: string) => {
  const formatUpper = format.toUpperCase().replace('IMAGE/', '');
  const colors: Record<string, string> = {
    'WEBP': 'bg-green-500 text-white',
    'JPEG': 'bg-blue-500 text-white',
    'JPG': 'bg-blue-500 text-white',
    'PNG': 'bg-purple-500 text-white',
    'GIF': 'bg-cyan-500 text-white'
  };

  return (
    <Badge className={`text-xs ${colors[formatUpper] || 'bg-gray-500 text-white'}`}>
      {formatUpper}
    </Badge>
  );
};

const ProcessingCard: React.FC<{ data: ProcessingPreviewData; index: number }> = ({ data, index }) => {
  const [showComparison, setShowComparison] = useState(false);
  const savings = Math.round((1 - data.compressionRatio) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileImage className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate" title={data.fileName}>
              {data.fileName}
            </span>
          </div>
          {(data.wasResized || data.wasConverted) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs"
            >
              {showComparison ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showComparison ? 'Ocultar' : 'Ver'} detalles
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumen de optimizaciones */}
        <div className="flex items-center gap-2 flex-wrap">
          {data.wasResized && (
            <Badge variant="outline" className="text-xs">
              <Square className="w-3 h-3 mr-1" />
              Redimensionado
            </Badge>
          )}
          {data.wasConverted && (
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Convertido a WebP
            </Badge>
          )}
          {!data.wasResized && !data.wasConverted && (
            <Badge variant="outline" className="text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sin cambios
            </Badge>
          )}
        </div>

        {/* Comparación de formato y tamaño */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-500 mb-1">Original</div>
            <div className="space-y-1">
              {getFormatBadge(data.originalFormat)}
              <div className="font-medium">{formatFileSize(data.originalSize)}</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="text-center">
            <div className="text-gray-500 mb-1">Optimizado</div>
            <div className="space-y-1">
              {getFormatBadge(data.finalFormat)}
              <div className="font-medium">{formatFileSize(data.finalSize)}</div>
            </div>
          </div>
        </div>

        {/* Indicador de ahorro */}
        {savings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="flex items-center gap-2 text-green-700">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">
                {savings}% menos espacio ({formatFileSize(data.originalSize - data.finalSize)} ahorrados)
              </span>
            </div>
          </div>
        )}

        {/* Detalles expandidos */}
        {showComparison && (
          <div className="space-y-3 border-t pt-3">
            {/* Dimensiones */}
            {data.originalDimensions && (
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Dimensiones:</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-medium">
                      {data.originalDimensions.width} × {data.originalDimensions.height}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {data.finalDimensions?.width || data.originalDimensions.width} × {data.finalDimensions?.height || data.originalDimensions.height}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview de imágenes si están disponibles */}
            {data.previewUrl && (
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Original</div>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <img
                        src={data.previewUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {data.optimizedPreviewUrl && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Optimizado</div>
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={data.optimizedPreviewUrl}
                          alt="Optimizado"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estadísticas detalladas */}
            <div className="bg-gray-50 rounded p-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Compresión:</span>
                  <span className="ml-1 font-medium">{Math.round(data.compressionRatio * 100)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Ahorro:</span>
                  <span className="ml-1 font-medium text-green-600">{savings}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ProcessingPreview: React.FC<ProcessingPreviewProps> = ({
  files,
  isVisible,
  onToggleVisibility
}) => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    resizedFiles: 0,
    convertedFiles: 0,
    totalOriginalSize: 0,
    totalFinalSize: 0,
    averageSavings: 0
  });

  useEffect(() => {
    if (files.length === 0) return;

    const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0);
    const totalFinalSize = files.reduce((acc, f) => acc + f.finalSize, 0);
    const resizedFiles = files.filter(f => f.wasResized).length;
    const convertedFiles = files.filter(f => f.wasConverted).length;
    const averageSavings = totalOriginalSize > 0 ? Math.round((1 - totalFinalSize / totalOriginalSize) * 100) : 0;

    setStats({
      totalFiles: files.length,
      resizedFiles,
      convertedFiles,
      totalOriginalSize,
      totalFinalSize,
      averageSavings
    });
  }, [files]);

  if (!isVisible || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Resumen de Optimización
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggleVisibility}>
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
              <div className="text-xs text-gray-500">Archivos procesados</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.resizedFiles}</div>
              <div className="text-xs text-gray-500">Redimensionados</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.convertedFiles}</div>
              <div className="text-xs text-gray-500">Convertidos a WebP</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.averageSavings}%</div>
              <div className="text-xs text-gray-500">Ahorro promedio</div>
            </div>
          </div>

          {stats.averageSavings > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 text-green-700">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">
                  <strong>Total ahorrado:</strong> {formatFileSize(stats.totalOriginalSize - stats.totalFinalSize)}
                  {' '}({formatFileSize(stats.totalOriginalSize)} → {formatFileSize(stats.totalFinalSize)})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de archivos procesados */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((file, index) => (
          <ProcessingCard key={index} data={file} index={index} />
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Beneficios de la optimización:</p>
            <ul className="space-y-0.5">
              <li>• Carga más rápida de páginas web</li>
              <li>• Menor uso de ancho de banda</li>
              <li>• Mejor experiencia en dispositivos móviles</li>
              <li>• Mejora en métricas de Core Web Vitals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPreview;