# 🏢 Estrategia de Escalabilidad para Careers - Métrica DIP

## 📋 Análisis del Estado Actual

### **Estructura JSON Actual**
El archivo `careers/content.json` (1,216 líneas) contiene:
- **Información de página**: Metadata y hero
- **5 departamentos** con información completa
- **5 job postings** muy detallados (300+ líneas cada uno)
- **Beneficios de empresa**: 5 categorías con múltiples beneficios
- **Proceso de contratación**: 6 pasos detallados
- **4 testimonios** de empleados
- **Rutas de carrera**: 2 tracks con 4 niveles cada uno
- **Información de ubicación** y modalidades de trabajo

### **Problema de Escalabilidad**
Con 1,000-100,000 ofertas de trabajo, el archivo actual se volvería:
- **Inmanejable**: 60MB+ de JSON
- **Lento**: Carga de 10+ segundos
- **Imposible de editar**: Browser crash en admin
- **SEO problemático**: Time to first byte alto

---

## 🏗️ Arquitectura de Archivos Recomendada

### **Estructura de Archivos Separados**

```
public/json/dynamic-content/careers/
├── config.json              # Configuración base de la página
├── departments/              
│   ├── index.json           # Lista de departamentos (metadata)
│   └── {department-id}.json # Detalles completos de cada departamento
├── jobs/                    
│   ├── index.json           # Lista de trabajos activos (solo datos mínimos)
│   ├── active/              # Jobs activos por ID
│   │   └── {job-id}.json    
│   ├── archived/            # Jobs archivados
│   │   └── {job-id}.json    
│   └── featured.json        # Jobs destacados (referencias)
├── company/                 
│   ├── benefits.json        # Beneficios de empresa
│   ├── hiring-process.json  # Proceso de contratación
│   ├── testimonials.json    # Testimonios de empleados
│   ├── career-paths.json    # Rutas de crecimiento
│   └── locations.json       # Información de oficinas
└── metadata.json            # Stats generales y última actualización
```

### **Ventajas de esta Arquitectura**
1. **Escalable**: Cada job es un archivo independiente
2. **Performance**: Solo carga datos necesarios
3. **Administrable**: Edición individual de elementos
4. **SEO Friendly**: Carga rápida y selective rendering
5. **Cacheable**: Cache granular por sección
6. **Versionable**: Git tracking individual
7. **API Friendly**: Endpoints específicos por recurso

---

## 📊 Estructura de Datos Optimizada

### **1. careers/config.json** (Configuración base - 200 líneas máx)
```json
{
  "page_info": {
    "title": "Bolsa de Trabajo | Métrica DIP",
    "description": "...",
    "hero": {
      "title": "Construye tu Carrera con Nosotros",
      "subtitle": "...",
      "background_image": "...",
      "cta_text": "Ver Oportunidades"
    }
  },
  "display_settings": {
    "jobs_per_page": 12,
    "show_salary": true,
    "show_remote_badge": true,
    "default_sort": "posted_date",
    "filters": ["department", "location", "level", "type", "remote"]
  },
  "seo": {
    "meta_title": "...",
    "meta_description": "...",
    "keywords": ["..."],
    "openGraph": { "..." }
  },
  "last_updated": "2025-01-19T00:00:00Z"
}
```

### **2. careers/jobs/index.json** (Lista principal - Datos mínimos)
```json
{
  "jobs": [
    {
      "id": "job-001",
      "title": "Director de Proyectos Senior",
      "slug": "director-proyectos-senior",
      "department_id": "gestion-direccion",
      "department_name": "Gestión y Dirección",
      "location_summary": "Lima, Híbrido",
      "type": "full-time",
      "level": "director",
      "salary_range": "S/ 12,000 - 18,000",
      "posted_date": "2024-12-15",
      "deadline": "2025-01-15",
      "featured": true,
      "urgent": false,
      "status": "active",
      "short_description": "Liderar proyectos de infraestructura de gran escala...",
      "applicant_count": 23,
      "view_count": 1542,
      "tags": ["gestión", "liderazgo", "PMP", "BIM"]
    }
    // Solo datos mínimos para listado - 50-100 líneas por job máximo
  ],
  "pagination": {
    "total_jobs": 1247,
    "total_pages": 104,
    "jobs_per_page": 12,
    "current_page": 1
  },
  "filters": {
    "departments": [/* departamento con count */],
    "locations": [/* ubicaciones con count */],
    "levels": [/* niveles con count */],
    "types": [/* tipos con count */]
  },
  "metadata": {
    "last_updated": "2025-01-19T00:00:00Z",
    "cache_duration": 300000  // 5 minutos
  }
}
```

