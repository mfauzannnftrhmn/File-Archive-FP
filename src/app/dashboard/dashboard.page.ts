import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  userName: string;

  constructor() {
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

      console.log('Operasi refresh selesai');
      event.target.complete();
    }, 2000);
  }
}
