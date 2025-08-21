'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  Award
} from 'lucide-react'

interface CaseStudy {
  project: string
  result: string
}

interface Benefit {
  id: string
  icon: string
  title: string
  description: string
  impact: string
  color: string
  details: string[]
  case_study: CaseStudy
}

interface ClientBenefitsData {
  section: {
    title: string
    subtitle: string
  }
  benefits_list: Benefit[]
}

interface ClientBenefitsSectionProps {
  data: ClientBenefitsData
}

const iconMap = {
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Award
}

const colorMap = {
  blue: 'border-blue-500 bg-blue-50',
  green: 'border-green-500 bg-green-50',
  orange: 'border-orange-500 bg-orange-50',
  purple: 'border-purple-500 bg-purple-50',
  red: 'border-red-500 bg-red-50',
  indigo: 'border-indigo-500 bg-indigo-50'
}

const iconColorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  indigo: 'text-indigo-600'
}

function BenefitHeader({ icon, title, impact, color }: { icon: string, title: string, impact: string, color: string }) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Shield
  const iconColorClass = iconColorMap[color as keyof typeof iconColorMap] || 'text-blue-600'
  
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
        </div>
      </div>
      <Badge className={`${iconColorClass.replace('text-', 'bg-').replace('-600', '-100')} ${iconColorClass} border-current font-semibold whitespace-nowrap`}>
        {impact}
      </Badge>
    </div>
  )
}

function DetailsList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 mb-3">Características Clave:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CaseStudyCard({ project, result }: CaseStudy) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#E84E0F]/10 to-[#FF6B35]/10 p-4 rounded-lg border border-[#E84E0F]/20"
    >
      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Star className="w-4 h-4 text-[#E84E0F]" />
        Caso de Éxito
      </h4>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Proyecto:</span>
          <p className="text-sm text-gray-800 font-medium">{project}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Resultado:</span>
          <p className="text-sm text-gray-800">{result}</p>
        </div>
      </div>
    </motion.div>
  )
}

function BenefitCard({ benefit, index }: { benefit: Benefit, index: number }) {
  const cardColorClass = colorMap[benefit.color as keyof typeof colorMap] || colorMap.blue
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={`h-full border-l-4 ${cardColorClass} hover:shadow-xl transition-all duration-300`}>
        <CardHeader className="pb-4">
          <BenefitHeader 
            icon={benefit.icon}
            title={benefit.title}
            impact={benefit.impact}
            color={benefit.color}
          />
          <p className="text-gray-600 leading-relaxed">
            {benefit.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="text-left hover:no-underline py-3 px-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Ver Detalles</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DetailsList items={benefit.details} />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="case-study" className="border-none">
              <AccordionTrigger className="text-left hover:no-underline py-3 px-4 bg-gray-50 rounded-lg mt-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#E84E0F]" />
                  <span className="font-medium">Caso de Estudio</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <CaseStudyCard 
                  project={benefit.case_study.project}
                  result={benefit.case_study.result}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BenefitsCarousel({ benefits }: { benefits: Benefit[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <BenefitCard key={benefit.id} benefit={benefit} index={index} />
      ))}
    </div>
  )
}

export function ClientBenefitsSection({ data }: ClientBenefitsSectionProps) {
  return (
    <section className="py-16 bg-gray-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.section.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data.section.subtitle}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BenefitsCarousel benefits={data.benefits_list} />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                ¿Quieres experimentar estos beneficios?
              </h3>
              <p className="text-sm text-gray-600">
                Conoce más sobre nuestros procesos certificados ISO 9001
              </p>
            </div>
            <Button className="bg-[#E84E0F] hover:bg-[#E84E0F]/90 text-white">
              Contactar Ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}