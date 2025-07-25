import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { APP_VERSION } from '../app-version';
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController, NavController, IonicModule } from '@ionic/angular';
import { AuthService, UserData } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private http: HttpClient,
    private navCtrl: NavController,
    private storage: Storage // ✅ Tambahkan storage
  ) {
    this.initStorage(); // ✅ Inisialisasi saat konstruktor dipanggil
  }

async initStorage() {
  await this.storage.create();

  // ✅ Ambil status login & user data
  const isLoggedIn = await this.storage.get('isLoggedIn');
  const userData = await this.storage.get('userData');

  if (isLoggedIn && userData) {
    console.log('User sudah login, redirect ke /dashboard');
    this.navCtrl.navigateRoot('/dashboard', { animated: true, animationDirection: 'forward' });
  } else {
    console.log('Belum login atau data tidak ditemukan, tetap di /login');
    // ✅ Pastikan tidak redirect kalau data kosong atau sudah logout
    await this.storage.remove('isLoggedIn'); // optional, untuk bersih-bersih
    await this.storage.remove('userData');
  }
}


  async doSubmit() {
    if (!this.email || !this.password) {
      await this.showAlert('Error', 'Email dan Password harus diisi!');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sedang memproses login...',
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });

    await loading.present();

    this.authService.loginKaryawan({ email: this.email, password: this.password })
      .subscribe({
        next: async (userData: UserData) => {
          await loading.dismiss();
          console.log('Login berhasil, data pengguna terautentikasi:', userData);

          if (!userData.emailVerified) {
            await this.showAlert(
              'Verifikasi Email Diperlukan',
              'Email Anda belum diverifikasi. Silakan periksa email Anda untuk link verifikasi sebelum login.'
            );
            this.authService.logout().subscribe();
            return;
          }

          // ✅ Simpan status login ke storage
          await this.storage.set('isLoggedIn', true);
          await this.storage.set('userData', userData);

          this.navCtrl.navigateRoot('/dashboard', { animated: true, animationDirection: 'forward' });
        },
        error: async (error: Error) => {
          await loading.dismiss();
          console.error('ERROR LOGIN DI PAGE:', error);
          await this.showAlert('Login Gagal', error.message);
        },
      });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
