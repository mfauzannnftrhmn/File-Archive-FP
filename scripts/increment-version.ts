const fs = require('fs');
const path = require('path');

// Ambil path package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Naikkan patch version
let [major, minor, patch] = packageJson.version.split('.').map(Number);
patch += 1;
const newVersion = `${major}.${minor}.${patch}`;

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update file app-version.ts
const appVersionPath = path.join(__dirname, '../src/app/app-version.ts');
fs.writeFileSync(appVersionPath, `export const APP_VERSION = '${newVersion}';\n`);

console.log(`✅ APP_VERSION set to ${newVersion}`);
