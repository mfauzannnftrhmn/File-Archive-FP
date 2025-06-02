import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { saveAs } from 'file-saver';

@Component({
  standalone: false,
  selector: 'app-pengajuansurat',
  templateUrl: './pengajuansurat.page.html',
  styleUrls: ['./pengajuansurat.page.scss'],
})
export class PengajuansuratPage implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  suratTemplates = [
    { title: 'Surat Permohonan Cuti', category: 'Permohonan Cuti' },
    { title: 'Surat Keterangan Karyawan', category: 'Surat Keterangan Karyawan' },
    { title: 'Surat Pengajuan Keluhan', category: 'Pengajuan Keluhan' },
    { title: 'Surat Rekomendasi', category: 'Surat Rekomendasi' },
  ];

  selectedTemplate: any = null;
  formData: any = {
    suratNumber: '',
    name: '',
    email: '',
    attachment: null,
    attachmentOriginalName: '',
    startDate: '',
    endDate: '',
    reason: '',
    position: '',
    joinDate: '',
    purpose: '',
    department: '',
    complaintCategory: '',
    complaintDescription: '',
    recommendedName: '',
    recommenderName: '',
    recommenderPosition: '',
    recommendationReason: '',
  };

  isLoading = false;
  isCheckingStatus = false;
  isSubmissionPending = false;
  pendingSubmissionMessage = '';
  isSuccess = false;
  isLoadingPdfPreview = false;

  public todayDateString: string;
  public minEndDate: string;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private http: HttpClient
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayDateString = today.toISOString().split('T')[0];
    this.minEndDate = this.todayDateString;
  }

  ngOnInit() {
    this.loadUserDataFromLocalStorage();
  }

  loadUserDataFromLocalStorage() {
    console.log('Mencoba memuat data pengguna dari localStorage...');
    const currentUserString = localStorage.getItem('currentUser');

    if (currentUserString) {
      console.log(`Data ditemukan di localStorage (kunci 'currentUser'): ${currentUserString}`);
      try {
        const userData = JSON.parse(currentUserString);

        if (userData && userData.email) {
          this.formData.email = userData.email;
          console.log(`Email berhasil dimuat dari 'currentUser': ${this.formData.email}`);
        } else {
          console.warn("Objek 'currentUser' yang diparse tidak memiliki properti 'email'.");
        }

        if (userData && userData.name) {
          this.formData.name = userData.name;
          this.formData.recommenderName = userData.name;
          console.log(`Nama berhasil dimuat dari 'currentUser': ${this.formData.name}`);
        } else {
          console.warn("Objek 'currentUser' yang diparse tidak memiliki properti 'name'.");
        }

      } catch (e) {
        console.error("Gagal parse JSON dari localStorage (kunci 'currentUser'):", e);
        this.presentToast('Gagal memuat data pengguna dari penyimpanan. Format tidak sesuai.', 'danger');
      }
    } else {
      console.warn("localStorage: Kunci 'currentUser' tidak ditemukan.");
    }

    if (!this.formData.email || !this.formData.name) {
      console.warn('Nama atau Email masih kosong setelah mencoba memuat dari localStorage.');
    } else {
      console.log('Data pengguna berhasil di-assign ke formData:', { email: this.formData.email, name: this.formData.name });
    }
  }

  private async ensureUserDataIsLoaded(): Promise<boolean> {
    if (!this.formData.name || !this.formData.email) {
        this.loadUserDataFromLocalStorage();
        if (!this.formData.name || !this.formData.email) {
            await this.presentAlert('Data Pengguna Tidak Lengkap', 'Nama atau email pengguna tidak terdeteksi. Silakan coba login ulang.');
            return false;
        }
    }
    return true;
  }

  async selectTemplate(template: any) {
    if (this.isCheckingStatus) return;
    if (!await this.ensureUserDataIsLoaded()) {
        this.isCheckingStatus = false;
        return;
    }

    this.isCheckingStatus = true;
    this.isSubmissionPending = false;
    this.selectedTemplate = null;
    this.pendingSubmissionMessage = '';

    const loading = await this.loadingController.create({
      message: 'Memeriksa status pengajuan...',
      spinner: 'crescent',
      translucent: true,
    });
    await loading.present();

    try {
      let token = localStorage.getItem('token');
      if (!token) {
          const currentUserString = localStorage.getItem('currentUser');
          if (currentUserString) {
              try {
                  const currentUserData = JSON.parse(currentUserString);
                  token = currentUserData.token;
              } catch (e) {
                  console.error('Gagal parse currentUser untuk ambil token:', e);
              }
          }
      }

      if (!token) {
        await loading.dismiss();
        this.isCheckingStatus = false;
        await this.presentAlert('Otentikasi Gagal', 'Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      let headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      const categoryParam = encodeURIComponent(template.category);
      const url = `https://simpap.my.id/public/api/pengajuan-surats/check-status?category=${categoryParam}`;
      console.log('Requesting check-status URL:', url);

      this.http.get(url, { headers }).subscribe({
          next: async (response: any) => {
              await loading.dismiss();
              this.isCheckingStatus = false;
              console.log('Respon check-status:', response);

              if (response && response.status === 'Proses') {
                this.isSubmissionPending = true;
                this.selectedTemplate = template;
                this.pendingSubmissionMessage = `Anda sudah memiliki pengajuan '${template.title}' yang sedang diProses. Anda tidak dapat mengajukan lagi hingga statusnya berubah.`;
              } else if (response && response.status === 'aman') {
                this.selectedTemplate = template;
                this.generateSuratNumber();
                this.isSubmissionPending = false;
              } else {
                this.selectedTemplate = template;
                this.generateSuratNumber();
                this.isSubmissionPending = false;
                console.warn('Respon check-status tidak memiliki status "Proses" atau "aman". Anggap aman.', response);
              }
          },
          error: async (errorResponse: HttpErrorResponse) => {
              await loading.dismiss();
              this.isCheckingStatus = false;
              this.selectedTemplate = null;
              console.error('Error checking submission status:', errorResponse);

              let errorMessage = `Gagal memeriksa status pengajuan.`;
              if (errorResponse.status === 0) {
                  errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
              } else {
                  errorMessage += ` Status: ${errorResponse.status}.`;
              }

              if (errorResponse.error) {
                  if (typeof errorResponse.error === 'string') {
                      try {
                          const parsedError = JSON.parse(errorResponse.error);
                          if (parsedError.message) errorMessage = parsedError.message;
                      } catch (e) {
                          // Jika error.error bukan JSON string valid, coba ambil message dari errorResponse jika ada
                          if(errorResponse.message) errorMessage = errorResponse.message;
                      }
                  } else if (typeof errorResponse.error.message === 'string') {
                      errorMessage = errorResponse.error.message;
                  } else if (errorResponse.message) {
                       errorMessage = errorResponse.message;
                  }
              } else if (errorResponse.message) {
                 errorMessage = errorResponse.message;
              }


              if (errorResponse.status === 404 && errorResponse.error && typeof errorResponse.error.message === 'string' &&
                  errorResponse.error.message.includes('Belum ada pengajuan untuk kategori ini')) {
                  console.log('Status 404 diterima: Belum ada pengajuan. Dianggap aman.');
                  this.selectedTemplate = template;
                  this.generateSuratNumber();
                  this.isSubmissionPending = false;
              } else {
                  await this.presentAlert('Error Pemeriksaan Status', errorMessage);
              }
          }
      });

    } catch (error: any) {
      if (loading) await loading.dismiss();
      this.isCheckingStatus = false;
      this.selectedTemplate = null;
      console.error('Error sinkron dalam selectTemplate:', error);
      await this.presentAlert('Error Internal Aplikasi', 'Terjadi kesalahan sebelum menghubungi server.');
    }
  }

  deselectTemplate() {
    this.selectedTemplate = null;
    this.isSubmissionPending = false;
    this.pendingSubmissionMessage = '';
    this.resetFormFieldsOnly();
    this.formData.suratNumber = '';
  }

  generateSuratNumber() {
    if (this.selectedTemplate && !this.isSubmissionPending) {
      const categoryCode = this.getCategoryCode(this.selectedTemplate.category);
      const year = new Date().getFullYear();
      let suratCounter = Number(localStorage.getItem(`suratCounter_${categoryCode}_${year}_next`) || 1);
      const formattedCounter = suratCounter.toString().padStart(3, '0');
      this.formData.suratNumber = `${formattedCounter}/GA-${categoryCode}/${this.getRomanMonth()}/${year}`;
    } else if (!this.selectedTemplate) {
        this.formData.suratNumber = '';
    }
  }

  getCategoryCode(category: string): string {
    if (category.includes('Cuti')) return 'PC';
    if (category.includes('Keterangan')) return 'SKK';
    if (category.includes('Keluhan')) return 'PK';
    if (category.includes('Rekomendasi')) return 'SR';
    return 'SURAT';
  }

  getRomanMonth(): string {
    const month = new Date().getMonth() + 1;
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanMonths[month - 1];
  }

  handleStartDateChange() {
    if (this.formData.startDate) {
      if (this.formData.startDate < this.todayDateString) {
        this.formData.startDate = this.todayDateString;
        this.presentToast('Tanggal mulai tidak boleh tanggal yang sudah berlalu.', 'warning');
      }
      this.minEndDate = this.formData.startDate;
      if (this.formData.endDate && this.formData.endDate < this.formData.startDate) {
        this.formData.endDate = this.formData.startDate;
        this.presentToast('Tanggal selesai diatur sama dengan tanggal mulai.', 'medium');
      }
    } else {
      this.minEndDate = this.todayDateString;
      this.formData.endDate = '';
    }
  }

  async submitForm() {
    if (!await this.ensureUserDataIsLoaded()) {
        this.isLoading = false;
        return;
    }
    if (this.isSubmissionPending) {
      await this.presentAlert('Pengajuan Diblokir', this.pendingSubmissionMessage);
      return;
    }

    this.isLoading = true;

    if (!this.formData.suratNumber && this.selectedTemplate) {
      this.generateSuratNumber();
    }
    if (!this.formData.suratNumber && this.selectedTemplate) {
      this.isLoading = false;
      await this.presentAlert('Error Nomor Surat', 'Gagal membuat nomor surat. Silakan pilih template lagi.');
      return;
    }

    const category = this.selectedTemplate?.category;
    if (!category) {
        this.isLoading = false;
        await this.presentAlert('Error', 'Template tidak dipilih.');
        return;
    }
    let requiredFields: string[] = ['name', 'email', 'suratNumber'];

    switch (category) {
      case 'Permohonan Cuti':
        requiredFields.push('startDate', 'endDate', 'reason');
        if (this.formData.startDate && this.formData.startDate < this.todayDateString) {
          this.isLoading = false;
          await this.presentAlert('Tanggal Tidak Valid', 'Tanggal mulai tidak boleh tanggal yang sudah berlalu.');
          return;
        }
        if (this.formData.startDate && this.formData.endDate && this.formData.endDate < this.formData.startDate) {
          this.isLoading = false;
          await this.presentAlert('Tanggal Tidak Valid', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
          return;
        }
        break;
      case 'Surat Keterangan Karyawan':
        requiredFields.push('position', 'joinDate', 'purpose');
        if (this.formData.joinDate && this.formData.joinDate > this.todayDateString) {
            this.isLoading = false;
            await this.presentAlert('Tanggal Tidak Valid', 'Tanggal bergabung tidak boleh di masa depan.');
            return;
        }
        break;
      case 'Pengajuan Keluhan':
        requiredFields.push('department', 'complaintCategory', 'complaintDescription');
        break;
      case 'Surat Rekomendasi':
        requiredFields.push('recommendedName', 'recommenderPosition', 'recommendationReason');
        break;
      default:
        this.isLoading = false;
        await this.presentAlert('Template Tidak Valid', 'Kategori surat tidak dikenali.');
        return;
    }

    const missingFields = requiredFields.filter(field => {
      const value = this.formData[field];
      return value === null || value === undefined || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
      this.isLoading = false;
      if (missingFields.includes('name') || missingFields.includes('email')) {
        await this.presentAlert('Data Pengguna Tidak Lengkap', 'Nama atau email pengguna tidak terdeteksi. Silakan coba login ulang.');
      } else {
        await this.presentAlert('Form Belum Lengkap', `Mohon lengkapi field berikut: ${missingFields.join(', ')}.`);
      }
      return;
    }

    const payload = new FormData();
    payload.append('surat_number', this.formData.suratNumber);
    payload.append('name', this.formData.name);
    payload.append('email', this.formData.email);
    payload.append('category', category as string);
    payload.append('status', 'Proses');

    if (category === 'Permohonan Cuti') {
        payload.append('start_date', this.formData.startDate);
        payload.append('end_date', this.formData.endDate);
        payload.append('reason', this.formData.reason);
    } else if (category === 'Surat Keterangan Karyawan') {
        payload.append('position', this.formData.position);
        payload.append('join_date', this.formData.joinDate);
        payload.append('purpose', this.formData.purpose);
    } else if (category === 'Pengajuan Keluhan') {
        payload.append('department', this.formData.department);
        payload.append('complaint_category', this.formData.complaintCategory);
        payload.append('complaint_description', this.formData.complaintDescription);
    } else if (category === 'Surat Rekomendasi') {
        payload.append('recommended_name', this.formData.recommendedName);
        payload.append('recommender_name', this.formData.name);
        payload.append('recommender_position', this.formData.recommenderPosition);
        payload.append('recommendation_reason', this.formData.recommendationReason);
    }

    if (this.formData.attachment && this.formData.attachmentOriginalName) {
      const safeSuratNumber = this.formData.suratNumber.replace(/\//g, '-');
      const fileExtension = this.formData.attachmentOriginalName.split('.').pop();
      let baseOriginalName = this.formData.attachmentOriginalName;
      if (fileExtension) {
        baseOriginalName = this.formData.attachmentOriginalName.substring(0, this.formData.attachmentOriginalName.length - (fileExtension.length + 1));
      }
      const newFileNameForUserUpload = `${safeSuratNumber}-USERUPLOAD-${baseOriginalName}.${fileExtension}`;
      payload.append('user_uploaded_attachment', this.formData.attachment, newFileNameForUserUpload);
    }

    let token = localStorage.getItem('token');
    if (!token) {
        const currentUserString = localStorage.getItem('currentUser');
        if (currentUserString) {
            try { token = JSON.parse(currentUserString).token; } catch(e){}
        }
    }

    if (!token) {
        this.isLoading = false;
        await this.presentAlert('Otentikasi Gagal', 'Token tidak ditemukan. Silakan login kembali.');
        return;
    }
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('https://simpap.my.id/public/api/pengajuan-surats', payload, { headers })
      .subscribe({
        next: async (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          if (this.selectedTemplate) {
              const categoryCode = this.getCategoryCode(this.selectedTemplate.category);
              const year = new Date().getFullYear();
              let nextSuratCounter = Number(localStorage.getItem(`suratCounter_${categoryCode}_${year}_next`) || 1);
              nextSuratCounter++;
              localStorage.setItem(`suratCounter_${categoryCode}_${year}_next`, nextSuratCounter.toString());
          }
          await this.presentToast('Pengajuan surat berhasil dikirim!', 'success');
        },
        error: async (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Error submitting form:', errorResponse);
          let errorMessage = 'Terjadi kesalahan saat mengirim surat.';
          if (errorResponse.status === 401) {
            errorMessage = 'Otentikasi gagal. Silakan login kembali.';
          } else if (errorResponse.error) {
            if (typeof errorResponse.error.message === 'string') {
                errorMessage = errorResponse.error.message;
            } else if (typeof errorResponse.error === 'object' && errorResponse.error.errors) {
                const validationErrors = errorResponse.error.errors;
                const firstErrorKey = Object.keys(validationErrors)[0];
                errorMessage = validationErrors[firstErrorKey][0];
            }
          } else if (errorResponse.message) {
            errorMessage = errorResponse.message;
          }
          await this.presentAlert('Gagal Mengirim', errorMessage);
        }
      });
  }

  resetFormFieldsOnly() {
    const currentName = this.formData.name;
    const currentEmail = this.formData.email;

    this.formData = {
      name: currentName,
      email: currentEmail,
      suratNumber: '',
      attachment: null,
      attachmentOriginalName: '',
      startDate: '',
      endDate: '',
      reason: '',
      position: '',
      joinDate: '',
      purpose: '',
      department: '',
      complaintCategory: '',
      complaintDescription: '',
      recommendedName: '',
      recommenderName: currentName,
      recommenderPosition: '',
      recommendationReason: '',
    };
    this.minEndDate = this.todayDateString;
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
    }
  }

  resetForm() {
    let currentEmail = '';
    let currentName = '';
    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
        try {
            const userData = JSON.parse(currentUserString);
            currentEmail = userData.email || '';
            currentName = userData.name || '';
        } catch(e) {
            console.error("Gagal parse currentUser saat resetForm:", e);
            currentEmail = localStorage.getItem('email') || ''; // Fallback
            currentName = localStorage.getItem('name') || localStorage.getItem('namaUser') || ''; // Fallback
        }
    } else {
        currentEmail = localStorage.getItem('email') || ''; // Fallback
        currentName = localStorage.getItem('name') || localStorage.getItem('namaUser') || ''; // Fallback
    }

    this.formData = {
      suratNumber: '',
      name: currentName,
      email: currentEmail,
      attachment: null,
      attachmentOriginalName: '',
      startDate: '',
      endDate: '',
      reason: '',
      position: '',
      joinDate: '',
      purpose: '',
      department: '',
      complaintCategory: '',
      complaintDescription: '',
      recommendedName: '',
      recommenderName: currentName,
      recommenderPosition: '',
      recommendationReason: '',
    };
    this.selectedTemplate = null;
    this.minEndDate = this.todayDateString;
    this.isSubmissionPending = false;
    this.pendingSubmissionMessage = '';

    if (this.fileInputRef && this.fileInputRef.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
    }
  }

  dismissSuccess() {
    this.isSuccess = false;
    this.resetForm();
  }

  handleFileInput(event: any) {
    const file: File | null = event.target.files?.[0] || null;
    if (file) {
      this.processSelectedFile(file);
    } else {
      this.formData.attachment = null;
      this.formData.attachmentOriginalName = '';
    }
  }

  private async processSelectedFile(file: File) {
    if (file.type !== 'application/pdf') {
      await this.presentToast('Hanya file PDF yang diizinkan.', 'danger');
      if (this.fileInputRef && this.fileInputRef.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
      }
      this.formData.attachment = null;
      this.formData.attachmentOriginalName = '';
      return;
    }
    this.formData.attachment = file;
    this.formData.attachmentOriginalName = file.name;
    await this.presentToast(`File "${file.name}" siap diunggah.`, 'medium');
  }

  preparePdfPayload(): any {
    if (!this.selectedTemplate) {
        this.presentToast('Pilih template surat terlebih dahulu.', 'warning');
        return null;
    }
    if (!this.formData.name || !this.formData.email) {
        this.presentToast('Data pengguna (nama/email) tidak lengkap. Muat ulang atau login kembali.', 'warning');
        return null;
    }
    if (!this.formData.suratNumber && this.selectedTemplate) {
        this.generateSuratNumber();
    }
     if (!this.formData.suratNumber && this.selectedTemplate) {
        this.presentToast('Gagal membuat nomor surat untuk PDF. Coba lagi.', 'warning');
        return null;
    }

    const payload: any = {
        surat_number: this.formData.suratNumber || 'Belum Digenerate',
        name: this.formData.name,
        email: this.formData.email,
        category: this.selectedTemplate.category,
    };

     switch (this.selectedTemplate.category) {
        case 'Permohonan Cuti':
            payload.start_date = this.formData.startDate;
            payload.end_date = this.formData.endDate;
            payload.reason = this.formData.reason;
            break;
        case 'Surat Keterangan Karyawan':
            payload.position = this.formData.position;
            payload.join_date = this.formData.joinDate;
            payload.purpose = this.formData.purpose;
            break;
        case 'Pengajuan Keluhan':
            payload.department = this.formData.department;
            payload.complaint_category = this.formData.complaintCategory;
            payload.complaint_description = this.formData.complaintDescription;
            break;
        case 'Surat Rekomendasi':
            payload.recommended_name = this.formData.recommendedName;
            payload.recommender_name = this.formData.name;
            payload.recommender_position = this.formData.recommenderPosition;
            payload.recommendation_reason = this.formData.recommendationReason;
            break;
    }
    return payload;
  }

  async downloadPdfPreview() {
    if (!await this.ensureUserDataIsLoaded()) {
        this.isLoadingPdfPreview = false;
        return;
    }
    if (!this.selectedTemplate) {
        await this.presentAlert('Info', 'Pilih template surat terlebih dahulu untuk membuat PDF.');
        return;
    }

    const payload = this.preparePdfPayload();
    if (!payload) return;

    this.isLoadingPdfPreview = true;
    const loading = await this.loadingController.create({
        message: 'Membuat pratinjau PDF...',
        spinner: 'crescent'
    });
    await loading.present();

    let token = localStorage.getItem('token');
    if (!token) {
        const currentUserString = localStorage.getItem('currentUser');
        if (currentUserString) {
            try { token = JSON.parse(currentUserString).token; } catch(e){}
        }
    }

     if (!token) {
        await loading.dismiss();
        this.isLoadingPdfPreview = false;
        await this.presentAlert('Otentikasi Gagal', 'Token tidak ditemukan untuk PDF. Silakan login kembali.');
        return;
    }
    let httpHeaders = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Accept', 'application/pdf');

    this.http.post('https://simpap.my.id/public/api/pengajuan-surats/generate-pdf', payload, {
        headers: httpHeaders,
        responseType: 'blob'
    }).subscribe({
        next: (blob: Blob) => {
            loading.dismiss();
            this.isLoadingPdfPreview = false;
            try {
                const titleSlug = this.selectedTemplate.title.toLowerCase().replace(/\s+/g, '_');
                const nameSlug = (this.formData.name || 'pengguna').toLowerCase().replace(/\s+/g, '_');
                const dateSlug = new Date().toISOString().split('T')[0];
                const fileName = `pratinjau_${titleSlug}_${nameSlug}_${dateSlug}.pdf`;
                saveAs(blob, fileName);
                this.presentToast('PDF berhasil diunduh.', 'success');
            } catch (e) {
                console.error("Error saving file:", e);
                this.presentAlert('Error Unduh', 'Gagal menyimpan file PDF. Pastikan browser Anda mengizinkan unduhan.');
            }
        },
        error: async (errorResponse: HttpErrorResponse) => {
            loading.dismiss();
            this.isLoadingPdfPreview = false;
            console.error('Error generating PDF preview:', errorResponse);
            let errorMessage = 'Tidak dapat membuat pratinjau PDF saat ini.';
             if (errorResponse.status === 401) {
                errorMessage = 'Otentikasi gagal untuk PDF. Silakan login kembali.';
            } else if (errorResponse.error instanceof Blob && errorResponse.error.type === "application/json") {
                try {
                    const errorText = await errorResponse.error.text();
                    const errorJson = JSON.parse(errorText);
                    if(errorJson.message) errorMessage = errorJson.message;
                } catch (e) { /* Biarkan errorMessage default */ }
            } else if (errorResponse.status === 0) {
                errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else if (errorResponse.message) {
                errorMessage = errorResponse.message;
            } else if (errorResponse.error && typeof errorResponse.error.message === 'string') {
                 errorMessage = errorResponse.error.message;
            }
            await this.presentAlert('Gagal Membuat PDF', errorMessage);
        }
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'medium') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}