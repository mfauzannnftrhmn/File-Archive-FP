import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  // --- Variabel untuk Data Pengguna ---
  userName: string = '';

  // --- Variabel untuk Statistik Surat ---
  suratDiajukan: number = 0;
  suratDisetujui: number = 0;
  suratDitolak: number = 0;
  isLoadingStats: boolean = true; // State loading khusus untuk statistik

  // --- Variabel untuk Informasi Admin ---
  adminInfo: any[] = [];
  isInfoLoading: boolean = true; // State loading khusus untuk info admin

  // --- Variabel untuk Notifikasi (Contoh) ---
  notificationCount: number = 0;
  showNotifications: boolean = false;
  notifications: any[] = [];

  constructor(
    private toastController: ToastController,
    private apiService: ApiService,
    private router: Router
  ) {
    this.setUserNameFromStorage();
  }

  ngOnInit() {
    this.loadAllData();
  }

  // Fungsi untuk memuat semua data saat halaman dibuka atau di-refresh
 loadAllData() {
  this.isLoadingStats = true;
  this.isInfoLoading = true;

  // Ambil email dan nama dari localStorage
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const email = currentUser?.email;
  const name = currentUser?.name;

  if (!email || !name) {
    console.error('Email atau nama tidak ditemukan di localStorage');
    this.presentToast('Gagal memuat data: pengguna tidak ditemukan.', 'danger');
    this.isLoadingStats = false;
    this.isInfoLoading = false;
    return;
  }

  forkJoin({
    stats: this.apiService.getSuratStats(email, name), // ✅ perbaiki ini
    info: this.apiService.getAdminInfo()
  }).subscribe({
    next: ({ stats, info }) => {
      if (stats) {
        this.suratDiajukan = parseInt(stats.diajukan as any, 10) || 0;
        this.suratDisetujui = parseInt(stats.disetujui as any, 10) || 0;
        this.suratDitolak = parseInt(stats.ditolak as any, 10) || 0;
      }

      if (info?.success) {
        this.adminInfo = info.data;
      }

      this.isLoadingStats = false;
      this.isInfoLoading = false;
    },
    error: (err) => {
      console.error('Gagal memuat data dashboard', err);
      this.presentToast('Gagal memuat data dashboard.', 'danger');
      this.isLoadingStats = false;
      this.isInfoLoading = false;
    }
  });
}

  // Fungsi refresh "pull-to-refresh"
  doRefresh(event: any) {
    console.log('Memulai operasi refresh');
    this.loadAllData();

    setTimeout(() => {
      console.log('Operasi refresh selesai');
      event.target.complete();
    }, 1500);
  }
  
  // Fungsi untuk menangani aksi klik pada item informasi
  handleInfoClick(infoItem: any) {
    console.log('Info item clicked:', infoItem);
    this.presentToast(`Info: ${infoItem.judul}`, 'primary');
  }

  // Mengambil nama pengguna dari localStorage
  setUserNameFromStorage() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      this.userName = currentUser?.name || 'Pengguna';
    } else {
      this.userName = 'Pengguna';
    }
  }

  // Menampilkan pesan toast
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'top',
      color: color,
    });
    await toast.present();
  }

  // --- Fungsi Notifikasi Dummy (Tidak berubah) ---
  loadNotifications() {
    this.notificationCount = Math.floor(Math.random() * 5);
    this.notifications = [];
    for (let i = 0; i < this.notificationCount; i++) {
      this.notifications.push({
        title: `Notifikasi ${i + 1}`,
        message: `Ini adalah pesan notifikasi ${i + 1}.`,
        time: new Date().toLocaleTimeString(),
        read: false
      });
    }
  }

  toggleNotificationPopup() {
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead() {
    this.notifications.forEach(notification => notification.read = true);
    this.notificationCount = 0;
  }
}
