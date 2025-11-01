'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface CertificationBadgeProps {
  status: boolean
  since: string
  statusText: string
}

export function CertificationBadge({ status, since, statusText }: CertificationBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center gap-3 mb-8"
    >
      {/* Status Badge */}
      <div className={`
        relative flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
        ${status 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }
      `}>
        {status ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
        
        <span className="font-semibold text-sm">
          {statusText}
        </span>
        
        {/* Pulse animation for active certification */}
        {status && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-200"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Since Badge */}
      <Badge 
        variant="secondary" 
        className="flex items-center gap-2 px-3 py-1 text-xs bg-[#00A8E8]/10 text-[#00A8E8] border border-[#00A8E8]/20"
      >
        <Calendar className="w-3 h-3" />
        Certificados desde {since}
      </Badge>

      {/* ISO 9001 Label */}
      <div className="text-center">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#003F6F] mb-2">
          ISO 9001
        </div>
        <div className="text-lg md:text-xl text-gray-600 font-medium">
          Certificación 2015
        </div>
      </div>

      {/* Certification Icon with Animation */}
      <motion.div
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-16 h-16 bg-gradient-to-br from-[#00A8E8] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg"
      >
        <CheckCircle className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  )
}