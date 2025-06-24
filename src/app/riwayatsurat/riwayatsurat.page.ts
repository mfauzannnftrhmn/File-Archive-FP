import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '@capacitor/local-notifications';
// --- IMPORT PLUGIN CAPACITOR ---
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
// --- AKHIR IMPORT PLUGIN CAPACITOR ---

interface Surat {
  id: number;
  title: string;
  suratNumber: string;
  date: string;
  time?: string;
  status?: string; // Pastikan ini ada dan berisi 'Disetujui', 'proses', 'ditolak' (huruf kecil)
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
  selector: 'app-riwayatsurat',
  templateUrl: './riwayatsurat.page.html',
  styleUrls: ['./riwayatsurat.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class RiwayatsuratPage implements OnInit {
  riwayatSurat: Surat[] = [];
  originalRiwayatSurat: Surat[] = [];
  filterMode: string = 'newest';
  selectedCategory: string = 'all';
  searchTerm: string = '';

  availableCategories: string[] = [
    'all',
    'Pengajuan Keluhan',
    'Surat Rekomendasi',
    'Permohonan Cuti',
    'Surat Keterangan Karyawan'
  ];

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadRiwayatSurat();
    this.requestNotificationPermissions(); 
    this.createNotificationChannel();
  }

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
 async createNotificationChannel() {
    if (Capacitor.isNativePlatform()) {
      try {
        const channel: Channel = {
          id: 'download_notifications', // Harus cocok dengan channelId di notifikasi
          name: 'Unduhan File',
          description: 'Notifikasi untuk unduhan dokumen yang selesai',
          importance: 5, // 5 = High (make sound and pop on screen)
          vibration: true,
          sound: 'notif', // Nama file suara Android (tanpa ekstensi) untuk channel ini
          visibility: 1, // 1 = NotificationVisibility.Public
          lights: true,
          lightColor: '#FF0000', // Red
        };
        await LocalNotifications.createChannel(channel);
        console.log('Notification channel "download_notifications" created.');
      } catch (e) {
        console.error('Error creating notification channel:', e);
      }
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

  private triggerWebDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    this.presentToast('Surat berhasil diunduh ke folder Downloads Anda.', 'success');
  }

  async downloadSurat(surat: Surat) {
    if (surat.status !== 'Disetujui') {
      this.presentToast('Surat belum Disetujui, tidak bisa diunduh.', 'warning');
      return;
    }

    if (!surat.id) {
      this.presentToast('ID surat tidak tersedia.', 'danger');
      return;
    }

    const currentUser = localStorage.getItem('currentUser');
    const user = currentUser ? JSON.parse(currentUser) : null;
    const token = user?.token;

    if (!token) {
      this.presentToast('Autentikasi diperlukan untuk mengunduh. Silakan login kembali.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    const downloadUrl = `${this.apiUrl}/pengajuan-surats/${surat.id}/download`;
    const fileName = `surat_${surat.category.toLowerCase().replace(/\s/g, '_')}_${surat.suratNumber || surat.id}_Disetujui.pdf`;

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

          let displayLocation = '';
          if (Capacitor.getPlatform() === 'ios') {
            displayLocation = 'aplikasi "Files" Anda (di bawah "Di iPhone Saya" / "Di iPad Saya" -> "Simpap")';
          } else { // Android
            displayLocation = 'folder "Documents" di penyimpanan internal ponsel Anda (cari folder "Simpap")';
          }
          this.presentToast(`Surat berhasil disimpan di ${displayLocation}.`, 'success');
          console.log(`File berhasil disimpan ke: ${targetDirectory}/${fullPath}`);

          // --- PENTING: JADWALKAN NOTIFIKASI LOKAL DI SINI ---
          // ... (di dalam async downloadSurat function, setelah Filesystem.writeFile berhasil) ...

          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Unduhan Selesai!',
                body: `Surat "${fileName}" berhasil diunduh dan disimpan di ${displayLocation}.`,
                id: surat.id,
                schedule: { at: new Date(Date.now() + 100) },
                sound: Capacitor.getPlatform() === 'android' ? 'notif' : 'notif.mp3', // SESUAIKAN DENGAN NAMA FILE SUARA ANDA
                attachments: [
                  // --- BARIS YANG DIPERBAIKI ---
                  { id: fileName, url: (await Filesystem.getUri({ directory: targetDirectory, path: fullPath })).uri } // Hapus `file://` tambahan di sini
                ],
                extra: {
                  filePath: fullPath,
                  directory: targetDirectory,
                }
              }
            ]
          });

// ... (sisa kode fungsi downloadSurat) ...
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

