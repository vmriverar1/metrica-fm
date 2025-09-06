'use client';

import { AlertTriangle, Settings, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface DevelopmentNoticeProps {
  type?: 'placeholder' | 'empty' | 'missing';
  section?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function DevelopmentNotice({ 
  type = 'placeholder', 
  section = 'esta sección',
  message,
  actionText,
  onAction 
}: DevelopmentNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production' || isDismissed) {
    return null;
  }

  const getConfig = () => {
    switch (type) {
      case 'empty':
        return {
          icon: FileText,
          title: 'Sin contenido',
          description: message || `No hay contenido configurado para ${section}. Agrega información en el archivo JSON correspondiente.`,
          variant: 'default' as const,
          badge: 'Vacío'
        };
      case 'missing':
        return {
          icon: AlertTriangle,
          title: 'Archivo faltante',
          description: message || `El archivo JSON para ${section} no se pudo cargar. Verifica que existe y tiene el formato correcto.`,
          variant: 'destructive' as const,
          badge: 'Error'
        };
      default:
        return {
          icon: Settings,
          title: 'Datos de ejemplo',
          description: message || `${section} está usando datos de placeholder. Personaliza el contenido en el archivo JSON correspondiente.`,
          variant: 'default' as const,
          badge: 'Placeholder'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative">
      <Alert className={`border-dashed mb-4 ${config.variant === 'destructive' ? 'border-destructive/50 bg-destructive/10' : 'border-muted-foreground/30 bg-muted/50'}`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`h-4 w-4 mt-0.5 ${config.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{config.title}</h4>
              <Badge variant={config.variant === 'destructive' ? 'destructive' : 'secondary'} className="text-xs">
                {config.badge}
              </Badge>
            </div>
            <AlertDescription className="text-sm">
              {config.description}
            </AlertDescription>
            {(actionText || onAction) && (
              <div className="flex items-center gap-2 pt-1">
                {onAction && (
                  <Button 
                    onClick={onAction} 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    {actionText || 'Configurar'}
                  </Button>
                )}
                <Button 
                  onClick={() => setIsDismissed(true)} 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs"
                >
                  Ocultar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}

// Specialized components for common cases
export function PlaceholderNotice({ section, onConfigure }: { section?: string; onConfigure?: () => void }) {
  return (
    <DevelopmentNotice 
      type="placeholder" 
      section={section}
      actionText="Personalizar"
      onAction={onConfigure}
    />
  );
}

export function EmptyContentNotice({ section, onAdd }: { section?: string; onAdd?: () => void }) {
  return (
    <DevelopmentNotice 
      type="empty" 
      section={section}
      actionText="Agregar contenido"
      onAction={onAdd}
    />
  );
}

export function MissingFileNotice({ fileName }: { fileName?: string }) {
  return (
    <DevelopmentNotice 
      type="missing" 
      message={`El archivo ${fileName} no se pudo cargar. Verifica que existe en public/json/`}
    />
  );
}