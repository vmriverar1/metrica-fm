'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUp,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  ChevronRight,
  Home
} from 'lucide-react'

// Hook para manejar el foco y navegación por teclado
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Tab':
          // Tab navigation is handled natively
          break
        case 'Escape':
          setFocusedIndex(-1)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev => prev + 1)
          break
        case 'Enter':
        case ' ':
          // Handle activation
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { focusedIndex, setFocusedIndex }
}

// Componente de salto de navegación para lectores de pantalla
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-[#00A8E8] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 z-50 bg-[#00A8E8] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar a navegación
      </a>
    </div>
  )
}

// Breadcrumb accesible con navegación por teclado
interface AccessibleBreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
}

export function AccessibleBreadcrumb({ items }: AccessibleBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" aria-hidden="true" />
            )}
            {item.current ? (
              <span 
                className="font-medium text-gray-900"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="text-gray-600 hover:text-[#00A8E8] focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:ring-offset-2 rounded-md px-1 py-0.5"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Botón de scroll to top accesible
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <Button
            onClick={scrollToTop}
            size="sm"
            className="rounded-full w-12 h-12 bg-[#00A8E8] hover:bg-[#00A8E8]/90 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:ring-offset-2"
            aria-label="Volver al inicio de la página"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente de notificaciones accesibles con ARIA live regions
interface AccessibleNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export function AccessibleNotification({
  type,
  title,
  description,
  onClose,
  autoClose = true,
  duration = 5000
}: AccessibleNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const IconComponent = icons[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-6 right-6 z-50 max-w-md"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <Card className={`border ${colors[type]} shadow-lg`}>
            <CardContent className="flex items-start gap-3 p-4">
              <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm opacity-90 mt-1">{description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="p-1 h-auto hover:bg-black/10"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Indicador de progreso de lectura
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full bg-[#00A8E8] origin-left"
        style={{ scaleX: progress / 100 }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  )
}

// Modo alto contraste
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isHighContrast])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsHighContrast(!isHighContrast)}
      className="fixed top-20 right-4 z-40 bg-white shadow-md border"
      aria-label={isHighContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
      aria-pressed={isHighContrast}
    >
      {isHighContrast ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </Button>
  )
}

// Reducir animaciones para usuarios sensibles
export function ReducedMotionToggle() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [prefersReducedMotion])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
      className="fixed top-32 right-4 z-40 bg-white shadow-md border"
      aria-label={prefersReducedMotion ? "Activar animaciones" : "Reducir animaciones"}
      aria-pressed={prefersReducedMotion}
    >
      {prefersReducedMotion ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
    </Button>
  )
}

// Tooltip accesible
interface AccessibleTooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function AccessibleTooltip({ 
  content, 
  children, 
  position = 'top' 
}: AccessibleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setShouldShow(true)
    timeoutRef.current = setTimeout(() => setIsVisible(true), 100)
  }, [])

  const hideTooltip = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
    timeoutRef.current = setTimeout(() => setShouldShow(false), 200)
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <div
        aria-describedby={isVisible ? tooltipId.current : undefined}
        tabIndex={0}
        className="focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:ring-offset-2 rounded"
      >
        {children}
      </div>
      
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            id={tooltipId.current}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none whitespace-nowrap ${positionClasses[position]}`}
          >
            {content}
            {/* Arrow */}
            <div 
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
                'right-full top-1/2 -translate-y-1/2 -mr-1'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook para anuncios a lectores de pantalla
export function useScreenReaderAnnouncements() {
  const [announcement, setAnnouncement] = useState('')

  const announce = useCallback((message: string) => {
    setAnnouncement(message)
    // Clear after announcement
    setTimeout(() => setAnnouncement(''), 1000)
  }, [])

  return {
    announcement,
    announce,
    AnnouncementRegion: () => (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    )
  }
}

// Estado de carga accesible
interface AccessibleLoadingProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

export function AccessibleLoading({ 
  isLoading, 
  loadingText = "Cargando contenido...", 
  children 
}: AccessibleLoadingProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-5 h-5 border-2 border-[#00A8E8] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-gray-600">{loadingText}</span>
          </div>
        </div>
      )}
      <div aria-hidden={isLoading}>
        {children}
      </div>
    </div>
  )
}

// Configuración de CSS para mejoras de accesibilidad
export const ACCESSIBILITY_CSS = `
  /* Alto contraste */
  .high-contrast {
    filter: contrast(1.5) brightness(1.2);
  }
  
  .high-contrast button {
    border: 2px solid currentColor !important;
  }
  
  .high-contrast a {
    text-decoration: underline !important;
  }
  
  /* Reducir movimiento */
  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Focus visible */
  .focus-visible:focus {
    outline: 2px solid #00A8E8 !important;
    outline-offset: 2px !important;
  }
  
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .sr-only.focus-within:not-sr-only {
    position: static;
    width: auto;
    height: auto;
    padding: initial;
    margin: initial;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
  
  /* Improved touch targets */
  @media (pointer: coarse) {
    button, a[role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  /* Respeta las preferencias del usuario */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  
  @media (prefers-contrast: high) {
    :root {
      --contrast-multiplier: 1.5;
    }
  }
`