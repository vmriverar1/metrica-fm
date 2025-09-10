#!/bin/bash

echo "📦 Dividiendo build en partes más pequeñas..."

# Crear directorio para partes
mkdir -p build-parts

# Dividir el directorio .next en partes
echo "Creando parte 1: Core files..."
tar -czf build-parts/part1-core.tar.gz \
  .next/BUILD_ID \
  .next/build-manifest.json \
  .next/app-build-manifest.json \
  .next/fallback-build-manifest.json \
  .next/images-manifest.json \
  .next/prerender-manifest.json \
  .next/routes-manifest.json \
  .next/server/pages* \
  .next/server/app-paths* \
  .next/server/server* \
  .next/server/middleware* \
  .next/server/functions* \
  2>/dev/null

echo "Creando parte 2: Static assets..."
tar -czf build-parts/part2-static.tar.gz \
  .next/static \
  --exclude="*.js" \
  2>/dev/null

echo "Creando parte 3: JavaScript chunks (pequeños)..."
find .next/static -name "*.js" -size -100k | tar -czf build-parts/part3-js-small.tar.gz -T - 2>/dev/null

echo "Creando parte 4: JavaScript chunks (medianos)..."
find .next/static -name "*.js" -size +100k -size -300k | tar -czf build-parts/part4-js-medium.tar.gz -T - 2>/dev/null

echo "Creando parte 5: Server components..."
tar -czf build-parts/part5-server.tar.gz \
  .next/server/app \
  --exclude="*.map" \
  2>/dev/null

echo "✅ Build dividido en partes más pequeñas"
echo ""
echo "Archivos generados:"
ls -lh build-parts/

echo ""
echo "📋 Para reconstruir en el servidor:"
echo "1. Sube todos los archivos part*.tar.gz"
echo "2. Extrae cada uno: for f in part*.tar.gz; do tar -xzf \$f; done"
echo "3. El directorio .next estará completo"