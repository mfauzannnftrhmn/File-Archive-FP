import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '@capacitor/local-notifications';
// --- IMPORT PLUGIN CAPACITOR ---
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { CapacitorHttp } from '@capacitor/core';
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
  source?: string;
  jenis_surat?: string; // ✅ Tambahkan ini
  keterangan?: string;
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

    'Surat Keterangan Karyawan',
    'Surat Arsip'

  ];



  private apiUrl = environment.apiUrl;



  constructor(

    private http: HttpClient,

    private router: Router,

    private toastController: ToastController,

    private alertController: AlertController,

  private platform: Platform,

  ) {}



  ngOnInit() {

    this.loadRiwayatSurat();

    this.requestNotificationPermissions();

    this.createNotificationChannel();

  }



async requestNotificationPermissions() {

  const targetDirectory = 'path/to/directory';

  const subfolder = 'my-subfolder'; // declare and assign a value to subfolder

  if (Capacitor.isNativePlatform()) {

    console.log(`Mencoba membuat direktori: ${targetDirectory}/${subfolder}`);

    try {

      await Filesystem.mkdir({

  path: subfolder,

  directory: Directory.Documents,

  recursive: true

});

      console.log(`Direktori ${subfolder} berhasil dibuat atau sudah ada di ${targetDirectory}.`);

    } catch (dirError: any) {

      if (!dirError.message.includes('Path exists')) {

        console.warn(`Gagal membuat direktori ${subfolder} di ${targetDirectory}:`, dirError);

      }

    }

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

private arrayBufferToBase64(arrayBuffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert array buffer to base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(new Blob([arrayBuffer]));
  });
}
async downloadSurat(surat: Surat) {
  const isArsip = surat.category === 'Arsip';
  const isApproved = surat.status?.toLowerCase() === 'disetujui';

  const fileName = isArsip
    ? (surat.title || `surat_${surat.id}.docx`)
    : `surat_${surat.category.toLowerCase().replace(/\s/g, '_')}_${surat.suratNumber || surat.id}_Disetujui.pdf`;

  let fileUrl = surat.file_url;

  if (isArsip) {
    if (!fileUrl) {
      this.presentToast('URL file tidak tersedia.', 'danger');
      return;
    }

    const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/') + 1);
    const rawFileName = decodeURIComponent(fileUrl.split('/').pop()!).replace(/\+/g, ' ');
    fileUrl = baseUrl + encodeURIComponent(rawFileName);

    const isWeb = Capacitor.getPlatform() === 'web';

    if (isWeb) {
      // ✅ FIX UTAMA: Hindari fetch saat di web karena CORS
      window.open(fileUrl, '_blank');
      this.presentToast('File arsip sedang dibuka di tab baru.', 'success');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        this.presentToast('Mengunduh file arsip...', 'primary');

        const response = await CapacitorHttp.get({
  url: fileUrl,
  responseType: 'arraybuffer'
});

        const base64Data = await this.arrayBufferToBase64(response.data);
        const subfolder = 'Simpap';
        const fullPath = `${subfolder}/${fileName}`;
        let targetDirectory = Directory.Documents;

        try {
          await Filesystem.writeFile({
            path: fullPath,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
          });
        } catch (e: any) {
          if (e.message.includes('EACCES')) {
            console.warn('Akses Documents ditolak. Menggunakan Directory.Data.');
            targetDirectory = Directory.Data;
            await Filesystem.writeFile({
              path: fullPath,
              data: base64Data,
              directory: targetDirectory,
              recursive: true
            });
          } else {
            throw e;
          }
        }

        try {
          await Filesystem.mkdir({
            path: subfolder,
            directory: targetDirectory,
            recursive: true
          });
        } catch (e: any) {
          if (!e.message.includes('exists')) {
            console.warn('Gagal membuat folder:', e);
          }
        }

        const uri = (await Filesystem.getUri({ directory: targetDirectory, path: fullPath })).uri;
        const location = Capacitor.getPlatform() === 'ios'
          ? 'aplikasi "Files" > Di iPhone/iPad Saya > Simpap'
          : targetDirectory === Directory.Documents
            ? 'penyimpanan internal > Documents > Simpap'
            : 'penyimpanan internal aplikasi (folder pribadi)';

        this.presentToast(`Surat berhasil disimpan di ${location}.`, 'success');

        await LocalNotifications.schedule({
          notifications: [{
            id: surat.id || Date.now(),
            title: 'Unduhan Selesai!',
            body: `Surat "${fileName}" berhasil diunduh.`,
            schedule: { at: new Date(Date.now() + 100) },
            attachments: [{
              id: fileName,
              url: `file://${uri}`
            }],
            extra: { filePath: fullPath, directory: targetDirectory }
          }]
        });

        return;
      } catch (error) {
        console.error('Gagal mengunduh file arsip:', error);
        this.presentToast('Gagal mengunduh file arsip.', 'danger');
        return;
      }
    }

  } else {
    // Untuk surat yang memerlukan token
    if (!isApproved) {
      this.presentToast('Surat belum Disetujui, tidak bisa diunduh.', 'warning');
      return;
    }

    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? JSON.parse(currentUser).token : null;
    if (!token) {
      this.presentToast('Autentikasi diperlukan untuk mengunduh. Silakan login kembali.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    fileUrl = `${this.apiUrl}/pengajuan-surats/${surat.id}/download`;

    try {
      this.presentToast('Memulai unduhan surat...', 'primary');

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = `Gagal mengunduh surat: ${response.status}`;
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (_) { }
        this.presentToast(errorMsg, 'danger');
        return;
      }

      const blob = await response.blob();

      if (Capacitor.isNativePlatform()) {
        const base64Data = await this.blobToBase64(blob);
        const subfolder = 'Simpap';
        const fullPath = `${subfolder}/${fileName}`;
        let targetDirectory = Directory.Documents;

        try {
          await Filesystem.writeFile({
            path: fullPath,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
          });
        } catch (e: any) {
          if (e.message.includes('EACCES')) {
            targetDirectory = Directory.Data;
            await Filesystem.writeFile({
              path: fullPath,
              data: base64Data,
              directory: targetDirectory,
              recursive: true
            });
          } else {
            throw e;
          }
        }

        const uri = (await Filesystem.getUri({ directory: targetDirectory, path: fullPath })).uri;

        await LocalNotifications.schedule({
          notifications: [{
            id: surat.id || Date.now(),
            title: 'Unduhan Selesai!',
            body: `Surat "${fileName}" berhasil diunduh.`,
            schedule: { at: new Date(Date.now() + 100) },
            attachments: [{
              id: fileName,
              url: `file://${uri}`
            }],
            extra: { filePath: fullPath, directory: targetDirectory }
          }]
        });

        this.presentToast('Surat berhasil disimpan.', 'success');

      } else {
        this.triggerWebDownload(blob, fileName);
      }

    } catch (error) {
      console.error('Unduhan gagal:', error);
      this.presentToast('Terjadi kesalahan saat mengunduh surat.', 'danger');
    }
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

   if (lowerCaseSelectedCategory === 'surat arsip') {
      return suratCategoryProcessed === 'arsip';
    }

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