### **3. careers/jobs/active/{job-id}.json** (Detalles completos)
```json
{
  "job": {
    "id": "job-001",
    "title": "Director de Proyectos Senior",
    "slug": "director-proyectos-senior",
    // ... todos los detalles completos del job actual
    "full_description": "...",
    "key_responsibilities": ["..."],
    "requirements": {
      "essential": ["..."],
      "preferred": ["..."]
    },
    "salary": {
      "min": 12000,
      "max": 18000,
      "currency": "PEN",
      "negotiable": true,
      "benefits_value": 4500
    },
    "application_process": {
      "steps": ["..."],
      "timeline": "2-3 semanas",
      "required_documents": ["..."]
    },
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "...",
        "required": true,
        "max_length": 2000
      }
    ]
  },
  "related_jobs": [
    {
      "id": "job-002",
      "title": "...",
      "slug": "..."
    }
  ],
  "department": {
    // Datos básicos del departamento para contexto
    "id": "gestion-direccion",
    "name": "Gestión y Dirección",
    "description": "..."
  }
}
```

### **4. careers/departments/index.json** (Lista de departamentos)
```json
{
  "departments": [
    {
      "id": "gestion-direccion",
      "name": "Gestión y Dirección",
      "slug": "gestion-direccion",
      "description": "Liderazgo estratégico, dirección de proyectos...",
      "icon": "Users",
      "color": "#E84E0F",
      "open_positions": 3,
      "total_employees": 12,
      "growth_rate": "+25%",
      "featured": true
    }
  ]
}
```

---

## 🎯 Interfaces Admin Recomendadas

### **Arquitectura de Componentes Admin**

Basado en `interfaz-general.md`, utilizando componentes existentes:

```typescript
// careers/admin/CareersManagementSystem.tsx
<CareersManagementSystem>
  <CareersConfigEditor />        // Reutiliza: HeroEditor, SEOAdvancedEditor
  <DepartmentsManager />         // Nuevo: CRUD de departamentos
  <JobListingsManager />         // Nuevo: Lista y filtros de jobs
  <CompanyDataManager />         // Reutiliza: TestimonialsManager, FAQManager
</CareersManagementSystem>
```

### **1. CareersConfigEditor** (Reutiliza componentes existentes)
```typescript
interface CareersConfigEditorProps {
  config: CareersConfig;
  onSave: (config: CareersConfig) => void;
}

export const CareersConfigEditor: React.FC<CareersConfigEditorProps> = ({ config, onSave }) => {
  return (
    <div className="space-y-8">
      <HeroEditor 
        hero={config.page_info.hero}
        onChange={(hero) => updateConfig('page_info.hero', hero)}
      />
      <SEOAdvancedEditor 
        seo={config.seo}
        onChange={(seo) => updateConfig('seo', seo)}
      />
      <DisplaySettingsPanel 
        settings={config.display_settings}
        onChange={(settings) => updateConfig('display_settings', settings)}
      />
    </div>
  );
};
```

### **2. DepartmentsManager** (Nuevo componente especializado)
```typescript
interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  open_positions: number;
  total_employees: number;
  featured: boolean;
  career_path: CareerPath;
  required_skills: string[];
  typical_projects: string[];
}

export const DepartmentsManager: React.FC = () => {
  return (
    <DataTable
      data={departments}
      columns={[
        { key: 'name', label: 'Department', sortable: true },
        { key: 'open_positions', label: 'Open Positions', sortable: true },
        { key: 'total_employees', label: 'Employees', sortable: true },
        { key: 'featured', label: 'Featured', type: 'boolean' },
        { key: 'actions', label: 'Actions', type: 'actions' }
      ]}
      actions={[
        { label: 'Edit', action: handleEdit, icon: 'Edit' },
        { label: 'View Jobs', action: handleViewJobs, icon: 'Briefcase' },
        { label: 'Delete', action: handleDelete, icon: 'Trash', variant: 'destructive' }
      ]}
      pagination={true}
      searchable={true}
    />
  );
};
```

