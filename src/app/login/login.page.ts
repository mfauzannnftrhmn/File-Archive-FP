import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
// ✅ Import RouterModule
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController, NavController, IonicModule } from '@ionic/angular';
import { AuthService, UserData } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule // ✅ TAMBAHKAN RouterModule DI SINI
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
    private navCtrl: NavController
  ) {}

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