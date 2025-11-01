// 'use client'

// import React, { useState, useCallback, useEffect, useRef } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Textarea } from '@/components/ui/textarea'
// import { 
//   Save, 
//   Eye, 
//   Building2, 
//   MapPin, 
//   Calendar, 
//   DollarSign, 
//   Upload, 
//   Image, 
//   Star,
//   CheckCircle,
//   AlertCircle,
//   RefreshCw,
//   Users,
//   Award,
//   Target,
//   BarChart3,
//   FileText,
//   Camera,
//   Plus,
//   X,
//   Edit,
//   Trash2,
//   Clock,
//   TrendingUp,
//   Globe,
//   Settings,
//   Tag,
//   Link2,
//   Download,
//   Share2,
//   Ruler,
//   Hammer,
//   Zap
// } from 'lucide-react'

// interface Project {
//   id?: string
//   title: string
//   slug: string
//   category: string
//   location: {
//     city: string
//     region: string
//     address: string
//     coordinates: [number, number]
//   }
//   featured_image: string
//   thumbnail_image: string
//   gallery: {
//     id: string
//     url: string
//     thumbnail: string
//     caption: string
//     stage: 'inicio' | 'proceso' | 'final'
//     order: number
//   }[]
//   description: string
//   short_description: string
//   details: {
//     client: string
//     duration: string
//     investment: string
//     team: string[]
//     certifications: string[]
//     area: string
//   }
//   technical_specs: {
//     floors?: number
//     total_area: number
//     built_area?: number
//     green_area?: number
//     parking_spaces?: number
//     units?: number
//     construction_type: string
//     architectural_style: string
//     sustainability_features: string[]
//   }
//   timeline: {
//     planning_start: string
//     construction_start: string
//     construction_end: string
//     inauguration?: string
//     milestones: { date: string; title: string; description: string }[]
//   }
//   financial: {
//     total_investment: number
//     currency: string
//     cost_per_sqm?: number
//     roi?: number
//     funding_sources: string[]
//     budget_breakdown: { category: string; amount: number; percentage: number }[]
//   }
//   featured: boolean
//   completed_at: string
//   tags: string[]
//   url: string
//   status: 'planning' | 'construction' | 'completed' | 'on_hold'
//   visibility: 'public' | 'private' | 'client_only'
//   seo: {
//     meta_description: string
//     keywords: string[]
//     social_image: string
//   }
//   performance_metrics?: {
//     views: number
//     inquiries: number
//     conversion_rate: number
//     social_shares: number
//   }
// }

// interface Client {
//   id: string
//   name: string
//   type: 'private' | 'corporate' | 'government'
//   logo?: string
// }

// interface Category {
//   id: string
//   name: string
//   slug: string
//   color: string
// }

// interface ProjectEditorProps {
//   project?: Project
//   clients: Client[]
//   categories: Category[]
//   relatedProjects: { id: string; title: string }[]
//   onSave: (project: Project) => Promise<void>
//   onPublish: (project: Project) => Promise<void>
//   onPreview: (project: Project) => void
//   onUploadImage: (file: File, stage?: string) => Promise<string>
//   onGenerateSlug: (title: string) => string
//   loading?: boolean
// }

// export default function ProjectEditor({
//   project,
//   clients,
//   categories,
//   relatedProjects,
//   onSave,
//   onPublish,
//   onPreview,
//   onUploadImage,
//   onGenerateSlug,
//   loading = false
// }: ProjectEditorProps) {
//   const [formData, setFormData] = useState<Project>({
//     title: '',
//     slug: '',
//     category: '',
//     location: {
//       city: '',
//       region: '',
//       address: '',
//       coordinates: [-77.0365, -12.0931] // Default Lima coordinates
//     },
//     featured_image: '',
//     thumbnail_image: '',
//     gallery: [],
//     description: '',
//     short_description: '',
//     details: {
//       client: '',
//       duration: '',
//       investment: '',
//       team: [],
//       certifications: [],
//       area: ''
//     },
//     technical_specs: {
//       total_area: 0,
//       construction_type: '',
//       architectural_style: '',
//       sustainability_features: []
//     },
//     timeline: {
//       planning_start: '',
//       construction_start: '',
//       construction_end: '',
//       milestones: []
//     },
//     financial: {
//       total_investment: 0,
//       currency: 'USD',
//       funding_sources: [],
//       budget_breakdown: []
//     },
//     featured: false,
//     completed_at: '',
//     tags: [],
//     url: '',
//     status: 'planning',
//     visibility: 'public',
//     seo: {
//       meta_description: '',
//       keywords: [],
//       social_image: ''
//     },
//     ...project
//   })

