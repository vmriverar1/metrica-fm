const fs = require('fs');
const path = require('path');

// Simple script to copy existing logos as PWA icons
// In production, use proper image resizing tools

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceLogo = 'public/img/icono-logo-2.png'; // Best square logo
const iconsDir = 'public/icons';

console.log('📱 Generating PWA icons...');

// Check if source logo exists
if (!fs.existsSync(sourceLogo)) {
  console.warn('⚠️  Source logo not found, creating placeholder icons');
  
  // Create simple SVG placeholder icons
  sizes.forEach(size => {
    const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#003F6F"/>
      <rect x="${size/4}" y="${size/4}" width="${size/2}" height="${size/2}" fill="#E84E0F" rx="${size/8}"/>
      <text x="${size/2}" y="${size/2 + size/16}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="${size/8}" font-weight="bold">M</text>
    </svg>`;
    
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(outputPath, svgContent);
    console.log(`✅ Created ${outputPath}`);
  });
  
  // Create shortcut icons
  const shortcutIcons = [
    { name: 'portfolio', color: '#E84E0F', letter: 'P' },
    { name: 'admin', color: '#003F6F', letter: 'A' }
  ];
  
  shortcutIcons.forEach(({ name, color, letter }) => {
    const svgContent = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" fill="${color}"/>
      <text x="48" y="54" text-anchor="middle" fill="white" font-family="sans-serif" font-size="32" font-weight="bold">${letter}</text>
    </svg>`;
    
    const outputPath = path.join(iconsDir, `${name}-96x96.svg`);
    fs.writeFileSync(outputPath, svgContent);
    console.log(`✅ Created ${outputPath}`);
  });
  
} else {
  console.log(`📋 Using existing logo: ${sourceLogo}`);
  
  // Copy existing logo for each size (simple approach)
  sizes.forEach(size => {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.copyFileSync(sourceLogo, outputPath);
    console.log(`✅ Copied to ${outputPath}`);
  });
}

// Create sample screenshots placeholders
const screenshots = [
  { name: 'home-mobile', width: 390, height: 844 },
  { name: 'portfolio-desktop', width: 1920, height: 1080 }
];

screenshots.forEach(({ name, width, height }) => {
  const svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f8fafc"/>
    <rect x="0" y="0" width="${width}" height="80" fill="#003F6F"/>
    <text x="${width/2}" y="45" text-anchor="middle" fill="white" font-family="sans-serif" font-size="24" font-weight="bold">Métrica DIP</text>
    <rect x="${width/10}" y="120" width="${width*0.8}" height="40" fill="#e5e7eb" rx="4"/>
    <rect x="${width/10}" y="180" width="${width*0.6}" height="20" fill="#d1d5db" rx="4"/>
    <rect x="${width/10}" y="220" width="${width*0.4}" height="20" fill="#d1d5db" rx="4"/>
  </svg>`;
  
  const outputPath = path.join('public/screenshots', `${name}.svg`);
  fs.writeFileSync(outputPath, svgContent);
  console.log(`✅ Created screenshot: ${outputPath}`);
});

console.log('🎉 PWA icons generation completed!');