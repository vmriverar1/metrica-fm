#!/usr/bin/env node

/**
 * Script de Prueba de Configuración reCAPTCHA v3
 *
 * Verifica:
 * - Que las credenciales estén cargadas correctamente
 * - Que la Site Key y Secret Key estén presentes
 * - Formato básico de las claves
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["'](.*)["']$/, '$1');
      process.env[key] = value;
    }
  });
  console.log('✅ Environment variables loaded from .env.local\n');
} else {
  console.warn('⚠️  .env.local file not found. Using process.env variables.\n');
}

console.log('🔐 reCAPTCHA v3 Configuration Test\n');
console.log('═'.repeat(60) + '\n');

// Test 1: Verificar que las variables existen
function testEnvironmentVariables() {
  console.log('📋 Testing environment variables...\n');

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  let passed = true;

  // Check Site Key (pública)
  if (!siteKey) {
    console.error('   ❌ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set');
    passed = false;
  } else {
    console.log('   ✅ NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', siteKey.substring(0, 20) + '...');

    // Validar formato (debe empezar con 6L y tener longitud apropiada)
    if (!siteKey.startsWith('6L') || siteKey.length < 40) {
      console.warn('   ⚠️  Site Key format seems incorrect');
      passed = false;
    } else {
      console.log('   ✅ Site Key format looks valid');
    }
  }

  // Check Secret Key (privada)
  if (!secretKey) {
    console.error('   ❌ RECAPTCHA_SECRET_KEY is not set');
    passed = false;
  } else {
    console.log('   ✅ RECAPTCHA_SECRET_KEY:', secretKey.substring(0, 20) + '...');

    // Validar formato (debe empezar con 6L y tener longitud apropiada)
    if (!secretKey.startsWith('6L') || secretKey.length < 40) {
      console.warn('   ⚠️  Secret Key format seems incorrect');
      passed = false;
    } else {
      console.log('   ✅ Secret Key format looks valid');
    }
  }

  console.log('');
  return passed;
}

// Test 2: Verificar configuración en archivo TypeScript
function testConfigFile() {
  console.log('📄 Testing recaptcha-config.ts...\n');

  const configPath = path.join(__dirname, 'src', 'lib', 'recaptcha-config.ts');

  if (!fs.existsSync(configPath)) {
    console.error('   ❌ recaptcha-config.ts not found');
    return false;
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');

  // Verificar que el archivo use variables de entorno
  const usesEnvVars = configContent.includes('process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY') &&
                      configContent.includes('process.env.RECAPTCHA_SECRET_KEY');

  if (usesEnvVars) {
    console.log('   ✅ Config file uses environment variables');
  } else {
    console.warn('   ⚠️  Config file might not be using environment variables correctly');
  }

  // Verificar que tenga las nuevas claves como fallback
  const hasSiteKey = configContent.includes('6Lc13_0rAAAAAGtNImO3exEbFVFpJfnopbGM-sp3');
  const hasSecretKey = configContent.includes('6Lc13_0rAAAAAPDUaL3hu4pOfscis5btWkyDbQLd');

  if (hasSiteKey && hasSecretKey) {
    console.log('   ✅ Fallback keys are correctly updated');
  } else {
    console.warn('   ⚠️  Fallback keys might not be updated');
    console.warn('      Site Key updated:', hasSiteKey);
    console.warn('      Secret Key updated:', hasSecretKey);
  }

  console.log('');
  return usesEnvVars && hasSiteKey && hasSecretKey;
}

// Test 3: Información adicional
function displayInfo() {
  console.log('ℹ️  Additional Information:\n');

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  console.log('   Site Key (Public):', siteKey || 'NOT SET');
  console.log('   Secret Key (Private):', secretKey ? secretKey.substring(0, 15) + '...[HIDDEN]' : 'NOT SET');
  console.log('');
  console.log('   ⚠️  Note: To fully test reCAPTCHA, you need to:');
  console.log('      1. Use the Site Key in your frontend forms');
  console.log('      2. Submit a form and get a token');
  console.log('      3. Validate the token with the Secret Key on backend');
  console.log('');
}

// Run all tests
(async () => {
  const results = {
    envVars: testEnvironmentVariables(),
    configFile: testConfigFile()
  };

  displayInfo();

  console.log('═'.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  console.log('   Environment Variables:', results.envVars ? '✅ PASS' : '❌ FAIL');
  console.log('   Config File:          ', results.configFile ? '✅ PASS' : '❌ FAIL');

  const allPassed = results.envVars && results.configFile;

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! reCAPTCHA configuration looks good.\n');
    console.log('   Next steps:');
    console.log('   1. Test reCAPTCHA in a real form submission');
    console.log('   2. Verify token validation on backend');
    console.log('   3. Check reCAPTCHA admin console for analytics\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the errors above.\n');
    process.exit(1);
  }
})();
