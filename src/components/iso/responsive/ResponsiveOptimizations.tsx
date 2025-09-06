'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react'

// Hook para detectar el tamaño de pantalla
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth < 768) {
        setBreakpoint('mobile')
      } else if (window.innerWidth < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  return breakpoint
}

// Componente responsivo para cards de métricas
interface ResponsiveMetricCardProps {
  title: string
  value: string
  target: string
  progress: number
  status: 'achieved' | 'in_progress' | 'not_met'
  description: string
  icon: React.ReactNode
  trend: string
}

export function ResponsiveMetricCard({
  title,
  value,
  target,
  progress,
  status,
  description,
  icon,
  trend
}: ResponsiveMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const breakpoint = useBreakpoint()

  const statusColors = {
    achieved: 'bg-green-100 text-green-800 border-green-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    not_met: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Mobile/Tablet: Collapsible design */}
      {breakpoint !== 'desktop' ? (
        <>
          <CardHeader 
            className="pb-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#007bc4]/10 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold text-gray-900 truncate">
                    {title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold text-[#007bc4]">{value}</span>
                    <Badge className={`${statusColors[status]} text-xs`}>
                      {status === 'achieved' ? 'Logrado' : status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progreso hacia meta: {target}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-[#007bc4] h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {description}
                    </p>

                    {/* Trend */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Tendencia:</span>
                      <div className={`flex items-center gap-1 text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="font-medium">{trend}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Desktop: Full layout */
        <>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#007bc4]/10 flex items-center justify-center">
                  {icon}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {title}
                </CardTitle>
              </div>
              <Badge className={statusColors[status]}>
                {status === 'achieved' ? 'Logrado' : status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-[#007bc4]">{value}</div>
                <div className="text-sm text-gray-600">
                  Meta: <span className="font-medium">{target}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                <span className="text-sm font-medium">{trend}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-[#007bc4] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}

// Grid responsivo optimizado
interface ResponsiveGridProps {
  children: React.ReactNode[]
  minItemWidth?: string
  gap?: string
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  minItemWidth = "300px", 
  gap = "gap-6",
  className = "" 
}: ResponsiveGridProps) {
  return (
    <div 
      className={`grid ${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  )
}

// Navegación móvil optimizada
interface MobileNavigationProps {
  sections: Array<{
    id: string
    title: string
    icon?: React.ReactNode
  }>
  currentSection: string
  onSectionChange: (sectionId: string) => void
}

export function MobileNavigation({ 
  sections, 
  currentSection, 
  onSectionChange 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const breakpoint = useBreakpoint()

  if (breakpoint === 'desktop') return null

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 md:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#007bc4] hover:bg-[#007bc4]/90 shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Navegación</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      onSectionChange(section.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      currentSection === section.id
                        ? 'bg-[#007bc4] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Componente de testimonios responsive
interface ResponsiveTestimonialCardProps {
  testimonial: {
    id: number
    quote: string
    author: string
    position: string
    company: string
    rating: number
    date: string
    project: string
  }
}

export function ResponsiveTestimonialCard({ testimonial }: ResponsiveTestimonialCardProps) {
  const breakpoint = useBreakpoint()

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300">
      <CardContent className={`${breakpoint === 'mobile' ? 'p-4' : 'p-6'} h-full flex flex-col`}>
        {/* Quote */}
        <div className="flex-1 mb-4">
          <blockquote className={`text-gray-700 leading-relaxed italic ${
            breakpoint === 'mobile' ? 'text-sm' : 'text-base'
          }`}>
            "{testimonial.quote}"
          </blockquote>
        </div>

        {/* Author Info */}
        <div className="space-y-3">
          {/* Mobile: Compact layout */}
          {breakpoint === 'mobile' ? (
            <>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-[#007bc4]/10 flex items-center justify-center text-[#007bc4] font-semibold text-sm`}>
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {testimonial.author}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">{testimonial.position}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index < testimonial.rating ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">{testimonial.date}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {testimonial.project}
                </Badge>
                <span className="text-xs text-gray-500">{testimonial.company}</span>
              </div>
            </>
          ) : (
            /* Desktop/Tablet: Full layout */
            <>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-[#007bc4]/10 flex items-center justify-center text-[#007bc4] font-semibold`}>
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full ${
                        index < testimonial.rating ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500">{testimonial.date}</div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <Badge variant="secondary">
                  {testimonial.project}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Indicador de breakpoint (solo para desarrollo)
export function BreakpointIndicator() {
  const breakpoint = useBreakpoint()
  
  if (process.env.NODE_ENV !== 'development') return null

  const icons = {
    mobile: <Smartphone className="w-4 h-4" />,
    tablet: <Tablet className="w-4 h-4" />,
    desktop: <Monitor className="w-4 h-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
    >
      {icons[breakpoint]}
      <span className="capitalize">{breakpoint}</span>
    </motion.div>
  )
}

// Configuración de clases CSS responsive optimizadas
export const RESPONSIVE_CLASSES = {
  // Grids
  grid: {
    metrics: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    testimonials: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    benefits: "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8",
    stats: "grid grid-cols-2 md:grid-cols-4 gap-4"
  },
  
  // Spacing
  spacing: {
    section: "py-12 md:py-16 lg:py-20",
    container: "px-4 sm:px-6 lg:px-8",
    cardPadding: "p-4 md:p-6",
    headerMargin: "mb-8 md:mb-12"
  },
  
  // Typography
  typography: {
    hero: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
    section: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
    subtitle: "text-base sm:text-lg md:text-xl",
    body: "text-sm sm:text-base"
  },
  
  // Flex layouts
  flex: {
    center: "flex flex-col md:flex-row items-center gap-4 md:gap-6",
    between: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
    wrap: "flex flex-wrap gap-2 md:gap-4"
  }
} as const