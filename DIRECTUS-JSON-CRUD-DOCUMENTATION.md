# Directus JSON CRUD System - Documentación Completa

## Descripción General
Sistema completo de línea de comandos (CLI) para Directus que permite:
1. Crear colecciones desde definiciones JSON
2. Ejecutar operaciones CRUD individuales desde terminal
3. Gestionar registros sin escribir código

## Instalación y Configuración

### Requisitos Previos
- Node.js instalado
- Directus corriendo en http://localhost:8055
- Credenciales de administrador

### Archivos del Sistema
```
directus-crud-cli.js              # CLI completo para operaciones CRUD
directus-crud-system.js           # Sistema de creación desde JSON
collection-simple-example.json    # Ejemplo simple
collection-products-example.json  # Ejemplo complejo
```

## Parte 1: CLI para Operaciones CRUD Individuales

### Comandos Disponibles

#### CREATE - Crear nuevo registro
```bash
# Con datos directos
node directus-crud-cli.js create employees first_name=Juan,last_name=Pérez,email=juan@company.com

# Con archivo JSON
node directus-crud-cli.js create employees data.json
```

#### READ - Leer registros
```bash
# Leer todos los registros
node directus-crud-cli.js read employees

# Leer un registro específico por ID
node directus-crud-cli.js read employees 5

# Con opciones de filtrado
node directus-crud-cli.js read employees --limit=10 --sort=-created_at
```

#### UPDATE - Actualizar registro
```bash
# Actualizar campos específicos
node directus-crud-cli.js update employees 5 salary=80000,department=IT

# Con archivo JSON
node directus-crud-cli.js update employees 5 updates.json
```

#### DELETE - Eliminar registro
```bash
# Con confirmación
node directus-crud-cli.js delete employees 5

# Sin confirmación (forzado)
node directus-crud-cli.js delete employees 5 --force
```

#### SEARCH - Buscar registros
```bash
# Buscar por campo específico
node directus-crud-cli.js search employees --filter=department:Engineering
```

#### COLLECTION - Gestión de colecciones
```bash
# Listar todas las colecciones
node directus-crud-cli.js collection list

# Ver información de una colección
node directus-crud-cli.js collection info employees

# Eliminar colección
node directus-crud-cli.js collection drop test_collection
```

### Ejemplos Prácticos del CLI

```bash
# 1. Crear un nuevo producto
node directus-crud-cli.js create products name="Laptop Gamer",price=1299.99,stock=15,category=electronics

# 2. Ver todos los productos
node directus-crud-cli.js read products

# 3. Ver un producto específico
node directus-crud-cli.js read products 10

# 4. Actualizar precio de un producto
node directus-crud-cli.js update products 10 price=999.99,discount_percentage=20

# 5. Eliminar un producto
node directus-crud-cli.js delete products 10 --force

# 6. Buscar productos por categoría
node directus-crud-cli.js search products --filter=category:electronics
```

## Parte 2: Sistema de Creación desde JSON

### Comandos Básicos

```bash
# Crear colección desde JSON
node directus-crud-system.js mi-coleccion.json

# Eliminar colección existente antes de crear
node directus-crud-system.js mi-coleccion.json --drop

# Ejecutar test CRUD después de crear
node directus-crud-system.js mi-coleccion.json --test

# Crear sin insertar datos de ejemplo
node directus-crud-system.js mi-coleccion.json --no-data

# Combinar opciones
node directus-crud-system.js mi-coleccion.json --drop --test
```

## Estructura del JSON

### Estructura Básica
```json
{
  "action": "create",      // create, drop, recreate
  "testCRUD": true,        // Ejecutar test CRUD automáticamente
  "collection": {
    "name": "nombre_tabla",
    "icon": "shopping_cart",
    "note": "Descripción de la colección",
    "color": "#2196F3",
    "fields": {
      // Definición de campos
    },
    "data": [
      // Datos de ejemplo opcionales
    ]
  },
  "testData": {
    // Datos para test CRUD
  }
}
```

