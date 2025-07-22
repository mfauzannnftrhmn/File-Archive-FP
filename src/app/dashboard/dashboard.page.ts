// dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { APP_VERSION } from '../app-version'; // Pastikan path ini benar
// --- IMPORTS UNTUK NOTIFIKASI LOKAL (JIKA MAU TAMPILKAN POPUP NOTIF) ---
import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';


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
  // --- Variabel baru untuk Pembaruan Aplikasi ---
  currentAppVersion: string = APP_VERSION; // Versi aplikasi saat ini dari app-version.ts
  latestAppVersion: string = ''; // Versi aplikasi terbaru yang diambil dari server
  showUpdatePrompt: boolean = false; // Kontrol visibilitas prompt pembaruan
  updateMessage: string = ''; // Pesan yang akan ditampilkan di prompt pembaruan
  downloadUpdateUrl: string = ''; // URL unduhan pembaruan dari server
 notificationCount: number = 0; // Jumlah notifikasi yang belum dibaca
  showNotifications: boolean = false; // Untuk kontrol popup notifikasi (jika ada di HTML)
  notifications: any[] = []; // Array untuk menyimpan notifikasi dari backend
  isNotificationsLoading: boolean = true; // State loading untuk notifikasi

    constructor(
    private toastController: ToastController,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController, // <<< Injeksi AlertController
    private platform: Platform,
    private navCtrl: NavController
  ) {
    this.setUserNameFromStorage();
  }
goToChatWithAdminTemplate() {
  const userStr = localStorage.getItem('currentUser');
  let userEmail = '(email kamu)'; // default kalau tidak ada user

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.email) {
        userEmail = user.email; // ambil email user
      }
    } catch (error) {
      console.error('Gagal parsing currentUser dari localStorage:', error);
    }
  }

  // Kirim param "presetMessage" ke /chat
  this.navCtrl.navigateForward('/chat', {
    queryParams: {
      presetMessage: `!admin\nemail = ${userEmail}\nAlasan = Masukan Alasan menhubungi admin`
    }
  });
}

    ngOnInit() {
    this.loadAllData();
    this.checkForUpdate();
    this.reportUserVersion();
    this.loadUserNotifications(); // <<< MEMUAT NOTIFIKASI SAAT DASHBOARD DIMUAT
    this.createNotificationChannel(); 
     // --- PENTING: Menangani klik notifikasi dari notifikasi bar ponsel ---
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        console.log('Notifikasi di bar ponsel diklik:', notificationAction);
        const notificationId = notificationAction.notification.id;
        // Tandai sebagai dibaca di backend jika notifikasi berasal dari sistem kita
        if (notificationAction.notification.extra && notificationAction.notification.extra.notification_id) {
          this.apiService.markNotificationAsRead(notificationAction.notification.extra.notification_id).subscribe({
            next: () => {
              console.log(`Notifikasi ID ${notificationAction.notification.extra.notification_id} ditandai dibaca.`);
              this.loadUserNotifications(); // Refresh daftar notifikasi di dashboard
            },
            error: (err) => console.error('Gagal menandai notifikasi backend sebagai dibaca:', err)
          });
        }
        // Arahkan ke Riwayat Surat
        this.router.navigate(['/riwayatsurat']);
        // Tutup popup notifikasi di dashboard jika sedang terbuka
        this.showNotifications = false;
      });
    }
  }