### **3. JobListingsManager** (Nuevo componente principal)
```typescript
interface JobListingsManagerProps {
  viewMode: 'list' | 'cards' | 'detailed';
}

export const JobListingsManager: React.FC<JobListingsManagerProps> = ({ viewMode }) => {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <JobFiltersPanel 
        filters={filters}
        onChange={setFilters}
        departments={departments}
        locations={locations}
      />
      
      {/* Acciones en lote */}
      <BulkOperations 
        selectedIds={bulkSelection}
        actions={[
          { label: 'Archive Selected', action: handleBulkArchive },
          { label: 'Feature Selected', action: handleBulkFeature },
          { label: 'Export Selected', action: handleBulkExport },
          { label: 'Change Status', action: handleBulkStatusChange }
        ]}
      />
      
      {/* Lista de trabajos */}
      {viewMode === 'list' && (
        <JobDataTable 
          jobs={jobs}
          onSelect={setBulkSelection}
          onEdit={handleEditJob}
          onView={handleViewApplications}
          onArchive={handleArchiveJob}
        />
      )}
      
      {viewMode === 'cards' && (
        <JobCardsGrid 
          jobs={jobs}
          onEdit={handleEditJob}
          onQuickEdit={handleQuickEdit}
        />
      )}
      
      {/* Paginación */}
      <PaginationControls 
        totalItems={totalJobs}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
```

### **4. JobEditor** (Componente completo para CRUD)
```typescript
interface JobEditorProps {
  jobId?: string;
  mode: 'create' | 'edit' | 'duplicate';
  onSave: (job: JobPosting) => void;
  onCancel: () => void;
}

export const JobEditor: React.FC<JobEditorProps> = ({ jobId, mode, onSave, onCancel }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Secciones organizadas */}
      <JobBasicInfoSection />      // Title, department, location, type
      <JobDescriptionSection />    // Descriptions, requirements, responsibilities  
      <JobCompensationSection />   // Salary, benefits
      <JobApplicationSection />    // Process, questions, documents
      <JobSettingsSection />       // Status, featured, urgent, deadline
      <JobSEOSection />           // Meta info, tags
      
      {/* Preview panel */}
      <JobPreviewPanel />
      
      {/* Acciones */}
      <JobEditorActions 
        onSave={handleSave}
        onSaveAndPublish={handleSaveAndPublish}
        onPreview={handlePreview}
        onCancel={onCancel}
      />
    </div>
  );
};
```

---

## 💻 Interfaces Front-End Recomendadas

### **Páginas Front-End Necesarias**

1. **`/careers`** - Lista principal de trabajos
2. **`/careers/job/[slug]`** - Detalle de trabajo específico
3. **`/careers/[department]`** - Trabajos por departamento  
4. **`/careers/apply/[id]`** - Formulario de aplicación
5. **`/careers/profile`** - Perfil del candidato

### **1. Página Principal (/careers)**
```typescript
interface CareersPageProps {
  config: CareersConfig;
  jobs: JobSummary[];
  departments: DepartmentSummary[];
  filters: JobFilters;
  pagination: PaginationInfo;
}

export default async function CareersPage({ searchParams }: PageProps) {
  // Carga paralela de datos
  const [config, jobsData, departments] = await Promise.all([
    loadCareersConfig(),
    loadJobsIndex(searchParams),
    loadDepartmentsIndex()
  ]);

  return (
    <div>
      <CareersHero config={config.page_info.hero} stats={jobsData.stats} />
      <CareersFilters 
        filters={jobsData.filters}
        activeFilters={searchParams}
      />
      <JobsGrid 
        jobs={jobsData.jobs}
        viewMode={searchParams.view || 'cards'}
      />
      <DepartmentsShowcase departments={departments} />
      <CompanyBenefits />
      <CareersNewsletter />
    </div>
  );
}
```

### **2. Detalle de Trabajo (/careers/job/[slug])**
```typescript
interface JobDetailPageProps {
  job: JobPosting;
  relatedJobs: JobSummary[];
  department: Department;
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  // Carga optimizada - solo el job específico
  const jobData = await loadJobDetails(params.slug);
  
  if (!jobData) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <JobDetailHeader job={jobData.job} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JobDescription job={jobData.job} />
          <JobRequirements job={jobData.job} />
          <JobApplicationProcess job={jobData.job} />
        </div>
        <div className="lg:col-span-1">
          <JobSidebarInfo job={jobData.job} />
          <DepartmentInfo department={jobData.department} />
          <RelatedJobs jobs={jobData.relatedJobs} />
        </div>
      </div>
      <JobApplicationCTA jobId={jobData.job.id} />
    </div>
  );
}
```

### **3. Formulario de Aplicación (/careers/apply/[id])**
```typescript
interface ApplicationFormProps {
  job: JobPosting;
  questions: ApplicationQuestion[];
}

export default function ApplicationForm({ job, questions }: ApplicationFormProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <ApplicationHeader job={job} />
      <DynamicForm
        schema={applicationSchema}
        fields={[
          // Campos básicos
          { name: 'personalInfo', component: PersonalInfoSection },
          { name: 'documents', component: DocumentUploadSection },
          { name: 'experience', component: ExperienceSection },
          
          // Preguntas específicas del job
          ...questions.map(q => ({
            name: `question_${q.id}`,
            component: QuestionComponent,
            props: { question: q }
          }))
        ]}
        onSubmit={handleSubmitApplication}
      />
    </div>
  );
}
```

---

## 🔄 Operaciones CRUD Recomendadas

### **APIs Backend Necesarias**

```typescript
// /api/admin/careers/config
GET    /api/admin/careers/config              // Get page config
PUT    /api/admin/careers/config              // Update page config

// /api/admin/careers/departments  
GET    /api/admin/careers/departments         // List departments
POST   /api/admin/careers/departments         // Create department
GET    /api/admin/careers/departments/[id]    // Get department details
PUT    /api/admin/careers/departments/[id]    // Update department
DELETE /api/admin/careers/departments/[id]    // Delete department

// /api/admin/careers/jobs
GET    /api/admin/careers/jobs                // List jobs with filters/pagination
POST   /api/admin/careers/jobs                // Create new job
GET    /api/admin/careers/jobs/[id]           // Get job details
PUT    /api/admin/careers/jobs/[id]           // Update job  
DELETE /api/admin/careers/jobs/[id]           // Delete job (archive)
POST   /api/admin/careers/jobs/bulk           // Bulk operations

// /api/admin/careers/company
GET    /api/admin/careers/company/benefits    // Get benefits
PUT    /api/admin/careers/company/benefits    // Update benefits
GET    /api/admin/careers/company/testimonials // Get testimonials
PUT    /api/admin/careers/company/testimonials // Update testimonials

// Frontend APIs
GET    /api/careers                           // Public job listings
GET    /api/careers/job/[slug]               // Public job details
GET    /api/careers/departments              // Public departments
POST   /api/careers/applications            // Submit application
```

### **Implementación de APIs**

```typescript
// api/admin/careers/jobs/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const department = searchParams.get('department');
  const status = searchParams.get('status') || 'active';
  
  // Carga solo index.json para listado
  const jobsIndex = await readPublicJSON('/json/dynamic-content/careers/jobs/index.json');
  
  // Aplicar filtros
  let filteredJobs = jobsIndex.jobs.filter((job: JobSummary) => {
    if (department && job.department_id !== department) return false;
    if (status && job.status !== status) return false;
    return true;
  });
  
  // Paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  
  return NextResponse.json({
    jobs: paginatedJobs,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(filteredJobs.length / limit),
      total_jobs: filteredJobs.length,
      has_next: endIndex < filteredJobs.length,
      has_prev: page > 1
    },
    filters: jobsIndex.filters
  });
}

export async function POST(request: NextRequest) {
  const newJob = await request.json();
  
  // Validar datos
  const validatedJob = jobPostingSchema.parse(newJob);
  
  // Generar ID y slug únicos
  validatedJob.id = generateUniqueId();
  validatedJob.slug = generateSlug(validatedJob.title);
  
  // Guardar archivo individual del job
  await writePublicJSON(
    `/json/dynamic-content/careers/jobs/active/${validatedJob.id}.json`,
    { job: validatedJob }
  );
  
  // Actualizar index.json
  const jobsIndex = await readPublicJSON('/json/dynamic-content/careers/jobs/index.json');
  
  // Agregar al índice (solo datos mínimos)
  const jobSummary: JobSummary = {
    id: validatedJob.id,
    title: validatedJob.title,
    slug: validatedJob.slug,
    department_id: validatedJob.department,
    department_name: validatedJob.department_name,
    location_summary: validatedJob.location.city,
    type: validatedJob.type,
    level: validatedJob.level,
    salary_range: `${validatedJob.salary.currency} ${validatedJob.salary.min} - ${validatedJob.salary.max}`,
    posted_date: new Date().toISOString(),
    deadline: validatedJob.deadline,
    featured: validatedJob.featured,
    urgent: validatedJob.urgent,
    status: validatedJob.status,
    short_description: validatedJob.short_description,
    applicant_count: 0,
    view_count: 0,
    tags: validatedJob.tags
  };
  
  jobsIndex.jobs.unshift(jobSummary);
  jobsIndex.pagination.total_jobs += 1;
  
  await writePublicJSON('/json/dynamic-content/careers/jobs/index.json', jobsIndex);
  
  return NextResponse.json({ success: true, job: validatedJob });
}
```

---

## 🎛️ Sistema de Cache Inteligente

### **Estrategia de Cache por Componente**

