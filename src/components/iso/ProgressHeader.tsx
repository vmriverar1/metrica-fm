'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Section {
  id: string
  title: string
  isActive?: boolean
  isCompleted?: boolean
}

interface ProgressHeaderProps {
  sections: Section[]
  currentSection: string
  completedSections: string[]
}

export function ProgressHeader({ sections, currentSection, completedSections }: ProgressHeaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      
      setScrollProgress(Math.min(progress, 100))
      setIsVisible(scrollTop > 100) // Show after scrolling 100px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentSectionIndex = sections.findIndex(section => section.id === currentSection)
  const totalSections = sections.length
  const completedCount = completedSections.length

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">
              ISO 9001:2015 Certificación
            </h2>
            <Badge variant="secondary" className="text-xs">
              {currentSectionIndex + 1} de {totalSections}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{completedCount}/{totalSections} completadas</span>
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#007bc4] transition-all duration-300"
                style={{ width: `${(completedCount / totalSections) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Reading Progress Bar */}
        <Progress 
          value={scrollProgress} 
          className="h-1 w-full"
        />
        
        {/* Current Section Indicator */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>Leyendo:</span>
          <span className="font-medium text-gray-700">
            {sections.find(s => s.id === currentSection)?.title || 'Certificación ISO 9001'}
          </span>
        </div>
      </div>
    </div>
  )
}