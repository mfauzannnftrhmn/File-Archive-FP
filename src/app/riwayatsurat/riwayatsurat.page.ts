import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

// Definisikan tipe data untuk riwayat surat
interface Surat {
  title: string;
  suratNumber: string;
  date: string;
  time?: string; // Menambahkan properti time yang opsional
  status?: string; // Menambahkan properti status yang opsional
  distribusiProgress?: number;
  verifikasiProgress?: number;
  cetakProgress?: number;
}

@Component({
  standalone: false,
  selector: 'app-riwayatsurat',
  templateUrl: './riwayatsurat.page.html',
  styleUrls: ['./riwayatsurat.page.scss'],
})
export class RiwayatsuratPage {
  // Menentukan tipe data untuk riwayatSurat
  riwayatSurat: Surat[] = [];
  filterMode: string = 'all'; // Default filter mode

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadRiwayatSurat();
  }

  // Fungsi untuk memuat data riwayat surat
  loadRiwayatSurat() {
    // Mengambil data riwayat surat yang disimpan di localStorage
    const storedSurat = localStorage.getItem('riwayatSurat');
    this.riwayatSurat = storedSurat ? JSON.parse(storedSurat) : [];
    
    // Menambahkan waktu dan status jika belum ada
    this.riwayatSurat = this.riwayatSurat.map(surat => {
      if (!surat.time) {
        surat.time = this.getJakartaTime();
      }
      if (!surat.status) {
        surat.status = this.generateRandomStatus();
      }
      return surat;
    });
    
    // Update localStorage dengan data yang sudah memiliki waktu dan status
    localStorage.setItem('riwayatSurat', JSON.stringify(this.riwayatSurat));
  }

  // Fungsi untuk menghasilkan status acak untuk surat
  generateRandomStatus(): string {
    const statuses = ['Disetujui', 'Proses', 'Ditolak'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  }

  // Fungsi untuk mendapatkan status berdasarkan progress
  getStatusFromProgress(surat: Surat): string {
    if (!surat.distribusiProgress || !surat.verifikasiProgress || !surat.cetakProgress) {
      return this.generateRandomStatus();
    }
    
    const overallProgress = (surat.distribusiProgress + surat.verifikasiProgress + surat.cetakProgress) / 3;
    
    if (overallProgress < 0.3) return 'Ditolak';
    if (overallProgress < 0.8) return 'Proses';
    return 'Disetujui';
  }

  // Fungsi untuk mengatur mode filter
  setFilterMode(mode: string) {
    this.filterMode = mode;
    
    // Jika mode adalah 'all', hanya muat ulang data tanpa sorting
    if (mode === 'all') {
      this.loadRiwayatSurat();
    }
  }

  // Fungsi untuk mengurutkan surat berdasarkan yang terbaru
  sortByNewest() {
    this.filterMode = 'newest';
    this.riwayatSurat.sort((a, b) => {
      // Konversi tanggal dan waktu ke format yang bisa dibandingkan
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      
      // Urutkan dari yang terbaru (nilai terbesar) ke terlama
      return dateB.getTime() - dateA.getTime();
    });
    
    // Tampilkan toast konfirmasi
    this.toastController.create({
      message: 'Diurutkan berdasarkan terbaru',
      duration: 1500,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  }

  // Fungsi untuk mengurutkan surat berdasarkan yang terlama
  sortByOldest() {
    this.filterMode = 'oldest';
    this.riwayatSurat.sort((a, b) => {
      // Konversi tanggal dan waktu ke format yang bisa dibandingkan
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      
      // Urutkan dari yang terlama (nilai terkecil) ke terbaru
      return dateA.getTime() - dateB.getTime();
    });
    
    // Tampilkan toast konfirmasi
    this.toastController.create({
      message: 'Diurutkan berdasarkan terlama',
      duration: 1500,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  }

  // Fungsi untuk refresh data
  doRefresh(event: any) {
    setTimeout(() => {
      // Muat ulang data riwayat surat
      this.loadRiwayatSurat();
      
      // Tampilkan toast konfirmasi refresh
      this.toastController.create({
        message: 'Data berhasil diperbarui',
        duration: 1500,
        color: 'success',
        position: 'top'
      }).then(toast => toast.present());
      
      // Selesaikan event refresh
      event.target.complete();
    }, 1000);
  }

  // Fungsi untuk mendapatkan waktu Jakarta (GMT+7)
  getJakartaTime(): string {
    const now = new Date();
    
    // Mengatur timezone ke Asia/Jakarta (GMT+7)
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    // Format jam dan menit dengan leading zero jika perlu
    const hours = jakartaTime.getUTCHours().toString().padStart(2, '0');
    const minutes = jakartaTime.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  // Fungsi untuk mendapatkan warna berdasarkan status
  getStatusColor(status: string): string {
    switch(status) {
      case 'Disetujui': return 'success';
      case 'Proses': return 'primary';
      case 'Ditolak': return 'danger';
      default: return 'medium';
    }
  }

  // Fungsi untuk melihat status atau detail surat
  viewSuratDetails(surat: Surat) {
    // Pindah ke halaman status pengajuan
    this.router.navigate(['/statuspengajuan', { suratNumber: surat.suratNumber }]);
  }

  // Fungsi untuk menghapus surat tertentu berdasarkan index
  async deleteSurat(index: number) {
    // Tampilkan konfirmasi sebelum menghapus
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus surat ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: async () => {
            // Hapus surat dari array berdasarkan index
            this.riwayatSurat.splice(index, 1);
            
            // Update localStorage dengan data terbaru
            localStorage.setItem('riwayatSurat', JSON.stringify(this.riwayatSurat));
            
            // Tampilkan toast konfirmasi
            const toast = await this.toastController.create({
              message: 'Surat berhasil dihapus',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Fungsi untuk menghapus semua riwayat surat
  async clearAllHistory() {
    // Tampilkan konfirmasi sebelum menghapus semua riwayat
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus semua riwayat surat?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus Semua',
          handler: async () => {
            // Hapus data riwayat surat dari localStorage
            localStorage.removeItem('riwayatSurat');
            // Kosongkan array riwayatSurat
            this.riwayatSurat = [];
            
            // Tampilkan toast konfirmasi
            const toast = await this.toastController.create({
              message: 'Semua riwayat surat berhasil dihapus',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          }
        }
      ]
    });
    
    await alert.present();
  }
}
