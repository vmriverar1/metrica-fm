'use client'

import { useState, useEffect, useCallback } from 'react'

interface ISOSection {
  id: string
  title: string
  target: string
  icon: string
}

interface UseISONavigationReturn {
  currentSection: string
  completedSections: string[]
  sections: ISOSection[]
  setCurrentSection: (sectionId: string) => void
  markSectionCompleted: (sectionId: string) => void
  resetProgress: () => void
  getSectionProgress: () => number
}

const ISO_SECTIONS: ISOSection[] = [
  {
    id: 'hero',
    title: 'Certificación',
    target: '#hero',
    icon: 'Award'
  },
  {
    id: 'introduction',
    title: '¿Qué es ISO?',
    target: '#introduction',
    icon: 'BookOpen'
  },
  {
    id: 'quality-policy',
    title: 'Política',
    target: '#quality-policy',
    icon: 'Shield'
  },
  {
    id: 'client-benefits',
    title: 'Beneficios', 
    target: '#client-benefits',
    icon: 'Users'
  },
  {
    id: 'testimonials',
    title: 'Testimonios',
    target: '#testimonials',
    icon: 'MessageCircle'
  },
  {
    id: 'process-overview',
    title: 'Proceso',
    target: '#process-overview',
    icon: 'Workflow'
  },
  {
    id: 'certifications-standards',
    title: 'Certificaciones',
    target: '#certifications-standards',
    icon: 'Award'
  },
  {
    id: 'quality-metrics',
    title: 'Métricas',
    target: '#quality-metrics',
    icon: 'BarChart3'
  },
  {
    id: 'audit-information',
    title: 'Auditorías',
    target: '#audit-information',
    icon: 'Calendar'
  }
]

const STORAGE_KEY = 'iso-navigation-state'

export function useISONavigation(): UseISONavigationReturn {
  const [currentSection, setCurrentSectionState] = useState<string>('hero')
  const [completedSections, setCompletedSections] = useState<string[]>([])
  
  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const { currentSection: savedCurrent, completedSections: savedCompleted } = JSON.parse(saved)
          if (savedCurrent) setCurrentSectionState(savedCurrent)
          if (Array.isArray(savedCompleted)) setCompletedSections(savedCompleted)
        } catch (error) {
          console.error('Error loading ISO navigation state:', error)
        }
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = { currentSection, completedSections }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [currentSection, completedSections])

  // Intersection Observer to detect current section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          const section = ISO_SECTIONS.find(s => s.target === `#${sectionId}`)
          if (section) {
            setCurrentSectionState(section.id)
          }
        }
      })
    }, observerOptions)

    // Observe all sections
    ISO_SECTIONS.forEach(section => {
      const element = document.querySelector(section.target)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  // Mark section as viewed after being active for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSection && !completedSections.includes(currentSection)) {
        setCompletedSections(prev => [...prev, currentSection])
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentSection, completedSections])

  const setCurrentSection = useCallback((sectionId: string) => {
    setCurrentSectionState(sectionId)
  }, [])

  const markSectionCompleted = useCallback((sectionId: string) => {
    setCompletedSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId]
      }
      return prev
    })
  }, [])

  const resetProgress = useCallback(() => {
    setCurrentSectionState('hero')
    setCompletedSections([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const getSectionProgress = useCallback(() => {
    return Math.round((completedSections.length / ISO_SECTIONS.length) * 100)
  }, [completedSections])

  return {
    currentSection,
    completedSections,
    sections: ISO_SECTIONS,
    setCurrentSection,
    markSectionCompleted,
    resetProgress,
    getSectionProgress
  }
}