## Tipos de Campos Soportados

### Tipos de Texto
```json
{
  "nombre": {
    "type": "string",
    "required": true,
    "maxLength": 255,
    "description": "Nombre del elemento"
  },
  "descripcion": {
    "type": "text",
    "description": "Descripción larga"
  },
  "email": {
    "type": "email",
    "required": true,
    "unique": true,
    "description": "Correo electrónico"
  },
  "url": {
    "type": "url",
    "description": "Sitio web"
  },
  "telefono": {
    "type": "phone",
    "description": "Número de teléfono"
  },
  "slug": {
    "type": "slug",
    "unique": true,
    "description": "URL amigable"
  }
}
```

### Tipos Numéricos
```json
{
  "cantidad": {
    "type": "integer",
    "required": true,
    "default": 0,
    "description": "Cantidad entera"
  },
  "precio": {
    "type": "decimal",
    "precision": 10,
    "scale": 2,
    "description": "Precio con decimales"
  },
  "porcentaje": {
    "type": "float",
    "precision": 5,
    "scale": 2,
    "description": "Porcentaje decimal"
  }
}
```

### Tipos de Fecha/Hora
```json
{
  "fecha_nacimiento": {
    "type": "date",
    "required": true,
    "description": "Fecha de nacimiento"
  },
  "fecha_hora": {
    "type": "datetime",
    "description": "Fecha y hora completa"
  },
  "hora_inicio": {
    "type": "time",
    "description": "Hora de inicio"
  },
  "created_at": {
    "type": "timestamp",
    "special": "date-created",
    "readonly": true,
    "description": "Fecha de creación"
  },
  "updated_at": {
    "type": "timestamp",
    "special": "date-updated",
    "readonly": true,
    "description": "Última actualización"
  }
}
```

### Tipos Especiales
```json
{
  "activo": {
    "type": "boolean",
    "default": true,
    "description": "Estado activo/inactivo"
  },
  "categoria": {
    "type": "select",
    "required": true,
    "options": [
      { "text": "Electrónica", "value": "electronics" },
      { "text": "Ropa", "value": "clothing" },
      { "text": "Libros", "value": "books" }
    ],
    "description": "Categoría del producto"
  },
  "tags": {
    "type": "multiselect",
    "options": ["tag1", "tag2", "tag3"],
    "description": "Etiquetas múltiples"
  },
  "configuracion": {
    "type": "json",
    "description": "Configuración JSON"
  },
  "color": {
    "type": "color",
    "description": "Selector de color"
  },
  "icono": {
    "type": "icon",
    "description": "Selector de iconos"
  },
  "contenido": {
    "type": "wysiwyg",
    "description": "Editor HTML enriquecido"
  },
  "notas": {
    "type": "markdown",
    "description": "Editor Markdown"
  }
}
```

## Ejemplos Completos

### Ejemplo 1: Gestión de Empleados
```json
{
  "action": "create",
  "testCRUD": true,
  "collection": {
    "name": "employees",
    "icon": "people",
    "note": "Gestión de empleados",
    "fields": {
      "first_name": {
        "type": "string",
        "required": true,
        "maxLength": 100,
        "description": "Nombre"
      },
      "last_name": {
        "type": "string",
        "required": true,
        "maxLength": 100,
        "description": "Apellido"
      },
      "email": {
        "type": "email",
        "required": true,
        "unique": true,
        "description": "Email corporativo"
      },
      "department": {
        "type": "select",
        "required": true,
        "options": [
          "Engineering",
          "Sales",
          "Marketing",
          "HR",
          "Finance"
        ],
        "description": "Departamento"
      },
      "salary": {
        "type": "decimal",
        "precision": 10,
        "scale": 2,
        "description": "Salario anual"
      },
      "hire_date": {
        "type": "date",
        "required": true,
        "description": "Fecha de contratación"
      },
      "is_active": {
        "type": "boolean",
        "default": true,
        "description": "Empleado activo"
      }
    },
    "data": [
      {
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan.perez@empresa.com",
        "department": "Engineering",
        "salary": 75000.00,
        "hire_date": "2023-01-15",
        "is_active": true
      }
    ]
  }
}
```

