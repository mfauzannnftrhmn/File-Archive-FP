import { Component } from '@angular/core';
import {
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

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
    private alertController: AlertController,
    private http: HttpClient
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

    const missingFields = requiredFields.filter(
      (field) => !this.formData[field]
    );
    if (missingFields.length > 0) {
      this.isLoading = false;

      const alert = await this.alertController.create({
        header: 'Form Belum Lengkap',
        message: 'Mohon lengkapi semua field yang diperlukan sebelum mengirim.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const submittedSurat = {
      ...this.formData,
      title: this.selectedTemplate.title,
      category: this.selectedTemplate.category,
      date: new Date().toISOString(),
    };

    // GANTI URL BERIKUT SESUAI LARAVEL BACKEND
    const apiUrl = 'http://localhost:8000/api/pengajuan-surat';

    this.http.post(apiUrl, submittedSurat).subscribe({
      next: async (response) => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: async (error) => {
        this.isLoading = false;
        const alert = await this.alertController.create({
          header: 'Gagal Mengirim',
          message: 'Terjadi kesalahan saat mengirim surat. Silakan coba lagi.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
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