//   const [currentTab, setCurrentTab] = useState('basic')
//   const [isDirty, setIsDirty] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [newTag, setNewTag] = useState('')
//   const [newTeamMember, setNewTeamMember] = useState('')
//   const [newCertification, setNewCertification] = useState('')
//   const [newSustainabilityFeature, setNewSustainabilityFeature] = useState('')
//   const [selectedGalleryStage, setSelectedGalleryStage] = useState<'inicio' | 'proceso' | 'final'>('inicio')

//   const fileInputRef = useRef<HTMLInputElement>(null)

//   // Status configurations
//   const statusConfig = {
//     planning: { label: 'Planificación', color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-4 w-4" /> },
//     construction: { label: 'Construcción', color: 'bg-cyan-100 text-cyan-800', icon: <Hammer className="h-4 w-4" /> },
//     completed: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
//     on_hold: { label: 'En Pausa', color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> }
//   }

//   const stageConfig = {
//     inicio: { label: 'Estado Inicial', color: 'bg-blue-100 text-blue-800' },
//     proceso: { label: 'En Construcción', color: 'bg-cyan-100 text-cyan-800' },
//     final: { label: 'Proyecto Terminado', color: 'bg-green-100 text-green-800' }
//   }

//   // Update form data
//   const updateFormData = (updates: Partial<Project>) => {
//     setFormData(prev => ({ ...prev, ...updates }))
//     setIsDirty(true)
//   }

//   // Handle title change and auto-generate slug and URL
//   const handleTitleChange = (title: string) => {
//     const slug = onGenerateSlug(title)
//     updateFormData({ 
//       title,
//       slug,
//       url: `/portfolio/${formData.category}/${slug}`
//     })
//   }

//   // Handle category change and update URL
//   const handleCategoryChange = (category: string) => {
//     updateFormData({ 
//       category,
//       url: `/portfolio/${category}/${formData.slug}`
//     })
//   }

//   // Handle tag operations
//   const addTag = () => {
//     if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
//       updateFormData({ tags: [...formData.tags, newTag.trim()] })
//       setNewTag('')
//     }
//   }

//   const removeTag = (tagToRemove: string) => {
//     updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) })
//   }

//   // Handle team member operations
//   const addTeamMember = () => {
//     if (newTeamMember.trim() && !formData.details.team.includes(newTeamMember.trim())) {
//       updateFormData({ 
//         details: { 
//           ...formData.details, 
//           team: [...formData.details.team, newTeamMember.trim()] 
//         }
//       })
//       setNewTeamMember('')
//     }
//   }

//   const removeTeamMember = (member: string) => {
//     updateFormData({ 
//       details: { 
//         ...formData.details, 
//         team: formData.details.team.filter(m => m !== member) 
//       }
//     })
//   }

//   // Handle certification operations
//   const addCertification = () => {
//     if (newCertification.trim() && !formData.details.certifications.includes(newCertification.trim())) {
//       updateFormData({ 
//         details: { 
//           ...formData.details, 
//           certifications: [...formData.details.certifications, newCertification.trim()] 
//         }
//       })
//       setNewCertification('')
//     }
//   }

//   const removeCertification = (cert: string) => {
//     updateFormData({ 
//       details: { 
//         ...formData.details, 
//         certifications: formData.details.certifications.filter(c => c !== cert) 
//       }
//     })
//   }

