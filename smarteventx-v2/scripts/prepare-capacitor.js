const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceIndex = path.join(__dirname, '..', 'out', 'server', 'app', 'index.html');
const destIndex = path.join(__dirname, '..', 'out', 'index.html');

console.log('Preparing Capacitor build...');

// Check if source file exists
if (fs.existsSync(sourceIndex)) {
  // Copy index.html to the root of out directory
  fs.copyFileSync(sourceIndex, destIndex);
  console.log('✓ Copied index.html to out directory');
} else {
  console.error('✗ Could not find index.html in out/server/app/');
  process.exit(1);
}

console.log('✓ Capacitor preparation complete!');