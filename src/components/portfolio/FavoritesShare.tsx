'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  Copy, 
  Download, 
  Mail, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Project } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { usePortfolio } from '@/contexts/PortfolioContext';
import Image from 'next/image';

interface FavoritesShareProps {
  project?: Project;
  showFavoritesPanel?: boolean;
}

export default function FavoritesShare({ project, showFavoritesPanel = false }: FavoritesShareProps) {
  const { allProjects } = usePortfolio();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFavorites, setShowFavorites] = useState(showFavoritesPanel);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteProjects');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteProjects', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (projectId: string) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const isFavorite = (projectId: string) => favorites.includes(projectId);

  const favoriteProjects = allProjects.filter(p => favorites.includes(p.id));

  // Share functions
  const shareUrl = project 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${project.category}/${project.slug}`
    : typeof window !== 'undefined' ? window.location.href : '';

  const shareTitle = project 
    ? `${project.title} - Métrica DIP`
    : 'Portafolio de Proyectos - Métrica DIP';

  const shareDescription = project?.description || 'Explora nuestro portafolio de proyectos de infraestructura';

  const shareOptions = [
    {
      id: 'copy',
      label: 'Copiar enlace',
      icon: <Copy className="w-4 h-4" />,
      action: async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-4 h-4" />,
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareDescription + '\n\n' + shareUrl)}`);
      }
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + '\n' + shareDescription + '\n' + shareUrl)}`);
      }
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
      }
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: <Twitter className="w-4 h-4" />,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`);
      }
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
      }
    }
  ];

  // Generate PDF portfolio
  const downloadPortfolio = async () => {
    setDownloading(true);
    
    // Create a simple HTML document with favorites
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Portafolio Favoritos - Métrica DIP</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #003F6F; }
            .project { margin-bottom: 30px; page-break-inside: avoid; }
            .project img { max-width: 100%; height: auto; }
            .project h2 { color: #E84E0F; }
            .meta { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Portafolio de Proyectos Favoritos</h1>
          <p>Métrica DIP - Dirección Integral de Proyectos</p>
          <hr>
          ${favoriteProjects.map(p => `
            <div class="project">
              <h2>${p.title}</h2>
              <p class="meta">${p.location.city}, ${p.location.region} | ${p.details.area}</p>
              <p>${p.description}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-favoritos-metrica.html';
    a.click();
    URL.revokeObjectURL(url);
    
    setDownloading(false);
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 left-4 z-40 space-y-3">
        {/* Favorites Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFavorites(!showFavorites)}
          className={cn(
            "relative bg-background border-2 rounded-full p-3 shadow-lg transition-all",
            favorites.length > 0 ? "border-red-500" : "border-border"
          )}
        >
          <Heart className={cn(
            "w-5 h-5 transition-colors",
            favorites.length > 0 ? "text-red-500 fill-red-500" : "text-muted-foreground"
          )} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </motion.button>

        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-background border-2 border-border rounded-full p-3 shadow-lg hover:border-accent transition-all"
        >
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Project Favorite Button (when project is provided) */}
      {project && (
        <button
          onClick={() => toggleFavorite(project.id)}
          className={cn(
            "absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm transition-all",
            isFavorite(project.id)
              ? "bg-red-500 text-white"
              : "bg-white/80 hover:bg-white text-gray-700"
          )}
        >
          <Heart className={cn(
            "w-5 h-5",
            isFavorite(project.id) && "fill-current"
          )} />
        </button>
      )}

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="fixed bottom-48 left-4 z-50 bg-background border rounded-xl shadow-xl p-2 min-w-[200px]"
          >
            <div className="flex items-center justify-between p-2 border-b mb-2">
              <span className="font-semibold text-sm">Compartir</span>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {shareOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  option.action();
                  if (option.id !== 'copy') setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
              >
                {option.icon}
                <span className="text-sm">{option.label}</span>
                {option.id === 'copy' && copied && (
                  <Check className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Panel */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  Mis Favoritos
                </h2>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-sm">
                {favorites.length} proyecto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Favorites List */}
            <div className="h-[calc(100%-160px)] overflow-y-auto p-4">
              {favoriteProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No tienes proyectos favoritos aún
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Marca proyectos como favoritos para verlos aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteProjects.map(project => (
                    <div key={project.id} className="group relative">
                      <a
                        href={`/portfolio/${project.category}/${project.slug}`}
                        className="block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={project.thumbnailImage || project.featuredImage}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {project.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {project.location.city} • {project.details.area}
                          </p>
                        </div>
                      </a>
                      <button
                        onClick={() => toggleFavorite(project.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {favoriteProjects.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <button
                  onClick={downloadPortfolio}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar Portfolio
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}