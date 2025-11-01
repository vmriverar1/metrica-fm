/**
 * UploadSettings - Panel de configuración avanzada para upload de imágenes
 * Fase 4 del plan de mejora de upload de imágenes
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Maximize2,
  Zap,
  Image,
  Info,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

export interface UploadConfig {
  // Redimensionado
  enableResize: boolean;
  maxWidth: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;

  // Conversión WebP
  enableWebP: boolean;
  webpQuality: number;
  jpegQuality: number;
  preservePNG: boolean;

  // Validación
  checkDuplicates: boolean;
  caseSensitive: boolean;
  checkSimilarNames: boolean;
  autoRename: boolean;

  // General
  processInBackground: boolean;
  showProgress: boolean;
}

interface UploadSettingsProps {
  config: UploadConfig;
  onChange: (config: UploadConfig) => void;
  onReset: () => void;
  isWebPSupported?: boolean;
}

const DEFAULT_CONFIG: UploadConfig = {
  enableResize: true,
  maxWidth: 1800,
  maxHeight: undefined,
  maintainAspectRatio: true,
  enableWebP: true,
  webpQuality: 85,
  jpegQuality: 90,
  preservePNG: true,
  checkDuplicates: true,
  caseSensitive: false,
  checkSimilarNames: true,
  autoRename: false,
  processInBackground: false,
  showProgress: true
};

export const UploadSettings: React.FC<UploadSettingsProps> = ({
  config,
  onChange,
  onReset,
  isWebPSupported = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfigChange = (key: keyof UploadConfig, value: any) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_CONFIG);
    onReset();
  };

  const isConfigModified = JSON.stringify(config) !== JSON.stringify(DEFAULT_CONFIG);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <CardTitle className="text-base">Configuraciónes de Upload</CardTitle>
            {isConfigModified && (
              <Badge variant="outline" className="text-xs">
                Modificado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </Button>
            {isConfigModified && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Restaurar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Configuración de Redimensionado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium text-sm">Redimensionado de Imágenes</h4>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableResize" className="text-sm">
                    Habilitar redimensionado automático
                  </Label>
                  <p className="text-xs text-gray-500">
                    Redimensiona imágenes que excedan el ancho máximo
                  </p>
                </div>
                <Switch
                  id="enableResize"
                  checked={config.enableResize}
                  onCheckedChange={(value) => handleConfigChange('enableResize', value)}
                />
              </div>

              {config.enableResize && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Ancho máximo (px)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[config.maxWidth]}
                        onValueChange={([value]) => handleConfigChange('maxWidth', value)}
                        max={3000}
                        min={600}
                        step={100}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.maxWidth}
                        onChange={(e) => handleConfigChange('maxWidth', parseInt(e.target.value) || 1800)}
                        className="w-20 text-xs"
                        min={600}
                        max={3000}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Recomendado: 1800px para balance entre calidad y tamaño
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Mantener proporción</Label>
                      <p className="text-xs text-gray-500">
                        Preserva la relación de aspecto original
                      </p>
                    </div>
                    <Switch
                      checked={config.maintainAspectRatio}
                      onCheckedChange={(value) => handleConfigChange('maintainAspectRatio', value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Configuración de WebP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <h4 className="font-medium text-sm">Conversión a WebP</h4>
              {!isWebPSupported && (
                <Badge variant="destructive" className="text-xs">
                  No soportado
                </Badge>
              )}
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">
                    Habilitar conversión a WebP
                  </Label>
                  <p className="text-xs text-gray-500">
                    Convierte JPEG a WebP para mejor compresión
                  </p>
                </div>
                <Switch
                  checked={config.enableWebP && isWebPSupported}
                  onCheckedChange={(value) => handleConfigChange('enableWebP', value)}
                  disabled={!isWebPSupported}
                />
              </div>

              {config.enableWebP && isWebPSupported && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Calidad WebP (%)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[config.webpQuality]}
                        onValueChange={([value]) => handleConfigChange('webpQuality', value)}
                        max={100}
                        min={50}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.webpQuality}
                        onChange={(e) => handleConfigChange('webpQuality', parseInt(e.target.value) || 85)}
                        className="w-16 text-xs"
                        min={50}
                        max={100}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      85% ofrece buen balance entre calidad y compresión
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Calidad JPEG/fallback (%)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[config.jpegQuality]}
                        onValueChange={([value]) => handleConfigChange('jpegQuality', value)}
                        max={100}
                        min={60}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={config.jpegQuality}
                        onChange={(e) => handleConfigChange('jpegQuality', parseInt(e.target.value) || 90)}
                        className="w-16 text-xs"
                        min={60}
                        max={100}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Preservar PNG con transparencia</Label>
                      <p className="text-xs text-gray-500">
                        No convierte PNG que puedan tener transparencia
                      </p>
                    </div>
                    <Switch
                      checked={config.preservePNG}
                      onCheckedChange={(value) => handleConfigChange('preservePNG', value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Configuración de Validación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <h4 className="font-medium text-sm">Validación de Archivos</h4>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Verificar duplicados</Label>
                  <p className="text-xs text-gray-500">
                    Detecta archivos con nombres duplicados
                  </p>
                </div>
                <Switch
                  checked={config.checkDuplicates}
                  onCheckedChange={(value) => handleConfigChange('checkDuplicates', value)}
                />
              </div>

              {config.checkDuplicates && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Verificar nombres similares</Label>
                      <p className="text-xs text-gray-500">
                        Detecta variaciones como imagen-1.jpg, imagen-2.jpg
                      </p>
                    </div>
                    <Switch
                      checked={config.checkSimilarNames}
                      onCheckedChange={(value) => handleConfigChange('checkSimilarNames', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Sensible a mayúsculas</Label>
                      <p className="text-xs text-gray-500">
                        Diferencia entre Imagen.jpg e imagen.jpg
                      </p>
                    </div>
                    <Switch
                      checked={config.caseSensitive}
                      onCheckedChange={(value) => handleConfigChange('caseSensitive', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Renombrado automático</Label>
                      <p className="text-xs text-gray-500">
                        Renombra duplicados sin preguntar
                      </p>
                    </div>
                    <Switch
                      checked={config.autoRename}
                      onCheckedChange={(value) => handleConfigChange('autoRename', value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Configuración General */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-cyan-500" />
              <h4 className="font-medium text-sm">Configuración General</h4>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Mostrar progreso detallado</Label>
                  <p className="text-xs text-gray-500">
                    Muestra el estado de cada etapa del procesamiento
                  </p>
                </div>
                <Switch
                  checked={config.showProgress}
                  onCheckedChange={(value) => handleConfigChange('showProgress', value)}
                />
              </div>
            </div>
          </div>

          {/* Información de configuración actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Configuración actual:</p>
                <ul className="space-y-0.5">
                  <li>• Redimensionado: {config.enableResize ? `Máx. ${config.maxWidth}px` : 'Deshabilitado'}</li>
                  <li>• WebP: {config.enableWebP && isWebPSupported ? `${config.webpQuality}% calidad` : 'Deshabilitado'}</li>
                  <li>• Duplicados: {config.checkDuplicates ? (config.autoRename ? 'Auto-renombrar' : 'Preguntar') : 'Ignorar'}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Hook para manejar la configuración
export const useUploadSettings = (initialConfig?: Partial<UploadConfig>) => {
  const [config, setConfig] = useState<UploadConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const updateConfig = (newConfig: UploadConfig) => {
    setConfig(newConfig);
  };

  return {
    config,
    updateConfig,
    resetConfig,
    isModified: JSON.stringify(config) !== JSON.stringify(DEFAULT_CONFIG)
  };
};

export default UploadSettings;