//   // Handle sustainability features
//   const addSustainabilityFeature = () => {
//     if (newSustainabilityFeature.trim() && !formData.technical_specs.sustainability_features.includes(newSustainabilityFeature.trim())) {
//       updateFormData({ 
//         technical_specs: { 
//           ...formData.technical_specs, 
//           sustainability_features: [...formData.technical_specs.sustainability_features, newSustainabilityFeature.trim()] 
//         }
//       })
//       setNewSustainabilityFeature('')
//     }
//   }

//   const removeSustainabilityFeature = (feature: string) => {
//     updateFormData({ 
//       technical_specs: { 
//         ...formData.technical_specs, 
//         sustainability_features: formData.technical_specs.sustainability_features.filter(f => f !== feature) 
//       }
//     })
//   }

//   // Handle image upload
//   const handleImageUpload = async (file: File, type: 'featured' | 'thumbnail' | 'gallery') => {
//     console.log('🖼️ handleImageUpload called:', { file: file.name, type, selectedGalleryStage });

//     try {
//       console.log('🔄 Calling onUploadImage...');
//       const imageUrl = await onUploadImage(file, type === 'gallery' ? selectedGalleryStage : undefined)
//       console.log('✅ onUploadImage returned:', imageUrl);

//       if (type === 'featured') {
//         updateFormData({
//           featured_image: imageUrl,
//           seo: { ...formData.seo, social_image: imageUrl }
//         })
//       } else if (type === 'thumbnail') {
//         updateFormData({ thumbnail_image: imageUrl })
//       } else if (type === 'gallery') {
//         const newGalleryItem = {
//           id: Date.now().toString(),
//           url: imageUrl,
//           thumbnail: imageUrl,
//           caption: '',
//           stage: selectedGalleryStage,
//           order: formData.gallery.filter(item => item.stage === selectedGalleryStage).length + 1
//         }
//         console.log('📸 Adding new gallery item:', newGalleryItem);
//         updateFormData({
//           gallery: [...formData.gallery, newGalleryItem]
//         })
//       }
//     } catch (error) {
//       console.error('❌ Image upload failed:', error)
//       alert(`Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
//     }
//   }

//   // Debug: Log component render
//   console.log('🎨 ProjectEditor rendering, stageConfig:', stageConfig, 'selectedGalleryStage:', selectedGalleryStage);

//   // Handle gallery operations
//   const updateGalleryItem = (id: string, updates: Partial<typeof formData.gallery[0]>) => {
//     updateFormData({
//       gallery: formData.gallery.map(item => 
//         item.id === id ? { ...item, ...updates } : item
//       )
//     })
//   }

//   const removeGalleryItem = (id: string) => {
//     updateFormData({
//       gallery: formData.gallery.filter(item => item.id !== id)
//     })
//   }

//   // Handle save
//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       await onSave(formData)
//       setIsDirty(false)
//     } catch (error) {
//       console.error('Save failed:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Handle publish
//   const handlePublish = async () => {
//     setSaving(true)
//     try {
//       await onPublish({ ...formData, status: 'completed' })
//       setIsDirty(false)
//     } catch (error) {
//       console.error('Publish failed:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Calculate project completion percentage
//   const calculateCompletionPercentage = () => {
//     const requiredFields = [
//       formData.title,
//       formData.category,
//       formData.description,
//       formData.details.client,
//       formData.location.city,
//       formData.featured_image
//     ]
    
//     const completedFields = requiredFields.filter(field => field && field.toString().trim() !== '').length
//     return Math.round((completedFields / requiredFields.length) * 100)
//   }

