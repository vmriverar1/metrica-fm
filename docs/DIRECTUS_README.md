# Directus CMS - Métrica DIP

## 🚀 Quick Start

### Prerequisitos
- Docker y Docker Compose instalados
- Node.js 18+ instalado
- Puerto 8055 disponible (Directus)
- Puerto 5432 disponible (PostgreSQL)

### Instalación Rápida

1. **Iniciar Directus**:
```bash
npm run directus:start
```

2. **Verificar estado**:
```bash
npm run directus:status
```

3. **Acceder al Admin Panel**:
- URL: http://localhost:8055
- Email: `admin@metrica-dip.com`
- Password: `MetricaDIP2024!`

### Comandos Disponibles

```bash
# Servicios
npm run directus:start    # Iniciar Directus y PostgreSQL
npm run directus:stop     # Detener servicios
npm run directus:restart  # Reiniciar servicios
npm run directus:status   # Ver estado de servicios

# Debugging
npm run directus:logs     # Ver logs en tiempo real

# Reset (¡CUIDADO! Elimina todos los datos)
npm run directus:reset    # Reiniciar completamente
```

## ⚙️ Configuración

### Variables de Entorno

Archivo `.env.local`:
```env
# Directus API
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_DIRECTUS_ASSETS_URL=http://localhost:8055/assets
DIRECTUS_STATIC_TOKEN=your_static_token_here

# Database
DATABASE_URL=postgresql://directus:directus_password@localhost:5432/metrica_directus

# Development
NODE_ENV=development
DIRECTUS_DEBUG=true
```

### Generar Token de API

1. Acceder al admin panel: http://localhost:8055
2. Ir a **Settings** > **Roles & Permissions**
3. Seleccionar el rol **Administrator**
4. En la pestaña **App Access**, generar un **Static Token**
5. Copiar el token a `.env.local` en `DIRECTUS_STATIC_TOKEN`

## 📊 Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Directus      │    │   PostgreSQL    │
│   Port: 9002    │◄──►│   Port: 8055    │◄──►│   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Desarrollo

### Directus Cliente

```typescript
import { directus } from '@/lib/directus';
import { queryDirectus } from '@/lib/directus-utils';

// Consulta básica
const projects = await queryDirectus('projects');

// Consulta con opciones
const featuredProjects = await queryDirectus('projects', {
  filter: { featured: { _eq: true } },
  limit: 6,
  sort: ['-date_created']
});
```

### Optimización de Imágenes

```typescript
import { getOptimizedImageUrl } from '@/lib/directus';

// Imagen optimizada
const optimizedUrl = getOptimizedImageUrl(imageId, {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp'
});
```

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── directus.ts           # Cliente Directus
│   └── directus-utils.ts     # Utilidades y helpers
├── types/
│   └── directus.ts           # Tipos TypeScript
└── ...

docker-compose.yml            # Configuración Docker
.env.local                   # Variables de entorno
scripts/
└── directus-setup.sh        # Script de administración
```

## 🚨 Solución de Problemas

### Directus no inicia
```bash
# Ver logs
npm run directus:logs

# Verificar puertos
lsof -i :8055
lsof -i :5432

# Reiniciar completamente
npm run directus:reset
```

### Error de conexión desde Next.js
1. Verificar que `NEXT_PUBLIC_DIRECTUS_URL` esté configurado
2. Verificar que el token estático sea válido
3. Verificar CORS en Directus (debería estar configurado automáticamente)

### Base de datos corrupta
```bash
# Backup antes de reset
docker-compose exec postgres pg_dump -U directus metrica_directus > backup.sql

# Reset completo
npm run directus:reset

# Restaurar backup si es necesario
docker-compose exec -T postgres psql -U directus metrica_directus < backup.sql
```

## 📝 Próximos Pasos

Una vez que Directus esté funcionando:

1. ✅ **Fase 1 Completada**: Setup básico
2. 🔄 **Fase 2**: Crear collections de Portfolio
3. 🔄 **Fase 3**: Crear collections de Blog
4. 🔄 **Fase 4**: Crear collections de Careers

## 🔗 Enlaces Útiles

- **Admin Panel**: http://localhost:8055
- **API Documentation**: http://localhost:8055/docs
- **GraphQL Playground**: http://localhost:8055/graphql
- **Directus Docs**: https://docs.directus.io

## 💡 Tips de Desarrollo

1. **Usa el modo debug**: `DIRECTUS_DEBUG=true` para ver queries
2. **GraphQL Introspection**: Disponible en desarrollo para autocompletado
3. **Hot Reloading**: Los cambios en Directus se reflejan inmediatamente
4. **Backup regular**: Especialmente antes de cambios importantes en el schema

¿Necesitas ayuda? Revisa los logs con `npm run directus:logs` 🔍