  async loadRiwayatSurat(event?: any) {
    // ... (fungsi ini tetap sama seperti kode Anda sebelumnya) ...
    const currentUser = localStorage.getItem('currentUser');
    const user = currentUser ? JSON.parse(currentUser) : null;
    const token = user?.token;
    const email = user?.email;
    const name = user?.name;

    if (!email || !name || !token) { 
      this.presentToast('Data pengguna atau autentikasi tidak lengkap. Silakan login kembali.', 'danger');
      if (event) event.target.complete();
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const url = `${this.apiUrl}/riwayat-surat?email=${email}&name=${encodeURIComponent(name)}`;

    this.http.get<{ data: Surat[] }>(url, { headers: headers }).subscribe({
      next: (response) => {
        this.originalRiwayatSurat = response.data;
        console.log('Data received from backend:', this.originalRiwayatSurat);
        this.applyFilters();
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Gagal mengambil data riwayat:', err);
        this.presentToast(err.error?.message || 'Gagal memuat data. Coba lagi nanti.', 'danger');
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  setFilterMode(mode: string) {
    this.filterMode = mode;
    this.applyFilters();
  }

  filterByCategory() {
    this.applyFilters();
  }

  filterBySearch() {
    this.applyFilters();
  }

  applyFilters() {
    // ... (fungsi ini tetap sama seperti kode Anda sebelumnya) ...
    let filteredData = [...this.originalRiwayatSurat];

    if (this.selectedCategory !== 'all') {
      const lowerCaseSelectedCategory = this.normalizeString(this.selectedCategory);
      filteredData = filteredData.filter(surat => {
        const suratCategoryProcessed = surat.category ? this.normalizeString(surat.category) : '';
        return suratCategoryProcessed === lowerCaseSelectedCategory;
      });
    }

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = this.normalizeString(this.searchTerm);
      filteredData = filteredData.filter(surat => {
        const suratTitleProcessed = surat.title ? this.normalizeString(surat.title) : '';
        const suratNumberProcessed = surat.suratNumber ? this.normalizeString(surat.suratNumber) : '';
        return suratTitleProcessed.includes(lowerCaseSearchTerm) || suratNumberProcessed.includes(lowerCaseSearchTerm);
      });
    }

    if (this.filterMode === 'newest') {
      filteredData.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (this.filterMode === 'oldest') {
      filteredData.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
    }

    this.riwayatSurat = filteredData;
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  sortByNewest() {
    this.setFilterMode('newest');
  }

  sortByOldest() {
    this.setFilterMode('oldest');
  }

  doRefresh(event: any) {
    this.loadRiwayatSurat(event);
  }

  async deleteSurat(suratId: number, index: number) {
    // ... (fungsi ini tetap sama seperti kode Anda sebelumnya) ...
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus surat ini?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          handler: async () => {
            const currentUser = localStorage.getItem('currentUser');
            const user = currentUser ? JSON.parse(currentUser) : null;
            const token = user?.token;

            if (!token) {
              this.presentToast('Autentikasi diperlukan. Silakan login kembali.', 'danger');
              this.router.navigate(['/login']);
              return;
            }

            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

            this.http
              .delete(`${this.apiUrl}/riwayat-surat/${suratId}`, { headers: headers })
              .subscribe({
                next: () => {
                  this.originalRiwayatSurat = this.originalRiwayatSurat.filter(s => s.id !== suratId);
                  this.presentToast('Surat berhasil dihapus', 'success');
                  this.applyFilters();
                },
                error: (err) => {
                  console.error('Gagal menghapus surat:', err);
                  this.presentToast(
                    err.error?.message || 'Gagal menghapus surat.',
                    'danger'
                  );
                  if (err.status === 401) {
                    this.router.navigate(['/login']);
                  }
                },
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async clearAllHistory() {
    // ... (fungsi ini tetap sama seperti kode Anda sebelumnya) ...
    const alert = await this.alertController.create({
      header: 'Hapus Semua Riwayat',
      message: 'Apakah Anda yakin ingin menghapus semua riwayat surat? Tindakan ini tidak dapat dibatalkan.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus Semua',
          cssClass: 'alert-button-danger',
          handler: async () => {
            const currentUser = localStorage.getItem('currentUser');
            const user = currentUser ? JSON.parse(currentUser) : null;
            const token = user?.token;

            if (!token) {
              this.presentToast('Autentikasi diperlukan. Silakan login kembali.', 'danger');
              this.router.navigate(['/login']);
              return;
            }

            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

            this.http.delete(`${this.apiUrl}/riwayat-surat/clear-all`, { headers: headers }).subscribe({
              next: () => {
                this.riwayatSurat = [];
                this.originalRiwayatSurat = [];
                this.selectedCategory = 'all';
                this.searchTerm = '';
                this.presentToast('Semua riwayat berhasil dihapus', 'success');
              },
              error: (err) => {
                console.error('Gagal menghapus semua riwayat:', err);
                this.presentToast(err.error?.message || 'Gagal menghapus riwayat.', 'danger');
                if (err.status === 401) {
                  this.router.navigate(['/login']);
                }
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}