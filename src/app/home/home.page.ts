import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';  // Impor AuthService
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private http: HttpClient,
    private authService: AuthService  // Menambahkan AuthService ke konstruktor
  ) { }

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
  
    console.log('Email:', this.email, 'Password:', this.password);
  
    this.authService.login(this.email, this.password).subscribe({
      next: async (res) => {
        await loading.dismiss();
        console.log('RESPON API:', res);
  
        if (res?.role === 'karyawan') {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('email', this.email);
          this.router.navigateByUrl('/dashboard');
        } else {
          await this.showAlert('Akses Ditolak', 'Hanya user dengan role "karyawan" yang bisa login lewat aplikasi ini.');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('ERROR API:', JSON.stringify(err));
  
        const msg = err?.error?.message || 'Login gagal. Periksa kembali email dan password.';
        await this.showAlert('Login Gagal', msg);
      }
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
