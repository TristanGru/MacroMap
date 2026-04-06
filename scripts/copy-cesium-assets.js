const path = require('path');
const fs = require('fs');

const src = path.join(__dirname, '../node_modules/cesium/Build/Cesium');
const dest = path.join(__dirname, '../public/cesium');

if (!fs.existsSync(src)) {
  console.error('✗ Cesium Build directory not found. Run npm install first.');
  process.exit(1);
}

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

const dirs = ['Workers', 'ThirdParty', 'Assets', 'Widgets'];

for (const dir of dirs) {
  const srcDir = path.join(src, dir);
  const destDir = path.join(dest, dir);

  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠ ${dir} not found in Cesium Build, skipping.`);
    continue;
  }

  // Remove existing to ensure clean copy
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`✓ Copied ${dir} → public/cesium/${dir}`);
}

console.log('✓ Cesium assets ready at public/cesium/');
