'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Quote, 
  Star, 
  Building, 
  Calendar,
  Filter,
  MessageCircle
} from 'lucide-react'

interface Testimonial {
  id: number
  quote: string
  author: string
  position: string
  company: string
  project: string
  rating: number
  date: string
  avatar: string
}

interface TestimonialsData {
  section: {
    title: string
    subtitle: string
  }
  testimonials_list: Testimonial[]
}

interface TestimonialsSectionProps {
  data: TestimonialsData
}

type FilterType = 'all' | 'rating' | 'year'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function TestimonialFilters({ 
  activeFilter, 
  onFilterChange, 
  testimonialCount 
}: { 
  activeFilter: string
  onFilterChange: (filter: string, value?: any) => void
  testimonialCount: number
}) {
  const filterButtons = [
    { key: 'all', label: 'Todos', count: testimonialCount },
    { key: 'rating-5', label: '5 Estrellas', action: () => onFilterChange('rating', 5) },
    { key: 'year-2024', label: 'Más Recientes', action: () => onFilterChange('year', '2024') }
  ]

  return (
    <div className="flex items-center gap-4 mb-8 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filtrar testimonios:</span>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={filter.action || (() => onFilterChange('all'))}
            className={`
              ${activeFilter === filter.key 
                ? 'bg-[#00A8E8] text-white hover:bg-[#00A8E8]/90' 
                : 'border-[#00A8E8]/30 text-[#00A8E8] hover:bg-[#00A8E8]/10'
              }
            `}
          >
            {filter.label}
            {filter.count && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-current border-0"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial, index: number }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote className="w-12 h-12 text-[#00A8E8]" />
        </div>

        <CardContent className="p-6 h-full flex flex-col">
          {/* Quote */}
          <div className="flex-1 mb-6">
            <blockquote className="text-gray-700 leading-relaxed italic text-base">
              "{testimonial.quote}"
            </blockquote>
          </div>

          {/* Author Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-[#00A8E8]/20">
                <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                <AvatarFallback className="bg-[#00A8E8]/10 text-[#00A8E8] font-semibold">
                  {getInitials(testimonial.author)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base">
                  {testimonial.author}
                </h4>
                <p className="text-sm text-gray-600">{testimonial.position}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3 text-gray-500" />
                  <p className="text-sm text-gray-600 font-medium">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
              <RatingStars rating={testimonial.rating} />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {testimonial.date}
              </div>
            </div>

            {/* Project Tag */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Proyecto:</span>
                <Badge 
                  variant="secondary"
                  className="bg-[#00A8E8]/10 text-[#00A8E8] border-[#00A8E8]/20 text-xs"
                >
                  {testimonial.project}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all')

  // Filtrar testimonios
  const filteredTestimonials = useMemo(() => {
    switch (activeFilter) {
      case 'rating-5':
        return data.testimonials_list.filter(t => t.rating === 5)
      case 'year-2024':
        return data.testimonials_list.filter(t => t.date.includes('2024'))
      default:
        return data.testimonials_list
    }
  }, [data.testimonials_list, activeFilter])

  const handleFilterChange = (filter: FilterType, value?: any) => {
    switch (filter) {
      case 'rating':
        setActiveFilter(`rating-${value}`)
        break
      case 'year':
        setActiveFilter(`year-${value}`)
        break
      default:
        setActiveFilter('all')
    }
  }

  return (
    <section className="py-16 bg-gray-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#00A8E8]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {data.section.title}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data.section.subtitle}
          </p>
        </motion.div>

        {/* Testimonial Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TestimonialFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            testimonialCount={data.testimonials_list.length}
          />
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TestimonialCarousel testimonials={filteredTestimonials} />
        </motion.div>

        {/* No results message */}
        <AnimatePresence>
          {filteredTestimonials.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="text-gray-500 mb-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg">No se encontraron testimonios con este filtro</p>
                <p className="text-sm">Prueba con otros filtros</p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleFilterChange('all')}
                className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white"
              >
                Ver Todos los Testimonios
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block bg-gradient-to-r from-[#00A8E8]/10 to-[#FF6B35]/10 border-[#00A8E8]/20">
            <CardContent className="px-8 py-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">
                    {data.testimonials_list.filter(t => t.rating === 5).length}
                  </div>
                  <div className="text-sm text-gray-600">5 Estrellas</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">
                    {(data.testimonials_list.reduce((acc, t) => acc + t.rating, 0) / data.testimonials_list.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">
                    {data.testimonials_list.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}