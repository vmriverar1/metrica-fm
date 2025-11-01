/**
 * Script para resetear y regenerar logos de clientes desde archivos
 * Ejecutar con: node src/scripts/reset-clientes-logos.js
 */

// Mapeo completo de archivos a información de clientes
const logoMapping = {
  'Aleph-school.webp': { name: 'Aleph School', id: 'aleph' },
  'armando-paredes-2x.webp': { name: 'Armando Paredes', id: 'armando-paredes' },
  'Arquimia-Logo.webp': { name: 'Arquimia', id: 'arquimia' },
  'bcp-4.svg': { name: 'BCP', id: 'bcp' },
  'delosi.webp': { name: 'Delosi', id: 'delosi' },
  'Innova_Schools.svg': { name: 'Innova Schools', id: 'innova' },
  'intcomex-55.webp': { name: 'Intcomex', id: 'intcomex' },
  'intursa.webp': { name: 'Intursa', id: 'intursa' },
  'latam-airlines-37296.webp': { name: 'LATAM Airlines', id: 'latam' },
  'LLP_Logo.webp': { name: 'LLP', id: 'llp' },
  'logo-bianco-grande.webp': { name: 'Bianco', id: 'bianco' },
  'logo-credicorp.webp': { name: 'Credicorp', id: 'credicorp' },
  'logo-maquinarias.webp': { name: 'Maquinarias U&M', id: 'maquinarias' },
  'Logo_Parque_Arauco.svg.webp': { name: 'Parque Arauco', id: 'parque-arauco' },
  'logotipo-menorca.webp': { name: 'Menorca', id: 'menorca' },
  'Logo_Tottus.webp': { name: 'Tottus', id: 'tottus' },
  'logo-tyc.webp': { name: 'TYC', id: 'tyc' },
  'logo-upn-nuevo.svg': { name: 'UPN', id: 'upn' },
  'Maestro_2013.webp': { name: 'Maestro', id: 'maestro' },
  'Mall_Aventura_Plaza_2012.svg': { name: 'Mall Aventura Plaza', id: 'aventura-plaza' },
  'marca_inma.webp': { name: 'INMA', id: 'inma' },
  'Oxxo_Logo.svg.webp': { name: 'OXXO', id: 'oxxo' },
  'png-transparent-sodimac-homecenter-hd-logo-thumbnail.webp': { name: 'Sodimac', id: 'sodimac' },
  'Real_Plaza_2019.webp': { name: 'Real Plaza', id: 'real-plaza' },
  'RIMAC.svg': { name: 'RIMAC', id: 'rimac' },
  'saga-falabella-62.webp': { name: 'Saga Falabella', id: 'saga-falabella' },
  'tai-loy-logo-png_seeklogo-257817.webp': { name: 'Tai Loy', id: 'tai-loy' },
  'tienda-mass-37713.webp': { name: 'Mass', id: 'mass' },
  'Unimarc_logo.svg': { name: 'Unimarc', id: 'unimarc' },
  'Usil.webp': { name: 'USIL', id: 'usil' }
};

// Generar lista de logos desde el mapeo
const allLogos = Object.entries(logoMapping).map(([filename, info]) => ({
  id: info.id,
  name: info.name,
  alt: `${info.name} logo`,
  image: `/images/logos/${filename}` // Sin dominio, solo ruta relativa
}));

// Ordenar por nombre
allLogos.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

console.log('📋 Logos generados desde archivos:', allLogos.length);
console.log('\n🗂️  Lista de logos:');
allLogos.forEach((logo, index) => {
  console.log(`  ${index + 1}. ${logo.name.padEnd(25)} - ${logo.image}`);
});

// Verificar que ninguna ruta tenga dominio
const hasInvalidUrls = allLogos.some(logo => {
  return logo.image.includes('http://') ||
         logo.image.includes('https://') ||
         logo.image.includes('metricadip.com');
});

if (hasInvalidUrls) {
  console.error('\n❌ ERROR: Se encontraron URLs con dominio. Todas las rutas deben ser relativas.');
  process.exit(1);
}

console.log('\n✅ Todas las rutas son relativas (sin dominio)');

// Payload para actualizar Firestore
const payload = {
  logos: allLogos
};

console.log('\n📊 Estadísticas:');
console.log(`   - Total de logos: ${allLogos.length}`);
console.log(`   - Formato: Rutas relativas sin dominio`);
console.log(`   - Ordenamiento: Alfabético por nombre`);

// Función para ejecutar la actualización
async function resetLogos() {
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
      console.log('\n✅ Logos reseteados y actualizados exitosamente!');
      console.log(`   - Total de logos en Firestore: ${result.data.count}`);
      console.log('   - Todos los logos anteriores fueron reemplazados');
      console.log('   - Nuevos logos generados desde archivos disponibles');
    } else {
      console.error('\n❌ Error al actualizar logos:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Error ejecutando actualización:', error.message);
  }
}

// Si se ejecuta directamente, ejecutar la actualización
if (require.main === module) {
  console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará todos los logos actuales');
  console.log('   y los reemplazará con los encontrados en public/images/logos\n');

  resetLogos();
}

module.exports = { allLogos, logoMapping, resetLogos };