import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  userName: string;
  notificationCount: number = 0;
  showNotifications: boolean = false;
  notifications: any[] = [];

  constructor(private toastController: ToastController) {
    // Ambil email dari localStorage
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      // Ambil bagian depan email (sebelum simbol @)
      const userEmailParts = storedEmail.split('@')[0];
      this.userName = this.capitalizeFirstLetter(userEmailParts); // Capitalize nama depan
    } else {
      this.userName = 'Pengguna'; // Default name
    }
  }

  ngOnInit() {
    // Initialization code if needed
    this.loadNotifications();
  }

  // Fungsi untuk capitalisasi huruf pertama
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Fungsi untuk refresh halaman
  doRefresh(event: any) {
    console.log('Memulai operasi refresh');

    // Simulasi loading data
    setTimeout(() => {
      // Refresh data yang diperlukan
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        const userEmailParts = storedEmail.split('@')[0];
        this.userName = this.capitalizeFirstLetter(userEmailParts);
      }
      
      // Refresh notifikasi
      this.loadNotifications();

      console.log('Operasi refresh selesai');
      event.target.complete();
    }, 2000);
  }

  // Fungsi untuk memuat notifikasi
  loadNotifications() {
    // Simulasi mendapatkan jumlah notifikasi dan data notifikasi
    this.notificationCount = Math.floor(Math.random() * 5); // Random 0-4 notifikasi
    
    // Buat data notifikasi dummy
    this.notifications = [];
    for (let i = 0; i < this.notificationCount; i++) {
      this.notifications.push({
        title: `Notifikasi ${i + 1}`,
        message: `Ini adalah pesan notifikasi ${i + 1}`,
        time: new Date().toLocaleTimeString(),
        read: false
      });
    }
  }

  // Fungsi untuk toggle popup notifikasi
  toggleNotificationPopup() {
    this.showNotifications = !this.showNotifications;
  }

  // Fungsi untuk menandai semua notifikasi sudah dibaca
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notificationCount = 0;
  }

  // Fungsi untuk membuka notifikasi
  async openNotifications() {
    if (this.notificationCount > 0) {
      const toast = await this.toastController.create({
        message: `Anda memiliki ${this.notificationCount} notifikasi baru`,
        duration: 2000,
        position: 'top',
        color: 'primary'
      });
      await toast.present();
      
      // Reset notifikasi setelah dibuka
      this.notificationCount = 0;
    } else {
      const toast = await this.toastController.create({
        message: 'Tidak ada notifikasi baru',
        duration: 2000,
        position: 'top',
        color: 'medium'
      });
      await toast.present();
    }
  }
}
