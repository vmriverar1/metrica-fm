'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  BookOpen, 
  Shield, 
  Users, 
  MessageCircle, 
  Workflow, 
  BarChart3, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  id: string
  icon: keyof typeof iconMap
  label: string
  target: string
  isActive?: boolean
  isCompleted?: boolean
}

const iconMap = {
  Award,
  BookOpen,
  Shield,
  Users,
  MessageCircle,
  Workflow,
  BarChart3,
  Calendar
}

interface FloatingNavigationProps {
  items: NavItem[]
  currentSection: string
  completedSections: string[]
  onSectionChange: (sectionId: string) => void
}

export function FloatingNavigation({ 
  items, 
  currentSection, 
  completedSections, 
  onSectionChange 
}: FloatingNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (target: string, sectionId: string) => {
    const element = document.querySelector(target)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
      onSectionChange(sectionId)
      setIsExpanded(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className={`
        bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300
        ${isExpanded ? 'w-64' : 'w-12'}
      `}>
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-12 flex items-center justify-center rounded-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        {/* Navigation Items */}
        {isExpanded && (
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
              Secciones ISO
            </div>
            
            {items.map((item) => {
              const IconComponent = iconMap[item.icon]
              const isActive = currentSection === item.id
              const isCompleted = completedSections.includes(item.id)
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.target, item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all
                    hover:bg-gray-50 group relative
                    ${isActive 
                      ? 'bg-[#E84E0F]/10 text-[#E84E0F] font-medium' 
                      : 'text-gray-700 hover:text-gray-900'
                    }
                    ${isCompleted && !isActive
                      ? 'bg-green-50 text-green-700'
                      : ''
                    }
                  `}
                >
                  <div className="relative">
                    <IconComponent className="w-4 h-4" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  
                  <span className="flex-1 text-left truncate">
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className="w-1 h-4 bg-[#E84E0F] rounded-full" />
                  )}
                </button>
              )
            })}
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 px-3">
                {completedSections.length}/{items.length} completadas
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mini Progress Indicator when collapsed */}
      {!isExpanded && (
        <div className="mt-2 w-12 flex flex-col items-center gap-1">
          {items.map((item, index) => {
            const isActive = currentSection === item.id
            const isCompleted = completedSections.includes(item.id)
            
            return (
              <div
                key={item.id}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${isActive 
                    ? 'bg-[#E84E0F] scale-125' 
                    : isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }
                `}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}