//   const completionPercentage = calculateCompletionPercentage()

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {project?.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
//           </h1>
//           <div className="flex items-center space-x-4 mt-2">
//             <Badge className={statusConfig[formData.status].color}>
//               {statusConfig[formData.status].icon}
//               <span className="ml-1">{statusConfig[formData.status].label}</span>
//             </Badge>
//             <div className="flex items-center space-x-2">
//               <div className="w-32 bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-blue-500 h-2 rounded-full transition-all"
//                   style={{ width: `${completionPercentage}%` }}
//                 />
//               </div>
//               <span className="text-sm text-gray-600">{completionPercentage}% completo</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={() => onPreview(formData)}
//             disabled={loading}
//           >
//             <Eye className="h-4 w-4 mr-2" />
//             Vista previa
//           </Button>
          
//           <Button
//             variant="outline"
//             onClick={handleSave}
//             disabled={loading || saving || !isDirty}
//           >
//             {saving ? (
//               <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <Save className="h-4 w-4 mr-2" />
//             )}
//             Guardar
//           </Button>
          
//           {formData.status !== 'completed' && (
//             <Button
//               onClick={handlePublish}
//               disabled={loading || saving || completionPercentage < 80}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               <CheckCircle className="h-4 w-4 mr-2" />
//               Publicar
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Main Editor */}
//       <Tabs value={currentTab} onValueChange={setCurrentTab}>
//         <TabsList className="grid w-full grid-cols-6">
//           <TabsTrigger value="basic">Información Básica</TabsTrigger>
//           <TabsTrigger value="technical">Detalles Técnicos</TabsTrigger>
//           <TabsTrigger value="financial">Información Financiera</TabsTrigger>
//           <TabsTrigger value="gallery">Galería</TabsTrigger>
//           <TabsTrigger value="timeline">Timeline</TabsTrigger>
//           <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
//         </TabsList>

