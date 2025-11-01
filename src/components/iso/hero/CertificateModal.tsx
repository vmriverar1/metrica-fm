'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Building, 
  FileText, 
  ExternalLink, 
  Download,
  CheckCircle,
  Shield,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

interface CertificateDetails {
  certifying_body: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  verification_url: string
  pdf_url: string
}

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  details: CertificateDetails
}

function DetailRow({ 
  label, 
  value, 
  icon: Icon, 
  isLink = false, 
  linkText = "Ver enlace"
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  isLink?: boolean
  linkText?: string
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const displayValue = label.toLowerCase().includes('fecha') ? formatDate(value) : value

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-[#00A8E8]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#00A8E8]" />
      </div>
      
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </dt>
        <dd className="text-base text-gray-900">
          {isLink ? (
            <a 
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#00A8E8] hover:underline"
            >
              {linkText}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
              {displayValue}
            </span>
          )}
        </dd>
      </div>
    </div>
  )
}

export function CertificateModal({ isOpen, onClose, details }: CertificateModalProps) {
  const handleDownload = () => {
    // Descargar certificado desde la API
    const link = document.createElement('a')
    link.href = '/api/download/iso-certificate'
    link.download = 'certificado-iso-9001-metrica-dip.pdf'
    link.click()
  }

  const isValid = new Date() < new Date(details.expiry_date)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#FF6B35] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#003F6F]">
                Certificado ISO 9001:2015
              </DialogTitle>
              <DialogDescription>
                Detalles técnicos y verificación oficial
              </DialogDescription>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex justify-start">
            <Badge 
              variant={isValid ? "default" : "destructive"}
              className={`flex items-center gap-2 ${
                isValid 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isValid ? "Certificación Vigente" : "Certificación Vencida"}
            </Badge>
          </div>
        </DialogHeader>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00A8E8]" />
            Información del Certificado
          </h3>
          
          <div className="space-y-3">
            <DetailRow
              label="Organismo Certificador"
              value={details.certifying_body}
              icon={Building}
            />
            
            <DetailRow
              label="Número de Certificado"
              value={details.certificate_number}
              icon={FileText}
            />
            
            <DetailRow
              label="Fecha de Emisión"
              value={details.issue_date}
              icon={Calendar}
            />
            
            <DetailRow
              label="Fecha de Vencimiento"
              value={details.expiry_date}
              icon={Calendar}
            />
            
            <DetailRow
              label="Verificación Online"
              value={details.verification_url}
              icon={Globe}
              isLink={true}
              linkText="Verificar certificado"
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alcance de la Certificación
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-blue-800">

              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Gestión de proyectos de infraestructura
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Supervisión y control de obras
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Consultoría en construcción
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={handleDownload}
            className="flex-1 bg-[#00A8E8] hover:bg-[#D63E0A] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Certificado PDF
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open(details.verification_url, '_blank')}
            className="flex-1 border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Verificar Online
          </Button>
        </div>

        {/* Footer info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Esta certificación es emitida por {details.certifying_body} y es válida hasta el{' '}
            {new Date(details.expiry_date).toLocaleDateString('es-PE')}. 
            Para verificar la autenticidad, utilice el enlace de verificación oficial.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}