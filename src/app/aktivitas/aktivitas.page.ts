// aktivitas.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { PengajuanSurat } from '../models/pengajuan-surat.model'; // Sesuaikan path jika perlu

@Component({
  standalone: false,
  selector: 'app-aktivitas',
  templateUrl: './aktivitas.page.html',
  styleUrls: ['./aktivitas.page.scss'],
})
export class AktivitasPage implements OnInit {

  public recentLetters: PengajuanSurat[] = [];
  public isLoading: boolean = true;
  private apiUrl = 'https://simpap.my.id/public/api/pengajuan-surat/latest'; // GANTI DENGAN URL API ANDA

  constructor(private http: HttpClient) { }

  getUserInfo() {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return { email: user.email, name: user.name };
}


  ngOnInit() {
    this.loadRecentLetters();
  }

  loadRecentLetters(event?: any) {
  if (!event) {
    this.isLoading = true;
  }

  const { email, name } = this.getUserInfo();
  const url = `${this.apiUrl}?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

  this.http.get<PengajuanSurat[]>(url)
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
      },
      (error) => {
        console.error('Error fetching recent letters:', error);
        // Tambahkan notifikasi error jika perlu
      }
    );
}


  doRefresh(event: any) {
    this.loadRecentLetters(event);
  }

  // Helper function untuk format waktu relatif
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

  // Helper function untuk menentukan warna badge berdasarkan status
  getStatusColor(status: string): string {
    switch (status) {
      case 'Disetujui':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Ditolak':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Proses':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: // Menunggu atau status lainnya
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  }

  // Helper function untuk menentukan ikon berdasarkan status
  getStatusIcon(status: string): string {
    switch (status) {
      case 'Disetujui':
        return 'checkmark-circle';
      case 'Ditolak':
        return 'close-circle';
      case 'Proses':
        return 'sync-circle';
      default: // Menunggu
        return 'time';
    }
  }
    // Helper function untuk menentukan warna ikon berdasarkan status
  getIconColor(status: string): string {
    switch (status) {
      case 'Disetujui':
        return 'text-green-600 dark:text-green-400';
      case 'Ditolak':
        return 'text-red-600 dark:text-red-400';
      case 'Proses':
        return 'text-blue-600 dark:text-blue-400';
      default: // Menunggu
        return 'text-yellow-600 dark:text-yellow-400';
    }
  }

  // Helper function untuk menentukan warna background ikon berdasarkan status
  getIconBgColor(status: string): string {
    switch (status) {
      case 'Disetujui':
        return 'bg-green-100 dark:bg-green-900';
      case 'Ditolak':
        return 'bg-red-100 dark:bg-red-900';
      case 'Proses':
        return 'bg-blue-100 dark:bg-blue-900';
      default: // Menunggu
        return 'bg-yellow-100 dark:bg-yellow-900';
    }
  }

  downloadFile(fileUrl: string, downloadName: string) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = downloadName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

}


}