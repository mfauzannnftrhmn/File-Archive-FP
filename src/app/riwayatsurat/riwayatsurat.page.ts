import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Definisikan tipe data untuk riwayat surat
interface Surat {
  title: string;
  suratNumber: string;
  date: string;
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

  constructor(private router: Router) {}

  ngOnInit() {
    // Mengambil data riwayat surat yang disimpan di localStorage
    const storedSurat = localStorage.getItem('riwayatSurat');
    this.riwayatSurat = storedSurat ? JSON.parse(storedSurat) : [];
  }

  // Fungsi untuk melihat status atau detail surat
  viewSuratDetails(surat: Surat) {
    // Pindah ke halaman status pengajuan
    this.router.navigate(['/statuspengajuan', { suratNumber: surat.suratNumber }]);
  }
}
