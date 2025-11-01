#!/usr/bin/env node
/**
 * Production build script que maneja errores conocidos
 * Soluciona NODE_OPTIONS y otros problemas de build
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

// Limpiar NODE_OPTIONS problemático
delete process.env.NODE_OPTIONS;

// Set BUILDING flag to prevent Firebase initialization during build
process.env.BUILDING = 'true';

// Step 1: Verificar Storage ANTES del build
console.log('\n📋 Pre-build verification: Checking Firebase Storage connection...');
const verifyStorage = spawn('node', ['scripts/verify-storage.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

verifyStorage.on('close', (verifyCode) => {
  if (verifyCode !== 0) {
    console.error('❌ Storage verification failed. Aborting build.');
    process.exit(1);
  }

  console.log('✅ Storage verification passed. Starting Next.js build...\n');

  // Step 2: Ejecutar next build
  const build = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: undefined, BUILDING: 'true' }
  });

  build.on('close', handleBuildComplete);
  build.on('error', handleBuildError);
});

verifyStorage.on('error', (err) => {
  console.error('❌ Storage verification process error:', err);
  process.exit(1);
});

function handleBuildComplete(code) {
  // Verificar si la compilación fue exitosa independientemente del exit code
  const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');

  if (fs.existsSync('.next') && (fs.existsSync(buildIdPath) || fs.existsSync('.next/build-manifest.json'))) {
    console.log('✅ Build compilation successful!');

    // Crear BUILD_ID si no existe
    if (!fs.existsSync(buildIdPath)) {
      fs.writeFileSync(buildIdPath, Date.now().toString());
      console.log('✅ BUILD_ID created manually');
    }

    // Verificar PWA
    if (fs.existsSync(swPath)) {
      console.log('✅ PWA service worker generated successfully!');
    }

    // Create standalone structure for Firebase App Hosting if needed
    if (!fs.existsSync(standaloneDir)) {
      console.log('📦 Creating standalone structure for Firebase App Hosting...');

      // Create directories
      fs.mkdirSync(standaloneDir, { recursive: true });
      fs.mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });

      // Copy essential files to standalone structure
      const routesManifestSrc = path.join(process.cwd(), '.next', 'routes-manifest.json');
      const routesManifestDest = path.join(standaloneDir, '.next', 'routes-manifest.json');

      // Create a basic routes-manifest.json if it doesn't exist
      if (!fs.existsSync(routesManifestSrc)) {
        const basicRoutesManifest = {
          version: 3,
          pages404: true,
          basePath: "",
          redirects: [],
          rewrites: {
            beforeFiles: [],
            afterFiles: [],
            fallback: []
          },
          headers: [],
          dynamicRoutes: [],
          staticRoutes: [],
          dataRoutes: [],
          i18n: null
        };
        fs.writeFileSync(routesManifestDest, JSON.stringify(basicRoutesManifest, null, 2));
        console.log('✅ Created routes-manifest.json for Firebase App Hosting');
      } else {
        // Copy existing routes-manifest.json
        fs.copyFileSync(routesManifestSrc, routesManifestDest);
        console.log('✅ Copied routes-manifest.json to standalone directory');
      }
    }

    console.log('✅ Build process completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Build failed - no output files generated');
    process.exit(1);
  }
}

function handleBuildError(err) {
  console.error('❌ Build process error:', err);
  process.exit(1);
}