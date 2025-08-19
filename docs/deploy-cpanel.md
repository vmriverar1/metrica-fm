# 🚀 Guía de Deploy en cPanel

## Prerrequisitos en tu cPanel

### Verificar soporte Node.js:
1. ✅ **Node.js App** disponible en cPanel
2. ✅ **MySQL Database** acceso completo  
3. ✅ **File Manager** o acceso FTP/SSH
4. ✅ **Subdomain/Domain** para Directus

## Paso 1: Preparar Base de Datos MySQL

### En cPanel → MySQL Databases:
```sql
-- Crear base de datos
CREATE DATABASE tuusuario_metrica_directus;

-- Crear usuario
CREATE USER 'tuusuario_directus'@'localhost' IDENTIFIED BY 'password_seguro';

-- Dar permisos
GRANT ALL PRIVILEGES ON tuusuario_metrica_directus.* TO 'tuusuario_directus'@'localhost';
FLUSH PRIVILEGES;
```

## Paso 2: Subir Directus a cPanel

### Estructura de archivos en cPanel:
```
public_html/
├── directus/              # Carpeta para Directus
│   ├── package.json
│   ├── .env               # Usar .env.cpanel
│   ├── node_modules/      # Se instala en servidor
│   ├── uploads/           # Archivos subidos
│   └── extensions/        # Extensiones
└── (tu app Next.js aquí)
```

### Comandos en cPanel Terminal:
```bash
# 1. Ir al directorio
cd public_html/directus

# 2. Instalar dependencias
npm install

# 3. Inicializar DB (solo primera vez)
npm run init

# 4. Iniciar aplicación
npm start
```

## Paso 3: Configurar Node.js App en cPanel

### En cPanel → Node.js App:
- **App Root**: public_html/directus
- **Startup File**: node_modules/.bin/directus start
- **Node.js Version**: 18+ o la más reciente

## Paso 4: Configurar Variables de Entorno Next.js

### Actualizar `.env.local` del proyecto principal:
```env
# Cambiar de localhost a tu dominio
NEXT_PUBLIC_DIRECTUS_URL=https://tudominio.com/directus
NEXT_PUBLIC_DIRECTUS_ASSETS_URL=https://tudominio.com/directus/assets
DIRECTUS_STATIC_TOKEN=generar_desde_admin_panel
```

## Paso 5: Verificación

### URLs finales:
- **Directus Admin**: https://tudominio.com/directus
- **API REST**: https://tudominio.com/directus/items/
- **GraphQL**: https://tudominio.com/directus/graphql

### Test de conexión:
```bash
curl https://tudominio.com/directus/server/health
# Debería retornar: {"status":"ok"}
```

## Troubleshooting Común

### Error 1: "Node.js not found"
- Verificar versión Node.js en cPanel
- Usar Node.js 18+ mínimo

### Error 2: "Database connection failed"
- Verificar credenciales MySQL
- Confirmar que base de datos existe
- Revisar permisos de usuario

### Error 3: "Port already in use"
- cPanel asigna puerto automáticamente
- No configurar PORT en .env para cPanel

### Error 4: "Permission denied uploads/"
- chmod 755 uploads/
- Verificar ownership de archivos

## Costos estimados:
- **Hosting cPanel con Node.js**: $5-15/mes
- **Directus**: $0 (open source)
- **Total**: $5-15/mes 🎉

## Ventajas de esta configuración:
- ✅ 100% bajo tu control
- ✅ Sin límites de Directus Cloud
- ✅ Datos en tu servidor
- ✅ Backups incluidos en hosting
- ✅ Escalable cuando crezcas