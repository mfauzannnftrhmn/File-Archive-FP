import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let [major, minor, patch] = packageJson.version.split('.').map(Number);
patch += 1;
const newVersion = `${major}.${minor}.${patch}`;

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

const appVersionPath = path.join(__dirname, '../src/app/app-version.ts');
fs.writeFileSync(appVersionPath, `export const APP_VERSION = '${newVersion}';\n`);

console.log(`✅ APP_VERSION updated to ${newVersion}`);

// Kirim versi terbaru ke server Laravel
axios.post('https://simpap.kakoi.my.id/api/store-version', {
  version: newVersion
})
.then(() => {
  console.log('📤 Versi berhasil dikirim ke server.');
})
.catch((error) => {
  console.error('❌ Gagal mengirim versi ke server:', error.message);
});

// Optional: Ambil versi terbaru dari server (jika diperlukan)
axios.get<{ version?: string }>('https://simpap.kakoi.my.id/api/latest-version')
  .then((response) => {
    const latestVersion = response.data.version;
    if (latestVersion) {
      console.log(`🆕 Latest version from server: ${latestVersion}`);
    } else {
      console.warn('⚠️ Server response tidak mengandung field "version".');
    }
  })
  .catch((error) => {
    console.error('❌ Gagal mengambil versi dari server:', error.message);
  });
