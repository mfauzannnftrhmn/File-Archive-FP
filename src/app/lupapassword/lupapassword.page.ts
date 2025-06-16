import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // ✅ Tambahkan ini

@Component({
  selector: 'app-lupapassword',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule // ✅ Tambahkan ini agar routerLink dikenali
  ],
  templateUrl: './lupapassword.page.html',
  styleUrls: ['./lupapassword.page.scss'],
})
export class LupapasswordPage {
  email: string = '';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async onSubmit() {
    const loading = await this.loadingCtrl.create({
      message: 'Mengirim email reset...',
    });
    await loading.present();

    this.http.post('https://simpap.my.id/public/api/forgot-password', {
      email: this.email
    }).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Link reset password telah dikirim ke email Anda.',
          duration: 3000,
          color: 'success',
        });
        await toast.present();
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Terjadi kesalahan. Email tidak ditemukan.',
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      }
    });
  }
}
