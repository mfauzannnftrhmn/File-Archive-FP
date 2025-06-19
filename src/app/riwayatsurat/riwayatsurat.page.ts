import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Surat {
  id: number;
  title: string;
  suratNumber: string;
  date: string;
  time?: string;
  status?: string;
  category: string;
  remarks?: string;
  file_url?: string; // <-- TAMBAHKAN BARIS INI
  attachment_path?: string; 
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
  filterMode: string = 'all';
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
  }

  downloadSurat(surat: Surat) {
  const newUrl = `https://simpap.my.id/storage/app/public/uploads/${surat.attachment_path}`;
  window.open(newUrl, '_blank');
}
  
  loadRiwayatSurat(event?: any) {
  const currentUser = localStorage.getItem('currentUser');
  const user = currentUser ? JSON.parse(currentUser) : null;
  const email = user?.email;
  const name = user?.name;

  if (!email || !name) {
    this.presentToast('Gagal mengambil data pengguna.', 'danger');
    return;
  }

  this.http.get<{ data: Surat[] }>(
    `${this.apiUrl}/riwayat-surat?email=${email}&name=${encodeURIComponent(name)}`
  ).subscribe({
    next: (response) => {
      this.originalRiwayatSurat = [...response.data];
      this.applyFilters();
      if (event) event.target.complete();
    },
    error: (err) => {
      console.error('Gagal mengambil data riwayat:', err);
      this.presentToast('Gagal memuat data. Coba lagi nanti.', 'danger');
      if (event) event.target.complete();
    }
  });
}



  setFilterMode(mode: string) {
    this.filterMode = mode;
    this.applyFilters();
  }

  filterByCategory() {
    console.log('Filter by Category clicked. Selected Category:', this.selectedCategory);
    this.applyFilters();
  }

  filterBySearch() {
    // --- DEBUGGING (bisa dihapus setelah masalah teratasi) ---
    console.log('Search term entered:', this.searchTerm);
    // --- END DEBUGGING ---
    this.applyFilters();
  }

  applyFilters() {
    let filteredData = [...this.originalRiwayatSurat];

    // --- DEBUGGING (bisa dihapus setelah masalah teratasi) ---
    console.log('--- APPLYING FILTERS ---');
    console.log('Initial data count:', filteredData.length);
    console.log('Selected Category:', this.selectedCategory);
    console.log('Search Term:', this.searchTerm);
    console.log('Filter Mode:', this.filterMode);
    // --- END DEBUGGING ---


    // 1. Filter berdasarkan kategori
     if (this.selectedCategory !== 'all') {
      const lowerCaseSelectedCategory = this.normalizeString(this.selectedCategory);
      console.log('Category filter active. Comparing with normalized:', `'${lowerCaseSelectedCategory}'`);

      filteredData = filteredData.filter(surat => {
        // --- INI YANG AKAN KITA FOKUSKAN ---
        const suratCategoryProcessed = surat.category ? this.normalizeString(surat.category) : '';
        const match = suratCategoryProcessed === lowerCaseSelectedCategory;

        console.log(`  Item ID: ${surat.id}, Title: '${surat.title}', API Category: '${surat.category}', Normalized API Category: '${suratCategoryProcessed}', Filter Value: '${lowerCaseSelectedCategory}', Match: ${match}`);
        // --- END FOKUS ---

        return match;
      });
      console.log('After category filter, data count:', filteredData.length);
    }
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = this.normalizeString(this.searchTerm);
      console.log('Search filter active. Searching for normalized:', `'${lowerCaseSearchTerm}'`);
      filteredData = filteredData.filter(surat => {
        const suratTitleProcessed = surat.title ? this.normalizeString(surat.title) : '';
        const match = suratTitleProcessed.includes(lowerCaseSearchTerm);
        return match;
      });
      console.log('After search filter, data count:', filteredData.length);
    }

    // 3. Urutkan berdasarkan mode waktu (setelah filtering)
    if (this.filterMode === 'newest') {
      filteredData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (this.filterMode === 'oldest') {
      filteredData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
    }

    // --- DEBUGGING ---
    console.log('Final data count to display:', filteredData.length);
    console.log('Final data to display:', filteredData); // Lihat data yang akan ditampilkan
    // --- END DEBUGGING ---

    this.riwayatSurat = filteredData;
  }

  // --- Fungsi Baru: Normalisasi String ---
  private normalizeString(str: string): string {
    return str
      .normalize('NFD') // Normalisasi Unicode (mengurai karakter seperti é menjadi e + ´)
      .replace(/[\u0300-\u036f]/g, '') // Menghapus diacritics (tanda aksen, dll.)
      .toLowerCase() // Mengubah ke huruf kecil
      .replace(/\s+/g, ' ') // Mengganti satu atau lebih spasi dengan satu spasi tunggal
      .trim(); // Menghapus spasi di awal/akhir
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
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus surat ini?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          handler: () => {
            this.http
              .delete(`${this.apiUrl}/riwayat-surat/${suratId}`)
              .subscribe({
                next: () => {
                  this.originalRiwayatSurat = this.originalRiwayatSurat.filter(s => s.id !== suratId);
                  this.presentToast('Surat berhasil dihapus', 'success');
                  this.applyFilters();
                },
                error: (err) => {
                  console.error('Gagal menghapus surat:', err);
                  this.presentToast(
                    err.error.message || 'Gagal menghapus surat.',
                    'danger'
                  );
                },
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async clearAllHistory() {
    const alert = await this.alertController.create({
      header: 'Hapus Semua Riwayat',
      message: 'Apakah Anda yakin ingin menghapus semua riwayat surat? Tindakan ini tidak dapat dibatalkan.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus Semua',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.http.delete(`${this.apiUrl}/riwayat-surat/clear-all`).subscribe({
              next: () => {
                this.riwayatSurat = [];
                this.originalRiwayatSurat = [];
                this.selectedCategory = 'all';
                this.searchTerm = '';
                this.presentToast('Semua riwayat berhasil dihapus', 'success');
              },
              error: (err) => {
                console.error('Gagal menghapus semua riwayat:', err);
                this.presentToast('Gagal menghapus riwayat.', 'danger');
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