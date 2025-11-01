/**
 * Script para sincronizar logos de clientes en Firestore
 * Ejecutar con: node src/scripts/sync-clientes-logos.js
 */

const fs = require('fs');
const path = require('path');

// Logos actuales en Firestore
const existingLogos = [
  '/images/logos/Aleph-school.png',
  '/images/logos/bcp-4.svg',
  '/images/logos/delosi.png',
  '/images/logos/Innova_Schools.svg',
  '/images/logos/intcomex-55.jpg',
  '/images/logos/LLP_Logo.jpg',
  '/images/logos/logo-maquinarias.png',
  '/images/logos/logotipo-menorca.png',
  '/images/logos/Logo_Tottus.png',
  '/images/logos/logo-tyc.png',
  '/images/logos/logo-upn-nuevo.svg',
  '/images/logos/Mall_Aventura_Plaza_2012.svg',
  '/images/logos/marca_inma.webp',
  '/images/logos/Oxxo_Logo.svg.png',
  '/images/logos/png-transparent-sodimac-homecenter-hd-logo-thumbnail.png',
  '/images/logos/Real_Plaza_2019.webp',
  '/images/logos/RIMAC.svg',
  '/images/logos/tai-loy-logo-png_seeklogo-257817.png',
  '/images/logos/tienda-mass-37713.png',
  '/images/logos/Unimarc_logo.svg'
];

// Todos los archivos disponibles en public/images/logos
const allLogosFiles = [
  'Aleph-school.webp',
  'Arquimia-Logo.webp',
  'bcp-4.svg',
  'delosi.png',
  'delosi.webp',
  'Innova_Schools.svg',
  'intcomex-55.jpg',
  'intcomex-55.webp',
  'intursa.webp',
  'latam-airlines-37296.webp',
  'LLP_Logo.webp',
  'logo-credicorp.webp',
  'logo-maquinarias.webp',
  'Logo_Parque_Arauco.svg.webp',
  'logotipo-menorca.webp',
  'Logo_Tottus.webp',
  'logo-tyc.webp',
  'logo-upn-nuevo.svg',
  'Maestro_2013.webp',
  'Mall_Aventura_Plaza_2012.svg',
  'marca_inma.webp',
  'Oxxo_Logo.svg.webp',
  'png-transparent-sodimac-homecenter-hd-logo-thumbnail.webp',
  'Real_Plaza_2019.webp',
  'RIMAC.svg',
  'saga-falabella-62.webp',
  'tai-loy-logo-png_seeklogo-257817.webp',
  'tienda-mass-37713.webp',
  'Unimarc_logo.svg',
  'Usil.webp',
  'armando-paredes-2x.webp',
  'logo-bianco-grande.webp'
];

// Mapeo manual de archivos a nombres de clientes
const logoMapping = {
  'Arquimia-Logo.webp': { name: 'Arquimia', id: 'arquimia' },
  'intursa.webp': { name: 'Intursa', id: 'intursa' },
  'latam-airlines-37296.webp': { name: 'LATAM Airlines', id: 'latam' },
  'logo-credicorp.webp': { name: 'Credicorp', id: 'credicorp' },
  'Logo_Parque_Arauco.svg.webp': { name: 'Parque Arauco', id: 'parque-arauco' },
  'Maestro_2013.webp': { name: 'Maestro', id: 'maestro' },
  'saga-falabella-62.webp': { name: 'Saga Falabella', id: 'saga-falabella' },
  'Usil.webp': { name: 'USIL', id: 'usil' },
  'armando-paredes-2x.webp': { name: 'Armando Paredes', id: 'armando-paredes' },
  'logo-bianco-grande.webp': { name: 'Bianco', id: 'bianco' }
};

// Extraer nombres de archivos ya usados
const existingFiles = existingLogos.map(path => {
  const parts = path.split('/');
  return parts[parts.length - 1];
});

console.log('📋 Logos existentes en Firestore:', existingFiles.length);
console.log('📁 Archivos disponibles en public/images/logos:', allLogosFiles.length);

// Encontrar logos que no están en Firestore
const newLogos = [];

allLogosFiles.forEach(file => {
  // Buscar si el archivo ya está usado (con cualquier extensión)
  const baseName = file.replace(/\.(png|jpg|svg|webp)$/, '');
  const isAlreadyUsed = existingFiles.some(existing => {
    const existingBase = existing.replace(/\.(png|jpg|svg|webp)$/, '');
    return existingBase === baseName;
  });

  if (!isAlreadyUsed && logoMapping[file]) {
    const info = logoMapping[file];
    newLogos.push({
      id: info.id,
      name: info.name,
      alt: `${info.name} logo`,
      image: `/images/logos/${file}`
    });
  }
});

console.log('\n✨ Nuevos logos encontrados:', newLogos.length);
newLogos.forEach(logo => {
  console.log(`  - ${logo.name} (${logo.image})`);
});

// Generar payload para el API
const payload = {
  newLogos: newLogos
};

console.log('\n📤 Payload para POST /api/admin/temp/clientes-logos:');
console.log(JSON.stringify(payload, null, 2));

// Función para ejecutar la actualización
async function updateLogos() {
  try {
    const response = await fetch('http://localhost:9002/api/admin/temp/clientes-logos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('\n✅ Logos actualizados exitosamente!');
      console.log(`   - Agregados: ${result.data.added}`);
      console.log(`   - Duplicados omitidos: ${result.data.skipped}`);
      console.log(`   - Total en Firestore: ${result.data.total}`);
    } else {
      console.error('\n❌ Error al actualizar logos:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Error ejecutando actualización:', error.message);
  }
}

// Si se ejecuta directamente, ejecutar la actualización
if (require.main === module) {
  console.log('\n🚀 Ejecutando actualización...\n');
  updateLogos();
}

module.exports = { newLogos, updateLogos };