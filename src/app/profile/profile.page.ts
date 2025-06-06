import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// ... (Interface UserProfileData dan ApiProfileResponse tidak perlu diubah)
interface UserProfileData {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  bio: string;
  nip: string;
  tanggal_lahir: string;
  departemen: string;
  jabatan: string;
  tanggal_bergabung: string;
  status_karyawan: string;
  profilePicture?: string | SafeUrl | null;
}

interface ApiProfileResponse {
  name?: string;
  email?: string;
  profile?: {
    phone_number?: string;
    address?: string;
    bio?: string;
    nip?: string;
    tanggal_lahir?: string;
    departemen?: string;
    jabatan?: string;
    tanggal_bergabung?: string;
    status_karyawan?: string;
    profile_picture_path?: string;
  };
}


@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  // ... (Deklarasi properti profileData, laravelApiUrl, dll. tidak berubah)
  profileData: UserProfileData = {
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
    profilePicture: 'assets/default-avatar.png',
  };

  private laravelApiUrl = 'http://simpap.my.id/public/api';
  private profileSubscription: Subscription | undefined;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Dibiarkan kosong atau bisa digunakan untuk inisialisasi lain yang hanya perlu sekali jalan.
  }

  // [PERUBAHAN UTAMA]
  // Gunakan ionViewWillEnter agar data selalu di-fetch setiap kali halaman akan ditampilkan.
  ionViewWillEnter() {
    console.log('Halaman profil akan ditampilkan, mengambil data terbaru...');
    this.fetchProfileData();
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  // ... (Semua fungsi lain seperti fetchProfileData, loadProfileImage, doRefresh, dll. tidak perlu diubah)
  // Fungsi utama untuk mengambil data profil dari server
  async fetchProfileData(showLoading: boolean = true) {
    let loading: HTMLIonLoadingElement | undefined;
    if (showLoading) {
      loading = await this.loadingController.create({
        message: 'Memuat profil...',
      });
      await loading.present();
    }

    const token = this.getToken();
    if (!token) {
      if (loading) await loading.dismiss();
      this.showToast('Sesi habis, silakan login kembali.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }

    this.profileSubscription = this.http.get<ApiProfileResponse>(`${this.laravelApiUrl}/profile/current`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    }).subscribe({
      next: async (response) => {
        if (loading) await loading.dismiss();
        if (response) {
          // Isi semua data teks
          this.profileData.name = response.name || '';
          this.profileData.email = response.email || '';

          if (response.profile) {
            this.profileData.phone_number = response.profile.phone_number || '';
            this.profileData.address = response.profile.address || '';
            this.profileData.bio = response.profile.bio || '';
            this.profileData.nip = response.profile.nip || '';
            this.profileData.tanggal_lahir = response.profile.tanggal_lahir || '';
            this.profileData.departemen = response.profile.departemen || '';
            this.profileData.jabatan = response.profile.jabatan || '';
            this.profileData.tanggal_bergabung = response.profile.tanggal_bergabung || '';
            this.profileData.status_karyawan = response.profile.status_karyawan || '';

            // Logika untuk menampilkan gambar profil
            if (response.profile.profile_picture_path) {
              this.loadProfileImage(); // Panggil fungsi terpisah untuk mengambil file gambar
            } else {
              this.profileData.profilePicture = 'assets/default-avatar.png';
            }
          }
        }
      },
      error: async (err) => {
        if (loading) await loading.dismiss();
        console.error('Gagal memuat profil:', err);
        this.showToast('Gagal memuat data profil. Coba lagi nanti.', 'danger');
      }
    });
  }

  // Fungsi untuk mengambil file gambar dari controller sebagai blob
  loadProfileImage() {
    const token = this.getToken();
    if (!token) return;

    this.http.get(`${this.laravelApiUrl}/profile/display-picture`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
      responseType: 'blob' // Minta data sebagai file
    }).subscribe({
        next: (blob) => {
            // Buat URL lokal dari file blob yang diterima
            const objectUrl = URL.createObjectURL(blob);
            // Sanitasi URL agar aman digunakan di tag <img>
            this.profileData.profilePicture = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: (error) => {
            console.error('Gagal memuat gambar profil:', error);
            this.profileData.profilePicture = 'assets/default-avatar.png'; // Tampilkan gambar default jika gagal
        }
    });
  }

  // Fungsi untuk "tarik untuk refresh"
  doRefresh(event: any) {
    // Panggil fetchProfileData tanpa menampilkan overlay loading
    this.fetchProfileData(false).then(() => {
      if (event?.target) {
        event.target.complete();
      }
    });
  }

  // Fungsi untuk konfirmasi logout
  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          handler: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      ],
    });
    await alert.present();
  }

  // Helper untuk mengambil token
  private getToken(): string | null {
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser).token : null;
  }

  // Helper untuk menampilkan toast
  private async showToast(message: string, color: string = 'dark') {
      const toast = await this.toastController.create({
          message: message,
          duration: 3000,
          position: 'top',
          color: color,
      });
      await toast.present();
  }

}