### Ejemplo 2: Catálogo de Productos
```json
{
  "action": "create",
  "collection": {
    "name": "products",
    "icon": "shopping_cart",
    "note": "Catálogo de productos",
    "color": "#4CAF50",
    "fields": {
      "name": {
        "type": "string",
        "required": true,
        "maxLength": 255,
        "description": "Nombre del producto"
      },
      "sku": {
        "type": "string",
        "unique": true,
        "required": true,
        "maxLength": 50,
        "description": "Código SKU"
      },
      "description": {
        "type": "wysiwyg",
        "description": "Descripción detallada"
      },
      "price": {
        "type": "decimal",
        "required": true,
        "precision": 10,
        "scale": 2,
        "description": "Precio"
      },
      "category": {
        "type": "select",
        "required": true,
        "options": [
          { "text": "Electrónica", "value": "electronics" },
          { "text": "Ropa", "value": "clothing" },
          { "text": "Hogar", "value": "home" }
        ],
        "description": "Categoría"
      },
      "tags": {
        "type": "json",
        "description": "Etiquetas del producto"
      },
      "images": {
        "type": "json",
        "description": "URLs de imágenes"
      },
      "stock": {
        "type": "integer",
        "default": 0,
        "description": "Stock disponible"
      },
      "featured": {
        "type": "boolean",
        "default": false,
        "description": "Producto destacado"
      },
      "published": {
        "type": "boolean",
        "default": true,
        "description": "Publicado"
      },
      "created_at": {
        "type": "datetime",
        "special": "date-created",
        "readonly": true
      },
      "updated_at": {
        "type": "datetime",
        "special": "date-updated",
        "readonly": true
      }
    }
  }
}
```

### Ejemplo 3: Sistema de Blog
```json
{
  "action": "create",
  "collection": {
    "name": "blog_posts",
    "icon": "article",
    "note": "Artículos del blog",
    "fields": {
      "title": {
        "type": "string",
        "required": true,
        "maxLength": 255,
        "description": "Título del artículo"
      },
      "slug": {
        "type": "slug",
        "required": true,
        "unique": true,
        "description": "URL del artículo"
      },
      "content": {
        "type": "wysiwyg",
        "required": true,
        "description": "Contenido del artículo"
      },
      "excerpt": {
        "type": "text",
        "maxLength": 500,
        "description": "Resumen"
      },
      "author": {
        "type": "string",
        "required": true,
        "description": "Autor"
      },
      "category": {
        "type": "select",
        "options": [
          "Technology",
          "Business",
          "Design",
          "Marketing"
        ],
        "description": "Categoría"
      },
      "tags": {
        "type": "json",
        "description": "Etiquetas"
      },
      "featured_image": {
        "type": "url",
        "description": "Imagen destacada"
      },
      "status": {
        "type": "select",
        "required": true,
        "default": "draft",
        "options": [
          { "text": "Borrador", "value": "draft" },
          { "text": "Publicado", "value": "published" },
          { "text": "Archivado", "value": "archived" }
        ],
        "description": "Estado"
      },
      "published_at": {
        "type": "datetime",
        "description": "Fecha de publicación"
      },
      "views": {
        "type": "integer",
        "default": 0,
        "description": "Vistas"
      },
      "likes": {
        "type": "integer",
        "default": 0,
        "description": "Me gusta"
      },
      "seo_title": {
        "type": "string",
        "maxLength": 160,
        "description": "Título SEO"
      },
      "seo_description": {
        "type": "text",
        "maxLength": 320,
        "description": "Descripción SEO"
      },
      "created_at": {
        "type": "datetime",
        "special": "date-created",
        "readonly": true
      },
      "updated_at": {
        "type": "datetime",
        "special": "date-updated",
        "readonly": true
      }
    }
  }
}
```

