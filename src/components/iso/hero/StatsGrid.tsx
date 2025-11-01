'use client'

import { Calendar, Building, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  icon: 'Calendar' | 'Building' | 'Heart'
  delay?: number
}

const iconMap = {
  Calendar,
  Building, 
  Heart
}

function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
  const IconComponent = iconMap[icon]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group"
    >
      <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:border-[#00A8E8]/30">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#00A8E8] to-[#FF6B35] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
        >
          <IconComponent className="w-6 h-6 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 300 }}
          className="text-3xl md:text-4xl font-bold text-[#003F6F] mb-2"
        >
          {value}
        </motion.div>
        
        <div className="text-sm md:text-base text-gray-600 font-medium">
          {label}
        </div>
        
        {/* Animated underline */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: delay + 0.5, duration: 0.8 }}
          className="h-0.5 bg-gradient-to-r from-[#00A8E8] to-[#FF6B35] mt-3 rounded-full"
        />
      </Card>
    </motion.div>
  )
}

interface StatsGridProps {
  stats: {
    certification_years: string
    certified_projects: string
    average_satisfaction: string
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
    >
      <StatCard
        label="Años Certificados"
        value={stats.certification_years}
        icon="Calendar"
        delay={0.1}
      />
      
      <StatCard
        label="Proyectos Certificados"
        value={stats.certified_projects}
        icon="Building"
        delay={0.2}
      />
      
      <StatCard
        label="Satisfacción Promedio"
        value={`${stats.average_satisfaction}%`}
        icon="Heart"
        delay={0.3}
      />
    </motion.div>
  )
}

// Export individual StatCard for reuse
export { StatCard }