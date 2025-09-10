#!/bin/bash

echo "🚀 Preparando deployment para servidor con antivirus estricto..."

# 1. Hacer build limpio
echo "1. Generando build..."
rm -rf .next
npm run build

# 2. Limpiar el build
echo "2. Limpiando build..."
./clean-build.sh

# 3. Crear estructura mínima para deployment
echo "3. Creando estructura de deployment..."
mkdir -p deployment
cp -r .next deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp server.js deployment/ 2>/dev/null || echo "No server.js found"

# 4. Crear archivo de inicio simple
cat > deployment/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export NODE_OPTIONS="--max_old_space_size=512"
npm install --production
npm start
EOF

chmod +x deployment/start.sh

# 5. Comprimir sin archivos problemáticos
echo "4. Comprimiendo para deployment..."
cd deployment

# Excluir archivos que pueden causar problemas
tar -czf ../deployment.tar.gz \
  --exclude="*.map" \
  --exclude="*.trace" \
  --exclude="node_modules" \
  --exclude=".next/cache" \
  --exclude=".next/trace" \
  .

cd ..

echo "✅ Deployment preparado: deployment.tar.gz"
echo ""
echo "📋 Instrucciones para el servidor:"
echo "1. Sube deployment.tar.gz a tu servidor"
echo "2. Extrae: tar -xzf deployment.tar.gz"
echo "3. Instala dependencias: npm install --production"
echo "4. Inicia: ./start.sh o npm start"
echo ""
echo "Tamaño final:"
ls -lh deployment.tar.gz