## Propiedades Avanzadas de Campos

### Propiedades Comunes
```json
{
  "campo": {
    "type": "string",           // Tipo de campo (requerido)
    "required": true,           // Campo obligatorio
    "unique": true,             // Valor único
    "readonly": true,           // Solo lectura
    "hidden": true,             // Campo oculto
    "default": "valor",         // Valor por defecto
    "description": "texto",     // Descripción/nota
    "validation": {},           // Reglas de validación
    "validationMessage": "",    // Mensaje de error personalizado
    "width": "half",            // Ancho: full, half
    "sort": 1,                  // Orden del campo
    "group": "group_name",      // Grupo de campos
    "interface": "custom",      // Interface personalizada
    "special": ["uuid"]         // Características especiales
  }
}
```

### Características Especiales (special)
- `auto-increment`: ID autoincremental
- `date-created`: Fecha de creación automática
- `date-updated`: Fecha de actualización automática
- `user-created`: Usuario que creó
- `user-updated`: Usuario que actualizó
- `uuid`: Identificador único universal
- `file`: Archivo adjunto
- `hash`: Campo de hash

## Operaciones CRUD Disponibles

### CREATE - Crear Registro
```javascript
const crud = new DirectusCRUDSystem();
await crud.authenticate();
const result = await crud.create('collection_name', {
  field1: 'value1',
  field2: 'value2'
});
```

### READ - Leer Registros
```javascript
// Leer todos
const all = await crud.read('collection_name');

// Leer uno específico
const single = await crud.read('collection_name', 1);

// Con parámetros
const filtered = await crud.read('collection_name', null, {
  filter: { status: 'active' },
  sort: '-created_at',
  limit: 10
});
```

### UPDATE - Actualizar Registro
```javascript
const updated = await crud.update('collection_name', 1, {
  field1: 'new_value'
});
```

### DELETE - Eliminar Registro
```javascript
const deleted = await crud.delete('collection_name', 1);
```

## Resolución de Problemas

### Error: "You don't have permission to access this"
**Solución**: Verificar que el rol administrator tenga `admin_access: true`

### Error: "Value has to be unique"
**Solución**: El campo marcado como unique ya tiene ese valor en otro registro

### Error: "Field is required"
**Solución**: Falta un campo obligatorio en los datos

### Error: "Invalid field type"
**Solución**: Verificar que el tipo de campo sea válido según la lista soportada

## Mejores Prácticas

1. **Siempre incluir campo ID**: Si no lo defines, se crea automáticamente
2. **Usar tipos apropiados**: Elegir el tipo correcto mejora la UI en Directus
3. **Documentar campos**: Usar `description` para explicar el propósito
4. **Validación temprana**: Definir `required` y `unique` desde el inicio
5. **Datos de prueba**: Incluir 2-3 registros de ejemplo para testing
6. **Nombres descriptivos**: Usar nombres claros para colecciones y campos
7. **Backup antes de drop**: Siempre respaldar antes de eliminar colecciones

## Scripts Útiles

### Crear múltiples colecciones
```bash
#!/bin/bash
for file in collections/*.json; do
  node directus-crud-system.js "$file" --drop
done
```

### Test automático
```bash
node directus-crud-system.js mi-coleccion.json --drop --test
```

### Migración de datos
```javascript
// Exportar datos existentes
const data = await crud.read('old_collection');

// Crear nueva colección con estructura mejorada
await crud.createCollection(newDefinition);

// Importar datos
for (const record of data) {
  await crud.create('new_collection', transformRecord(record));
}
```

## Conclusión

Este sistema permite:
- ✅ Crear colecciones complejas desde JSON
- ✅ Ejecutar operaciones CRUD sin código repetitivo
- ✅ Testing automático de colecciones
- ✅ Migración y gestión de datos
- ✅ Reutilización de definiciones

Con esta herramienta, puedes gestionar toda la estructura de datos de Directus de manera programática y reproducible.