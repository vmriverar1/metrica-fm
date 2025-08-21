# 🚀 Deployment Guide - Hosting Compartido

## 📋 Proceso Automatizado

Este proyecto está configurado para generar builds automáticamente usando **GitHub Actions**, eliminando la necesidad de hacer builds locales grandes.

## 🔄 Cómo Funciona

### 1. **Push tu código**
```bash
git add .
git commit -m "Tu mensaje"
git push origin main
```

### 2. **GitHub Actions se ejecuta automáticamente**
- Instala dependencias limpias
- Genera build de producción
- Crea package listo para hosting compartido
- Sube el archivo como "artifact"

### 3. **Descargar build listo**
1. Ve a tu repositorio en GitHub
2. Click en **"Actions"**
3. Click en el workflow más reciente (verde ✅)
4. En **"Artifacts"** descarga `shared-hosting-build`
5. Extrae el archivo `.tar.gz`

### 4. **Subir a tu hosting**
- Sube el contenido extraído a tu carpeta `public_html`
- ¡Listo! Tu sitio estará actualizado

## 🎛️ Configuración Opcional: Deploy Automático

Si quieres que GitHub suba automáticamente a tu hosting, configura estos **Secrets** en tu repositorio:

**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

```
FTP_HOST: tu-servidor.com
FTP_USERNAME: tu-usuario-ftp
FTP_PASSWORD: tu-password-ftp
FTP_SERVER_DIR: /public_html/
SITE_URL: https://tu-dominio.com
```

Con estos secrets configurados, cada push a `main` subirá automáticamente a tu servidor.

## 📁 Estructura del Package Generado

```
shared-hosting-build/
├── _next/static/          # Assets estáticos
├── server/               # Archivos del servidor
├── public/              # Archivos públicos
├── package.json         # Configuración
└── next.config.*        # Configuración Next.js
```

## ⚡ Ventajas

✅ **Sin builds locales** - Tu repositorio permanece limpio
✅ **Builds consistentes** - Mismo ambiente siempre
✅ **Deploy automático** - Opcional, configura una vez
✅ **Rollback fácil** - Cada build se guarda 30 días
✅ **Sin problemas de cache** - GitHub maneja todo

## 🆘 Troubleshooting

**Build falló:** Revisa los logs en Actions tab
**Deploy falló:** Verifica tus secrets FTP
**Sitio no funciona:** Asegúrate que los archivos estén en `public_html`

## 🔧 Comandos Útiles

```bash
# Ejecutar workflow manualmente (sin hacer push)
# Ve a Actions → Build for Shared Hosting → Run workflow

# Limpiar cache local si necesitas
rm -rf .next node_modules/.cache

# Ver status del repositorio
git status
```

---

💡 **Tip:** Ya no necesitas hacer `npm run build` localmente. Solo push tu código y GitHub se encarga del resto!