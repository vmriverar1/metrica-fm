/**
 * Script para incluir TODOS los logos encontrados en public/images/logos
 * Ejecutar con: node src/scripts/reset-all-logos.js
 */

const fs = require('fs');
const path = require('path');

// Función para generar ID desde nombre de archivo
function generateId(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Función para generar nombre legible desde nombre de archivo
function generateName(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '');

  // Casos especiales conocidos
  const knownNames = {
    'Aleph-school': 'Aleph School',
    'armando-paredes-2x': 'Armando Paredes',
    'Arquimia-Logo': 'Arquimia',
    'bcp-4': 'BCP',
    'logo-bianco-grande': 'Bianco',
    'logo-credicorp': 'Credicorp',
    'delosi': 'Delosi',
    'Innova_Schools': 'Innova Schools',
    'intcomex-55': 'Intcomex',
    'intursa': 'Intursa',
    'latam-airlines-37296': 'LATAM Airlines',
    'LLP_Logo': 'LLP',
    'logo-maquinarias': 'Maquinarias U&M',
    'Logo_Parque_Arauco.svg': 'Parque Arauco',
    'logotipo-menorca': 'Menorca',
    'Logo_Tottus': 'Tottus',
    'logo-tyc': 'TYC',
    'logo-upn-nuevo': 'UPN',
    'Maestro_2013': 'Maestro',
    'Mall_Aventura_Plaza_2012': 'Mall Aventura Plaza',
    'marca_inma': 'INMA',
    'Oxxo_Logo.svg': 'OXXO',
    'png-transparent-sodimac-homecenter-hd-logo-thumbnail': 'Sodimac',
    'Real_Plaza_2019': 'Real Plaza',
    'RIMAC': 'RIMAC',
    'saga-falabella-62': 'Saga Falabella',
    'tai-loy-logo-png_seeklogo-257817': 'Tai Loy',
    'tienda-mass-37713': 'Mass',
    'Unimarc_logo': 'Unimarc',
    'Usil': 'USIL',
    'Frame-3': 'Cliente',
    'simtrica___renta_inmobiliaria_logo': 'Simétrica Renta Inmobiliaria',
    'sunchemical-logo-png_seeklogo-133565': 'Sun Chemical',
    'logo-297-20241106140401': 'Cliente',
    'logo-306-20240527102650': 'Cliente'
  };

  if (knownNames[base]) {
    return knownNames[base];
  }

  // Generar nombre desde el archivo
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

// Leer todos los archivos de logos
const logosDir = path.join('/home/freelos/metrica/public/images/logos');
const files = fs.readdirSync(logosDir)
  .filter(file => /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(file))
  .sort();

console.log(`📁 Encontrados ${files.length} archivos de logos\n`);

// Generar lista completa de logos
const allLogos = files.map(filename => {
  const id = generateId(filename);
  const name = generateName(filename);

  return {
    id: id,
    name: name,
    alt: `${name} logo`,
    image: `/images/logos/${filename}` // Sin dominio
  };
});

// Agrupar por ID para detectar duplicados
const byId = {};
allLogos.forEach(logo => {
  if (!byId[logo.id]) {
    byId[logo.id] = [];
  }
  byId[logo.id].push(logo);
});

// Resolver duplicados (preferir webp, luego svg, luego png, luego jpg)
const extensionPriority = { 'webp': 1, 'svg': 2, 'png': 3, 'jpg': 4, 'jpeg': 5, 'gif': 6 };

const uniqueLogos = Object.entries(byId).map(([id, logos]) => {
  if (logos.length === 1) {
    return logos[0];
  }

  // Preferir por extensión
  logos.sort((a, b) => {
    const extA = a.image.split('.').pop().toLowerCase();
    const extB = b.image.split('.').pop().toLowerCase();
    return (extensionPriority[extA] || 99) - (extensionPriority[extB] || 99);
  });

  return logos[0];
});

// Ordenar alfabéticamente
uniqueLogos.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

console.log(`✨ Logos únicos después de resolver duplicados: ${uniqueLogos.length}\n`);

// Mostrar lista
console.log('🗂️  Lista de logos:');
uniqueLogos.forEach((logo, index) => {
  const ext = logo.image.split('.').pop().toUpperCase().padEnd(5);
  console.log(`  ${String(index + 1).padStart(2)}. [${ext}] ${logo.name.padEnd(30)} - ${logo.id}`);
});

// Verificar que ninguna ruta tenga dominio
const hasInvalidUrls = uniqueLogos.some(logo => {
  return logo.image.includes('http://') ||
         logo.image.includes('https://') ||
         logo.image.includes('metricadip.com');
});

if (hasInvalidUrls) {
  console.error('\n❌ ERROR: Se encontraron URLs con dominio!');
  process.exit(1);
}

console.log('\n✅ Todas las rutas son relativas (sin dominio)');

// Payload para actualizar Firestore
const payload = {
  logos: uniqueLogos
};

console.log('\n📊 Estadísticas:');
console.log(`   - Archivos encontrados: ${files.length}`);
console.log(`   - Logos únicos: ${uniqueLogos.length}`);
console.log(`   - Duplicados resueltos: ${files.length - uniqueLogos.length}`);
console.log(`   - Formato: Rutas relativas sin dominio`);

// Función para ejecutar la actualización
async function resetAllLogos() {
  try {
    console.log('\n🚀 Enviando actualización a Firestore...');

    const response = await fetch('http://localhost:9002/api/admin/temp/clientes-logos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('\n✅ Todos los logos actualizados exitosamente!');
      console.log(`   - Total en Firestore: ${result.data.count}`);
    } else {
      console.error('\n❌ Error al actualizar:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  console.log('\n⚠️  Esta operación reemplazará TODOS los logos en Firestore');
  console.log(`   con los ${uniqueLogos.length} logos encontrados en public/images/logos\n`);

  resetAllLogos();
}

module.exports = { uniqueLogos, generateId, generateName, resetAllLogos };