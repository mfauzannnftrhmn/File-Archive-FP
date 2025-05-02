import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
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

  // Fungsi untuk capitalisasi huruf pertama
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
