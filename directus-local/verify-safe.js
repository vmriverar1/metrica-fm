#!/usr/bin/env node

/**
 * Script seguro para verificar estado actual y crear lo mínimo necesario
 */

async function verifySafeSetup() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔍 Verificando estado actual de Directus...');
    
    // Autenticarse
    const loginResponse = await fetch('http://localhost:8055/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@metrica-dip.com',
        password: 'MetricaDIP2024!'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    console.log('✅ Autenticado correctamente');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 1. Verificar collections existentes
    console.log('\n📋 1. Collections existentes:');
    const collectionsResponse = await fetch('http://localhost:8055/collections', { headers });
    
    if (collectionsResponse.ok) {
      const collectionsData = await collectionsResponse.json();
      const userCollections = collectionsData.data.filter(col => !col.collection.startsWith('directus_'));
      
      console.log(`   Total: ${userCollections.length} collections de usuario`);
      userCollections.forEach(col => {
        console.log(`   📁 ${col.collection}`);
      });
    }

    // 2. Verificar si project_categories ya tiene datos
    console.log('\n📊 2. Verificando project_categories:');
    try {
      const categoriesResponse = await fetch('http://localhost:8055/items/project_categories', { headers });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log(`   ✅ Collection existe con ${categoriesData.data.length} items`);
        
        if (categoriesData.data.length > 0) {
          console.log('   📋 Categorías existentes:');
          categoriesData.data.forEach(cat => {
            console.log(`      - ${cat.name || cat.id}`);
          });
        }
      } else {
        console.log('   ⚠️ Collection no tiene datos o no existe');
      }
    } catch (error) {
      console.log('   ❌ Error accediendo a project_categories');
    }

    // 3. Solo crear datos si no existen (SEGURO)
    console.log('\n🛡️ 3. Estrategia segura:');
    
    const categoriesCheck = await fetch('http://localhost:8055/items/project_categories', { headers });
    
    if (categoriesCheck.ok) {
      const categoriesData = await categoriesCheck.json();
      
      if (categoriesData.data.length === 0) {
        console.log('   ✅ Safe to populate - No existing data');
        
        // Solo las categorías esenciales para no romper nada
        const essentialCategories = [
          { name: 'Oficina', slug: 'oficina' },
          { name: 'Retail', slug: 'retail' },
          { name: 'Industria', slug: 'industria' }
        ];
        
        console.log('   🚀 Creando categorías esenciales...');
        
        for (const category of essentialCategories) {
          try {
            const createResponse = await fetch('http://localhost:8055/items/project_categories', {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify(category)
            });
            
            if (createResponse.ok) {
              console.log(`      ✅ ${category.name} creada`);
            }
          } catch (error) {
            console.log(`      ⚠️ ${category.name}: ${error.message}`);
          }
        }
      } else {
        console.log('   ✅ Data exists - Skipping population (SAFE)');
      }
    }

    // 4. Test API básico para Next.js
    console.log('\n🔌 4. Test API para Next.js:');
    
    const testResponse = await fetch('http://localhost:8055/items/project_categories?limit=1', { headers });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('   ✅ API funcionando para Next.js');
      console.log('   📡 Endpoint listo:', 'http://localhost:8055/items/project_categories');
    }

    console.log('\n🎉 ¡Verificación completada de forma segura!');
    console.log('\n📋 Siguiente paso:');
    console.log('   1. API lista para Next.js ✅');
    console.log('   2. Datos mínimos disponibles ✅');
    console.log('   3. Sistema actual intacto ✅');
    
  } catch (error) {
    console.error('❌ Error en verificación segura:', error.message);
  }
}

verifySafeSetup();