import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // Tambahkan ViewChild, ElementRef
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-pengajuansurat',
  templateUrl: './pengajuansurat.page.html',
  styleUrls: ['./pengajuansurat.page.scss'],
})
export class PengajuansuratPage implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>; // Untuk mereset file input

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
    recommenderName: '', // Akan diisi otomatis dari formData.name saat submit
    recommenderPosition: '',
    recommendationReason: '',
  };

  isLoading = false;
  isCheckingStatus = false; // State baru untuk loading pengecekan status
  isSubmissionPending = false; // State baru untuk menandakan ada pengajuan pending
  pendingSubmissionMessage = ''; // Pesan untuk ditampilkan jika ada pengajuan pending
  isSuccess = false;

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
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      this.formData.email = storedEmail;
    }

    const storedName = localStorage.getItem('namaUser');
    if (storedName) {
      this.formData.name = storedName;
    }
  }

  async selectTemplate(template: any) {
    if (this.isCheckingStatus) return; // Hindari klik ganda saat sedang memeriksa

    this.isCheckingStatus = true;
    this.isSubmissionPending = false; // Reset status pending sebelumnya
    this.selectedTemplate = null; // Reset dulu agar UI loading terlihat
    this.pendingSubmissionMessage = '';

    // Tampilkan loading sederhana saat cek status
    const loading = await this.loadingController.create({
      message: 'Memeriksa status pengajuan...',
      spinner: 'crescent',
      translucent: true,
    });
    await loading.present();

    try {
      // Panggil API untuk cek status
      // GANTI URL ini dengan URL API Anda yang sebenarnya
      const userEmail = this.formData.email;
       const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      headers = headers.set('Accept', 'application/json');

      // Hapus parameter 'email' dari URL karena backend mengambilnya dari user terotentikasi
      const response: any = await this.http.get(
        `https://simpap.my.id/public/api/pengajuan-surats/check-status?category=${encodeURIComponent(template.category)}`,
        { headers }
      ).toPromise();// Convert Observable to Promise for await

      await loading.dismiss(); // Tutup loading setelah API response

      // Asumsikan response.status berisi 'Proses' jika ada pengajuan yang masih diProses
      if (response && response.status === 'Proses') {
        this.isSubmissionPending = true;
        this.selectedTemplate = template; // Tetap pilih template untuk menampilkan pesan di konteks form
        this.pendingSubmissionMessage = `Anda sudah memiliki pengajuan '${template.title}' yang sedang diProses. Anda tidak dapat mengajukan lagi hingga statusnya berubah.`;
        // Kita tidak akan generate nomor surat atau menampilkan form input jika pending
        // Pesan akan ditampilkan di HTML
      } else {
        // Tidak ada pengajuan 'Proses', lanjutkan seperti biasa
        this.selectedTemplate = template;
        this.generateSuratNumber();
        this.isSubmissionPending = false;
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error checking submission status:', error);
      // Jika error saat cek status, anggap tidak ada yang pending agar user tidak terblokir
      // Atau tampilkan error spesifik jika API gagal
      if (error.status === 404 && error.error && error.error.message === 'Belum ada pengajuan untuk kategori ini oleh user ini.') {
        // Ini bukan error, tapi konfirmasi tidak ada yang pending
        this.selectedTemplate = template;
        this.generateSuratNumber();
        this.isSubmissionPending = false;
      } else {
         await this.presentAlert('Error', 'Gagal memeriksa status pengajuan. Silakan coba lagi.');
         this.selectedTemplate = null; // Jangan lanjutkan jika ada error tak terduga
      }
    } finally {
      this.isCheckingStatus = false;
    }
  }

  // Fungsi untuk kembali dari form ke pemilihan template
  deselectTemplate() {
    this.selectedTemplate = null;
    this.isSubmissionPending = false; // Reset status pending
    this.pendingSubmissionMessage = '';
    // Reset form fields juga bisa ditambahkan di sini jika diperlukan
    // this.resetFormFieldsOnly(); // Buat fungsi baru untuk reset field tanpa reset nama & email
  }

  generateSuratNumber() {
    if (this.selectedTemplate && !this.isSubmissionPending) { // Hanya generate jika tidak pending
      const categoryCode = this.getCategoryCode(this.selectedTemplate.category);
      const year = new Date().getFullYear();
      let suratCounter = Number(localStorage.getItem(`suratCounter_${categoryCode}_${year}_next`) || 1);
      const formattedCounter = suratCounter.toString().padStart(3, '0');
      this.formData.suratNumber = `${formattedCounter}/GA-${categoryCode}/${this.getRomanMonth()}/${year}`;
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
    if (this.isSubmissionPending) {
      await this.presentAlert('Pengajuan Diblokir', this.pendingSubmissionMessage);
      return;
    }

    this.isLoading = true;

    if (!this.formData.suratNumber && this.selectedTemplate) {
      this.generateSuratNumber();
    }
    if (!this.formData.suratNumber) {
      this.isLoading = false;
      await this.presentAlert('Error Nomor Surat', 'Gagal membuat nomor surat. Silakan pilih template lagi.');
      return;
    }

    const category = this.selectedTemplate?.category;
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
        // 'recommenderName' akan diambil dari this.formData.name
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
    payload.append('status', 'Proses'); // Status awal saat pengajuan

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
        payload.append('recommender_name', this.formData.name); // Nama pengaju = pemberi rekomendasi
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
      const newFileName = `${safeSuratNumber}-${baseOriginalName}.${fileExtension}`;
      payload.append('attachment', this.formData.attachment, newFileName);
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

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
        error: async (error) => {
          this.isLoading = false;
          console.error('Error submitting form:', error);
          let errorMessage = 'Terjadi kesalahan saat mengirim surat.';
          if (error.error && typeof error.error.message === 'string') {
            errorMessage = error.error.message;
          } else if (typeof error.message === 'string') {
            errorMessage = error.message;
          }
          await this.presentAlert('Gagal Mengirim', errorMessage);
        }
      });
  }

  // Fungsi untuk mereset field form saja, tanpa nama dan email
  resetFormFieldsOnly() {
    this.formData = {
      ...this.formData, // pertahankan nama dan email
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
      // recommenderName biarkan karena diambil dari formData.name
      recommenderPosition: '',
      recommendationReason: '',
    };
    this.minEndDate = this.todayDateString;
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
        this.fileInputRef.nativeElement.value = ''; // Reset input file
    }
  }


  resetForm() {
    const currentEmail = this.formData.email;
    const currentName = this.formData.name;

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
      recommenderName: '',
      recommenderPosition: '',
      recommendationReason: '',
    };
    this.selectedTemplate = null;
    this.minEndDate = this.todayDateString;
    this.isSubmissionPending = false; // Reset status pending
    this.pendingSubmissionMessage = '';

    // Reset input file
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

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'medium') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
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