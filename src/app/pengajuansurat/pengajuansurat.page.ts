import { Component } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-pengajuansurat',
  templateUrl: './pengajuansurat.page.html',
  styleUrls: ['./pengajuansurat.page.scss'],
})
export class PengajuansuratPage {
  suratTemplates = [
    { title: 'Surat Permohonan Cuti', category: 'Permohonan Cuti' },
    {
      title: 'Surat Keterangan Karyawan',
      category: 'Surat Keterangan Karyawan',
    },
    { title: 'Surat Pengajuan Keluhan', category: 'Pengajuan Keluhan' },
    { title: 'Surat Rekomendasi', category: 'Surat Rekomendasi' },
  ];

  selectedTemplate: any = null;
  formData: any = {
    suratNumber: '',
    // General
    name: '',
    email: '',
    attachmentName: '',

    // Cuti
    startDate: '',
    endDate: '',
    reason: '',

    // Karyawan
    position: '',
    joinDate: '',
    purpose: '',

    // Keluhan
    department: '',
    complaintCategory: '',
    complaintDescription: '',

    // Rekomendasi
    recommendedName: '',
    recommenderName: '',
    recommenderPosition: '',
    recommendationReason: '',
  };

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  generateSuratNumber() {
    if (this.selectedTemplate) {
      const category = this.selectedTemplate.category;
      const year = new Date().getFullYear();
      let suratCounter = Number(localStorage.getItem('suratCounter')) || 1;
      const formatted = suratCounter.toString().padStart(3, '0');
      this.formData.suratNumber = `${category}/GA/${year}/${formatted}`;
      localStorage.setItem('suratCounter', (suratCounter + 1).toString());
    }
  }

  isLoading = false;

  async submitForm() {
    const loading = await this.loadingController.create({
      message: 'Mengajukan surat...',
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });

    await loading.present(); // tampilkan loading

    const category = this.selectedTemplate?.category;
    const requiredFields: string[] = [];

    switch (category) {
      case 'Permohonan Cuti':
        requiredFields.push('name', 'startDate', 'endDate', 'reason');
        break;
      case 'Surat Keterangan Karyawan':
        requiredFields.push('name', 'position', 'joinDate', 'purpose');
        break;
      case 'Pengajuan Keluhan':
        requiredFields.push(
          'name',
          'department',
          'complaintCategory',
          'complaintDescription'
        );
        break;
      case 'Surat Rekomendasi':
        requiredFields.push(
          'recommendedName',
          'recommenderName',
          'recommenderPosition',
          'recommendationReason'
        );
        break;
      default:
        break;
    }

    // Validasi form untuk memastikan semua field yang diperlukan sudah diisi
    for (const field of requiredFields) {
      if (!this.formData[field]) {
        await loading.dismiss(); // tutup loading jika ada field yang kosong
        const toast = await this.toastController.create({
          message: `Silakan lengkapi field: ${field}`,
          duration: 2000,
          color: 'danger',
          position: 'top',
          cssClass: 'toast-danger dark:text-white',
        });
        await toast.present();
        return;
      }
    }

    // Menyimulasikan proses pemrosesan data yang lebih lama sebelum menyelesaikan
    setTimeout(async () => {
      const submittedSurat = {
        ...this.formData,
        title: this.selectedTemplate.title,
        category: this.selectedTemplate.category,
        date: new Date().toLocaleDateString(),
      };

      // Menyimpan data surat ke dalam local storage
      let riwayatSurat = JSON.parse(
        localStorage.getItem('riwayatSurat') || '[]'
      );
      riwayatSurat.push(submittedSurat);
      localStorage.setItem('riwayatSurat', JSON.stringify(riwayatSurat));

      await loading.dismiss(); // Menutup loading spinner setelah proses selesai

      const toast = await this.toastController.create({
        message: 'Surat berhasil diajukan!',
        duration: 2000,
        color: 'success',
        position: 'top',
        cssClass: 'toast-success dark:text-white',
      });
      await toast.present();      
    }, 2000); // Mengatur delay 3 detik (sesuaikan sesuai kebutuhan)
  }

  uploadAttachment() {
    // Dummy function – implement file picker integration here
    this.formData.attachmentName = 'lampiran_dummy.pdf';
  }
}
