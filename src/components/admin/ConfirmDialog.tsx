'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  onConfirm,
  onCancel,
  loading = false
}) => {
  const getIcon = () => {
    const icons = {
      danger: XCircle,
      warning: AlertTriangle,
      info: Info,
      success: CheckCircle
    };
    return icons[variant];
  };

  const getIconColor = () => {
    const colors = {
      danger: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
      success: 'text-green-600'
    };
    return colors[variant];
  };

  const getButtonVariant = () => {
    const variants = {
      danger: 'destructive' as const,
      warning: 'destructive' as const,
      info: 'default' as const,
      success: 'default' as const
    };
    return variants[variant];
  };

  const Icon = getIcon();

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${getIconColor()}`} />
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
    onCancel?: () => void;
    loading?: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const confirm = (options: Omit<typeof confirmDialog, 'open'>) => {
    setConfirmDialog({
      ...options,
      open: true
    });
  };

  const close = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const setLoading = (loading: boolean) => {
    setConfirmDialog(prev => ({ ...prev, loading }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      {...confirmDialog}
      onOpenChange={close}
    />
  );

  return {
    confirm,
    close,
    setLoading,
    ConfirmDialog: ConfirmDialogComponent
  };
};