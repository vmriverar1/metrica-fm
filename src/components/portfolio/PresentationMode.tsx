'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Maximize2,
  Minimize2,
  X,
  Settings,
  Monitor,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, getCategoryLabel, getCategoryColor } from '@/types/portfolio';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PresentationSettings {
  autoPlay: boolean;
  duration: number; // seconds per slide
  showInfo: boolean;
  showProgress: boolean;
  sound: boolean;
  transition: 'fade' | 'slide' | 'zoom';
}

interface PresentationModeProps {
  isPresenting?: boolean;
  onStartPresentation?: () => void;
  onExitPresentation?: () => void;
}

export default function PresentationMode({ 
  isPresenting: externalIsPresenting, 
  onStartPresentation,
  onExitPresentation 
}: PresentationModeProps = {}) {
  const { allProjects } = usePortfolio();
  const [isPresenting, setIsPresenting] = useState(externalIsPresenting || false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  
  const [settings, setSettings] = useState<PresentationSettings>({
    autoPlay: true,
    duration: 5,
    showInfo: true,
    showProgress: true,
    sound: false,
    transition: 'fade'
  });

  const presentationRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const controlsTimeout = useRef<NodeJS.Timeout>();

  // Featured projects for presentation
  const presentationProjects = allProjects.filter(p => p.featured || p.tags.includes('premiado'));

  const currentProject = presentationProjects[currentIndex];

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && settings.autoPlay) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + (100 / (settings.duration * 10));
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(0);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentIndex, settings.autoPlay, settings.duration]);

  // Auto-hide controls
  useEffect(() => {
    if (isPresenting) {
      const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
          if (!showSettings) {
            setShowControls(false);
          }
        }, 4000); // Increased from 3s to 4s for better UX
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', handleMouseMove);
      }
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('mousemove', handleMouseMove);
        }
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
      };
    }
  }, [isPresenting, showSettings]);

  // Keyboard controls
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          exitPresentation();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case 'ArrowLeft':
          previousSlide();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [isPresenting, currentIndex]);

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentIndex(0);
    setIsPlaying(settings.autoPlay);
    document.body.style.overflow = 'hidden';
    onStartPresentation?.();
  };

  const exitPresentation = () => {
    setIsPresenting(false);
    setIsPlaying(false);
    setShowSettings(false);
    document.body.style.overflow = 'unset';
    if (fullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
    onExitPresentation?.();
  };

  // Sync external state
  React.useEffect(() => {
    if (externalIsPresenting !== undefined) {
      setIsPresenting(externalIsPresenting);
    }
  }, [externalIsPresenting]);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev < presentationProjects.length - 1 ? prev + 1 : 0
    );
    setProgress(0);
  };

  const previousSlide = () => {
    setCurrentIndex(prev => 
      prev > 0 ? prev - 1 : presentationProjects.length - 1
    );
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await presentationRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const getTransitionStyle = () => {
    switch (settings.transition) {
      case 'slide':
        return {
          initial: { x: 300, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -300, opacity: 0 }
        };
      case 'zoom':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  if (!isPresenting) {
    return null; // Floating button is now handled by FloatingButtons component
  }

  return (
    <motion.div
      ref={presentationRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          {...getTransitionStyle()}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {/* Background Image */}
          <Image
            src={currentProject.featuredImage}
            alt={currentProject.title}
            fill
            className="object-cover"
            priority
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Project Info */}
          {settings.showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                paddingBottom: showControls ? '200px' : '80px' // Extra space when controls are visible
              }}
              transition={{ 
                delay: 0.3,
                paddingBottom: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } // Smooth padding transition
              }}
              className="absolute bottom-0 left-0 right-0 p-8 md:p-16"
            >
              <div className="max-w-4xl">
                <div 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: getCategoryColor(currentProject.category) }}
                >
                  {getCategoryLabel(currentProject.category)}
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {currentProject.title}
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                  {currentProject.description}
                </p>
                
                <div className="flex flex-wrap gap-6 text-white/80">
                  <div>
                    <span className="text-sm text-white/60">Ubicación</span>
                    <p className="font-medium">{currentProject.location.city}, {currentProject.location.region}</p>
                  </div>
                  <div>
                    <span className="text-sm text-white/60">Área</span>
                    <p className="font-medium">{currentProject.details.area}</p>
                  </div>
                  <div>
                    <span className="text-sm text-white/60">Inversión</span>
                    <p className="font-medium">{currentProject.details.investment || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-white/60">Duración</span>
                    <p className="font-medium">{currentProject.details.duration}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {/* Progress Bar */}
            {settings.showProgress && (
              <div className="mb-4">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={previousSlide}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={nextSlide}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                
                <div className="text-white/60 text-sm ml-4">
                  {currentIndex + 1} / {presentationProjects.length}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={exitPresentation}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slide Thumbnails */}
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {presentationProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-all",
                    currentIndex === index
                      ? "border-white scale-110"
                      : "border-white/20 hover:border-white/50"
                  )}
                >
                  <Image
                    src={project.thumbnailImage || project.featuredImage}
                    alt={project.title}
                    width={80}
                    height={56}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-sm p-6 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Auto-play */}
              <div>
                <label className="flex items-center justify-between">
                  <span>Reproducción automática</span>
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                    className="toggle"
                  />
                </label>
              </div>

              {/* Duration */}
              <div>
                <label className="block mb-2">
                  Duración por diapositiva: {settings.duration}s
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Show Info */}
              <div>
                <label className="flex items-center justify-between">
                  <span>Mostrar información</span>
                  <input
                    type="checkbox"
                    checked={settings.showInfo}
                    onChange={(e) => setSettings(prev => ({ ...prev, showInfo: e.target.checked }))}
                    className="toggle"
                  />
                </label>
              </div>

              {/* Show Progress */}
              <div>
                <label className="flex items-center justify-between">
                  <span>Mostrar progreso</span>
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={(e) => setSettings(prev => ({ ...prev, showProgress: e.target.checked }))}
                    className="toggle"
                  />
                </label>
              </div>

              {/* Transition Type */}
              <div>
                <label className="block mb-2">Transición</label>
                <select
                  value={settings.transition}
                  onChange={(e) => setSettings(prev => ({ ...prev, transition: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg"
                >
                  <option value="fade">Desvanecer</option>
                  <option value="slide">Deslizar</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h4 className="font-medium mb-4">Atajos de teclado</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Reproducir/Pausar</span>
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">Espacio</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Siguiente</span>
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Anterior</span>
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Pantalla completa</span>
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">F</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Salir</span>
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">ESC</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}