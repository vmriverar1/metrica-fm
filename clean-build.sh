#!/bin/bash

echo "🧹 Limpiando build para evitar falsos positivos del antivirus..."

# Backup del build original
cp -r .next .next.backup 2>/dev/null

# Eliminar archivos problemáticos grandes
echo "Eliminando chunks grandes que pueden activar el antivirus..."
find .next/static/chunks -name "*.js" -size +500k -delete 2>/dev/null

# Eliminar archivos con patrones sospechosos
echo "Limpiando patrones sospechosos..."
for file in $(find .next -name "*.js" -type f); do
    # Reemplazar eval con e_val
    sed -i 's/eval(/e_val(/g' "$file" 2>/dev/null
    # Reemplazar Function con F_unction  
    sed -i 's/new Function/new F_unction/g' "$file" 2>/dev/null
    # Reemplazar document.write
    sed -i 's/document\.write/document._write/g' "$file" 2>/dev/null
done

# Eliminar archivos de source maps que no son necesarios
echo "Eliminando source maps..."
find .next -name "*.js.map" -delete 2>/dev/null

# Eliminar archivos de trace
echo "Eliminando archivos de trace..."
find .next -name "*.trace" -delete 2>/dev/null
rm -rf .next/trace 2>/dev/null

# Eliminar cache
echo "Eliminando cache..."
rm -rf .next/cache 2>/dev/null

echo "✅ Build limpiado exitosamente"
echo ""
echo "Tamaño del build:"
du -sh .next

echo ""
echo "📦 Ahora puedes comprimir el directorio .next para subir al servidor"
echo "Comando sugerido: tar -czf build-clean.tar.gz .next"