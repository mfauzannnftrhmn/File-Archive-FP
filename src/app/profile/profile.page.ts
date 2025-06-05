import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  // Tambahkan properti untuk menyimpan data dari backend
  profileData = {
  name: '',
  email: '',
  phone_number: '',
  address: '',
  bio: '',
  nip: '',
  tanggal_lahir: '',
  departemen: '',
  jabatan: '',
  tanggal_bergabung: '',
  status_karyawan: '',
};


  // Ganti sesuai dengan API Laravel Anda
  private laravelApiUrl = 'http://simpap.my.id/public/api';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    const loading = await this.loadingController.create({
      message: 'Memuat profil...',
    });
    await loading.present();

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Token tidak ditemukan. Silakan login ulang.',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
      this.router.navigate(['/login']);
      return;
    }

    const token = JSON.parse(currentUser).token;
    if (!token) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Token tidak valid. Silakan login ulang.',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
      this.router.navigate(['/login']);
      return;
    }

    this.http.get(`${this.laravelApiUrl}/profile/current`, {
  headers: new HttpHeaders({
    Authorization: `Bearer ${token}`,
  }),
}).subscribe({
  next: async (response: any) => {
    await loading.dismiss();
    if (response) {
      this.profileData.name = response.name;
      this.profileData.email = response.email;
      this.profileData.phone_number = response.phone_number || '';
      this.profileData.address = response.address || '';
      this.profileData.bio = response.bio || '';
      this.profileData.nip = response.nip || '';
      this.profileData.tanggal_lahir = response.tanggal_lahir || '';
      this.profileData.departemen = response.departemen || '';
      this.profileData.jabatan = response.jabatan || '';
      this.profileData.tanggal_bergabung = response.tanggal_bergabung || '';
      this.profileData.status_karyawan = response.status_karyawan || '';
    }
  },
  error: async (err) => {
    await loading.dismiss();
    console.error('Gagal memuat profil:', err);
    const toast = await this.toastController.create({
      message: 'Gagal memuat data profil. Silakan coba lagi.',
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }
});

  }

  doRefresh(event: any) {
    this.loadProfile().then(() => {
      event.target.complete();
    });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Keluar',
          handler: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      ],
      cssClass: 'alert-logout'
    });

    await alert.present();
  }
}
