'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileX, Edit3, RefreshCw } from 'lucide-react';
import { FileValidationResult, DuplicateResolution } from '@/hooks/useFileValidation';

interface DuplicateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: FileValidationResult[];
  onResolve: (resolutions: Record<string, DuplicateResolution>) => void;
}

export const DuplicateFileModal = ({
  isOpen,
  onClose,
  conflicts,
  onResolve
}: DuplicateFileModalProps) => {
  const [resolutions, setResolutions] = useState<Record<string, DuplicateResolution>>({});
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'exact':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'similar':
        return <FileX className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getConflictBadge = (type: string) => {
    switch (type) {
      case 'exact':
        return <Badge variant="destructive" className="text-xs">Duplicado Exacto</Badge>;
      case 'similar':
        return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">Similar</Badge>;
      default:
        return null;
    }
  };

  const handleResolutionChange = useCallback((fileName: string, action: 'replace' | 'rename' | 'skip') => {
    setResolutions(prev => ({
      ...prev,
      [fileName]: {
        action,
        newName: action === 'rename' ? (customNames[fileName] || conflicts.find(c => c.originalName === fileName)?.suggestedName) : undefined
      }
    }));
  }, [customNames, conflicts]);

  const handleCustomNameChange = useCallback((fileName: string, newName: string) => {
    setCustomNames(prev => ({
      ...prev,
      [fileName]: newName
    }));

    // Actualizar la resolución si ya está configurada como 'rename'
    if (resolutions[fileName]?.action === 'rename') {
      setResolutions(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          newName
        }
      }));
    }
  }, [resolutions]);

  const handleResolveAll = useCallback((action: 'replace' | 'rename' | 'skip') => {
    const newResolutions: Record<string, DuplicateResolution> = {};

    conflicts.forEach(conflict => {
      newResolutions[conflict.originalName] = {
        action,
        newName: action === 'rename' ? conflict.suggestedName : undefined
      };
    });

    setResolutions(newResolutions);
  }, [conflicts]);

  const handleSubmit = useCallback(() => {
    // Verificar que todos los conflictos tengan una resolución
    const missingResolutions = conflicts.filter(conflict => !resolutions[conflict.originalName]);

    if (missingResolutions.length > 0) {
      console.warn('⚠️ [DuplicateModal] Faltan resoluciones para:', missingResolutions.map(c => c.originalName));
      return;
    }

    console.log('✅ [DuplicateModal] Resolviendo conflictos:', resolutions);
    onResolve(resolutions);
    onClose();
  }, [conflicts, resolutions, onResolve, onClose]);

  const pendingCount = conflicts.length - Object.keys(resolutions).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Archivos Duplicados Detectados
          </DialogTitle>
          <DialogDescription>
            Se encontraron {conflicts.length} archivo(s) con nombres conflictivos.
            Elige cómo resolverlos antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Acciones masivas */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3 text-sm">Acciones para todos los archivos:</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAll('replace')}
                className="text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reemplazar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAll('rename')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Renombrar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAll('skip')}
                className="text-gray-600 hover:text-gray-700"
              >
                <FileX className="w-4 h-4 mr-1" />
                Omitir Todos
              </Button>
            </div>
          </div>

          {/* Lista de conflictos */}
          <div className="space-y-3">
            {conflicts.map((conflict, index) => {
              const resolution = resolutions[conflict.originalName];
              const customName = customNames[conflict.originalName];

              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getConflictIcon(conflict.conflictType)}
                        <span className="font-medium text-sm">{conflict.originalName}</span>
                        {getConflictBadge(conflict.conflictType)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {conflict.conflictType === 'exact' && 'Un archivo con este nombre exacto ya existe'}
                        {conflict.conflictType === 'similar' && 'Se encontró un archivo con nombre similar'}
                      </div>
                    </div>
                  </div>

                  {/* Opciones de resolución */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant={resolution?.action === 'replace' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.originalName, 'replace')}
                      className={resolution?.action === 'replace' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reemplazar
                    </Button>

                    <Button
                      variant={resolution?.action === 'rename' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.originalName, 'rename')}
                      className={resolution?.action === 'rename' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Renombrar
                    </Button>

                    <Button
                      variant={resolution?.action === 'skip' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.originalName, 'skip')}
                      className={resolution?.action === 'skip' ? 'bg-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}
                    >
                      <FileX className="w-4 h-4 mr-1" />
                      Omitir
                    </Button>
                  </div>

                  {/* Campo de renombrado personalizado */}
                  {resolution?.action === 'rename' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nuevo nombre:
                      </label>
                      <Input
                        size="sm"
                        value={customName || conflict.suggestedName}
                        onChange={(e) => handleCustomNameChange(conflict.originalName, e.target.value)}
                        placeholder={conflict.suggestedName}
                        className="text-sm"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Sugerencia: {conflict.suggestedName}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer con acciones principales */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {pendingCount > 0 ? (
              <span className="text-cyan-600">
                Faltan {pendingCount} resolución(es)
              </span>
            ) : (
              <span className="text-green-600">
                ✓ Todos los conflictos resueltos
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={pendingCount > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continuar ({conflicts.length - pendingCount}/{conflicts.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateFileModal;