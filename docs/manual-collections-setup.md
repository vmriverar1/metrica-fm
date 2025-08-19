# 🎯 Configuración Manual de Collections - Portafolio

## ⚠️ Instrucciones Importantes

Como las rutas de API para crear campos automáticamente no están disponibles en esta versión de Directus, necesitamos configurar las collections manualmente a través del admin panel.

## 🌐 Acceso al Admin Panel

**URL**: http://localhost:8055  
**Email**: admin@metrica-dip.com  
**Password**: MetricaDIP2024!

---

## 📋 1. Collection: project_categories

### 1.1 Verificar Collection
✅ Ya creada automáticamente

### 1.2 Configurar Campos Manualmente

Ir a **Settings** → **Data Model** → **project_categories** → **Create Field**

#### Campo 1: name
- **Type**: String
- **Field Name**: `name`
- **Display Name**: Name
- **Required**: ✅ Yes
- **Interface**: Input
- **Note**: "Nombre de la categoría (ej: Oficina, Retail)"

#### Campo 2: slug  
- **Type**: String
- **Field Name**: `slug`
- **Display Name**: Slug
- **Required**: ✅ Yes
- **Interface**: Input
- **Unique**: ✅ Yes
- **Note**: "URL amigable (ej: oficina, retail)"

#### Campo 3: description
- **Type**: Text
- **Field Name**: `description`
- **Display Name**: Description  
- **Required**: ❌ No
- **Interface**: Textarea
- **Note**: "Descripción de la categoría"

#### Campo 4: color
- **Type**: String
- **Field Name**: `color`
- **Display Name**: Color
- **Required**: ❌ No
- **Interface**: Select Color
- **Default Value**: `#6644FF`
- **Note**: "Color hex para la categoría"

#### Campo 5: icon
- **Type**: String
- **Field Name**: `icon`
- **Display Name**: Icon
- **Required**: ❌ No
- **Interface**: Select Icon
- **Default Value**: `folder`
- **Note**: "Ícono para la categoría"

---

## 📋 2. Collection: projects

### 2.1 Crear Collection
1. Ir a **Settings** → **Data Model**
2. Click **Create Collection**
3. **Collection Name**: `projects`
4. **Primary Key**: Auto-generated UUID
5. **Display Template**: `{{title}}`
6. **Icon**: `work`
7. **Note**: "Proyectos de construcción y desarrollo"

### 2.2 Configurar Campos

#### Campo 1: title
- **Type**: String
- **Field Name**: `title`
- **Display Name**: Title
- **Required**: ✅ Yes
- **Interface**: Input
- **Note**: "Título del proyecto"

#### Campo 2: slug
- **Type**: String  
- **Field Name**: `slug`
- **Display Name**: Slug
- **Required**: ✅ Yes
- **Interface**: Input
- **Unique**: ✅ Yes
- **Note**: "URL amigable del proyecto"

#### Campo 3: category
- **Type**: Many to One Relationship
- **Field Name**: `category`
- **Display Name**: Category
- **Required**: ✅ Yes
- **Related Collection**: `project_categories`
- **Interface**: Select Dropdown
- **Note**: "Categoría del proyecto"

#### Campo 4: featured_image
- **Type**: File
- **Field Name**: `featured_image`
- **Display Name**: Featured Image
- **Required**: ✅ Yes
- **Interface**: File
- **Accept**: Images only
- **Note**: "Imagen principal del proyecto"

#### Campo 5: thumbnail_image
- **Type**: File
- **Field Name**: `thumbnail_image`
- **Display Name**: Thumbnail Image
- **Required**: ❌ No
- **Interface**: File
- **Accept**: Images only
- **Note**: "Imagen miniatura para listados"

#### Campo 6: description
- **Type**: Text
- **Field Name**: `description`
- **Display Name**: Description
- **Required**: ✅ Yes
- **Interface**: WYSIWYG
- **Note**: "Descripción completa del proyecto"

#### Campo 7: short_description
- **Type**: String
- **Field Name**: `short_description`
- **Display Name**: Short Description
- **Required**: ✅ Yes
- **Interface**: Textarea
- **Note**: "Descripción corta para cards y previews"

#### Campo 8: location
- **Type**: JSON
- **Field Name**: `location`
- **Display Name**: Location
- **Required**: ✅ Yes
- **Interface**: Code
- **Language**: JSON
- **Note**: "Ubicación: {city, region, address, coordinates}"

#### Campo 9: featured
- **Type**: Boolean
- **Field Name**: `featured`
- **Display Name**: Featured
- **Required**: ❌ No
- **Interface**: Toggle
- **Default**: false
- **Note**: "Proyecto destacado en home"

#### Campo 10: completed_at
- **Type**: Date
- **Field Name**: `completed_at`
- **Display Name**: Completed At
- **Required**: ✅ Yes
- **Interface**: Date
- **Note**: "Fecha de finalización del proyecto"

