import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  userName: string = ''; // Inisialisasi string kosong
  notificationCount: number = 0;
  showNotifications: boolean = false;
  notifications: any[] = [];

  constructor(private toastController: ToastController) {
    this.setUserNameFromStorage();
  }

  ngOnInit() {
    this.loadNotifications();
  }

  setUserNameFromStorage() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      
      // [PERBAIKAN UTAMA]
      // Akses 'name' langsung dari objek currentUser, sesuai data dari login.
      if (currentUser && currentUser.name) {
        this.userName = currentUser.name;
      } else {
        this.userName = 'Pengguna'; // Fallback jika 'name' tidak ditemukan
      }
    } else {
      this.userName = 'Pengguna'; // Fallback jika tidak ada data login
    }
  }

  doRefresh(event: any) {
    console.log('Memulai operasi refresh');
    setTimeout(() => {
      // Panggil fungsi yang sama untuk me-refresh nama
      this.setUserNameFromStorage();
      
      this.loadNotifications();

      console.log('Operasi refresh selesai');
      event.target.complete();
    }, 1500); // Durasi bisa dipercepat
  }

  // ... Sisa fungsi lain tidak berubah ...

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
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notificationCount = 0;
  }

  async openNotifications() {
    const message = this.notificationCount > 0 
      ? `Anda memiliki ${this.notificationCount} notifikasi baru` 
      : 'Tidak ada notifikasi baru';
    const color = this.notificationCount > 0 ? 'primary' : 'medium';

    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
    
    this.notificationCount = 0;
  }
}