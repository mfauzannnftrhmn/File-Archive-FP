import * as FileSaver from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // <-- Sudah benar diimpor

@Component({
  standalone: false,
  selector: 'app-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage implements OnInit {
  profileData = {
    name: '',
    email: '',
    phone_number: '',
    address: '',
    bio: '',
    tanggal_lahir: '',
  };

  // TIPE DIUBAH agar bisa menerima URL aman dari sanitizer
  imagePreview: string | SafeUrl | null = 'assets/default-avatar.png';
  private selectedFile: File | null = null;
  private laravelApiUrl = 'http://simpap.my.id/public/api';

  // Getter untuk token agar lebih rapi
  private get token(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser).token;
    }
    return null;
  }

  constructor(
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private sanitizer: DomSanitizer // <-- Injeksi sudah benar
  ) {}

  ngOnInit() {
    this.loadCurrentProfile();
  }

  async loadCurrentProfile() {
    const loading = await this.loadingController.create({ message: 'Memuat profil...' });
    await loading.present();

    const token = this.token; // Menggunakan getter
    if (!token) {
      loading.dismiss();
      const toast = await this.toastController.create({ message: 'Sesi habis, silakan login kembali.', duration: 3000, position: 'top', color: 'danger' });
      await toast.present();
      this.router.navigate(['/login']);
      return;
    }

    // Interface sekarang hanya butuh path untuk pengecekan
    interface ProfileResponse {
      name?: string;
      email?: string;
      profile?: {
        phone_number?: string;
        address?: string;
        bio?: string;
        tanggal_lahir?: string;
        profile_picture_path?: string; // <-- Kita hanya butuh ini untuk tahu apakah foto ada
      };
    }

    this.http.get<ProfileResponse>(`${this.laravelApiUrl}/profile/current`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    }).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response?.profile) {
          this.profileData.name = response.name || '';
          this.profileData.email = response.email || '';
          this.profileData.phone_number = response.profile.phone_number || '';
          this.profileData.address = response.profile.address || '';
          this.profileData.bio = response.profile.bio || '';
          this.profileData.tanggal_lahir = response.profile.tanggal_lahir || '';

          // --- PERUBAHAN LOGIKA UTAMA ---
          // Cek apakah user punya path gambar di database
          if (response.profile.profile_picture_path) {
            // Jika punya, panggil fungsi untuk mengambil gambar via controller
            this.loadProfileImage();
          } else {
            // Jika tidak, tampilkan avatar default
            this.imagePreview = 'assets/default-avatar.png';
          }
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('Gagal memuat profil:', err);
        this.toastController.create({ message: 'Gagal memuat data profil.', duration: 3000, position: 'top', color: 'danger' }).then(t => t.present());
      }
    });
  }

  // FUNGSI INI SEKARANG DIPANGGIL DAN SUDAH BENAR
  async loadProfileImage() {
    const token = this.token;
    if (!token) return;

    // Tampilkan loading kecil saat gambar sedang diunduh
    this.imagePreview = 'assets/loading-spinner.gif'; // Opsional: ganti dengan path spinner Anda

    this.http.get(`${this.laravelApiUrl}/profile/display-picture`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
      responseType: 'blob' // Minta respons sebagai file (blob)
    }).subscribe({
        next: (blob) => {
            // Buat URL lokal dari blob yang diterima
            const objectUrl = URL.createObjectURL(blob);
            // Gunakan sanitizer agar Angular mengizinkan URL blob ini
            this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: (error) => {
            console.error('Gagal memuat gambar profil dari controller:', error);
            this.imagePreview = 'assets/default-avatar.png'; // Fallback jika gagal
        }
    });
  }

  // Fungsi untuk memicu klik pada input file yang tersembunyi
  async presentPhotoOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto Profil',
      buttons: [{
        text: 'Pilih dari Galeri',
        icon: 'images',
        handler: () => {
          this.triggerFileInput();
        }
      }, 
      {
        text: 'Batal',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }
  
  triggerFileInput() {
    const fileInputElement = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.click();
    }
  }


  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      this.selectedFile = fileList[0];

      // Tampilkan pratinjau gambar
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Langsung unggah foto setelah dipilih
      this.uploadProfilePicture();
    }
  }

  async uploadProfilePicture(): Promise<void> {
    if (!this.selectedFile) {
      // Tidak ada file yang dipilih untuk diunggah
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Mengunggah foto profil...',
    });
    await loading.present();

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      // ... (handle error token)
      await loading.dismiss();
      return;
    }
    const currentUser = JSON.parse(currentUserStr);
    const token = currentUser.token;
    if (!token) {
      // ... (handle error token)
      await loading.dismiss();
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', this.selectedFile, this.selectedFile.name);

    this.http.post<{ profile_picture_url: string, message: string }>(`${this.laravelApiUrl}/profile/upload-picture`, formData, {
      headers: new HttpHeaders({
        // 'Content-Type' tidak perlu diset manual untuk FormData, browser akan menanganinya
        'Authorization': `Bearer ${token}`
      })
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        // this.imagePreview sudah diupdate oleh onFileSelected, atau bisa diupdate dari response.profile_picture_url jika server mengembalikan URL lengkap
        // Jika server mengembalikan path relatif, Anda mungkin perlu membentuk URL lengkapnya lagi.
        // Untuk saat ini, asumsikan pratinjau dari FileReader sudah cukup dan backend telah menyimpan.
        // Jika Anda ingin memastikan gambar yang ditampilkan adalah yang dari server:
        // this.imagePreview = response.profile_picture_url; // Asumsikan API mengembalikan URL lengkap
        
        const toast = await this.toastController.create({
          message: response.message || 'Foto profil berhasil diunggah.',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        // Muat ulang profil untuk mendapatkan path gambar terbaru dari server (jika perlu)
        // this.loadCurrentProfile(); // Bisa diaktifkan jika ingin sinkronisasi penuh
      },
      error: async (err: HttpErrorResponse) => {
        await loading.dismiss();
        console.error('Gagal mengunggah foto profil:', err);
        let errorMessage = 'Gagal mengunggah foto profil.';
        if (err.error && typeof err.error === 'object' && err.error.message) {
            errorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
            errorMessage = err.error; // Jika error adalah string sederhana
        }
        
        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }


  async saveProfile() { // Fungsi ini sekarang hanya menyimpan data teks
    const loading = await this.loadingController.create({
      message: 'Menyimpan profil...',
    });
    await loading.present();

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) { /* ... handle error ... */ await loading.dismiss(); return; }
    const currentUser = JSON.parse(currentUserStr);
    const token = currentUser.token;
    if (!token) { /* ... handle error ... */ await loading.dismiss(); return; }

    // Hanya kirim data teks, foto sudah diunggah terpisah
    const textDataToSave = { ...this.profileData };
    // delete (textDataToSave as any).profilePicture; // Hapus jika ada properti foto di profileData

    console.log('Data teks yang dikirim untuk disimpan:', textDataToSave);

    this.http.post<any>(`${this.laravelApiUrl}/profile/save`, textDataToSave, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: response.message || 'Profil berhasil disimpan',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/profile']); // Navigasi ke halaman profil setelah berhasil
      },
      error: async (err) => {
        // ... (error handling yang sudah ada) ...
        await loading.dismiss();
        console.error('Gagal menyimpan profil:', err);
        let errorMessage = 'Gagal menyimpan profil. Coba lagi nanti.';
        if (err.error && typeof err.error === 'object' && err.error.message) {
            errorMessage = err.error.message;
        } else if (err.status === 422 && err.error && typeof err.error === 'object' && err.error.errors) {
            const errors = err.error.errors as Record<string, string[]>;
            const firstErrorKey = Object.keys(errors)[0];
            if (errors[firstErrorKey] && errors[firstErrorKey].length > 0) {
              errorMessage = errors[firstErrorKey][0];
            }
        }
        const toast = await this.toastController.create({ message: errorMessage, duration: 3000, position: 'top', color: 'danger' });
        await toast.present();
      }
    });
  }

  async downloadFile() {
    const loading = await this.loadingController.create({
      message: 'Mengunduh file...',
    });
    await loading.present();

    this.http.get(`${this.laravelApiUrl}/profile/download`, {
      responseType: 'blob',
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
            await toast.present();
            return;
        }
        FileSaver.saveAs(data, 'profil-export-user.pdf');
        const toast = await this.toastController.create({
          message: 'File berhasil diunduh.',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        await toast.present();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Download gagal:', err);
        let message = 'Download gagal. Periksa konsol untuk detail.';
        if (err.error && err.error instanceof Blob) { // Periksa apakah err.error adalah Blob
            try {
                const errorText = await err.error.text();
                const errorJson = JSON.parse(errorText);
                message = errorJson.message || message;
            } catch (e) {
                // Biarkan message default jika parsing gagal atau error bukan JSON
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
        await toast.present();
      }
    });
  }

}