//         {/* Basic Information Tab */}
//         <TabsContent value="basic" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Información del Proyecto</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nombre del Proyecto
//                 </label>
//                 <Input
//                   value={formData.title}
//                   onChange={(e) => handleTitleChange(e.target.value)}
//                   placeholder="Ej: Torre Empresarial San Isidro"
//                   className="text-lg"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Slug (URL)
//                 </label>
//                 <Input
//                   value={formData.slug}
//                   onChange={(e) => updateFormData({ slug: e.target.value })}
//                   placeholder="torre-empresarial-san-isidro"
//                 />
//                 <p className="text-sm text-gray-500 mt-1">
//                   URL: {formData.url}
//                 </p>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Categoría
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) => handleCategoryChange(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="">Seleccionar categoría</option>
//                     {categories.map(category => (
//                       <option key={category.id} value={category.slug}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Cliente
//                   </label>
//                   <select
//                     value={formData.details.client}
//                     onChange={(e) => updateFormData({ 
//                       details: { ...formData.details, client: e.target.value }
//                     })}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="">Seleccionar cliente</option>
//                     {clients.map(client => (
//                       <option key={client.id} value={client.name}>
//                         {client.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Descripción Corta
//                 </label>
//                 <Textarea
//                   value={formData.short_description}
//                   onChange={(e) => updateFormData({ short_description: e.target.value })}
//                   placeholder="Descripción breve del proyecto (máx. 160 caracteres)"
//                   rows={2}
//                   maxLength={160}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">
//                   {formData.short_description.length}/160 caracteres
//                 </p>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Descripción Completa
//                 </label>
//                 <Textarea
//                   value={formData.description}
//                   onChange={(e) => updateFormData({ description: e.target.value })}
//                   placeholder="Descripción detallada del proyecto..."
//                   rows={6}
//                 />
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Estado
//                   </label>
//                   <select
//                     value={formData.status}
//                     onChange={(e) => updateFormData({ status: e.target.value as any })}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     {Object.entries(statusConfig).map(([key, config]) => (
//                       <option key={key} value={key}>{config.label}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Visibilidad
//                   </label>
//                   <select
//                     value={formData.visibility}
//                     onChange={(e) => updateFormData({ visibility: e.target.value as any })}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="public">Público</option>
//                     <option value="private">Privado</option>
//                     <option value="client_only">Solo Cliente</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Fecha de Finalización
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.completed_at}
//                     onChange={(e) => updateFormData({ completed_at: e.target.value })}
//                   />
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   id="featured"
//                   checked={formData.featured}
//                   onChange={(e) => updateFormData({ featured: e.target.checked })}
//                   className="rounded"
//                 />
//                 <label htmlFor="featured" className="text-sm font-medium text-gray-700">
//                   Proyecto destacado
//                 </label>
//                 <Star className="h-4 w-4 text-yellow-500" />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Location Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <MapPin className="h-5 w-5" />
//                 <span>Ubicación</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Ciudad
//                   </label>
//                   <Input
//                     value={formData.location.city}
//                     onChange={(e) => updateFormData({ 
//                       location: { ...formData.location, city: e.target.value }
//                     })}
//                     placeholder="Lima"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Región
//                   </label>
//                   <Input
//                     value={formData.location.region}
//                     onChange={(e) => updateFormData({ 
//                       location: { ...formData.location, region: e.target.value }
//                     })}
//                     placeholder="Lima"
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Dirección
//                 </label>
//                 <Input
//                   value={formData.location.address}
//                   onChange={(e) => updateFormData({ 
//                     location: { ...formData.location, address: e.target.value }
//                   })}
//                   placeholder="Av. El Derby 254, San Isidro"
//                 />
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Latitud
//                   </label>
//                   <Input
//                     type="number"
//                     step="any"
//                     value={formData.location.coordinates[1]}
//                     onChange={(e) => updateFormData({ 
//                       location: { 
//                         ...formData.location, 
//                         coordinates: [formData.location.coordinates[0], parseFloat(e.target.value) || 0]
//                       }
//                     })}
//                     placeholder="-12.0931"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Longitud
//                   </label>
//                   <Input
//                     type="number"
//                     step="any"
//                     value={formData.location.coordinates[0]}
//                     onChange={(e) => updateFormData({ 
//                       location: { 
//                         ...formData.location, 
//                         coordinates: [parseFloat(e.target.value) || 0, formData.location.coordinates[1]]
//                       }
//                     })}
//                     placeholder="-77.0365"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Team and Tags */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Equipo y Tags</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Equipo del Proyecto
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {formData.details.team.map((member, index) => (
//                     <Badge key={index} variant="secondary" className="px-3 py-1">
//                       {member}
//                       <button
//                         onClick={() => removeTeamMember(member)}
//                         className="ml-2 text-gray-500 hover:text-gray-700"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTeamMember}
//                     onChange={(e) => setNewTeamMember(e.target.value)}
//                     placeholder="Agregar miembro del equipo..."
//                     onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
//                   />
//                   <Button onClick={addTeamMember} variant="outline">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Certificaciones
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {formData.details.certifications.map((cert, index) => (
//                     <Badge key={index} variant="secondary" className="px-3 py-1">
//                       <Award className="h-3 w-3 mr-1" />
//                       {cert}
//                       <button
//                         onClick={() => removeCertification(cert)}
//                         className="ml-2 text-gray-500 hover:text-gray-700"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newCertification}
//                     onChange={(e) => setNewCertification(e.target.value)}
//                     placeholder="Agregar certificación..."
//                     onKeyPress={(e) => e.key === 'Enter' && addCertification()}
//                   />
//                   <Button onClick={addCertification} variant="outline">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tags del Proyecto
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {formData.tags.map((tag, index) => (
//                     <Badge key={index} variant="secondary" className="px-3 py-1">
//                       <Tag className="h-3 w-3 mr-1" />
//                       {tag}
//                       <button
//                         onClick={() => removeTag(tag)}
//                         className="ml-2 text-gray-500 hover:text-gray-700"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTag}
//                     onChange={(e) => setNewTag(e.target.value)}
//                     placeholder="Agregar tag..."
//                     onKeyPress={(e) => e.key === 'Enter' && addTag()}
//                   />
//                   <Button onClick={addTag} variant="outline">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Technical Specifications Tab */}
//         <TabsContent value="technical" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Ruler className="h-5 w-5" />
//                 <span>Especificaciones Técnicas</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Área Total (m²)
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.technical_specs.total_area}
//                     onChange={(e) => updateFormData({ 
//                       technical_specs: { 
//                         ...formData.technical_specs, 
//                         total_area: parseFloat(e.target.value) || 0 
//                       }
//                     })}
//                     placeholder="15000"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Área Construida (m²)
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.technical_specs.built_area || ''}
//                     onChange={(e) => updateFormData({ 
//                       technical_specs: { 
//                         ...formData.technical_specs, 
//                         built_area: parseFloat(e.target.value) || undefined 
//                       }
//                     })}
//                     placeholder="12000"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Pisos
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.technical_specs.floors || ''}
//                     onChange={(e) => updateFormData({ 
//                       technical_specs: { 
//                         ...formData.technical_specs, 
//                         floors: parseInt(e.target.value) || undefined 
//                       }
//                     })}
//                     placeholder="25"
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Tipo de Construcción
//                   </label>
//                   <Input
//                     value={formData.technical_specs.construction_type}
//                     onChange={(e) => updateFormData({ 
//                       technical_specs: { 
//                         ...formData.technical_specs, 
//                         construction_type: e.target.value 
//                       }
//                     })}
//                     placeholder="Estructura de concreto armado"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Estilo Arquitectónico
//                   </label>
//                   <Input
//                     value={formData.technical_specs.architectural_style}
//                     onChange={(e) => updateFormData({ 
//                       technical_specs: { 
//                         ...formData.technical_specs, 
//                         architectural_style: e.target.value 
//                       }
//                     })}
//                     placeholder="Contemporáneo"
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Características de Sostenibilidad
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {formData.technical_specs.sustainability_features.map((feature, index) => (
//                     <Badge key={index} variant="secondary" className="px-3 py-1">
//                       <Zap className="h-3 w-3 mr-1" />
//                       {feature}
//                       <button
//                         onClick={() => removeSustainabilityFeature(feature)}
//                         className="ml-2 text-gray-500 hover:text-gray-700"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newSustainabilityFeature}
//                     onChange={(e) => setNewSustainabilityFeature(e.target.value)}
//                     placeholder="Ej: Paneles solares, Sistema de reciclaje de agua..."
//                     onKeyPress={(e) => e.key === 'Enter' && addSustainabilityFeature()}
//                   />
//                   <Button onClick={addSustainabilityFeature} variant="outline">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Financial Tab */}
//         <TabsContent value="financial" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <DollarSign className="h-5 w-5" />
//                 <span>Información Financiera</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Inversión Total
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.financial.total_investment}
//                     onChange={(e) => updateFormData({ 
//                       financial: { 
//                         ...formData.financial, 
//                         total_investment: parseFloat(e.target.value) || 0 
//                       }
//                     })}
//                     placeholder="25000000"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Moneda
//                   </label>
//                   <select
//                     value={formData.financial.currency}
//                     onChange={(e) => updateFormData({ 
//                       financial: { 
//                         ...formData.financial, 
//                         currency: e.target.value 
//                       }
//                     })}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2"
//                   >
//                     <option value="USD">USD</option>
//                     <option value="PEN">PEN</option>
//                     <option value="EUR">EUR</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Costo por m² (opcional)
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.financial.cost_per_sqm || ''}
//                     onChange={(e) => updateFormData({ 
//                       financial: { 
//                         ...formData.financial, 
//                         cost_per_sqm: parseFloat(e.target.value) || undefined 
//                       }
//                     })}
//                     placeholder="1667"
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Duración
//                   </label>
//                   <Input
//                     value={formData.details.duration}
//                     onChange={(e) => updateFormData({ 
//                       details: { 
//                         ...formData.details, 
//                         duration: e.target.value 
//                       }
//                     })}
//                     placeholder="24 meses"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Área (texto descriptivo)
//                   </label>
//                   <Input
//                     value={formData.details.area}
//                     onChange={(e) => updateFormData({ 
//                       details: { 
//                         ...formData.details, 
//                         area: e.target.value 
//                       }
//                     })}
//                     placeholder="15,000 m²"
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Inversión (texto descriptivo)
//                 </label>
//                 <Input
//                   value={formData.details.investment}
//                   onChange={(e) => updateFormData({ 
//                     details: { 
//                       ...formData.details, 
//                       investment: e.target.value 
//                     }
//                   })}
//                   placeholder="$25M USD"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Gallery Tab */}
//         <TabsContent value="gallery" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Camera className="h-5 w-5" />
//                 <span>Imágenes del Proyecto</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Featured Images */}
//               <div>
//                 <h3 className="text-lg font-medium mb-4">Imágenes Principales</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Imagen Destacada
//                     </label>
//                     {formData.featured_image ? (
//                       <div className="relative">
//                         <img
//                           src={formData.featured_image}
//                           alt="Imagen destacada"
//                           className="w-full h-48 object-cover rounded-lg"
//                         />
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           className="absolute top-2 right-2"
//                           onClick={() => updateFormData({ featured_image: '' })}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                         <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                         <Button
//                           variant="outline"
//                           onClick={() => {
//                             const input = document.createElement('input')
//                             input.type = 'file'
//                             input.accept = 'image/*'
//                             input.onchange = (e) => {
//                               const file = (e.target as HTMLInputElement).files?.[0]
//                               if (file) handleImageUpload(file, 'featured')
//                             }
//                             input.click()
//                           }}
//                         >
//                           <Upload className="h-4 w-4 mr-2" />
//                           Subir imagen
//                         </Button>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Thumbnail
//                     </label>
//                     {formData.thumbnail_image ? (
//                       <div className="relative">
//                         <img
//                           src={formData.thumbnail_image}
//                           alt="Thumbnail"
//                           className="w-full h-48 object-cover rounded-lg"
//                         />
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           className="absolute top-2 right-2"
//                           onClick={() => updateFormData({ thumbnail_image: '' })}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                         <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                         <Button
//                           variant="outline"
//                           onClick={() => {
//                             const input = document.createElement('input')
//                             input.type = 'file'
//                             input.accept = 'image/*'
//                             input.onchange = (e) => {
//                               const file = (e.target as HTMLInputElement).files?.[0]
//                               if (file) handleImageUpload(file, 'thumbnail')
//                             }
//                             input.click()
//                           }}
//                         >
//                           <Upload className="h-4 w-4 mr-2" />
//                           Subir thumbnail
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Gallery by Stages */}
//               <div>
//                 <h3 className="text-lg font-medium mb-4">Galería por Etapas</h3>
                
//                 <div className="flex gap-2 mb-4">
//                   {Object.entries(stageConfig).map(([stage, config]) => (
//                     <Button
//                       key={stage}
//                       variant={selectedGalleryStage === stage ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setSelectedGalleryStage(stage as any)}
//                     >
//                       {config.label}
//                     </Button>
//                   ))}
//                 </div>
                
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
//                   {formData.gallery
//                     .filter(item => item.stage === selectedGalleryStage)
//                     .sort((a, b) => a.order - b.order)
//                     .map(item => (
//                     <div key={item.id} className="relative group">
//                       <img
//                         src={item.thumbnail}
//                         alt={item.caption}
//                         className="w-full h-32 object-cover rounded-lg"
//                       />
                      
//                       <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           onClick={() => {
//                             const newCaption = prompt('Ingresa una descripción:', item.caption)
//                             if (newCaption !== null) {
//                               updateGalleryItem(item.id, { caption: newCaption })
//                             }
//                           }}
//                         >
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           onClick={() => removeGalleryItem(item.id)}
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                       </div>
                      
//                       {item.caption && (
//                         <p className="text-xs text-gray-600 mt-1 truncate">
//                           {item.caption}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
                
//                 <Button
//                   variant="outline"
//                   onClick={(e) => {
//                     console.log('🔄 Add gallery images button clicked');
//                     console.log('🎯 Button element:', e.target);
//                     console.log('📊 Current state:', { selectedGalleryStage, galleryCount: formData.gallery.length });
//                     e.preventDefault();
//                     e.stopPropagation();

//                     try {
//                       const input = document.createElement('input')
//                       input.type = 'file'
//                       input.accept = 'image/*'
//                       input.multiple = true
//                       input.onchange = (e) => {
//                         const files = Array.from((e.target as HTMLInputElement).files || [])
//                         console.log('📁 Files selected:', files.map(f => f.name));
//                         files.forEach(file => handleImageUpload(file, 'gallery'))
//                       }
//                       console.log('📂 About to open file dialog...');
//                       input.click()
//                     } catch (error) {
//                       console.error('❌ Error in button click handler:', error);
//                     }
//                   }}
//                   style={{ zIndex: 9999, position: 'relative' }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Agregar imágenes a {stageConfig[selectedGalleryStage].label}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Timeline Tab */}
//         <TabsContent value="timeline" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Calendar className="h-5 w-5" />
//                 <span>Timeline del Proyecto</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Inicio de Planificación
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.timeline.planning_start}
//                     onChange={(e) => updateFormData({ 
//                       timeline: { ...formData.timeline, planning_start: e.target.value }
//                     })}
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Inicio de Construcción
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.timeline.construction_start}
//                     onChange={(e) => updateFormData({ 
//                       timeline: { ...formData.timeline, construction_start: e.target.value }
//                     })}
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Fin de Construcción
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.timeline.construction_end}
//                     onChange={(e) => updateFormData({ 
//                       timeline: { ...formData.timeline, construction_end: e.target.value }
//                     })}
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Inauguración (opcional)
//                   </label>
//                   <Input
//                     type="date"
//                     value={formData.timeline.inauguration || ''}
//                     onChange={(e) => updateFormData({ 
//                       timeline: { ...formData.timeline, inauguration: e.target.value }
//                     })}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* SEO & Metadata Tab */}
//         <TabsContent value="seo" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Globe className="h-5 w-5" />
//                 <span>SEO y Metadata</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Description
//                 </label>
//                 <Textarea
//                   value={formData.seo.meta_description}
//                   onChange={(e) => updateFormData({ 
//                     seo: { ...formData.seo, meta_description: e.target.value }
//                   })}
//                   placeholder="Descripción que aparecerá en los resultados de búsqueda..."
//                   rows={3}
//                   maxLength={160}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">
//                   {formData.seo.meta_description.length}/160 caracteres
//                 </p>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Keywords SEO (separadas por comas)
//                 </label>
//                 <Input
//                   value={formData.seo.keywords.join(', ')}
//                   onChange={(e) => updateFormData({ 
//                     seo: { 
//                       ...formData.seo, 
//                       keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
//                     }
//                   })}
//                   placeholder="torre empresarial, oficinas lima, arquitectura contemporánea"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Imagen Social (Open Graph)
//                 </label>
//                 <Input
//                   value={formData.seo.social_image}
//                   onChange={(e) => updateFormData({ 
//                     seo: { ...formData.seo, social_image: e.target.value }
//                   })}
//                   placeholder="URL de la imagen para redes sociales..."
//                 />
//                 <p className="text-sm text-gray-500 mt-1">
//                   Se usará la imagen destacada si no se especifica
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Social Preview */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Vista Previa Social</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="border rounded-lg p-4 bg-gray-50">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
//                     {(formData.seo.social_image || formData.featured_image) && (
//                       <img
//                         src={formData.seo.social_image || formData.featured_image}
//                         alt="Social preview"
//                         className="w-full h-full object-cover rounded"
//                       />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="font-medium text-blue-600 hover:underline">
//                       {formData.title || 'Título del proyecto'}
//                     </h3>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {formData.seo.meta_description || formData.short_description || 'Descripción del proyecto...'}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       metrica-dip.com
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }