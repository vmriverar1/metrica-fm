#!/bin/bash

echo "🚀 Iniciando servidor en modo desarrollo permanente..."
echo "⚠️  Configuración para servidor con recursos limitados"
echo ""

# Forzar modo desarrollo
export NODE_ENV=development

# Limitar recursos
export NODE_OPTIONS="--max_old_space_size=512"
export UV_THREADPOOL_SIZE=1

# Desactivar telemetría
export NEXT_TELEMETRY_DISABLED=1

# Iniciar servidor
echo "Iniciando en http://localhost:3000"
node server.js