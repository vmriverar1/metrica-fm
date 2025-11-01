'use client';

// FASE 4C: Web Share API Component
// Componente para compartir contenido usando la Web Share API nativa

import { useState, useEffect } from 'react';
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface ShareButtonProps {
  data: ShareData;
  className?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ShareButton({
  data,
  className = '',
  variant = 'button',
  size = 'md',
  showLabel = true
}: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(navigator.share && navigator.canShare ? navigator.canShare(data) : false);
  }, [data]);

  const handleNativeShare = async () => {
    if (!canShare || !navigator.share) return;

    try {
      await navigator.share(data);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        setShowFallback(true);
      }
    }
  };

  const handleFallbackShare = () => {
    setShowFallback(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url || window.location.href)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text || data.title || '')}&url=${encodeURIComponent(data.url || window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url || window.location.href)}`,
    email: `mailto:?subject=${encodeURIComponent(data.title || '')}&body=${encodeURIComponent((data.text || '') + ' ' + (data.url || window.location.href))}`
  };

  const openShareWindow = (url: string) => {
    window.open(url, 'share', 'width=600,height=400,scrollbars=yes,resizable=yes');
    setShowFallback(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  // Main share button
  const ShareMainButton = () => {
    const baseClasses = `
      inline-flex items-center gap-2 font-medium transition-colors rounded-lg
      ${getSizeClasses()}
      ${className}
    `;

    if (variant === 'icon') {
      return (
        <button
          onClick={canShare ? handleNativeShare : handleFallbackShare}
          className={`${baseClasses} bg-blue-50 text-blue-600 hover:bg-blue-100`}
          title="Compartir"
        >
          <Share2 className={getIconSize()} />
        </button>
      );
    }

    if (variant === 'text') {
      return (
        <button
          onClick={canShare ? handleNativeShare : handleFallbackShare}
          className={`${baseClasses} text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
        >
          <Share2 className={getIconSize()} />
          {showLabel && 'Compartir'}
        </button>
      );
    }

    return (
      <button
        onClick={canShare ? handleNativeShare : handleFallbackShare}
        className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700`}
      >
        <Share2 className={getIconSize()} />
        {showLabel && 'Compartir'}
      </button>
    );
  };

  // Fallback share options
  if (showFallback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-sm">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Compartir contenido</h3>
              <button
                onClick={() => setShowFallback(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {data.title && (
              <p className="text-sm text-gray-600 mt-1 truncate">{data.title}</p>
            )}
          </div>

          {/* Share options */}
          <div className="p-4 space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {copied ? 'Enlace copiado!' : 'Copiar enlace'}
              </span>
            </button>

            <button
              onClick={() => openShareWindow(shareUrls.facebook)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Facebook</span>
            </button>

            <button
              onClick={() => openShareWindow(shareUrls.twitter)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              <span className="font-medium text-gray-900">Twitter</span>
            </button>

            <button
              onClick={() => openShareWindow(shareUrls.linkedin)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              <span className="font-medium text-gray-900">LinkedIn</span>
            </button>

            <button
              onClick={() => openShareWindow(shareUrls.email)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Email</span>
            </button>
          </div>

          {/* Cancel */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowFallback(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ShareMainButton />;
}

// Hook to use Web Share API
export function useWebShare() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const share = async (data: ShareData) => {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    try {
      await navigator.share(data);
      return { success: true };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  };

  return { canShare, share };
}

// Utility function to create share data for different content types
export function createShareData(type: 'project' | 'service' | 'page', content: any): ShareData {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  switch (type) {
    case 'project':
      return {
        title: `${content.title} - Métrica FM`,
        text: `Conoce nuestro proyecto: ${content.title}. ${content.description || ''}`,
        url: `${baseUrl}/portfolio/${content.slug}`
      };

    case 'service':
      return {
        title: `${content.title} - Servicios Métrica FM`,
        text: `Descubre nuestro servicio de ${content.title}. Ingeniería y construcción en Perú.`,
        url: `${baseUrl}/services#${content.slug}`
      };

    case 'page':
      return {
        title: content.title || 'Métrica FM - Ingeniería y Construcción',
        text: content.description || 'Gerencia de proyectos, supervisión de obras y desarrollo de ingeniería en Perú',
        url: content.url || `${baseUrl}`
      };

    default:
      return {
        title: 'Métrica FM - Ingeniería y Construcción',
        text: 'Gerencia de proyectos, supervisión de obras y desarrollo de ingeniería en Perú',
        url: baseUrl
      };
  }
}