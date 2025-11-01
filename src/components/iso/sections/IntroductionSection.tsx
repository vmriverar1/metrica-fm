'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Target, 
  TrendingUp, 
  Users,
  Building2,
  Globe,
  Award
} from 'lucide-react'

interface Benefit {
  icon: string
  title: string
  description: string
  color: string
}

interface ScopeData {
  title: string
  items: string[]
}

interface ImportanceReason {
  icon: string
  title: string
  description: string
  stat: string
}

interface ImportanceData {
  title: string
  reasons: ImportanceReason[]
}

interface IntroductionData {
  section: {
    title: string
    subtitle: string
    description: string
  }
  benefits: Benefit[]
  scope: ScopeData
  importance: ImportanceData
}

interface IntroductionSectionProps {
  data: IntroductionData
}

const iconMap = {
  Shield,
  Target,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Award
}

function BenefitsGrid({ benefits }: { benefits: Benefit[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {benefits.map((benefit, index) => {
        const IconComponent = iconMap[benefit.icon as keyof typeof iconMap] || Shield
        
        return (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4" 
                  style={{ borderLeftColor: benefit.color.replace('text-', '#').replace('-600', '') }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${benefit.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {benefit.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function ScopeList({ items, title }: { items: string[], title: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">
          Nuestra certificación ISO 9001:2015 abarca los siguientes servicios especializados
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-4 bg-[#00A8E8]/5 rounded-lg border border-[#00A8E8]/20"
          >
            <div className="w-8 h-8 rounded-full bg-[#00A8E8] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <span className="text-gray-800 font-medium">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ImportanceCards({ reasons, title }: { reasons: ImportanceReason[], title: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">
          La importancia de la certificación ISO 9001 en el sector construcción
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reasons.map((reason, index) => {
          const IconComponent = iconMap[reason.icon as keyof typeof iconMap] || Building2
          
          return (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="text-center h-full hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00A8E8] to-[#FF6B35] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {reason.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {reason.description}
                  </CardDescription>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Badge className="bg-[#00A8E8]/10 text-[#00A8E8] border-[#00A8E8]/20 font-semibold">
                      {reason.stat}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export function IntroductionSection({ data }: IntroductionSectionProps) {
  return (
    <section className="py-16 bg-gray-50/50">
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
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {data.section.subtitle}
          </p>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              {data.section.description}
            </p>
          </div>
        </motion.div>

        {/* Interactive Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-sm">
              <TabsTrigger 
                value="benefits" 
                className="data-[state=active]:bg-[#00A8E8] data-[state=active]:text-white font-medium"
              >
                Beneficios
              </TabsTrigger>
              <TabsTrigger 
                value="scope"
                className="data-[state=active]:bg-[#00A8E8] data-[state=active]:text-white font-medium"
              >
                Alcance
              </TabsTrigger>
              <TabsTrigger 
                value="importance"
                className="data-[state=active]:bg-[#00A8E8] data-[state=active]:text-white font-medium"
              >
                Importancia
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="benefits" className="mt-8">
              <BenefitsGrid benefits={data.benefits} />
            </TabsContent>
            
            <TabsContent value="scope" className="mt-8">
              <ScopeList items={data.scope.items} title={data.scope.title} />
            </TabsContent>
            
            <TabsContent value="importance" className="mt-8">
              <ImportanceCards reasons={data.importance.reasons} title={data.importance.title} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}