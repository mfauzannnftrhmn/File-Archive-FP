import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper'; // <-- Import ImageCropperModule
import * as FileSaver from 'file-saver'; 
import { HttpErrorResponse } from '@angular/common/http';
// Import-import penting untuk Standalone Component
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
  standalone: true, // <-- Pastikan ini ada dan bernilai true
  imports: [
    IonicModule, // <-- Impor IonicModule untuk ion-input, ion-button, dll.
    FormsModule, // <-- Impor FormsModule untuk [(ngModel)]
    CommonModule, // <-- Impor CommonModule untuk *ngIf, *ngFor, dll.
    ImageCropperModule, // <-- Impor ImageCropperModule untuk <image-cropper>
  ]
})
export class EditprofilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  // === DATA PROPERTIES ===
  profileData = {
    name: '',
    email: '',
    phone_number: '',
    address: '',
    bio: '',
    tanggal_lahir: '',
  };
  passwordData = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  };

  // === IMAGE & CROPPER PROPERTIES ===
  imagePreview: string | SafeUrl = 'assets/default-avatar.png';
  imageChangedEvent: any = ''; // Menyimpan event untuk diumpan ke cropper
  croppedImage: Blob | null = null; // Menyimpan hasil gambar yang di-crop

  // === API CONFIGURATION ===
  private laravelApiUrl = 'https://simpap.my.id/public/api';
  private get token(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  constructor(
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.loadCurrentProfile();
  }

  // ===============================================
  // SECTION: PROFILE DATA & IMAGE LOADING
  // ===============================================

  async loadCurrentProfile() {
    const loading = await this.loadingController.create({ message: 'Memuat profil...' });
    await loading.present();

    if (!this.token) {
      await loading.dismiss();
      this.handleAuthError();
      return;
    }

    this.http.get<any>(`${this.laravelApiUrl}/profile/current`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` })
    }).subscribe({
      next: (res) => {
        loading.dismiss();
        this.profileData = {
          name: res.name || '',
          email: res.email || '',
          phone_number: res.profile?.phone_number || '',
          address: res.profile?.address || '',
          bio: res.profile?.bio || '',
          tanggal_lahir: res.profile?.tanggal_lahir || '',
        };
        if (res.profile?.profile_picture_path) {
          this.loadProfileImage();
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('Gagal memuat profil:', err);
        this.showToast('Gagal memuat data profil.', 'danger');
      }
    });
  }

  loadProfileImage() {
    if (!this.token) return;
    this.http.get(`${this.laravelApiUrl}/profile/display-picture`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Gagal memuat gambar profil:', err);
        this.imagePreview = 'assets/default-avatar.png'; // Fallback
      }
    });
  }

  // ===============================================
  // SECTION: IMAGE CROPPING & UPLOAD FLOW
  // ===============================================

  async presentPhotoOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto Profil',
      buttons: [{
        text: 'Pilih dari Galeri',
        icon: 'images',
        handler: () => { this.fileInput.nativeElement.click(); }
      }, {
        text: 'Batal', icon: 'close', role: 'cancel'
      }]
    });
    await actionSheet.present();
  }
  
  /**
   * Dipanggil saat pengguna memilih file.
   * Metode ini HANYA memicu UI cropping dengan mengisi imageChangedEvent.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageChangedEvent = event; // Umpan event ke komponen <image-cropper>
    } else if (file) {
      this.showToast('File yang dipilih harus berupa gambar.', 'warning');
      this.resetFileElement();
    }
  }

  /**
   * Dipanggil oleh <image-cropper> setiap kali gambar berhasil di-crop.
   * @param event Data gambar yang sudah di-crop.
   */
  dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'image/png' });
}
  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.croppedImage = this.dataURItoBlob(event.base64);
    } else {
      console.error('Cropper event did not contain base64 data.');
      this.showToast('Gagal mendapatkan data gambar yang dipotong.', 'danger');
    }
  }

  imageLoaded() { console.log('Image loaded in cropper.'); }
  cropperReady() { console.log('Cropper is ready.'); }
  loadImageFailed() {
    this.showToast('Gagal memuat gambar untuk disesuaikan.', 'danger');
    this.cancelCrop();
  }

  /**
   * Batalkan proses cropping dan kembali ke form utama.
   */
  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = null;
    this.resetFileElement();
  }
  
  /**
   * Ambil gambar yang sudah di-crop dan mulai proses upload.
   * Dipanggil oleh tombol "Simpan Foto".
   */
   async cropAndUpload() {
    if (!this.croppedImage) {
      await this.showToast('Silakan sesuaikan area gambar terlebih dahulu.', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Mengunggah foto...' });
    await loading.present();

    // Dapatkan nama file asli untuk membuat File baru dari blob
    const originalFile = this.imageChangedEvent.target.files[0];
    const croppedFile = new File([this.croppedImage], originalFile.name, { type: this.croppedImage.type });
    
    // Mulai unggah file yang sudah di-crop
    this.uploadProfilePicture(croppedFile, loading);
  }

   private async uploadProfilePicture(file: File, loading: HTMLIonLoadingElement) {
    if (!this.token) {
      await loading.dismiss();
      this.handleAuthError();
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file, file.name);

    // Pastikan endpoint API Anda benar
    const uploadUrl = `${this.laravelApiUrl}/profile/upload-picture`;

    this.http.post<any>(uploadUrl, formData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` })
    }).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.showToast(res.message || 'Foto profil berhasil diperbarui!', 'success');
        this.loadProfileImage(); // Muat ulang gambar baru dari server
        this.cancelCrop(); // Kembali ke tampilan utama setelah berhasil
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Gagal mengunggah gambar:', err);
        await this.showToast(err.error?.message || 'Gagal mengunggah foto profil.', 'danger');
        this.cancelCrop(); // Kembali ke tampilan utama meskipun gagal
      }
    });
  }

  // ===============================================
  // SECTION: PROFILE & PASSWORD DATA UPDATE
  // ===============================================

    async updateProfileData() {
    const loading = await this.loadingController.create({ message: 'Menyimpan perubahan...' });
    await loading.present();

    // Pastikan endpoint API Anda benar
    this.http.post(`${this.laravelApiUrl}/profile/save`, this.profileData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` })
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showToast(res.message || 'Profil berhasil diperbarui.', 'success');
        this.router.navigate(['/tabs/profile']); // Arahkan kembali ke halaman profil
      },
      error: (err) => {
        loading.dismiss();
        this.showToast(err.error?.message || 'Terjadi kesalahan saat menyimpan profil.', 'danger');
      }
    });
  }
  async updatePassword() {
    if (this.passwordData.new_password !== this.passwordData.new_password_confirmation) {
      this.showToast('Password baru dan konfirmasi tidak cocok.', 'warning');
      return;
    }
    if (!this.passwordData.current_password || !this.passwordData.new_password) {
        this.showToast('Semua kolom password wajib diisi.', 'warning');
        return;
    }

    const loading = await this.loadingController.create({ message: 'Mengubah password...' });
    await loading.present();
    
    // Pastikan endpoint API Anda benar
    this.http.post(`${this.laravelApiUrl}/profile/change-password`, this.passwordData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` })
    }).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        await this.showToast(res.message || 'Password berhasil diubah.', 'success');
        this.passwordData = { current_password: '', new_password: '', new_password_confirmation: '' };
      },
      error: async (err) => {
        await loading.dismiss();
        await this.showToast(err.error?.message || 'Gagal mengubah password.', 'danger');
      }
    });
  }

  
  // ===============================================
  // SECTION: UTILITIES
  // ===============================================
  
  /**
   * Mereset nilai dari elemen input file. Penting agar event 'change' 
   * dapat terpicu lagi jika pengguna memilih file yang sama.
   */
  private resetFileElement() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }
  }
  
  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    toast.present();
  }

  private async handleAuthError() {
    await this.showToast('Sesi habis, silakan login kembali.', 'danger');
    this.router.navigate(['/login']);
  }

	
 private resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Hitung rasio baru untuk mempertahankan aspek rasio
          // Ini memastikan gambar tidak distorsi saat diskalakan
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Gagal mendapatkan konteks canvas untuk penskalaan gambar.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Konversi canvas menjadi Blob (file gambar)
          // File ini yang kemudian akan diunggah, bukan file asli yang lebih besar
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Gagal mengkonversi gambar ke Blob setelah penskalaan.'));
            }
          }, file.type, quality); // Menggunakan tipe file asli dan kualitas yang ditentukan
        };
        img.onerror = (error) => reject(new Error('Gagal memuat gambar untuk penskalaan.'));
      };
      reader.onerror = (error) => reject(new Error('Gagal membaca file gambar.'));
    });
  }


  async saveProfile() {
    const loading = await this.loadingController.create({
      message: 'Menyimpan profil...',
    });
    await loading.present();

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      await loading.dismiss();
      await this.showToast('Sesi habis, silakan login kembali.', 'danger');
      this.router.navigate(['/login']);
      return;
    }
    const currentUser = JSON.parse(currentUserStr);
    const token = currentUser.token;
    if (!token) {
      await loading.dismiss();
      await this.showToast('Sesi habis, silakan login kembali.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    const textDataToSave = { ...this.profileData };

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
        this.router.navigate(['/profile']);
      },
      error: async (err) => {
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

 async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const token = this.token;
    if (!token) {
      this.showToast('Sesi habis, silakan login ulang.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showToast('Konfirmasi password tidak cocok.', 'danger');
      return;
    }

    const body = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const loading = await this.loadingController.create({ message: 'Mengubah password...' });
    await loading.present();

    this.http.post(`${this.laravelApiUrl}/profile/change-password`, body, { headers }).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        this.showToast('Password berhasil diubah.', 'success');
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err.error?.message || 'Gagal mengubah password.';
        this.showToast(msg, 'danger');
      }
    });XMLDocument
  }

  submitChangePassword() {
    const { current_password, new_password, new_password_confirmation } = this.passwordData;

    if (!current_password || !new_password || !new_password_confirmation) {
      this.showToast('Semua kolom password wajib diisi.', 'danger');
      return;
    }

    this.changePassword(current_password, new_password, new_password_confirmation);
  }


}