// --- FUNGSI BARU INI HARUS BERADA DI DALAM KELAS DashboardPage ---
  handleNotificationClick(notification: any) {
    if (!notification.read) {
      this.apiService.markNotificationAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.notificationCount--;
          console.log(`Notifikasi ID ${notification.id} ditandai dibaca.`);
        },
        error: (err) => {
          console.error('Gagal menandai notifikasi sebagai dibaca:', err);
          this.presentToast('Gagal menandai notifikasi sebagai dibaca.', 'danger');
        }
      });
    }
    this.router.navigate(['/riwayatsurat']);
    this.showNotifications = false;
  }
  // --- AKHIR DARI FUNGSI BARU YANG HARUS ADA DI DALAM KELAS ---

  // Fungsi untuk memuat semua data saat halaman dibuka atau di-refresh
  loadAllData() {
    this.isLoadingStats = true;
    this.isInfoLoading = true;

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const email = currentUser?.email;
    const name = currentUser?.name;

    if (!email || !name) {
      console.error('Email atau nama tidak ditemukan di localStorage');
      this.presentToast('Gagal memuat data: pengguna tidak ditemukan.', 'danger');
      this.isLoadingStats = false;
      this.isInfoLoading = false;
      this.router.navigate(['/login']); // Redirect jika data user tidak lengkap
      return;
    }

    forkJoin({
      stats: this.apiService.getSuratStats(email, name),
      info: this.apiService.getAdminInfo(),
      // Tambahkan panggilan notifikasi ke forkJoin
      notifications: this.apiService.getUserNotifications() // <<< TAMBAH INI
    }).subscribe({
      next: ({ stats, info, notifications }) => { // <<< Tambahkan 'notifications'
        if (stats) {
          this.suratDiajukan = parseInt(stats.diajukan as any, 10) || 0;
          this.suratDisetujui = parseInt(stats.disetujui as any, 10) || 0;
          this.suratDitolak = parseInt(stats.ditolak as any, 10) || 0;
        }

        if (info?.success) {
          this.adminInfo = info.data;
        }

        // Tangani data notifikasi
        if (notifications?.success) {
          this.notifications = notifications.data;
          this.notificationCount = notifications.unread_count; // Ambil jumlah belum dibaca
        }

        this.isLoadingStats = false;
        this.isInfoLoading = false;
        this.isNotificationsLoading = false; // Set loading notifikasi selesai
      },
      error: (err) => {
        console.error('Gagal memuat data dashboard', err);
        this.presentToast('Gagal memuat data dashboard.', 'danger');
        this.isLoadingStats = false;
        this.isInfoLoading = false;
        this.isNotificationsLoading = false; // Set loading notifikasi selesai
        // Tangani 401 Unauthorized secara global jika perlu
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }


 loadUserNotifications() {
    this.isNotificationsLoading = true;
    this.apiService.getUserNotifications().subscribe({
      next: (response) => {
        if (response?.success) {
          this.notifications = response.data;
          this.notificationCount = response.unread_count;
          // Opsional: Tampilkan notifikasi di bar notifikasi jika ada yang baru
          this.displayNewNotifications(response.data);
        }
        this.isNotificationsLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat notifikasi pengguna:', err);
        this.isNotificationsLoading = false;
      }
    });
  }


   async displayNewNotifications(notifications: any[]) {
    if (Capacitor.isNativePlatform()) {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        // Cek apakah notifikasi ini sudah pernah ditampilkan agar tidak duplikat
        // Anda mungkin perlu menyimpan ID notifikasi yang sudah ditampilkan di localStorage
        // Untuk demo, kita asumsikan semua notifikasi unread adalah "baru" untuk ditampilkan
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title,
              body: notification.message,
              id: notification.id, // Gunakan ID notifikasi dari backend sebagai ID lokal
              channelId: 'app_notifications', // Channel khusus untuk notifikasi umum aplikasi
              schedule: { at: new Date(Date.now() + 100) }, // Tampilkan segera
              sound: undefined, // Default sound
              extra: {
                notification_id: notification.id,
                type: notification.type,
                data: notification.data // Data tambahan dari backend
              }
            }
          ]
        });
        // Opsional: Tandai notifikasi sebagai "dibaca" setelah ditampilkan
        this.apiService.markNotificationAsRead(notification.id).subscribe();
      }
    }
  }

  // --- FUNGSI BARU: Membuat Channel Notifikasi Android ---
  async createNotificationChannel() {
    if (Capacitor.isNativePlatform() && this.platform.is('android')) {
      try {
        const channel: Channel = {
          id: 'app_notifications', // Harus cocok dengan channelId di notifikasi
          name: 'Notifikasi Umum Aplikasi',
          description: 'Pemberitahuan penting dari aplikasi',
          importance: 4, // Default: 4 = High (makes sound, but might not pop on screen)
          vibration: true,
          sound: undefined, // Menggunakan sound default OS untuk channel ini
        };
        await LocalNotifications.createChannel(channel);
        console.log('Notification channel "app_notifications" created.');
      } catch (e) {
        console.error('Error creating notification channel:', e);
      }
    }
  }

  /**
   * Fungsi untuk memeriksa pembaruan aplikasi dari server.
   * Membandingkan versi saat ini dengan versi terbaru yang tersedia.
   */
  checkForUpdate() {
  console.log('Mengecek pembaruan aplikasi...');
  this.apiService.getLatestAppVersion().subscribe({
    next: (response: any) => {
      if (response && response.latestVersion) {
        this.latestAppVersion = response.latestVersion;
        this.downloadUpdateUrl = response.downloadUrl;
        console.log(`Versi saat ini: ${this.currentAppVersion}, Versi terbaru: ${this.latestAppVersion}`);

        if (this.compareVersions(this.latestAppVersion, this.currentAppVersion)) {
          this.showUpdatePrompt = true;
          this.updateMessage = `Pembaruan tersedia! V. ${this.latestAppVersion}`;
          this.presentToast(`Pembaruan tersedia ke versi ${this.latestAppVersion}!`, 'warning');
        } else {
          console.log('Aplikasi sudah versi terbaru.');
        }
      } else {
        console.warn('Respon API untuk versi terbaru tidak valid atau kosong.');
      }
    },
    error: (err) => {
      if (
        err.status === 200 &&
        typeof err.error === 'string' &&
        err.error.startsWith('PK')
      ) {
        console.warn('Server mengembalikan file, bukan JSON. Pastikan endpoint check-update adalah JSON.');
        this.presentToast('Format response pembaruan tidak valid.', 'danger');
      } else {
        console.error('Gagal mendapatkan versi terbaru dari server:', err);
        this.presentToast('Gagal cek pembaruan aplikasi.', 'danger');
      }
    }
  });
}
checkIfAppIsLatestVersion() {
  this.apiService.getLatestAppVersion().subscribe({
    next: (response: any) => {
      if (response && response.latestVersion) {
        const latest = response.latestVersion;
        const current = this.currentAppVersion;

        if (this.compareVersions(latest, current)) {
          console.log("Aplikasi BELUM diperbarui.");
          localStorage.setItem('appIsLatest', 'false');
        } else {
          console.log("Aplikasi SUDAH versi terbaru.");
          localStorage.setItem('appIsLatest', 'true');
        }
      }
    },
    error: (err) => {
      console.error("Gagal mengecek versi terbaru", err);
    }
  });
}
reportUserVersion() {
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  if (!currentUser?.email || !currentUser?.name) return;

  console.log('📤 Mengirim versi aplikasi pengguna:');
console.log('Email:', currentUser.email);
console.log('Name:', currentUser.name);
console.log('APP_VERSION saat ini:', this.currentAppVersion);

this.apiService.sendUserAppVersion(
  currentUser.email,
  currentUser.name,
  this.currentAppVersion
).subscribe({
  next: () => {
    console.log('✅ Versi aplikasi pengguna berhasil dikirim.');
  },
  error: (err) => {
    console.error('❌ Gagal kirim versi aplikasi:', err);
  }
});

}

  /**
   * Fungsi untuk membandingkan dua string versi (format X.Y.Z).
   * Mengembalikan true jika 'latest' lebih baru dari 'current'.
   * @param latest Versi terbaru (string).
   * @param current Versi saat ini (string).
   * @returns True jika versi terbaru lebih tinggi, false jika tidak.
   */
  compareVersions(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;

      if (l > c) {
        return true;
      }
      if (l < c) {
        return false;
      }
    }
    return false;
  }

  /**
   * Menangani aksi klik pada tombol 'Update Sekarang'.
   * Di sini Anda akan mengimplementasikan unduhan langsung.
   */
  navigateToUpdate() {
    if (this.downloadUpdateUrl) {
      console.log('Mencoba mengunduh dari:', this.downloadUpdateUrl);
      
      // Membuat elemen anchor tersembunyi untuk memicu unduhan
      const link = document.createElement('a');
      link.href = this.downloadUpdateUrl;
      link.target = '_blank'; // Membuka di tab/jendela baru
      link.download = `simpap.apk`; // Menentukan nama file yang ingin diunduh

      document.body.appendChild(link);
      link.click(); // Memicu klik untuk memulai unduhan
      document.body.removeChild(link); // Hapus elemen setelah unduhan dimulai

      this.presentToast('Memulai unduhan pembaruan...', 'primary');
    } else {
      this.presentToast('Tautan unduhan tidak tersedia.', 'danger');
    }
    this.dismissUpdatePrompt(); // Sembunyikan prompt setelah klik
  }

  /**
   * Fungsi untuk menutup prompt pembaruan.
   */
  dismissUpdatePrompt() {
    this.showUpdatePrompt = false;
  }

  // Fungsi refresh "pull-to-refresh"
  doRefresh(event: any) {
    console.log('Memulai operasi refresh');
    this.loadAllData();
    this.checkForUpdate(); // Juga cek pembaruan saat refresh

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
