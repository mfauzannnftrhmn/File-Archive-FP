import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular'; // Import ToastController

@Component({
  standalone: false,
  selector: 'app-pengajuansurat',
  templateUrl: './pengajuansurat.page.html',
  styleUrls: ['./pengajuansurat.page.scss'],
})
export class PengajuansuratPage {
  suratTemplates = [
    { title: 'Surat Permohonan Cuti', category: 'GA' },
    { title: 'Surat Keterangan Kerja', category: 'GA' },
    { title: 'Surat Pengajuan Keluhan', category: 'GA' },
    { title: 'Surat Rekomendasi', category: 'GA' },
  ];

  selectedTemplate = ''; 
  formData = {
    name: '',
    email: '',
    date: '',
    suratNumber: '',  // Surat Number yang akan dihasilkan otomatis
    additionalInfo: '', // Untuk informasi tambahan yang berbeda per template
  };

  constructor(private toastController: ToastController) {}

  ngOnInit() {
    this.generateSuratNumber(); // Generate nomor surat ketika halaman dimuat
  }

  // Fungsi untuk mengenerate nomor surat secara otomatis
  generateSuratNumber() {
    if (this.selectedTemplate) {
      const templateCategory = this.suratTemplates.find(
        (template) => template.title === this.selectedTemplate
      )?.category;

      if (templateCategory) {
        const year = new Date().getFullYear();
        let suratCounter = Number(localStorage.getItem('suratCounter')) || 1;  // Ambil counter dan increment
        const formattedNumber = suratCounter.toString().padStart(3, '0');
        this.formData.suratNumber = `${templateCategory}/${year}/${formattedNumber}`;

        // Simpan counter yang sudah increment ke localStorage
        localStorage.setItem('suratCounter', (suratCounter + 1).toString());
      }
    }
  }

  // Fungsi untuk menangani pengajuan surat
  async submitForm() {
    // Cek apakah template sudah dipilih
    if (!this.selectedTemplate) {
      const toast = await this.toastController.create({
        message: 'Silakan pilih template surat terlebih dahulu.',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      toast.present();
      return;
    }
  
    // Validasi berdasarkan template surat yang dipilih
    if (this.selectedTemplate === 'Surat Permohonan Cuti') {
      if (!this.formData.name || !this.formData.date || !this.formData.additionalInfo) {
        const toast = await this.toastController.create({
          message: 'Silakan lengkapi nama, tanggal, dan alasan cuti.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        toast.present();
        return;
      }
    }
  
    if (this.selectedTemplate === 'Surat Keterangan Kerja') {
      if (!this.formData.name || !this.formData.additionalInfo || !this.formData.email) {
        const toast = await this.toastController.create({
          message: 'Silakan lengkapi nama, jabatan, dan perusahaan.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        toast.present();
        return;
      }
    }
  
    if (this.selectedTemplate === 'Surat Pengajuan Keluhan') {
      if (!this.formData.name || !this.formData.additionalInfo) {
        const toast = await this.toastController.create({
          message: 'Silakan lengkapi nama dan keluhan.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        toast.present();
        return;
      }
    }
  
    if (this.selectedTemplate === 'Surat Rekomendasi') {
      if (!this.formData.name || !this.formData.additionalInfo) {
        const toast = await this.toastController.create({
          message: 'Silakan lengkapi nama yang direkomendasikan dan keterangan.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        toast.present();
        return;
      }
    }
  
    // Jika semua field valid, lanjutkan ke penyimpanan dan pengajuan
    const submittedSurat = {
      ...this.formData,
      title: this.selectedTemplate,
      category: this.suratTemplates.find(
        (template) => template.title === this.selectedTemplate
      )?.category,
      date: new Date().toLocaleDateString(),
    };
  
    let riwayatSurat = JSON.parse(localStorage.getItem('riwayatSurat') || '[]');
    riwayatSurat.push(submittedSurat);
    localStorage.setItem('riwayatSurat', JSON.stringify(riwayatSurat));
  
    // Tampilkan notifikasi berhasil
    const toast = await this.toastController.create({
      message: 'Surat berhasil diajukan!',
      duration: 2000,
      color: 'success',
      position: 'top',
    });
  
    toast.present();
  }
  
}
