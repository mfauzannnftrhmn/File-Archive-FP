import * as FileSaver from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular'; // Tambahkan LoadingController
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ✅ Tambahan penting

@Component({
  standalone: false, // Pastikan ini sesuai dengan konfigurasi proyek Anda
  selector: 'app-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage implements OnInit {
  // Tambahkan variabel untuk menampung data profil jika ada form
    profileData = {
    name: '',
    email: '',
    // Tambahkan field baru untuk profil
    phone_number: '', // Akan disimpan di tabel profiles
    address: '',      // Akan disimpan di tabel profiles
    bio: '',          // Akan disimpan di tabel profiles
    // profilePicture: null, // Jika Anda menangani upload file
  };

  // Ganti dengan URL base API Laravel Anda
  // Jika Laravel berjalan di localhost:8000, maka:
  private laravelApiUrl = 'http://simpap.my.id/public/api';
  // Jika sudah di-deploy ke cPanel dengan domain, misalnya:
  // private laravelApiUrl = 'https://domainanda.com/api';


  constructor(
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private loadingController: LoadingController // Injeksi LoadingController
  ) {}

async loadCurrentProfile() {
  const loading = await this.loadingController.create({ message: 'Memuat profil...' });
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
      message: 'Token tidak ditemukan. Silakan login ulang.',
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
      'Authorization': `Bearer ${token}`
    })
  }).subscribe({
    next: (response: any) => {
      loading.dismiss();
      if (response) {
        this.profileData.name = response.name;
        this.profileData.email = response.email;
        if (response.profile) {
          this.profileData.phone_number = response.profile.phone_number || '';
          this.profileData.address = response.profile.address || '';
          this.profileData.bio = response.profile.bio || '';
        }
      }
    },
    error: (err) => {
      loading.dismiss();
      console.error('Gagal memuat profil:', err);
    }
  });
}

  ngOnInit() {
    this.loadCurrentProfile(); // Panggil fungsi ini untuk mengisi form saat halaman dimuat
  }


async saveProfile() {
  const loading = await this.loadingController.create({
    message: 'Menyimpan profil...',
  });
  await loading.present();

  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    await loading.dismiss();
    const toast = await this.toastController.create({
      message: 'Autentikasi tidak ditemukan. Silakan login ulang.',
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
    this.router.navigate(['/login']);
    return;
  }

  const currentUser = JSON.parse(currentUserStr);
  const token = currentUser.token;

  if (!token) {
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

  this.http.post(`${this.laravelApiUrl}/profile/save`, this.profileData, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
  }).subscribe({
    next: async (response: any) => {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: response.message || 'Profil berhasil disimpan',
        duration: 2000,
        position: 'top',
        color: 'success',
      });
      await toast.present();
      this.router.navigate(['/profile']);
    },
    error: async (err) => {
      await loading.dismiss();
      console.error('Gagal menyimpan profil:', err);
      let errorMessage = 'Gagal menyimpan profil. Coba lagi nanti.';
      if (err.error && err.error.message) {
          errorMessage = err.error.message;
      } else if (err.status === 422 && err.error && err.error.errors) {
          const errors = err.error.errors;
          const firstErrorKey = Object.keys(errors)[0];
          errorMessage = errors[firstErrorKey][0];
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
    }
  });
}



  async downloadFile() {
    const loading = await this.loadingController.create({
      message: 'Mengunduh file...',
    });
    await loading.present();

    // Ganti URL dengan endpoint Laravel Anda
    this.http.get(`${this.laravelApiUrl}/profile/download`, {
      responseType: 'blob', // Penting untuk menangani file
      // headers: new HttpHeaders({
      //   // Jika endpoint download memerlukan otentikasi
      //   // 'Authorization': `Bearer ${yourAuthToken}`
      // })
    }).subscribe({
      next: async (data: Blob) => {
        await loading.dismiss();
        if (data.size === 0) {
            console.error('Download gagal: File kosong diterima.');
            const toast = await this.toastController.create({
              message: 'Gagal mengunduh file: File tidak ditemukan atau kosong.',
              duration: 3000,
              position: 'top',
              color: 'danger',
            });
            toast.present();
            return;
        }
        FileSaver.saveAs(data, 'profil-export-user.pdf'); // Sesuaikan nama file jika perlu
        const toast = await this.toastController.create({
          message: 'File berhasil diunduh.',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        toast.present();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Download gagal:', err);
        let message = 'Download gagal. Periksa konsol untuk detail.';
        if (err.error && err.error.message) { // Jika backend mengirim pesan error JSON
            try {
                // Jika error adalah blob, coba parse sebagai JSON
                const errorText = await (err.error as Blob).text();
                const errorJson = JSON.parse(errorText);
                message = errorJson.message || message;
            } catch (e) {
                // Biarkan message default jika parsing gagal
            }
        } else if (err.message) {
            message = err.message;
        }
        const toast = await this.toastController.create({
          message: message,
          duration: 3000,
          position: 'top',
          color: 'danger',
        });
        toast.present();
      }
    });
  }

}