'use client';

import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  className?: string;
}

export default function YouTubeEmbed({
  videoId,
  title,
  description,
  className = ""
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generar URL de thumbnail de YouTube
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
  };

  const handleOpenInYouTube = () => {
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {!isPlaying ? (
        // Thumbnail con overlay de play
        <div className="relative group cursor-pointer" onClick={handlePlay}>
          <div className="aspect-video relative overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Botón de play centrado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              </motion.div>
            </div>

            {/* Duración simulada (opcional) */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              Testimonio
            </div>
          </div>

          {/* Información del video */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {title}
            </h3>
            {description && (
              <p className="text-slate-300 text-sm line-clamp-2">
                {description}
              </p>
            )}

            {/* Botón para abrir en YouTube */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInYouTube();
              }}
              className="mt-3 inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en YouTube
            </button>
          </div>
        </div>
      ) : (
        // iframe embebido
        <div className="aspect-video">
          <iframe
            src={videoUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}

      {/* Indicador de carga */}
      {isPlaying && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}
    </motion.div>
  );
}

// Estilos para line-clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Agregar estilos al componente
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}