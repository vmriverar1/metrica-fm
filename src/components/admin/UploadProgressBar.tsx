/**
 * UploadProgressBar - Componente para mostrar progreso detallado de procesamiento
 * Fase 4 del plan de mejora de upload de imágenes
 */

'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  Square,
  Zap,
  Upload,
  Clock
} from 'lucide-react';

export interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  icon: React.ReactNode;
}

export interface FileProcessingStatus {
  fileName: string;
  currentStage: string;
  stages: ProcessingStage[];
  overallProgress: number;
  error?: string;
}

interface UploadProgressBarProps {
  files: FileProcessingStatus[];
  isVisible: boolean;
  onClose?: () => void;
}

const getStageIcon = (stage: ProcessingStage) => {
  switch (stage.status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: ProcessingStage['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500 text-white text-xs">Completado</Badge>;
    case 'processing':
      return <Badge variant="default" className="bg-blue-500 text-white text-xs">Procesando</Badge>;
    case 'error':
      return <Badge variant="destructive" className="text-xs">Error</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Pendiente</Badge>;
  }
};

export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  files,
  isVisible
}) => {
  if (!isVisible || files.length === 0) {
    return null;
  }

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.overallProgress === 100).length;
  const overallProgress = files.reduce((acc, f) => acc + f.overallProgress, 0) / totalFiles;

  return (
    <div className="space-y-4">
      {/* Progreso general */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Procesando imágenes</span>
            </div>
            <div className="text-sm text-gray-600">
              {completedFiles}/{totalFiles} completados
            </div>
          </div>

          <Progress value={overallProgress} className="h-2 mb-2" />

          <div className="text-xs text-gray-500 text-center">
            {Math.round(overallProgress)}% completado
          </div>
        </CardContent>
      </Card>

      {/* Progreso por archivo */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {files.map((file, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileImage className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium truncate" title={file.fileName}>
                    {file.fileName}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(file.overallProgress)}%
                </div>
              </div>

              {/* Error message */}
              {file.error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {file.error}
                  </div>
                </div>
              )}

              {/* Stages */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {file.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-2 p-2 rounded border text-xs ${
                      stage.status === 'processing'
                        ? 'bg-blue-50 border-blue-200'
                        : stage.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : stage.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getStageIcon(stage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={stage.name}>
                        {stage.name}
                      </div>
                      {stage.status === 'processing' && stage.progress !== undefined && (
                        <div className="text-xs text-gray-500">
                          {Math.round(stage.progress)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar for current file */}
              <div className="mt-2">
                <Progress value={file.overallProgress} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Hook para manejar el estado del progreso
export const useUploadProgress = () => {
  const [files, setFiles] = React.useState<FileProcessingStatus[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);

  const initializeFiles = React.useCallback((fileList: File[]) => {
    const defaultStages: ProcessingStage[] = [
      {
        id: 'validation',
        name: 'Validación',
        description: 'Verificando duplicados',
        status: 'pending',
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        id: 'resize',
        name: 'Redimensionar',
        description: 'Optimizando dimensiones',
        status: 'pending',
        icon: <Square className="w-4 h-4" />
      },
      {
        id: 'convert',
        name: 'Convertir',
        description: 'Convirtiendo a WebP',
        status: 'pending',
        icon: <Zap className="w-4 h-4" />
      },
      {
        id: 'upload',
        name: 'Subir',
        description: 'Enviando al servidor',
        status: 'pending',
        icon: <Upload className="w-4 h-4" />
      }
    ];

    const initialFiles: FileProcessingStatus[] = fileList.map(file => ({
      fileName: file.name,
      currentStage: 'validation',
      stages: [...defaultStages],
      overallProgress: 0
    }));

    setFiles(initialFiles);
    setIsVisible(true);
  }, []);

  const updateFileStage = React.useCallback((fileName: string, stageId: string, status: ProcessingStage['status'], progress?: number) => {
    setFiles(prev => prev.map(file => {
      if (file.fileName !== fileName) return file;

      const updatedStages = file.stages.map(stage => {
        if (stage.id === stageId) {
          return { ...stage, status, progress };
        }
        return stage;
      });

      // Calcular progreso general
      const stageWeights = { validation: 10, resize: 30, convert: 30, upload: 30 };
      let overallProgress = 0;

      updatedStages.forEach(stage => {
        const weight = stageWeights[stage.id as keyof typeof stageWeights] || 25;
        if (stage.status === 'completed') {
          overallProgress += weight;
        } else if (stage.status === 'processing' && stage.progress !== undefined) {
          overallProgress += (weight * stage.progress) / 100;
        }
      });

      return {
        ...file,
        currentStage: stageId,
        stages: updatedStages,
        overallProgress: Math.min(100, overallProgress)
      };
    }));
  }, []);

  const updateFileError = React.useCallback((fileName: string, error: string) => {
    setFiles(prev => prev.map(file => {
      if (file.fileName !== fileName) return file;
      return { ...file, error };
    }));
  }, []);

  const clearProgress = React.useCallback(() => {
    setFiles([]);
    setIsVisible(false);
  }, []);

  const hideProgress = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    files,
    isVisible,
    initializeFiles,
    updateFileStage,
    updateFileError,
    clearProgress,
    hideProgress
  };
};

export default UploadProgressBar;