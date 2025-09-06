'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save,
  RotateCcw,
  FileText,
  Shield,
  Target,
  Plus,
  Trash2,
  Edit,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PolicyDocument {
  title: string
  version: string
  last_update: string
  approved_by: string
  effective_date: string
  next_review: string
}

interface PolicyCommitment {
  icon: string
  title: string
  description: string
  color: string
  bg_color: string
  border_color: string
}

interface QualityObjective {
  id: string
  title: string
  target: string
  current: string
  description: string
  status: 'achieved' | 'in_progress' | 'not_met'
}

interface QualityPolicyData {
  document: PolicyDocument
  commitments: PolicyCommitment[]
  objectives: QualityObjective[]
}

interface QualityPolicyEditorProps {
  data: QualityPolicyData
  onSave?: (data: QualityPolicyData) => void
  onCancel?: () => void
}

const statusOptions = [
  { value: 'achieved', label: 'Logrado', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'in_progress', label: 'En Progreso', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'not_met', label: 'No Cumplido', color: 'text-red-600', bg: 'bg-red-100' }
]

const iconOptions = [
  'Shield', 'Target', 'Users', 'TrendingUp', 'Award', 'CheckCircle', 
  'Heart', 'Zap', 'Globe', 'Building', 'Star', 'Compass'
]

