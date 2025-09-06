'use client'

import { Button } from '@/components/ui/button'
import { Download, FileText, ExternalLink, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ActionButton {
  text: string
  type: 'primary' | 'outline'
  icon: string
  action: string
}

interface ActionButtonsProps {
  buttons: ActionButton[]
  certificatePdfUrl?: string
  onShowDetails?: () => void
}

export function ActionButtons({ buttons, certificatePdfUrl, onShowDetails }: ActionButtonsProps) {
  
  const handleDownloadCertificate = async () => {
    try {
      // Simular descarga del certificado
      if (certificatePdfUrl) {
        // En producción, esto sería un fetch real del PDF
        toast.success('Descarga iniciada', {
          description: 'El certificado ISO 9001:2015 se está descargando...'
        })
        
        // Simular descarga con timeout
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = certificatePdfUrl
          link.download = 'certificado-iso-9001-metrica-dip.pdf'
          link.click()
        }, 1000)
      } else {
        toast.info('Certificado disponible próximamente', {
          description: 'El certificado PDF estará disponible en breve.'
        })
      }
    } catch (error) {
      toast.error('Error al descargar', {
        description: 'No se pudo descargar el certificado. Inténtalo más tarde.'
      })
    }
  }

  const handleScrollToPolicy = () => {
    const element = document.querySelector('#quality-policy')
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
      toast.success('Navegando a Política de Calidad')
    }
  }

  const handleViewDetails = () => {
    if (onShowDetails) {
      onShowDetails()
    }
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'download_certificate':
        handleDownloadCertificate()
        break
      case 'scroll_to_policy':
        handleScrollToPolicy()
        break
      case 'view_details':
        handleViewDetails()
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Download':
        return Download
      case 'FileText':
        return FileText
      case 'ExternalLink':
        return ExternalLink
      case 'Eye':
        return Eye
      default:
        return Download
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
    >
      {buttons.map((button, index) => {
        const IconComponent = getIcon(button.icon)
        const isPrimary = button.type === 'primary'
        
        return (
          <motion.div
            key={button.action}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.8 + (index * 0.1),
              type: "spring",
              stiffness: 300
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleAction(button.action)}
              variant={isPrimary ? 'default' : 'outline'}
              size="lg"
              className={`
                group relative overflow-hidden px-6 py-3 font-semibold transition-all duration-300
                ${isPrimary 
                  ? 'bg-[#007bc4] hover:bg-[#D63E0A] text-white shadow-lg hover:shadow-xl border-[#007bc4]' 
                  : 'border-[#007bc4] text-[#007bc4] hover:bg-[#007bc4] hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2 relative z-10">
                <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{button.text}</span>
              </div>
              
              {/* Hover effect background */}
              <motion.div
                className={`
                  absolute inset-0 -z-0 transition-transform duration-300
                  ${isPrimary 
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#007bc4]' 
                    : 'bg-[#007bc4]'
                  }
                `}
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        )
      })}
      
      {/* Additional action for certificate details */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: 1.0,
          type: "spring",
          stiffness: 300
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleViewDetails}
          variant="ghost"
          size="lg"
          className="px-6 py-3 text-gray-600 hover:text-[#007bc4] hover:bg-[#007bc4]/10 transition-all"
        >
          <Eye className="w-5 h-5 mr-2" />
          Ver Detalles del Certificado
        </Button>
      </motion.div>
    </motion.div>
  )
}