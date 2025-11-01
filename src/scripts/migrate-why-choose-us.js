/**
 * Script temporal para migrar datos de "Why Choose Us" a Firestore
 * Ejecutar con: node src/scripts/migrate-why-choose-us.js
 */

const defaultWhyChooseUsData = {
  title: '¿Por qué Métrica FM?',
  benefits: [
    {
      id: 'experiencia',
      text: '10+ años de experiencia',
      icon: 'CheckCircle2'
    },
    {
      id: 'certificacion',
      text: 'ISO 9001 Certificado',
      icon: 'CheckCircle2'
    },
    {
      id: 'proyectos',
      text: '300+ proyectos exitosos',
      icon: 'CheckCircle2'
    },
    {
      id: 'satisfaccion',
      text: '99% satisfacción del cliente',
      icon: 'CheckCircle2'
    },
    {
      id: 'respuesta',
      text: 'Respuesta en 48 horas',
      icon: 'CheckCircle2'
    }
  ]
};

async function migrateWhyChooseUs() {
  try {
    console.log('🚀 Iniciando migración de "Why Choose Us" a Firestore...');

    const response = await fetch('http://localhost:9002/api/admin/pages/services/why-choose-us', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultWhyChooseUsData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Migración exitosa!');
      console.log('📊 Datos migrados:', defaultWhyChooseUsData);
    } else {
      console.error('❌ Error en la migración:', result.error);
    }
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateWhyChooseUs();
}

module.exports = { migrateWhyChooseUs, defaultWhyChooseUsData };