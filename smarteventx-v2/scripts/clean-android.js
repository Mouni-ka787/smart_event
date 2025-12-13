const fs = require('fs');
const path = require('path');

console.log('Cleaning Android build artifacts...');

// Paths to clean
const androidPaths = [
  'android/app/build',
  'android/app/src/main/assets'
];

androidPaths.forEach(androidPath => {
  const fullPath = path.join(__dirname, '..', androidPath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✓ Removed ${androidPath}`);
    } catch (error) {
      console.warn(`⚠ Could not remove ${androidPath}: ${error.message}`);
    }
  } else {
    console.log(`- ${androidPath} (not found)`);
  }
});

console.log('✓ Android build artifacts cleaned!');