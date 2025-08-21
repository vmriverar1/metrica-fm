'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface PreviewModalProps {
  isOpen: boolean;
  data: any;
  onClose: () => void;
  component?: 'HomePage' | 'BlogPage' | 'PortfolioPage' | 'AboutPage';
  title?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  data,
  onClose,
  component = 'HomePage',
  title = 'Preview en Tiempo Real'
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceSizes = {
    desktop: { width: '100%', height: '600px', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', height: '1024px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', height: '667px', icon: Smartphone, label: 'Mobile' }
  };

  // Generar preview URL cuando se abra el modal
  useEffect(() => {
    if (isOpen && data) {
      generatePreview();
    }
  }, [isOpen, data]);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/pages/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component,
          data,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setPreviewUrl(result.previewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al generar preview');
      console.error('Preview generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    generatePreview();
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const DeviceButton = ({ deviceType, size, icon: Icon, label }: {
    deviceType: 'desktop' | 'tablet' | 'mobile';
    size: typeof deviceSizes[keyof typeof deviceSizes];
    icon: React.ComponentType<any>;
    label: string;
  }) => (
    <Button
      variant={device === deviceType ? 'default' : 'outline'}
      size="sm"
      onClick={() => setDevice(deviceType)}
      className="flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  const PreviewFrame = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Generando preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center p-6">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error en Preview</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se pudo generar el preview</p>
          </div>
        </div>
      );
    }

    const currentSize = deviceSizes[device];
    
    return (
      <div className="flex justify-center p-4 bg-gray-100 rounded-lg min-h-96">
        <div 
          className="bg-white rounded-lg shadow-lg overflow-hidden border transition-all duration-300"
          style={{ 
            width: device === 'desktop' ? '100%' : currentSize.width,
            height: currentSize.height,
            maxWidth: '100%'
          }}
        >
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Preview - ${component}`}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    );
  };

  const DataInspector = () => (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Datos del Preview</h4>
          <Badge variant="outline">{Object.keys(data || {}).length} campos</Badge>
        </div>
        
        <div className="bg-gray-50 rounded p-3 text-xs font-mono max-h-32 overflow-y-auto">
          <pre className="text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
            <Badge variant="secondary">{component}</Badge>
          </DialogTitle>
          <DialogDescription>
            Preview en tiempo real de los cambios sin guardar. Los datos se renderizan temporalmente.
          </DialogDescription>
        </DialogHeader>

        {/* Device Controls */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex gap-2">
            {Object.entries(deviceSizes).map(([key, size]) => (
              <DeviceButton
                key={key}
                deviceType={key as keyof typeof deviceSizes}
                size={size}
                icon={size.icon}
                label={size.label}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              onClick={handleOpenInNewTab} 
              variant="outline" 
              size="sm"
              disabled={!previewUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="space-y-4">
          <PreviewFrame />
          
          {/* Preview Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{device}</p>
              <p className="text-xs text-gray-600">Dispositivo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {previewUrl ? 'Activo' : 'Inactivo'}
              </p>
              <p className="text-xs text-gray-600">Estado</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(data || {}).length}
              </p>
              <p className="text-xs text-gray-600">Campos</p>
            </div>
          </div>

          {/* Data Inspector (colapsible) */}
          <details className="border rounded-lg">
            <summary className="p-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
              🔍 Inspeccionar Datos del Preview
            </summary>
            <DataInspector />
          </details>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips del Preview:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Tiempo Real:</strong> El preview se actualiza automáticamente al abrir</li>
            <li>• <strong>Sin Guardar:</strong> Los cambios no afectan la versión publicada</li>
            <li>• <strong>Responsive:</strong> Pruebe en diferentes dispositivos</li>
            <li>• <strong>Nueva Pestaña:</strong> Use "Abrir" para una vista completa</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;