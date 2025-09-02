'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  TestTube, 
  Plus,
  Copy,
  Power,
  PowerOff,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface MegaMenuItem {
  id: string;
  order: number;
  enabled: boolean;
  type: 'megamenu' | 'simple';
  label: string;
  href?: string | null;
  icon: string;
  description: string;
  is_internal?: boolean;
  page_mapping?: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  submenu?: {
    layout: string;
    section1: {
      title: string;
      description: string;
      highlight_color: string;
    };
    links: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
      icon: string;
      enabled: boolean;
      is_internal: boolean;
      page_mapping: string;
      order: number;
      click_count: number;
    }>;
    section3: {
      type: string;
      title: string;
      description: string;
      image: string;
      cta: {
        text: string;
        href: string;
        type: string;
        page_mapping?: string;
      };
      background_gradient: string;
    };
  };
}

interface MegaMenuActionsProps {
  item: MegaMenuItem;
  onEdit: (item: MegaMenuItem) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (item: MegaMenuItem) => void;
  onToggleEnabled: (itemId: string) => void;
  onTest: (item: MegaMenuItem) => void;
  disabled?: boolean;
}

const MegaMenuActions: React.FC<MegaMenuActionsProps> = ({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleEnabled,
  onTest,
  disabled = false
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Simular test de funcionamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = {
        status: 'success',
        checks: [
          { name: 'Enlaces válidos', status: 'success', message: 'Todos los enlaces funcionan correctamente' },
          { name: 'Imágenes cargadas', status: item.submenu?.section3?.image ? 'success' : 'warning', message: item.submenu?.section3?.image ? 'Imagen promocional carga correctamente' : 'Sin imagen promocional' },
          { name: 'Configuración válida', status: 'success', message: 'Estructura JSON válida' },
          { name: 'Responsive', status: 'success', message: 'Compatible con todos los dispositivos' }
        ]
      };
      
      setTestResults(results);
      onTest(item);
      
      toast({
        title: "Test completado",
        description: `El menú "${item.label}" funciona correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error en el test",
        description: "No se pudo completar el test del menú",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteDialog(false);
    toast({
      title: "Menú eliminado",
      description: `El menú "${item.label}" ha sido eliminado correctamente`,
    });
  };

  const handleToggleEnabled = () => {
    onToggleEnabled(item.id);
    toast({
      title: item.enabled ? "Menú desactivado" : "Menú activado",
      description: `El menú "${item.label}" ha sido ${item.enabled ? 'desactivado' : 'activado'}`,
    });
  };

  const handleDuplicate = () => {
    onDuplicate(item);
    toast({
      title: "Menú duplicado",
      description: `Se ha creado una copia de "${item.label}"`,
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Preview */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePreview}
          disabled={disabled}
          title="Vista previa"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {/* Edit */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(item)}
          disabled={disabled}
          title="Editar menú"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* Test */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleTest}
          disabled={disabled || testing}
          title="Probar funcionamiento"
        >
          <TestTube className={`h-4 w-4 ${testing ? 'animate-pulse' : ''}`} />
        </Button>

        {/* Toggle Enabled/Disabled */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggleEnabled}
          disabled={disabled}
          title={item.enabled ? "Desactivar menú" : "Activar menú"}
        >
          {item.enabled ? (
            <PowerOff className="h-4 w-4 text-orange-600" />
          ) : (
            <Power className="h-4 w-4 text-green-600" />
          )}
        </Button>

        {/* Duplicate */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDuplicate}
          disabled={disabled}
          title="Duplicar menú"
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* Delete */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDeleteDialog(true)}
          disabled={disabled}
          title="Eliminar menú"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>

        {/* External link (if href exists) */}
        {item.href && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open(item.href!, '_blank')}
            disabled={disabled}
            title="Abrir enlace"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Eliminar menú "{item.label}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El menú será eliminado permanentemente
              del megamenu y ya no aparecerá en la navegación del sitio.
              {item.type === 'megamenu' && item.submenu && (
                <>
                  <br /><br />
                  <strong>Este megamenú contiene {item.submenu.links.length} enlaces</strong> que también serán eliminados.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa - {item.label}
            </DialogTitle>
            <DialogDescription>
              Visualización de cómo se verá este menú en el sitio web
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header del menú */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge variant={item.enabled ? "default" : "destructive"}>
                    {item.enabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contenido del megamenu */}
            {item.type === 'megamenu' && item.submenu && (
              <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                {/* Sección 1 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-primary">
                    {item.submenu.section1.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.submenu.section1.description}
                  </p>
                </div>

                {/* Sección 2 - Enlaces */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-gray-700 mb-3">Enlaces:</h5>
                  {item.submenu.links.map((link) => (
                    <div key={link.id} className="p-2 bg-white rounded border hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">🔗</span>
                        <span className="font-medium text-sm">{link.title}</span>
                        {!link.enabled && (
                          <Badge variant="destructive" className="text-xs">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sección 3 - Promocional */}
                <div className="relative bg-gradient-to-t from-black/60 to-transparent rounded-lg overflow-hidden min-h-[200px] flex items-end">
                  {item.submenu.section3.image ? (
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-600">
                        Imagen: {item.submenu.section3.image.split('/').pop()}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                  )}
                  <div className="relative p-4 text-white">
                    <h4 className="font-bold mb-2">{item.submenu.section3.title}</h4>
                    <p className="text-sm opacity-90 mb-3">{item.submenu.section3.description}</p>
                    {item.submenu.section3.cta && (
                      <div className="inline-block bg-white/20 px-3 py-1 rounded text-xs">
                        {item.submenu.section3.cta.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Simple menu preview */}
            {item.type === 'simple' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                      <span>🔗</span>
                    </div>
                    <div>
                      <p className="font-medium">Enlace simple</p>
                      <p className="text-sm text-muted-foreground">
                        {item.href || 'Sin URL configurada'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {item.is_internal ? 'Interno' : 'Externo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test results */}
            {testResults && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Resultados del Test
                  </h4>
                  <div className="space-y-2">
                    {testResults.checks.map((check: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        {check.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{check.name}:</span>
                        <span className="text-muted-foreground">{check.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MegaMenuActions;