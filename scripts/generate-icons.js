const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icon-source.svg');
const assetsDir = path.join(__dirname, '..', 'assets');

const icons = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
  { name: 'splash-icon.png', size: 200 },
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const icon of icons) {
    const outputPath = path.join(assetsDir, icon.name);

    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