```typescript
// Cache configuration
const careersCache = {
  'careers.config': { 
    ttl: 30 * 60 * 1000,      // 30 min (cambia poco)
    priority: 'high' 
  },
  'careers.jobs.index': { 
    ttl: 5 * 60 * 1000,       // 5 min (cambia frecuente)
    priority: 'critical' 
  },
  'careers.job.details': { 
    ttl: 15 * 60 * 1000,      // 15 min (individual)
    priority: 'medium' 
  },
  'careers.departments': { 
    ttl: 60 * 60 * 1000,      // 1 hour (estable)
    priority: 'medium' 
  },
  'careers.company': { 
    ttl: 24 * 60 * 60 * 1000, // 24 hours (muy estable)
    priority: 'low' 
  }
};
```

### **Invalidación Inteligente**

```typescript
// utils/careersCache.ts
export class CareersCache {
  static async invalidateJob(jobId: string) {
    // Invalida cache específico del job
    cache.delete(`careers.job.${jobId}`);
    
    // Invalida índice para reflejar cambios
    cache.delete('careers.jobs.index');
    
    // Invalida páginas relacionadas
    const job = await this.getJobDetails(jobId);
    cache.delete(`careers.department.${job.department_id}`);
  }
  
  static async invalidateDepartment(departmentId: string) {
    // Invalida departamento
    cache.delete(`careers.department.${departmentId}`);
    
    // Invalida jobs de ese departamento
    cache.deleteByTag(`department:${departmentId}`);
    
    // Invalida índices
    cache.delete('careers.jobs.index');
    cache.delete('careers.departments.index');
  }
}
```

---

## 📈 Métricas y Monitoreo

### **KPIs de Performance**
- **Tiempo de carga inicial**: < 2s para lista de jobs
- **Tiempo de búsqueda**: < 500ms con filtros
- **Carga de job individual**: < 1s
- **Cache hit rate**: > 80%
- **Bundle size**: < 300KB para página careers

### **Analytics de Contenido**
- **Jobs más vistas**: Top 10 positions
- **Departamentos populares**: Clicks por departamento  
- **Conversion rate**: Aplicaciones por vista
- **Drop-off points**: Donde abandonan el proceso
- **Search terms**: Qué buscan los candidatos

### **Admin UX Metrics**
- **Time to publish job**: < 3 minutos
- **Time to edit job**: < 1 minuto
- **Bulk operations speed**: < 10s para 100 jobs
- **Error rate**: < 0.1%

---

## 🚀 Plan de Implementación

### **Fase 1: Migración de Datos** (2 días)
1. **Día 1**: Crear estructura de archivos separados
2. **Día 2**: Migrar datos existentes y crear APIs base

### **Fase 2: Interfaces Admin** (3 días)  
1. **Día 1**: CareersConfigEditor y DepartmentsManager
2. **Día 2**: JobListingsManager y JobEditor
3. **Día 3**: CompanyDataManager y testing

### **Fase 3: Front-End Pages** (3 días)
1. **Día 1**: /careers página principal
2. **Día 2**: /careers/job/[slug] página de detalle
3. **Día 3**: /careers/apply/[id] formulario de aplicación

### **Fase 4: Optimización** (2 días)
1. **Día 1**: Implementar cache inteligente y optimizaciones
2. **Día 2**: Testing, debugging y documentación

**Total: 10 días de desarrollo**

---

## ✅ Componentes Reutilizables Identificados

### **Del interfaz-general.md que podemos reutilizar:**
- `HeroEditor` → CareersHeroEditor
- `SEOAdvancedEditor` → Job SEO optimization
- `DataTable` → JobListingsManager
- `BulkOperations` → Mass job operations  
- `DynamicForm` → JobEditor y ApplicationForm
- `ValidationPanel` → Job data validation
- `PreviewModal` → Job preview
- `MediaManager` → Job images/documents
- `TestimonialsManager` → Company testimonials
- `FAQManager` → Application process FAQ

### **Nuevos componentes específicos:**
- `DepartmentsManager` → Departments CRUD
- `JobFiltersPanel` → Advanced job filtering
- `JobCardsGrid` → Job display components  
- `ApplicationFormBuilder` → Custom application forms
- `CandidateManager` → Application tracking
- `CompensationEditor` → Salary and benefits
- `CareerPathsEditor` → Growth tracks visualization

---

Esta estrategia garantiza que el sistema de careers sea:
- ✅ **Escalable** hasta 100,000+ positions
- ✅ **Performante** con carga <2s siempre
- ✅ **Administrable** con interfaces intuitivas  
- ✅ **SEO optimized** para mejor ranking
- ✅ **Cache inteligente** para óptima UX
- ✅ **Componentes reutilizables** siguiendo Clean Code
- ✅ **APIs bien estructuradas** para todas las operaciones