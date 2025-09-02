'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const { enabled = true, shortcuts } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Avoid conflicts with browser shortcuts or form inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Only allow specific shortcuts in form inputs (like Ctrl+S)
      const allowedInInputs = ['s', 'z', 'y'];
      if (!allowedInInputs.includes(event.key.toLowerCase())) return;
    }

    const matchingShortcut = shortcuts.find(shortcut => 
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      (shortcut.ctrlKey || false) === event.ctrlKey &&
      (shortcut.altKey || false) === event.altKey &&
      (shortcut.shiftKey || false) === event.shiftKey
    );

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts,
    enabled
  };
}

// Hook específico para formularios con shortcuts predefinidos
export function useFormShortcuts({
  onSave,
  onCancel,
  onPreview,
  onUndo,
  onRedo,
  onFind,
  enabled = true
}: {
  onSave?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Save - Already handled by auto-save, but keeping for manual trigger
    {
      key: 's',
      ctrlKey: true,
      action: () => onSave?.(),
      description: 'Guardar (Ctrl+S)'
    },
    // Cancel/Escape
    {
      key: 'Escape',
      action: () => onCancel?.(),
      description: 'Cancelar (ESC)'
    },
    // Preview
    {
      key: 'p',
      ctrlKey: true,
      action: () => onPreview?.(),
      description: 'Vista previa (Ctrl+P)'
    },
    // Undo
    {
      key: 'z',
      ctrlKey: true,
      action: () => onUndo?.(),
      description: 'Deshacer (Ctrl+Z)'
    },
    // Redo
    {
      key: 'y',
      ctrlKey: true,
      action: () => onRedo?.(),
      description: 'Rehacer (Ctrl+Y)'
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => onRedo?.(),
      description: 'Rehacer (Ctrl+Shift+Z)'
    },
    // Find
    {
      key: 'f',
      ctrlKey: true,
      action: () => onFind?.(),
      description: 'Buscar campo (Ctrl+F)'
    }
  ].filter(shortcut => {
    // Only include shortcuts that have an action
    return shortcut.action !== undefined;
  });

  const shortcutResult = useKeyboardShortcuts({
    enabled,
    shortcuts
  });

  return {
    ...shortcutResult,
    getShortcutsList: () => shortcuts.map(s => s.description)
  };
}