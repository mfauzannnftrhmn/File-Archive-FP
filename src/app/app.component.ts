import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
// Import untuk cek versi aplikasi
import { App } from '@capacitor/app'; // jika pakai Cordova plugin
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private storage: Storage,
    private router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {
    this.platform.ready().then(() => {
      this.checkLoginStatus();
      this.checkForUpdate(); // ✅ tambahkan ini
    });
  }

  // ✅ Cek status login
  async checkLoginStatus() {
    await this.storage.create();
    const isLoggedIn = await this.storage.get('isLoggedIn');

    // Daftar rute yang tidak memerlukan login (public routes)
    const publicRoutes = ['/option', '/register', '/chat']; // <-- Ditambahkan '/chat' di sini

    // Cek apakah URL saat ini dimulai dengan salah satu dari rute publik
    if (publicRoutes.some(route => this.router.url.startsWith(route))) {
      return; // Jangan redirect kalau URL termasuk halaman public
    }

    // Jika user belum login dan bukan di rute publik, arahkan ke halaman login
    if (!isLoggedIn) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } else {
      // Jika user sudah login dan bukan di rute publik, arahkan ke dashboard
      // Ini penting agar user tidak terjebak di halaman login/register setelah refresh
      if (this.router.url.startsWith('/login') || this.router.url.startsWith('/register')) {
         this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      }
    }
  }

  // ✅ Cek update aplikasi
  async checkForUpdate() {
    try {
      // Ambil versi app lokal
      const info = await App.getInfo();
      const currentVersion = info.version;
      console.log('Versi aplikasi sekarang:', currentVersion);
      console.log('Versi app saat ini:', currentVersion);

      // Ambil versi terbaru dari Play Store
      const latestVersion = await this.getLatestVersionFromPlayStore();
      console.log('Versi terbaru Play Store:', latestVersion);

      if (this.isNewerVersion(latestVersion, currentVersion)) {
        const alert = await this.alertCtrl.create({
          header: 'Update Tersedia',
          message: `Versi baru (${latestVersion}) sudah tersedia. Silakan update aplikasi.`,
          buttons: [
            {
              text: 'Update',
              handler: () => {
                window.open(
                  'https://play.google.com/store/apps/details?id=com.kakoi.app', // ganti dengan package name app-mu
                  '_system'
                );
              },
            },
            { text: 'Nanti', role: 'cancel' },
          ],
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Gagal cek update:', error);
    }
  }

  // ✅ Ambil versi terbaru dari Play Store
  getLatestVersionFromPlayStore(): Promise<string> {
    return new Promise((resolve) => {
      const packageName = 'com.kakoi.app'; // Ganti dengan package name aplikasi-mu
      const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=en&gl=US`;

      this.http.get(url, { responseType: 'text' }).subscribe((html) => {
        const versionRegex = /\[\[\["([0-9.]+)"/; // Regex ambil versi
        const match = html.match(versionRegex);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve('0.0.0'); // fallback
        }
      });
    });
  }

  // ✅ Bandingkan versi terbaru vs saat ini
  isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map((num) => parseInt(num, 10));
    const currentParts = current.split('.').map((num) => parseInt(num, 10));

    for (let i = 0; i < latestParts.length; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
        return true;
      } else if ((latestParts[i] || 0) < (currentParts[i] || 0)) {
        return false;
      }
    }
    return false;
  }
}
// sebelum di ganti paksa login
// async checkLoginStatus() {
//     await this.storage.create();
//     const isLoggedIn = await this.storage.get('isLoggedIn');
//     if (isLoggedIn) {
//       this.router.navigateByUrl('/dashboard', { replaceUrl: true });
//     } else {
//       this.router.navigateByUrl('/login', { replaceUrl: true });
//     }
//   }