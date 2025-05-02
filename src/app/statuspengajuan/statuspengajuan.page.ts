import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-statuspengajuan',
  templateUrl: './statuspengajuan.page.html',
  styleUrls: ['./statuspengajuan.page.scss'],
})
export class StatuspengajuanPage {

  // Daftar surat yang sudah diajukan
  submittedSurat = [
    { id: 1, title: 'Surat Permohonan Cuti', suratNumber: 'GA/2025/001', distribusiProgress: 0.6, verifikasiProgress: 0.3, cetakProgress: 0.0 },
    { id: 2, title: 'Surat Keterangan Kerja', suratNumber: 'GA/2025/002', distribusiProgress: 1.0, verifikasiProgress: 1.0, cetakProgress: 0.8 },
    { id: 3, title: 'Surat Pengajuan Keluhan', suratNumber: 'GA/2025/010', distribusiProgress: 0.2, verifikasiProgress: 0.5, cetakProgress: 0.1 },
    { id: 4, title: 'Surat Rekomendasi', suratNumber: 'GA/2025/015', distribusiProgress: 0.1, verifikasiProgress: 0.6, cetakProgress: 0.0 }
  ];

  selectedSurat: number | null = null; // ID surat yang dipilih
  selectedSuratDetails: any = null; // Detail surat yang dipilih

  constructor() {}

  ngOnInit() {
    // Inisialisasi atau pemanggilan API untuk mendapatkan status surat jika diperlukan
  }

  // Fungsi yang dipanggil saat surat dipilih
  onSuratSelected() {
    // Mencari surat yang dipilih berdasarkan ID
    this.selectedSuratDetails = this.submittedSurat.find(surat => surat.id === this.selectedSurat) || null;
  }
}
