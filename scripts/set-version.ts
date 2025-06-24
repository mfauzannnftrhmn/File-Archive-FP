const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '../package.json');
const versionFile = path.join(__dirname, '../src/app/app-version.ts');

// Baca versi saat ini
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = pkg.version.split('.').map(Number);

// Auto-increment PATCH version (misal: 1.2.0 → 1.2.1)
version[2]++;
const newVersion = version.join('.');

// Simpan versi baru ke package.json
pkg.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

// Simpan ke app-version.ts juga
const content = `export const APP_VERSION = '${newVersion}';\n`;
fs.writeFileSync(versionFile, content);

console.log(`✅ Versi aplikasi diupdate ke ${newVersion}`);
