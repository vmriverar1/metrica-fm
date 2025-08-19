#!/bin/bash

DIRECTUS_URL="http://localhost:8055"
ADMIN_EMAIL="admin@metrica-dip.com"
ADMIN_PASSWORD="MetricaDIP2024!"

echo "🔑 Autenticando con Directus..."

# Obtener token de autenticación
TOKEN_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error en autenticación"
  echo $TOKEN_RESPONSE
  exit 1
fi

echo "✅ Autenticado exitosamente"

# Obtener información del usuario y rol
echo "📋 Obteniendo información del usuario..."
USER_INFO=$(curl -s -X GET "${DIRECTUS_URL}/users/me" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Usuario info: $USER_INFO"

# Intentar acceso directo a las colecciones
echo "🧪 Probando acceso a blog_authors..."
BLOG_AUTHORS_TEST=$(curl -s -X GET "${DIRECTUS_URL}/items/blog_authors?limit=1" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Blog authors test: $BLOG_AUTHORS_TEST"

echo "🧪 Probando acceso a blog_posts..."
BLOG_POSTS_TEST=$(curl -s -X GET "${DIRECTUS_URL}/items/blog_posts?limit=1" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Blog posts test: $BLOG_POSTS_TEST"

# Verificar las colecciones existentes
echo "📋 Verificando colecciones..."
COLLECTIONS=$(curl -s -X GET "${DIRECTUS_URL}/collections" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Collections response: $COLLECTIONS"

echo ""
echo "🎯 Información de diagnóstico completa"
echo "Si ves errores de permisos arriba, las colecciones existen pero necesitan permisos"
echo "Si no ves errores, el problema podría ser de la interfaz"