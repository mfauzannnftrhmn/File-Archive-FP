import { Component } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

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
    private loadingController: LoadingController,
    private alertController: AlertController
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
  isSuccess = false;

  async submitForm() {
    this.isLoading = true;

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
    const missingFields = requiredFields.filter(field => !this.formData[field]);
    if (missingFields.length > 0) {
      this.isLoading = false;
      
      // Menampilkan alert untuk field yang belum diisi
      const alert = await this.alertController.create({
        header: 'Form Belum Lengkap',
        message: 'Mohon lengkapi semua field yang diperlukan sebelum mengirim.',
        buttons: ['OK']
      });
      
      await alert.present();
      return;
    }

    // Menyimulasikan proses pemrosesan data yang lebih cepat
    setTimeout(() => {
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

      this.isLoading = false;
      this.isSuccess = true;
      
      // Menghapus auto dismiss, biarkan user klik tombol selesai
    }, 800); // Mengatur delay lebih cepat menjadi 800ms
  }

  resetForm() {
    // Reset form data to initial state
    this.formData = {
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
    
    // Reset selected template
    this.selectedTemplate = null;
  }

  dismissSuccess() {
    this.isSuccess = false;
  }

  uploadAttachment() {
    // Dummy function – implement file picker integration here
    this.formData.attachmentName = 'lampiran_dummy.pdf';
  }
}
