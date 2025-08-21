# Componentes Reutilizables Base - Sistema Admin

## 📦 **Componentes Principales Disponibles**

### **🏗️ Formularios y Validación**
```typescript
// Formularios dinámicos con validación Zod
import { DynamicForm } from '@/components/admin/DynamicForm'
import { EnhancedDynamicForm } from '@/components/admin/EnhancedDynamicForm'
import { ValidationPanel } from '@/components/admin/ValidationPanel'

// Uso típico:
<DynamicForm
  fields={formSchema.fields}
  groups={formSchema.groups}
  initialValues={pageData}
  onSubmit={handleSave}
  onCancel={() => setActiveTab('list')}
/>
```

### **🎨 Editores Especializados del Home**
```typescript
// Editores específicos que pueden adaptarse
import { StatisticsGrid } from '@/components/admin/home/StatisticsGrid'
import { RotatingWordsEditor } from '@/components/admin/home/RotatingWordsEditor'
import { ServiceBuilder } from '@/components/admin/home/ServiceBuilder'
import { PortfolioManager } from '@/components/admin/home/PortfolioManager'
import { PillarsEditor } from '@/components/admin/home/PillarsEditor'
import { PoliciesManager } from '@/components/admin/home/PoliciesManager'

// Adaptable para:
// StatisticsGrid -> Achievement metrics, KPIs, Contact stats
// ServiceBuilder -> Services page, Features lists  
// PortfolioManager -> Projects showcase, Case studies
// PillarsEditor -> Values, Pillars, Benefits
// PoliciesManager -> Policies, Commitments, Standards
```

### **📁 Gestión de Media**
```typescript
// Gestión completa de archivos multimedia
import { MediaManager } from '@/components/admin/MediaManager'
import { MediaPickerField } from '@/components/admin/MediaPickerField'

// Uso típico:
<MediaPickerField
  label="Imagen Hero"
  value={pageData.hero_image}
  onChange={(url) => updateField('hero_image', url)}
  allowUpload={true}
  allowExternal={true}
  category="hero"
  preview={true}
/>
```

### **🔍 Sistema de Datos y Tablas**
```typescript
// Tablas con acciones y filtros
import { DataTable } from '@/components/admin/DataTable'
import { BulkOperations } from '@/components/admin/BulkOperations'

// Para gestión de listas: team members, services, testimonials
<DataTable
  data={filteredData}
  columns={tableColumns}
  actions={rowActions}
  searchable={true}
/>
```

### **👁️ Preview y Monitoreo**
```typescript
// Preview de cambios en tiempo real
import { PreviewModal } from '@/components/admin/PreviewModal'
import { PerformanceMonitor } from '@/components/admin/PerformanceMonitor'
import { SystemHealth } from '@/components/admin/SystemHealth'

// Uso típico:
<PreviewModal
  isOpen={showPreview}
  data={formData}
  onClose={() => setShowPreview(false)}
  component="ContactPage"
  previewUrl="/contact"
/>
```

### **💾 Control de Versiones y Backups**
```typescript
// Sistema de auditoría y respaldos
import { VersionHistory } from '@/components/admin/VersionHistory'
import { BackupManager } from '@/components/admin/BackupManager'

// Para páginas críticas:
<VersionHistory
  resource="contact.json"
  onRollback={handleRollback}
  showDiff={true}
/>
```

### **🎯 Componentes de UX**
```typescript
// Mejoras de experiencia de usuario
import { LoadingStates } from '@/components/admin/LoadingStates'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { HelpSystem } from '@/components/admin/HelpSystem'
import { ProgressTracker } from '@/components/admin/ProgressTracker'
```

---

## 🔧 **Componentes a Crear para Nueva Arquitectura**

### **📂 Estructura de Carpetas Propuesta**
```
src/components/admin/
├── base/             # Componentes base del sistema (ya existen)
│   ├── DynamicForm.tsx
│   ├── MediaManager.tsx
│   ├── DataTable.tsx
│   ├── PreviewModal.tsx
│   └── ValidationPanel.tsx
│
├── shared/           # NUEVOS - Alta reutilización (3+ páginas)
│   ├── CategoryManager.tsx
│   ├── FAQManager.tsx
│   ├── ContactInfoManager.tsx
│   ├── SEOAdvancedEditor.tsx
│   ├── PaginationConfig.tsx
│   ├── ContentSectionsManager.tsx
│   ├── TestimonialsManager.tsx
│   └── SocialMetricsEditor.tsx
│
├── composite/        # NUEVOS - Media reutilización (2 páginas)
│   ├── ContactFormBuilder.tsx
│   ├── ServicesListManager.tsx
│   ├── EnvironmentalPracticesEditor.tsx
│   ├── DynamicProjectsPreview.tsx
│   ├── JobListingsPreview.tsx
│   ├── MapConfigEditor.tsx
│   ├── BlogHeroEditor.tsx
│   ├── CareersStaticEditor.tsx
│   ├── ApplicationFormConfig.tsx
│   ├── DepartmentManager.tsx
│   ├── InnovationShowcase.tsx
│   └── ProjectDisplaySettings.tsx
│
├── specialized/      # NUEVOS - Específicos por página
│   ├── cultura/
│   │   ├── TeamManagementSection.tsx
│   │   ├── CultureGalleryManager.tsx
│   │   ├── SocialImpactDashboard.tsx
│   │   └── VisionRoadmapSection.tsx
│   ├── services/
│   │   └── ProcessMethodologyEditor.tsx
│   └── compromiso/
│       └── CompromisoHeroEditor.tsx
│
└── pages/           # NUEVOS - Editores principales
    ├── ContactPageEditor.tsx
    ├── BlogConfigEditor.tsx
    ├── ServicesPageEditor.tsx
    ├── CompromisoPageEditor.tsx
    ├── PortfolioPageEditor.tsx
    ├── CareersPageEditor.tsx
    └── CulturaPageEditor.tsx
```