#### Campo 11: status
- **Type**: String
- **Field Name**: `status`
- **Display Name**: Status
- **Required**: ✅ Yes
- **Interface**: Select Dropdown
- **Options**: 
  ```
  published | Published
  draft | Draft  
  archived | Archived
  ```
- **Default**: `draft`
- **Note**: "Estado de publicación"

#### Campo 12: tags
- **Type**: JSON
- **Field Name**: `tags`
- **Display Name**: Tags
- **Required**: ❌ No
- **Interface**: Tags
- **Note**: "Tags del proyecto (ej: sostenible, premiado)"

---

## 📋 3. Collection: project_details

### 3.1 Crear Collection
1. **Collection Name**: `project_details`
2. **Primary Key**: Auto-generated UUID
3. **Display Template**: `{{client}} - {{project.title}}`
4. **Icon**: `info`
5. **Note**: "Detalles técnicos de proyectos"

### 3.2 Configurar Campos

#### Campo 1: project
- **Type**: One to One Relationship
- **Field Name**: `project`
- **Display Name**: Project
- **Required**: ✅ Yes
- **Related Collection**: `projects`
- **Interface**: Select Dropdown
- **Note**: "Proyecto relacionado"

#### Campo 2: client
- **Type**: String
- **Field Name**: `client`
- **Display Name**: Client
- **Required**: ✅ Yes
- **Interface**: Input
- **Note**: "Nombre del cliente"

#### Campo 3: duration
- **Type**: String
- **Field Name**: `duration`
- **Display Name**: Duration
- **Required**: ❌ No
- **Interface**: Input
- **Note**: "Duración del proyecto (ej: 18 meses)"

#### Campo 4: investment
- **Type**: String
- **Field Name**: `investment`
- **Display Name**: Investment
- **Required**: ❌ No
- **Interface**: Input
- **Note**: "Inversión del proyecto (ej: $15M USD)"

#### Campo 5: area
- **Type**: String
- **Field Name**: `area`
- **Display Name**: Area
- **Required**: ❌ No
- **Interface**: Input
- **Note**: "Área del proyecto (ej: 45,000 m²)"

#### Campo 6: team
- **Type**: JSON
- **Field Name**: `team`
- **Display Name**: Team
- **Required**: ❌ No
- **Interface**: Tags
- **Note**: "Equipo de trabajo (array de strings)"

#### Campo 7: certifications
- **Type**: JSON
- **Field Name**: `certifications`
- **Display Name**: Certifications
- **Required**: ❌ No
- **Interface**: Tags
- **Note**: "Certificaciones obtenidas (array de strings)"

---

## 📋 4. Collection: project_gallery

### 4.1 Crear Collection
1. **Collection Name**: `project_gallery`
2. **Primary Key**: Auto-generated UUID
3. **Display Template**: `{{caption}} - {{project.title}}`
4. **Icon**: `photo_library`
5. **Note**: "Galería de imágenes de proyectos"

### 4.2 Configurar Campos

#### Campo 1: project
- **Type**: Many to One Relationship
- **Field Name**: `project`
- **Display Name**: Project
- **Required**: ✅ Yes
- **Related Collection**: `projects`
- **Interface**: Select Dropdown
- **Note**: "Proyecto al que pertenece la imagen"

#### Campo 2: image
- **Type**: File
- **Field Name**: `image`
- **Display Name**: Image
- **Required**: ✅ Yes
- **Interface**: File
- **Accept**: Images only
- **Note**: "Imagen de la galería"

#### Campo 3: caption
- **Type**: String
- **Field Name**: `caption`
- **Display Name**: Caption
- **Required**: ❌ No
- **Interface**: Input
- **Note**: "Descripción de la imagen"

#### Campo 4: stage
- **Type**: String
- **Field Name**: `stage`
- **Display Name**: Stage
- **Required**: ✅ Yes
- **Interface**: Select Dropdown
- **Options**:
  ```
  inicio | Inicio
  proceso | Proceso
  final | Final
  ```
- **Note**: "Etapa del proyecto en la imagen"

#### Campo 5: order
- **Type**: Integer
- **Field Name**: `order`
- **Display Name**: Order
- **Required**: ❌ No
- **Interface**: Input
- **Default**: 0
- **Note**: "Orden de la imagen en la galería"

---

## ✅ Lista de Verificación

### Collections Creadas:
- [ ] project_categories (con todos los campos)
- [ ] projects (con todos los campos) 
- [ ] project_details (con todos los campos)
- [ ] project_gallery (con todos los campos)

### Relaciones Configuradas:
- [ ] projects.category → project_categories
- [ ] project_details.project → projects (One-to-One)
- [ ] project_gallery.project → projects (Many-to-One)

### Datos Iniciales:
- [ ] Ejecutar: `node populate-categories.js`

---

## 🚀 Próximo Paso

Una vez configuradas todas las collections manualmente:

1. **Ejecutar**: `node populate-categories.js` para poblar categorías
2. **Proceder con**: Migración de datos de proyectos existentes
3. **Continuar con**: API integration en Next.js

**¿Completaste la configuración manual? ¡Avísame para continuar!** 🎉