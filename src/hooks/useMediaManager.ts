'use client';

import { useState, useCallback } from 'react';

interface UseMediaManagerOptions {
  multiple?: boolean;
  allowUpload?: boolean;
  allowExternal?: boolean;
  categories?: string[];
  filters?: ('images' | 'videos' | 'audio' | 'documents')[];
  maxFileSize?: number;
}

export function useMediaManager(options: UseMediaManagerOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const openMediaManager = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMediaManager = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback((url: string) => {
    setSelectedUrls([url]);
    setIsOpen(false);
  }, []);

  const handleMultiSelect = useCallback((urls: string[]) => {
    setSelectedUrls(urls);
    setIsOpen(false);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedUrls([]);
  }, []);

  // Helper to get single URL (for non-multiple mode)
  const selectedUrl = selectedUrls.length > 0 ? selectedUrls[0] : null;

  return {
    isOpen,
    selectedUrl,
    selectedUrls,
    openMediaManager,
    closeMediaManager,
    handleSelect,
    handleMultiSelect,
    resetSelection,
    // Configuration
    mediaManagerProps: {
      isOpen,
      onClose: closeMediaManager,
      onSelect: options.multiple ? undefined : handleSelect,
      onMultiSelect: options.multiple ? handleMultiSelect : undefined,
      multiple: options.multiple || false,
      allowUpload: options.allowUpload ?? true,
      allowExternal: options.allowExternal ?? true,
      categories: options.categories || ['hero', 'services', 'portfolio', 'pillars', 'policies', 'general'],
      filters: options.filters || ['images', 'videos', 'documents'],
      maxFileSize: options.maxFileSize || 10
    }
  };
}