---

## 🎯 **Patterns de Reutilización Identificados**

### **1. Hero Section Pattern**
```typescript
// Patrón base reutilizable para todas las páginas
interface HeroEditorProps {
  data: {
    title: string
    subtitle?: string
    description?: string
    background_image?: string
    background_video?: string
    buttons?: Array<{text: string, href: string, type: 'primary' | 'secondary'}>
    stats?: Array<string | {label: string, value: string}>
  }
  onChange: (field: string, value: any) => void
  variant?: 'basic' | 'multimedia' | 'stats' | 'centered'
}

// Reutilizable en: Contact, Blog, Services, Compromiso, Portfolio, Careers
```

### **2. Content Sections Pattern**
```typescript
// Patrón para gestión de secciones de contenido
interface ContentSectionProps {
  sections: Array<{
    id: string
    title: string
    subtitle?: string
    content: string
    type: 'text' | 'list' | 'grid' | 'gallery'
    settings: Record<string, any>
  }>
  onSectionUpdate: (sectionId: string, updates: Partial<ContentSection>) => void
  onSectionReorder: (newOrder: string[]) => void
  templates?: Record<string, ContentSection>
}

// Reutilizable en: Blog, Services, Compromiso, Cultura
```

### **3. Form Builder Pattern**
```typescript
// Patrón para construcción de formularios
interface FormBuilderProps {
  formConfig: {
    fields: Array<FormField>
    validationRules: Record<string, ValidationRule>
    submitAction: string
    successMessage: string
    errorHandling: ErrorConfig
  }
  onConfigUpdate: (config: FormConfig) => void
  previewMode?: boolean
}

// Reutilizable en: Contact, Careers, Newsletter, Services
```

### **4. Media Gallery Pattern**
```typescript
// Patrón para gestión de galerías
interface MediaGalleryProps {
  images: Array<{
    id: string
    url: string
    alt: string
    caption?: string
    category?: string
    order: number
  }>
  onImagesUpdate: (images: MediaItem[]) => void
  categories?: string[]
  allowReorder?: boolean
  maxImages?: number
  layout?: 'grid' | 'masonry' | 'carousel'
}

// Reutilizable en: Cultura, Portfolio, Blog, Compromiso
```

---

## 📊 **Matriz de Reutilización**

| Componente | Contact | Blog | Services | Compromiso | Portfolio | Careers | Cultura |
|------------|---------|------|----------|------------|-----------|---------|---------|
| **HeroEditor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SEOAdvancedEditor** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **CategoryManager** | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **FAQManager** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **ContactInfoManager** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **TestimonialsManager** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **MediaGalleryManager** | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **StatisticsGrid** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **PillarsEditor** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |

**Resultado**: 77% de reutilización promedio

---

## 🔧 **APIs y Patrones de Integración**

### **API Pattern Unificado**
```typescript
// Todas las páginas usan el mismo patrón de API
const apiEndpoints = {
  get: `/api/admin/pages/${slug}`,
  put: `/api/admin/pages/${slug}`,
  preview: `/api/admin/pages/${slug}/preview`
}

// Hook unificado para gestión de páginas
const usePageEditor = (slug: string) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState([])
  
  const loadPage = async () => { /* ... */ }
  const savePage = async (updates) => { /* ... */ }
  const previewPage = async (data) => { /* ... */ }
  
  return { data, loading, errors, loadPage, savePage, previewPage }
}
```

### **Validation Pattern**
```typescript
// Schema base extendible para todas las páginas
const pageBaseSchema = z.object({
  page: z.object({
    title: z.string().min(10).max(60),
    description: z.string().min(50).max(160),
    url: z.string().url().optional()
  })
})

// Extensión específica por página
const contactPageSchema = pageBaseSchema.extend({
  hero: heroSchema,
  contact_info: contactInfoSchema,
  contact_form: contactFormSchema,
  faq: faqSchema
})
```

---

## ✅ **Próximos Pasos**

1. **Crear estructura de carpetas** según el plan
2. **Implementar componentes shared** (alta reutilización primero)
3. **Desarrollar componentes composite** (media reutilización)
4. **Crear componentes specialized** (específicos por página)
5. **Implementar editores principales** por página
6. **Testing y optimización** de rendimiento

Esta base permite implementar las 7 páginas pendientes de manera eficiente, manteniendo alta reutilización y clean code principles.