function FormField({ 
  label, 
  children, 
  required = false,
  error,
  className = "" 
}: { 
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

function DocumentInfoEditor({
  document,
  onUpdate
}: {
  document: PolicyDocument
  onUpdate: (field: keyof PolicyDocument, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Título del Documento" required>
          <Input
            value={document.title}
            onChange={(e) => onUpdate('title', e.target.value)}
            placeholder="Ej: Política de Calidad Métrica FM"
          />
        </FormField>
        
        <FormField label="Versión" required>
          <Input
            value={document.version}
            onChange={(e) => onUpdate('version', e.target.value)}
            placeholder="Ej: v2.1"
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Última Actualización">
          <Input
            type="date"
            value={document.last_update}
            onChange={(e) => onUpdate('last_update', e.target.value)}
          />
        </FormField>
        
        <FormField label="Aprobado Por" required>
          <Input
            value={document.approved_by}
            onChange={(e) => onUpdate('approved_by', e.target.value)}
            placeholder="Ej: Gerencia General"
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Fecha Efectiva">
          <Input
            type="date"
            value={document.effective_date}
            onChange={(e) => onUpdate('effective_date', e.target.value)}
          />
        </FormField>
        
        <FormField label="Próxima Revisión">
          <Input
            type="date"
            value={document.next_review}
            onChange={(e) => onUpdate('next_review', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  )
}

function CommitmentsEditor({
  commitments,
  onUpdate
}: {
  commitments: PolicyCommitment[]
  onUpdate: (commitments: PolicyCommitment[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  
  const addCommitment = () => {
    const newCommitment: PolicyCommitment = {
      icon: 'Shield',
      title: 'Nuevo Compromiso',
      description: 'Descripción del compromiso',
      color: 'text-blue-600',
      bg_color: 'bg-blue-50',
      border_color: 'border-blue-200'
    }
    onUpdate([...commitments, newCommitment])
    setEditingIndex(commitments.length)
  }
  
  const updateCommitment = (index: number, field: keyof PolicyCommitment, value: string) => {
    const updated = [...commitments]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate(updated)
  }
  
  const removeCommitment = (index: number) => {
    const updated = commitments.filter((_, i) => i !== index)
    onUpdate(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Compromisos de Calidad ({commitments.length})
        </h3>
        <Button onClick={addCommitment} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Compromiso
        </Button>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {commitments.map((commitment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <Card className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Compromiso {index + 1}</Badge>
                      {editingIndex === index && (
                        <Badge variant="secondary">Editando</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCommitment(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {editingIndex === index ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Ícono">
                          <Select 
                            value={commitment.icon}
                            onValueChange={(value) => updateCommitment(index, 'icon', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map(icon => (
                                <SelectItem key={icon} value={icon}>
                                  {icon}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                        
                        <FormField label="Título">
                          <Input
                            value={commitment.title}
                            onChange={(e) => updateCommitment(index, 'title', e.target.value)}
                          />
                        </FormField>
                      </div>
                      
                      <FormField label="Descripción">
                        <Textarea
                          value={commitment.description}
                          onChange={(e) => updateCommitment(index, 'description', e.target.value)}
                          rows={3}
                        />
                      </FormField>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Color del Texto">
                          <Input
                            value={commitment.color}
                            onChange={(e) => updateCommitment(index, 'color', e.target.value)}
                            placeholder="text-blue-600"
                          />
                        </FormField>
                        
                        <FormField label="Color de Fondo">
                          <Input
                            value={commitment.bg_color}
                            onChange={(e) => updateCommitment(index, 'bg_color', e.target.value)}
                            placeholder="bg-blue-50"
                          />
                        </FormField>
                        
                        <FormField label="Color de Borde">
                          <Input
                            value={commitment.border_color}
                            onChange={(e) => updateCommitment(index, 'border_color', e.target.value)}
                            placeholder="border-blue-200"
                          />
                        </FormField>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{commitment.title}</h4>
                      <p className="text-gray-600 text-sm">{commitment.description}</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{commitment.icon}</Badge>
                        <Badge variant="outline">{commitment.color}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ObjectivesTable({
  objectives,
  onUpdate
}: {
  objectives: QualityObjective[]
  onUpdate: (objectives: QualityObjective[]) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const addObjective = () => {
    const newObjective: QualityObjective = {
      id: `obj-${Date.now()}`,
      title: 'Nuevo Objetivo',
      target: '100%',
      current: '0%',
      description: 'Descripción del objetivo',
      status: 'in_progress'
    }
    onUpdate([...objectives, newObjective])
    setEditingId(newObjective.id)
  }
  
  const updateObjective = (id: string, field: keyof QualityObjective, value: string) => {
    const updated = objectives.map(obj =>
      obj.id === id ? { ...obj, [field]: value } : obj
    )
    onUpdate(updated)
  }
  
  const removeObjective = (id: string) => {
    const updated = objectives.filter(obj => obj.id !== id)
    onUpdate(updated)
  }

  const getProgress = (current: string, target: string): number => {
    const currentNum = parseFloat(current.replace('%', ''))
    const targetNum = parseFloat(target.replace('%', ''))
    return targetNum > 0 ? Math.min(100, (currentNum / targetNum) * 100) : 0
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Objetivos de Calidad ({objectives.length})
        </h3>
        <Button onClick={addObjective} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Objetivo
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objetivo</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives.map((objective) => (
              <TableRow key={objective.id}>
                <TableCell>
                  {editingId === objective.id ? (
                    <div className="space-y-2">
                      <Input
                        value={objective.title}
                        onChange={(e) => updateObjective(objective.id, 'title', e.target.value)}
                        placeholder="Título del objetivo"
                      />
                      <Textarea
                        value={objective.description}
                        onChange={(e) => updateObjective(objective.id, 'description', e.target.value)}
                        placeholder="Descripción"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{objective.title}</div>
                      <div className="text-sm text-gray-600">{objective.description}</div>
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {editingId === objective.id ? (
                    <Input
                      value={objective.target}
                      onChange={(e) => updateObjective(objective.id, 'target', e.target.value)}
                      placeholder="100%"
                    />
                  ) : (
                    objective.target
                  )}
                </TableCell>
                
                <TableCell>
                  {editingId === objective.id ? (
                    <Input
                      value={objective.current}
                      onChange={(e) => updateObjective(objective.id, 'current', e.target.value)}
                      placeholder="75%"
                    />
                  ) : (
                    objective.current
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={getProgress(objective.current, objective.target)} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {Math.round(getProgress(objective.current, objective.target))}%
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {editingId === objective.id ? (
                    <Select
                      value={objective.status}
                      onValueChange={(value: 'achieved' | 'in_progress' | 'not_met') => 
                        updateObjective(objective.id, 'status', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      className={`${statusOptions.find(s => s.value === objective.status)?.bg} ${statusOptions.find(s => s.value === objective.status)?.color} border-0`}
                    >
                      {statusOptions.find(s => s.value === objective.status)?.label}
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === objective.id ? null : objective.id)}
                    >
                      {editingId === objective.id ? <CheckCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(objective.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function QualityPolicyEditor({ data, onSave, onCancel }: QualityPolicyEditorProps) {
  const [formData, setFormData] = useState<QualityPolicyData>(data)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const updateDocument = (field: keyof PolicyDocument, value: string) => {
    setFormData(prev => ({
      ...prev,
      document: { ...prev.document, [field]: value }
    }))
    setHasChanges(true)
  }

  const updateCommitments = (commitments: PolicyCommitment[]) => {
    setFormData(prev => ({ ...prev, commitments }))
    setHasChanges(true)
  }

  const updateObjectives = (objectives: QualityObjective[]) => {
    setFormData(prev => ({ ...prev, objectives }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave?.(formData)
    setHasChanges(false)
    toast({
      title: "Política guardada",
      description: "La política de calidad ha sido actualizada exitosamente",
    })
  }

  const handleReset = () => {
    setFormData(data)
    setHasChanges(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor Política de Calidad</h1>
          <p className="text-gray-600 mt-1">
            Administra documentos, compromisos y objetivos de calidad
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={hasChanges ? "destructive" : "secondary"}>
            {hasChanges ? "Sin guardar" : "Guardado"}
          </Badge>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Descartar
          </Button>
          
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="document" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Información del Documento
          </TabsTrigger>
          <TabsTrigger value="commitments" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compromisos
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objetivos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#007bc4]" />
                Información del Documento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentInfoEditor
                document={formData.document}
                onUpdate={updateDocument}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="commitments">
          <Card>
            <CardContent className="pt-6">
              <CommitmentsEditor
                commitments={formData.commitments}
                onUpdate={updateCommitments}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="objectives">
          <Card>
            <CardContent className="pt-6">
              <ObjectivesTable
                objectives={formData.objectives}
                onUpdate={updateObjectives}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}