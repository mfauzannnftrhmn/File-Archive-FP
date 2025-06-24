// aktivitas.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { PengajuanSurat } from '../models/pengajuan-surat.model'; // Sesuaikan path jika perlu
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// --- IMPORT PLUGIN CAPACITOR ---
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications'; // <<< IMPORT INI
// --- AKHIR IMPORT PLUGIN CAPACITOR ---

interface Surat {
  id: number;
  title: string;
  suratNumber: string;
  date: string;
  time?: string;
  status?: string; // Pastikan ini ada dan berisi 'disetujui', 'proses', 'ditolak' (huruf kecil)
  category: string;
  remarks?: string;
  file_url?: string;
  attachment_path?: string;
  created_at?: string;
  updated_at?: string;
  formatted_date?: string;
  formatted_time?: string;
  formatted_updated_at_date?: string;
  relative_updated_at?: string;
}

@Component({
  standalone: false,
  selector: 'app-aktivitas',
  templateUrl: './aktivitas.page.html',
  styleUrls: ['./aktivitas.page.scss'],
})
export class AktivitasPage implements OnInit {

  public recentLetters: PengajuanSurat[] = [];
  public isLoading: boolean = true;
  private apiUrl = 'https://simpap.my.id/public/api';

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  getUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return { email: user.email, name: user.name, token: user.token };
  }

  ngOnInit() {
    this.loadRecentLetters();
    // Opsional: Meminta izin notifikasi saat aplikasi dimuat pertama kali
    this.requestNotificationPermissions();
  }

  // --- FUNGSI BARU UNTUK MEMINTA IZIN NOTIFIKASI ---
  async requestNotificationPermissions() {
    if (Capacitor.isNativePlatform()) {
      try {
        const { display } = await LocalNotifications.checkPermissions();
        if (display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            console.warn('Izin notifikasi tidak diberikan.');
            this.presentToast('Untuk notifikasi unduhan, izinkan notifikasi di pengaturan aplikasi.', 'warning');
          }
        }
      } catch (e) {
        console.error('Error saat meminta izin notifikasi:', e);
      }
    }
  }

  loadRecentLetters(event?: any) {
    if (!event) {
      this.isLoading = true;
    }

    const { email, name, token } = this.getUserInfo();
    
    if (!email || !name || !token) { 
      this.presentToast('Data pengguna atau autentikasi tidak lengkap. Silakan login kembali.', 'danger');
      if (event) event.target.complete();
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/pengajuan-surat/latest?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

    this.http.get<PengajuanSurat[]>(url, { headers: headers })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        })
      )
      .subscribe(
        (response) => {
          this.recentLetters = response;
          console.log('Recent Letters Data:', this.recentLetters);
        },
        (error) => {
          console.error('Error fetching recent letters:', error);
          this.presentToast(error.error?.message || 'Gagal memuat aktivitas terbaru.', 'danger');
        }
      );
  }

  doRefresh(event: any) {
    this.loadRecentLetters(event);
  }

  getRelativeTime(datetime: string): string {
    const now = new Date();
    const then = new Date(datetime);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Kemarin';
    return `${diffInDays} hari lalu`;
  }

  getStatusColor(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ditolak': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'proses': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'checkmark-circle';
      case 'ditolak': return 'close-circle';
      case 'proses': return 'sync-circle';
      default: return 'time';
    }
  }

  getIconColor(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'text-green-600 dark:text-green-400';
      case 'ditolak': return 'text-red-600 dark:text-red-400';
      case 'proses': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  }

  getIconBgColor(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'bg-green-100 dark:bg-green-900';
      case 'ditolak': return 'bg-red-100 dark:bg-red-900';
      case 'proses': return 'bg-blue-100 dark:bg-blue-900';
      default: return 'bg-yellow-100 dark:bg-yellow-900';
    }
  }

  async downloadApprovedLetter(surat: PengajuanSurat) {
    if (surat.status?.toLowerCase() !== 'disetujui') {
      this.presentToast('Surat belum disetujui, tidak bisa diunduh.', 'warning');
      return;
    }

    if (!surat.id) {
      this.presentToast('ID surat tidak tersedia.', 'danger');
      return;
    }

    const { token } = this.getUserInfo();
    if (!token) {
      this.presentToast('Autentikasi diperlukan untuk mengunduh. Silakan login kembali.', 'danger');
      return;
    }

    const downloadUrl = `${this.apiUrl}/pengajuan-surats/${surat.id}/download`;
    const fileName = `surat_aktivitas_${surat.surat_number || surat.id}_disetujui.pdf`;

    try {
      this.presentToast('Memulai unduhan surat...', 'primary');
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', response.status, errorText);
        let errorMessage = `Gagal mengunduh surat: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) { }
        this.presentToast(errorMessage, 'danger');
        return;
      }

      const blob = await response.blob();

      if (Capacitor.isNativePlatform()) {
        try {
          const base64Data = await this.blobToBase64(blob);

          const targetDirectory = Directory.Documents;
          const subfolder = 'Simpap';
          const fullPath = `${subfolder}/${fileName}`;

          console.log(`Mencoba membuat direktori: ${targetDirectory}/${subfolder}`);
          try {
            await Filesystem.mkdir({
              path: subfolder,
              directory: targetDirectory,
              recursive: true
            });
            console.log(`Direktori ${subfolder} berhasil dibuat atau sudah ada di ${targetDirectory}.`);
          } catch (dirError: any) {
            if (!dirError.message.includes('Path exists')) {
              console.warn(`Gagal membuat direktori ${subfolder} di ${targetDirectory}:`, dirError);
            }
          }
          
          console.log(`Mencoba menulis file: ${targetDirectory}/${fullPath}`);
          await Filesystem.writeFile({
            path: fullPath,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
          });

          // --- PENTING: JADWALKAN NOTIFIKASI LOKAL DI SINI ---
          let displayLocation = '';
          if (Capacitor.getPlatform() === 'ios') {
            displayLocation = 'aplikasi "Files" Anda (di bawah "Di iPhone Saya" / "Di iPad Saya" -> "Simpap")';
          } else { // Android
            displayLocation = 'folder "Documents" di penyimpanan internal ponsel Anda (cari folder "Simpap")';
          }
          this.presentToast(`Surat berhasil disimpan di ${displayLocation}.`, 'success');
          console.log(`File berhasil disimpan ke: ${targetDirectory}/${fullPath}`);

          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Unduhan Selesai!',
                body: `Surat "${fileName}" berhasil diunduh.`,
                id: surat.id, // ID unik untuk notifikasi, bisa pakai ID surat
                schedule: { at: new Date(Date.now() + 100) }, // Jadwalkan sedikit di masa depan
                sound: undefined,
                attachments: [
                  // --- BARIS YANG DIPERBAIKI ---
                  { id: fileName, url: `file://${await Filesystem.getUri({ directory: targetDirectory, path: fullPath }) }` } // Hapus 'mimeType: 'application/pdf''
                ],
                extra: { // Opsional: Data tambahan untuk notifikasi
                  filePath: fullPath,
                  directory: targetDirectory,
                }
              }
            ]
          });
          // --- AKHIR JADWALKAN NOTIFIKASI LOKAL ---

        } catch (fileSystemError: any) {
          console.error('Error saat menyimpan file ke sistem:', fileSystemError);
          if (fileSystemError.message && fileSystemError.message.includes('permission')) {
             this.presentToast('Tidak dapat menyimpan file: Izinkan akses penyimpanan di pengaturan aplikasi.', 'danger');
          } else {
             this.presentToast('Gagal menyimpan file ke penyimpanan internal. Unduhan standar akan dicoba.', 'danger');
             this.triggerWebDownload(blob, fileName);
          }
        }
      } else {
        this.triggerWebDownload(blob, fileName);
      }

    } catch (error) {
      console.error('Error saat mengunduh surat:', error);
      this.presentToast('Terjadi kesalahan saat mengunduh surat. Coba lagi.', 'danger');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert blob to base64.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  private triggerWebDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    this.presentToast('Surat berhasil diunduh ke folder Downloads Anda.', 'success');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000, // Tambah durasi agar pesan notifikasi tidak cepat hilang
      color,
      position: 'top',
    });
    await toast.present();
  }
}