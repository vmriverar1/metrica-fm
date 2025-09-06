'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, Settings, AlertCircle, ChevronRight, X } from 'lucide-react';

interface SetupGuideProps {
  onDismiss?: () => void;
}

export default function SetupGuide({ onDismiss }: SetupGuideProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production' || !isVisible) {
    return null;
  }

  const steps = [
    {
      title: 'Personalizar Información de la Empresa',
      description: 'Actualiza los datos básicos de tu empresa',
      files: ['home.json', 'contact.json', 'megamenu.json'],
      icon: Settings,
      status: 'pending'
    },
    {
      title: 'Agregar Servicios',
      description: 'Define los servicios que ofrece tu empresa',
      files: ['home.json', 'services.json'],
      icon: FileText,
      status: 'pending'
    },
    {
      title: 'Configurar Proyectos',
      description: 'Agrega tu portafolio de proyectos',
      files: ['portfolio/content.json', 'home.json'],
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  const jsonPaths = [
    '/public/json/pages/home.json - Página principal',
    '/public/json/pages/services.json - Servicios',
    '/public/json/pages/contact.json - Información de contacto',
    '/public/json/admin/megamenu.json - Navegación',
    '/public/json/dynamic-content/portfolio/content.json - Portafolio'
  ];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50 max-w-[90vw]">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <CardTitle className="text-lg">Proyecto Listo para Personalizar</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Tu proyecto está funcionando correctamente. Sigue estos pasos para personalizarlo:
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Los archivos JSON contienen datos placeholder. Personalízalos según tu empresa.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <step.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{step.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {step.files.length} archivo{step.files.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {step.files.map((file, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">Archivos principales para editar:</p>
            <div className="space-y-1">
              {jsonPaths.slice(0, 3).map((path, index) => (
                <div key={index} className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                  {path}
                </div>
              ))}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Ver más archivos ({jsonPaths.length - 3})
                </summary>
                <div className="mt-1 space-y-1 pl-2">
                  {jsonPaths.slice(3).map((path, index) => (
                    <div key={index} className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                      {path}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}